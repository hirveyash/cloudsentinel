import { SecurityEvent, Severity, Outcome } from '../types/event';
import rawAwsFindings from './aws-guardduty-raw.json';

function mapAwsSeverity(awsSeverity: number): Severity {
  if (awsSeverity >= 7) return 'Critical';
  if (awsSeverity >= 4) return 'High';
  if (awsSeverity >= 1) return 'Medium';
  return 'Low';
}

export function normalizeAwsGuardDutyFindings(): SecurityEvent[] {
  // In a real app, this array would come from the AWS SDK API call.
  const findings = rawAwsFindings as any[];

  return findings.map((finding) => ({
    event_id: finding.Id,
    incident_id: finding.Id, // 1:1 mapping for MVP
    timestamp: finding.UpdatedAt,
    provider: 'AWS',
    source_service: 'GuardDuty',
    action: finding.Type,
    outcome: 'Unknown' as Outcome,
    severity: mapAwsSeverity(finding.Severity),
    actor: finding.Resource?.InstanceDetails?.IamInstanceProfile?.Id || null,
    resource: finding.Resource?.InstanceDetails?.InstanceId 
      ? `EC2 Instance: ${finding.Resource.InstanceDetails.InstanceId}` 
      : 'Unknown Resource',
    source_ip: finding.Service?.Action?.NetworkConnectionAction?.RemoteIpDetails?.IpAddress?.Ipv4Address ||
               finding.Service?.Action?.PortProbeAction?.PortProbeDetails?.[0]?.RemoteIpDetails?.IpAddress?.Ipv4Address ||
               null,
    account_context: finding.AccountId,
    region: finding.Region,
    raw_evidence: finding.Description,
    rule_matches: [],
    risk_score: 0,
    risk_factors: [],
    status: 'Open',
  }));
}