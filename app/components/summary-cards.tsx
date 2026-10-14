import { DashboardMetrics } from '@/src/lib/metrics-calculator';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  const cards = [
    { label: 'Total Events', value: metrics.totalEvents, color: 'text-gray-900 dark:text-white' },
    { label: 'Critical', value: metrics.criticalCount, color: 'text-red-600' },
    { label: 'High Severity', value: metrics.highCount, color: 'text-orange-600' },
    { label: 'Failed Outcomes', value: metrics.failureCount, color: 'text-yellow-600' },
    { label: 'Unique Accounts', value: metrics.uniqueAccounts, color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}