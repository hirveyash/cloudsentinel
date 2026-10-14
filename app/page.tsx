// app/page.tsx
import { loadSecurityEvents } from '@/src/lib/data-loader';
import { aggregateIncidents } from '@/src/lib/incident-aggregator';
import { calculateMetrics } from '@/src/lib/metrics-calculator';
import DemoBanner from './components/demo-banner';
import SummaryCards from './components/summary-cards';
import DashboardClient from './components/dashboard-client';

export default async function Home() {
  const events = await loadSecurityEvents();
  const incidents = aggregateIncidents(events);
  const metrics = calculateMetrics(events);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <DemoBanner />
      
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CloudSentinel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Multi-cloud security monitoring dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Environment</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Local Development</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <SummaryCards metrics={metrics} />
          
          {/* Pass both events and incidents to the client */}
          <DashboardClient events={events} incidents={incidents} />
        </div>
      </main>
    </div>
  );
}