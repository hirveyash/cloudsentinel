"use client";

import { Incident } from '../../src/lib/types/event';

interface IncidentsTableProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export default function IncidentsTable({ incidents, onSelectIncident }: IncidentsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Investigating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            {incidents.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No incidents found.</td></tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.incident_id} onClick={() => onSelectIncident(incident)} className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getScoreColor(incident.max_risk_score)}`}>{incident.max_risk_score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">{incident.incident_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{incident.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>{incident.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{incident.event_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(incident.last_seen).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}