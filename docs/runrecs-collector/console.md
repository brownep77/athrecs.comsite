# Worldwide RunRecs collector console

Staff route: `/admin/race-collector`, linked from the staff dashboard/navigation.

The **Start scan** button queues all selected ISO countries/territories (249 plus Kosovo), local date windows and two passes. Defaults are 1 January 2027–31 December 2028, 0–500 miles; km races are included. UK covers Northern Ireland, Republic of Ireland has its own task; cross-border events use the start country. New console runs default to state/province/region collection for eight large countries. The 2027–2028 worldwide preset creates 8,384 windows across 524 collection areas; disabling the regional option restores 4,000 national windows. See [regional coverage](regions.md) for the 282 supported regions and boundary rules. Staff can select all regions or a subset within each country. Saved national runs keep their persisted jobs and scope. At most one model request is active; a large scan takes several days and incurs provider usage charges. No worldwide research has been started as part of building this console.

## Simple start screen

The main controls are **Where?**, **When?**, and **Start scan**. Defaults remain worldwide, all of 2027–2028, 0–500 miles and automatic regional collection. Where offers worldwide, UK + Ireland, any single country/territory, or a searchable checkbox list for several countries. When offers **One month**, **Three months**, 2027–2028, 2027, 2028 or custom inclusive dates.

One month and Three months show a month/year picker and the exact inclusive dates. Three months can begin in any month (for example February–April or November–January), with month lengths, leap years and year changes handled automatically. The chosen period applies to every selected country and state. Existing quarterly worker boundaries may split a three-month period into multiple jobs, with no gaps or overlaps within each pass. Clearing the month disables starting until a valid period is selected.

Distance controls and individual state/region selections are inside **More options**. The visible summary always shows the actual distance range and regional mode, and flags partial state selections. Choosing a new area resets any hidden region restrictions. Detailed country/state progress is expandable once a run exists; empty progress lists/counters are hidden before the first scan. Existing source-review, publication and authentication gates are unchanged.

**Use a small Ireland test** fills Ireland, 1 January–31 March 2027 and 0–500 miles (two research jobs). It does not start research; the message explicitly asks staff to press Start scan. Research usage and background-running information remain visible before starting.

## Execution and activation

- Deploy the reviewed branch using the existing application release process. Additive migration `20260912_worldwide_race_collector.sql` creates durable runs, jobs and candidates.
- Reuse the server-only `XAI_API_KEY`; optionally set `RACE_COLLECTOR_MODEL` (otherwise `XAI_MODEL`, then `grok-4.6`). Never put secrets in `VITE_*` variables.
- Set a cryptographically random `CRON_SECRET` in production. Vercel Cron calls `/api/race-collector-worker` every minute with this bearer token. Nitro emits a dedicated worker function with 120-second maximum duration; the provider timeout is 90 seconds and lease is three minutes.
- Starting is disabled unless persistent Neon, research credentials and the production cron configuration are present. Preview deployments cannot start scans against a shared live database. Configuration presence is not a successful provider/cron health check; confirm one small production country/window before a worldwide run.
- Production cron does not run on Vercel previews. An unauthenticated worker request receives 401. Staff actions use the existing same-site and staff-host/Google allowlist middleware.
- A provider 401, 403 or 429 pauses the run with an explanation. Other failures retry with a delay, at most three attempts, then remain visible for explicit Retry failed. API usage/cost information is retained in each report.

## Data flow and review

1. Start atomically creates a single active run. Simultaneous/repeated clicks reopen it. Jobs are persisted in bounded inserts; no background work depends on the browser staying open.
2. The worker claims one job with row locks and a lease, searches primary programmes in English and relevant local languages, and records sources/gaps/capped responses. Interrupted work resumes from its checkpoint.
3. Machine findings are proposals. A model's assertion is **not** treated as independent verification. Staff must read the linked primary programme and confirm dates, distances and venues before staging selected rows (maximum 50 per selection).
4. All global Running identities are compared, alongside buffered editions, redirects and pending imports. Exact/equivalent distances within 0.025 km are skipped. Fuzzy identities, country discrepancies, possible reschedules, invalid data and retired slugs are held rather than merged. Repeated discovery is not counted again.
5. Stage rechecks the current catalogue and records reviewer identity/time atomically with the immutable normal catalogue batch. Existing event metadata and editions are preserved. Held rows remain in the downloadable report for investigation through the existing staff workflow.
6. Open Publication review, validate, then publish through the established publisher. A collector-specific guard reruns under the publication revision lock and blocks changed identities or equivalent live/pending editions. New collector editions are explicitly scoped to RunRecs in the existing AthRecs exclusion reader.

The first two passes each cap responses at 50 candidates per country or selected region/quarter. Capped results and incomplete local calendars are explicit gaps, not exhaustive-coverage claims. There are no bespoke national feed adapters yet; this is a multilingual web-research worker. Zero is a filter boundary, not a race distance. Timed/backyard totals, virtual, walking-only, multisport and parkrun are excluded by research instructions and require source review before anything can be staged.

## Validation

`npm run verify:race-collector` runs real core/worker/staging modules against isolated PGlite tables with a fake research provider. It verifies 250-country scope, 282-region planning and selections, legacy scopes, regional progress and cross-region duplicate handling, inclusive quarter/leap-year boundaries, distance conversions/duplicates, pending identities, retry/lease recovery, pause/cancel, authenticated worker handling, atomic source review/staging and a late-arriving equivalent edition blocking publication. It does not call xAI or modify production.

Typecheck, targeted ESLint, the existing catalogue-publishing verifier and a RunRecs Vite build are release checks. Browser preview of localhost was blocked by the browser environment; UI interaction verification should be performed on the authenticated deployment preview. No authentication bypass or production fixture seeding was introduced.
