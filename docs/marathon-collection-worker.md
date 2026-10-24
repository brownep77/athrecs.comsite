# Local marathon results collection

The local collector follows the observed pagination links of a supported results
listing, saves each confirmed page to disk and resumes after an interruption.
It runs on the computer where the command is started. DigitalOcean, a scheduler,
an AI API and a new database service are not required for this version.

**Supported now:** the inspected London Marathon results-list layout, including
the exact columns recognised by the shared provider adapter. This does not imply
support for every historical London website or edition. Chicago's observed hosts
are recognised, but automatic Chicago collection remains disabled until an actual
results-page sample establishes its layout and pagination. A blocked source is
reported as blocked; the collector does not change identities, use proxies or
retry around access restrictions.

The files use the existing AthRecs results archive import path. Collection itself
does not write to an API/database, create athletes, establish identity or publish
profiles. Staff selects the exact edition and reviews the import in AthRecs.

## Setup

Use Node 24 on Linux or macOS with the repository's development dependencies.
This version uses private Unix file permissions and directory syncing for its
durable checkpoints:

```bash
npm ci
npx playwright install chromium
```

Playwright supplies an **offline HTML parser**. Its context never navigates to the
source: all browser requests are blocked, JavaScript in documents is disabled,
and the fetched HTML is parsed with `DOMParser` in an inert document. Normal Node
`fetch` makes the source requests without cookies or credentials. The source must
serve supported UTF-8 HTML; explicit other charsets and invalid UTF-8 bytes stop
collection so names are not silently damaged.

For an already installed Chromium executable, set
`ATHRECS_TEST_CHROMIUM_EXECUTABLE`, `CHROMIUM_PATH`, or
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The first defined value is used.

## Choose the listing and record authority

Open the desired source listing and select the edition, event/division and
filters. Copy its **actual page 1 URL**, including the source's `page=1`,
`pid=list` and `num_results` values. Do not construct an event identifier or copy
one from another year. The collector follows the next link present in each
response; it never increments a URL to guess the next page.

Record the actual authority to retain the data in `--authority`. That note is
kept in the private checkpoint and export manifest. A source's registration in
the Sources directory does not enable scheduled collection or establish rights.
This command does not alter source-registry approval settings.

First check one page. Replace the placeholders with the observed URL and note:

```bash
npm run collect:marathon-results -- \
  --url '<observed page-1 URL>' \
  --authority '<authority to retain these source results>' \
  --dry-run
```

The dry run makes one source request, uses the actual provider parser and archive
validators, reports the selected scope and saves no job files. It is not a test
of all later pages or athlete identities.

## Collect and resume

Use a dedicated private directory outside the Git checkout. The command creates
job directories with mode `0700` and files with mode `0600`; it rejects an
existing shared job directory. Keep these raw result files out of source control.

```bash
npm run collect:marathon-results -- \
  --url '<observed page-1 URL>' \
  --job "$HOME/athrecs-collections/london-selected-listing" \
  --authority '<authority to retain these source results>'
```

Requests are sequential, start at least two seconds apart and have a 20-second
timeout. One invocation is bounded to 500 source pages; use `--max-pages 10`, for
example, to stop after ten additional confirmed pages. The source adapter also
limits pages to 5,000 rows and the selected listing to 1,000,000 rows.

Press Ctrl+C to stop. Resume with the same job directory:

```bash
npm run collect:marathon-results -- \
  --job "$HOME/athrecs-collections/london-selected-listing" \
  --resume
```

The saved URL and authority note are reused. Resume checks the checkpoint hash,
every confirmed capture hash, headings, filters, row counts and unique result
keys before requesting the next unconfirmed page. A page file written just
before a crash but absent from the committed checkpoint is unconfirmed and is
requested again. Already confirmed files are retained.

HTTP errors, including 403 and 429, stop without automatic retries. Changed
headings, filters, totals, repeated IDs/bibs and malformed pages also stop. Review
the reported problem before resuming. If the source has changed incompatibly,
keep the partial job as evidence and start a new job after reviewing the listing;
do not edit the checkpoint to force it through.

A process lock prevents overlapping writers. A dead process's lock can be
reclaimed under a separate exclusive recovery guard. If a machine interruption
leaves `job-recovery.lock`, first confirm that no collector is running for that
directory, then remove that recovery guard and resume. Never remove a live job's
lock to start a second writer.

The checkpoint validates the saved material and subsequent page continuity.
It does not freeze the external website or re-fetch every earlier page on each
resume. Results can change during a long collection; the original capture dates
are retained, and the export records the first and last capture timestamps.

## Export and import

A completed job automatically creates an export directory containing CSV parts
and `manifest.json`. Export confirmed pages manually, including a partial job,
with:

```bash
npm run collect:marathon-results -- \
  --job "$HOME/athrecs-collections/london-selected-listing" \
  --export-only
```

Partial exports are labelled **PARTIAL collection**, and their manifest records
`complete: false`, the saved counts and the source's stated totals. Completion
means all pages and unique rows for the **selected source filters**. It does not
mean all runners/divisions in an edition or all historical editions. In
particular, a women-only or age-group total is not the expected whole-race count.

Each CSV part is at most 25 MiB, repeats the same headers and ends on a row
boundary. Normalised column labels make the existing uploader suggest the correct
name, source key, bib, nationality and timing fields. Literal original source
columns are retained under `Original <number>: <heading>`, and the provenance
columns retain their `_capture_*` names. Source time strings keep their original
decimal precision. A generic Finish value remains a finish time; it does not
become a chip time. Source-reported nationality is retained without inferring it
from names, residence or race location.

In the staff backend, open **Central results archive → Import a race**, select
the first CSV part, choose the exact existing edition, inspect the mappings and
confirm the source and authority. Use **Add to a saved race** for every later
part so all parts use the same dataset identity. Per-page `.athrecs.json` files in
`pages/` also work with the existing single-page uploader.

Repeated imports of the same CSV format keep stable source keys and use the
existing archive service's unchanged-row and genuine-revision handling. A fresh
capture timestamp alone does not revise an unchanged CSV result. Switching an
existing dataset between raw browser captures and this normalised CSV format can
produce an initial observation revision because the retained original-column
structure differs. Review that transition; do not claim byte-identical payloads
across the two formats. Neither form automatically links an athlete or changes
publication/ownership controls.

Exports are versioned in separate private directories, so a failed later export
does not invalidate an earlier manifest. The local files have no automatic
expiry; keep or remove them according to the actual retention arrangement.

## Reuse and verification

`scripts/lib/marathon-collection-job.mjs` separates transport from durable job
state. Its `runCollectionJob` receives a `readPage(url, { signal })` implementation,
the shared scope function and the application's capture/mapping validators.
`exportCollectionCsv` verifies confirmed files and produces the existing import
format. The CLI uses `marathonPageReaderExpression()` from the same adapter as the
browser bookmark. Adding another provider requires an inspected source sample
and explicit adapter capability, not a guessed URL or a broad host allowlist.

The durable file/checkpoint pattern can later be used by a hosted worker.
Fixture collection and profile-fact extraction need their own schemas and review
paths; they should not be represented as result rows. Existing AthRecs fixture
job/staging services and result identity safeguards remain the integration points.

Run the regression:

```bash
npm run verify:marathon-collection
```

It uses invented runners, synthetic fetch responses, offline Chromium and a
disposable PGlite database. It exercises the real CLI dry run, partial collection,
403/429 stop, resume, file integrity, exclusive writers, bounded CSV imports,
unchanged replays and genuine revisions through the actual archive service.
It makes no production source requests or production database writes. This test
does not establish live Chicago support or a completed live marathon collection.
