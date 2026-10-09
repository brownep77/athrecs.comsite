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

## 7 October 2026 indexing notices

Search Console reported two soft 404s and three race pages where Google selected another canonical. The Montenegro directory defaulted to Athletics and returned no upcoming events despite available running fixtures. The three archive race pairs shared the meeting name, date and distance but contained different performances; they must not be redirected together on name alone.

Single-edition archives now render a bounded preview through the existing public-results API, with date, distance, athlete names and linked provider credits. Metadata describes those records, and obsolete entry/travel boilerplate is omitted. Result pages state their partial coverage. No event records, result values, source approvals or privacy settings are modified.

The five noindex examples were filtered country searches; the robots exclusions were the claim form and an official-entry API route. Sample alternate canonicals were country/language race views pointing to the shared race page. These exclusions remain intentional.

`node scripts/verify-indexing-recovery.mjs` exercises actual server-rendered routes with a disposable database, public/private synthetic results, explicit discipline selection, populated and empty country directories, and sitemap updates. Google recrawling and canonical selection remain external decisions; deployment alone does not prove validation has passed.
