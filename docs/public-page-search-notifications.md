# Public-page search notifications

The public sitemap index already advertises general/editorial pages, country portals, location directories, races, clubs, results and eligible athlete profiles. This worker extends the existing guide and athlete notification jobs to the other sitemap families. It never reads staff data or changes publication settings.

The hourly job reads the current production sitemap index and all non-athlete shards. It deduplicates URLs, interleaves small groups from the shards, and checks up to 5,000 due URLs per run with four concurrent anonymous page reads. Eligibility requires HTTP 200 HTML, explicit index/follow permission, no conflicting crawler directives, a matching canonical URL, current sitemap membership and robots.txt permission. Publication and permissions are rechecked before each submission. Redirected, private, blocked and otherwise unsuitable pages are held, remain unsubmitted and appear in the report.

Only HTTP 200/202 IndexNow receipts advance the atomic checkpoint. A failed later batch preserves earlier accepted progress. The next run skips URLs accepted within seven days unless their sitemap lastmod changed. Newly added URLs are picked up on the next run. URLs without useful lastmod values are reconsidered weekly. An unchanged page is not continually resubmitted each hour. Receipt means accepted for processing, not crawled or indexed; HTTP 202 additionally leaves ownership validation pending.

Athlete profiles retain their separate existing worker and checkpoint. The running-guide publication workflow also remains intact. The new worker does not reset either process. The sitemap index and robots.txt remain the discovery mechanism for Google; this change does not claim Google Search Console submission or confirmed indexing.

Validation:

- `node scripts/verify-public-page-notification.mjs` uses synthetic responses to test eligibility exclusions, ownership, robots rules, family boundaries, duplicate removal, changed permissions/membership, rejected receipts, retry/resume and checkpoint preservation.
- `node scripts/submit-public-page-indexnow.mjs --check --max-urls=500` performs a read-only live sample. It never submits or advances accepted receipts.
- `--submit --max-urls=5000 --state-file=artifacts/public-page-search-state.json --report-file=artifacts/public-page-search-report.json` submits eligible batches and retains receipts for the next run.

Inspect held URLs in the Actions report. Do not override privacy, noindex or canonical safeguards to make a notification pass. Fix an incorrect sitemap entry or route through the normal review process; intentionally private content stays private. Cached receipt state chooses due work but never authorizes publication.
