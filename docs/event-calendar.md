# Add events to a personal calendar

Each upcoming distance/edition on the shared event detail page has an Add to
calendar action, including localised pages, athletics, running, parkrun and
multisport records. Curated marathon, half-marathon and UK road-ultra guide dates
have the same action. Non-running pages expose remaining loaded dates through
Show all listed events. Future records using these templates inherit the action.

Google Calendar, Outlook.com and Microsoft 365 open a prefilled event for review.
Apple Calendar opens `/my-race-calendar?race=<canonical-id>` to add the selected
race to a private subscription. Sign in, explicitly add the race, then use Open
Apple Calendar and confirm the subscription in the calendar app. Subscribe once;
subsequent selections use the same calendar. The HTTPS address is also available
for manual subscription in compatible apps. Calendar refresh timing belongs to
the client and changes are not instant.

Download calendar file (.ics) remains a separate one-off fallback. Google,
Outlook and downloads require no AthRecs login; private subscription management
requires sign-in and JavaScript. No OAuth calendar-write permission is requested.
Neither opening a race nor signing in automatically saves it or enters the race.

## Date and source rules

- Export exactly the selected distance and edition, using the existing
  edition-specific organiser start overrides. Do not propagate a time to another
  year. Include only public event fields, the canonical event page, the organiser
  website and an explicitly verified official entry option where available.
- Convert a known local start and trustworthy IANA zone to UTC using Intl's actual
  timezone rules. Never use the presentation helper's London/country defaults.
  Split/unknown regions require an explicit timezone or a date-only reminder.
- Unknown times, published start windows and ambiguous/nonexistent DST clocks
  become clearly labelled date-only reminders. Never invent a midnight start.
- Date-only multiday events use the day after the inclusive end as DTEND.
  Timed events omit DTEND when the finish is unknown; web links carry a zero-length
  start marker. Calendar clients may choose their own default editable duration.
- Reject invalid/reversed dates and cancelled/postponed/finished statuses.
  Provisional curated dates remain explicitly provisional and ICS TENTATIVE.
- Google/Outlook exports and downloads are one-off copies. Later changes/cancellations
  do not update an already saved copy. Stable UIDs help identify exports, but repeat
  import behaviour belongs to the calendar client and cannot guarantee deduplication.

## Verification

Run `node scripts/verify-event-calendar.mjs --mutations`,
`node scripts/verify-event-calendar-browser.mjs`, `npx tsc --noEmit`, and
`npx vite build`. The dedicated CI workflow runs these without production secrets,
DB migrations or data publication. Optional ATHRECS_CHROMIUM_EXECUTABLE selects an
installed browser; otherwise Playwright's installed Chromium is used.

Adversarial checks cover DST transitions (including missing/repeated local clocks),
non-hour offsets, overseas dates, leap days, midnight, exclusive all-day ends,
multiday events, malformed Unicode, malicious text/links, UTF-8 folding, filename
safety, calendar URL parameters, organiser overrides and future-year isolation.
Mutation checks must reject deliberately broken offsets, ambiguous clocks, end
dates, cancellation checks, UTF-8 folding, URL validation and unique identifiers.

Browser checks use server-rendered controls and the actual race schedule with synthetic data:
provider links, downloaded ICS contents, changed distances, cancelled/invalid
states, provisional dates and 320–1280px layouts. The choices and server downloads
must work with JavaScript disabled and delayed; opening before hydration must be
preserved after hydration. They do not save anything to a personal calendar.

A user reported that the calendar choices did not appear. The fully hydrated race
page worked in a local production build, but the original dialog had no usable
fallback before hydration or when scripts failed. The control now uses native
`details`/`summary` and renders every provider choice on the server. The explicit
download uses a normal POST form returning a calendar attachment, without Blob URLs or
client download handlers. The endpoint validates public fields, rejects unavailable
events and malformed/oversized bodies, and makes no database queries.

`verify-event-calendar-built.mjs` exercises the production-built shared race page
and guide page with scripts enabled and disabled, including real HTTP downloads.
`verify-event-calendar-download.mjs` covers the download handler and bounded input.
The specific cause in the reporting user's browser was not captured.

Found and fixed before rollout: malformed-surrogate event identifiers crashed URI
encoding; closing the initial dialog did not return keyboard focus to its trigger.
Additional pre-release checks: the production Vercel build was served locally and
the marathon/half-marathon and ultra guide dialogs were exercised after hydration.
A retained catalogue sweep checked 26,872 edition records across 11 sports:
24,807 produced exports and 2,065 were disabled by date/status safeguards. This
is an export-code check, not verification of the underlying event facts or a
claim about the live database.

Eight exported files round-tripped through the independent ical.js 2.2.1 parser,
covering UTC, all-day, multiday, year rollover, DST fallback, provisional dates and
Unicode/escaping. The 378-case suite also passed under Pacific/Auckland and
America/Los_Angeles process timezones.

Native Apple Calendar/iOS Safari and authenticated Google/Microsoft Save screens
are not covered by these automated Chromium tests. Provider-link formats can
change; the standards-based ICS option is always available as a fallback.

## Private subscriptions

`athlete_race_calendars` and `athlete_race_calendar_items` are separate from public
planned races. Authenticated server functions derive ownership from the verified
session and enforce same-site requests. Reads never create tokens or selections.
Only canonical race IDs are accepted, with at most 200 selections per account;
mutations lock the owner row and duplicate additions are idempotent. The additive
migration cascades deletion when the account is deleted.

A 256-bit random bearer link permits calendar clients to fetch without a browser
session. Anyone possessing that link can read the selected races; the UI explains
this. Reset creates a new link and revokes the old one; disable revokes access
while retaining the selection. Neither operation erases cached client events;
the user removes the subscribed calendar in their calendar app. Links are never
placed in public profile data, SSR payloads or analytics events. HTTP access
infrastructure may log requested paths, so these tokens are treated as secrets.

The feed resolves a bounded list of canonical editions on every fetch. Catalogue
corrections retain the edition UID. Cancelled or unavailable editions disappear;
curated IDs include their edition date, so a removed curated edition is omitted
rather than silently replaced with a different year. Withheld fixtures and
private/source-review fields are excluded. No supplied remote URL is fetched.
The feed contains no owner name, email, profile or results. Unknown/revoked links
return 404; server failures return 503, never a misleading empty successful feed.
A valid subscription with no selected races returns a valid empty VCALENDAR.

`verify-event-calendar-subscription.mjs` uses isolated PGlite to test 16 adversarial
scenarios: canonical input, ownership, limits, idempotency, correction/cancellation,
withheld dates, revocation, empty feeds, injection, UTF-8 folding and stable UIDs.
`verify-event-calendar-subscription-built.mjs` drives the actual production bundle
with two local test accounts, real session cookies and the sign-in UI. It checks
selection preservation, explicit saving, HTTP feed contents, anonymous/cross-site
mutation rejection, account isolation, removal, revocation, shared guide feeds,
and 320/390/1280px layouts. Outbound server requests are blocked and no email is
sent. Run it after compilation and `node scripts/copy-pglite-assets.mjs`.

The automated test verifies the native `webcal:` link and the full HTTP feed,
but cannot confirm launching or saving in native Apple Calendar on iPhone/Mac.
The subscription-address instructions and explicit download remain available.
