import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { approveResponseAction } from '../actions/audit';

const TEST_LOG_PATH = path.join(process.cwd(), 'data', 'audit-integrity-test.json');

describe('Audit Action Integrity', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_LOG_PATH)) fs.unlinkSync(TEST_LOG_PATH);
    if (fs.existsSync(TEST_LOG_PATH + '.tmp')) fs.unlinkSync(TEST_LOG_PATH + '.tmp');
  });

  afterEach(() => {
    if (fs.existsSync(TEST_LOG_PATH)) fs.unlinkSync(TEST_LOG_PATH);
    if (fs.existsSync(TEST_LOG_PATH + '.tmp')) fs.unlinkSync(TEST_LOG_PATH + '.tmp');
  });

  it('should reject requests with missing required fields', async () => {
    // @ts-expect-error Testing invalid input
    await expect(approveResponseAction({ incident_id: 'INC-1' })).rejects.toThrow('Missing required fields');
  });

  it('should reject requests with empty strings after trimming', async () => {
    await expect(
      approveResponseAction({
        incident_id: '   ',
        action: 'Test',
        target_resource: 'res',
        analyst_name: '   ',
        justification: 'just',
      }, TEST_LOG_PATH) // <-- Explicitly passed
    ).rejects.toThrow('Inputs cannot be empty after trimming');
  });

  it('should successfully write and recover from a corrupted file', async () => {
    // 1. Corrupt the file
    fs.writeFileSync(TEST_LOG_PATH, 'not valid json {{{', 'utf-8');
    
    // 2. Call action with TEST_LOG_PATH as the second argument
    const result = await approveResponseAction({
      incident_id: 'INC-1',
      action: 'Test Action',
      target_resource: 'test-res',
      analyst_name: 'Tester',
      justification: 'Testing recovery',
    }, TEST_LOG_PATH); // <-- THIS IS THE CRITICAL FIX

    expect(result.incident_id).toBe('INC-1');
    
    // 3. Verify it overwrote the corruption
    const content = fs.readFileSync(TEST_LOG_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].analyst_name).toBe('Tester');
  });
});