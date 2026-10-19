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

Pages read the public Running, Athletics and Triathlon event catalogue. Featured
events and existing major/final series classifications lead the list. They are
labelled as editorial/series selections, not a new claim that every local race
has international prestige. Other public catalogue races follow. No athlete or
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
noindex; the permanent parent retains a sample of historical race guides when no
future dates exist. Unknown paths and out-of-range pagination return HTTP 404.

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

The next-race answer uses chronological order, separately from the featured-first
cards. Closed and TBC statuses remain visible. Distances come only from eligible
running/athletics editions, never a triathlon run leg or a cancelled edition.
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
