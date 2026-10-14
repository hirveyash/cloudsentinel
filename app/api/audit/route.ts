import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AuditRecord } from '@/src/lib/types/event';

const AUDIT_LOG_PATH = path.join(process.cwd(), 'data', 'audit-log.json');
const API_KEY = process.env.NEXT_PUBLIC_CLOUDSENTINEL_API_KEY;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!API_KEY || authHeader !== `Bearer ${API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { incident_id, action, target_resource, analyst_name, justification } = body;

    if (!incident_id || !action || !analyst_name || !justification) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRecord: AuditRecord = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      incident_id,
      action,
      target_resource: target_resource || 'Unknown',
      analyst_name,
      justification,
      status: 'Approved',
    };

    const dir = path.dirname(AUDIT_LOG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let auditLog: AuditRecord[] = [];
    if (fs.existsSync(AUDIT_LOG_PATH)) {
      const fileContent = fs.readFileSync(AUDIT_LOG_PATH, 'utf-8');
      auditLog = JSON.parse(fileContent || '[]');
    }

    auditLog.push(newRecord);
    fs.writeFileSync(AUDIT_LOG_PATH, JSON.stringify(auditLog, null, 2), 'utf-8');

    return NextResponse.json({ success: true, record: newRecord });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!API_KEY || authHeader !== `Bearer ${API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
  }

  try {
    if (!fs.existsSync(AUDIT_LOG_PATH)) {
      return NextResponse.json([]);
    }
    const fileContent = fs.readFileSync(AUDIT_LOG_PATH, 'utf-8');
    const auditLog: AuditRecord[] = JSON.parse(fileContent || '[]');
    return NextResponse.json(auditLog);
  } catch (error) {
    console.error('Failed to read audit log:', error);
    return NextResponse.json({ error: 'Failed to read audit log' }, { status: 500 });
  }
}