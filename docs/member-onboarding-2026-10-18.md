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
private test-account pages. Original signed-in destinations are validated as
internal URLs and restored after completion. `/join?step=edit` edits saved roles
and details. Current required profile fields are checked rather than trusting an
old completion row. A later account-name edit must be reconfirmed instead of being
silently overwritten from stale first/last names.

## Validation

The earlier local branch passed adversarial HTTP/database and desktop/mobile
browser tests, then was removed by workspace maintenance before publication.
This reconstruction passed the authenticated server/database suite with nine
synthetic accounts, all seven roles and 68 adverse metadata, redirect and
incomplete-profile cases. Browser checks are being repeated before release. All test accounts and races are fictional and disposable, external calls
are blocked or intercepted and production credentials are cleared.

The dedicated GitHub workflow runs the RPC/database suite, component browser suite
and real-app browser journeys sequentially. A production release must apply
`20261018_member_onboarding.sql` through the normal migrator.
