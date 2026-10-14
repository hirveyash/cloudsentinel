"use client";

import { useState } from 'react';
import { Incident, SecurityEvent, IncidentStatus, AuditRecord } from '../../src/lib/types/event';
import ApprovalModal from './approval-modal';

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  onUpdateIncident: (updatedIncident: Incident) => void;
  onClose: () => void;
}

export default function IncidentDetailDrawer({ incident, onUpdateIncident, onClose }: IncidentDetailDrawerProps) {
  const [newNote, setNewNote] = useState('');
  const [pendingAction, setPendingAction] = useState<{ name: string; resource: string } | null>(null);

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

  const handleApproveAction = async (actionData: Omit<AuditRecord, 'id' | 'timestamp' | 'status'>) => {
    const apiKey = process.env.NEXT_PUBLIC_CLOUDSENTINEL_API_KEY;
    
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(actionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to record audit action');
    }

    const autoNote = `[${new Date().toLocaleString()}] ACTION APPROVED: ${actionData.action} by ${actionData.analyst_name}`;
    onUpdateIncident({
      ...incident,
      analyst_notes: [autoNote, ...incident.analyst_notes],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      case 'Investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const primaryResource = incident.events[0]?.resource || 'Unknown Resource';

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

          <div className="mb-8 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Incident Management</h3>
            
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

          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Response Actions
            </h3>
            
            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md flex items-start gap-2">
              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                <strong>Simulation Mode:</strong> Actions are logged to the immutable audit trail for compliance, but do <em>not</em> execute against real cloud resources in this demo environment.
              </p>
            </div>

            <p className="text-xs text-red-700 dark:text-red-400 mb-3">Executing an action requires analyst approval and will be recorded.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingAction({ name: 'Quarantine Resource', resource: primaryResource })}
                className="px-4 py-2 bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Quarantine Resource
              </button>
              <button
                onClick={() => setPendingAction({ name: 'Revoke Credentials', resource: incident.events[0]?.actor || 'Unknown Actor' })}
                className="px-4 py-2 bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Revoke Credentials
              </button>
            </div>
          </div>

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

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-zinc-800 pb-2">Evidence Timeline</h3>
          <div className="relative border-l-2 border-gray-200 dark:border-zinc-700 ml-3 space-y-6">
            {incident.events.map((event: SecurityEvent) => (
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

      {pendingAction && (
        <ApprovalModal
          incidentId={incident.incident_id}
          actionName={pendingAction.name}
          targetResource={pendingAction.resource}
          onApprove={handleApproveAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  );
}