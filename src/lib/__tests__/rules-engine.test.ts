import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../rules-engine';
import { SecurityEvent } from '../types/event';

const createMockEvent = (overrides: Partial<SecurityEvent> = {}): SecurityEvent => ({
  event_id: 'test-1',
  incident_id: 'INC-1',
  timestamp: '2026-10-12T08:15:30Z',
  provider: 'AWS',
  source_service: 'GuardDuty',
  action: 'ConsoleLogin',
  outcome: 'Success',
  severity: 'Low',
  actor: 'admin',
  resource: null,
  source_ip: '192.168.1.1',
  account_context: '123456789012',
  region: 'us-east-1',
  raw_evidence: 'test',
  rule_matches: [],
  risk_score: 0,
  risk_factors: [],
  status: 'Open',
  ...overrides,
});

describe('evaluateRules', () => {
  it('should trigger RULE-001 for root account failure', () => {
    const event = createMockEvent({ actor: 'root', outcome: 'Failure' });
    const matches = evaluateRules(event);
    expect(matches.length).toBe(1);
    expect(matches[0].rule_id).toBe('RULE-001');
  });

  it('should trigger RULE-002 for anomalous external access', () => {
    const event = createMockEvent({ 
      source_ip: '203.0.113.45', 
      action: 'UnauthorizedAccess:IAMUser/Anomaly' 
    });
    const matches = evaluateRules(event);
    expect(matches.length).toBe(1);
    expect(matches[0].rule_id).toBe('RULE-002');
  });

  it('should return no matches for a safe, internal event', () => {
    const event = createMockEvent({ 
      actor: 'admin', 
      outcome: 'Success', 
      source_ip: '10.0.0.1' 
    });
    const matches = evaluateRules(event);
    expect(matches.length).toBe(0);
  });
});