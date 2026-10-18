# Member onboarding

Signed-in members without complete onboarding are guided to `/join` to confirm
first and last names, country and one or more roles. Existing account details,
display names, preferences and consents are preserved. Athlete profiles additionally
collect nationality, DOB, postcode/area, main sport, optional club, former racing
names, parkrun/Power of 10 identifiers and a known race. Optional kit and nutrition
preferences use the existing private account tables.

Submitting saves the private account first, then records onboarding completion.
Failures are retryable. Optimistic version checks under a user-row lock prevent a
stale form from restoring newer profile or consent choices. The form advances its
version after the profile save so a later completion failure remains retryable.
No race ownership, verification labels or permissions change from form submission.
Athletes continue to the existing result suggestion and claim tools.

Roles are athlete, coach, club representative, race director/organiser, timing
provider, supporter and staff access request. Multiple roles are allowed. These
are self-declared interests: actual staff and organisation permissions require
the existing approval process. Staff can review the latest 200 role forms under
Signed-up athletes → Saved account details. No outbound follow-up is introduced.

The onboarding prompt excludes staff/API/auth, privacy/terms, claim/review and
private test-account pages. The shared development fallback user is excluded.
Original signed-in destinations are validated as internal URLs, retained through
email-code sign-in and restored after completion. `/join?step=edit` edits saved roles
and details. Current required profile fields are checked rather than trusting an
old completion row. A later account-name edit must be reconfirmed instead of being
silently overwritten from stale first/last names.

## Validation

The authenticated server/database suite passed with nine synthetic accounts,
all seven roles and 68 adverse metadata, redirect and incomplete-profile cases.
It checks account isolation, duplicate suppression, privilege escalation attempts,
concurrent saves and preservation of newer consent choices.

The component browser suite passed at 1280px and 390px, including required fields,
all roles, optional preferences, failed saves, completion retries, preserved
display names/consents and stale-name reconfirmation. Real gate checks also passed:
the development fallback and existing claim routes make no onboarding request or
redirect; an incomplete real member retains the exact intended destination.
Full-app journeys passed for
a desktop athlete/coach, mobile athlete and 320px supporter: real authentication,
onboarding gate, intended destination, saved database values, reload and editing.
No JavaScript errors, first-party HTTP 5xx responses, unsolicited claims, ownership
links, consent grants or outbound emails occurred. Desktop/mobile screenshots
were visually reviewed for readable controls, spacing, clipping and overflow.

The existing club-registration regression also passed with the new onboarding
step: club-only role, exact selected-club destination restored, draft/resume,
submission and independent staff approval, across five widths from 320–1280px.
Onboarding creates no athlete ownership, result claims or optional consent grants.

Existing real email-code recruitment journeys passed for Instagram and LinkedIn,
including the intended destination through sign-in and profile save. Quick signup
passed with email enabled, email disabled and RunRecs. The real name-only save RPC
preserves an unsaved marketing draft without granting it; reloading discards it.
The returning-claim regression now completes onboarding first and checks that
claim review reuses the saved identity, retaining selection, resume, receipt,
reload and invitation-binding checks.

All accounts and races are fictional and disposable. External calls are blocked
or intercepted and production credentials are cleared. The full-app HTTP loopback
test uses a genuine issued bearer session; it does not exercise production HTTPS
Secure-cookie transport. TypeScript and focused source lint checks also passed.

The dedicated GitHub workflow runs the RPC/database suite, component browser suite
and real-app browser journeys sequentially. A production release must apply
`20261018_member_onboarding.sql` through the normal migrator.
