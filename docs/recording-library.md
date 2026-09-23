# AI Defense Stack recording library

The existing `/watch/ai-defense-stack-showcase-day-n4qd` URL and `/AIDefenseStack` both open the completed recording library. Other event watch routes retain the FLAREA embed.

The public catalog contains 11 records and poster images only. `/api/replay?action=register` validates name/email, validates the request origin, and calls the service-only registration RPC. Successful persistence precedes the signed HTTP-only cookie. Existing registrations deduplicate by event and normalized email; no email or calendar message is sent. The Admin registration view includes a separate Recording access source.

The private `ai-defense-recordings-20260923` bucket stores HLS assets. Stream requests require an unexpired signed session and an existing registration. Each manifest signs the initialization object and every media segment for two hours. Anonymous bucket access is disabled. Session cookies last 30 days; deleting a registration revokes future manifest access. Already-issued segment URLs remain valid until their two-hour expiry.

Rate limiting is enforced transactionally in Postgres (10 registrations per minute, 100 per day per daily keyed IP hash). Attempt hashes are retained for no more than two days when the registration RPC runs. Existing and later privacy opt-outs propagate to recording registrations. Only service-role writes and existing admin RLS reads are allowed.

A preview-only upload route uses a separate `RECORDING_UPLOAD_KEY`; it can sign uploads only to the fixed recording bucket and catalog paths. The route always returns 404 in production. Revoke the preview upload secret after ingestion.

Validation includes session forgery/expiry, failure before persistence, invalid input, origin checks, private stream access, signed HLS rewriting, production upload rejection, and catalog completeness. Original MP4 exports remain unchanged locally.

Release uses the repository's Vercel Git integration. Merge only after storage inventory and preview API checks complete. Verify the production alias, deployed commit, name/email persistence, clip playback, and mobile layout after release. To roll back the page, restore the prior Vercel production deployment; the additive private storage and registration table can remain intact.
