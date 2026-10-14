import { SecurityEvent, Severity, Outcome } from '../types/event';
import rawAzureAlerts from './azure-defender-raw.json';

function mapAzureSeverity(azureSeverity: string): Severity {
  switch (azureSeverity.toLowerCase()) {
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Informational';
  }
}

function extractIp(entities: any[]): string | null {
  const ipEntity = entities?.find((e: any) => e.type === 'ip');
  return ipEntity?.address || null;
}

function extractActor(entities: any[], compromisedEntity: string): string | null {
  const accountEntity = entities?.find((e: any) => e.type === 'account');
  return accountEntity?.name || compromisedEntity || null;
}

export function normalizeAzureDefenderAlerts(): SecurityEvent[] {
  const alerts = rawAzureAlerts as any[];

  return alerts.map((alert) => {
    const props = alert.properties;
    const entities = props.entities || [];

    return {
      event_id: alert.name,
      incident_id: alert.name,
      timestamp: props.timeGeneratedUtc,
      provider: 'Azure' as const,
      source_service: 'Defender for Cloud',
      action: props.displayName,
      outcome: 'Unknown' as Outcome,
      severity: mapAzureSeverity(props.severity),
      actor: extractActor(entities, props.compromisedEntity),
      resource: entities.find((e: any) => e.type === 'host')?.hostname || props.compromisedEntity || 'Unknown Resource',
      source_ip: extractIp(entities),
      account_context: 'sub-123', 
      region: 'centralus', 
      raw_evidence: props.description,
      rule_matches: [],
      risk_score: 0,
      risk_factors: [],
      status: 'Open' as const,
    };
  });
}