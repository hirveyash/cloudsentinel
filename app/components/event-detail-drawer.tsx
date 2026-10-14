"use client";

import { SecurityEvent, RuleMatch } from '../../src/lib/types/event';
import { findRelatedEvents } from '../../src/lib/correlation';

interface EventDetailDrawerProps {
  event: SecurityEvent | null;
  allEvents: SecurityEvent[];
  onClose: () => void;
}

export default function EventDetailDrawer({ event, allEvents, onClose }: EventDetailDrawerProps) {
  if (!event) return null;

  const relatedEvents = findRelatedEvents(event, allEvents);

  const fields = [
    { label: 'Event ID', value: event.event_id },
    { label: 'Timestamp', value: new Date(event.timestamp).toLocaleString() },
    { label: 'Provider', value: event.provider },
    { label: 'Service', value: event.source_service },
    { label: 'Action', value: event.action },
    { label: 'Outcome', value: event.outcome },
    { label: 'Severity', value: event.severity },
    { label: 'Actor', value: event.actor || 'Unknown' },
    { label: 'Resource', value: event.resource || 'Unknown' },
    { label: 'Source IP', value: event.source_ip || 'Unknown' },
    { label: 'Account', value: event.account_context },
    { label: 'Region', value: event.region || 'Unknown' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
    return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl border-l border-gray-200 dark:border-zinc-800 z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Event Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
          </div>

          <div className={`mb-6 p-4 border rounded-lg ${getScoreColor(event.risk_score)}`}>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Risk Score</h3>
              <span className="text-3xl font-bold">{event.risk_score}/100</span>
            </div>
            <ul className="text-sm space-y-1 list-disc list-inside opacity-90">
              {event.risk_factors.map((factor: string, idx: number) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">Detection Rules Triggered</h3>
            {event.rule_matches.length > 0 ? (
              <ul className="space-y-3">
                {event.rule_matches.map((match: RuleMatch, idx: number) => (
                  <li key={idx} className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-semibold block">{match.rule_name} ({match.rule_id})</span>
                    <span className="text-blue-700 dark:text-blue-400">{match.explanation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-blue-700 dark:text-blue-400 italic">No specific detection rules triggered for this event.</p>
            )}
          </div>

          {relatedEvents.length > 0 && (
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">Correlated Events ({relatedEvents.length})</h3>
              <ul className="space-y-2">
                {relatedEvents.map((rel: SecurityEvent) => (
                  <li key={rel.event_id} className="text-sm text-purple-800 dark:text-purple-300 bg-white dark:bg-zinc-900 p-2 rounded border border-purple-100 dark:border-purple-800">
                    <span className="font-mono font-semibold">{rel.event_id}</span>: {rel.action} 
                    <span className="block text-xs opacity-75 mt-1">Matched by: {event.source_ip && rel.source_ip === event.source_ip ? 'Source IP' : 'Actor'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.label} className="border-b border-gray-100 dark:border-zinc-800 pb-3">
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{field.label}</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">{field.value}</dd>
              </div>
            ))}
            <div className="pt-4">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Raw Evidence</dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-950 p-3 rounded-md border border-gray-200 dark:border-zinc-800">{event.raw_evidence}</dd>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}