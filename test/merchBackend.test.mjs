import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import test from 'node:test';

import {
  FOURTHWALL_PRODUCT_MAP,
  MERCH_MODES,
  buildSafePublicConfig,
  createMerchCheckout,
  fetchFourthwallCatalog,
  getConfigurationStatus,
  getMerchServerConfig,
  normalizeCheckoutRequest,
  readRawRequestBody,
  reconcileFourthwallCatalog,
  resolveMerchMode,
  safeTokenEqual,
  validateWebhookEnvelope,
  verifyFourthwallWebhookSignature,
} from '../api/_merch.js';
import { merchProducts } from '../src/config/merch.js';

const SHOP_DOMAIN = 'risk-takers-shop.fourthwall.com';
const SHOP_ID = 'sh_test-risk-takers';

function providerProduct(publicProduct, access = 'HIDDEN') {
  const mapping = FOURTHWALL_PRODUCT_MAP[publicProduct.id];
  assert.equal(mapping.kind, 'direct');
  return {
    id: mapping.providerId,
    name: mapping.providerName,
    slug: mapping.providerSlug,
    state: { type: 'AVAILABLE' },
    access: { type: access },
    variants: [
      {
        id: `variant_${publicProduct.id}`,
        name: `${mapping.providerName} - default`,
        sku: `PRIVATE-SKU-${publicProduct.id}`,
        unitPrice: { value: publicProduct.retailValue, currency: 'USD' },
        unitCost: { value: 1.23, currency: 'USD' },
        creatorDeclaredCost: { value: 2.34, currency: 'USD' },
        attributes: { description: 'Black, One size', color: { name: 'Black' }, size: { name: 'One size' } },
        stock: { type: 'UNLIMITED' },
      },
    ],
  };
}

function providerCatalog(access = 'HIDDEN') {
  return {
    shop: { id: SHOP_ID, name: 'Risk Takers Gift Store', domain: SHOP_DOMAIN, publicDomain: SHOP_DOMAIN },
    products: merchProducts
      .filter((product) => FOURTHWALL_PRODUCT_MAP[product.id].kind === 'direct')
      .map((product) => providerProduct(product, access)),
  };
}

function liveEnv(overrides = {}) {
  return {
    MERCH_MODE: 'live',
    FOURTHWALL_API_USERNAME: 'server-user',
    FOURTHWALL_API_PASSWORD: 'server-password-secret',
    FOURTHWALL_STOREFRONT_TOKEN: 'ptkn_server-only-secret',
    FOURTHWALL_SHOP_DOMAIN: SHOP_DOMAIN,
    FOURTHWALL_WEBHOOK_SECRET: 'webhook-server-only-secret',
    FOURTHWALL_SHOP_ID: SHOP_ID,
    MERCH_PRIVATE_ACCESS_TOKEN: 'private-test-server-only-secret',
    MERCH_ADMIN_TOKEN: 'admin-server-only-secret',
    ...overrides,
  };
}

async function allFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(root, entry.name);
    return entry.isDirectory() ? allFiles(fullPath) : [fullPath];
  }));
  return nested.flat();
}

test('MERCH_MODE defaults and fails closed to waitlist', () => {
  assert.equal(resolveMerchMode(undefined), MERCH_MODES.WAITLIST);
  assert.equal(resolveMerchMode('PRIVATE_TEST'), MERCH_MODES.PRIVATE_TEST);
  assert.equal(resolveMerchMode('live'), MERCH_MODES.LIVE);
  assert.equal(resolveMerchMode('definitely-live'), MERCH_MODES.WAITLIST);
  assert.equal(getMerchServerConfig({ MERCH_MODE: 'typo' }).modeWasValid, false);
});

test('mode readiness reports names of missing variables without values', () => {
  const status = getConfigurationStatus(getMerchServerConfig({ MERCH_MODE: 'live' }));
  assert.equal(status.platformCredentials, false);
  assert.ok(status.missingForMode.includes('FOURTHWALL_API_USERNAME / FOURTHWALL_API_PASSWORD'));
  assert.ok(status.missingForMode.includes('FOURTHWALL_STOREFRONT_TOKEN'));
  assert.ok(status.missingForMode.includes('FOURTHWALL_WEBHOOK_SECRET'));
  assert.doesNotMatch(JSON.stringify(status), /server-password|ptkn_|webhook-server/);
});

test('provider product IDs stay out of browser source', async () => {
  const browserFiles = [
    ...(await allFiles('src')),
    ...(await allFiles('public')).filter((file) => /\.(?:html|js|jsx|json|xml|txt|svg)$/i.test(file)),
  ];
  const browserSource = (await Promise.all(browserFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  for (const mapping of Object.values(FOURTHWALL_PRODUCT_MAP).filter((entry) => entry.kind === 'direct')) {
    assert.doesNotMatch(browserSource, new RegExp(mapping.providerId.replaceAll('-', '\\-')));
  }
  assert.doesNotMatch(browserSource, /1005793e-b740-4a47-ba63-ba74c7c0f652/);
  assert.doesNotMatch(browserSource, /FOURTHWALL_API_PASSWORD|FOURTHWALL_STOREFRONT_TOKEN|FOURTHWALL_WEBHOOK_SECRET/);
});

test('safe public config strips provider IDs, costs, SKUs, tokens, and shop internals', () => {
  const safe = buildSafePublicConfig({
    config: getMerchServerConfig(liveEnv()),
    catalog: providerCatalog('PUBLIC'),
  });
  const serialized = JSON.stringify(safe);
  assert.equal(safe.commerceEnabled, true);
  assert.equal(safe.salesState, 'live');
  assert.equal(safe.products.length, 6);
  assert.match(serialized, /"retailValue":39/);
  assert.doesNotMatch(serialized, /providerId|providerSlug|unitCost|creatorDeclaredCost|PRIVATE-SKU|shopId|publicDomain|ptkn_/);
  for (const mapping of Object.values(FOURTHWALL_PRODUCT_MAP).filter((entry) => entry.kind === 'direct')) {
    assert.ok(!serialized.includes(mapping.providerId));
  }
  const deskSet = safe.products.find((product) => product.id === 'operators-desk-kit');
  assert.equal(deskSet.availability, 'available');
  assert.deepEqual(deskSet.variants, [{
    selection: {},
    availability: 'available',
    retailValue: 77,
    currency: 'USD',
  }]);
  assert.doesNotMatch(serialized, /componentProductIds/);
});

test('authorized private mode exposes one synthetic desk-set option from healthy components', () => {
  const safe = buildSafePublicConfig({
    config: getMerchServerConfig(liveEnv({ MERCH_MODE: 'private_test' })),
    catalog: providerCatalog('PRIVATE'),
    privateAuthorized: true,
  });
  const deskSet = safe.products.find((product) => product.id === 'operators-desk-kit');
  assert.equal(safe.salesState, 'private_test');
  assert.equal(safe.commerceEnabled, true);
  assert.equal(deskSet.variants.length, 1);
  assert.equal(deskSet.variants[0].availability, 'available');
  assert.equal(deskSet.variants[0].retailValue, 77);
});

test('unauthorized private test config remains indistinguishable from waitlist', () => {
  const safe = buildSafePublicConfig({
    config: getMerchServerConfig(liveEnv({ MERCH_MODE: 'private_test' })),
    catalog: providerCatalog('PRIVATE'),
    privateAuthorized: false,
  });
  assert.equal(safe.salesState, 'waitlist');
  assert.equal(safe.commerceEnabled, false);
  assert.ok(safe.products.every((product) => product.availability === 'waitlist' && product.variants.length === 0));
});

test('public commerce fails closed when any live checkout setting is missing or the shop is wrong', () => {
  for (const missing of [
    'FOURTHWALL_STOREFRONT_TOKEN',
    'FOURTHWALL_SHOP_DOMAIN',
    'FOURTHWALL_WEBHOOK_SECRET',
    'FOURTHWALL_SHOP_ID',
  ]) {
    const safe = buildSafePublicConfig({
      config: getMerchServerConfig(liveEnv({ [missing]: '' })),
      catalog: providerCatalog('PUBLIC'),
    });
    assert.equal(safe.salesState, 'waitlist', missing);
    assert.equal(safe.commerceEnabled, false, missing);
    assert.ok(safe.products.every((product) => product.variants.length === 0), missing);
  }

  const wrongShop = providerCatalog('PUBLIC');
  wrongShop.shop.id = 'sh_not-risk-takers';
  wrongShop.shop.domain = 'wrong-shop.fourthwall.com';
  wrongShop.shop.publicDomain = 'wrong-shop.fourthwall.com';
  const safe = buildSafePublicConfig({
    config: getMerchServerConfig(liveEnv()),
    catalog: wrongShop,
  });
  assert.equal(safe.salesState, 'waitlist');
  assert.equal(safe.commerceEnabled, false);
});

test('catalog reads are TTL cached and concurrent requests are coalesced per provider credentials', async () => {
  const catalog = providerCatalog('PUBLIC');
  let calls = 0;
  const requestedUrls = [];
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const mockFetch = async (input) => {
    calls += 1;
    await gate;
    const url = String(input);
    requestedUrls.push(url);
    if (url.endsWith('/shops/current')) return Response.json(catalog.shop);
    const mapping = Object.values(FOURTHWALL_PRODUCT_MAP).find((entry) => url.endsWith(`/products/${entry.providerId}`));
    return Response.json(catalog.products.find((product) => product.id === mapping.providerId));
  };
  const config = getMerchServerConfig(liveEnv());
  const first = fetchFourthwallCatalog(config, mockFetch);
  const concurrent = fetchFourthwallCatalog(config, mockFetch);
  release();
  const [firstCatalog, concurrentCatalog] = await Promise.all([first, concurrent]);
  assert.equal(calls, 6);
  assert.strictEqual(firstCatalog, concurrentCatalog);
  assert.equal(firstCatalog.products.length, 5);
  assert.ok(!requestedUrls.some((url) => url.includes('1005793e-b740-4a47-ba63-ba74c7c0f652')));

  const cached = await fetchFourthwallCatalog(config, mockFetch);
  assert.strictEqual(cached, firstCatalog);
  assert.equal(calls, 6);
});

test('catalog reconciliation enforces mode-specific visibility and retail pricing', () => {
  const waitlistConfig = getMerchServerConfig({ MERCH_MODE: 'waitlist', FOURTHWALL_SHOP_DOMAIN: SHOP_DOMAIN });
  const waitlistHealth = reconcileFourthwallCatalog(providerCatalog('HIDDEN'), waitlistConfig);
  assert.equal(waitlistHealth.healthy, true);
  assert.equal(waitlistHealth.products.find((product) => product.id === 'operators-desk-kit').healthy, true);

  const liveConfig = getMerchServerConfig(liveEnv());
  const hiddenInLive = reconcileFourthwallCatalog(providerCatalog('HIDDEN'), liveConfig);
  assert.equal(hiddenInLive.healthy, false);
  assert.ok(hiddenInLive.products
    .filter((product) => product.id !== 'operators-desk-kit')
    .every((product) => product.issues.includes('access_not_ready_for_mode')));
  assert.deepEqual(
    hiddenInLive.products.find((product) => product.id === 'operators-desk-kit').issues,
    ['component_not_ready'],
  );

  const badPrice = providerCatalog('PUBLIC');
  badPrice.products[0].variants[0].unitPrice.value = 1;
  const priceHealth = reconcileFourthwallCatalog(badPrice, liveConfig);
  assert.equal(priceHealth.healthy, false);
  assert.ok(priceHealth.products[0].issues.includes('retail_price_mismatch'));
  assert.ok(priceHealth.products[0].issues.includes('variant_price_below_retail'));
});

test('synthetic desk-set health depends only on the mug and desk-mat components', () => {
  const config = getMerchServerConfig(liveEnv());
  const brokenNativeBundle = {
    id: '1005793e-b740-4a47-ba63-ba74c7c0f652',
    name: "Operator's Desk Kit",
    slug: 'operators-desk-kit',
    state: { type: 'SOLD_OUT' },
    access: { type: 'PUBLIC' },
    variants: [],
  };
  const catalogWithBrokenBundle = providerCatalog('PUBLIC');
  catalogWithBrokenBundle.products.push(brokenNativeBundle);
  const healthy = reconcileFourthwallCatalog(catalogWithBrokenBundle, config);
  assert.equal(healthy.healthy, true);
  assert.equal(healthy.products.find((product) => product.id === 'operators-desk-kit').healthy, true);
  const serializedHealth = JSON.stringify(healthy);
  assert.doesNotMatch(serializedHealth, /1005793e-b740-4a47-ba63-ba74c7c0f652/);
  for (const mapping of Object.values(FOURTHWALL_PRODUCT_MAP).filter((entry) => entry.kind === 'direct')) {
    assert.ok(!serializedHealth.includes(mapping.providerId));
  }

  const safe = buildSafePublicConfig({ config, catalog: catalogWithBrokenBundle });
  const deskSet = safe.products.find((product) => product.id === 'operators-desk-kit');
  assert.equal(deskSet.variants.length, 1);
  assert.equal(deskSet.variants[0].retailValue, 77);

  for (const componentId of ['prompt-injection-fuel-mug', 'attack-surface-desk-mat']) {
    const unhealthyCatalog = providerCatalog('PUBLIC');
    const mapping = FOURTHWALL_PRODUCT_MAP[componentId];
    unhealthyCatalog.products.find((product) => product.id === mapping.providerId).state = { type: 'SOLD_OUT' };
    const reconciliation = reconcileFourthwallCatalog(unhealthyCatalog, config);
    const deskSet = reconciliation.products.find((product) => product.id === 'operators-desk-kit');
    assert.equal(deskSet.healthy, false, componentId);
    assert.deepEqual(deskSet.issues, ['component_not_ready']);
  }

  const soldOutBaseCatalog = providerCatalog('PUBLIC');
  const mugMapping = FOURTHWALL_PRODUCT_MAP['prompt-injection-fuel-mug'];
  const soldOutBaseMug = soldOutBaseCatalog.products.find((product) => product.id === mugMapping.providerId);
  soldOutBaseMug.variants[0].stock = { type: 'LIMITED', inStock: 0 };
  soldOutBaseMug.variants.push({
    ...structuredClone(soldOutBaseMug.variants[0]),
    id: 'variant_prompt-injection-fuel-mug_surcharge',
    unitPrice: { value: 30, currency: 'USD' },
    stock: { type: 'UNLIMITED' },
  });
  const soldOutBaseHealth = reconcileFourthwallCatalog(soldOutBaseCatalog, config);
  assert.equal(soldOutBaseHealth.products.find((product) => product.id === 'prompt-injection-fuel-mug').healthy, true);
  assert.deepEqual(
    soldOutBaseHealth.products.find((product) => product.id === 'operators-desk-kit').issues,
    ['component_variant_not_ready'],
  );
  assert.equal(buildSafePublicConfig({ config, catalog: soldOutBaseCatalog }).commerceEnabled, false);

  const ambiguousCatalog = providerCatalog('PUBLIC');
  const ambiguousMug = ambiguousCatalog.products.find((product) => product.id === mugMapping.providerId);
  ambiguousMug.variants.push({
    ...structuredClone(ambiguousMug.variants[0]),
    id: 'variant_prompt-injection-fuel-mug_second-base',
  });
  const ambiguousHealth = reconcileFourthwallCatalog(ambiguousCatalog, config);
  assert.equal(ambiguousHealth.products.find((product) => product.id === 'prompt-injection-fuel-mug').healthy, true);
  assert.deepEqual(
    ambiguousHealth.products.find((product) => product.id === 'operators-desk-kit').issues,
    ['component_variant_not_ready'],
  );

  const missingVariantIdCatalog = providerCatalog('PUBLIC');
  const missingVariantIdMug = missingVariantIdCatalog.products.find((product) => product.id === mugMapping.providerId);
  missingVariantIdMug.variants[0].id = '';
  const missingVariantIdHealth = reconcileFourthwallCatalog(missingVariantIdCatalog, config);
  assert.equal(missingVariantIdHealth.products.find((product) => product.id === 'prompt-injection-fuel-mug').healthy, true);
  assert.deepEqual(
    missingVariantIdHealth.products.find((product) => product.id === 'operators-desk-kit').issues,
    ['component_variant_not_ready'],
  );
  assert.equal(buildSafePublicConfig({ config, catalog: missingVariantIdCatalog }).commerceEnabled, false);
});

test('checkout validation accepts only local product slugs and bounded quantities', () => {
  assert.deepEqual(normalizeCheckoutRequest({
    items: [{ productId: 'human-in-the-loop-tee', quantity: 2, selection: { size: 'L', color: 'Black' } }],
  }), {
    currency: 'USD',
    items: [{ productId: 'human-in-the-loop-tee', quantity: 2, selection: { size: 'L', color: 'Black' } }],
  });
  assert.throws(() => normalizeCheckoutRequest({ items: [{ productId: 'not-a-product' }] }), /valid Risk Takers product/);
  assert.throws(() => normalizeCheckoutRequest({ items: [{ productId: 'human-in-the-loop-tee', quantity: 99 }] }), /quantity between 1 and 5/);
  assert.throws(() => normalizeCheckoutRequest({ items: [{ productId: 'human-in-the-loop-tee', selection: { providerId: 'x' } }] }), /valid product option/);
});

test('waitlist and private test checkout gates fail before calling Fourthwall', async () => {
  let calls = 0;
  const neverFetch = async () => { calls += 1; throw new Error('must not run'); };
  await assert.rejects(
    createMerchCheckout({ items: [{ productId: 'risk-takers-logo-sticker' }] }, { headers: {} }, { MERCH_MODE: 'waitlist' }, neverFetch),
    (error) => error.code === 'MERCH_WAITLIST_ONLY' && error.status === 409,
  );
  await assert.rejects(
    createMerchCheckout(
      { items: [{ productId: 'risk-takers-logo-sticker' }] },
      { headers: {} },
      liveEnv({ MERCH_MODE: 'private_test' }),
      neverFetch,
    ),
    (error) => error.code === 'PRIVATE_TEST_AUTH_REQUIRED' && error.status === 401,
  );
  assert.equal(calls, 0);
});

test('live checkout fails before provider calls when full commerce configuration is incomplete', async () => {
  for (const missing of [
    'FOURTHWALL_STOREFRONT_TOKEN',
    'FOURTHWALL_SHOP_DOMAIN',
    'FOURTHWALL_WEBHOOK_SECRET',
    'FOURTHWALL_SHOP_ID',
  ]) {
    let calls = 0;
    await assert.rejects(
      createMerchCheckout(
        { items: [{ productId: 'risk-takers-logo-sticker' }] },
        { headers: {} },
        liveEnv({ [missing]: '' }),
        async () => { calls += 1; throw new Error('must not run'); },
      ),
      (error) => error.code === 'MERCH_CHECKOUT_NOT_CONFIGURED' && error.status === 503,
    );
    assert.equal(calls, 0, missing);
  }
});

test('live checkout resolves private mappings server-side and returns only a hosted checkout URL', async () => {
  const catalog = providerCatalog('PUBLIC');
  const requestedUrls = [];
  const mockFetch = async (input, init = {}) => {
    const url = String(input);
    requestedUrls.push(url);
    if (url.endsWith('/shops/current')) return Response.json(catalog.shop);
    const mapping = Object.values(FOURTHWALL_PRODUCT_MAP).find((entry) => url.endsWith(`/products/${entry.providerId}`));
    if (mapping) return Response.json(catalog.products.find((product) => product.id === mapping.providerId));
    if (url.startsWith('https://storefront-api.fourthwall.com/v1/carts?')) {
      const submitted = JSON.parse(init.body);
      assert.deepEqual(submitted.items, [{ variantId: 'variant_risk-takers-logo-sticker', quantity: 2 }]);
      assert.equal(submitted.metadata.merch_mode, 'live');
      return Response.json({ id: 'cart_123456789', items: submitted.items });
    }
    return new Response('not found', { status: 404 });
  };

  const result = await createMerchCheckout(
    {
      items: [{
        productId: 'risk-takers-logo-sticker',
        quantity: 2,
        selection: { color: 'Black', size: 'One size' },
      }],
    },
    { headers: {} },
    liveEnv(),
    mockFetch,
  );
  const serialized = JSON.stringify(result);
  assert.equal(result.itemCount, 2);
  assert.match(result.checkoutUrl, /^https:\/\/risk-takers-shop\.fourthwall\.com\/cart\/checkout\?/);
  assert.match(result.checkoutUrl, /cartId=cart_123456789/);
  assert.ok(requestedUrls.some((url) => url.includes('storefront_token=ptkn_server-only-secret')));
  assert.doesNotMatch(serialized, /ptkn_server-only-secret|server-password-secret|variant_risk-takers|a59b182f|unitCost|creatorDeclaredCost/);
});

test('desk-set checkout expands one local line into mug and desk-mat provider variants', async () => {
  const catalog = providerCatalog('PUBLIC');
  const requestedUrls = [];
  let submittedCart;
  const mockFetch = async (input, init = {}) => {
    const url = String(input);
    requestedUrls.push(url);
    if (url.endsWith('/shops/current')) return Response.json(catalog.shop);
    const mapping = Object.values(FOURTHWALL_PRODUCT_MAP)
      .filter((entry) => entry.kind === 'direct')
      .find((entry) => url.endsWith(`/products/${entry.providerId}`));
    if (mapping) return Response.json(catalog.products.find((product) => product.id === mapping.providerId));
    if (url.startsWith('https://storefront-api.fourthwall.com/v1/carts?')) {
      submittedCart = JSON.parse(init.body);
      return Response.json({ id: 'cart_set_123456789', items: submittedCart.items });
    }
    return new Response('not found', { status: 404 });
  };

  const result = await createMerchCheckout(
    { items: [{ productId: 'operators-desk-kit', quantity: 5, selection: {} }] },
    { headers: {} },
    liveEnv(),
    mockFetch,
  );

  assert.deepEqual(submittedCart.items, [
    { variantId: 'variant_prompt-injection-fuel-mug', quantity: 5 },
    { variantId: 'variant_attack-surface-desk-mat', quantity: 5 },
  ]);
  assert.equal(submittedCart.items.reduce((sum, item) => sum + item.quantity, 0), 10);
  assert.equal(result.itemCount, 5);
  assert.match(result.checkoutUrl, /cartId=cart_set_123456789/);
  assert.equal(requestedUrls.filter((url) => url.startsWith('https://api.fourthwall.com/')).length, 6);
  assert.ok(!requestedUrls.some((url) => url.includes('1005793e-b740-4a47-ba63-ba74c7c0f652')));
  assert.doesNotMatch(JSON.stringify(result), /variant_prompt|variant_attack|e9b888e4|7384f894|ptkn_/);
});

test('desk-set expansion enforces physical-unit and consolidated-line limits', async () => {
  const catalog = providerCatalog('PUBLIC');
  let cartCalls = 0;
  const mockFetch = async (input) => {
    const url = String(input);
    if (url.endsWith('/shops/current')) return Response.json(catalog.shop);
    const mapping = Object.values(FOURTHWALL_PRODUCT_MAP)
      .filter((entry) => entry.kind === 'direct')
      .find((entry) => url.endsWith(`/products/${entry.providerId}`));
    if (mapping) return Response.json(catalog.products.find((product) => product.id === mapping.providerId));
    cartCalls += 1;
    return Response.json({ id: 'cart_must-not-exist' });
  };

  await assert.rejects(
    createMerchCheckout(
      {
        items: [
          { productId: 'operators-desk-kit', quantity: 5 },
          { productId: 'risk-takers-logo-sticker', quantity: 1, selection: { color: 'Black', size: 'One size' } },
        ],
      },
      { headers: {} },
      liveEnv(),
      mockFetch,
    ),
    (error) => error.code === 'CART_TOO_LARGE' && error.status === 400,
  );
  assert.equal(cartCalls, 0);

  await assert.rejects(
    createMerchCheckout(
      {
        items: [
          { productId: 'operators-desk-kit', quantity: 5 },
          { productId: 'prompt-injection-fuel-mug', quantity: 1, selection: { color: 'Black', size: 'One size' } },
        ],
      },
      { headers: {} },
      liveEnv(),
      mockFetch,
    ),
    (error) => error.code === 'INVALID_QUANTITY' && error.status === 400,
  );
  assert.equal(cartCalls, 0);

  await assert.rejects(
    createMerchCheckout(
      { items: [{ productId: 'operators-desk-kit', selection: { description: 'provider bundle' } }] },
      { headers: {} },
      liveEnv(),
      mockFetch,
    ),
    (error) => error.code === 'VARIANT_NOT_AVAILABLE' && error.status === 400,
  );
  assert.equal(cartCalls, 0);
});

test('live checkout refuses a catalog returned for a different Fourthwall shop', async () => {
  const catalog = providerCatalog('PUBLIC');
  catalog.shop.id = 'sh_wrong-shop';
  catalog.shop.domain = 'wrong-shop.fourthwall.com';
  catalog.shop.publicDomain = 'wrong-shop.fourthwall.com';
  let cartCalls = 0;
  const mockFetch = async (input) => {
    const url = String(input);
    if (url.endsWith('/shops/current')) return Response.json(catalog.shop);
    const mapping = Object.values(FOURTHWALL_PRODUCT_MAP).find((entry) => url.endsWith(`/products/${entry.providerId}`));
    if (mapping) return Response.json(catalog.products.find((product) => product.id === mapping.providerId));
    cartCalls += 1;
    return Response.json({ id: 'cart_must-not-exist' });
  };

  await assert.rejects(
    createMerchCheckout(
      { items: [{ productId: 'risk-takers-logo-sticker', selection: { color: 'Black', size: 'One size' } }] },
      { headers: {} },
      liveEnv(),
      mockFetch,
    ),
    (error) => error.code === 'CATALOG_NOT_READY' && error.status === 409,
  );
  assert.equal(cartCalls, 0);
});

test('webhook signatures use raw-body HMAC-SHA256 and envelope shop checks', async () => {
  const secret = 'fourthwall-webhook-secret';
  const event = {
    id: 'weve_test',
    webhookId: 'wcon_test',
    shopId: SHOP_ID,
    type: 'ORDER_PLACED',
    apiVersion: 'V1',
    createdAt: '2026-08-13T00:00:00Z',
    testMode: true,
    data: { email: 'must-not-be-logged@example.com' },
  };
  const raw = Buffer.from(JSON.stringify(event));
  const signature = createHmac('sha256', secret).update(raw).digest('base64');
  assert.equal(verifyFourthwallWebhookSignature(raw, signature, secret), true);
  assert.equal(verifyFourthwallWebhookSignature(Buffer.from(`${raw} `), signature, secret), false);
  assert.equal(safeTokenEqual('same', 'same'), true);
  assert.equal(safeTokenEqual('same', 'different'), false);

  assert.equal(validateWebhookEnvelope(event, { expectedShopId: SHOP_ID }).type, 'ORDER_PLACED');
  assert.throws(() => validateWebhookEnvelope(event, { expectedShopId: 'sh_wrong' }), /shop does not match/);
  assert.equal(await readRawRequestBody({ body: event }), null);
  assert.deepEqual(await readRawRequestBody({ rawBody: raw }), raw);

  const restoredStream = Readable.from([
    raw.subarray(0, 17),
    raw.subarray(17),
  ]);
  // Vercel's Node helper exposes a parsed body getter before restoring the
  // original request stream. The raw reader must consume the stream first.
  Object.defineProperty(restoredStream, 'body', { get: () => event });
  const streamedBody = await readRawRequestBody(restoredStream);
  assert.deepEqual(streamedBody, raw);
  assert.equal(verifyFourthwallWebhookSignature(streamedBody, signature, secret), true);
});
