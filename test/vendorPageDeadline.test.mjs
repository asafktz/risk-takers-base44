import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('vendor page separates the application deadline from the event date', async () => {
  const [vendorPage, eventSource] = await Promise.all([
    readFile(new URL('../src/pages/Vendors.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/event.js', import.meta.url), 'utf8'),
  ]);

  assert.match(vendorPage, /Applications close \{APPLICATION_DEADLINE\}/);
  assert.match(vendorPage, /Event: \{EVENT\.dateLabel\}/);
  assert.match(eventSource, /Wednesday, September 23, 2026/);
  assert.doesNotMatch(eventSource, /September 1, 2026/);
});
