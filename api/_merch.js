import {
  createHash,
  createHmac,
  timingSafeEqual,
} from 'node:crypto';

import { merchProducts } from '../src/config/merch.js';

const PLATFORM_API_BASE = 'https://api.fourthwall.com/open-api/v1.0';
const STOREFRONT_API_BASE = 'https://storefront-api.fourthwall.com/v1';
const PROVIDER_TIMEOUT_MS = 8_000;
const CATALOG_CACHE_TTL_MS = 30_000;
const MAX_CHECKOUT_LINES = 10;
const MAX_LINE_QUANTITY = 5;
const MAX_TOTAL_QUANTITY = 10;

export const MERCH_MODES = Object.freeze({
  WAITLIST: 'waitlist',
  PRIVATE_TEST: 'private_test',
  LIVE: 'live',
});

// Server-only mapping. Nothing under src/ imports this module, so these Fourthwall
// identifiers never enter the Vite browser bundle.
export const FOURTHWALL_PRODUCT_MAP = Object.freeze({
  'human-in-the-loop-tee': Object.freeze({
    providerId: 'a59b182f-02b8-4703-989c-1c59701eed8e',
    providerSlug: 'human-in-the-loop-tee',
    providerName: 'Human in the Loop Tee',
  }),
  'zero-trust-high-agency-hoodie': Object.freeze({
    providerId: 'afe610ca-33ff-4322-a9a0-38564bac7165',
    providerSlug: 'zero-trust-high-agency-hoodie',
    providerName: 'Zero Trust / High Agency Hoodie',
  }),
  'prompt-injection-fuel-mug': Object.freeze({
    providerId: 'e9b888e4-d70e-41ab-91e8-6b3e033c48d6',
    providerSlug: 'prompt-injection-fuel-mug',
    providerName: 'Prompt Injection Fuel Mug',
  }),
  'attack-surface-desk-mat': Object.freeze({
    providerId: '7384f894-1818-42fd-a813-9c734a30df3c',
    providerSlug: 'attack-surface-desk-mat',
    providerName: 'Attack Surface Desk Mat',
  }),
  'risk-takers-logo-sticker': Object.freeze({
    providerId: 'c572a824-9f8e-4939-8722-df3780e910ba',
    providerSlug: 'risk-takers-logo-sticker',
    providerName: 'Risk Takers Logo Sticker',
  }),
  'operators-desk-kit': Object.freeze({
    providerId: '1005793e-b740-4a47-ba63-ba74c7c0f652',
    providerSlug: 'operators-desk-kit',
    providerName: "Operator's Desk Kit",
  }),
});

const PUBLIC_PRODUCT_BY_ID = new Map(merchProducts.map((product) => [product.id, product]));
// Each fetch implementation gets an isolated cache. In production this means one
// small per-instance cache for global fetch; in tests it prevents mock catalogs
// from leaking between cases. Rejected provider calls are never cached.
const catalogCacheByFetcher = new WeakMap();
const catalogRequestByFetcher = new WeakMap();

export class MerchServiceError extends Error {
  constructor(status, code, publicMessage, details) {
    super(publicMessage);
    this.name = 'MerchServiceError';
    this.status = status;
    this.code = code;
    this.publicMessage = publicMessage;
    this.details = details;
  }
}

function serviceError(status, code, publicMessage, details) {
  return new MerchServiceError(status, code, publicMessage, details);
}

export function resolveMerchMode(rawMode) {
  const normalized = String(rawMode || '').trim().toLowerCase();
  if (!normalized) return MERCH_MODES.WAITLIST;
  if (Object.values(MERCH_MODES).includes(normalized)) return normalized;
  // A typo must never open commerce.
  return MERCH_MODES.WAITLIST;
}

export function normalizeShopDomain(rawDomain) {
  const value = String(rawDomain || '').trim();
  if (!value) return null;

  let url;
  try {
    url = new URL(value.includes('://') ? value : `https://${value}`);
  } catch {
    return null;
  }

  if (
    url.protocol !== 'https:'
    || url.username
    || url.password
    || url.port
    || (url.pathname && url.pathname !== '/')
    || url.search
    || url.hash
    || !url.hostname.includes('.')
    || url.hostname === 'localhost'
  ) {
    return null;
  }

  return url.hostname.toLowerCase();
}

export function getMerchServerConfig(env = process.env) {
  const rawMode = String(env.MERCH_MODE || '').trim().toLowerCase();
  const mode = resolveMerchMode(rawMode);
  const modeWasValid = !rawMode || Object.values(MERCH_MODES).includes(rawMode);

  return {
    mode,
    modeWasValid,
    platformUsername: String(env.FOURTHWALL_API_USERNAME || '').trim(),
    platformPassword: String(env.FOURTHWALL_API_PASSWORD || ''),
    storefrontToken: String(env.FOURTHWALL_STOREFRONT_TOKEN || '').trim(),
    shopDomain: normalizeShopDomain(env.FOURTHWALL_SHOP_DOMAIN),
    webhookSecret: String(env.FOURTHWALL_WEBHOOK_SECRET || ''),
    expectedShopId: String(env.FOURTHWALL_SHOP_ID || '').trim(),
    privateAccessToken: String(env.MERCH_PRIVATE_ACCESS_TOKEN || ''),
    adminToken: String(env.MERCH_ADMIN_TOKEN || ''),
  };
}

export function getConfigurationStatus(config) {
  const platformCredentials = Boolean(config.platformUsername && config.platformPassword);
  const storefrontToken = Boolean(config.storefrontToken);
  const shopDomain = Boolean(config.shopDomain);
  const webhookSecret = Boolean(config.webhookSecret);
  const expectedShopId = Boolean(config.expectedShopId);
  const privateAccessToken = Boolean(config.privateAccessToken);
  const adminToken = Boolean(config.adminToken);

  const missingForMode = [];
  if (!config.modeWasValid) missingForMode.push('MERCH_MODE (invalid value; failed closed to waitlist)');
  if (!platformCredentials) missingForMode.push('FOURTHWALL_API_USERNAME / FOURTHWALL_API_PASSWORD');
  if (config.mode !== MERCH_MODES.WAITLIST && !storefrontToken) missingForMode.push('FOURTHWALL_STOREFRONT_TOKEN');
  if (config.mode !== MERCH_MODES.WAITLIST && !shopDomain) missingForMode.push('FOURTHWALL_SHOP_DOMAIN');
  if (config.mode === MERCH_MODES.PRIVATE_TEST && !privateAccessToken) missingForMode.push('MERCH_PRIVATE_ACCESS_TOKEN');
  if (config.mode === MERCH_MODES.LIVE && !webhookSecret) missingForMode.push('FOURTHWALL_WEBHOOK_SECRET');
  if (config.mode === MERCH_MODES.LIVE && !expectedShopId) missingForMode.push('FOURTHWALL_SHOP_ID');

  return {
    platformCredentials,
    storefrontToken,
    shopDomain,
    webhookSecret,
    expectedShopId,
    privateAccessToken,
    adminToken,
    missingForMode,
  };
}

function stableSecretDigest(value) {
  return createHash('sha256').update(String(value || ''), 'utf8').digest();
}

export function safeTokenEqual(actual, expected) {
  if (!actual || !expected) return false;
  return timingSafeEqual(stableSecretDigest(actual), stableSecretDigest(expected));
}

export function getBearerToken(req) {
  const authorization = String(req?.headers?.authorization || req?.headers?.Authorization || '');
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match ? match[1].trim() : '';
}

export function isPrivateTestAuthorized(req, config) {
  return Boolean(config.privateAccessToken) && safeTokenEqual(getBearerToken(req), config.privateAccessToken);
}

export function isAdminAuthorized(req, config) {
  return Boolean(config.adminToken) && safeTokenEqual(getBearerToken(req), config.adminToken);
}

async function providerJson(url, init, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(url, {
      ...init,
      signal: init?.signal || AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
  } catch (error) {
    console.error('Fourthwall request failed', { cause: error?.name || 'unknown' });
    throw serviceError(502, 'MERCH_PROVIDER_UNREACHABLE', 'Merch fulfillment is temporarily unavailable.');
  }

  if (!response.ok) {
    // Do not surface provider response bodies: product IDs, SKUs, costs, or other
    // internal catalog data can appear in Fourthwall error payloads.
    console.error('Fourthwall request returned an error', { status: response.status });
    throw serviceError(502, 'MERCH_PROVIDER_ERROR', 'Merch fulfillment is temporarily unavailable.');
  }

  try {
    return await response.json();
  } catch {
    throw serviceError(502, 'MERCH_PROVIDER_INVALID_RESPONSE', 'Merch fulfillment is temporarily unavailable.');
  }
}

function platformAuthorization(config) {
  if (!config.platformUsername || !config.platformPassword) {
    throw serviceError(503, 'MERCH_PLATFORM_NOT_CONFIGURED', 'Merch fulfillment is not configured.');
  }
  return `Basic ${Buffer.from(`${config.platformUsername}:${config.platformPassword}`, 'utf8').toString('base64')}`;
}

async function platformGet(path, config, fetchImpl) {
  return providerJson(`${PLATFORM_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Authorization: platformAuthorization(config),
      Accept: 'application/json',
    },
  }, fetchImpl);
}

async function fetchFourthwallCatalogUncached(config, fetchImpl) {
  const mappedProducts = Object.values(FOURTHWALL_PRODUCT_MAP);
  const [shop, ...products] = await Promise.all([
    platformGet('/shops/current', config, fetchImpl),
    ...mappedProducts.map((mapping) => (
      platformGet(`/products/${encodeURIComponent(mapping.providerId)}`, config, fetchImpl)
    )),
  ]);

  return { shop, products };
}

function catalogCacheKey(config) {
  return createHash('sha256').update(JSON.stringify([
    config.platformUsername,
    config.platformPassword,
    config.shopDomain,
    config.expectedShopId,
  ]), 'utf8').digest('hex');
}

function bucketFor(store, fetchImpl) {
  let bucket = store.get(fetchImpl);
  if (!bucket) {
    bucket = new Map();
    store.set(fetchImpl, bucket);
  }
  return bucket;
}

export async function fetchFourthwallCatalog(
  config,
  fetchImpl = fetch,
  { cache = true, now = () => Date.now() } = {},
) {
  if (!cache) return fetchFourthwallCatalogUncached(config, fetchImpl);

  const key = catalogCacheKey(config);
  const cacheBucket = bucketFor(catalogCacheByFetcher, fetchImpl);
  const requestBucket = bucketFor(catalogRequestByFetcher, fetchImpl);
  const currentTime = now();
  const cached = cacheBucket.get(key);
  if (cached && cached.expiresAt > currentTime) return cached.catalog;

  const pending = requestBucket.get(key);
  if (pending) return pending;

  const request = fetchFourthwallCatalogUncached(config, fetchImpl)
    .then((catalog) => {
      cacheBucket.set(key, { catalog, expiresAt: now() + CATALOG_CACHE_TTL_MS });
      return catalog;
    })
    .finally(() => requestBucket.delete(key));
  requestBucket.set(key, request);
  return request;
}

function upperType(value) {
  return String(value?.type || value || '').trim().toUpperCase();
}

function moneyToCents(money) {
  const value = Number(money?.value);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

function expectedAccessForMode(mode) {
  if (mode === MERCH_MODES.LIVE) return new Set(['PUBLIC']);
  if (mode === MERCH_MODES.PRIVATE_TEST) return new Set(['PRIVATE', 'PUBLIC']);
  return new Set(['HIDDEN', 'PRIVATE']);
}

function variantIsAvailable(variant) {
  const stockType = upperType(variant?.stock);
  if (stockType === 'LIMITED') return Number(variant?.stock?.inStock) > 0;
  return stockType === 'UNLIMITED' || !stockType;
}

function getVariantSelection(variant) {
  const attributes = variant?.attributes || {};
  const selection = {};
  const color = String(attributes?.color?.name || '').trim();
  const size = String(attributes?.size?.name || '').trim();
  const description = String(attributes?.description || '').trim();
  if (color) selection.color = color;
  if (size) selection.size = size;
  if (description) selection.description = description;
  return selection;
}

function reconcileOneProduct(publicProduct, mapping, providerProduct, mode) {
  const issues = [];
  const warnings = [];
  if (!providerProduct) {
    issues.push('missing_product');
    return {
      id: publicProduct.id,
      healthy: false,
      availability: 'missing',
      access: 'missing',
      variantCount: 0,
      retailValue: publicProduct.retailValue,
      issues,
      warnings,
    };
  }

  if (String(providerProduct.slug || '') !== mapping.providerSlug) issues.push('slug_mismatch');
  if (String(providerProduct.name || '') !== mapping.providerName) warnings.push('name_mismatch');

  const access = upperType(providerProduct.access);
  const state = upperType(providerProduct.state);
  if (!expectedAccessForMode(mode).has(access)) issues.push('access_not_ready_for_mode');
  if (state !== 'AVAILABLE') issues.push('product_not_available');

  const variants = Array.isArray(providerProduct.variants) ? providerProduct.variants : [];
  if (!variants.length) issues.push('missing_variants');

  const currencyMismatch = variants.some((variant) => String(variant?.unitPrice?.currency || '').toUpperCase() !== 'USD');
  if (currencyMismatch) issues.push('currency_mismatch');

  const prices = variants
    .map((variant) => moneyToCents(variant?.unitPrice))
    .filter((price) => price !== null);
  const expectedCents = Math.round(publicProduct.retailValue * 100);
  if (!prices.length || Math.min(...prices) !== expectedCents) issues.push('retail_price_mismatch');
  if (prices.some((price) => price < expectedCents)) issues.push('variant_price_below_retail');
  if (prices.some((price) => price > expectedCents)) warnings.push('variant_price_surcharge');
  if (!variants.some(variantIsAvailable)) issues.push('all_variants_unavailable');

  return {
    id: publicProduct.id,
    healthy: issues.length === 0,
    availability: state ? state.toLowerCase() : 'unknown',
    access: access ? access.toLowerCase() : 'unknown',
    variantCount: variants.length,
    retailValue: publicProduct.retailValue,
    issues: [...new Set(issues)],
    warnings: [...new Set(warnings)],
  };
}

function normalizeProviderShopDomain(shop) {
  return normalizeShopDomain(shop?.publicDomain) || normalizeShopDomain(shop?.domain);
}

export function reconcileFourthwallCatalog(catalog, config) {
  const providerProducts = new Map((catalog?.products || []).map((product) => [product?.id, product]));
  const products = merchProducts.map((publicProduct) => {
    const mapping = FOURTHWALL_PRODUCT_MAP[publicProduct.id];
    return reconcileOneProduct(
      publicProduct,
      mapping,
      providerProducts.get(mapping.providerId),
      config.mode,
    );
  });

  const shopDomainMatches = !config.shopDomain
    || normalizeProviderShopDomain(catalog?.shop) === config.shopDomain;
  const shopIdMatches = !config.expectedShopId
    || String(catalog?.shop?.id || '') === config.expectedShopId;

  return {
    healthy: products.every((product) => product.healthy) && shopDomainMatches && shopIdMatches,
    shopDomainMatches,
    shopIdMatches,
    products,
  };
}

function safeVariant(variant) {
  return {
    selection: getVariantSelection(variant),
    availability: variantIsAvailable(variant) ? 'available' : 'sold_out',
    retailValue: Number(variant?.unitPrice?.value),
    currency: String(variant?.unitPrice?.currency || 'USD').toUpperCase(),
  };
}

export function buildSafePublicConfig({
  config,
  catalog = null,
  privateAuthorized = false,
}) {
  const mode = config?.mode || MERCH_MODES.WAITLIST;
  const publicMode = mode === MERCH_MODES.LIVE || (mode === MERCH_MODES.PRIVATE_TEST && privateAuthorized)
    ? mode
    : MERCH_MODES.WAITLIST;
  const configuration = config ? getConfigurationStatus(config) : null;
  const reconciliation = catalog && config
    ? reconcileFourthwallCatalog(catalog, { ...config, mode: publicMode })
    : null;
  const commerceEnabled = publicMode !== MERCH_MODES.WAITLIST
    && configuration?.missingForMode.length === 0
    && Boolean(reconciliation?.healthy);
  const providerProducts = new Map((catalog?.products || []).map((product) => [product?.id, product]));
  const healthById = new Map((reconciliation?.products || []).map((product) => [product.id, product]));

  return {
    version: 1,
    salesState: commerceEnabled ? publicMode : MERCH_MODES.WAITLIST,
    commerceEnabled,
    currency: 'USD',
    products: merchProducts.map((product) => {
      const mapping = FOURTHWALL_PRODUCT_MAP[product.id];
      const providerProduct = providerProducts.get(mapping.providerId);
      const health = healthById.get(product.id);
      const variants = commerceEnabled && health?.healthy
        ? (providerProduct?.variants || []).map(safeVariant)
        : [];

      return {
        id: product.id,
        name: product.name,
        shortName: product.shortName,
        category: product.category,
        retailValue: product.retailValue,
        availability: commerceEnabled && health?.healthy ? 'available' : 'waitlist',
        variants,
      };
    }),
  };
}

function normalizeSelection(selection) {
  if (selection === undefined || selection === null) return {};
  if (typeof selection !== 'object' || Array.isArray(selection)) {
    throw serviceError(400, 'INVALID_VARIANT_SELECTION', 'Choose a valid product option.');
  }
  const allowed = new Set(['color', 'size', 'description']);
  const normalized = {};
  for (const [key, rawValue] of Object.entries(selection)) {
    if (!allowed.has(key)) throw serviceError(400, 'INVALID_VARIANT_SELECTION', 'Choose a valid product option.');
    const value = String(rawValue || '').trim();
    if (!value || value.length > 80) throw serviceError(400, 'INVALID_VARIANT_SELECTION', 'Choose a valid product option.');
    normalized[key] = value;
  }
  return normalized;
}

export function normalizeCheckoutRequest(body) {
  const rawItems = body?.items;
  if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > MAX_CHECKOUT_LINES) {
    throw serviceError(400, 'INVALID_CART', 'Choose between 1 and 10 products.');
  }

  let totalQuantity = 0;
  const items = rawItems.map((rawItem) => {
    const productId = String(rawItem?.productId || '').trim();
    if (!PUBLIC_PRODUCT_BY_ID.has(productId)) {
      throw serviceError(400, 'UNKNOWN_PRODUCT', 'Choose a valid Risk Takers product.');
    }
    const quantity = Number(rawItem?.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      throw serviceError(400, 'INVALID_QUANTITY', 'Choose a quantity between 1 and 5.');
    }
    totalQuantity += quantity;
    return {
      productId,
      quantity,
      selection: normalizeSelection(rawItem?.selection),
    };
  });

  if (totalQuantity > MAX_TOTAL_QUANTITY) {
    throw serviceError(400, 'CART_TOO_LARGE', 'Choose no more than 10 total items.');
  }

  const currency = String(body?.currency || 'USD').trim().toUpperCase();
  if (currency !== 'USD') throw serviceError(400, 'UNSUPPORTED_CURRENCY', 'Risk Takers checkout currently uses USD.');
  return { items, currency };
}

function selectionMatches(variant, selection) {
  const candidate = getVariantSelection(variant);
  return Object.entries(selection).every(([key, value]) => (
    String(candidate[key] || '').localeCompare(value, undefined, { sensitivity: 'accent' }) === 0
  ));
}

function chooseVariant(providerProduct, item, publicProduct) {
  const availableVariants = (providerProduct?.variants || []).filter(variantIsAvailable);
  const selected = Object.keys(item.selection).length
    ? availableVariants.filter((variant) => selectionMatches(variant, item.selection))
    : availableVariants;

  if (!Object.keys(item.selection).length && selected.length > 1) {
    throw serviceError(400, 'VARIANT_SELECTION_REQUIRED', 'Choose a size or product option.', {
      productId: item.productId,
      choices: selected.map((variant) => getVariantSelection(variant)),
    });
  }
  if (selected.length !== 1) {
    throw serviceError(400, 'VARIANT_NOT_AVAILABLE', 'That product option is not available.');
  }

  const variant = selected[0];
  const variantPrice = moneyToCents(variant?.unitPrice);
  const expectedPrice = Math.round(publicProduct.retailValue * 100);
  if (
    String(variant?.unitPrice?.currency || '').toUpperCase() !== 'USD'
    || variantPrice === null
    || variantPrice < expectedPrice
  ) {
    throw serviceError(409, 'CATALOG_PRICE_MISMATCH', 'This item is being updated. Please try again later.');
  }
  return variant;
}

function resolveProviderCartItems(request, catalog, config) {
  const reconciliation = reconcileFourthwallCatalog(catalog, config);
  if (!reconciliation.healthy) {
    throw serviceError(409, 'CATALOG_NOT_READY', 'The merch catalog is being updated. Please try again later.');
  }

  const providerProducts = new Map((catalog.products || []).map((product) => [product?.id, product]));
  const consolidated = new Map();
  for (const item of request.items) {
    const publicProduct = PUBLIC_PRODUCT_BY_ID.get(item.productId);
    const mapping = FOURTHWALL_PRODUCT_MAP[item.productId];
    const providerProduct = providerProducts.get(mapping.providerId);
    const variant = chooseVariant(providerProduct, item, publicProduct);
    const prior = consolidated.get(variant.id) || 0;
    const nextQuantity = prior + item.quantity;
    if (nextQuantity > MAX_LINE_QUANTITY) {
      throw serviceError(400, 'INVALID_QUANTITY', 'Choose a quantity between 1 and 5 per product option.');
    }
    consolidated.set(variant.id, nextQuantity);
  }

  return [...consolidated.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}

async function createFourthwallCart(items, currency, config, fetchImpl) {
  if (!config.storefrontToken || !config.shopDomain) {
    throw serviceError(503, 'MERCH_CHECKOUT_NOT_CONFIGURED', 'Merch checkout is not configured.');
  }
  const url = new URL(`${STOREFRONT_API_BASE}/carts`);
  url.searchParams.set('storefront_token', config.storefrontToken);
  url.searchParams.set('currency', currency);
  return providerJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      items,
      metadata: {
        cart_origin: 'risktakers_show',
        merch_mode: config.mode,
      },
    }),
  }, fetchImpl);
}

export async function createMerchCheckout(body, req, env = process.env, fetchImpl = fetch) {
  const config = getMerchServerConfig(env);
  if (config.mode === MERCH_MODES.WAITLIST) {
    throw serviceError(409, 'MERCH_WAITLIST_ONLY', 'Merch checkout is not open yet.');
  }
  if (config.mode === MERCH_MODES.PRIVATE_TEST && !isPrivateTestAuthorized(req, config)) {
    throw serviceError(401, 'PRIVATE_TEST_AUTH_REQUIRED', 'Private merch testing requires authorization.');
  }

  const configuration = getConfigurationStatus(config);
  if (configuration.missingForMode.length > 0) {
    throw serviceError(503, 'MERCH_CHECKOUT_NOT_CONFIGURED', 'Merch checkout is not configured.');
  }

  const request = normalizeCheckoutRequest(body);
  const catalog = await fetchFourthwallCatalog(config, fetchImpl);
  const providerItems = resolveProviderCartItems(request, catalog, config);
  const cart = await createFourthwallCart(providerItems, request.currency, config, fetchImpl);
  const cartId = String(cart?.id || '');
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(cartId)) {
    throw serviceError(502, 'MERCH_PROVIDER_INVALID_RESPONSE', 'Merch fulfillment is temporarily unavailable.');
  }

  const checkoutUrl = new URL(`https://${config.shopDomain}/cart/checkout`);
  checkoutUrl.searchParams.set('cartId', cartId);
  checkoutUrl.searchParams.set('currency', request.currency);
  checkoutUrl.searchParams.set('cart_origin', 'risktakers_show');

  return {
    checkoutUrl: checkoutUrl.toString(),
    currency: request.currency,
    itemCount: request.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function verifyFourthwallWebhookSignature(rawBody, suppliedSignature, secret) {
  if (!Buffer.isBuffer(rawBody) || !suppliedSignature || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('base64');
  return safeTokenEqual(String(suppliedSignature).trim(), expected);
}

export async function readRawRequestBody(req, maxBytes = 1_000_000) {
  if (Buffer.isBuffer(req?.rawBody)) return req.rawBody;
  // Vercel's Node request helpers expose parsed req.body through a getter but
  // restore the original incoming-message stream afterward. Consume that
  // stream first so signatures always cover the exact bytes Fourthwall sent.
  const chunks = [];
  let size = 0;
  if (req && typeof req[Symbol.asyncIterator] === 'function') {
    for await (const chunk of req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > maxBytes) throw serviceError(413, 'WEBHOOK_TOO_LARGE', 'Webhook payload is too large.');
      chunks.push(buffer);
    }
    if (chunks.length > 0) return Buffer.concat(chunks);
  }

  // These branches support direct/unit invocation where no request stream is
  // present. Parsed objects are intentionally rejected: re-serialization is
  // not the signed byte sequence.
  if (Buffer.isBuffer(req?.body)) return req.body;
  if (typeof req?.body === 'string') return Buffer.from(req.body, 'utf8');
  return null;
}

export function validateWebhookEnvelope(event, config) {
  if (
    !event
    || typeof event !== 'object'
    || !String(event.id || '').trim()
    || !String(event.shopId || '').trim()
    || !String(event.type || '').trim()
    || !String(event.apiVersion || '').trim()
    || !String(event.createdAt || '').trim()
    || !Object.hasOwn(event, 'data')
  ) {
    throw serviceError(400, 'INVALID_WEBHOOK', 'Invalid webhook payload.');
  }
  if (config.expectedShopId && !safeTokenEqual(event.shopId, config.expectedShopId)) {
    throw serviceError(403, 'WEBHOOK_SHOP_MISMATCH', 'Webhook shop does not match.');
  }
  return {
    id: String(event.id),
    shopId: String(event.shopId),
    type: String(event.type),
    apiVersion: String(event.apiVersion),
    createdAt: String(event.createdAt),
    testMode: Boolean(event.testMode),
  };
}

export function sendMerchError(res, error) {
  const known = error instanceof MerchServiceError;
  const status = known ? error.status : 500;
  if (!known) console.error('Unexpected merch service error', error);
  const payload = {
    error: known ? error.publicMessage : 'Merch service is temporarily unavailable.',
    code: known ? error.code : 'MERCH_SERVICE_ERROR',
  };
  if (known && error.details) payload.details = error.details;
  res.status(status).json(payload);
}
