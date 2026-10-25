# Readable archive race addresses

The requested continuation of race slugs replaces 3,134 opaque `wa-{16 hex}`
addresses with readable, collision-checked addresses. The explicit old/new map is
in `migrations/20261025_readable_race_slugs.sql`. It was prepared from the public
catalogue on 25 October 2026 and checked against all current and reserved event
slugs. Established descriptive race, athlete, club and result URLs are retained.

The readable part uses the stored meeting name, city when absent from the name,
and the edition year only when the record contains one date. Eight characters of
the original stable identifier distinguish separate records. This does not merge
meetings, verify a result, infer identities or change race facts. Future name,
sponsor or venue edits do not regenerate these addresses.

The database migration changes only `events.slug`. Existing slug-history triggers
record permanent redirects in the same transaction. Event IDs, editions, results,
source evidence and visibility remain unchanged. Database-backed internal links,
page canonicals and sitemaps use the new address immediately. Old source keys are
resolved before the World Athletics history seed checks for missing events; fresh
databases create the readable URL and preserve the old URL too. Later deliberate
renames take precedence over this fixed migration map.

Validation:

- `node --experimental-strip-types scripts/verify-readable-race-slugs.mjs` tests
  every mapping, synthetic result preservation, replay, fresh seeds, later renames
  and refusal to recycle old URLs.
- `node scripts/verify-indexing-recovery.mjs` tests actual HTTP 301 responses,
  current page canonicals, sitemap replacement and public/private result boundaries.
- `npm run verify:slug-stability`, `npm run verify:search-discovery` and
  `node scripts/verify-public-results-section.mjs` cover existing route families.

Search Console's report viewed on 25 October was last updated on 16 October. It
reported 11,780 indexed pages, 750,454 discovered but not indexed, 503 crawled but
not indexed and three Google-selected canonical conflicts. Those conflict pages
were last crawled on 1 October, before recent public archive content improvements.
The first page passed Google's live test on 25 October. Sitemap submission and
IndexNow receipts request discovery; they do not prove indexing or rankings.

The three conflict pages contain different public performances from their paired
meeting records. Readable URLs do not resolve a content-duplication decision by
themselves. Preserve all records; request recrawling of current pages and review
Google's later canonical decision before considering any evidence-backed merge.

Private pages, account tools, filtered searches, aliases and alternate views keep
their existing exclusions or canonical targets. The goal is discovery of each
eligible canonical public page, not indexing every possible URL.
