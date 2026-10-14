"use client";

import { useState } from 'react';
import { AuditRecord } from '../../src/lib/types/event';

interface ApprovalModalProps {
  incidentId: string;
  actionName: string;
  targetResource: string;
  onApprove: (record: Omit<AuditRecord, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  onCancel: () => void;
}

export default function ApprovalModal({ incidentId, actionName, targetResource, onApprove, onCancel }: ApprovalModalProps) {
  const [analystName, setAnalystName] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analystName.trim() || !justification.trim()) {
      setError('Both analyst name and justification are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onApprove({
        incident_id: incidentId,
        action: actionName,
        target_resource: targetResource,
        analyst_name: analystName.trim(),
        justification: justification.trim(),
      });
      onCancel(); // Close modal on success
    } catch (err) {
      console.error('Approval failed:', err);
      setError('Failed to record action. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Approve Response Action</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You are about to execute: <span className="font-semibold text-red-600 dark:text-red-400">{actionName}</span>
            <br />
            Target: <span className="font-mono text-xs bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">{targetResource}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Analyst Name *</label>
              <input
                type="text"
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                placeholder="e.g., J. Smith"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Justification *</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white resize-none"
                placeholder="Briefly explain why this action is necessary..."
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing...' : 'Authorize & Execute'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}