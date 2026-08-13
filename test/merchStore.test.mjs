import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  MERCH_INTERESTS,
  normalizeMerchWaitlistInput,
} from '../api/submitMerchWaitlist.js';


const requiredAssets = [
  'public/merch/hero/risk-takers-gift-store-hero.png',
  'public/merch/hero/risk-takers-merch-real-v2.jpg',
  'public/merch/brand/risk-takers-logo-source.png',
  'public/merch/mockups/tee-human-in-the-loop-v2.avif',
  'public/merch/mockups/hoodie-zero-trust-high-agency-v2.avif',
  'public/merch/mockups/mug-prompt-injection-fuel-v2.avif',
  'public/merch/mockups/deskmat-attack-surface-v2.avif',
  'public/merch/mockups/sticker-risk-takers-v2.avif',
  'public/merch/mockups/operators-desk-set-v2.avif',
];

async function allFilesForStoreTest(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.join(root, entry.name);
    return entry.isDirectory() ? allFilesForStoreTest(file) : [file];
  }));
  return files.flat();
}


test('gift store is routed, discoverable, and indexable on risktakers.show', async () => {
  const [app, navbar, sitemap] = await Promise.all([
    readFile('src/App.jsx', 'utf8'),
    readFile('src/components/landing/Navbar.jsx', 'utf8'),
    readFile('public/sitemap.xml', 'utf8'),
  ]);

  assert.match(app, /path="\/gift-store"/);
  assert.match(navbar, /Gift Store/);
  assert.doesNotMatch(navbar, /Merch Waitlist/);
  assert.match(sitemap, /https:\/\/risktakers\.show\/gift-store/);
});

test('closed mobile navigation is removed from layout and keyboard order', async () => {
  const navbarSource = await readFile('src/components/landing/Navbar.jsx', 'utf8');
  assert.match(navbarSource, /id="mobile-navigation"[^>]*className="[^"]*\bhidden\b[^"]*\bgroup-open:block\b/);
  assert.match(navbarSource, /aria-label="Toggle navigation menu"/);
});


test('gift store fails closed to its waitlist while supporting live backend commerce', async () => {
  const [page, config] = await Promise.all([
    readFile('src/pages/GiftStore.jsx', 'utf8'),
    readFile('src/config/merch.js', 'utf8'),
  ]);

  assert.match(page, /salesState: 'waitlist'/);
  assert.match(page, /commerceEnabled: false/);
  assert.match(page, /\/api\/merchPublicConfig/);
  assert.match(page, /\/api\/merchCheckout/);
  assert.match(page, /submitMerchWaitlist/);
  assert.match(page, /PrivacyCollectionNotice/);
  assert.match(page, /Add to bag/);
  assert.match(page, /Continue to secure checkout/);
  assert.match(page, /window\.location\.assign/);
  assert.match(page, /productId: item\.product\.id/);
  assert.match(page, /selection: item\.selection/);
  assert.match(page, /status === 'loading'/);
  assert.match(page, /status === 'success'/);
  assert.match(page, /status === 'error'/);

  const clientSource = `${page}\n${config}`;
  assert.doesNotMatch(clientSource, /FOURTHWALL_API_|FOURTHWALL_STOREFRONT|FOURTHWALL_WEBHOOK/);
  assert.doesNotMatch(clientSource, /providerId|providerSlug|variantId|unitCost|baseCost|creatorDeclaredCost|shopDomain/);
  assert.doesNotMatch(config, /a59b182f|afe610ca|e9b888e4|7384f894|c572a824|1005793e/);
});


test('live mode exposes retail, options, bag limits, and safe hosted checkout behavior', async () => {
  const page = await readFile('src/pages/GiftStore.jsx', 'utf8');

  assert.match(page, /commerceEnabled \? 'Retail' : 'Planned retail'/);
  assert.match(page, /private_test/);
  assert.match(page, /SHOP OPEN/);
  assert.match(page, /Color/);
  assert.match(page, /Size/);
  assert.match(page, /quantity >= 5/);
  assert.match(page, /itemCount >= 10/);
  assert.match(page, /checkoutUrl\.protocol !== 'https:'/);
  assert.match(page, /Shipping and applicable taxes are calculated in secure checkout/);
  assert.match(page, /credentials: 'same-origin'/);
  assert.match(page, /Authorization: `Bearer \$\{token\}`/);
  assert.match(page, /DialogPrimitive\.Root/);
  assert.match(page, /DialogPrimitive\.Title/);
  assert.match(page, /DialogPrimitive\.Description/);
  assert.match(page, /DialogPrimitive\.Close/);
  assert.match(page, /onCloseAutoFocus/);
  assert.match(page, /returnFocusRef\.current\.focus/);
});


test('commerce structured data is emitted only for confirmed live mode', async () => {
  const page = await readFile('src/pages/GiftStore.jsx', 'utf8');

  assert.match(page, /function collectionJsonLd\(isLive\)/);
  assert.match(page, /item: isLive/);
  assert.match(page, /'@type': 'Product'/);
  assert.match(page, /'@type': 'Offer'/);
  assert.match(page, /noindex: storeConfig\.salesState === 'private_test'/);
  assert.match(page, /jsonLd: \[collectionJsonLd\(isLive\)\]/);
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


test('every public product visual exists', async () => {
  await Promise.all(requiredAssets.map((path) => access(path)));
});


test('provider-ready print masters are outside the public web root and built storefront', async () => {
  const publicFiles = await allFilesForStoreTest('public');
  assert.ok(publicFiles.every((file) => !file.includes('/merch/artwork/')));

  try {
    const [distIndex, generator] = await Promise.all([
      stat('dist/index.html'),
      stat('scripts/build_merch_art.py'),
    ]);
    // A pre-existing dist/ may have been built before the masters were moved.
    // The assertion becomes authoritative as soon as the current source has
    // been built, while a clean checkout without dist remains testable.
    if (distIndex.mtimeMs < generator.mtimeMs) return;
    const distFiles = await allFilesForStoreTest('dist');
    const deployedNames = distFiles.map((file) => file.split('/').pop());
    assert.ok(!deployedNames.some((name) => /(?:print|left-chest|sleeve|mug-wrap|full-bleed|PRODUCTION_ART)/i.test(name)));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
});


test('public collection preserves the approved real product visual set', async () => {
  const [page, config] = await Promise.all([
    readFile('src/pages/GiftStore.jsx', 'utf8'),
    readFile('src/config/merch.js', 'utf8'),
  ]);

  assert.match(page, /risk-takers-merch-real-v2\.jpg/);
  assert.match(config, /tee-human-in-the-loop-v2\.avif/);
  assert.match(config, /hoodie-zero-trust-high-agency-v2\.avif/);
  assert.match(config, /mug-prompt-injection-fuel-v2\.avif/);
  assert.match(config, /deskmat-attack-surface-v2\.avif/);
  assert.match(config, /sticker-risk-takers-v2\.avif/);
  assert.match(config, /operators-desk-set-v2\.avif/);
  assert.match(page, /loading="lazy"/);
  assert.doesNotMatch(page, /gift-store-hazard|shadow-\[7px_7px/);
});


test('production artwork is built from the approved Risk Takers mark without security clichés', async () => {
  const generator = await readFile('scripts/build_merch_art.py', 'utf8');

  assert.match(generator, /BRAND_LOGO/);
  assert.match(generator, /paste_brand_logo/);
  assert.doesNotMatch(generator, /\b(?:shield|padlock|keyhole|circuit)\b/i);
});


test('legal copy covers both waitlist and live print-on-demand checkout', async () => {
  const [privacy, terms] = await Promise.all([
    readFile('src/pages/Privacy.jsx', 'utf8'),
    readFile('src/pages/Terms.jsx', 'utf8'),
  ]);

  assert.match(privacy, /Merchandise information/);
  assert.match(privacy, /Payment-card details are collected by the checkout provider/);
  assert.match(privacy, /print-on-demand/);
  assert.match(terms, /may operate either as a preview and waitlist or as a live store/);
  assert.match(terms, /made and fulfilled on demand/);
  assert.match(terms, /hosted checkout/);
  assert.match(terms, /giveaway has no cash value/);
});
