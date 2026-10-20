# Permanent race location pages

The directory at `/races/places` links continents, countries/territories, UK home
nations and catalogue-backed states, counties and areas. For example:

- `/races/places/europe/united-kingdom/england/norfolk`
- `/races/places/north-america/united-states/california`

Location URLs contain no year and persist when their races have no upcoming
edition. Country/territory geography uses UN M49 (read 19 October 2026), with
North/South America separated for navigation and explicit Kosovo/Taiwan entries.
These groupings do not assert sovereignty. State matching reuses the collector's
existing ISO subdivision registry. Explicit counties within supplied states are
supported when the county label identifies a county, parish or borough.

Pages read the public Running, Athletics and Triathlon event catalogue. The main
calendar is chronological. Featured events and existing major/final series
classifications appear in a separate section, labelled as editorial/series
selections rather than a claim that every local race has international prestige. No athlete or
account records are queried. RunRecs routes and the server function reject this
AthRecs-only directory.

## Automatic behaviour

- A race is upcoming while a non-cancelled, non-finished edition remains on or
  after the current local date, including an evidenced multi-day end date.
- Once its last listed edition ends, it moves to the awaiting-dates/archive
  view. Its existing race URL and recorded editions are not deleted or changed.
- Adding another edition to the catalogue brings it back automatically. No date
  is extrapolated from the previous year, and there is no fixed 2027 cutoff.
- Closed entry remains listed as a scheduled race. Cancelled editions do not
  qualify for upcoming listings and are labelled in the archive where available.
- The public catalogue snapshot lasts at most 60 seconds per process. Date
  visibility is calculated on every request; visible tabs also refresh each
  minute and on return/focus. This is display refresh, not a new source scraper.
- Known single-zone countries and checked race-guide time zones determine day
  rollover. If a venue zone is unavailable, retain the edition until its date
  ends worldwide to avoid expiring it prematurely. Exact venue-zone coverage
  remains a separate data-quality task.

## Search discovery

Server-rendered HTML contains race links, geography links and ordinary pagination
anchors. Pages have canonical URLs, location-specific titles/descriptions,
CollectionPage, ItemList and BreadcrumbList markup. They do not emit SportsEvent
objects for a multi-event listing. Individual event pages keep their existing
event metadata.

`/sitemaps/race-places.xml` includes populated location pages. Empty locations are
`noindex, follow` and excluded from that sitemap. Archive-filter URLs are also
noindex; the permanent parent retains a separate archive section below the upcoming
calendar, including a sample of up to six guides on its first page. Unknown paths and out-of-range pagination return HTTP 404.

Unknown countries are not guessed. State codes are matched only within their
country. Venue-looking legacy county values are excluded from area-page creation;
their events remain available on their country pages. Existing catalogue location
accuracy is not independently reverified by this feature.

## Location-specific writing

Every location uses `race-places-copy.ts` for its introduction, title, description
and short runner questions. The text draws on the complete location's current
catalogue: named events, upcoming dates, explicitly listed running distances and
populated child areas. Each named event and area links to its existing page.
County/state headings include their parent area to distinguish shared names.

The next-race answer and calendar use chronological order. Closed and TBC statuses
remain visible. Running distances come only from eligible Running editions,
never a triathlon run leg, athletics meeting or a cancelled edition.
One event with several editions is counted once per distance. No course quality,
popularity, suitability, entry availability or annual recurrence is invented.

Introductions, questions and answers are present in server-rendered HTML. The
CollectionPage summary matches the visible introduction and identifies its place,
parent place and AthRecs publisher. There is no special AI/voice schema, FAQ
rich-result promise, fabricated author or artificial last-updated date. Archive
views get archive-specific copy; empty locations remain honest and noindex.

The approach follows Google's guidance on useful people-first content and AI
features, read on 19 October 2026:

- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/ai-features

This improves page information and crawlability; it does not guarantee indexing,
rankings, voice answers or AI citations. The same writing rules apply to newly
populated locations as the catalogue grows.

Run `node scripts/verify-race-places.mjs --catalogue` for the optional full seed
content/link audit. Its output is an ignored local inspection artifact, not new
race evidence. The built SSR check also verifies the visible date answers.

## Validation on 19 October 2026

- `node scripts/verify-race-places.mjs`: local synthetic SQL and independent cases
  for geographic hierarchy, date rollover, multi-day races, cancellation, new
  editions, archive preservation, pagination, public-sport boundaries and SEO.
- TypeScript, targeted ESLint, whitespace checks and direct Vite build passed.
  The direct build does not run migrations or production publishing scripts.
- `node scripts/verify-race-places-ssr.mjs`: built HTTP routes through the real
  server function into isolated synthetic SQL, checking rendered HTML, metadata,
  404 responses and sitemap inclusion. No external database connection is made.
- Local browser rendering was not verified: the Chromium download failed.
- A read-only seed-catalogue scan found 442 populated location pages: 7 continents,
  150 countries/territories, 4 UK home nations, 280 areas, and the world directory.
  This is a seed scan, not a count of deployed pages or independently verified
  geography. Live catalogue counts may differ.

No race records, athlete data, account controls or access permissions are changed.

## Sport and distance discovery — 20 October 2026

Existing geographical URLs are unchanged. A finite set of sport and distance
paths is supported under each place, for example:

- `/races/places/europe/united-kingdom/england/norfolk/running`
- `/races/places/europe/united-kingdom/england/norfolk/running/10k`
- `/races/places/north-america/united-states/california/running/half-marathon`

Sports follow exact stored Running/Athletics/Triathlon classifications. Distance
pages use explicit edition codes; no distances are inferred from event names.
Historical distance codes preserve pages outside the season even when the SQL
window no longer includes those editions. Cancelled-only distances do not qualify.

Focused pages need at least three recorded matching events to be indexable and
included in the sitemap. This is an editorial product threshold, not a Google
requirement or ranking guarantee. Smaller pages remain accessible with noindex.
Month/town combinations and archives are noindex with normalized self-canonicals;
they are not sitemap entries. Filters use a GET form, not a linked cross-product
of every month and town. Invalid path combinations and out-of-range pagination
return 404. Geographic ancestors remain places in structured data; sport and
distance are added only as navigation breadcrumbs.

The month filter matches the actual relevant distance edition, includes evidenced
multi-day overlap, and can select a later edition of a recurring race. It does
not match a different distance in the same event. Pagination keeps filters;
switching to archive clears the month. Entry information links use existing
edition URLs, accept HTTP(S) only, and appear only for an Open edition. Closed
entry and TBC statuses stay explicit; entry availability is not newly verified.

Continent navigation remains prominent. Large country/state child directories
are collapsible but remain in rendered HTML. Related areas use siblings within
the recorded parent, without claiming that they are geographically adjacent.

Reviewed Norfolk guidance lives in `race-place-guides.ts`. Its organiser sources
were opened on 20 October 2026: Wymondham AC's NYD10K page and Norwich Half
Marathon's event page. Time-sensitive notes have edition end dates and disappear
after that edition. They only appear for matching places, sports and distances.
Other places use catalogue-based descriptions and local town counts. This is not
an assertion that every location has an individually researched travel guide.

The `Race location discovery` workflow builds the actual application and verifies
SSR plus desktop/mobile browser navigation, filters, reset, pagination, runtime
errors and horizontal overflow using isolated synthetic SQL. Its browser option
is `node scripts/verify-race-places-ssr.mjs --browser` after a direct Vite build.

## Upcoming first and separate archive — 20 October 2026

Two prominent, ordinary anchor links lead to Upcoming races and Past races.
The chronological upcoming calendar and featured upcoming races appear before a
visually separate, shaded archive section. Location browsing follows these race
sections. The first page shows up to six archive guides, with a link to the full
paginated archive and a return link to upcoming races. Later calendar pages keep
the archive link without repeating its sample.

An archive guide means the race has no upcoming edition currently recorded. The
copy explicitly distinguishes past events, cancellations and dates awaiting
announcement; it does not claim every archived guide is a completed race. Past
editions of races with a future edition remain accessible through their race
guides. Town filtering applies to both sections; month filtering applies only to
upcoming races. Existing URLs, archive noindex and date-rollover rules remain.
