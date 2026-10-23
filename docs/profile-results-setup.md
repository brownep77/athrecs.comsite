# Profile setup and result discovery

After signing in, the default athlete account destination is Find and claim
results. Explicit account sections, invitation links, result claims and partner
callbacks retain their destinations. The email-code, password and social routes
all reach the same authenticated setup. Optional discovery details are collected
after email verification, so no profile data is kept in browser storage while
waiting for an email or OAuth callback.

The `/join` signup form includes the same optional clubs, previous names and
public profile links alongside the full racing name and main sport. It submits
the private follow-up request before showing the ready state. Athletes arriving
with an invitation or unfinished claim retain their direct claim shortcut; the
optional setup stays out of that path. Established accounts keep My races as
their default account section, while the generic signup callback explicitly opens
Find and claim results.

The short setup asks for the full racing name, current club, up to ten previous
clubs, up to eight previous racing names and up to ten public HTTPS profile or
result links. Power of 10 and parkrun links use existing source-identity matching.
Other links remain private research leads for staff. A link does not enable an
automatic feed or establish ownership or result verification.

Saving changes only discovery fields. Other profile details, birthday privacy,
nationality, sports, preferences and consent settings are preserved. The first
former club also updates the existing previousClub field; the complete list lives
in private matching settings. Matching uses current and previous clubs as context
for a plausible name, never as a club-only identity match. Existing age,
nationality, ownership and result-validity checks still apply.

Suggested results refresh after saving. The athlete can review and claim results
immediately using the existing claim process. Staff research is independent and
does not hold available results behind a review step.

## Staff follow-up

The same transaction saves a private review request and two staff-email outbox
rows, using the existing signup notification recipients. Identical repeat saves
do not create another request or notification. Changed details create a new
snapshot for review. Account identity and profile links are not sent to any
athlete other than their own account view.

The account displays “Your profile is in our review queue. We’ll check your links
and look for more results.” It also explains that suggested results can be
claimed immediately. Staff see open requests, supplied names, clubs, links and
email delivery state at `/admin/athlete-accounts`, and can mark a review complete.
This is an authenticated staff view; anonymous/member requests are rejected.

Delivery is attempted in production with the existing configured email service.
The authorized signup-alert cron retries failed sends. The email payload and
idempotency key remain fixed during retries. Unconfirmed delivery beyond 23 hours
requires provider review. Saving the setup succeeds even if email is unavailable;
the request remains visible in the staff queue.

Migration `20261023_profile_setup_requests.sql` is additive and uses the existing
build-time migration runner. Deleting an account cascades its requests and alerts.

## Verification

`node --experimental-strip-types scripts/verify-profile-setup.mjs` exercises real
authenticated RPCs and SQL against a migrated disposable PGlite database. All
external traffic is blocked and email delivery is injected. It covers verified
email gating, anonymous rejection, cross-account isolation, staff authorization,
preservation of existing fields, URL validation, request deduplication, per-recipient
email retry and former-club evidence reaching both result-matching endpoints.

The optional `--browser` mode checks the setup at mobile and desktop widths when
Playwright Chromium is installed. This environment could not download Chromium,
so this mode has not been completed here. No production signup or real notification
was created during these tests.
