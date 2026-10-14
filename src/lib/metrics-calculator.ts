import { SecurityEvent } from './types/event';

export interface DashboardMetrics {
  totalEvents: number;
  criticalCount: number;
  highCount: number;
  uniqueAccounts: number;
  failureCount: number;
}

export function calculateMetrics(events: SecurityEvent[]): DashboardMetrics {
  return {
    totalEvents: events.length,
    criticalCount: events.filter(e => e.severity === 'Critical').length,
    highCount: events.filter(e => e.severity === 'High').length,
    uniqueAccounts: new Set(events.map(e => e.account_context)).size,
    failureCount: events.filter(e => e.outcome === 'Failure').length,
  };
}