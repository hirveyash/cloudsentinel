import { loadSecurityEvents } from '@/src/lib/data-loader';
import { normalizeAwsGuardDutyFindings } from '@/src/lib/integrations/aws-guardduty';
import { normalizeAzureDefenderAlerts } from '@/src/lib/integrations/azure-defender';
import { normalizeGcpSccFindings } from '@/src/lib/integrations/gcp-scc';
import { evaluateRules } from '@/src/lib/rules-engine';
import { calculateRiskScore } from '@/src/lib/risk-scorer';
import { aggregateIncidents } from '@/src/lib/incident-aggregator';
import { calculateMetrics } from '@/src/lib/metrics-calculator';
import DemoBanner from './components/demo-banner';
import SummaryCards from './components/summary-cards';
import DashboardClient from './components/dashboard-client';

export default async function Home() {
  // 1. Load all raw data
  const syntheticEvents = await loadSecurityEvents();
  const awsEvents = normalizeAwsGuardDutyFindings();
  const azureEvents = normalizeAzureDefenderAlerts();
  const gcpEvents = normalizeGcpSccFindings();
  
  // 2. Combine them
  const rawEvents = [...syntheticEvents, ...awsEvents, ...azureEvents, ...gcpEvents];
  
  // 3. Apply Rules Engine and Risk Scorer to ALL events uniformly
  const allEvents = rawEvents.map((event) => {
    const ruleMatches = evaluateRules(event);
    const { score, factors } = calculateRiskScore({ ...event, rule_matches: ruleMatches });
    
    return {
      ...event,
      rule_matches: ruleMatches,
      risk_score: score,
      risk_factors: factors,
    };
  });
  
  // 4. Aggregate and calculate metrics
  const incidents = aggregateIncidents(allEvents);
  const metrics = calculateMetrics(allEvents);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <DemoBanner />
      
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CloudSentinel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Multi-cloud security monitoring dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Simulated System Status */}
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">All Systems Operational</span>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Data Sources</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Synthetic ({syntheticEvents.length}) | AWS ({awsEvents.length}) | Azure ({azureEvents.length}) | GCP ({gcpEvents.length})
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <SummaryCards metrics={metrics} />
          <DashboardClient events={allEvents} incidents={incidents} />
        </div>
      </main>
    </div>
  );
}