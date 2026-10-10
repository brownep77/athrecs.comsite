# Private DUV results and provisional athlete profiles

**Profile publication update, 10 October 2026:** Paul subsequently authorised
all profiles created by this DUV import to be public and listed in AthRecs'
athlete directory. This supersedes the private-profile default for this job only.
The source archive and result histories remain private and unverified. Existing
account privacy choices, unrelated profiles and uncertain identity holds are
outside this profile-only publication.

`scripts/publish-duv-source-profiles.sql` records this separate approval, publishes
unclaimed profiles from the current and first-event batches, and configures
future profiles. Pause the job only after its lease ends; validate on an isolated
branch, deploy the compatible worker, apply the SQL transaction, then resume.
The worker creates a publication audit for each new public profile. Repeat
publication changes zero profiles. Do not infer result verification from public
profile visibility or publish histories as a side effect.

Use the existing central `result_archive_source_captures` inbox and
`athlete_source_histories`; no parallel database or schema migration is needed.
This is a supervised, one-event-at-a-time workflow. The automated DUV fixture
feed stays disabled. Owner approval for private acquisition is not a provider
licence or permission to publish the material.

## Source capture

Open the supplied results index and select the requested year. Follow actual
result links; never construct event or runner IDs. Save the index and unfiltered
English event HTML outside Git. Keep response headers and request timestamps.
Respect provider request spacing (currently the generic robots rule is 20 seconds)
and stop on access denial or throttling; do not bypass it. Review current source
rules before further requests. No person-page requests are needed to retain the
runner links already present on an event page.

Run `scripts/prepare-private-duv-capture.py` with `--html`, `--index`,
`--source-url`, `--captured-at` and `--output`. It compares every displayed result
cell and runner link using lxml and a separate stdlib HTML parser, compares event
metadata, and checks the index event/date/distance/count. It fails closed when
headings, performance formats, dates, pagination or identifiers require review.
Dependencies: Python 3 and lxml, plus the existing private profile scripts.

Timed races store achieved distance independently of event duration. Preserve the
original performance string and decimal precision; never enter a kilometre value
as a finish time. Overall, gender and category places are separate. Birth year,
nationality and club are attributed source observations, not an exact date of
birth, residential country or confirmed current club. Truncated club strings
remain truncated. Raw HTML, source cells, DUV runner IDs, original-results links,
ranking eligibility and age-graded performance remain available in the capture.
DUV's displayed field can exclude performances under its statistical thresholds;
it must not be described as the complete organiser field.

## Snapshot and identity screening

Use a private approval JSON with `id`, unique per-event `batchId`, `projectId`,
production `branchId`, `approvedBy`, `approvedAt`, `approvalBasis` set to
`owner_private_import`, `scope` set to `staff_only`, the actual owner `instruction`
and `providerLicenseClaimed: false`. Use a fresh approval ID when its evidence
changes. Approval must come from the owner; these scripts do not grant it.

A private connection JSON contains `projectId`, explicit `branchId` and
`databaseUrl`. Never commit or log it. The shared connection helper sends
parameterized transactions to that branch's Neon HTTPS SQL endpoint.

1. Run `scripts/snapshot-private-duv-directory.py --connection ... --approval ...
   --output ... --confirm-branch ...` against production.
2. Run `scripts/prepare-private-duv-profiles.py --snapshot ... --capture ...
   --approval ... --output ...`.
3. Review the summary and held candidates. Existing names, aliases, spelling
   variants, accounts, DUV identifiers, repeated names within an event and possible
   youth profiles prevent automatic profile creation. A stable source ID supports
   a provisional grouping; it is not independent identity verification.

## Atomic application and verification

Create an isolated current production branch before validation. Run
`scripts/import-private-duv-event.py` with `--connection`, `--confirm-branch`,
`--plan`, `--capture`, `--html`, `--index`, `--receipt` and `--review`. Repeat the
same plan on this branch: inserted profiles, histories and audits must be zero.
Then use the production connection and explicit production branch, omitting
`--review`. Do not use a copied test receipt as evidence of a production write.

The importer locks screening inputs, rechecks their fingerprints and reruns the
independent HTML comparison. It stores approval/run/capture/profile/history/audit
records in one transaction, verifies full profile/history content and source
bytes, and rolls back on mismatch. Hashes and source identities make exact
replays safe. A changed directory requires a fresh snapshot and screening.

New profiles are private, unclaimed and provisional. Source histories are
unverified and unpublished. No canonical result, public profile, account claim,
verified personal best or ranking is created. A possible existing athlete is held
for review: this version does not automatically append histories to existing
profiles, merge identities, or overwrite previously captured performances.
Captured rows remain stored even when profile creation is held. On later races,
review held stable DUV ID matches and append new private evidence through a
separate reviewed path; never create a second profile for that runner ID.

The existing staff source archive can browse these captures and expand all
original DUV fields. Its time-oriented summary columns do not yet summarize DUV
distance performances; the original `Performance` field and athlete source
history preserve the value without mislabelling it as time.

Run synthetic tests with:

```sh
python -m unittest discover -s scripts/tests -p test_private_duv.py
```

Keep original HTML, directory snapshots, held identities, plans, receipts and
credentials outside source control. Preserve source evidence in the database;
remove temporary connection files after the supervised session. Store only
synthetic fixtures in tests. Report the exact number of events, source rows,
profiles and holds actually committed; a first event is not a full-year import.

## Full 2026 background import

The bounded worker in `functions/duv-import/` extends the single-event workflow.
It is deployed as the `duv2026` Neon Function on the existing AthRecs database.
It requires the expected branch name, an administrator secret for manual control,
and an approved, unrevoked staff-only job. The cron route accepts only genuine
Neon schedule deliveries named `duv-2026-import`. Anonymous requests cannot start
work or read job progress. No secret is embedded in the code or browser.

`20261010_duv_year_import.sql` adds owner-only job, queue, original-document and
matching-receipt tables. Original documents remain available when a row or event
is held. An identity revision counter invalidates the in-memory directory when
profiles, aliases, accounts or external identity associations change. Each write
chunk checks that revision under a lock, writes private profiles and unpublished
histories atomically, verifies its privacy/content invariants and records a cursor.
The next invocation can resume after eviction without repeating finished rows.

All seven index pages were compared with independent HTML parsers before seeding.
The initial inventory contains 6,363 event IDs and 596,374 listed DUV performances.
This is a snapshot of results available on 10 October, not an assertion that the
calendar year has finished or that DUV contains every organiser's finisher.

- Use `scripts/seed-private-duv-year.py` with an explicit connection, approved
  evidence JSON, compared source directory and target branch. It starts paused.
- Test on a current copied production branch, including authentication, a repeated
  run, profile linking and independent original-source comparisons.
- Activate the production job only after validation. The trigger is `*/5 * * * *`
  UTC. A job lease allows only one worker; database-backed request reservations
  enforce at least 21 seconds between source requests. Each invocation is bounded
  to about four minutes and returns before the platform timeout.
- Use actual observed pagination URLs. Every page is independently compared;
  all rows, source IDs, page ranges and gender totals must reconcile before a
  multi-page event becomes an imported capture. Per-page HTML and hashes remain
  stored independently and each athlete history retains its source page/row.
- Existing stable DUV IDs link further private history to the same profile only
  when the recorded name and available sex/birth-year observations are consistent.
  New results use a unique runner/event history key. Ambiguous names, conflicting
  identities, possible minors and unparsed new-athlete performances stay held.
- A source 401, 403 or 429 blocks the job. Database/identity invariants also block
  it. Do not route around those failures. Malformed dates, changed source counts
  and unfamiliar formats retain their evidence and become event-specific holds.
- The job stops when its finite inventory is processed, and refuses work after
  its configured expiry. Disable the trigger once completed (including completion
  with review holds). A monitoring task may inspect the job and notify the owner
  of a block or completion; it must not publish profiles or contact athletes.

Read progress from `result_archive_import_jobs`, grouped queue states and grouped
`result_archive_import_matches.status`; include the prior first-race import
separately when reporting cumulative DUV totals. Report source rows and profiles
as different counts. Previously captured races are recognized rather than copied.
Source comparison is not independent identity verification.

### Reviewing held source formats

Read the original compressed documents before changing a parser rule. Detail
titles may add a numeric edition/display prefix (including `2^`, `14 .` or a
bare number); the entire remaining title and the date must still match the
saved index exactly. The German index suffix `Etappen` may compare with the
English detail suffix `stages` only when distance and stage count match exactly.
Both original values and the comparison method remain in the capture audit.
Missing distances, conflicting dates and inconsistent finisher counts stay held.

The Italian detail ordinal suffix `a` (for example `9a`) and French `ème`
(for example `2ème`) follow the same exact
remaining-title comparison. A complete unpaginated table can also contain explicit
`X` category rows outside DUV's displayed male/female subtotal. Accept that format
only when index and metadata totals agree, every male and female subtotal matches,
and the entire difference consists of explicit `X` rows. Preserve the raw totals,
categories and row count in the capture audit. Unknown/blank categories, pagination,
other count differences and repeated runner IDs remain held. A known `X` identity
whose later source category differs requires review, just like known `M` or `F`.

Validate a parser update on an isolated database branch using stored documents.
Disable its inherited trigger and move its provider request clock into the future
so validation makes no provider requests. Explicitly requeue only the reviewed
supported events. The worker reparses held documents from their original bytes,
checks their hashes and preserves capture timestamps. Deploy to production only
after the import and repeat checks pass; then requeue those specific events for
the normal worker. Never delete original documents to force a refetch.

### Rolled-back database deadlocks

PostgreSQL SQLSTATE `40P01` may abort a profile transaction when another approved
import writes concurrently. Retry only a profile chunk whose `ROLLBACK` has
explicitly completed. The directory cache is cleared, then identity screening,
revision locking, approval and privacy checks run again from the unchanged
capture and cursor. Allow at most two retries with short backoff and a deadline
guard. All other errors, uncertain rollback, and exhausted retries still block
the job. Do not retry provider denials or relax the identity clock and triggers.

The operational secret and connection files belong outside Git. Build with
`npm ci --prefix functions/duv-import` followed by `npm --prefix functions/duv-import
run build`; deploy a ZIP with `index.mjs` at its root. The function runs beside
Postgres and uses a small persistent `pg` pool. Run the worker regression tests
with `npm --prefix functions/duv-import test`.
