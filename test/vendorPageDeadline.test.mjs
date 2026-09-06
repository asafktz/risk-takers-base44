import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('vendor page closes submissions while preserving the event date and attendee path', async () => {
  const [vendorPage, eventSource] = await Promise.all([
    readFile(new URL('../src/pages/Vendors.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/event.js', import.meta.url), 'utf8'),
  ]);

  assert.match(vendorPage, /Applications closed/);
  assert.match(vendorPage, /Vendor applications for this event are now closed/);
  assert.match(vendorPage, /\{EVENT\.dateLabel\}/);
  assert.match(vendorPage, /to="\/AIDefenseStack#register"/);
  assert.doesNotMatch(vendorPage, /<form/);
  assert.doesNotMatch(vendorPage, /submitVendorApplication/);
  assert.match(eventSource, /Wednesday, September 23, 2026/);
  assert.doesNotMatch(eventSource, /September 1, 2026/);
});
