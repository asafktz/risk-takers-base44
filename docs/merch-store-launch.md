# Risk Takers merch waitlist: launch brief

Status: the native `risktakers.show/gift-store` waitlist page, logo-led product concepts, print-ready artwork, storefront mockups, and planned retail-value architecture are built. The public page is preview-and-waitlist only: it contains no cart, checkout, purchase link, shipping form, or Fourthwall destination. Fourthwall remains an unpublished back-office fulfillment option with all six listings **Hidden**. Payouts, billing, and the $100 monthly charge limit are configured; physical samples, hosted-store publishing, and any future sales flow remain separately gated.

## Live hidden catalog

Verified in the Fourthwall product manager on August 12, 2026. Product IDs remain stable if the shop domain changes.

| Item | Fourthwall ID | Live variant | Base | Retail | Gross spread | Status |
|---|---|---|---:|---:|---:|---|
| Human in the Loop Tee | `a59b182f-02b8-4703-989c-1c59701eed8e` | Comfort Colors 1717, black, S–4XL | $15.45 | $39 | $23.55 | Hidden |
| Zero Trust / High Agency Hoodie | `afe610ca-33ff-4322-a9a0-38564bac7165` | Cotton Heritage M2580, black, S–3XL | $27.29 | $79 | $51.71 | Hidden |
| Prompt Injection Fuel Mug | `e9b888e4-d70e-41ab-91e8-6b3e033c48d6` | Ceramic mug with black interior, 11 oz | $8.95 | $28 | $19.05 | Hidden |
| Attack Surface Desk Mat | `7384f894-1818-42fd-a813-9c734a30df3c` | Allcolor SP70018, 15.5 × 31.5 in | $13.00 | $49 | $36.00 | Hidden |
| Risk Takers Logo Sticker | `c572a824-9f8e-4939-8722-df3780e910ba` | Allcolor 5493 kiss-cut, 3 × 3 in | $2.29 | $8 | $5.71 | Hidden |
| Operator's Desk Kit | `1005793e-b740-4a47-ba63-ba74c7c0f652` | Mug + desk mat bundle | $21.95 | $77 | $55.05 | Hidden |

Fourthwall's automatic bundle-image generator returned an error, so the hidden bundle currently uses the first provider image from each component. The branded Risk Takers site supplies the collection-level merchandising image.

## Recommendation

Use `/gift-store` on `risktakers.show` as the only public merch destination for now. It previews the concepts, shows planned retail values, and records name, email, and product interest in the existing Risk Takers attendee workflow under `subscription_type = merch_waitlist`.

Keep Fourthwall strictly behind the scenes as a possible print-on-demand and fulfillment system. Do not publish its hosted store, expose product links, or connect the waitlist page to checkout unless Risk Takers later approves a separate commerce launch.

Why Fourthwall fits this mission:

- No monthly fee, upfront fee, minimum order, or contract for the base storefront.
- Public catalog costs are deducted only when an item is sold or gifted.
- Worldwide shipping, sales-tax handling, catalog-order customer support, and hosted payment are included.
- One-use giveaway links let a recipient choose size/color and enter their own address with no payment. Risk Takers is charged the product cost and destination-based shipping when the gift is claimed.
- The direct-product-link pattern is Fourthwall's most reliable documented way to connect an existing site. A free Storefront API is available later if a native multi-item cart becomes valuable.

Primary references:

- [Fourthwall pricing and product catalog](https://fourthwall.com/pricing/)
- [Fourthwall shop and fulfillment features](https://fourthwall.com/shops)
- [Giveaway links and creator-cost gifting](https://help.fourthwall.com/manage-my-shop/apps-features-and-integrations/share-free-products-with-giveaway-links/)
- [Bundle behavior and giveaway limitation](https://help.fourthwall.com/create-and-sell-products/how-to-guides/create-bundle-listing/)
- [Connecting an existing site](https://help.fourthwall.com/manage-my-shop/shop-settings/embedding-your-store-on-an-external-website/)
- [Storefront API](https://help.fourthwall.com/manage-my-shop/apps-features-and-integrations/storefront-api-for-custom-storefronts/)
- [International payout fallback](https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/country-not-supported-by-stripe/)
- [Shipping and delivery expectations](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/shipping-and-delivery-expectations/)
- [Returns, refunds, and quality issues](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/returns-refunds-and-quality-issues/)

### Why not Shopify first

Shopify is a strong future option if the store becomes a meaningful sales channel, but it adds fixed cost and more integration work before this giveaway-led concept is proven. Its free trial has an inactive checkout until a paid plan is selected; the current Israel pricing page lists Basic at US$39/month when billed monthly and a 2% fee for third-party payment providers. Shopify Payments' supported-country list should be rechecked during any later migration.

- [Shopify trial behavior](https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/free-trial)
- [Shopify Israel pricing](https://www.shopify.com/il/pricing)
- [Shopify Payments countries](https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries)

Printful Quick Stores are free, but the current service is restricted to US tax residents and US shipping addresses, so it does not fit Risk Takers' international audience. See [Printful Quick Stores availability](https://help.printful.com/hc/en-us/articles/15045280299548-Is-Quick-Stores-available-in-my-area).

## Collection and economics

All figures are USD values confirmed in the live Fourthwall product editor on August 12, 2026. They exclude shipping, tax, payment processing, premium sizes, and future product-specific changes. The retail column contains intended public checkout prices—not comparative MSRP or prior-sale claims. Recheck costs before publishing if the launch occurs later.

| Item | Suggested blank / method | Est. base | Retail | Gross spread before payment/shipping | Retail-to-base |
|---|---|---:|---:|---:|---:|
| Human in the Loop Tee | Comfort Colors 1717 printed | $15.45 | $39 | $23.55 | 2.52× |
| Zero Trust / High Agency Hoodie | Cotton Heritage M2580 printed | $27.29 | $79 | $51.71 | 2.89× |
| Prompt Injection Fuel Mug | Ceramic mug with color inside | $8.95 | $28 | $19.05 | 3.13× |
| Attack Surface Desk Mat | 15.5 × 31.5 in sublimated | $13.00 | $49 | $36.00 | 3.77× |
| Risk Takers Logo Sticker | Kiss-cut or die-cut sticker | $2.29 | $8 | $5.71 | 3.49× |
| Operator's Desk Kit | Desk mat + mug retail bundle | $21.95 | $77 | $55.05 | 3.51× |

For paid orders, subtract payment processing and any applicable product/options cost from the gross spread. For a physical-product giveaway link, Fourthwall documents the cash cost as the item cost plus destination-based shipping, with no additional giveaway-link fee.

Best giveaway choices:

1. Attack Surface Desk Mat — $49 retail value with the strongest product-cost multiple and no sizing risk.
2. Zero Trust / High Agency Hoodie — highest eligible single-item retail value, but size choice and shipping weight increase cost.
3. Prompt Injection Fuel Mug — $28 retail value, low starting product cost, and no apparel sizing.

The Operator's Desk Kit remains a strong $77 retail bundle for paid checkout. Fourthwall's current bundle documentation says bundles cannot be used with giveaway links. Gifting both pieces would require two individual claim links and potentially separate shipping, so the site does not present the bundle as the recommended giveaway.

## Product files

The artwork is deterministic and can be regenerated with:

```bash
python3 scripts/build_merch_art.py
```

The script uses local system fonts only to rasterize exact text; no font file is redistributed.

| Listing | Print artwork | Store mockup |
|---|---|---|
| Human in the Loop Tee | `public/merch/artwork/human-in-the-loop-print-4500x5400.png` | `public/merch/mockups/tee-human-in-the-loop.jpg` |
| Zero Trust Hoodie | `public/merch/artwork/zero-trust-high-agency-print-4500x5400.png` | `public/merch/mockups/hoodie-zero-trust-high-agency.jpg` |
| Prompt Injection Mug | `public/merch/artwork/prompt-injection-fuel-mug-print-4800x2000.png` | `public/merch/mockups/mug-prompt-injection-fuel.jpg` |
| Attack Surface Desk Mat | `public/merch/artwork/attack-surface-desk-mat-print-6000x2600.png` | `public/merch/mockups/deskmat-attack-surface.jpg` |
| Risk Takers Logo Sticker | `public/merch/artwork/take-the-risk-sticker-print-3000x3000.png` | `public/merch/mockups/sticker-take-the-risk.jpg` |

The generated collection hero is `public/merch/hero/risk-takers-gift-store-hero.png`. It was created with the built-in image generator from the Risk Takers logo source as a style reference; the exact product wording is kept in deterministic print artwork instead of relying on generated text.

## External setup sequence

1. Confirm the account-owner email and the legal entity/individual that should receive payouts.
2. ~~Create a free Fourthwall account and apply the Risk Takers shop identity.~~ Completed. Shop title: **Risk Takers Gift Store**. Free domain: `risk-takers-shop.fourthwall.com` (active behind the Coming soon gate).
3. ~~Create the five products and one paid-checkout bundle from the approved blanks. Upload the matching production PNGs and keep every item hidden.~~ Completed.
4. ~~Enter the recommended retail prices and confirm live base costs.~~ Completed. Fulfillment regions, destination shipping estimates, and apparel size surcharges still need final review before publishing.
5. Order one apparel sample and one hard-goods sample only after spend approval. Review print placement, text legibility, black density, yellow reproduction, mug wrap, mat edge safety, garment sizing, packaging, and delivery time.
6. Complete payout identity and tax onboarding. Fourthwall says Israel is not on its hard-blocked-country list and provides a `bill.com` exception flow when Stripe Connect cannot onboard a country/bank, but the live onboarding result is the authority.
7. Add a billing card only after approval. A card or sufficient store balance is required for gift-link redemptions because product and shipping are charged when claimed.
8. Keep every Fourthwall listing hidden and the hosted store unpublished during the waitlist phase.
9. Validate the native waitlist with a dedicated synthetic identity, verify its `merch_waitlist` record in the existing admin workflow, and remove the test record.
10. Deploy the Risk Takers branch only after approval, then verify `/gift-store`, navigation, SEO, responsive layout, waitlist success/error behavior, and the absence of outbound purchase links on the production domain.

## Integration behavior

- `src/config/merch.js` contains public presentation data only: product names, descriptions, planned retail values, details, and local mockup paths.
- `src/pages/GiftStore.jsx` renders the native collection preview and a first-party waitlist form. Every product CTA stays on the page and can preselect a product interest.
- `api/submitMerchWaitlist.js` validates and normalizes submissions, records `subscription_type = merch_waitlist`, stores the chosen interest in `description`, and treats a repeated email as an update rather than a second signup.
- The browser bundle contains no Fourthwall IDs, base costs, shop domain, provider URLs, or purchase integration variables.

## Launch acceptance checklist

- [ ] Account owner, entity, creator name, and public support email approved.
- [x] Shop title, description, and free Fourthwall domain changed from the signup defaults to Risk Takers.
- [x] Hosted storefront palette saved in signal yellow, washed gray, cream, and black.
- [x] Every base cost rechecked in Fourthwall.
- [ ] Shipping regions, destination estimates, and size surcharges rechecked in Fourthwall.
- [ ] Apparel and hard-goods samples approved from physical inspection.
- [x] Billing card and payout onboarding complete.
- [x] $100 monthly charge limit configured and verified after reload.
- [ ] Native waitlist validated with a synthetic signup and zero-residue cleanup.
- [ ] Desktop and mobile page review complete.
- [ ] Any later paid-order or giveaway test explicitly approved as a separate commerce phase.
- [x] Privacy and terms describe the preview-and-waitlist phase without implying a sale.
- [ ] Production deployment explicitly approved.
