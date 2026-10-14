import { SecurityEvent, Severity, Outcome } from '../types/event';
import rawGcpFindings from './gcp-scc-raw.json';

function mapGcpSeverity(gcpSeverity: string): Severity {
  switch (gcpSeverity.toUpperCase()) {
    case 'CRITICAL': return 'Critical';
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    default: return 'Informational';
  }
}

export function normalizeGcpSccFindings(): SecurityEvent[] {
  const findings = rawGcpFindings as any[];

  return findings.map((finding) => {
    const props = finding.sourceProperties || {};

    return {
      event_id: finding.name.split('/').pop(), // Extract the finding ID from the path
      incident_id: finding.name.split('/').pop() || 'unknown',
      timestamp: finding.eventTime || finding.createTime,
      provider: 'GCP' as const,
      source_service: 'Security Command Center',
      action: finding.category,
      outcome: 'Unknown' as Outcome,
      severity: mapGcpSeverity(finding.severity),
      actor: null, // GCP SCC findings often don't have a specific actor in the top level
      resource: finding.resourceName || 'Unknown Resource',
      source_ip: props.external_ip || null,
      account_context: props.project_id || 'unknown-project',
      region: props.zone ? props.zone.replace(/-[a-z]$/, '') : 'us-central1', // Strip the zone letter to get region
      raw_evidence: finding.description,
      rule_matches: [],
      risk_score: 0,
      risk_factors: [],
      status: 'Open' as const,
    };
  });
}