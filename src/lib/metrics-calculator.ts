import { SecurityEvent } from './types/event';

export interface DashboardMetrics {
  totalEvents: number;
  criticalCount: number;
  highCount: number;
  uniqueAccounts: number;
  failureCount: number;
  providerBreakdown: { AWS: number; Azure: number; GCP: number };
}

export function calculateMetrics(events: SecurityEvent[]): DashboardMetrics {
  return {
    totalEvents: events.length,
    criticalCount: events.filter(e => e.severity === 'Critical').length,
    highCount: events.filter(e => e.severity === 'High').length,
    uniqueAccounts: new Set(events.map(e => e.account_context)).size,
    failureCount: events.filter(e => e.outcome === 'Failure').length,
    providerBreakdown: {
      AWS: events.filter(e => e.provider === 'AWS').length,
      Azure: events.filter(e => e.provider === 'Azure').length,
      GCP: events.filter(e => e.provider === 'GCP').length,
    },
  };
}