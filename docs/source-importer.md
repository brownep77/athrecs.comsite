# Parallel source importer

A second way to bring fixtures in, alongside **Import running fixtures**. It reads the source registry
(`docs/source-registry/fixture-result-sources.csv`), visits **enabled fixture sources only**, and writes a CSV in
the existing importer's format. It publishes nothing: you upload the CSV to Import running fixtures, which runs
the duplicate check and the normal Keep / Publish review.

```
npm run source-importer -- --list
npm run source-importer -- --from 2026-10-26 --to 2026-11-30 [--source id ...] [--concurrency 4] [--out dir]
```

Outputs in the output folder: `fixtures.csv` (upload this), `skipped.csv` (pages with no date, distance or place),
`report.md` (pages fetched, rows and notes per source).

Rules it enforces
- Only `enabled = 1` sources. Naming a disabled source is an error; a disabled row is never permission to crawl.
- Result, archive and finished-race sources are excluded; paths for results, athletes, runners, participants,
  entrants and profiles are never opened. Event-level metadata only.
- robots.txt (disallow and crawl-delay), the registry rate limit, page budget and `allowed_domains`.
- One request at a time per website; different sources run in parallel (`--concurrency`).
- Only schema.org Event data on the page is read. Rows need a name, date in the window, a stated distance, a town
  and a country, otherwise they go to `skipped.csv`. Nothing is inferred.
- Discovery calendars (runABC and similar) are never followed or used as a source URL.

Adding a source: add or enable it in the registry (with its rights review); the importer picks it up.
Run `npm run verify:source-importer` for the offline checks.

## Rating sources against the live site

`npm run source-rate -- fixtures.csv --out dir [--history docs/source-registry/source-ratings.csv]`

For every fixture the importer collects, the rater finds the matching race page on athrecs.com (by name, and by town when the slug is abbreviated) and compares date, distances and town. Each fixture gets one verdict:

- **confirmed** - date, distances and town agree with the site.
- **distance-missing** - date agrees but the page lacks a distance the source lists.
- **town-differs** - date agrees but the source's town is not on the page.
- **date-conflict** - the site has the event within 14 days of the source's date, but not on it.
- **other-edition** / **not-on-site** - nothing to compare yet (neutral).
- **unverified** - date agrees but the page lists no distances (for example a results page); neutral.

A source's accuracy is confirmed fixtures (plus half credit for distance or town differences) over fixtures that could be compared. Ratings: High needs 95%+ with no date conflict and at least 5 compared; Medium 80%+; Low below that. The rating measures agreement with what is already on the site, not absolute truth, so it improves as the site fills in. With `--history` each run appends one row per source, so trends show over time. Nothing is published.

Run the fixture checks first: `npm run fixture-check -- fixtures.csv`.
