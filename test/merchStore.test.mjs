import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  MERCH_INTERESTS,
  normalizeMerchWaitlistInput,
} from '../api/submitMerchWaitlist.js';


const requiredAssets = [
  'public/merch/hero/risk-takers-gift-store-hero.png',
  'public/merch/hero/risk-takers-merch-real-v2.avif',
  'public/merch/brand/risk-takers-logo-source.png',
  'public/merch/mockups/tee-human-in-the-loop-v2.avif',
  'public/merch/mockups/hoodie-zero-trust-high-agency-v2.avif',
  'public/merch/mockups/mug-prompt-injection-fuel-v2.avif',
  'public/merch/mockups/deskmat-attack-surface-v2.avif',
  'public/merch/mockups/sticker-risk-takers-v2.avif',
  'public/merch/mockups/operators-desk-set-v2.avif',
  'public/merch/artwork/human-in-the-loop-print-4500x5400.png',
  'public/merch/artwork/zero-trust-high-agency-print-4500x5400.png',
  'public/merch/artwork/prompt-injection-fuel-mug-print-4800x2000.png',
  'public/merch/artwork/attack-surface-desk-mat-print-6000x2600.png',
  'public/merch/artwork/take-the-risk-sticker-print-3000x3000.png',
];


test('merch waitlist is routed, discoverable, and indexable on risktakers.show', async () => {
  const [app, navbar, sitemap] = await Promise.all([
    readFile('src/App.jsx', 'utf8'),
    readFile('src/components/landing/Navbar.jsx', 'utf8'),
    readFile('public/sitemap.xml', 'utf8'),
  ]);

  assert.match(app, /path="\/gift-store"/);
  assert.match(navbar, /Merch Waitlist/);
  assert.match(sitemap, /https:\/\/risktakers\.show\/gift-store/);
});


test('public merch page is waitlist-only and has no provider checkout path', async () => {
  const [page, config] = await Promise.all([
    readFile('src/pages/GiftStore.jsx', 'utf8'),
    readFile('src/config/merch.js', 'utf8'),
  ]);

  assert.match(page, /WAITLIST ONLY/);
  assert.match(page, /Planned retail/);
  assert.match(page, /nothing on this page is for sale yet/i);
  assert.match(page, /submitMerchWaitlist/);
  assert.match(page, /PrivacyCollectionNotice/);
  assert.match(page, /status === 'loading'/);
  assert.match(page, /status === 'success'/);
  assert.match(page, /status === 'error'/);
  assert.doesNotMatch(`${page}\n${config}`, /Fourthwall|VITE_FOURTHWALL|providerUrl|merchProvider|Open the store|Checkout at launch/);
  assert.doesNotMatch(config, /baseCost|providerId|providerSlug|shopDomain/);
});


test('waitlist input is normalized and constrained to known product interests', () => {
  assert.deepEqual(
    normalizeMerchWaitlistInput({
      name: '  Ada   Lovelace ',
      email: ' ADA@EXAMPLE.COM ',
      interest: 'attack-surface-desk-mat',
    }),
    {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      interest: 'attack-surface-desk-mat',
    },
  );
  assert.ok(MERCH_INTERESTS.has('full-drop'));
  assert.throws(
    () => normalizeMerchWaitlistInput({ name: 'Ada', email: 'ada@example.com', interest: 'unknown-product' }),
    /valid merch interest/,
  );
  assert.throws(
    () => normalizeMerchWaitlistInput({ name: 'Ada', email: 'not-an-email', interest: 'full-drop' }),
    /valid email address/,
  );
});


test('waitlist endpoint records a dedicated source and handles repeat email submissions', async () => {
  const endpoint = await readFile('api/submitMerchWaitlist.js', 'utf8');

  assert.match(endpoint, /subscription_type: 'merch_waitlist'/);
  assert.match(endpoint, /Source: \/gift-store/);
  assert.match(endpoint, /findExistingWaitlistEntry/);
  assert.match(endpoint, /updateRow\('attendees'/);
  assert.match(endpoint, /existing: true/);
});


test('every core product has a print-ready artwork file', async () => {
  await Promise.all(requiredAssets.map((path) => access(path)));
});


test('public collection uses the real product visual set', async () => {
  const [page, config] = await Promise.all([
    readFile('src/pages/GiftStore.jsx', 'utf8'),
    readFile('src/config/merch.js', 'utf8'),
  ]);

  assert.match(page, /risk-takers-merch-real-v2\.avif/);
  assert.match(config, /tee-human-in-the-loop-v2\.avif/);
  assert.match(config, /hoodie-zero-trust-high-agency-v2\.avif/);
  assert.match(config, /mug-prompt-injection-fuel-v2\.avif/);
  assert.match(config, /deskmat-attack-surface-v2\.avif/);
  assert.match(config, /sticker-risk-takers-v2\.avif/);
  assert.match(config, /operators-desk-set-v2\.avif/);
  assert.match(page, /loading="lazy"/);
  assert.doesNotMatch(page, /gift-store-hazard|WAITLIST ONLY<\/span>|shadow-\[7px_7px/);
});


test('print artwork is built from the approved Risk Takers logo', async () => {
  const generator = await readFile('scripts/build_merch_art.py', 'utf8');

  assert.match(generator, /BRAND_LOGO/);
  assert.match(generator, /paste_brand_logo/);
  assert.doesNotMatch(generator, /\b(?:shield|padlock|keyhole|circuit)\b/i);
});


test('public legal copy describes a preview and waitlist rather than a store', async () => {
  const [privacy, terms] = await Promise.all([
    readFile('src/pages/Privacy.jsx', 'utf8'),
    readFile('src/pages/Terms.jsx', 'utf8'),
  ]);

  assert.match(privacy, /Merch waitlist information/);
  assert.match(privacy, /selected product interest/);
  assert.match(terms, /Merchandise previews and waitlist/);
  assert.match(terms, /does not create an order/);
  assert.match(terms, /not current offers for sale/);
  assert.doesNotMatch(`${privacy}\n${terms}`, /Fourthwall/);
});
