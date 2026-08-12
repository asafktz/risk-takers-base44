import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';


const requiredAssets = [
  'public/merch/hero/risk-takers-gift-store-hero.png',
  'public/merch/artwork/human-in-the-loop-print-4500x5400.png',
  'public/merch/artwork/zero-trust-high-agency-print-4500x5400.png',
  'public/merch/artwork/prompt-injection-fuel-mug-print-4800x2000.png',
  'public/merch/artwork/attack-surface-desk-mat-print-6000x2600.png',
  'public/merch/artwork/take-the-risk-sticker-print-3000x3000.png',
];


test('gift store is routed, discoverable, and indexable', async () => {
  const [app, navbar, sitemap] = await Promise.all([
    readFile('src/App.jsx', 'utf8'),
    readFile('src/components/landing/Navbar.jsx', 'utf8'),
    readFile('public/sitemap.xml', 'utf8'),
  ]);

  assert.match(app, /path="\/gift-store"/);
  assert.match(navbar, /Gift Store/);
  assert.match(sitemap, /https:\/\/risktakers\.show\/gift-store/);
});


test('checkout remains visibly gated until Fourthwall is configured', async () => {
  const [page, config] = await Promise.all([
    readFile('src/pages/GiftStore.jsx', 'utf8'),
    readFile('src/config/merch.js', 'utf8'),
  ]);

  assert.match(page, /Checkout at launch/);
  assert.match(page, /disabled/);
  assert.match(config, /VITE_FOURTHWALL_SHOP_DOMAIN/);
  assert.doesNotMatch(config, /sk_live_|pk_live_|Bearer\s+[A-Za-z0-9]/);
});


test('every core product has a print-ready artwork file', async () => {
  await Promise.all(requiredAssets.map((path) => access(path)));
});


test('giveaway guidance uses an eligible single product instead of the retail bundle', async () => {
  const [page, config, brief, listings] = await Promise.all([
    readFile('src/pages/GiftStore.jsx', 'utf8'),
    readFile('src/config/merch.js', 'utf8'),
    readFile('docs/merch-store-launch.md', 'utf8'),
    readFile('docs/fourthwall-product-listings.md', 'utf8'),
  ]);

  assert.match(page, /RECOMMENDED GIVEAWAY[\s\S]*Attack Surface Desk Mat/);
  assert.match(config, /category: 'Retail bundle'/);
  assert.match(config, /details: \['Two-piece retail bundle', 'One bundle checkout', 'May ship separately'\]/);
  assert.match(brief, /bundles cannot be used with giveaway links/i);
  assert.match(listings, /Giveaway eligible:\*\* \*\*No\./);
});


test('merchandise policies disclose seller, payment, fulfillment, and order-data handoff', async () => {
  const [privacy, terms] = await Promise.all([
    readFile('src/pages/Privacy.jsx', 'utf8'),
    readFile('src/pages/Terms.jsx', 'utf8'),
  ]);

  assert.match(privacy, /Merchandise and order information/);
  assert.match(privacy, /Full payment-card details[\s\S]*not collected by Risk Takers/);
  assert.match(terms, /Fourthwall—not Risk Takers—is the seller/);
  assert.match(terms, /made to order/);
  assert.match(terms, /consumer law/);
});
