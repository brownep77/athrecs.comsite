# Excel results import and bulk review

Staff entry: `/admin/import-results` on `update.athrecs.com`.

## Staff workflow

1. Choose the original `.xlsx` or `.csv` results file. Select its worksheet when there is more than one. Common headings, including TRT's filter-polluted headers, are detected. Expand the column map only when needed. No athlete-directory export or JSON conversion is required.
2. Confirm race name, date, distance and the official results URL once. Explicitly confirm whether a generic Time column is chip, gun or unspecified. Separately named timing columns are never conflated.
3. Preview. This saves a private, seven-day, creator-scoped review record in the existing staff audit store, not athlete profiles or results. A summary separates no-likely-match new-profile candidates, possible existing athletes, exact imported entries and source/conflict problems.
4. Filter by name, bib or club. Select the eligible rows across an entire filtered group, not just the visible page. Existing-name candidates require an explicit eligible target and an identity evidence note. Name, club and gender agreement is not automatic identity proof. Private or account-managed matches cannot be linked or published through this uploader.
5. Confirm the selected group once and choose **Import approved entries**. The browser processes bounded 100-row transactions and displays cumulative progress. Keep it open while running. A failed chunk rolls back; earlier completed chunks remain recorded. Retry skips exactly identical source entries. Unselected and held entries remain in the saved review.

Imports create **private** records. Existing publication and owner-claim workflows remain separate. This change does not deploy the public Results section or make a whole batch public. Do not use the existing directory's unfiltered bulk-publication button for unrelated records.

## Source and identity controls

The initial independent source adapter supports Total Race Timing's server-rendered results tables. Other sources are rejected with an actionable adapter message; they are not silently treated as verified. The code uses the existing bounded provider fetch and independent source audit, adds exact bib/name/gender/category/club/time/rank comparisons, and checks the date, event and a single distance table. A table-anchor URL is required where tables would otherwise be ambiguous. Generic Time-to-chip/gun classification is a recorded staff statement, not a provider-labelled field.

The source's existing `ATHRECS_RESULT_SOURCE_APPROVALS_JSON.total_race_timing_results` permission reference is required before participant insertion. Preview and identity triage do not invent approval or bypass the gate. Missing approval is visibly explained beside the disabled import button.

Exact decimal milliseconds, source text, race-day club, actor, filename and SHA-256, source-table checksum and identity decisions are retained in private result evidence. The existing integer columns receive nearest-second values. Displaying subsecond times on existing public profile/PB pages is not implemented here. Unknown gun times, births, nationality and residence are not invented. Race-day clubs are not used to change existing membership, and corporate labels do not create clubs.

Source data is fetched again before each approved chunk. Database state is re-read under bounded transactional locks before inserting. New same-name candidates invalidate a previously clear preview. No existing results are overwritten. A conflicting source row, duplicate bib, repeated race name or existing athlete/edition performance stays held. Canonical event/edition matching is checked independently before insert. The normal initial catalogue must be seeded first.

This import path requires the existing staff-host, Google and email-allowlist middleware and is disabled on RunRecs. Preview deployments cannot write to the live audit workspace or import database. There are no new production migrations, credentials, bypass endpoints, real athlete fixtures, or provider data in this PR.

## Validation

`node --experimental-strip-types scripts/verify-result-upload.mjs --core-only`

`node --experimental-strip-types scripts/verify-result-upload.mjs`

The full command uses synthetic Excel workbooks and an isolated PGlite database. The dedicated workflow also builds routes, type-checks and lints without production database credentials. The server source adapter still needs fixture/integration review against real provider DOM changes; passing parser or database tests alone is not athlete identity verification.

Current bounded limits: 3 MB compressed file, 25 MB declared XLSX expansion, 5,000 rows, 100 columns, 20 visible sheets, 100 rows per write transaction, and 50,000 live athlete/event records for identity/event lookup. Exceeding a bound stops rather than silently truncating and creating potentially duplicate records. Protected records, alternative names not inferable from the source, non-finishers, changed results and race aliases outside exact normalization require separate review.
