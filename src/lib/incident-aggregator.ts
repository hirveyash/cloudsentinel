import { SecurityEvent, Incident } from './types/event';

function groupEventsByCorrelationKey(
  events: SecurityEvent[],
  keyExtractor: (e: SecurityEvent) => string | null
): Map<string, SecurityEvent[]> {
  const groups = new Map<string, SecurityEvent[]>();
  
  events.forEach((event) => {
    const key = keyExtractor(event);
    if (!key || key === 'Unknown' || key === 'null') return;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(event);
  });
  
  return groups;
}

export function aggregateIncidents(events: SecurityEvent[]): Incident[] {
  const incidentMap = new Map<string, SecurityEvent[]>();

  // Pass 1: Group by explicit incident_id
  events.forEach((event) => {
    if (!incidentMap.has(event.incident_id)) {
      incidentMap.set(event.incident_id, []);
    }
    incidentMap.get(event.incident_id)!.push(event);
  });

  // Pass 2: Cross-cloud correlation by source_ip
  const ipGroups = groupEventsByCorrelationKey(events, (e) => e.source_ip);
  ipGroups.forEach((group, ip) => {
    const providers = new Set(group.map(e => e.provider));
    if (providers.size > 1 && group.length > 1) {
      const crossCloudId = `CORR-IP-${ip.replace(/\./g, '-')}`;
      incidentMap.set(crossCloudId, group);
    }
  });

  // Pass 3: Cross-cloud correlation by actor
  const actorGroups = groupEventsByCorrelationKey(events, (e) => e.actor);
  actorGroups.forEach((group, actor) => {
    const providers = new Set(group.map(e => e.provider));
    if (providers.size > 1 && group.length > 1) {
      const crossCloudId = `CORR-ACTOR-${actor.replace(/[^a-zA-Z0-9]/g, '-')}`;
      incidentMap.set(crossCloudId, group);
    }
  });

  // Build final incidents
  const incidents: Incident[] = Array.from(incidentMap.entries()).map(([id, groupEvents]) => {
    const sortedEvents = groupEvents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const maxRisk = Math.max(...sortedEvents.map(e => e.risk_score));
    const primaryEvent = sortedEvents.find(e => e.risk_score === maxRisk) || sortedEvents[0];
    
    let title: string;
    if (id.startsWith('CORR-IP-')) {
      const ip = id.replace('CORR-IP-', '').replace(/-/g, '.');
      title = `Cross-Cloud Threat: Suspicious IP ${ip}`;
    } else if (id.startsWith('CORR-ACTOR-')) {
      const actor = id.replace('CORR-ACTOR-', '').replace(/-/g, ' ');
      title = `Cross-Cloud Actor: ${actor}`;
    } else {
      title = `Incident ${id}: ${primaryEvent.action}`;
    }

    return {
      incident_id: id,
      title,
      status: primaryEvent.status,
      max_risk_score: maxRisk,
      event_count: sortedEvents.length,
      first_seen: sortedEvents[0].timestamp,
      last_seen: sortedEvents[sortedEvents.length - 1].timestamp,
      events: sortedEvents,
      analyst_notes: [],
    };
  });

  // Sort: cross-cloud correlations first, then by risk
  return incidents.sort((a, b) => {
    const aIsCorr = a.incident_id.startsWith('CORR-');
    const bIsCorr = b.incident_id.startsWith('CORR-');
    if (aIsCorr && !bIsCorr) return -1;
    if (!aIsCorr && bIsCorr) return 1;
    return b.max_risk_score - a.max_risk_score;
  });
}
