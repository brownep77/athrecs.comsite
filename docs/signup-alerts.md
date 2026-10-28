# New signup alerts

Each new account triggers separate emails to `paul@athrecs.com` and
`paultwbrowne@gmail.com`, sent from the bare address `paul@athrecs.com`.
The message includes the supplied name, email, signup time in Europe/London,
email verification status at creation, and a link to the private signup list.
It contains no authentication codes, session tokens or password links.

The database queues both deliveries atomically when a new account is inserted.
Better Auth's user creation hook delivers them immediately after the account
commits. Email, OTP and social account creation share this hook. Existing-account
sign-ins, profile edits, imported athlete profiles and historical accounts do not
create new signup notifications. Pending email verification is labelled clearly.

Production delivery uses the existing invitation Resend key, falling back to the
account email key. Local/preview builds, embedded databases and the RunRecs worker
cannot send these notifications. No new mailbox password or manual setup is needed.
Internal notifications do not appear in athlete correspondence histories.

Each recipient has its own receipt and retry reservation. `/api/signup-alerts`
retries queued deliveries every minute, requires `CRON_SECRET`, and returns no
personal signup data. An email failure does not fail account creation. Retries
reuse a frozen payload and idempotency key; unconfirmed deliveries older than
23 hours are marked `needs_review` instead of risking a duplicate after the
provider's deduplication window. Provider acceptance does not prove inbox delivery.

Run `npm run verify:signup-alerts` for disposable database, real OTP signup,
notification content, per-recipient retry, concurrency, rollback, repeat-login,
preview and worker authorization checks. All provider calls are intercepted;
no real email is sent by this test.

## Fixture correction alerts

New race-page suggestions also notify both addresses from `paul@athrecs.com`.
The email includes the race and page, correction, supporting URL, submitted name
and account email, London submission time, and the private event-register review
queue. Catalogue, road-race and ultra guide suggestions use the same process.
Alerts do not approve corrections or contact the person submitting them.

`race_edit_alert_deliveries` is queued in the submission transaction, with a
snapshot of the submitted information. Delivery starts after commit and the
existing `/api/signup-alerts` cron retries it. Each recipient has an independent
receipt, frozen email and stable provider idempotency key, with the same 23-hour
review cutoff. Fictional test accounts notify only `paul@athrecs.com` and are
clearly labelled. Historical suggestions are not backfilled; reviewing an old
suggestion does not send another alert.

Run `node scripts/verify-race-edit-suggestions.mjs` for real authenticated
submission, transaction rollback, two-recipient queueing, failed-recipient retry,
concurrent reservation, frozen retry content, safe HTML and test-account isolation.
Provider delivery is intercepted; the test never sends real emails.
