import { DashboardMetrics } from '@/src/lib/metrics-calculator';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{metrics.totalEvents}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Critical</p>
          <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{metrics.criticalCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">High Severity</p>
          <p className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">{metrics.highCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Failed Outcomes</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{metrics.failureCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique Accounts</p>
          <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{metrics.uniqueAccounts}</p>
        </div>
      </div>

      {/* Bottom Row: Provider Breakdown */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ingested Events by Provider</p>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AWS: <span className="font-bold">{metrics.providerBreakdown.AWS}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Azure: <span className="font-bold">{metrics.providerBreakdown.Azure}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GCP: <span className="font-bold">{metrics.providerBreakdown.GCP}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}