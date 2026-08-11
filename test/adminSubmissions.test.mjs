import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { SUBMISSION_SOURCES } from '../src/lib/submissionSources.js';

const EXPECTED_TABLES = [
  'vendor_applications',
  'guest_applications',
  'sponsorship_leads',
  'contact_messages',
  'attendees',
  'ai_defense_stack_leads',
  'guests',
  'privacy_opt_outs',
];

test('admin submissions inventory covers every Risk Takers website intake table', () => {
  assert.deepEqual(SUBMISSION_SOURCES.map((source) => source.table), EXPECTED_TABLES);
  for (const source of SUBMISSION_SOURCES) {
    assert.ok(source.fields.length > 0, `${source.table} must expose relevant fields`);
    assert.ok(source.timestamp, `${source.table} must have a timestamp for newest-first ordering`);
  }
});

test('admin dashboard mounts the unified submissions manager', async () => {
  const adminSource = await readFile(new URL('../src/pages/Admin.jsx', import.meta.url), 'utf8');
  assert.match(adminSource, /import SubmissionsManager/);
  assert.match(adminSource, /value="submissions"/);
  assert.match(adminSource, /<SubmissionsManager \/>/);
  assert.doesNotMatch(adminSource, /GuestIntakeManager/);
});

test('admin read migration gates every private intake table through is_admin', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20260811044244_admin_submission_read_access.sql', import.meta.url), 'utf8');
  for (const table of EXPECTED_TABLES.filter((name) => name !== 'guests')) {
    assert.match(migration, new RegExp(`'${table}'`));
  }
  assert.match(migration, /for select to authenticated using \(\(select public\.is_admin\(\)\)\)/);
  const sqlWithoutComments = migration.replace(/^--.*$/gm, '');
  assert.doesNotMatch(sqlWithoutComments, /\bto anon\b/i);
});
