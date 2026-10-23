# Athlete result finder

The staff tool at `/admin/athlete-result-finder` answers two separate questions:

1. Which stored source observations might belong to this athlete?
2. For an actual supported results URL, can we retrieve the page now and prepare matching rows for import review?

It is linked from Sources, Collected results, the staff navigation and each staff athlete profile. It requires the existing staff session and permitted staff host. Private source evidence never enters a member or public profile payload through these endpoints.

## URL storage versus searchable results

A saved URL identifies a location; it does not contain the participants or performances. Searching a URL string cannot discover a runner inside the referenced page.

| What AthRecs holds                                                                               | What the finder can do                                                                                                                        |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical results, normalized archive rows, approved race captures or imported athlete histories | Search the stored participant observations immediately.                                                                                       |
| A supported public results URL                                                                   | Fetch that one page on request, extract and compare names, and show a private preview. Staff can open selected matching rows in the importer. |
| An unextracted PDF, spreadsheet or other saved document                                          | Show the extraction inventory state; use the existing extraction/import workflow before its participant rows become searchable here.          |
| A source homepage, directory or unsupported results URL                                          | Show source coverage and direct staff to existing collectors or import tools. Do not imply the source has been searched.                      |

The first version does not require storing an entire website. Retaining normalized result rows and their source URL, row locator, capture date and original evidence supports repeat searches and later source comparisons. A live preview itself is not a saved archive entry. The normal importer controls retention, mapping and review.

## Stored search

`searchAthleteSourceResults` searches four collections:

- Profile results in `results`, with athlete, event and edition context.
- Central observations in `result_archive_entries` and their datasets.
- Rows in each source's newest `result_archive_source_captures` observation, when that observation is approved for staff use. A newer held, revoked or nonstaff version suppresses older approved versions.
- Performances in `athlete_source_histories`, including private/unpublished histories labelled as such.

The search accepts a racing name, up to eight explicit aliases, an optional club filter, years and a registered source website. Source filtering matches its registered hosts and subdomains, not arbitrary substring lookalikes. Name words and aliases generate possible matches; they do not establish identity. Club and year filters exclude rows where the required information is absent, so start without them when coverage is uncertain.

Stored search sends the validated input in a POST body so maximum-length Unicode names and aliases do not depend on a long query-string URL. The endpoint remains read only, staff authenticated, same-site checked and private/no-store.

The default page returns up to 25 observations per collection. Collections report pagination and their own unavailable, timed-out or failed states. Results can overlap between collections; displayed counts are not unique races. A bounded search with missing collections must not be presented as an exhaustive negative result.

Saved captures use a private participant-name index containing capture IDs, original row ordinals and normalized name vectors. Original source rows and HTML remain in the capture. New or changed payloads update the index and its completion metadata atomically. Historical captures with missing, unsupported or inconsistent completion metadata use exact stored-row matching. Both streams merge before paging, so unfinished backfill cannot hide existing matches. Whole source HTML and unrelated participants are not returned in the stored-search response. Search transactions retain their statement and lock time limits.

Search inputs use PostgreSQL's name normalization to agree with those indexes, including tested Turkish, Greek and Indic cases. The participant index applies the same exact name predicate to individual rows, avoiding race-level candidates where different people supply different words of the searched name. The legacy fallback retains its safe ASCII preliminary check and exact matcher. A completed index avoids the fallback's payload reads. Broad names, restrictive club/year filters or deep pages can still reach the time limit and must remain explicitly incomplete.

Index completion is measured against the actual stored participant array, separately from a capture's declared summary row count. A legacy capture can retain a positive summary count without containing participant rows; the finder cannot search names that were never retained. Such a capture needs the original extraction workflow to become searchable. Indexing does not reconstruct those missing rows or fetch the source website.

Legacy URLs with a percent-encoded or Unicode hostname can be counted correctly in coverage while being missed by the stored-search source filter, whose SQL currently compares ordinary host strings. Search **all source websites** when investigating an apparent missing match in this situation. Normalizing historic source URLs for search remains follow-up work; coverage normalization does not rewrite stored evidence.

Archive rows open their existing review detail directly. Capture links open the selected saved race and prefill the athlete name. Profile and history observations open the existing athlete review workspace. These links do not create claims or change result ownership.

## Live URL check

The initial adapter supports actual `https://totalracetiming.co.uk/raceresults/<id>` pages. It does not generate IDs, enumerate races, crawl the full source registry or call a general internet search API.

The staff-only POST validates the exact supported host and path, checks published crawl rules, limits request frequency with persisted reservations, bounds response size and duration, and treats redirects, denied access, rate limits and unsupported content as incomplete checks. It never bypasses a challenge or sends the athlete name to a search provider. Matching uses recorded names and supplied racing-name variants. Club information is supporting context; missing affiliation is not an identity decision.

Preview rows retain original column headings and values, including distinct timing and placing fields. At most 50 matching rows and bounded original text are returned. The response distinguishes checked, blocked, unavailable and rate-limited states, with truthful fetch/check times. A blocked source does not become a zero-match result.

Each preview labels the racing name, aliases and club used for that check. Editing any of these inputs or the results URL makes the preview stale and disables its import-review action. Restoring the checked inputs restores the existing preview; running a new check replaces it. Editing a field never fetches a source page by itself.

Before enabling a table's import handoff, the adapter runs the existing independent TRT source comparison against the full original table, passing the source bib to distinguish separate entrants with the same name. Flagged, malformed, empty, unsupported or ambiguous comparisons retain their preview evidence but withhold the automatic handoff. A generic Name-only table can be previewed, but remains manual-only because the independent TRT auditor does not recognize that layout. This comparison does not establish athlete identity or mark results verified.

Dates and distance headings must belong to the same race section as their table. Missing dates, duplicate table anchors, ambiguous distance headings, zero finish times and contradictory timing columns require manual interpretation. An access challenge stops the check even if the response also contains an old results table. Provider denials retain their cooldown when response-body cleanup fails.

For a successful comparison, staff may open matching rows from one table in the existing archive importer. The handoff explicitly records that it contains selected matching rows from a server-fetched single-page preview. It is not a claim that the whole race was captured. The importer still requires a race edition, column mapping, authority to retain and its normal review/save steps. No source record, claim, notification or public profile is created just by searching.

This path needs no paid search account or AI API key. Existing hosting/database resources are still used.

## Source coverage

The coverage panel reads the current source registry, saved edition result links and wider event inventory, plus aggregate counts for stored result collections. It is loaded on request. Counts are grouped by website; multiple registry records for the same website can share totals and must not be added together. Records with unknown or unregistered domains remain part of global collection totals.

Coverage distinguishes stored rows, extraction/review backlog, links without rows and no linked stored evidence. Missing optional stores are reported as unknown rather than zero; if no rows are known and any participant collection is unavailable, the stage is explicitly incomplete. Saved result-link counts include held and rejected references and do not authorize collection. Canonical counts use the primary result source URL and history counts use the parent history URL; supporting references or individual performance URLs can yield search matches beyond those per-domain counts.

The **Refresh source coverage** button retries the current filter and page. Partial failures have a safe collection-specific explanation, such as a missing collection, time limit or busy store. A failed count remains unknown until a successful refresh; it is never replaced with zero. Current capture search metadata supplies publication eligibility and actual retained row counts without opening the original payload; missing metadata uses one bounded lookup for the same information. Missing or malformed participant arrays contribute zero retained rows. The saved-capture browser uses the same actual-array count, while original declared summary values remain unchanged in the database. Server diagnostics retain the failure category, safe SQLSTATE and elapsed time without logging SQL text or private result payloads. Domain grouping uses the same URL normalization as the registry, and both sides of an overlapping registry/inventory domain receive the shared-count warning.

Registry enable/hold states describe existing metadata collection settings. This feature does not change them or enable participant collection across all registered sources. Saved captures are screened against the newest version so a superseded approved page cannot reappear when its replacement is held or revoked.

## Validation and rollout

Focused verification uses synthetic records in disposable PGlite databases, bounded fake source responses and a loopback browser harness. It covers the four search stores, pagination, aliases, missing stores, source-domain matching, capture approvals, extraction inventory, live-fetch restrictions and selected-row import handoff. No production athlete data or source HTML belongs in tests or git.

The [23 October adversarial test report](athlete-result-finder-fault-tests-2026-10-23.md) records reproduced faults, regression coverage and remaining limits.

The [follow-up performance report](athlete-result-finder-performance-tests-2026-10-23.md) records the participant-index rehearsal, result-equivalence checks and additional faults found during the second test round.

Run:

```sh
npm run verify:athlete-source-finder
npm run verify:athlete-source-coverage
npm run verify:athlete-finder-capture-backfill
npm run verify:athlete-source-check
npm run verify:athlete-source-finder-browser
npm run typecheck
npm run build:dev
```

The browser verifier can use `ATHRECS_TEST_CHROMIUM_EXECUTABLE` to select an installed test binary; CI uses the project Playwright browser. The normal production build applies the additive migration, creating empty derived tables and enabling atomic maintenance for new writes. Backfill historical captures separately with `scripts/backfill-athlete-finder-capture-index.mjs`: default `--check` is read only; explicit `--apply` builds derived rows in bounded, resumable transactions. Complete the backfill and analyze the derived tables before assessing normal search speed. Search remains available during rollout, but the exact fallback can be slower while many captures remain unindexed. No new API credential, source registration or source enablement is needed.

An application revert restores the previous search code. The database trigger continues maintaining the derived index until a separately reviewed schema rollback; a code revert does not disable it. Original source and result records are unchanged by indexing. Any records subsequently saved through the existing importer remain normal reviewed archive records and should not be removed by a code rollback.
