# Signup and submission alerts

Staff notification routing is separate from staff sign-in access. The private
`staff_notification_routes` table selects enabled recipients by category through
`athrecs_notification_recipients`. Changing email routing does not add an address
to `ATHRECS_STAFF_EMAILS` or grant backend access.

| Category       | Purpose                                                       | Department inbox           |
| -------------- | ------------------------------------------------------------- | -------------------------- |
| `support`      | Account signups, profile setup and profile corrections        | `support@athrecs.com`      |
| `fixtures`     | Upcoming race information and race-page corrections           | `fixtures@athrecs.com`     |
| `results`      | Submitted results, verification requests and ownership claims | `results@athrecs.com`      |
| `partnerships` | Club and company/organiser submissions                        | `partnerships@athrecs.com` |

The initial routing sends all categories to the established `paul@athrecs.com`
and `paultwbrowne@gmail.com` destinations. Department addresses, including
`support@athrecs.com`, are staged but remain disabled until their existence has
been confirmed. A route entry or successful provider response does not prove that a mailbox exists or
received a message. The approved internal-recipient allowlist also prevents
visitor-controlled addresses becoming staff notification destinations.
The routing-table constraint rejects a department address placed in the wrong
category before that configuration can affect account or submission transactions.

### Production activation check — 30 October 2026

Both notification migrations were applied to the production database on
29 October at 13:43:56 UTC. The live `www.athrecs.com` deployment includes #1031.
The initial migration remains conservative; mailbox activation is operational
configuration in `staff_notification_routes`, not a change to its defaults.

Four separate controlled messages were sent from the owner's Gmail account at
06:28 UTC on 30 October, with reference `ATHRECS-ROUTING-20261030-A` and a distinct
category suffix. The existing read-only Private Email IMAP sync recorded receipt
in `paul@athrecs.com` for fixtures at 06:28:36 and results/partnerships at 06:28:38.
Each received RFC Message-ID was matched to the corresponding singly addressed
Gmail message. These are working delivery paths into a shared receiving mailbox;
the mailbox administration screen was not available to distinguish aliases from
forwarding or catch-all configuration.

| Category       | Department address enabled | Delivery evidence                                                 |
| -------------- | -------------------------- | ----------------------------------------------------------------- |
| `support`      | No                         | Test sent; receipt not confirmed. Private Email sign-in required. |
| `fixtures`     | Yes                        | Exact controlled message received by the connected owner inbox.   |
| `results`      | Yes                        | Exact controlled message received by the connected owner inbox.   |
| `partnerships` | Yes                        | Exact controlled message received by the connected owner inbox.   |

Both owner recipients remain enabled for every category. New routing applies
to future queued messages; old frozen deliveries are not replayed. Do not claim
these checks establish ongoing reliability, separate department inboxes, or
end-to-end delivery from the website's Resend sender. Application routing and
email content are separately exercised in disposable-database tests below.

To enable support after checking its receiving mailbox, update only its existing
row and read back the complete configuration. No redeploy or staff-access change
is needed:

```sql
-- Run only after the support test is located in the receiving mailbox.
update staff_notification_routes
set enabled = true
where category = 'support' and recipient = 'support@athrecs.com';

select category, recipient, enabled
from staff_notification_routes
order by category, recipient;
```

## New account registrations

Each new account queues a separate notification for each enabled `support`
recipient. The sender remains the bare address `paul@athrecs.com`.
The message includes the supplied name, email, signup time in Europe/London,
email verification status at creation, the stable `signup/<account ID>` reference,
and a link to the private signup list. Reply-To points to the submitted account
email; its verification status remains explicit.
It contains no authentication codes, session tokens or password links.

The database queues the deliveries atomically when a new account is inserted.
Better Auth's user creation hook delivers them immediately after the account
commits. Email, OTP and social account creation share this hook. Existing-account
sign-ins, imported athlete profiles and historical accounts do not create new
signup notifications. Pending email verification is labelled clearly.

## Profile matching setup

A distinct saved profile-matching form queues `support` notifications. Repeating
the same saved details does not create duplicate requests. Each email includes
the request reference, London submission time, racing name, account email,
current club, all previous clubs and names, every supplied profile link, and the
private staff queue URL. Missing fields are labelled as not supplied. If all
optional matching fields are empty, the email explicitly says that only name
and email were supplied; it does not imply additional race information was sent.

Saving a form does not establish ownership or source verification. Staff can
review supplied links and help find missing results while the athlete can
continue claiming available results.

## Fixture correction alerts

New race-page suggestions queue `fixtures` notifications. The email includes
the race and page, full correction text, supporting URL, submitted name and
account email, London submission time, and the private event-register review
queue. Catalogue, road-race and ultra guide suggestions use the same process.
Alerts do not approve corrections or contact the person submitting them.

`race_edit_alert_deliveries` is queued in the submission transaction, with a
snapshot of the submitted information. Historical suggestions are not bulk
backfilled; reviewing an old suggestion does not send another alert.

## Other submitted information

`staff_submission_alert_deliveries` stores an explicit snapshot and independent
recipient state for the following submission paths:

- Athlete profile corrections: profile reference, full correction and supporting link.
- Missing-result proposals: the submitted text, proposed race/result fields and source links.
- Result verification requests: the result reference, recorded performance, athlete note and supporting link.
- Submitted club registrations: club details and the representative's submitted contact and authority information.
- Company registrations, partnership opportunities and applications: the submitted company/opportunity details or application message.

These records are queued in the same transaction as the underlying submission.
Draft club forms and staff-only review changes do not generate another submission
alert. Genuine resubmissions use their new revision. The existing authenticated
`/api/signup-alerts` worker attempts pending submission emails on its next run,
scheduled every minute; inbox arrival also depends on the mail provider.

### Explicit athlete account saves

An explicit full account save also queues a `support` notification and attempts
delivery after the save commits. The snapshot includes racing/display names,
club, previous names, nationality, country/city, public athlete identifiers and
profile URLs, example race details, and selected sports. Consecutive identical
validated saves reuse the latest notification snapshot. A change creates a new
snapshot even when the athlete returns to previously saved details (A → B → A).
Viewing an account, matching-form saves and imports do not emit this full-account
notification.

The email says whether a date of birth or postcode was supplied, but does not
copy either value. Other profile details, training/product preferences and
consent choices remain in the authenticated staff account record, linked from
the email. Passwords, session tokens and unexpected client-supplied authentication
fields never enter this notification snapshot.

## Delivery and privacy safeguards

Production delivery uses the existing invitation Resend key, falling back to the
account email key. Local/preview builds, embedded databases and the separate
legacy-site worker cannot send these notifications. Internal notifications do
not enter athlete correspondence histories.

Each recipient has its own receipt and retry reservation. `/api/signup-alerts`
retries queued deliveries every minute, requires `CRON_SECRET`, and returns no
personal signup data. Email failures do not fail an account registration or
submission. Bounded batches allow the department mailbox and owner copies to be
attempted together. Retries reuse a frozen payload and idempotency key; changing
routing or user details does not rewrite an already attempted email.
Unconfirmed deliveries older than 23 hours are marked `needs_review` instead
of risking a duplicate after the provider's deduplication window.

Fictional test-account notifications go only to `paul@athrecs.com` and are
clearly labelled. User-supplied text is escaped in HTML emails. Passwords,
authentication codes and session credentials are not included.

## Verification

Run the following checks against their disposable databases. Provider delivery
is intercepted and unexpected external traffic is rejected; no real email is
sent by these tests.

- `npm run verify:signup-alerts` exercises real OTP signup, enabled support
  routing, email content, per-recipient failure/retry, concurrency, rollback,
  repeat login, preview guards and worker authorization.
- `node scripts/verify-profile-setup.mjs` checks authenticated form saving,
  preservation of existing account data, recipient routing, deduplication,
  complete supplied fields, accurate name-only emails and frozen retry content.
  It also exercises the full account-save RPC, identical-save deduplication,
  genuine changed-detail notifications, rejected mismatched routes, and the
  exclusion of date-of-birth/postcode values and private/authentication fields.
- `node scripts/verify-race-edit-suggestions.mjs` checks authenticated
  submission, fixture-specific routing, transaction rollback, failed-recipient
  retry, concurrent reservation, safe HTML and fictional-test isolation.

Enabling department addresses in the disposable tests proves routing behavior,
not live mailbox delivery. Live acceptance and receipt must be checked separately.
