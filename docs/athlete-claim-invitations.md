# Match a signup and invite the athlete to claim

On `/admin/athlete-accounts`, choose **Match & invite** beside a registered account.
The same action is available on each row in `/admin/athlete-directory` and in
**Add or update athletes → Find profiles**. A source-profile row preselects that
exact profile and lets staff find a signup by name, email or ATH number, including
unfinished accounts. An account row opens matching for that account. Neither a
directory suggestion nor a selected recipient links ownership automatically.
Suggestions use the saved name, previous names, club/location and existing source
identifiers. A signup without a full name can be matched through staff name/slug
search. An email local part is never treated as identity evidence.

Each candidate shows the club/location, stored result count, recent races and
reason for the suggestion. Select the profile, record why it may belong to the
recipient and check the confirmation. The email preview shows the actual recipient
and copy before **Email claim invitation** sends from `support@athrecs.com`.
**Create WhatsApp / Viber / Telegram invitation** creates no email. Copy the message
or open a prepared message in the chosen app. WhatsApp uses a saved phone when
available; Telegram uses a saved username or phone. Otherwise the app lets staff
choose the recipient. Viber always uses its contact chooser; its message puts the
complete claim URL first and stays within the documented 200-character limit.
Use the staff member's +44 7581 764764 account and review the recipient before
sending. Opening a messaging app does not record delivery. Copy-message fallback
is available if the app is not installed. Phone and Telegram details can be saved
privately inside the directory panel. Existing-signup invitations remain bound to
that account and its verified email.

## Invite someone before they sign up

Choose **Invite to claim** on an unclaimed athlete's staff profile, or **Invite
someone not signed up** inside the directory panel. The public unclaimed profile
also links to this exact staff screen; staff authentication is still required.
Enter the recipient's name and at least one contact, record the contact source and
why this is their profile, then review the preview. The link selects this exact
profile/result through signup. Creating an invitation never creates a placeholder
account, changes signup statistics, changes marketing consent, publishes results
or grants ownership.

- Email sends explicitly from `support@athrecs.com`, using the existing frozen
  payload, delivery reservation and provider idempotency key. A new recipient
  creates their account using the exact invited email and verifies it. If the
  email already belongs to an account, the invitation binds to that account.
- SMS, WhatsApp, Telegram and Viber prepare a private message. SMS uses the
  [standard SMS URI body field](https://www.rfc-editor.org/rfc/rfc5724), with copy
  fallback where the device does not support prefilled text.
- Instagram, Facebook, X / Twitter and LinkedIn copy the message and open the
  saved, validated social profile. Staff start a private conversation and paste
  the message there. There is no automatic social API send, public posting or
  claim of delivery. Copy message also works with other messaging apps.
- With an email supplied, every channel uses the same mailbox-bound invitation.
  Without an email, the private token is a capability for the intended contact.
  It reveals only the selected display name before login. Viewing results still
  requires a verified account, and viewing does not consume the token. The first
  explicit claim or decline binds the invitation to that account atomically.
  Staff must confirm identity with the recorded contact before approval; a phone
  or social address is not verified by possession of the link. Claims record
  this limitation and the contact evidence for staff review.

The staff profile shows recent invitation status, email retry and revocation.
New invitations are serialised with account invitations and share recipient/staff
daily limits. Tokens expire after seven days. Existing account-bound invitations
keep their original account, verified mailbox and result binding; an invalid
supplied token never falls back to a name match. Private contacts and tokens are
never added to public profile payloads or anonymous invitation introductions.

Channel link formats: [WhatsApp](https://faq.whatsapp.com/5913398998672934),
[Telegram](https://core.telegram.org/api/links),
[Viber](https://developers.viber.com/docs/tools/share-button/).

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

`npm run verify:external-invitations` exercises real email-code registration,
pre-registration invitations, wrong-account/unverified denial, recipient binding
only on explicit submission, review gates, contact-only invitations, SMS/social
payloads and expiry/revocation against disposable PGlite. The invitation suite
also verifies email dispatch before registration through an intercepted provider.
The hosted `verify-external-invitation-browser.mjs` test walks the actual mobile
claim page through email-code signup to the exact selected profile and a pending
claim. Directory desktop/mobile tests cover new-contact forms and channel links.
All test identities and deliveries are synthetic.
