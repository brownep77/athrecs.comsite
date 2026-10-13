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
