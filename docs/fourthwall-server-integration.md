# Fourthwall server integration

This repository has a server-side Fourthwall adapter for `/gift-store`. The page fails closed to its waitlist unless the selected mode, full server configuration, exact shop identity, public catalog state, variants, and pricing all reconcile. Fourthwall product IDs, API credentials, Storefront token, webhook secret, and provider catalog responses stay in Vercel functions; they are not imported into the Vite application.

Official references used for the implementation:

- [Platform API authentication](https://docs.fourthwall.com/quickstart)
- [Get a product by ID](https://docs.fourthwall.com/api-reference/platform/products/get-product)
- [Storefront cart creation](https://docs.fourthwall.com/api-reference/storefront/carts/create-cart)
- [Hosted cart checkout](https://docs.fourthwall.com/shop-apis/cart-checkout-endpoint)
- [Webhook signature verification](https://docs.fourthwall.com/webhooks/signature-verification)
- [Webhook envelope and duplicate event IDs](https://docs.fourthwall.com/webhooks/webhook-model)

## Modes

`MERCH_MODE` is the release control:

| Mode | Public behavior | Checkout behavior | Expected Fourthwall access |
|---|---|---|---|
| `waitlist` | Safe static retail values and waitlist availability | Always returns `409 MERCH_WAITLIST_ONLY` | `HIDDEN` or `PRIVATE` |
| `private_test` | Still looks like waitlist without authorization | Requires `Authorization: Bearer $MERCH_PRIVATE_ACCESS_TOKEN` | `PRIVATE` or `PUBLIC` |
| `live` | Loads safe availability and option labels from Fourthwall | Creates a Storefront cart and returns its hosted checkout URL | `PUBLIC` |

Missing `MERCH_MODE` and invalid values fail closed to `waitlist`. A mode change never changes Fourthwall visibility; visibility remains an independent provider-side control that catalog reconciliation checks.

## Environment variables

Copy the names from `config/merch.server.env.example` into Vercel. All are server-only and must be configured without a `VITE_` prefix.

| Variable | Purpose | Needed |
|---|---|---|
| `MERCH_MODE` | `waitlist`, `private_test`, or `live` release state | Always; defaults to waitlist |
| `FOURTHWALL_API_USERNAME` | Open API Basic Auth username | Catalog health, safe live variants, checkout |
| `FOURTHWALL_API_PASSWORD` | Open API Basic Auth password | Catalog health, safe live variants, checkout |
| `FOURTHWALL_STOREFRONT_TOKEN` | Creates carts through the Storefront API | Private test and live checkout |
| `FOURTHWALL_SHOP_DOMAIN` | Host for Fourthwall-owned checkout | Private test and live checkout |
| `FOURTHWALL_WEBHOOK_SECRET` | Verifies `X-Fourthwall-Hmac-SHA256` against raw request bytes | Webhooks; required for live readiness |
| `FOURTHWALL_SHOP_ID` | Rejects validly signed events from the wrong configured shop | Strongly recommended; required for live readiness |
| `MERCH_PRIVATE_ACCESS_TOKEN` | Bearer gate for private-test catalog and checkout | `private_test` |
| `MERCH_ADMIN_TOKEN` | Bearer gate for catalog health | Health endpoint |

Generate the two Risk Takers access tokens independently with at least 32 random bytes. Do not put any secret in a query string.

## Endpoints

### `GET /api/merchPublicConfig`

Returns only local product slugs, presentation names, USD retail values, availability, and—when commerce is ready—safe color/size descriptions. It deliberately removes provider product IDs, variant IDs, SKUs, unit costs, shop IDs, credentials, and raw provider errors.

In `private_test`, supply the private bearer token to see provider-backed safe options. Without it, the response remains a normal waitlist response.

### `GET /api/merchCatalogHealth`

Requires `Authorization: Bearer $MERCH_ADMIN_TOKEN`. It fetches the six mapped products with Fourthwall Open API Basic Auth and checks:

- each expected listing exists under its stable server-side ID;
- slug, lifecycle state, and access match the selected mode;
- USD variant pricing has the intended retail price as its floor;
- at least one variant is available;
- configured shop domain and shop ID match Fourthwall.

The response contains local Risk Takers slugs and check results, never provider IDs, SKUs, costs, credentials, or raw provider responses. HTTP `200` means ready for the configured mode; `503` means not ready.

### `POST /api/merchCheckout`

Input uses only Risk Takers product slugs and human-readable selections:

```json
{
  "currency": "USD",
  "items": [
    {
      "productId": "human-in-the-loop-tee",
      "quantity": 1,
      "selection": { "color": "Black", "size": "L" }
    }
  ]
}
```

The server resolves current Fourthwall variants, rechecks visibility and pricing, creates the Storefront cart, and returns only the hosted checkout URL, currency, and item count. It never accepts a provider product ID or variant ID from the browser.

### `POST /api/fourthwallWebhook`

Configure this exact production callback in Fourthwall:

`https://www.risktakers.show/api/fourthwallWebhook`

The handler consumes the restored raw incoming-message stream before accessing Vercel's parsed body helper, calculates HMAC-SHA256 with `FOURTHWALL_WEBHOOK_SECRET`, base64-encodes the digest, and performs a timing-safe comparison with `X-Fourthwall-Hmac-SHA256`. JSON is parsed only after verification. Logs include the event envelope but omit `data`, which can contain personal data and order details.

## Deliberate remaining activation steps

The code is complete, but these external steps cannot be performed by a repository change:

1. Create the Fourthwall Open API user, Storefront token, and webhook secret, then save them as Vercel server variables.
2. Set `FOURTHWALL_SHOP_ID` to the ID returned by `GET /open-api/v1.0/shops/current`.
3. Register the production webhook callback in Fourthwall and send a signed test event.
4. Upload and verify final production artwork/variants, then change listing access from `HIDDEN` to `PRIVATE` for a gated checkout test or `PUBLIC` for launch.
5. Run the health endpoint; do not change `MERCH_MODE` until it reports ready.
6. Complete a real hosted checkout/sample order and verify payment, fulfillment, notification, shipping, and refund behavior.

Webhook events are signature-verified and acknowledged, but durable event storage and downstream order reconciliation are intentionally not added without a database retention decision. Fourthwall can redeliver duplicate event IDs, so any future persistence must put a unique constraint on the event ID and process idempotently.
