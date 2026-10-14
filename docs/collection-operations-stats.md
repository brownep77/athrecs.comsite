# Staff collection operations statistics

Open `/admin/collection-stats?section=operations`. The existing collection and website reports remain separate tabs. All operations reports and record lists use `staffMiddleware`, staff-host checks and private/no-store responses. They do not publish records, merge athletes, send messages or change verification decisions.

| Report | Counting rule |
| --- | --- |
| Results | Catalogue result IDs, grouped by event sport, edition distance, event country or race year. Non-finish and excluded records remain collected records. Source-history rows, central-archive observations and latest source-capture rows are separate overlapping inventories, never a combined unique-result count. |
| Athlete coverage | Each non-test profile appears once. Buckets distinguish no records, source-history-only profiles, one catalogue result and several catalogue results. Excluded/synthetic performance rows do not supply coverage. |
| Growth | Retained event/athlete creation timestamps; newly tracked edition/result creation timestamps. Updates count distinct retained record IDs per period. Daily rows count an edited record once on each UK day on which it changed. |
| Source progress | Known classified pages/documents excluding non-race/excluded items. A missing denominator is blank, not 0% or 100%. Import counters are operations; dataset percentages use explicitly stored expected rows and can exceed 100% when the denominator needs review. |
| Matching | Unlinked/held archive observations, unapplied linked revisions, club candidates with suggestions, pending/needs-info claims, conflicting active claims and unresolved archive match requests. Queues overlap. |
| Verification | Explicit unverified/source-checked/administrator labels plus the existing World Athletics official-record rule. Catalogue and history observations are separate. Athlete verification requests are reported separately from performance status and account ownership. |
| Missing information | Missing profile gender/nationality/sport/location, missing event website/location/sport/distance/dated editions, and TBC editions. Nationality uses the same declared/source fields as the existing collection report and never falls back to residence. |
| Possible duplicates | Same-name profiles excluding merged children; conflicting same-edition/source-URL/bib assignments; fixture, race-collector and club findings. Names alone are review flags, not merge evidence. Counts are affected records, not duplicate pairs. |
| Clubs | First/second current club affiliations deduplicated per athlete/club. Result totals describe those members' records, not necessarily performances achieved for the club. Includes open representative applications, active management and missing website/biography. |
| Backlog | Actionable fixture, race-collector, club-candidate, ingestion and club-registration queues. Private profiles and unpublished histories are not presumed to await publication. Age is time since the original record/submission. |
| Activity | Real-account registrations, active ownership links created in the period, profile confirmations with added results, and accounts with a recent sign-in. These stages are not a cohort conversion funnel. Vercel visitors use the connected reporting service and its own rolling window, including today. |

## New growth tracking

`20261014_collection_operations_stats.sql` adds nullable creation timestamps to existing editions/results, then sets a default for future inserts. There is deliberately no historical backfill. `collection_stats_tracking.started_at` records the rollout date. Existing records with unknown collection dates remain visible as unknown.

A small staff-only change journal stores only entity type, record ID and UK date. It records one meaningful update per retained record per day, ignores no-op/updated-at-only changes and does not duplicate private values. It does not record deletions or represent a full audit log. Existing result evidence/history auditing is unchanged.

Reports are read-only, parameterised, limited to 40 displayed rows per page and use one database snapshot for each report. Search is literal, not a SQL pattern. CSV export explicitly covers the displayed page and neutralises spreadsheet formulas. A failed request shows unavailable instead of fabricated zero counts.

## Validation

`npm run verify:collection-stats -- --browser` runs the existing report tests and `verify-collection-operations.mjs` against disposable PGlite data via the actual compiled RPC. It covers all sections, record drill-downs, access control, denominators, source overlaps, queue ages, no-op updates, unknown historical dates, stable pagination, browser interaction, CSV and responsive/error states. No real athlete data is committed as test fixtures.
