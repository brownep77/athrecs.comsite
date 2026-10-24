# Running guides directory

The public AthRecs directory is `/running/guides`. It connects country race guides,
individual race guides, race-series collections and country event portals from one
page. It is a directory of published content; its links do not establish that a
particular edition, start time, entry offer or athlete result has been verified.

## Source-driven coverage

The directory uses the existing content registries:

- `src/data/road-marathons/` and `src/data/road-half-marathons/` supply country
  overviews and individual road-race guides.
- `src/lib/running/road-ultras.ts` supplies the UK road-ultramarathon overview and
  its individual guides.
- `src/data/superhalfs.ts` and `src/data/race-collections.ts` supply SuperHalfs and
  the existing World Marathon Majors, UTMB World Series and UTMB Index collections.
  Series without separate editorial pages link to their sections on
  `/running/race-series`.
- `src/data/running-series-guides.ts` supplies road, trail, desert and event-family
  guides at `/running/series/:slug`. The hub and series directory receive compact
  summaries through server functions; full prose is loaded for the chosen guide.
- `src/lib/athrecs/country-sites.ts` supplies country event portals. A portal is
  distinct from a dedicated country race guide; a country need not have both.

Adding published content to these registries updates the directory through its
loader. Do not maintain a second manual race list or create placeholder guide
URLs. Keep country names readable beside decorative flags. Shared guide links,
`PUBLIC_PAGES` and the existing XML sitemap connect the directory to the rest of
the site.

All guide destinations are real links in the server-rendered HTML. Native
`details` groups remain usable without JavaScript; filtering enhances the list
without becoming the only way to reach content. CollectionPage, ItemList and
BreadcrumbList markup describe the visible directory and its actual destinations.
The directory itself is not a race edition and does not need Event markup.

## Search eligibility and indexing

Keep a unique descriptive title and description, one H1, a self-referencing
canonical, public HTTP 200 access and the existing index/follow defaults. Include
the canonical URL once in `/sitemaps/pages.xml`, with an accurate significant
content-change date. Do not substitute the request or build date for `lastmod`.

Preserve existing `noindex,follow` rules on `/running?country=...` and geographic
archive, month and city filters. Geographic sport/distance/terrain collections
retain their existing population thresholds. Linking to a legitimate browsing
tool does not require making every filter combination indexable.

Publication, crawlable links and sitemap inclusion make content discoverable and
eligible for indexing. They do not prove that Google or Bing has indexed a URL,
nor guarantee rankings, rich results, AI citations or voice answers. Describe an
indexing submission only when an authorised search-engine service has actually
received it. Plain-language headings and concise visible answers help
runners; no special voice or AI schema is required for this directory.

Relevant official guidance:

- [Google: crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: building a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: AI features and websites](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Bing: sitemap discovery and accurate modification dates](https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/)

## Search-engine notification

`scripts/submit-running-guides-indexnow.mjs` derives a separate guide-only batch
from the existing source registries. It checks the live hub's crawlable links,
XML sitemap membership, robots rules, public HTTP status and canonical/indexing
directives. Submission additionally verifies the existing deployed IndexNow
ownership file and repeats publication checks before one POST. The athlete-only
notification process is unchanged; country portals keep their existing sitemap.

Execution is read-only by default. `--submit` explicitly enables notification;
`--self-test` runs synthetic safeguard checks without contacting search engines.
The `Notify search engines of public running guides` GitHub workflow checks these
safeguards on relevant pull requests. On relevant `main` pushes it waits up to
12 minutes for the complete hub with the matching public release marker, then
submits the eligible guide batch. The marker is the Vercel Git commit SHA; it
prevents an older live page from satisfying a new release's readiness check. Its receipt
reports a count and response code: HTTP 200 acknowledges receipt, while HTTP 202
means ownership validation is pending. Neither proves indexing. The workflow then
runs the full SSR verifier against production to check guide content, structured
data, internal links, sitemap membership and 404 responses. No Google
Search Console submission is performed; the site's existing connection is for
read-only reporting. Google can discover the published URLs through the internal
links and the sitemap already advertised in robots.txt.

## Verification

Run the existing full guide verifier against a running AthRecs SSR server:

```sh
RUNNING_VERIFY_BASE=http://127.0.0.1:8080 npm run verify:running-guides-ssr
```

The script uses Node 24 and the installed project dependencies. Its default base
URL is `http://127.0.0.1:8097` when `RUNNING_VERIFY_BASE` is omitted. The target
must serve the current application, its guide routes and `/sitemaps/pages.xml`;
a static mock of the new directory is insufficient. Use the established local
preview and its normal application data rather than production build hooks or
database writes just to run this check. The verifier performs HTTP GET requests
and does not submit URLs to search engines.

Coverage expectations come directly from the existing race, country and series
registries, independently of the new directory builder. The script inspects raw
HTTP HTML for readable, followable links to every expected destination, including
links inside native `details`. It checks that structured list destinations also
exist in the rendered links. The existing route checks cover HTTP status,
metadata, canonicals, robots, JSON-LD, internal links, sitemap membership and 404s.
Counts are derived from the registries rather than frozen in the test.

## European country and series expansion, 23–24 October 2026

Spain, Portugal, Germany, Denmark and Czechia now have selected marathon and
half-marathon country collections. These are editorial selections rather than
complete national calendars. Each individual guide retains organiser evidence,
the original source-check date and edition qualifications. Older course maps are
labelled by year; unconfirmed dates do not produce SportsEvent markup. Lisbon's
unresolved 09:20 / 09:30 half-marathon start-time conflict remains TBC, without
assigning the conflicting times to invented waves.

Eight new series pages explain the format, entry routes, amateur and competitive
guidance, completion or ranking rules, planning, visible questions and official
links. The pages distinguish event families, completion challenges and competitive
championships. Article and BreadcrumbList describe the editorial guides; they are
not marked up as individual dated races. Full prose stays in server modules,
while listing routes receive only compact summaries.

The directory, country overviews, individual guides, series listings, related
links and HTML site map form a connected set of public pages. The XML sitemap
derives new series paths from the content registry. IndexNow uses the same
canonical paths and preserves its release, public-access, robots, canonical,
sitemap and ownership safeguards.

The verification scripts cover all new guide URLs, visible sections and FAQs,
official links, schema, related navigation, sitemap inclusion and invalid-guide
404 responses. Country data checks assert unique IDs and the presence of the
published countries. The synthetic notification suite rejects a noindex series
page before any notification is sent.

An interrupted publishing session required reconstruction of the unpublished
changes on 24 October, based on the retained 23 October evidence. Research dates
were not advanced. The recovery was reconciled against the newer production
baseline, retaining the calendar subscription feature and intervening source
registry additions. Record actual validation, deployment and notification results
in the release handover; this document does not itself claim indexing.

Separately inspect desktop and mobile layouts, keyboard operation of the native
groups, and filter/reset behaviour. Record actual verification and deployment
results in the release handover; this document does not claim a deployment or
search-engine indexing result.
