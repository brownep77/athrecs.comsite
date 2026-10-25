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

The registry contains 941 unique sources as of 25 October 2026. Only 36 are enabled; the other 905 remain
disabled because their rights, crawl rules, selectors or technical behaviour still need
review. A disabled row must never be treated as permission to crawl.

## Scope

The registry covers running, athletics and reviewed federation, organiser and timing
sources for other Athrecs sports. Each source records the capabilities actually
inspected. It does not provide reviewed sport-specific selectors for every source.

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

- all 937 sources create exactly one source job;
- the 36 enabled and rights-approved sources are queued;
- the other 895 sources are retained as blocked jobs with their reason;
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

## Organiser and timing archives, 23 October 2026

Added Longford Marathon, TIMING Ljubljana, Dorsal21, Phoenix Running, Atlas Running,
the Irish Mountain Running Association and We Run Wild NI as disabled manual
research sources. Registry and wider event-inventory checks retain the existing
TIMING Ljubljana, Phoenix and We Run Wild provider records. Coverage describes
only the editions and original reports actually inspected; it does not establish
a complete archive. The registry contains 334 sources: 36 enabled and 298 disabled.

Preserve chip, gun and unqualified time labels, race-distance classifications and
placing scopes. Fixed-time distance totals are separate from elapsed-time results.
IMRA live retrieval returned HTTP 403; cached event information does not verify a
participant result. Athlete-specific captures and identity decisions remain in
staff evidence. The owner excluded MarathonView from the current individual-athlete
review; that scope is recorded privately and its existing registry row remains
disabled. None of these registrations enables automated collection.


## Race Results / EMIT UK, 23 October 2026

Registered the opened RaceResults.uk index, branded race-results.info, and its
explicit relationship with EMIT UK. The current index includes 2026 running,
triathlon, athletics and orienteering listings, with links to RaceSignup reports
and its own static reports. The current EMIT results route replaces the broken
older route found in organiser manuals. Registry and wider-inventory domain
checks precede registration; existing event identities are not duplicated.

This source remains disabled for manual rights and selector review. No individual
performance was imported from it in this batch, and archive-year links do not
establish complete coverage. The registry now contains 335 sources: 36 enabled
and 299 disabled.

## Further Irish and Northern Irish result archives, 23 October 2026

Added the Belfast and Dublin organiser archives, Run4Time and the Elite Timing
`elitetiming.co.uk` result archive as disabled manual research sources. Existing
Belfast and Elite Timing wider-inventory records and existing Dublin event links
are retained. Both Elite Timing hosts use Ireland branding, but their published
company descriptions and contacts differ; no alias or common-ownership statement
was found. Keep the source hosts separate pending provider-identity review without
asserting that they are distinct companies.

Also registered the Connemarathon organiser results index, the Racetimer result
host embedded by MyRunResults, and the Cork Athletics co-organiser result table.
Existing Connemarathon and Racetimer wider-inventory records are reused; no Cork
Athletics domain match was returned. Embedding does not establish that Racetimer
and MyRunResults are aliases or share ownership. Existing RedTag, MyRunResults,
Pop Up Races and RACE RESULT registrations retain the timing-provider roles.
Coverage is limited to the indexes and edition-specific reports actually opened.
The registry now contains 342 sources: 36 enabled and 306 disabled.

Original timer headings control chip/gun distinctions when legacy archive columns
differ. Keep separate same-day races, mixed-distance classes, fractional precision
and provisional status, including the organiser's 2026 Connemarathon qualification.
Static co-organiser placings and current timer placings retain their source context.
A result page does not resolve an ambiguous athlete name; identity comparisons and
participant captures remain in private staff evidence. No automated collection
setting is changed.


## Multiday and further historical result archives, 23 October 2026

Registered SPORTident, Extreme North Events, Waterford Viking Marathon, DATASPORT
Poland, Big Bear Events and the unavailable Enigma Running archive as disabled
manual research sources. Existing wider-inventory SPORTident, Big Bear and Enigma
hosts are retained. The Polish DATASPORT host is outside the existing Swiss
source domain list; no shared ownership is inferred. Cork Athletics coverage was
extended in its existing row, with edition-specific Sports Timing credit.
The registry now contains 348 sources: 36 enabled and 312 disabled.

Daily Quadrathon results remain separate from their four-day aggregate. Preserve
provisional status, tied places and the displayed placing fields rather than hidden
sort values. Fixed-duration challenges retain achieved distance, laps and elapsed
time without becoming standard marathon marks. Reusable result-page headers may
advertise a later edition; use the actual dated result sheet. Conflicting report
versions retain their export timestamps and original observations. Enigma returned
502/503, so its search snippets verified no individual result. Participant evidence
and identity decisions remain in the staff backend. No collection setting changes.

## European road-guide research, checked 23 October 2026

Added 14 disabled research references for Sparta Copenhagen, HCA Marathon, SportsTiming Denmark, Aarhus City Half winners, Třeboň Nature Marathon, Stopnito, Valencia, both Barcelona races, Maratona Clube de Portugal, Runporto, SCC Berlin, Frankfurt and Cologne. Paired organiser archives share records. Existing RunCzech, Sportmaniacs, SportHive and Mika Timing records retain their original configuration and check history, with dated coverage notes appended.

The notes preserve the access and evidence limits: SportsTiming human verification, SportHive application shells, provisional Porto classifications, Aarhus winners-only coverage and Berlin archive reuse restrictions. No participant result is verified by these registrations, and no automated collection is enabled.

Restored the reviewed additions on 24 October 2026 and reconciled them with the newer registry, preserving the intervening source additions. This recovery is not a new live source check. The current registry contains 841 sources: 36 enabled and 805 disabled.

## County swimming and triathlon expansion — 24 October 2026

Registered 30 additional source pages: 21 for Norfolk, Suffolk, Essex, Cambridgeshire
and Hampshire swimming, and nine for federation-linked triathlon fixtures, results and
athlete discovery. The existing World Triathlon athlete-search source was enriched
with separately checked profile-research evidence; its canonical identifier, original
check notes and collection settings are retained. The swimming pass adds five county organisations and ten confirmed
2027 meeting weekends. Norfolk and Suffolk 2027 date leads remain unpublished until
exact competition dates are established.
Two historical Llanelli triathlon programmes on 9 May 2026 are also retained as
separate editions, supporting the reviewed results without duplicating the event.

The triathlon sources include World Triathlon athlete search, British Triathlon
Super Series results, two distinct Llanelli timing programmes, the Titanium result
index, Triathlon Scotland profiles and championship archives, and official Tarragona
and Nyon course information. Existing Titanium entries in the wider event inventory
are retained; they are not counted as newly discovered providers.

All 30 new registrations and the existing World Triathlon athlete-search source remain
disabled for automated collection. Preserve original
capture dates separately from this review date. Private athlete identity checks,
source exports and publication receipts are held outside the public repository.

## Club member marathon histories, 24 October 2026

Registered Club Super Marathon Italia as one disabled manual research source. Its
public rankings index links club member totals and historical race logs through
TeamOrg / ProgettoD and the observed tmo-048.cloud host. These linked service hosts
are recorded together rather than added as duplicate sources. Registry and wider
event-inventory checks found no existing matching entry.

The club records support historical research; they are not original timing reports
or proof of a complete current history. Resolve date and distance anomalies against
organiser or timing-provider evidence, and preserve minute-only times without
inventing seconds. Aggregate counts do not establish additional participations.
Individual captures and identity decisions stay in private staff evidence. Automated
collection remains disabled pending rights and selector review. The registry now
contains 905 sources: 36 enabled and 869 disabled.

## Tri-Island Running organiser archive, 24 October 2026

Registered the opened Tri-Island Running general results index as a disabled manual
research source. Its Frosty Triple archive lists dated daily reports for 2017–2022
and separate three-day standings. The 2020 edition is explicitly virtual. Registry
and wider event-inventory checks found no existing matching provider.

Use the original organiser reports to establish each edition, day, distance, finish
status and timing basis. Daily race results, series aggregates and virtual results
remain separate. The index alone does not verify an athlete result. Individual
captures stay in private staff evidence; registration does not enable automated
collection or establish participant-reuse rights. The registry contains 905 sources:
36 enabled and 869 disabled.


## Archived organiser tables and supporting club reports, 24 October 2026

Registered six disabled manual research sources: East Antrim Marathon Series,
Wicklow Hospice Foundation, Springwell Running Club, Mallusk Harriers, North Belfast
Harriers and the NLB Ljubljana Marathon organiser archive. Registry and wider
event-inventory checks found no existing matching organiser or club entry. The
existing TIMING Ljubljana registrations and their check history are retained.
The registry now contains 911 sources: 36 enabled and 875 disabled.

East Antrim and Wicklow use actual dated Internet Archive captures of the original
organiser pages. Retain the original provider hosts, capture timestamps and the
separate review date; Internet Archive is not an additional race organiser.
The three clubs provide contemporary reports for edition-date and distance
corroboration, not complete result archives or timing-provider services. Coverage
is limited to the editions and reports actually inspected.

Keep daily races, mixed-distance classifications and unlabelled distance units
separate. A page title or publication date is not necessarily the race date.
Ljubljana's organiser table retains its unofficial-results qualification and
separate Netto and Result headings; its men-only rank is not an overall rank.
Registration does not verify any participant, establish reuse rights or enable
automated collection. Individual captures and identity decisions stay in staff
evidence outside source control.


## Further original-result and edition evidence, 24 October 2026

Added seven disabled manual references: Run Armagh’s archived result tables,
North Down AC’s contemporary reports, Denzil’s 12 in 12 calendar, Running Miles’
archived results, How Hard Can It Be Events’ organiser/entry information, Jerry
Forde’s first-hand marathon list and RunIreland’s submitted event announcements.
These sources have distinct capabilities; calendars and personal logs do not
verify another participant’s finish. The How Hard Can It Be Events entry reuses
the wider inventory’s observed codrc.co.uk source. Archive capture dates remain
separate from event dates and review dates.

Enriched the existing Club Super Marathon Italia, Racetimer, North Belfast
Harriers, Webscorer and JustRuns rows with the actual additional capabilities
inspected. Original organiser/timer reports are distinguished from club-maintained
logs, series aggregates and participant reports. Noncompetitive/manual-timing
qualifications, mixed-distance categories, provisional status and original time
precision must survive result review. Existing check dates, collection settings
and provider identities are preserved. In particular, JustRuns’ enabled worker
remains limited to its reviewed featured-event-card collection.

The registry now contains 918 sources: 36 enabled and 882 disabled. No newly
registered source is enabled, and no individual athlete evidence is included
in this source-control change.


## Further original archives and supporting club reports, 24 October 2026

Registered Dunstable Road Runners, Time2Run Events, Great Barrow Challenge,
Scrabo Striders, Celtic Warrior, Tic Toc Timing and Athy Triathlon Club as seven
disabled manual research sources. The registry now contains 925 sources: 36
enabled and 889 disabled.

Dunstable provides an organiser results index and an inspected provisional 2014
marathon PDF. Time2Run’s archived original indexes link timing reports, including
an opened 2018 RACE RESULT timed-event table. Great Barrow’s inspected seasonal
index supports discovery; the captured Christmas pages did not expose their
embedded individual results. These capabilities must remain distinct.

Celtic Warrior’s existing wider-inventory identity is reused, and its linked CDN
is recorded only as an asset host. Tic Toc remains a separately credited timing
provider. Scrabo’s existing inventory identity is also reused. Scrabo and Athy
provide first-hand club reports for edition and identity corroboration; they are
not official timing archives. The Athy PDF was opened through the web source
reader, while a separate direct download returned 403.

Existing Cork Athletics, Run Armagh, Athletics NI and my.raceresult.com entries
received scoped capability notes. Their original evidence, check dates, URLs,
rights and collection settings are retained. Marathon Club Ireland remains with
its existing disabled managed source; no duplicate static or database source is
created. Broader-inventory reuse preserves existing URLs and settings while
adding provenance. Registration alone never verifies a participant, approves
bulk reuse or enables collection. No private participant evidence is committed.


### Further historical result capabilities, 24 October 2026

Five disabled manual sources cover the Isle of Man organiser archive, Ultimate Sport Service results, the Ove Schneider copied report, Monaghan Phoenix and Dingle Marathon. Existing Ultimate and Dingle inventory identities are reused. Czech federation, Sparta, RunPorto and RunCzech entries gain dated capability notes; Cesky beh remains part of the existing Czech federation identity. The registry now has 930 sources, with 36 enabled and 894 disabled. Original and republished reports, stage totals, wave ranks and timing labels remain distinct. Registration does not enable collection or verify an individual result.

## London 2025 secondary result sources, 24 October 2026

Registered one disabled Pace Notes research source, with Andrew Kam's publisher
credit, Figshare licence reference, reviewed London 2025 coverage and the
publisher's incomplete/held qualification. Updated the existing MarathonGuide
source with its observed London 2025 results capability while retaining the
previous fixture-directory evidence and source identity. Neither source is
enabled and neither registration verifies individual results or identities.

The [source evidence note](london-2025-research-sources.md) records the opened
pages, original capture/review dates, timing qualifications and coverage limits.
The source registry and wider repository event inventory were checked for
duplicates. Private participant records remain outside this repository.

The registry now contains 931 sources: 36 enabled and 895 disabled.


### Brentwood historical results research — 24 October 2026

Six disabled manual references register the organiser archive, archived JAND timing tables, Sporting Roots index-only leads, Witham RC, Brentwood Beagles and Bakers reports. Existing FR Systems and Sporthive identities are reused. Named rows and timing headings were inspected; the 2026 club reports are partial and the Sporting Roots transcripts remain inaccessible. The 2010 and 2013 source versions disagree on some positions; disputed positions and unresolved identities are not verified. Collection remains disabled for all six additions.

### Brentwood held-result resolution — 25 October 2026

Added East End Road Runners' historic results and the Saffron Striders 2011 archive as two disabled manual research references after checking the registry for existing URLs. Opened club tables corroborate selected Brentwood performances and the 2011 edition date. Recovered headed organiser pages for 2010 and 2011 remain part of the existing Brentwood organiser source. Conflicting times and placings remain held or omitted; no collectors were enabled.

Manual Brentwood continuation sources: Serpentine club results and Northbrook AC historic race reports. Both remain disabled; FR Systems already has a canonical source, so no duplicate provider was registered.
