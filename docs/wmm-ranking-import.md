# World Marathon Majors ranking edition 8

The owner requested all men and women in every age group from the official WMM
world rankings, with duplicate checks, on 10 October 2026. The current source
period is 1 October 2025–30 September 2026. Its JSON feed initially reported
649,591 ranking entries. Counts are observations, not independently verified
unique people.

`collect-wmm-rankings.py` reads the public feed used by the ranking and claim
results pages. It retains source athlete/result IDs, reads all nine age groups
for both genders, splits overflowing rank intervals and checks actual category
totals. Ranking ties and gaps are preserved. Captures are resumable gzip JSON
files in an explicitly supplied private directory, outside source control.

`prepare-wmm-profiles.py` requires complete coverage before screening. It compares
names/aliases, accents, punctuation, token order, nickname families and shared
spelling signatures against the source population and a directory/account
snapshot. Possible matches are held with supporting and opposing reasons;
names do not authorize a merge. It checks result IDs, source athlete IDs,
edition, gender, year and finish-time consistency. Identical performances under
different source result IDs are combined; contradictory race/year records are
held. Original source rows remain available.

`apply-wmm-profiles.py` requires an explicit project/branch connection file and
`--confirm-branch`. Rehearse on a fresh production copy using `--review --limit
1000`. Production publication requires `--publish`, the configured production
branch and the owner's existing authorization. Keep credentials, captures,
snapshots, plans and receipts outside the repository.

Every batch refreshes the live name/alias/account snapshot and checks its
fingerprint under a short database lock before inserting. New conflicts are
held. Source athlete IDs and unique slugs make repeat runs skip completed
profiles. Profile, source history, publication audit and receipt checks are
atomic. No existing athlete, canonical performance, ownership, account or
privacy preference is overwritten.

Source capture approvals record owner-requested acquisition, not an assertion
of a provider licence. Public profiles are unclaimed and provisional. The WMM
feed supplies race years, but no exact race dates or chip/gun classification.
Those fields stay unknown. Source history is explicitly unverified, has
`complete=false`, preserves provider attribution and does not invent canonical
race editions, independently verified PBs, medals, residence or dates of birth.

The source is registered as `abbott_wmm_age_group_rankings`. Generic scheduled
crawling is disabled; this collector is supervised and specific to edition 8.

Run the synthetic checks with:

```sh
python scripts/verify-wmm-profiles.py
```

The real-branch rehearsal additionally checks transaction behavior, profile
identifiers, visible source histories, publication auditing and repeat safety.

After all three production partitions finish, `finalize-wmm-import.py --work
<private-work-directory> --output <report-directory>` reconciles their receipts
with the database, checks source/result ID uniqueness, validates publication
flags and source fields, exports the complete held-review queue and writes the
audit report. It marks only this capture run completed after those checks pass.
The report and audit contain athlete observations and belong outside Git.

The public historical-result row now includes the named provider link when the
staff evidence columns are hidden. This display change must be deployed before
the live public page can show that credit; storing provider URLs in the history
alone does not make the existing public layout display them.
