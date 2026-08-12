# Risk Takers Gift Store: launch brief

Status: the branded site page, logo-led product concepts, print-ready artwork, storefront mockups, price architecture, and provider integration points are built. The owner approved the revised logo-led collection on August 12, 2026. A Fourthwall account now exists and all five products plus the paid-checkout bundle have been created and verified **Hidden**. Store identity, billing, payout verification, physical samples, checkout tests, publishing, and production deployment remain gated.

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

Use Fourthwall as the print-on-demand storefront and fulfillment system. Keep `/gift-store` on `risktakers.show` as the branded discovery layer, then send each item to its corresponding Fourthwall product page and hosted checkout.

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
2. ~~Create a free Fourthwall account.~~ Completed; the account currently retains the default LinkedOtter shop identity until the owner confirms it should be renamed to **Risk Takers Gift Store** and the free domain should change to `risk-takers-shop.fourthwall.com`.
3. ~~Create the five products and one paid-checkout bundle from the approved blanks. Upload the matching production PNGs and keep every item hidden.~~ Completed.
4. ~~Enter the recommended retail prices and confirm live base costs.~~ Completed. Fulfillment regions, destination shipping estimates, and apparel size surcharges still need final review before publishing.
5. Order one apparel sample and one hard-goods sample only after spend approval. Review print placement, text legibility, black density, yellow reproduction, mug wrap, mat edge safety, garment sizing, packaging, and delivery time.
6. Complete payout identity and tax onboarding. Fourthwall says Israel is not on its hard-blocked-country list and provides a `bill.com` exception flow when Stripe Connect cannot onboard a country/bank, but the live onboarding result is the authority.
7. Add a billing card only after approval. A card or sufficient store balance is required for gift-link redemptions because product and shipping are charged when claimed.
8. Publish the products and copy their exact product URLs into Vercel using the variables in `config/merch.env.example`.
9. Run a paid-checkout test and a one-use giveaway-link test on an eligible individual product only after approval for the test spend. Verify size/color selection, recipient $0 checkout, shipping charge, confirmation email, order visibility, and support path.
10. Deploy the Risk Takers branch only after approval, then verify `/gift-store`, navigation, SEO, product links, and checkout return behavior on the production domain.

## Integration behavior

- `src/config/merch.js` is the single product/pricing/integration source for the web page.
- Without a Fourthwall domain, the site clearly renders a collection preview and disables checkout CTAs. There are no fake or broken purchase links.
- With the domain and exact product URLs configured, product CTAs open Fourthwall product pages where variant selection, payment, tax, shipping, fulfillment, and catalog-order support are handled.
- If a native on-site cart becomes worthwhile, use Fourthwall's Storefront API and hosted checkout redirect. Do not collect card details in the Risk Takers application.

## Launch acceptance checklist

- [ ] Account owner, entity, creator name, and public support email approved.
- [x] Every base cost rechecked in Fourthwall.
- [ ] Shipping regions, destination estimates, and size surcharges rechecked in Fourthwall.
- [ ] Apparel and hard-goods samples approved from physical inspection.
- [ ] Billing card and payout onboarding complete.
- [ ] Product URLs configured in a preview deployment.
- [ ] Desktop and mobile page review complete.
- [ ] Test paid order approved and completed.
- [ ] Test one-use giveaway claim approved and completed.
- [ ] Privacy and terms reviewed for third-party merch checkout and transactional data.
- [ ] Production deployment explicitly approved.
