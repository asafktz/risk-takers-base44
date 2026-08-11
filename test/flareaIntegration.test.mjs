import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { SHOWRUNNER_ORIGIN, showrunnerSlugFromUrl } from '../src/config/liveEvent.js';
import {
  disableOptionalFlarea,
  FLAREA_ANALYTICS_CONSENT_KEY,
  FLAREA_EMAIL_STORAGE_KEY,
  FLAREA_VISITOR_STORAGE_KEY,
  resolveFlareaConsent,
  saveFlareaConsent,
} from '../src/lib/flareaConsent.js';

const EVENT_SLUG = 'ai-defense-stack-showcase-day-n4qd';

test('analytics consent defaults off and respects privacy suppression', () => {
  assert.deepEqual(resolveFlareaConsent(), { consent: null, prompt: true });
  assert.deepEqual(resolveFlareaConsent({ saved: 'granted' }), { consent: true, prompt: false });
  assert.deepEqual(resolveFlareaConsent({ saved: 'denied' }), { consent: false, prompt: false });
  assert.deepEqual(resolveFlareaConsent({ gpc: true, saved: 'granted' }), { consent: false, prompt: false });
  assert.deepEqual(resolveFlareaConsent({ optedOut: true, saved: 'granted' }), { consent: false, prompt: false });
});

test('grant, rejection, and withdrawal call both Flarea consent outcomes', () => {
  const originalWindow = globalThis.window;
  const originalStorage = globalThis.localStorage;
  const values = new Map();
  const decisions = [];
  const events = [];
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  globalThis.window = {
    srConsent: (decision) => decisions.push(decision),
    dispatchEvent: (event) => events.push(event.type),
  };

  try {
    saveFlareaConsent(true);
    assert.equal(values.get(FLAREA_ANALYTICS_CONSENT_KEY), 'granted');
    assert.deepEqual(decisions, [true]);

    values.set(FLAREA_VISITOR_STORAGE_KEY, 'visitor-1');
    values.set(FLAREA_EMAIL_STORAGE_KEY, 'person@example.com');
    saveFlareaConsent(false);
    assert.equal(values.get(FLAREA_ANALYTICS_CONSENT_KEY), 'denied');
    assert.equal(values.has(FLAREA_VISITOR_STORAGE_KEY), false);
    assert.equal(values.has(FLAREA_EMAIL_STORAGE_KEY), false);
    assert.deepEqual(decisions, [true, false]);

    disableOptionalFlarea();
    assert.equal(globalThis.window.__rtPrivacyOptOut, true);
    assert.deepEqual(decisions, [true, false, false]);
    assert.deepEqual(events, ['rt:privacy-opt-out']);
  } finally {
    globalThis.window = originalWindow;
    globalThis.localStorage = originalStorage;
  }
});

test('the site uses one consent-gated account pixel and the AI Defense persistent player', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/script\.src = 'https:\/\/flarea\.ai\/sr\.js'/g) || []).length, 1);
  assert.match(html, /data-account', 'px_ea318f7787914774a763926a/);
  assert.match(html, /data-consent', 'required/);
  assert.doesNotMatch(html, /setAttribute\('data-show'/);
  assert.match(html, new RegExp(`https://www\\.risktakers\\.show/watch/${EVENT_SLUG}`));
  assert.match(html, new RegExp(`https://flarea\\.ai/embed/${EVENT_SLUG}`));
  assert.match(html, new RegExp(`https://flarea\\.ai/api/live\\?room=${EVENT_SLUG}`));
  assert.doesNotMatch(html, /the-human-operating-system-is-the-new-attack-surface-with-ev/);
});

test('the consent choice is mounted site-wide and privacy opt-out disables Flarea', async () => {
  const [layout, banner, choices, privacy] = await Promise.all([
    readFile(new URL('../src/components/AppLayout.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/FlareaAnalyticsConsent.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/PrivacyChoices.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/Privacy.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(layout, /<FlareaAnalyticsConsent \/>/);
  assert.match(banner, /random first-party ID in Local Storage/);
  assert.match(banner, /Rejecting keeps it off/);
  assert.match(banner, /z-\[2147483646\]/);
  assert.match(choices, /disableOptionalFlarea\(\)/);
  assert.match(choices, /saveFlareaConsent\(consent\)/);
  assert.match(choices, /Allow analytics/);
  assert.match(choices, /Reject analytics/);
  assert.match(privacy, /Flarea pixel is categorized as Analytics, not Strictly Necessary/);
  assert.match(privacy, /sr_vid/);
  assert.match(privacy, /sr_email/);
  assert.match(privacy, /Risk Takers is the controller/);
  assert.match(privacy, /Flarea acts as our processor/);
});

test('the split watch page forwards only personal and campaign parameters', async () => {
  const source = await readFile(new URL('../src/pages/Watch.jsx', import.meta.url), 'utf8');
  assert.match(source, /k === 'r' \|\| k === 'n' \|\| k\.startsWith\('utm_'\)/);
  assert.match(source, /\/embed\/\$\{clean\}/);
  assert.doesNotMatch(source, /location\.search\.slice/);
});

test('new Flarea links use the canonical host while legacy event URLs remain readable', () => {
  assert.equal(SHOWRUNNER_ORIGIN, 'https://flarea.ai');
  assert.equal(showrunnerSlugFromUrl('https://flarea.ai/e/current-show'), 'current-show');
  assert.equal(showrunnerSlugFromUrl('https://webinar-show.vercel.app/e/legacy-show'), 'legacy-show');
});

test('authenticated navigation treats the removed Base44 activity logger as optional', async () => {
  const source = await readFile(new URL('../src/lib/NavigationTracker.jsx', import.meta.url), 'utf8');
  assert.match(source, /typeof base44\.appLogs\?\.logUserInApp === 'function'/);
  assert.doesNotMatch(source, /if \(isAuthenticated && pageName\) \{\s*base44\.appLogs\.logUserInApp/);
});
