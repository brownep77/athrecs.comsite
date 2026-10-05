# Collected results and potential athlete profiles

## Staff and athlete workflow

- The athlete tools hub links to **Collected results** (`/admin/result-archive`) and **Claim conflicts & emails** (`/admin/result-claims`). The archive links directly to the results-file workflow and conflict review.
- Existing source-reviewed imports write canonical results and archive coverage. Publication/permission checks and athlete visibility remain in the importers. Publicly eligible results appear in `/athlete-results`; ordinary private participants remain available to authenticated matching, not public browsing.
- Matching reads those saved results when an athlete opens their account or private profile. It uses the registered name, declared previous names, linked names and saved source IDs, with club/location evidence for weaker name matches. A registration made after collection can discover older rows without first completing a private profile.
- The private profile now checks potential matches immediately and displays a count on its Potential results tab. Active screens refresh every minute. This is a database lookup, not a fresh crawl of the timing provider, and does not run through every inactive account in the background.
- Suggestions do not create ownership, change performance data or publish a profile. The existing explicit self-confirmation flow still applies. The first uncontested claim links the source athlete record to the account. A competing claim is pending and cannot replace the current owner.
- The existing importer must retain canonical source identity and review suspected duplicate source records. Conflict detection covers different accounts claiming the same canonical result or other results belonging to the same athlete ID. It does not assume that two separately imported athlete records with the same name are the same person.

## Conflict notification

`20261005_result_claim_alerts.sql` adds two private outbox tables. The claim transaction saves a notification event at the same time as a competing claim. A failed outbox write rolls back the claim. Repeated submissions reuse the event. Merely suggesting one name to two accounts does not generate an email.

An immediate attempt follows commit. The production-only `/api/result-claim-alerts` worker retries every ten minutes, checks a timing-safe `CRON_SECRET` bearer token and requires persistent storage and email configuration. It also catches unresolved competing claims that predate deployment. Staff can retry due emails from the review screen; backoff is retained.

Recipients come from `ATHRECS_CLAIMS_EMAILS`, falling back to the existing `ATHRECS_STAFF_EMAILS`. Each recipient has a separately persisted delivery. Content and recipient are frozen before sending. Alerts contain the race/athlete summary, claim ID and a link to the specific private review item. Claimant addresses and evidence remain in the authenticated staff screen.

The existing Resend sender accepts a stable `Idempotency-Key`; successful sends are not replayed. Row locks with `SKIP LOCKED` separate overlapping workers. Transient failures retry after ten minutes. An ambiguous delivery older than 23 hours is flagged for staff inspection rather than retried beyond Resend's 24-hour idempotency window. The email UI reports provider acceptance, not a guaranteed inbox delivery or read receipt. Reference: https://resend.com/docs/dashboard/emails/idempotency-keys

Production settings already expose the email service, staff-recipient setting and cron secret. Previews do not send conflict emails. No email-provider key or recipient list is copied into source control.

## Collection schedule boundary

The existing 08:00 Europe/London timing-source automation remains the collection schedule. Its metadata-only findings and reviewed import batches are not automatically written to the production database by this change. The task must continue to verify participant-level reuse authority, source rows and the actual ingestion connection before claiming a live import. Once an approved batch is imported through the existing importer, matching sees it without a separate per-account migration. No new scraper, provider permission or blanket profile publication is introduced here.

## Verification

- `node scripts/verify-result-conflict-flow.mjs` executes actual matching, claim and outbox code against the migrated disposable PGlite database. Covers a new registration after collection, unrelated identities, unverified email, explicit confirmation, same-account replay, a competing account claiming a different result on the same athlete, owner preservation, atomic rollback, missing email settings, failed-send retry, message/key reuse, safe-window expiry, worker authorization and production/preview/storage guards. Email delivery is mocked; PGlite does not simulate independent concurrent Postgres sessions.
- `node scripts/verify-result-conflict-browser.mjs` exercises the actual staff React route on desktop/mobile with synthetic APIs: conflict-only filtering, claim email deep link, delivery status, failed retry recovery and paused previews. No real email or ownership update occurs.
- Existing result-claim, claim-experience, match and public-results privacy checks are retained. The athlete-tools browser regression checks the combined screen and state preservation.
- Use the database-free Vite build for local verification. `npm run build` runs migrations/publication hooks and is not a local test command.
