import { SecurityEvent, RuleMatch } from './types/event';

function isPrivateIP(ip: string | null): boolean {
  if (!ip) return false;
  return ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.');
}

export function evaluateRules(event: SecurityEvent): RuleMatch[] {
  const matches: RuleMatch[] = [];

  if (event.actor?.toLowerCase() === 'root' && event.outcome === 'Failure') {
    matches.push({
      rule_id: 'RULE-001',
      rule_name: 'Root Account Login Failure',
      explanation: `Failed login attempt detected for the root account from IP ${event.source_ip || 'unknown'}. Root accounts should not be used for routine access.`,
    });
  }

  if (!isPrivateIP(event.source_ip) && (event.action.includes('Anomaly') || event.action.includes('Unauthorized'))) {
    matches.push({
      rule_id: 'RULE-002',
      rule_name: 'Anomalous External Access',
      explanation: `Action '${event.action}' was performed from an external, non-private IP address (${event.source_ip}).`,
    });
  }

  return matches;
}