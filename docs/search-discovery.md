# AthRecs search discovery

Public pages are eligible for crawling; search engines independently decide whether and when to index or show them. Google Search, its AI features and voice queries use the same public content foundations. No ranking or indexing guarantee is implied.

## Canonical URLs

- Editorial and directory pages have individual paths, titles, descriptions and canonicals.
- Athlete, event and club slugs remain unchanged, with the existing slug-history redirects.
- Results use `/results/{event-name}-{date}-{distance}-{edition-id}`. The final ID makes otherwise identical names unique. Old numeric URLs and earlier descriptive names redirect permanently, preserving the search and page parameters.
- Regional race views canonicalise to the main `/races/{slug}` because their race content is shared. Country landing pages and country directories retain their own URLs.
- Syndicated news retains its RunRecs canonical source. SportsRecs retains its own canonical domain.
- Search/filter variants are not independent index targets. Unfiltered race directory pagination has its own canonical URL.

## Discovery

`/sitemap.xml` lists static pages, countries and paginated athlete, race, club and result sitemaps. Each database page is limited to 5,000 entries. Public visibility and account opt-outs apply to results; existing athlete privacy controls are retained. Country race directories default to Running, retain explicitly selected disciplines, and exclude empty responses from indexing. Only countries with upcoming running fixtures contribute race-directory URLs to the country sitemap. Sitemap routes do not cache publication decisions.

`/site-map` and the footer provide crawlable HTML navigation. Public brand and opportunity listings are rendered on the server. `/about-us` supplies a concise product description, visible questions and answers, and matching AboutPage/FAQPage data. FAQ markup is descriptive, not a promise of a Google rich result.

`robots.txt` permits public crawlers, including search and AI search crawlers covered by the wildcard rule. Staff, account and review tools are excluded. Nothing here changes an athlete's publication choice or grants access to private data.

## Validation and operation

- `npm run verify:search-discovery`: actual SQL against an isolated PostgreSQL-compatible database, checking scope, privacy, paging and result slugs.
- `npm run verify:athlete-sitemap`: athlete publication and privacy regression coverage.
- `node scripts/verify-public-results-section.mjs`: result access and privacy regression coverage.
- `npm run verify:slug-stability`: existing entity URL compatibility.
- Type-check, lint and production build before release.

After deployment, submit `https://www.athrecs.com/sitemap.xml` in the verified Google Search Console and Bing Webmaster Tools properties. Inspect representative URLs from every family and monitor indexing exclusions, redirects and crawl errors. Sitemap submission is a request for discovery, not evidence that all URLs have been indexed. Use Google's URL Inspection interface for priority pages; the general Google Indexing API does not apply to ordinary athlete or race pages.

New database records enter the appropriate live sitemap automatically if their public route is available. Add future static pages to `PUBLIC_PAGES`, with route-specific metadata. Do not add account tools, filter combinations, redirect aliases or private records.

## Athlete name and event searches

Public profile metadata is built from the anonymous biography, bounded career summary
and latest-five-results preview. Names, visible event names and verification qualifications remain consistent
with the page. Running, parkrun, trail and ultra categories share a concise Running
title; biographies and the visible tables retain their detail. A custom biography can
mention an older race, with its existing evidence qualification, without publishing
the gated results history. Search opt-outs remain authoritative. The shared approval predicate now also recognises
`athlete.profile_admin_published`, matching the existing anonymous preview rule: the
profile must be public, have a resolved identity and the matching publication audit,
and have no account-link history. Linked accounts continue through their existing
sharing/publication gates. A public flag by itself never grants search eligibility.

The public A–Z directory has crawlable previous/next links and a native GET search
form. Out-of-range pages redirect to the last available page, and previous links to
page one use its canonical URL. Run `npm run verify:athlete-search-content` for the
public metadata regression checks and `npm run verify:profile-view-login` for the
anonymous preview and member-history boundary.

## Catalogue query performance

Normal directory pages read 24 currently eligible identities plus one look-ahead
row. Exact totals are omitted until the last page is reached; Previous/Next links
and stable page URLs remain crawlable. Only an out-of-range request runs the bulk
count needed to redirect to the last valid page. Country choices use the standard
country vocabulary plus the visible values on the current page, not a catalogue
scan or a cached audience. Sport-filtered requests retain the existing reader.

Ordered name, letter and country indexes support browsing. A trigram index selects
name/place/role search candidates, with a separate indexed club lookup. The final
substring match uses only currently visible fields, and every card still passes
its live publication and ownership checks. Numeric athlete IDs retain both source
and account aliases. No athlete cards or permission decisions are cached.

Sitemap reads join publication approvals as a set and materialize eligibility
before applying pagination. The generated `publication_athlete_key` is derived
from the original audit JSON on every write; it is never an independent permission.
Bulk reads use transaction-local 32 MB work memory with parallel workers disabled.
Normal directory pages do not need that transaction or its extra round trips.

The deployment migrations install the lookup indexes; PostgreSQL uses `pg_trgm`
for substring search. Minimal embedded databases may omit the optional trigram
index while retaining the same query semantics. The directory response exposes
`Server-Timing: athlete_directory` for the full server-side data read.

Run `node scripts/verify-athlete-discovery-pagination.mjs` and
`node scripts/verify-indexing-recovery.mjs` for pagination, identifier search,
hidden-field search, withdrawal, public metadata and canonical URL checks.
`node scripts/verify-athlete-sitemap.mjs` covers sitemap eligibility and privacy.

## Public career highlights and profile links

Each eligible anonymous preview can show up to six distinct events selected from its
already privacy-filtered published records: the earliest and latest event, then a
spread of recorded disciplines. Each event contains only its name, a known year,
discipline, optional catalogue link and explicit verification label. Missing
verification remains “Unverified record”. Non-finishes, future events, excluded or
conflicting results and ambiguous year ranges do not become highlights. No times,
placings, source URLs, research notes or full result objects enter the summary.
The latest-results table remains capped at five across all sources; full history
still requires authentication. Hiding the biography also hides career highlights.
Custom biographies remain intact; summaries are generated on read, not bulk-written.

The same approved/indexable predicate controls sitemap membership, page robots,
unfiltered A–Z discovery and new race/club links. Race pages show at most 12 eligible
profile links from published canonical results. Club pages show at most 100 eligible
profiles, with a browse link when more exist; owner club-sharing opt-outs are honoured.
Public previews link to the club when that association is shared and offer the
existing Share / Copy link controls. No invitations or messages are sent automatically.

`node scripts/verify-public-career-discovery.mjs` exercises actual anonymous HTML,
sitemap and directory output plus race/club links in a disposable synthetic database.
`npm run verify:athlete-search-content` covers summary selection, metadata and
verification qualifications. `npm run verify:profile-view-login` retains the complete
anonymous/member boundary regression, allowing only the new bounded event summary.

## Unavailable and renamed athlete URLs

Anonymous requests without an approved public preview retain the usable sign-in
screen but return HTTP 404, noindex and private/no-store headers. Missing, private
and unpublished profiles receive the same response so this does not reveal whether
a private athlete exists. Signed-in access and directly shared unlisted previews
retain their existing behaviour. Internal response markers are stripped and cannot
be supplied through request headers. This change applies to AthRecs, not RunRecs.

Recorded old athlete slugs now return a 301 to the current approved, indexable public
profile before the sign-in gate. The redirect checks both athlete identity and the
current slug; withdrawn or unlisted profiles are not advertised through old links.
The anonymous SSR test covers redirects, withdrawals and unavailable responses;
the session-boundary test covers sign-in recovery and forged headers. Career
summaries also standardise equivalent distance labels such as `10k` and `10 km`
to `10K`, without changing stored results or verification.

## 7 October 2026 indexing notices

Search Console reported two soft 404s and three race pages where Google selected another canonical. The Montenegro directory defaulted to Athletics and returned no upcoming events despite available running fixtures. The three archive race pairs shared the meeting name, date and distance but contained different performances; they must not be redirected together on name alone.

Single-edition archives now render a bounded preview through the existing public-results API, with date, distance, athlete names and linked provider credits. Metadata describes those records, and obsolete entry/travel boilerplate is omitted. Result pages state their partial coverage. No event records, result values, source approvals or privacy settings are modified.

The five noindex examples were filtered country searches; the robots exclusions were the claim form and an official-entry API route. Sample alternate canonicals were country/language race views pointing to the shared race page. These exclusions remain intentional.

`node scripts/verify-indexing-recovery.mjs` exercises actual server-rendered routes with a disposable database, public/private synthetic results, explicit discipline selection, populated and empty country directories, and sitemap updates. Google recrawling and canonical selection remain external decisions; deployment alone does not prove validation has passed.
