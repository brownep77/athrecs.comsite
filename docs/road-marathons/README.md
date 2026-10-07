# AthRecs road marathon guides

These are editorial pages for AthRecs Running. They do not insert race performances into athlete profiles or change the race catalogue database.

- Country guides: `/running/uk-marathons`, `/running/australia-marathons`, `/running/new-zealand-marathons`, `/running/usa-marathons`, `/running/canada-marathons`, `/running/ireland-marathons`, `/running/south-africa-marathons`.
- Individual guides: `/running/races/<slug>`.
- All guides are linked from `/running` and included in the AthRecs pages sitemap. RunRecs requests receive a not-found response for the new running routes.
- Sources and review dates live in `src/data/road-marathons/`. The UK enrichment derives its existing dates and field estimates from the prior UK guide data to avoid competing copies.

## Editorial scope

Select established standard-distance road marathons. Do not pad smaller countries with trail races, 44 km events or unverified discontinued races. Surfaced paths and track finishes can form part of road races; describe actual surfaces accurately. Ireland means the Republic of Ireland; Belfast stays in the UK guide.

Descriptions and summaries are original AthRecs copy. Only use source-inspected dates, entry methods, route facts and results. Preserve organiser category labels and distinguish chip/gun times. Published category standings can differ from race-day prize rules; state this when relevant. Neither press reports of the fastest domestic athlete nor a national federation article establish a national championship win by themselves.

Past editions link to complete official results; the recorded summaries cover only inspected rows or explicit reports. Prefer organiser, timer and governing-body evidence; identify any secondary reporting by name in the recap. Empty category arrays are evidence gaps, not proof that a race had no categories. Do not publish research-tool or retrieval-error details in race copy. Keep result limitations in the coverage report.

Approximate fields must identify their measure and edition. Counts cover the full marathon, not a multi-distance festival. Where a reliable estimate is unavailable, show “Unknown” rather than substituting an official-results link. The separate results section retains the complete archives. The public pages have no entry-capacity field.

## Dates and search

The upcoming window runs from 26 September 2026 through 31 December 2027. A dated edition remains visible through its final day in its IANA local timezone. Request-time rendering, local-midnight invalidation and focus/visibility refresh use the same filter as structured data and FAQs. Historical result records and evergreen race pages remain after an edition expires. Exact future dates are never inferred from annual patterns.

Pages have canonical URLs, original descriptions, breadcrumb and collection/list markup, visible questions matching FAQ markup, and dated SportsEvent markup where a confirmed edition exists. These measures improve accessibility to crawlers and assistants but do not guarantee indexing, rich results or ranking. Each event's official site remains the entry authority.

## Verification and preview

Run `npm run verify:road-marathon-guides`, the TypeScript check, and scoped lint. Use `vite build` directly for local validation: the repository's `npm run build` also runs database migrations and publication hooks.

With a local development server running, `node scripts/preview-road-marathon-guides.mjs <output.html>` checks rendered routes, canonical/indexing metadata, internal links, category sections, sitemap inclusion and missing-page responses, then writes one interactive, self-contained review preview. Set `MARATHON_PREVIEW_BASE` to change the default `http://127.0.0.1:8095`.

The HTML preview is a dated snapshot. Live route code performs automatic date expiry. Publication is separate from preview generation.
