import { SecurityEvent, Severity, Outcome } from '../types/event';
import rawAzureAlerts from './azure-defender-raw.json';

type AzureEntity = { type: string; hostname?: string; address?: string; name?: string };

interface RawAzureAlert {
  id: string;
  name: string;
  type: string;
  properties: {
    displayName: string;
    severity: string;
    status: string;
    timeGeneratedUtc: string;
    description: string;
    compromisedEntity: string;
    remediationSteps: string;
    entities: AzureEntity[];
  };
}

function mapAzureSeverity(azureSeverity: string): Severity {
  switch (azureSeverity.toLowerCase()) {
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Informational';
  }
}

function extractIp(entities: AzureEntity[]): string | null {
  const ipEntity = entities?.find((e) => e.type === 'ip');
  return ipEntity?.address || null;
}

function extractActor(entities: AzureEntity[], compromisedEntity: string): string | null {
  const accountEntity = entities?.find((e) => e.type === 'account');
  return accountEntity?.name || compromisedEntity || null;
}

export function normalizeAzureDefenderAlerts(): SecurityEvent[] {
  const alerts = rawAzureAlerts as RawAzureAlert[];

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
      resource: entities.find((e) => e.type === 'host')?.hostname || props.compromisedEntity || 'Unknown Resource',
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