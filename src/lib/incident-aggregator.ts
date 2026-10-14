import { SecurityEvent, Incident } from './types/event';

export function aggregateIncidents(events: SecurityEvent[]): Incident[] {
  const incidentMap = new Map<string, SecurityEvent[]>();

  events.forEach((event) => {
    if (!incidentMap.has(event.incident_id)) {
      incidentMap.set(event.incident_id, []);
    }
    incidentMap.get(event.incident_id)!.push(event);
  });

  const incidents: Incident[] = Array.from(incidentMap.entries()).map(([id, groupEvents]) => {
    const sortedEvents = groupEvents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const maxRisk = Math.max(...sortedEvents.map(e => e.risk_score));
    const primaryEvent = sortedEvents.find(e => e.risk_score === maxRisk) || sortedEvents[0];

    return {
      incident_id: id,
      title: `Incident ${id}: ${primaryEvent.action}`,
      status: primaryEvent.status,
      max_risk_score: maxRisk,
      event_count: sortedEvents.length,
      first_seen: sortedEvents[0].timestamp,
      last_seen: sortedEvents[sortedEvents.length - 1].timestamp,
      events: sortedEvents,
      analyst_notes: [], // Initialize empty notes array
    };
  });

  return incidents.sort((a, b) => b.max_risk_score - a.max_risk_score);
}