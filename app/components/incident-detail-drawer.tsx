"use client";

import { useState } from 'react';
import { Incident, SecurityEvent, IncidentStatus } from '../../src/lib/types/event';

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  onUpdateIncident: (updatedIncident: Incident) => void;
  onClose: () => void;
}

export default function IncidentDetailDrawer({ incident, onUpdateIncident, onClose }: IncidentDetailDrawerProps) {
  const [newNote, setNewNote] = useState('');

  if (!incident) return null;

  const handleStatusChange = (newStatus: IncidentStatus) => {
    onUpdateIncident({ ...incident, status: newStatus });
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString();
      const formattedNote = `[${timestamp}] ${newNote.trim()}`;
      onUpdateIncident({ 
        ...incident, 
        analyst_notes: [formattedNote, ...incident.analyst_notes] 
      });
      setNewNote('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      case 'Investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-2xl border-l border-gray-200 dark:border-zinc-800 z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{incident.incident_id}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{incident.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
          </div>

          {/* NEW: Incident Management Section */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Incident Management</h3>
            
            {/* Status Selector */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Status</p>
              <div className="flex gap-2">
                {(['Open', 'Investigating', 'Resolved'] as IncidentStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      incident.status === status 
                        ? getStatusColor(status) 
                        : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Input */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Add Investigation Note</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="e.g., Verified IP is internal. Escalating to Tier 2."
                  className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Incident Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Max Risk</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{incident.max_risk_score}</p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Events</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{incident.event_count}</p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Last Seen</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{new Date(incident.last_seen).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Analyst Notes History */}
          {incident.analyst_notes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Investigation Notes</h3>
              <div className="space-y-2">
                {incident.analyst_notes.map((note, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-900 dark:text-blue-200">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Timeline */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-zinc-800 pb-2">Evidence Timeline</h3>
          <div className="relative border-l-2 border-gray-200 dark:border-zinc-700 ml-3 space-y-6">
            {incident.events.map((event: SecurityEvent, idx: number) => (
              <div key={event.event_id} className="mb-8 ml-6 relative">
                <span className="absolute -left-[31px] flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full ring-4 ring-white dark:ring-zinc-900 dark:bg-blue-900"></span>
                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{event.event_id}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{event.action}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{event.raw_evidence}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{event.provider}</span>
                    <span className={`px-2 py-0.5 rounded ${event.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : event.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>{event.severity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}