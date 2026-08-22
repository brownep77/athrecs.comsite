# Athrecs fixture and result source registry

This directory records the discovery sources supplied by Paul Browne on 19 August 2026.
The canonical machine-readable file is:

- docs/source-registry/fixture-result-sources.csv

Independently verified corrections to staged workbook editions are recorded in:

- docs/source-registry/workbook-event-overrides.json

Each override is pinned to a source ID, edition ID, event name and date, retains the
exact public evidence URL and checked date, and clears only the named review fields.
Unresolved review issues continue to block publication.

The registry contains 267 unique sources. Only 32 are enabled; the other 235 remain
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

## Admin review screen

The live admin source inventory at `/admin/sources` exposes every registered source with
search, runnable/held status filters, country and region filters, the current review reason,
published crawl-information link where available, and configured page/rate limits. The
screen is read-only: viewing or filtering a held source cannot enable it or bypass review.

## One-click bulk run

The admin bulk-run control snapshots every registry row into a durable Neon run:

- all 267 sources create exactly one source job;
- the 32 enabled and rights-approved sources are queued;
- the other 235 sources are retained as blocked jobs with their reason;
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
