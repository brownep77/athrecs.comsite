# Match a signup and invite the athlete to claim

On `/admin/athlete-accounts`, choose **Match & invite** beside a registered account.
Suggestions use the saved name, previous names, club/location and existing source
identifiers. A signup without a full name can be matched through staff name/slug
search. An email local part is never treated as identity evidence.

Each candidate shows the club/location, stored result count, recent races and
reason for the suggestion. Select the profile, record why it may belong to the
recipient and check the confirmation. The email preview shows the actual recipient
and copy before **Email claim invitation** sends from `support@athrecs.com`.
**Create sharing link** creates no email. Copy the message or open WhatsApp using a
saved phone number, then send it from the staff member's own WhatsApp account.

The seven-day link opens the existing `/claim-results` journey with one stored
result preselected. The recipient signs in using the same verified account/email,
confirms the result and submits one identity claim for the athlete profile. A saved
private profile/name is not required. They can instead choose **Not my profile**.
The normal staff claims screen requires a recorded identity-check note to approve.
No invitation assigns ownership, changes a result or publishes a profile.

## Delivery and status

The dashboard distinguishes link created, email sent, claim awaiting review,
needs information, approved, declined, revoked, expired and failed/held delivery.
“Sent” means the email provider accepted the message; there is no inbox, open or
bounce tracking in this change. Claim status is read from the existing claim and
ownership records rather than copied into a separate review queue.

Creation locks the recipient and athlete and reuses the same active invitation.
An active invitation to another profile must be revoked before replacement. A
maximum of five new invitations per recipient and 100 per staff account per day
limits accidental repetition. Already-owned profiles and existing non-withdrawn
claims are held for staff review. Profiles without eligible stored results must
first receive a checked result through the existing athlete tools.

Email delivery is explicit, per invitation. Retry uses the saved recipient/content
and the same Resend idempotency key. A two-minute reservation prevents concurrent
attempts; uncertain delivery older than 23 hours is held for manual investigation
instead of risking another send outside the provider's 24-hour deduplication
window. There is no automatic bulk mailing, cron reminder or invitation on signup.

The endpoint rechecks recipient email, expiry, response and ownership before
sending. Resend uses the existing verified AthRecs domain/key. Email is disabled
outside AthRecs production with a persistent database. Vercel preview/RunRecs
invitation mutations are blocked before accessing the database. Local disposable
PGlite can exercise invitation records but cannot send email.

## Privacy and verification

The new table contains confidential claim URLs and frozen email data. Staff APIs
retain the Google/allowlist, staff host and same-origin restrictions. Athlete
access checks the token hash, account ID, verified current email, exact result,
athlete, expiry and revocation together. Invalid tokens do not fall back to name
matching. Candidate history omits tokens; claim pages and APIs use private no-store,
noindex and no-referrer protections, and claim-page analytics are disabled.

`npm run verify:claim-invitations` runs synthetic accounts through real auth and
server functions against disposable PGlite. It checks blank-name access, recipient
binding, staff restrictions, expiry, revocation, decline, repeated create/send/claim,
existing owner protection, identity-note approval, registration status and deletion
cascades. A separately mocked production environment exercises the actual email
renderer/dispatcher with an intercepted Resend boundary, including uncertain retry
and the expired retry window. It never sends an email or changes production data.
The test is part of `ci:verify`.
