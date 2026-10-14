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

## Continuing the club-only hold queue

`scripts/continue-tlm-source-profiles.py` reviews only groups whose original
hold was a missing consistent club. It rechecks all 41,691 source rows against
the retained original CSV bytes and compares the previously published histories
with those rows. Repeated records must have identical source name components,
gender and recorded city/state, compatible exact reported-age intervals and
distinct race dates, with no conflicting clubs. Location and age evidence stays
private; no nationality or birthday is inferred. The current directory and
canonical event/year/bib observations are screened again. Existing people are
never automatically merged or linked. The same immutable-plan, isolated-rehearsal,
transactional fingerprint and source-capture guards apply before publication.

Run `python3 scripts/verify-tlm-followup.py` and validate every planned history
against `sourceHistorySchema`. Retain the original hold audit and append the
follow-up outcome, including source keys that were released and those still held.

Public profile result pages retain five performances per response and link older
approved, unclaimed records with `?resultsPage=2` and subsequent page numbers.
Each page is server rendered, uses its own canonical URL, and carries the same
evidence-stripped fields and verification labels. Existing account-linked preview
limits and owner opt-outs are unchanged. Page counts are computed after the
existing visibility and hidden-result filters; out-of-range pages redirect to a
real page rather than generating an empty indexable URL.

The 14 October source-name review is implemented by
`scripts/continue-tlm-alias-profiles.py`. It considers complete connected groups
of retained source-name variants only when their previous holds concern names or
club corroboration. Shared recorded city/state, gender, compatible exact source
ages, distinct dates, valid placings and non-conflicting clubs remain required.
Nicknames and spacing differences retain all recorded names as aliases. A
one-edit spelling difference additionally requires an explicit private decision
bound to the complete set of source-result keys. Neither route verifies a
person's identity, infers a birth date or merges an existing profile.

Use `verify-tlm-alias-review.py` for synthetic conflict cases, compare proposed
records with the actual provider CSVs, and run the existing source-history schema
validation. The previous private review must still match its live audit; public
and held source keys must form the original complete partition. Preparation
screens the current directory, and the existing publisher rechecks it under a
transaction lock after a successful isolated rehearsal. Retain fresh source
comparisons, spelling decisions, released keys and the remaining queue privately.

## Distinguishing separate source observations

`scripts/continue-tlm-distinct-profiles.py` reviews the next retained queue. Similar
names are not necessarily aliases. A complete component can instead support
separate provisional profiles when the original CSV contains distinct entries in
the same programme, with separate bibs and placings plus a material reported-age
difference or different recorded gender. The other bounded route requires more
than five years between compatible source-age intervals and different non-empty
recorded locations for every pair of observations across the proposed profiles.
These are source distinctions, not verified real-world identities.

Within each profile, repeated observations still require identical recorded name
components, city/state and gender, compatible ages and distinct dates. A two-row
exact-name group may be separated only by the same-programme route, with no other
identity holds or conflicting gender. Each accepted component also requires a
private decision bound to all its source keys. Unresolved transitive variants,
unknown/junior ages, invalid placings and possible existing identities stay held.
No source name, age or location is repaired to qualify an observation.

Run `python3 scripts/verify-tlm-distinct-review.py`, and use
`node scripts/verify-tlm-followup-plan.mjs PRIVATE_DIRECTORY --allow-single-observation`
for the actual history schema and source-field comparison. Recheck original and
fresh provider CSVs, reconcile every public/held source key, and rehearse on an
isolated branch. Publication uses one bounded atomic batch. A new directory
conflict on either proposed sibling holds the entire reviewed component. Keep
the prior audit, separation evidence and exact remaining queue in private storage.
