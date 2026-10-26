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

## Reading JavaScript pages for free

`npm run source-render -- --adapter racebest --from 2026-10-27 --to 2027-12-31 --out dir`

Some sites build their calendar with JavaScript, so the plain importer sees an empty page. `render.mjs` loads the page in a local headless browser (Playwright; no paid scraping credits), checks robots.txt first, waits the crawl delay between pages, and writes the same `fixtures.csv` / `skipped.csv` / `report.md`. It only trusts what is unambiguous: a listed distance is used as is, a range is itemised only when the race's own headline names the distances inside it, and a date that differs between the list and the race page is skipped. Skipped races are listed with the reason. Virtual events are left out. `racebest` is the first adapter; add another by giving `adapters` a `listUrl`, a row reader and (optionally) a detail reader.
