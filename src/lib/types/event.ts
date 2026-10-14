export type CloudProvider = 'AWS' | 'Azure' | 'GCP';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type Outcome = 'Success' | 'Failure' | 'Unknown';
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved';

export interface RuleMatch {
  rule_id: string;
  rule_name: string;
  explanation: string;
}

export interface SecurityEvent {
  event_id: string;
  incident_id: string;
  timestamp: string;
  provider: CloudProvider;
  source_service: string;
  action: string;
  outcome: Outcome;
  severity: Severity;
  actor: string | null;
  resource: string | null;
  source_ip: string | null;
  account_context: string;
  region: string | null;
  raw_evidence: string;
  rule_matches: RuleMatch[];
  risk_score: number;
  risk_factors: string[];
  status: IncidentStatus;
}

export interface Incident {
  incident_id: string;
  title: string;
  status: IncidentStatus;
  max_risk_score: number;
  event_count: number;
  first_seen: string;
  last_seen: string;
  events: SecurityEvent[];
  analyst_notes: string[]; // NEW: Array to store investigation notes
}