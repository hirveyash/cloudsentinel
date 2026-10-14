'use server';

import fs from 'fs';
import path from 'path';
import { AuditRecord } from '../types/event';

const AUDIT_LOG_PATH = path.join(process.cwd(), 'data', 'audit-log.json');

export interface ApproveActionInput {
  incident_id: string;
  action: string;
  target_resource: string;
  analyst_name: string;
  justification: string;
}

/**
 * Server Action: Approve a response action and record it in the audit trail.
 * 
 * This runs entirely on the server. The secret API key is never exposed to the browser.
 * The client calls this function directly — no HTTP request, no secret in headers.
 */
export async function approveResponseAction(
  input: ApproveActionInput
): Promise<AuditRecord> {
  // 1. Validate required fields
  if (!input.incident_id || !input.action || !input.analyst_name || !input.justification) {
    throw new Error('Missing required fields: incident_id, action, analyst_name, and justification are all required.');
  }

  // 2. Sanitize and bound inputs to prevent abuse
  const sanitized = {
    incident_id: String(input.incident_id).trim().slice(0, 200),
    action: String(input.action).trim().slice(0, 200),
    target_resource: String(input.target_resource || 'Unknown').trim().slice(0, 500),
    analyst_name: String(input.analyst_name).trim().slice(0, 100),
    justification: String(input.justification).trim().slice(0, 2000),
  };

  if (!sanitized.incident_id || !sanitized.action || !sanitized.analyst_name || !sanitized.justification) {
    throw new Error('Inputs cannot be empty after trimming.');
  }

  // 3. Build the audit record
  const newRecord: AuditRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    incident_id: sanitized.incident_id,
    action: sanitized.action,
    target_resource: sanitized.target_resource,
    analyst_name: sanitized.analyst_name,
    justification: sanitized.justification,
    status: 'Approved',
  };

  // 4. Ensure data directory exists
  const dir = path.dirname(AUDIT_LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 5. Read existing log (with safe fallback)
  let auditLog: AuditRecord[] = [];
  if (fs.existsSync(AUDIT_LOG_PATH)) {
    try {
      const fileContent = fs.readFileSync(AUDIT_LOG_PATH, 'utf-8');
      const parsed = JSON.parse(fileContent || '[]');
      if (Array.isArray(parsed)) {
        auditLog = parsed;
      }
    } catch {
      // Corrupted file — start fresh rather than crash
      auditLog = [];
    }
  }

  // 6. Atomic write: write to .tmp then rename to prevent corruption
  auditLog.push(newRecord);
  const tempPath = `${AUDIT_LOG_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(auditLog, null, 2), 'utf-8');
  fs.renameSync(tempPath, AUDIT_LOG_PATH);

  return newRecord;
}