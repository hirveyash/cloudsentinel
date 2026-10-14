import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../rules-engine';
import { calculateRiskScore } from '../risk-scorer';
import { aggregateIncidents } from '../incident-aggregator';
import { SecurityEvent } from '../types/event';

describe('End-to-End Security Flow', () => {
  it('should process a raw event through rules, scoring, and correlation', () => {
    // 1. Simulate a raw incoming event (e.g., from AWS)
    const rawEvent: SecurityEvent = {
      event_id: 'e2e-001',
      incident_id: 'INC-E2E-001',
      timestamp: '2026-10-15T10:00:00Z',
      provider: 'AWS',
      source_service: 'GuardDuty',
      action: 'ConsoleLogin',
      outcome: 'Failure',
      severity: 'High',
      actor: 'root',
      resource: 'arn:aws:iam::123456789012:root',
      source_ip: '198.51.100.50',
      account_context: '123456789012',
      region: 'us-east-1',
      raw_evidence: 'Root login failure from external IP',
      rule_matches: [],
      risk_score: 0,
      risk_factors: [],
      status: 'Open',
    };

    // 2. Pass through Rules Engine
    const rulesTriggered = evaluateRules(rawEvent);
    expect(rulesTriggered.length).toBeGreaterThan(0);
    rawEvent.rule_matches = rulesTriggered;

    // 3. Pass through Risk Scorer
    const riskAssessment = calculateRiskScore(rawEvent);
    rawEvent.risk_score = riskAssessment.score;
    rawEvent.risk_factors = riskAssessment.factors;
    
    // High (60) + Failure (10) + Rule Match (10) = 80
    expect(rawEvent.risk_score).toBeGreaterThanOrEqual(70);

    // 4. Simulate a second event from a different cloud with the SAME IP
    const azureEvent: SecurityEvent = {
      ...rawEvent,
      event_id: 'e2e-002',
      incident_id: 'INC-E2E-002',
      provider: 'Azure',
      source_service: 'Defender',
      action: 'SuspiciousActivity',
      source_ip: '198.51.100.50', // Same IP triggers correlation
    };

    // 5. Pass through Incident Aggregator
    const incidents = aggregateIncidents([rawEvent, azureEvent]);

    // 6. Verify Cross-Cloud Correlation occurred
    const correlatedIncident = incidents.find(i => i.incident_id.startsWith('CORR-IP-'));
    expect(correlatedIncident).toBeDefined();
    expect(correlatedIncident?.event_count).toBe(2);
    expect(correlatedIncident?.events.some(e => e.provider === 'AWS')).toBe(true);
    expect(correlatedIncident?.events.some(e => e.provider === 'Azure')).toBe(true);
  });
});