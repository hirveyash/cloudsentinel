import { SecurityEvent } from './types/event';
import { evaluateRules } from './rules-engine';
import { calculateRiskScore } from './risk-scorer';
import rawEvents from './synthetic-data/events.json';

export async function loadSecurityEvents(): Promise<SecurityEvent[]> {
  try {
    if (!Array.isArray(rawEvents)) {
      throw new Error('Synthetic data format is invalid.');
    }
    
    const validEvents = rawEvents.filter((event: unknown) => {
      const e = event as Record<string, unknown>;
      return e && typeof e.event_id === 'string' && typeof e.timestamp === 'string';
    });

    const eventsWithRules = validEvents.map((event: unknown) => {
      const e = event as Record<string, unknown>;
      
      // Explicitly cast each property to satisfy strict TypeScript checking
      const typedEvent: SecurityEvent = {
        event_id: e.event_id as string,
        incident_id: e.incident_id as string,
        timestamp: e.timestamp as string,
        provider: e.provider as SecurityEvent['provider'],
        source_service: e.source_service as string,
        action: e.action as string,
        outcome: e.outcome as SecurityEvent['outcome'],
        severity: e.severity as SecurityEvent['severity'],
        actor: (e.actor as string) || null,
        resource: (e.resource as string) || null,
        source_ip: (e.source_ip as string) || null,
        account_context: e.account_context as string,
        region: (e.region as string) || null,
        raw_evidence: e.raw_evidence as string,
        status: e.status as SecurityEvent['status'],
        rule_matches: [],
        risk_score: 0,
        risk_factors: [],
      };
      
      typedEvent.rule_matches = evaluateRules(typedEvent);
      const riskAssessment = calculateRiskScore(typedEvent);
      typedEvent.risk_score = riskAssessment.score;
      typedEvent.risk_factors = riskAssessment.factors;
      
      return typedEvent;
    });

    const uniqueEventsMap = new Map<string, SecurityEvent>();
    eventsWithRules.forEach((event) => {
      if (!uniqueEventsMap.has(event.event_id)) {
        uniqueEventsMap.set(event.event_id, event);
      }
    });

    const uniqueEvents = Array.from(uniqueEventsMap.values());
    return uniqueEvents.sort((a, b) => b.risk_score - a.risk_score);

  } catch (error) {
    console.error('Failed to load synthetic security events:', error);
    return [];
  }
}