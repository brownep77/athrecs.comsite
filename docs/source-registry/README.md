# Athrecs fixture and result source registry

This directory records the discovery sources supplied by Paul Browne on 19 August 2026.
The canonical machine-readable file is:

- docs/source-registry/fixture-result-sources.csv

The registry contains 266 unique sources. Only 31 are enabled; the other 235 remain
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

## Verification

Run npm run verify:sources. The verifier checks the schema, row count, source IDs, URLs,
domain allow-lists, limits, coverage years, regular expressions, rights status and the
participant-level exclusion rule.
