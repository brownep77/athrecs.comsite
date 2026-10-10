# Finishing an athlete profile claim

Email verification establishes the account. It does not submit a profile claim.

The account page places the next claim step above optional account sections. A verified
recipient can resume a live invitation even if it was prepared before registration and
no racing name has been saved. Other accounts cannot retrieve that invitation. Expired,
revoked, declined, submitted and already-linked invitations are omitted.

Without an invitation, an unfinished selected result is remembered in this browser for
seven days under the current account ID. Only the result ID and timestamp are stored;
no invitation token, contact details or athlete name is stored. This is only a navigation
hint. Existing server-side identity matching and claim authorization still apply.

A direct claim link with a missing racing name asks for that name on the same page.
Saving it retries the selected result; it does not grant ownership, publish the profile
or save unrelated consent choices. The athlete explicitly confirms the race is theirs
and submits the profile claim. The receipt explains the pending identity review.

The existing staff review, email verification, account binding, conflict safeguards and
private-by-default behavior are unchanged. There are no new mail campaigns or migrations.

Verification:

- `node scripts/verify-profile-claim-journey.mjs`: real browser, authenticated endpoints,
  synthetic accounts and disposable PGlite; missing name, remembered navigation, mobile
  invitation resume, one pending claim and no automatic ownership.
- `node --experimental-vm-modules scripts/verify-claim-invitations.mjs`: invitation
  authorization including unauthenticated, wrong-account, unverified, expired, revoked,
  declined and pre-registration cases.
- `node scripts/verify-quick-signin-ui.mjs`: actual email-code signup, racing-name capture,
  consent-draft isolation, optional discovery and mobile behavior.
- `npm run ci:verify`: repository typecheck, lint, regression checks and build.

Browser scripts can use the CI Playwright installation. The focused journey also accepts
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for an installed local Chromium binary.
