# Athlete finder: second fault and performance test round

Date: 23 October 2026. This supplements the [first adversarial report](athlete-result-finder-fault-tests-2026-10-23.md).

## Outcome

Saved-capture search now uses an index of individual participant names. It retrieves matching source row locators before opening the original capture payloads. A representative full-name query returned the same 24 observations in approximately **40–48 ms**, compared with **3,176 ms** in a repeated baseline measurement and **8,141 ms** in the initial baseline run.

Capture coverage uses compact publication/count metadata. The corrected query ran in **76.9 ms**, compared with an initial **12,882 ms** baseline. These are database statement timings on an isolated copy of the same collection, not whole-page response times or guaranteed latencies. Cache state and concurrent workload were not controlled, and the test compute was capped at one compute unit.

Additional tests reproduced and corrected older-capture revival, misleading retained-row counts and invalid-port source filtering. Synthetic regressions and the browser flow also cover interrupted indexing, Unicode transport, delayed responses and exact pagination.

## Performance rehearsal

The additive migration and refresh function were rehearsed on an isolated, automatically expiring Neon branch. Its snapshot contained 13,286 capture versions, including 12,931 latest observations. Backfilling the latest observations produced 1,756,317 private name-vector rows. Some captures remain held or otherwise ineligible; this index size is not a count of approved search results or unique athletes.

The rehearsal used bounded batches, then analyzed the derived tables. The application migration itself creates empty derived tables and a maintenance trigger; it does not scan and rebuild all existing captures inside the deployment transaction. No original athlete, result, claim, source evidence or verification record was rewritten for the index.

| Check                         |                               Baseline | Revised query | Evidence                                                                                      |
| ----------------------------- | -------------------------------------: | ------------: | --------------------------------------------------------------------------------------------- |
| Full-name search              | 8,141 ms initially; 3,176 ms on repeat |      40–48 ms | Same 24 complete observation rows, compared in SQL in both directions                         |
| Capture coverage              |                    12,882 ms initially |       76.9 ms | Indexed and exact payload-derived counts identical; declared-count correction explained below |
| Broad `Pa` prefix, first page |                                31.8 ms |       97.9 ms | Same 26 internal rows, including the extra row used to detect another page                    |
| Synthetic absent full name    |                                      — |       19.1 ms | Zero returned rows; no fallback array expansion with complete metadata                        |

The broad prefix matched 41,358 indexed name rows before live capture eligibility. An intermediate indexed plan took 354–411 ms because it repeated capture checks for many participants in the same race. Checking each distinct matching capture once reduced that to 97.9 ms. The earlier query can still be faster for a very broad first page that finds enough rows immediately. The new index primarily removes the expensive scan for specific names whose words occur across many different participants; it is not a promise that every possible query improves.

For the full-name baseline, 1,699 candidate races needed JSON array expansion. The completed participant index used its GIN name lookup and performed **zero fallback payload expansions**. Original source rows were fetched only for matching participants. In a separate synthetic 35,000-match prefix case, the first page fetched at most 26 source payloads.

The derived participant table and its indexes occupied approximately 207 MB in the first volume measurement, plus a small metadata table. This uses existing database storage and adds maintenance work when a capture changes. It requires no paid internet-search account or AI API key.

## Additional faults found and corrected

### Newest ineligible captures could revive older results

The saved-capture review helper applied publication, approval and source-check filters before selecting the newest observation. A newer held, revoked or nonstaff capture could therefore allow an older approved version to reappear in the list or direct row review.

The added regression first failed with an actual count of one where zero was expected. The helper now selects the newest observation by provider/source, capture time and ID, then applies eligibility. Equal timestamps, later inserts of older observations, empty newest captures and distinct providers sharing a source key are covered.

### Declared summaries overstated retained rows

The real-volume check found 49 latest private captures with positive declared counts but no participant array. Forty-five were otherwise eligible for search and declared 751 rows; four were held and declared another 242.

Index completion now uses the actual guarded array length, stored as `expected_rows`, independently of the original declared `row_count`. This prevents a successful empty projection from remaining permanently incomplete and being retried forever.

Coverage and the saved-capture browser now count actual retained array members. On the isolated snapshot, the eligible capture total changed from **1,723,661 declared rows to 1,722,910 retained rows**, a correction of 751. Missing, null or nonarray row data counts as zero retained rows. A declared zero with actual retained rows counts those rows correctly. Original declared summary values remain unchanged in the database.

This correction does not recover missing participants. A saved URL or summary count cannot supply an athlete's name or performance; the original source must be extracted through the existing approved workflow before those rows can be searched.

### Invalid numeric ports passed source filtering

The shared stored-search host comparison now rejects ports above 65535 without casting unbounded input to an integer. Twenty cross-store assertions cover valid ports, zero padding, out-of-range values and oversized port strings. Percent-encoded and Unicode host equivalence remains separate follow-up work.

## Regression evidence

The focused service verifiers cover:

- 19 comparisons of complete indexed and legacy search responses, including aliases, prefixes, same-word prefix conjunctions, Unicode, split-person decoys, club/year/source filters and paging.
- 55 observations paged identically over three pages under complete and mixed indexing, without omissions or duplicates.
- Participant GIN use, no full-index fallback payload reads and bounded source-row fetching on the 35,000-match prefix case.
- Atomic insert and payload-update maintenance, unchanged-payload suppression, rollback, publication changes, latest-version eligibility and deletion cascade.
- Missing optional tables, empty or partial backfill, unsupported marker versions and inconsistent indexed/expected counts.
- Stale positive and zero summary counts; missing, empty, null, scalar and object-shaped row data; preserved original summary values.
- Existing 504 preliminary-filter parity comparisons and 32 Unicode/store assertions.

The resumable runner's synthetic tests verify default read-only inspection, argument bounds, latest-first selection, limited runs and resume, row-lock failure and next-run retry, failure rollback, post-refresh consistency, time-budget interruption, statistics maintenance, no-op reruns and sanitized progress output. Each CLI capture refresh has its own bounded transaction. The isolated volume rehearsal used bounded connector transactions to exercise the same database refresh function because a direct database connection was unavailable from the test runner.

The integrated browser harness uses the installed TanStack client RPC serializer for real GET/POST encoding. It verifies nine 160-character Unicode names plus a 160-character Unicode club through a request exceeding 14 KB, draft edits while a response is held, pagination retaining the submitted query, and an older overlapping response not replacing a newer one. No stale-response product fault was reproduced. Missing, unsupported and inconsistent index markers still return exact fallback matches and working review links. Existing authentication, private response bounds, coverage refresh, mobile layout, stale live previews and selected-row import handoff remain covered.

## Reproduction and rollout

```sh
npm run verify:athlete-source-finder
npm run verify:athlete-source-coverage
npm run verify:athlete-finder-capture-backfill
npm run verify:captured-results
npm run verify:athlete-source-finder-browser
npm run typecheck
npm run build:dev
```

The new backfill verifier is part of the Results Archive CI workflow. That workflow and the full repository quality gate remain release checks; their status belongs to the pull request records.

Inspect indexing without writes:

```sh
npm run backfill:athlete-finder-capture-index -- --check
```

Build a bounded portion and resume by running it again:

```sh
npm run backfill:athlete-finder-capture-index -- \
  --apply --batch-size 25 --max-captures 100 --time-budget-seconds 60
```

Completion is stored transactionally in the database. A failed capture is skipped only for the current invocation and can be retried later. The runner prioritizes latest observations before older versions and uses the project's direct PostgreSQL connection and TLS normalization. It logs aggregate progress and sanitized capture IDs/error codes, not names, payloads or connection secrets.

Search stays correct while indexing is incomplete, but the exact fallback can be slower until the latest eligible captures are indexed. Complete the backfill and refresh statistics before evaluating steady-state speed. An application rollback restores the previous search code; the database trigger continues maintaining the derived index until a separately reviewed schema rollback.

## Boundaries

- A matching name remains a research lead, not verified athlete identity or proof of a performance.
- Stored observations can overlap across collections. Neither index size nor displayed row counts are unique-race totals.
- URL-only records and unextracted files do not become searchable merely because indexing completed.
- Very broad aliases, restrictive filters, deep pages and concurrent load can still reach the unchanged search timeout. Incomplete responses remain explicit.
- The source filter still has a documented encoded/Unicode-host limitation. Searching all source websites avoids that particular filter omission.
- Atomic maintenance protects normal updates and partial rollout. Deliberate privileged corruption that removes index rows while preserving fraudulent completion metadata is outside that contract.
- This work searches retained sources; it does not add a general internet crawler or expand provider collection permissions.
