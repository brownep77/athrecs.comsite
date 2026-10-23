# Athrecs fixture and result source registry

This directory records the discovery sources supplied by Paul Browne on 19 August 2026 and
the governed international athletics expansion reviewed on 2 September 2026, and
four worldwide timing and organiser discovery sources checked on 6 October 2026.
The October additions are Yverá Crono, Chronoplace, SudChrono and Hyve Sports
Philippines. All four remain disabled for manual rights and selector review;
Hyve Sports is an organiser source, not a confirmed chip-timing company.
TimingFP (Chile) and OrycronSport (Spain) were checked on 7 October 2026 and
added as two more disabled discovery sources. Their fixture and result routes
are recorded for manual rights and sport-specific selector review.
The canonical machine-readable file is:

- docs/source-registry/fixture-result-sources.csv

Independently verified corrections to staged workbook editions are recorded in:

- docs/source-registry/workbook-event-overrides.json

Each override is pinned to a source ID, edition ID, event name and date, retains the
exact public evidence URL and checked date, and clears only the named review fields.
Unresolved review issues continue to block publication.

The registry contains 327 unique sources. Only 36 are enabled; the other 291 remain
disabled because their rights, crawl rules, selectors or technical behaviour still need
review. A disabled row must never be treated as permission to crawl.

## Scope

This uploaded registry is a running and athletics discovery pack. Its fields describe
road, trail, fell, cross-country, track, mixed-terrain and beach events. It does not
provide safe sport-specific selectors for every Athrecs sport.

Athrecs currently supports Running, Cycling, Swimming, Triathlon, Duathlon, Parkrun,
Aquathlon, Aquabike, Rowing, OCR and Athletics. Fixtures for the other sports must use
separately reviewed federation, organiser or timing sources rather than reusing a
running profile.

## Athletics rollout order

1. Use the enabled World Athletics global calendar as the international event spine.
2. Cross-check World Championships, Diamond League and the specialist World Athletics
   tours against their official series pages.
3. Fill European, national-championship and local-meeting gaps from continental and
   national federation calendars only after each source passes rights and selector review.
4. Hold Roster Athletics, AthleticNET, TFRRS, DirectAthletics, MileSplit and similar
   platforms until an API, licence or reuse agreement is confirmed.
5. Prioritise professional athlete records and official profile links. Amateur athlete
   rows need separate provenance, reuse and privacy review; youth rows receive heightened
   safeguards and are not enabled by this registry.

## Spectator access

Spectator access is edition-specific and is never inferred from athlete entry status.
Public `Free to watch`, `Tickets available` and related labels require an HTTPS evidence
source, a checked date and an explicit verified flag. Athlete entry and spectator ticket
links remain separate even when the organiser uses the same website for both.

## Safety rules

1. Use enabled sources only.
2. Respect allowed_domains, max_pages, rate_limit_seconds and any published crawl delay.
3. Discover event-level fixture or result metadata only.
4. Do not ingest participant, runner or athlete result rows without a separate data-rights review.
5. Corroborate dates, status, venue and entry links with the organiser or governing body.
6. Stage small reviewable batches and retain the source URL and checked date.
7. Run the source registry, catalogue, TypeScript and production-build checks before review.
8. Publish to production only after the preview and database changes have been separately approved.

The CSV is a controlled source inventory, not a scraper, a results licence or evidence
that every listed site may be crawled.

## Admin review screen

The live admin source inventory at `/admin/sources` exposes every registered source with
search, runnable/held status filters, country and region filters, the current review reason,
published crawl-information link where available, and configured page/rate limits. The
screen is read-only: viewing or filtering a held source cannot enable it or bypass review.

## One-click bulk run

The admin bulk-run control snapshots every registry row into a durable Neon run:

- all 327 sources create exactly one source job;
- the 36 enabled and rights-approved sources are queued;
- the other 291 sources are retained as blocked jobs with their reason;
- changing a reviewed CSV row to `enabled=1` makes it runnable in the next run without
  changing application code;
- a unique `(run_id, source_id)` constraint prevents the same website source from being
  added twice to one run.

Creating the run does not publish races. Source workers must still respect each job's
domain, page and rate limits, then send candidates through staging, provenance and
race/edition duplicate review before publication.

## Verification

Run `npm run verify:sources`, `npm run verify:bulk-source-run` and
`npm run verify:workbook-overrides`. The verifiers check the schema, row count, source IDs, URLs,
domain allow-lists, limits, coverage years, regular expressions, rights status and the
participant-level exclusion rule, complete one-job-per-source bulk-run coverage, and the
audit metadata for every event-level enrichment.

## Historical-result research additions, 20 October 2026

Registered UK Results, SportSoft / Race Results, Joe Lee Computing and Sunderland Harriers results after opening their indexes and sample result pages. All four are disabled for automated collection. Website registration does not verify an athlete result or approve bulk participant reuse. UK Results and SportSoft already had wider event-register entries; those are retained without duplicate websites. Joe Lee and Sunderland Harriers are new to that inventory.

Added New Marske Harriers, Hartlepool Burn Road Harriers and Whats My Time Results as manual research leads. Their discovered archive/result URLs are retained with the observed retrieval failures (406, timeout and 403 respectively). No participant row was verified from those unavailable pages, and automated collection remains disabled.

When researching results, check the source inventory and register any missing result website with its actual URL, provider credit and checked evidence. Preserve existing review and collection settings.

## Trackie results, 21 October 2026

Added Trackie after inspecting its current index and downloadable reports. The supervised import stores private source observations, original PDFs, exact source precision and page/row locators. Name matches do not link accounts. Public reuse and recurring collection are separate decisions; the general source worker remains disabled. Current-page coverage and any held layouts are recorded in the private capture-run receipt.

The Lakefront listing redirects to SportMadeSimple / AthleticLIVE. Its observed
result URL is registered separately, disabled pending dynamic-table and rights
review; no result rows were obtained from that destination.

## US timing sources, 23 October 2026

Registered Xact Results and Laurel Results after opening selected organiser-linked
result tables. Both remain disabled for automated collection. Xact hash routes
require explicit edition-title checks; Laurel table columns take precedence over
generated recap text. Existing Laurel event-catalogue links are retained without
duplicating event identities. Individual athlete evidence remains in the private
backend and is not included in this source inventory.

## Fixture, result and athlete research coverage, 23 October 2026

| Source | Checked use |
| --- | --- |
| RunSignup | Fixtures, official result cards and athlete research |
| World Athletics | Calendar fixtures, official results and athlete profiles; enabled worker remains event-only |
| Athlinks, ChronoTrack, Xact and Laurel | Result tables and athlete-result research |
| McCourt Foundation, Mountains 2 Beach and Eugene Marathon | Organiser fixtures and official result-archive discovery |
| Abbott World Marathon Majors | Rankings, athlete result research and qualifying-race discovery |
| Instagram | Manual athlete-post leads; primary results still required |

The existing RunSignup, Athlinks, ChronoTrack and World Athletics rows were enriched,
not duplicated. The existing managed WMM source identifier is reused. Existing
Eugene, Instagram and WMM event-inventory hosts are retained. All seven new CSV
entries remain disabled; registration does not start recurring scans or verify a
participant. The source list contains no athlete-specific private evidence.


## Marathon archives and secondary leads, 23 October 2026

Added B.A.A. organiser/results coverage, official Chicago Marathon results and
Endorphins as secondary leads only. Existing wider-inventory entries are reused;
Chicago's current and historical hostnames describe one results service. All three
new registry entries remain disabled, bringing the registry to 322 sources: 36
enabled and 286 disabled.

Expanded McCourt's existing entry for its organiser-linked Santa Monica result
portal. Actual finish times must remain separate from modelled LevelField times.
The current page header may advertise a later edition than the archived results.
Award summaries can differ from individual timing records, and aggregated
histories can duplicate one performance under several years. Neither is a reason
to overwrite an independently checked result silently.


## Surf City and further discovery sources, 23 October 2026

Registered the Surf City organiser archive, MyRace, MarathonView and Raceview Australia.
Existing Surf City and MarathonView wider-inventory entries are retained. The latter
three are secondary research leads: same-name histories, generated analysis and
placeholder values do not establish verified participation. Raceview’s sampled
individual lookup was blocked; no access restriction was bypassed. All four remain
disabled. The registry now has 326 sources, with 36 enabled and 290 disabled.

The organiser directly links the 2026 Surf City results to Laurel. Results are
checked by table headings and individual result cards, preserving chip/gun times
and overall, gender and division placements. Generated recaps are not evidence.
Private participant captures and identity decisions remain in the staff backend.

## Further Surf City research, 23 October 2026

Added My BEST Runs as a disabled secondary research source, reusing its wider-inventory host. Its rolling leaderboard is a discovery aid, not a race placing table; cached retrieval and live HTTP 503 responses are recorded separately.

Expanded the existing Race Roster source with the observed Online Race Results archive redirect and results-host aliases, without creating a duplicate collector. The sampled legacy participant page failed to load, so no result was imported from it. The registry now contains 327 sources: 36 enabled and 291 disabled.

Further Surf City results use official female-filtered tables and independent individual result cards. Existing source IDs and uncertain athlete matches are retained for review; no duplicate performance is created. Participant evidence stays in the staff backend.
