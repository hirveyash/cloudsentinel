import { describe, it, expect } from 'vitest';
import { aggregateIncidents } from '../incident-aggregator';
import { SecurityEvent } from '../types/event';

const createEvent = (overrides: Partial<SecurityEvent>): SecurityEvent => ({
  event_id: `evt-${Math.random()}`,
  incident_id: `inc-${Math.random()}`,
  timestamp: '2026-10-15T10:00:00Z',
  provider: 'AWS',
  source_service: 'GuardDuty',
  action: 'Test',
  outcome: 'Unknown',
  severity: 'Medium',
  actor: null,
  resource: 'test',
  source_ip: null,
  account_context: '123',
  region: 'us-east-1',
  raw_evidence: 'test',
  rule_matches: [],
  risk_score: 50,
  risk_factors: [],
  status: 'Open',
  ...overrides,
});

describe('aggregateIncidents', () => {
  it('should group events with same IP across different providers into CORR-IP incident', () => {
    const events: SecurityEvent[] = [
      createEvent({ provider: 'AWS', source_ip: '203.0.113.77', incident_id: 'inc-1' }),
      createEvent({ provider: 'Azure', source_ip: '203.0.113.77', incident_id: 'inc-2' }),
    ];

    const incidents = aggregateIncidents(events);
    
    // Should have 1 cross-cloud incident and 0 original incidents (they are merged)
    // Note: The aggregator keeps the original incident_id mapping but adds the CORR one. 
    // Let's check if the CORR incident exists and has 2 events.
    const corrIncident = incidents.find(i => i.incident_id.startsWith('CORR-IP-'));
    expect(corrIncident).toBeDefined();
    expect(corrIncident?.event_count).toBe(2);
  });

  it('should group events with same actor across different providers into CORR-ACTOR incident', () => {
    const events: SecurityEvent[] = [
      createEvent({ provider: 'AWS', actor: 'compromised-admin', incident_id: 'inc-1' }),
      createEvent({ provider: 'GCP', actor: 'compromised-admin', incident_id: 'inc-2' }),
    ];

    const incidents = aggregateIncidents(events);
    
    const corrIncident = incidents.find(i => i.incident_id.startsWith('CORR-ACTOR-'));
    expect(corrIncident).toBeDefined();
    expect(corrIncident?.event_count).toBe(2);
  });

  it('should NOT correlate events with same IP if they are from the SAME provider', () => {
    const events: SecurityEvent[] = [
      createEvent({ provider: 'AWS', source_ip: '203.0.113.77', incident_id: 'inc-1' }),
      createEvent({ provider: 'AWS', source_ip: '203.0.113.77', incident_id: 'inc-2' }),
    ];

    const incidents = aggregateIncidents(events);
    
    const corrIncident = incidents.find(i => i.incident_id.startsWith('CORR-'));
    expect(corrIncident).toBeUndefined(); // No cross-cloud correlation should happen
  });
});