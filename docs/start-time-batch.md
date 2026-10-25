# Batch start-time research

`npm run collect:start-times` researches missing starts across **all sports**, grouping
distances on the same event/date so their source pages are read once. It follows observed
programme, timetable, FAQ, instructions, entry and PDF links (including common European
and Japanese labels), prioritises imminent events, and retains a searchable staff review
pack. This is a research tool, **not an automatic time publisher**.

## Run

Use Node 24, the repository's installed dependencies and Poppler (`pdftotext`) for PDFs.
No model API key is needed. Run from the repository root; keep private jobs outside git.

```sh
npm run collect:start-times -- --input /private/inventory.json --out /private/start-times \
  --from 2026-10-25 --to 2026-12-31 --concurrency 6 --max-pages 12 --max-requests 1500
```

Input is a JSON array from a **read-only** edition/event query, with `id`, `event_id`,
`name`, `slug`, `sport`, `country`, `event_date`, `distance_code`, `start_time`, `notes`,
`website`, `source_url`, `entry_url`, and optionally `status`. Date strings may include
timestamps. Exclude cancelled and redirected duplicates in the export. Known starts
are skipped. No database credentials are read, and no database is opened.

`review.html` filters by event/sport/country/distance, priority and review state.
`report.json` includes every in-scope edition, even those outside `--limit`, all attempted
sources, original capture dates, content hashes, deferred links and suggested searches.
`groups/` checkpoints each finished event; `sources/` deduplicates retained source text.
Repeat the same command to resume using unexpired captures; successful captures expire
after 24 hours and failures after 2 hours. `--ttl-hours 0` forces fresh network checks.
`--offline` re-examines captures without fetching; this is not a fresh source check.

Requests are bounded, paced per hostname and checked against robots rules. URL/DNS and
redirect checks reject private destinations. No authentication, cookies, access-wall
bypass, form submission or organiser messaging is used. Text PDFs are supported;
image-only PDFs and JavaScript-only content need browser/visual follow-up. Link discovery
is bounded (default depth 2 and 12 pages/event), not exhaustive web search. Add links
actually observed in search or browser research with:

```json
[
  {
    "groupKey": "123|2026-11-01",
    "url": "https://organiser.org/2026-programme.pdf",
    "foundOn": "https://organiser.org/event"
  }
]
```

Pass that file as `--discovery`. A page's clocks are **clues**, never an inferred assignment
to every distance. The edition year appearing somewhere on a page is only a review hint.
Never label a missing start “not yet published” merely because the crawler did not find it.
No clocks means `unchecked`; inaccessible sources are recorded individually. Equally
authoritative conflicting schedules require manual follow-up, not a majority vote.

In a proxy-only environment without public DNS, direct requests remain `unchecked`.
Do not call these source-site failures. You can import captures produced by an approved
public-web/browser transport with `--out <job> --import-captures <captures.json>`, then
run `--offline`. Each array item needs `url`, `finalUrl`, `status: 200`, `text`,
`links: [{text,url}]`, the actual ISO `checkedAt`, and a `captureOrigin` describing how it
was read. Imports retain dates and their external origin; they do not establish authority.

## Review and prepare a publication handoff

Open the actual source. Match the event, date/year, distance, junior/adult category and
wave; distinguish race starts from registration, shuttle or ceremony times. Prefer the
latest edition-specific organiser timetable. Check every competing relevant timetable.
Record local IANA timezone and whether a first wave or start window is involved.

A decisions JSON array supplies `id`, `time` (`HH:mm`), `reviewer`, `explanation`, `scope`,
`timezone`, `authority` (`organiser`, `authorised-entry` or `governing-body`), `sourceUrl`,
`textHash` from the report, a verbatim short `evidenceExcerpt`, `editionMatched: true` and
`conflictsResolved: true`. Authorised entry programmes also need `authorisationEvidence`
explaining the organiser's link. These are explicit reviewer attestations, not automated
verification. Do not approve internal `Other` distances until their scope is established.

```sh
npm run collect:start-times -- --out /private/start-times \
  --decisions /private/decisions.json --current /private/fresh-inventory.json
```

The tool requires the retained inspected source hash and excerpt, a time present in that
source, complete review fields, and an unchanged event/date/distance/start/notes baseline.
It emits `reviewed-starts.json` with previous values and only `start_time`/`notes` patches.
It does not infer source authority, resolve conflicts, stage or publish. Feed reviewed
updates through the existing catalogue staging/validation/publication workflow, with a
fresh live baseline and overlap check **inside its transaction**. Re-read published rows
and verify preserved fields. Never count prepared updates as published starts.

Report both the batch's additions and the remaining unresolved inventory. A successful
scan or passing code tests do not establish catalogue completeness.

## Checks

`npm run verify:start-time-batch` uses synthetic sources and no network/database writes.
It covers year-end timestamps, priority, shared-source reuse, bounded/incomplete research,
clock formats and cautions, source access policy, private-network rejection, HTML escaping,
required review evidence, duplicate decisions and concurrent baseline changes.
