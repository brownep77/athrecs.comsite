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
or save unrelated consent choices. The athlete reviews the full result list, removes or restores individual rows, adds missing results,
and explicitly confirms the profile and selected results together. Eligible uncontested claims
complete immediately; exceptions retain ownership review. One durable summary receipt records
the actual completion status. See `docs/result-claim-flow.md` for the eligibility policy.

Email verification, account binding, conflict safeguards and private-by-default behavior remain.
The additive confirmation-method migration does not approve any existing claims. Child/guardian
authority, protected profiles, disputes and prior adverse decisions continue to require staff review.

Verification:

- `node scripts/verify-profile-claim-journey.mjs`: real browser, authenticated endpoints,
  synthetic accounts and disposable PGlite; missing name, remembered navigation, mobile
  invitation resume, one explicit completed claim, batch corrections and no duplicate ownership.
- `node --experimental-vm-modules scripts/verify-claim-invitations.mjs`: invitation
  authorization including unauthenticated, wrong-account, unverified, expired, revoked,
  declined and pre-registration cases.
- `node scripts/verify-quick-signin-ui.mjs`: actual email-code signup, racing-name capture,
  consent-draft isolation, optional discovery and mobile behavior.
- `npm run ci:verify`: repository typecheck, lint, regression checks and build.

Browser scripts can use the CI Playwright installation. The focused journey also accepts
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for an installed local Chromium binary.
