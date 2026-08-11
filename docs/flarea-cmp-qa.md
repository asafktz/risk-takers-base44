# Flarea CMP setup and QA

Risk Takers categorizes the site-wide Flarea pixel as optional **Analytics**. The account pixel is installed once. Flarea event embeds provide event identity; do not add a separate pixel for each event.

## Consent wiring

- Consent granted: `window.srConsent(true)`
- Consent rejected or withdrawn: `window.srConsent(false)`
- Browser storage: `sr_vid` and, only after identification, `sr_email`
- Collection endpoint: `https://flarea.ai/api/track`

Global Privacy Control and the Risk Takers sale/share opt-out override a saved analytics grant. Visitors can change analytics consent at `/privacy-choices`.
Risk Takers clears both Flarea storage keys itself on rejection or withdrawal as a compatibility safeguard; the pixel may repeat the same cleanup.

## Release test

Use a fresh private-browser profile. Do not use or modify the promoted AI Defense Stack event for synthetic identity testing.

1. Before choosing, confirm the Analytics choice is visible. There must be no request to `/api/track`.
2. Choose **Reject**. Confirm no `/api/track` request is sent during later navigation.
3. Start another fresh private profile and choose **Allow analytics**. Confirm one account-level request is sent to `/api/track` and only one `sr.js` tag exists.
4. Open `/privacy-choices`, choose **Reject analytics**, and navigate again. Confirm later requests stop.
5. Repeat with Global Privacy Control enabled. The banner should not prompt and optional Flarea tracking must remain disabled.
6. For identity attribution, use a new isolated test event/page and synthetic email alias. Confirm the promoted event remains unchanged and distinguish the site visit from registration/live engagement evidence.

Browser storage inspection should be performed manually in the private test profile's developer tools. Verify `sr_vid` and `sr_email` are absent before consent and after withdrawal, and appear only in the expected allowed/identified states.
