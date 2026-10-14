"use client";

import { useState } from 'react';
import { SecurityEvent } from '../../src/lib/types/event';

interface EventsTableProps {
  events: SecurityEvent[];
  onSelectEvent: (event: SecurityEvent) => void;
}

export default function EventsTable({ events, onSelectEvent }: EventsTableProps) {
  const [filter, setFilter] = useState('');

  const filteredEvents = events.filter((event) => {
    const searchStr = filter.toLowerCase();
    return (
      event.action.toLowerCase().includes(searchStr) ||
      event.source_ip?.toLowerCase().includes(searchStr) ||
      event.severity.toLowerCase().includes(searchStr) ||
      event.provider.toLowerCase().includes(searchStr)
    );
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <input
          type="text"
          placeholder="Filter by action, IP, severity, or provider..."
          className="w-full max-w-md px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            {filteredEvents.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No events match your filter criteria.</td></tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.event_id} onClick={() => onSelectEvent(event)} className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>{event.severity}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">{event.provider}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono">{event.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${event.outcome === 'Failure' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : event.outcome === 'Success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {event.outcome}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}