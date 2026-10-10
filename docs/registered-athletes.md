# Registered athletes staff dashboard

Open `https://update.athrecs.com/admin/athlete-accounts` with an allowlisted Google account, or choose **Signed-up athletes** in the staff menu. The default view covers every authentication account, even when no private profile has been saved. **Saved account details** retains the existing Entry Passport, preferences and consent view.

The read-only dashboard provides name, authentication email and its actual verification state, permanent ATH reference, signup timestamp, profile status, club/location, recorded sign-ins, linked profiles/results, distinct claimed race editions, all five claim states and sports. Search names, emails, clubs or ATH references; filter unfinished/unverified accounts or claims awaiting action; sort and paginate in groups of 25. Review claims opens that account's requests under the existing identity-review rules.

Definitions:

- Signup date is Better Auth's `user.createdAt`, never profile creation or update time.
- Recorded sign-ins are inserted authenticated sessions since `athlete_login_tracking.started_at`. This includes a session created during signup or verification. It is not a lifetime login total, page-view count or active-session count. No historical sessions are backfilled. Reads, failed authentication and session updates do not increment it; logout/expiry do not erase it.
- Last recorded sign-in only covers that same tracking period. Earlier activity remains unknown.
- Claimed races are distinct edition IDs across approved, pending and needs-info requests. Rejected/withdrawn requests remain visible in their own status totals.
- Linked results and result sports come from active ownership links, excluding DNS; they describe stored records and do not certify every performance as independently verified. Revoked ownership and pending-only claims do not add linked sports. Self-selected sports are shown separately.
- The summary cards cover all registrations; the matching count and pages reflect the chosen filters. No imported athlete without a login account is represented as a signup.
- Timestamps display in Europe/London, with automatic GMT/BST handling.

Migration `20261009_athlete_login_activity.sql` adds a per-account aggregate and session-insert trigger. The update is atomic with the session transaction, keeps the latest timestamp if inserts arrive out of order, and cascades on account deletion. It stores no tokens, IP addresses or user agents. Existing sign-in, claim, consent and publication rules remain unchanged. The schema is additive and compatible with the previous app version.

Staff RPCs reject unapproved hosts, unauthenticated/non-allowlisted users and cross-site calls through the existing middleware. Private no-store and robots headers apply before authentication, including rejected responses. The new endpoint reads bounded account summaries with parameterized filters and one consistent read-only database snapshot; it does not expose sensitive profile fields, session identifiers or authentication secrets.

Verification: `npm run verify:registrations` tests actual auth endpoints, staff RPCs and SQL in a disposable PGlite database. `node scripts/verify-registrations.mjs --browser` additionally tests the actual staff page, search, claim navigation, saved-details view and mobile layout. All test records are synthetic, email is disabled, and external calls are rejected. The browser executable can be supplied through `ATHRECS_BROWSER_EXECUTABLE` for local runtime compatibility.

## Signup history and contact actions

The headline total now sits beside today's and this month's signups. **Signup history** offers daily counts for a selected month and monthly counts for that year, including zero-signup periods and cumulative totals. Choose a row to filter the named signup list, or enter an inclusive **Signed up from/to** range. Calendar cutoffs use `Europe/London` in SQL (including BST changes); these statistics cover all held authentication accounts independently of the list's name/status filters. Historical values are computed from persisted registration timestamps, so no scheduler or analytics consent is needed. Deleted accounts are excluded; these are not immutable lifetime acquisition counts.

Each registration has email, SMS, WhatsApp and Telegram actions, social-profile links, and a Viber copy-number action. Missing contact information disables the relevant action. **Edit contact details** stores an international phone number, optional Telegram username, optional Instagram/X/Facebook/LinkedIn links and a source note. These staff-only details are separate from athlete-supplied social links and public profile data. Saving never changes the account login email, consent, ownership, publication or athlete-supplied connections. The row shows existing marketing consent. Account deletion removes staff contacts too.

Sender reference: **+44 7581 764764**. App links cannot set or verify a sending identity. Select that SIM for SMS and sign into that number in WhatsApp/Telegram/Viber before sending; email uses the mail app's selected sender. These actions only open the recipient/draft/profile. They do not send messages, claim delivery, schedule outreach, charge SMS fees or connect a messaging provider. WhatsApp/Telegram depend on recipient account availability and privacy settings. For Viber, copy the number and find it in the installed app; there is no unverified direct-chat integration.

Link formats checked against official documentation:

- WhatsApp click-to-chat: https://faq.whatsapp.com/5913398998672934
- Telegram usernames and phone-number links: https://core.telegram.org/api/links
- Viber's published deep-link API (bot-focused): https://developers.viber.com/docs/tools/deep-links/

Migration `20261009_athlete_staff_contacts.sql` is additive. Phone/username/URL/source validation and staff authorization run on the server. Contact inputs never enter analytics or public endpoints, and social links are restricted to their named network hosts. The registration test covers private mutation boundaries, readback, removing contact values, source/URL/phone validation, link destinations, leap years, UK midnight/BST cutoffs, zero-fill, date drilldown and the actual desktop/mobile contact editor. Synthetic addresses/numbers are used without opening messaging links or sending messages.
