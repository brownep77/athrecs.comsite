# Linking World Athletics histories to imported athletes

`scripts/link-world-athletics-history.py` enriches an existing public, unclaimed
source profile. It creates no second athlete and deletes no source records.
Familiar names identify candidates; they never authorize a link on their own.

Prepare requires a private, explicitly reviewed mapping manifest, captured
official profile JSON and every annual response listed by that profile. Each
response is obtained using the public page's own annual-results request.
The manifest pairs AthRecs IDs with observed World Athletics profile URLs/IDs
and reviewed race-title aliases. It can hold known contradictory source rows.

A link requires compatible names, explicit source nationality and sex, no
conflicting birth date, a compatible observed age category, and at least one
unique exact shared race, year, marathon distance and mark. The source profile
supplies the exact birth date. A one-second discrepancy is a review case, not
automatically a chip/gun conversion. Existing source mappings, other matching
directory profiles, account control or canonical results hold the candidate.
No general athlete-account verification flag is changed.

Source histories preserve decimal precision, round, placing context, dates,
non-finishes, annotations and the original source row with a deterministic
locator. Road distance labels use the existing Running taxonomy; track marks
remain Athletics. Duplicate source observations are suppressed only after an
exact match, with the original row and replacement reference retained.
Intermediate splits, exhibitions, conflicting rows and manifest-held anomalies
remain in staff audit evidence. Histories remain explicitly incomplete because
collecting all currently available source years does not establish a complete
career. No canonical PB, result or event is invented.

Rehearse on a fresh production branch, then inspect source rows and the exact
plan. Apply requires `--owner-authorized`, an audit actor, the explicit branch
and, for production, `--publish`. The production target and project must match.
The plan hash, locked before-state, source mapping, claim and duplicate checks
are rechecked before each atomic transaction. Replaying an applied request is
a no-op. Public visibility and sharing settings remain authoritative.

Full before-state and source captures are retained in the private
`athlete.cross_source_linked` audit. `athlete.history_admin_published` records
the publication authority. These are recovery/evidence records, not a claim
that every source or catalogue entry has been independently verified. Provider
display follows the existing public presentation policy.

Keep all captures, manifests, plans, credentials and receipts outside Git.
Run `python scripts/verify-world-athletics-link.py` for synthetic adversarial
checks. Real-branch checks should include exact readback, source-row comparison,
transaction rollback on stale input, source-identity uniqueness, visible
deduplication and idempotent replay.
