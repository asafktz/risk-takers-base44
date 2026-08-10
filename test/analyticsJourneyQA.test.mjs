import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveFlareaConsent } from '../src/lib/flareaConsent.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the host installs one account pixel and no per-event pixel', async () => {
  const html = await read('index.html');
  assert.equal((html.match(/script\.src = 'https:\/\/flarea\.ai\/sr\.js'/g) || []).length, 1);
  assert.match(html, /setAttribute\('data-account', 'px_ea318f7787914774a763926a'\)/);
  assert.doesNotMatch(html, /setAttribute\('data-show'/);
  assert.match(html, /'\/analytics-journey-qa-20260810'/);
});

test('analytics consent defaults off and respects saved privacy choices', () => {
  assert.deepEqual(resolveFlareaConsent(), { consent: null, prompt: true });
  assert.deepEqual(resolveFlareaConsent({ saved: 'granted' }), { consent: true, prompt: false });
  assert.deepEqual(resolveFlareaConsent({ saved: 'denied' }), { consent: false, prompt: false });
  assert.deepEqual(resolveFlareaConsent({ gpc: true, saved: 'granted' }), { consent: false, prompt: false });
  assert.deepEqual(resolveFlareaConsent({ optedOut: true, saved: 'granted' }), { consent: false, prompt: false });
});

test('the unlisted QA route embeds only the synthetic event', async () => {
  const [app, page, aiDefense] = await Promise.all([
    read('src/App.jsx'),
    read('src/pages/AnalyticsJourneyQA.jsx'),
    read('src/pages/AIDefenseStack.jsx'),
  ]);
  assert.match(app, /analytics-journey-qa-20260810/);
  assert.match(page, /test-only-risk-takers-first-part-gmbr/);
  assert.match(page, /noindex: true/);
  assert.doesNotMatch(page, /ai-defense-stack-showcase-day-n4qd/);
  assert.match(aiDefense, /AI Defense Stack/);
});

test('privacy opt-out disables the optional Flarea pixel', async () => {
  const [layout, choices] = await Promise.all([
    read('src/components/AppLayout.jsx'),
    read('src/pages/PrivacyChoices.jsx'),
  ]);
  assert.match(layout, /<FlareaAnalyticsConsent \/>/);
  assert.match(choices, /disableOptionalFlarea\(\)/);
});
