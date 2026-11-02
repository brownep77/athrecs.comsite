# Prominent Intercom welcome displays

AthRecs provides these entry points through its existing Intercom Messenger.
The display layer lives on the website; it does not create an additional
Outbound campaign, change the existing Fin workflow, or send a chat message on
the visitor's behalf.

## Visitor experience

- A dismissible banner appears above public browsing content. It introduces
  athlete profiles, missing results and race help, with an **Ask AthRecs** button.
- Desktop visitors also see four choices: **Find my athlete profile**, **Report
  missing results**, **Find a race**, and **Suggest a correction**. Choosing one
  opens the Messenger composer with a relevant draft. The visitor sends it.
- On a visitor's first eligible desktop view, the existing Messenger opens
  after five uninterrupted eligible seconds. The timer starts only after the
  AthRecs authentication check resolves and the Intercom SDK reports ready.
- Mobile and tablet widths below 1024px receive a compact, dismissible welcome
  card with the four choices instead of an automatically opened Messenger.
- Signed-in athletes receive generic profile/results help in the banner. Their
  Messenger never opens automatically from this introduction.
- Dismissing the banner leaves a compact **Ask AthRecs** entry point. The standard
  Intercom launcher remains available.

## Respecting browsing and account state

The introduction is suppressed on account, authentication, staff, editing,
claim and privacy routes. Its timer pauses while the document is hidden or
unfocused, a form field is focused, or a visible dialog is open. An eligible
five-second window is required again when browsing resumes.

Opening Messenger manually, following a welcome choice or dismissing the banner
suppresses the automatic introduction. Versioned local-storage preferences store
only seen/dismissed booleans and apply across page reloads and tabs in that
browser. When browser storage is blocked, an in-memory fallback applies for the
current document. It cannot retain a dismissal after a reload without storage.

The welcome layer never boots Messenger or generates identity itself. Existing
account validation remains responsible for booting the correct visitor/member
session. SDK readiness and visibility callbacks are invalidated after account
changes, suspension and logout, so a delayed old callback cannot reopen a prior
account. Expired identities cannot be opened through either website helper.

## Unavailable Messenger

Welcome choices retain their ordinary athlete/race or support-email
destinations when Messenger is unavailable. The **Ask AthRecs** link falls back
to the existing support email address. The older contextual results/race chat
prompts show a retry and email alternative if the SDK is not yet ready.

## Verification

Run the focused identity/session checks with `npm run verify:intercom`. They
exercise the actual browser module with synthetic account/session boundaries,
including late SDK callbacks, logout, expiry and manual opening.

Run `npm run verify:intercom-welcome` for the isolated browser check. It exercises
the actual React display components and CSS with synthetic authentication and SDK
boundaries. It must never contact the production Intercom workspace or create
test contacts. Install Playwright Chromium first, or provide an existing local
browser through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

For a live smoke check, use a fresh browser context, remain on an ordinary public
page, and wait for Messenger to load plus five eligible seconds. Check desktop
opening, mobile welcome placement, dismissal and navigation without sending a
message. The earlier signed-in identity installation test still requires the
owner's authenticated AthRecs session; this display change does not substitute
for that test.
