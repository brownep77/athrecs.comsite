# Google indexing investigation — 22 October 2026

## Scope and limits

Baseline: main `af59b24622c45014f4b490248b4fbef4a707ade6`, confirmed deployed on
`www.athrecs.com` as READY deployment `dpl_GQQ4F3CSoQ2FjiRxTwwAA63kuW8Q`.
The three Search Console emails dated 22 October list exclusion reasons but no
example URLs, counts, crawl dates or Google-selected canonicals. Authenticated
Search Console inspection could not run: the connected Browser Use service
returned `insufficient_credits`. No validation or indexing request was submitted.
The defects below are independently reproduced site findings; they are not
claimed to be Google's exact reported examples.

Read-only production checks covered 52 page requests and 13 sitemap/robots
requests. Every requested page responded; expected missing pages returned 404.
This was a representative audit, not a crawl of every athlete or race URL.
The live sitemap index listed 179 child sitemaps, including 168 athlete shards,
five race shards and two result shards. The audit read the first athlete and
result shards (5,000 URLs each), every race shard, the complete club sitemap and
the static, country and location sitemaps.

## Reproduced defects and corrections

| URL or scope | Before | Correction |
| --- | --- | --- |
| `/results?page=2` | 200 with distinct public records, `noindex`, canonical `/results` | Populated unfiltered pages get their own canonical and indexable metadata, with page number in the title. |
| `/sports/road-running?page=2` (shared sport route) | 200 with distinct fixtures, `noindex`, canonical `/sports/road-running` | Same page-specific canonical and indexing policy for unfiltered sport pages. |
| `/running/events?page=250` | Empty list, 200, `index, follow` | Empty unfiltered later pages return 404; empty first-page/search states remain noindex. This removes a soft-404 risk, not proof of Google's classification. |
| `/results?page=1000` | Empty list, 200, noindex | Empty unfiltered later result-directory pages return 404. Sport lists receive the same boundary behaviour. |
| `/races/ride-reigate`, `/races/goodwood-motor-circuit-running-gp-duathlons` | 200, self-canonical, indexable; absent from all 23,292 race sitemap entries | Race sitemap eligibility now matches all seven sports already supported by the public event loader, adding Cycling, Swimming and Duathlon. |
| Club sitemap selection | Still limited to athletics/running/triathlon or athlete-result relationships, although the public loader serves all clubs | Match the public club identity catalogue without depending on member records. All 2,604 current directory clubs were already in the live sitemap; no existing club omission is claimed. |

No changes to athlete publication approvals, results, verification flags, privacy
settings, robots.txt blocks, source records or structured event dates are needed
for these corrections. Search refinements remain noindex. The existing content
sitemap alias exclusion and result-visibility rules are preserved.

## Working or intentional exclusions

- Live robots.txt allows `/athletes`, `/results`, `/races`, `/clubs`, `/running`
  and location pages. Its disallows concern admin/API/account/review tools.
- `/athletes`, `/athletes?letter=S`, Esther George and three profile URLs sampled
  from the athlete sitemap returned 200, matching canonicals and indexable HTML
  plus `X-Robots-Tag` headers.
- `/athletes?q=Paul`, `/results?q=Norwich` and a Norfolk month filter correctly
  remain noindex. They are search refinements, not sitemap destinations.
- `/fr/united-kingdom` contains the same English country-home content as
  `/en/united-kingdom` and correctly declares the English canonical. Only the
  English home is in the country sitemap. Localised race-list routes have
  separate translated UI and their own canonicals.
- Sampled race, result, club and location sitemap destinations returned 200 with
  matching canonicals and no noindex. Norfolk's public running/10K page passed;
  its month-filtered variant remains intentionally noindex.
- HTTP and apex-host requests reached the HTTPS www home. The home canonical
  with no trailing slash represents the same root URL, not a conflicting page.
- Nonexistent athlete and race probes returned actual 404 responses. The athlete
  response preserves the same anonymous shell used for unavailable profiles.
- PR #671's individual-race results pagination policy is still in the current
  loader and SEO helper. Existing regression coverage checks nonempty page two,
  filtered searches and out-of-range 404s. Sampled live race-result page-two URLs
  had no second public page and correctly returned 404. The newly fixed
  `/results?page=2` directory is a different route.
- PR #757's triathlon sitemap and empty `/races` pagination fixes are retained.
  `/races?page=2` is indexable and self-canonical; empty later `/races` pages
  already carry noindex. This release does not replace that existing policy.

## Verification and release

Regression checks exercise actual server-rendered routes with an isolated
in-memory database: populated browse pagination, exact canonical URLs, noindex
searches, HTTP 404 boundaries, new multisport sitemap membership and private
club-member exclusion. SQL tests retain hidden, private, disabled and future
result exclusions, canonical event aliases and sitemap pagination.

Before release: run search-discovery, public-results-section and indexing-recovery
regressions, TypeScript, scoped ESLint, direct Vite build and the repository's
Athrecs quality gate. Direct local builds omit migration/publication hooks.
Release through a reviewed PR and the normal main-branch Vercel integration;
read back the production pages and sitemap membership before claiming deployed.

## Search Console follow-up

Use the domain property and HTTPS www property to export exact examples for each
reason, including the submitted-sitemap filter, last crawl date and user/Google
canonical. Compare those URLs with this release and inspect representative live
URLs. Validate a corrected noindex or soft-404 issue only after its report's
examples have been checked. Do not validate intentional private/search exclusions
as if they should be indexed. Resubmit the current sitemap if appropriate and
request indexing for a small number of corrected public examples. Validation
success, recrawling and indexing remain Google's decisions.

Further Search Console access is required to establish the complete affected URL
list, whether a warning reflects an older crawl, Google's chosen canonicals and
whether issue validation has begun. A report export also enables URL comparison
without authenticated browser access.

Google guidance: [pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading),
[canonical consistency](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
[soft 404s](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors).
