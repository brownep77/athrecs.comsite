# TLM source-profile publication

The owner explicitly requested public results alongside athletes on 13 October
2026. The supervised importer uses the existing published source-history path,
as other approved source-profile imports do. It does not claim a provider
licence or turn a private acquisition approval into provider permission.

`scripts/publish-tlm-source-profiles.py` handles the already compared
`20261013-continuation0635` batch. `prepare` checks capture hashes and original
CSV cells, then screens all source names against the current athlete/account
directory using the established aliases, nickname, spelling and token checks.
Possible existing identities and source-name variants are held, never merged.
Singleton source entries may create unclaimed profiles. Repeated names also
require a consistent source club, gender and compatible reported ages across
different dates. Juniors, unknown source ages and sensitive categories remain
held for separate review. These checks do not verify athlete identity.

`rehearse` requires an isolated branch. `publish` requires the explicit production
branch and unchanged plan hash. Every transaction locks and rechecks the live
directory fingerprint, source capture hashes and active import approval. It
inserts only new profiles, published histories and owner publication audits.
It does not update an existing athlete, ownership, visibility choice, canonical
result, or provider-rights setting. Source IDs and slugs make replay safe.

All public performances retain `verificationStatus: unverified`. Original chip,
gun and unspecified timing remain distinct, with original decimal precision.
Race dates, distances and separate placings remain as supplied. Exact ages,
residence, source-only health flags, raw cells and evidence are not added to the
public projection. Private capture references support later review. Nationality
is absent in this batch and is not inferred from the race country.

Keep participant plans, captures, connections and receipts outside Git. Run
`python3 scripts/verify-tlm-source-profiles.py`, validate all proposed histories
against the actual schema and perform a real branch rehearsal before production.
Verify anonymous profile output and the existing search-eligibility predicate
after publication. A source history is not a new canonical race result or an
independently verified PB.

The privacy notice now describes the existing approved public source-profile
previews separately from unlisted shared account profiles and private archives.
Public availability is not, by itself, proof of unrestricted reuse: factual
records, database rights and personal-data processing are distinct questions.
This workflow records the owner's instruction without asserting legal clearance.
