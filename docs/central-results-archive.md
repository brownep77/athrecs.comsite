# Central race-results archive

The staff entry point is `/admin/result-archive`. Existing canonical `results`
remain the records read by athlete profiles, public race pages and claim tools.
This change adds private source observations before an athlete identity is known;
it does not create a competing profile-results database.

## Workflow

1. Select the exact existing race edition (event, date and distance).
2. Record the timer/provider, official source URL, stable provider race key,
   participant-data reuse authority and the source's expected count if known.
3. Upload CSV/TSV, explicitly review the heading mappings, inspect the preview,
   then save the private field. Export Excel to CSV; existing Excel tools remain.
4. Search source rows by athlete/bib/club, or search all canonical results,
   including records imported before this archive existed.
5. Compare a row with candidate athletes and any existing performance. Inspect
   the source and record identity evidence before linking. Names alone are
   suggestions. A new record is private and unclaimed. Existing profile
   visibility, hidden results and account ownership are not changed.
6. A later upload with changed source values creates a revision. It never
   overwrites a canonical performance. Compare the old/new values and record an
   explicit correction. All changes have before/after records. To reverse a bad
   source correction, re-import the earlier source values and review that new
   revision; history is retained rather than erased.

New registrations can see bounded name-matched suggestions from archived fields
in Potential results. They can request a staff review after verifying their
email. Requests are deduplicated and limited to 30 new entries per account/day.
Staff see pending requests in the archive. Linking does not approve account
ownership; the existing claim/identity workflow still handles that step.

## Storage and extension contracts

| Record                               | Responsibility                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `result_archive_datasets`            | Provider + source race key + canonical edition; permission and coverage context |
| `result_archive_batches`             | Request fingerprint, staff actor and repeat-safe commit receipt                 |
| `result_archive_entries`             | Current private source observation and optional canonical result link           |
| `result_archive_revisions`           | Original cells and normalized values for each changed observation               |
| `result_archive_athlete_identifiers` | Staff-reviewed provider athlete ID mappings across races                        |
| `result_archive_decisions`           | Identity decisions, holds and correction before/after snapshots                 |
| `result_archive_match_requests`      | Account-scoped requests for review; never ownership grants                      |
| `results`                            | One canonical performance per athlete and edition, already used by profiles     |
| `result_source_references`           | Multiple credited providers supporting the same canonical performance           |
| `result_change_history`              | Before/after audit for every actual update/deletion by existing result writers  |

Provider adapters and authorised scheduled jobs should normalize to `ArchiveRow`
and invoke `createArchiveDataset` / `ingestArchiveBatch` from server code with an
auditable staff actor. The service API accepts at most 500 rows / 2.5 MB per
atomic chunk. Request IDs are persisted with their receipts; callers should
persist the ID before submitting and replay it after ambiguous failures. A race
can span any number of chunks. The browser uses chunks below 1 MB and files up
to 25 MB. Reopening/re-uploading the same source also deduplicates by source key
and content. A missing row in a later upload is never an instruction to delete.

Source keys must identify individual entries, not people. Bibs are scoped to an
edition/provider; use provider entry IDs where heats, waves or relay legs reuse
bibs. Names and finish times are never identity keys. Raw duplicate keys are
rejected instead of silently keeping the last row. Source payload hashes use
stable object ordering; identical reuploads do not create phantom revisions.

Original precision, chip/gun times, separate classification positions, status,
splits and non-time marks can be retained. Current canonical race results store
integer seconds, rounded with `Math.round`; precise seconds are also retained in
`result_details.timing`. Unknown finish statuses, untimed marks and team/leg rows
remain archived until a suitable sport-specific review path exists. This avoids
presenting a relay leg or a field mark as a full-race personal best.

## Integrity and access

- Staff middleware protects every archive administration endpoint. Member
  suggestions use server-derived account names, no arbitrary client name search,
  and return a small whitelisted view without original cells or staff notes.
- Writes require persistent storage and are disabled on Vercel preview
  deployments. No production participants, claims or emails are changed by the
  migration or tests. Read routes do not silently run a catalogue restore.
- Transactions lock dataset, entry, athlete and canonical result in that order.
  Dataset row locks serialize source revisions; independent datasets can import
  concurrently. A unique source-row constraint and request fingerprints prevent
  duplicate commits. A late failure rolls back the entire chunk, not earlier
  successfully completed chunks.
- Corrections require both the reviewed source revision and a fingerprint of the
  existing canonical record. Concurrent edits require a fresh review. Existing
  DQ decisions cannot be cleared by this path. Legacy catalogue refreshes skip
  results carrying an archive decision, so they cannot restore superseded times.
  Later canonical changes also flag other supporting source rows for comparison,
  using their last reviewed history position rather than cross-dataset write locks.
  The legacy generic importer also preserves archive-reviewed performances.
- Several sources can corroborate one canonical result. A conflict requires an
  explicit correction; linking alone never replaces existing values. Source bib
  collisions and contradictory stable athlete IDs are held for review.
- Canonical result deletions referenced by the archive are restricted to prevent
  dangling history. A privacy-erasure operation must explicitly handle source
  revisions, decisions and result references together; do not cascade an athlete
  deletion without that review. Retention policy and offsite database backups
  remain operational responsibilities.

## Scope and maintenance

This is a reusable core, not a claim that every race is already collected. New
provider connectors, changing provider formats and permissions remain ongoing
work. Existing importers continue to write canonical results and appear in the
same staff search; their historical raw files cannot be reconstructed and are
not invented. The existing 08:00 collection automation is unchanged.

Dataset selectors/coverage show the 50 most recently updated sources. Source and
canonical searches use keyset pages of 50, with no forced migration/backfill of
the existing catalogue. History details show the latest 25 revisions/decisions;
the database retains all versions. Coverage uses actual distinct stored rows,
not the sum of historical upload attempts. Unknown expected totals stay unknown.

## Verification

- `npm run verify:results-archive`: real migrated disposable PGlite, actual service
  queries, replay/rollback, corrections and precision, seed protection,
  multi-source deduplication, stable IDs, private new records, delayed account
  registration, request ownership checks and pagination.
- `.github/workflows/results-archive.yml` repeats the service suite on a fresh
  PostgreSQL 17 service, including six simultaneous import retries and four
  simultaneous reviews. It refuses application database credentials.
- `npm run verify:results-archive-browser`: actual React screens → loopback HTTP
  → validated server functions → disposable database → rendered results. Tests
  a lost response after commit, safe resume, member review requests, staff
  matching, unchanged ownership, private publication and mobile layout. Only
  the session host is synthetic; no external requests or emails are sent.

Athlinks' published API documents race/course imports, searching unclaimed
results and linking result IDs to an athlete account. This supports the broad
product model, not a claim about their private database schema:
https://api.athlinks.com/results and https://api.athlinks.com/races (checked
9 October 2026).
