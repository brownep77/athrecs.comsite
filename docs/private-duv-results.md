# Private DUV results and provisional athlete profiles

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
