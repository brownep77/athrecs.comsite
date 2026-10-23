# Add events to a personal calendar

Each upcoming distance/edition on the shared event detail page has an Add to
calendar action, including localised pages, athletics, running, parkrun and
multisport records. Curated marathon, half-marathon and UK road-ultra guide dates
have the same action. Non-running pages expose remaining loaded dates through
Show all listed events. Future records using these templates inherit the action.

Google Calendar, Outlook.com and Microsoft 365 open a prefilled event for review.
Apple Calendar and other compatible apps use a downloaded RFC 5545 `.ics` file.
No AthRecs login, calendar permission, paid provider, new database query or calendar
account connection is required. The athlete must review and save the event.

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
- These are one-off copies, not subscriptions. Later changes/cancellations do not
  update an already saved event. Stable UIDs help identify exports, but repeat
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

Browser checks use the actual React control and race schedule with synthetic data:
provider links, downloaded ICS contents, changed distances, cancelled/invalid
states, provisional dates, 320–1280px layouts, focus restoration, and recoverable
file-download errors. They do not save anything to a personal calendar.

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
