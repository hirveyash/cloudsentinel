import { SecurityEvent } from './types/event';
import { evaluateRules } from './rules-engine';
import { calculateRiskScore } from './risk-scorer';
import rawEvents from './synthetic-data/events.json';

interface RawSyntheticEvent {
  event_id: string;
  timestamp: string;
  incident_id: string;
  provider: string;
  source_service: string;
  action: string;
  outcome: string;
  severity: string;
  actor: string | null;
  resource: string | null;
  source_ip: string | null;
  account_context: string;
  region: string | null;
  raw_evidence: string;
  status: string;
}

export async function loadSecurityEvents(): Promise<SecurityEvent[]> {
  try {
    if (!Array.isArray(rawEvents)) {
      throw new Error('Synthetic data format is invalid.');
    }
    
    const validEvents = rawEvents.filter((event: RawSyntheticEvent) => 
      event && typeof event.event_id === 'string' && typeof event.timestamp === 'string'
    );

    const eventsWithRules = validEvents.map((event: RawSyntheticEvent) => {
      const typedEvent: SecurityEvent = {
        ...event,
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