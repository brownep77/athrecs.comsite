# Administrator signup emails

The AthRecs production project sends two separate emails to the one configured
`ATHRECS_SIGNUP_EMAIL_TO` recipient (Paul's requested address is
`paul@athrecs.com`). The sender defaults to
`ATHRECS Notifications <notifications@athrecs.com>`; it can be overridden with
`ATHRECS_SIGNUP_EMAIL_FROM` on the verified email domain.

- Each newly created account triggers an immediate delivery attempt after the
  authentication transaction commits. It includes name, email address, the
  permanent account `ATH-…` record number, signup date/time and email verification
  status. Account creation, rather than email verification or a repeated login,
  defines a signup. Imported athlete profiles do not count as registered users.
- At 08:00 Europe/London, the daily digest covers the previous UK calendar day.
  GMT/BST and 23/25-hour DST days are handled explicitly. Zero-signup days still
  produce a report. More than 200 users are split into numbered emails, with no
  omitted rows. Existing users appear only when their actual signup date is in
  that day's window; deployment does not replay old individual alerts.

The protected `/api/signup-emails` worker runs every ten minutes, sends queued
retries, and catches up missed digests one day per invocation. Usual delivery is
immediate; provider failures can delay mail. Scheduler and provider timing are
not a guarantee of inbox arrival at an exact second.

The database trigger records new users atomically. A request-local auth hook
identifies newly created accounts for immediate delivery without picking an old
backlog first. Provider failures never undo signup. Committed reservations,
unique event keys and frozen complete payloads make concurrent/repeated workers
safe. Retries reuse the same provider idempotency key; ambiguous delivery older
than 23 hours is held for staff investigation in `signup_email_deliveries` with
`needs_review=true`. Check the Resend receipt before manually retrying such a row.

Delivery requires production AthRecs, a persistent database, `RESEND_API_KEY`,
`CRON_SECRET`, and exactly one valid recipient. Preview, RunRecs and PGlite
delivery are paused before database access. The cron endpoint returns aggregate
counts only, requires the existing constant-time bearer-secret check and is
private/no-store. Private payloads are never public API output. No profile
visibility, ownership or participant-import permissions are changed.

Verification: `npm run verify:signup-emails` uses synthetic users in isolated
PGlite and intercepted email; `npm run verify:email-login-flow` exercises actual
signup/login endpoints. Production signup data and real inbox delivery are not
part of these tests.
