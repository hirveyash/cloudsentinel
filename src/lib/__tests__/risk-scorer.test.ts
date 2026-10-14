import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from '../risk-scorer';
import { SecurityEvent } from '../types/event';

const baseEvent: SecurityEvent = {
  event_id: 'test-001',
  incident_id: 'INC-001',
  timestamp: '2026-10-15T10:00:00Z',
  provider: 'AWS',
  source_service: 'GuardDuty',
  action: 'Test Action',
  outcome: 'Unknown',
  severity: 'Medium',
  actor: null,
  resource: 'test-resource',
  source_ip: '192.168.1.1',
  account_context: '123456789012',
  region: 'us-east-1',
  raw_evidence: 'Test evidence',
  rule_matches: [],
  risk_score: 0,
  risk_factors: [],
  status: 'Open',
};

describe('calculateRiskScore', () => {
  it('should assign correct base score for Critical severity', () => {
    const event = { ...baseEvent, severity: 'Critical' as const };
    const result = calculateRiskScore(event);
    expect(result.score).toBe(80);
    expect(result.factors.some(f => f.includes('Critical'))).toBe(true);
  });

  it('should add penalty for Failure outcome', () => {
    const event = { ...baseEvent, severity: 'High' as const, outcome: 'Failure' as const };
    const result = calculateRiskScore(event);
    expect(result.score).toBe(70); // 60 (High) + 10 (Failure)
  });

  it('should add bonus for triggered rules', () => {
    const event = { 
      ...baseEvent, 
      severity: 'Low' as const, 
      rule_matches: [{ rule_id: 'R1', rule_name: 'Test', explanation: 'Test' }] 
    };
    const result = calculateRiskScore(event);
    expect(result.score).toBe(30); // 20 (Low) + 10 (1 rule)
  });

  it('should cap the maximum risk score at 100', () => {
    const event = { 
      ...baseEvent, 
      severity: 'Critical' as const, 
      outcome: 'Failure' as const,
      rule_matches: [
        { rule_id: 'R1', rule_name: 'Test', explanation: 'Test' },
        { rule_id: 'R2', rule_name: 'Test', explanation: 'Test' },
        { rule_id: 'R3', rule_name: 'Test', explanation: 'Test' }
      ] 
    };
    const result = calculateRiskScore(event);
    expect(result.score).toBe(100); // 80 + 10 + 30 = 120 -> capped at 100
  });
});