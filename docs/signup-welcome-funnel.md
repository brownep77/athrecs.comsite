# Signup to saved results

The entry point is `/join`. Creating an account is the first action; following a
social account is no longer a separate step before signup. The site shows three
steps: create your account, claim your profile, confirm your results.

New accounts receive Paul's existing personalised welcome from the bare address
`paul@athrecs.com` after their email is verified. It uses the AthRecs logo, the
approved pilot/independent-project wording, and one main button to claim their
athlete profile. Replies go to Paul. It contains no new code or private claim token.
An accepted welcome invitation suppresses the automatic duplicate. Historical
accounts are not bulk emailed.

The account guide resumes pending claims and private invitations before suggesting
a name search. Athletes review the complete result list, remove mistakes, add
missing results and confirm once. After confirmation, the next action is adding
a missing result. Missing-profile and help links remain available. Existing claim
review, result verification, privacy and sharing choices are unchanged.

The staff signup list shows welcome status and each account's next step. Its new
progress panel counts distinct accounts created since this welcome flow was
enabled: signup, verified email, welcome accepted, linked profile, confirmed
results and optional missing-result submissions. These are current database
states, not email opens or ordered analytics events. Counts may be completed in
a different order. Submission and self-confirmation do not establish independent
result verification or publish private information.

Welcome delivery has a durable database outbox, an immediate verified-account
hook and the existing one-minute signup retry worker. Payloads and keys remain
fixed across retries; changed recipient addresses and uncertain deliveries beyond
23 hours are held for review. Local/preview and sibling-site guards are shared
with the existing signup notification service. Welcomes appear in private staff
Messages; provider acceptance does not prove inbox delivery.

Checks: `npm run verify:signup-welcome`, `npm run verify:signup-alerts`,
`scripts/verify-recruitment-ui.mjs --signup-only --linkedin`, and staff registration
privacy/interface checks use disposable data and intercepted email delivery.
