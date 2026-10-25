# Reviewed source identity policy

Policy version: `reviewed-source-identity/v1` (25 October 2026).

The owner authorised a sensible relaxation of held-result review. This policy
supports supervised decisions about **new provisional profiles**. It does not
change the default candidate finder, grant publication authority, associate a
result with an existing athlete, or merge profiles.

## What changed

Earlier London review batches used a ten-year minimum conservative age gap and,
for some similar formal names, compulsory opposite original recorded sex. Those
were private review heuristics, not requirements in the repository's London
planner or the frozen held-case publisher. Preserve their historic receipts;
apply this version only to a new, explicitly reviewed batch.

A reviewed age contradiction can support a distinct-person decision when all
original fields are bound to the correct source identities and uncertainty has
been included. There is no universal minimum numerical gap and no compulsory sex
difference. A small separation deserves specific scrutiny of category semantics,
reference years and source quality; changing a number is not sufficient review.
Recorded sex can corroborate a decision but never substitutes for the source/name
comparison. Profile gender, inferred gender and URL filters are not original sex
evidence.

Exact names, initials, nicknames, spelling variants and changed family components
remain candidate-discovery signals. They do not prove either shared or separate
identity. Even identical names can represent distinct people when original source
evidence resolves the distinction. Compatible or uncertain same-name/alias cases
remain held; absence of another candidate is not a positive identity bridge.

## Keep four decisions separate

| Decision | Current scope |
| --- | --- |
| Publish an unassigned source row | **Not implemented by this workflow.** The archive is staff-only; authenticated members receive bounded suggestions. Do not promise anonymous public source-result pages. |
| Create a provisional profile | May follow a fully reviewed source-supported exclusion of all credible candidates, or an existing importer path with no candidates. Preserve provisional identity and original verification status. |
| Attach to an existing profile | Requires the existing positive-identity review and publication controls. Stable provider runner identities or exact, scoped historical performance bridges can support the match. Compatible age or a similar name alone cannot. |
| Merge existing profiles | Remains a separate, stronger process covering all achievements, identities, ownership, visibility and reversal/audit dependencies. This policy authorises no merge. |

Completed published histories immediately contribute to profile achievements and
PBs under the owner's existing policy. A provisional/unverified label is **not**
an achievement quarantine. Do not attach an uncertain result to an existing
person in order to increase the number published. Existing account links, claims,
hidden histories and privacy choices retain their original safeguards.

## Source-aware age evidence

Evaluate ages at the incoming edition, never at today's age. Preserve the raw
category, birth year or age and the provider's actual reference period in pinned
private evidence. Do not manufacture an exact birthday or treat a category floor
as an exact age.

`scripts/lib/reviewed-source-identity-policy.py` provides two pure calculations:

- `birth_year_interval(birth_year, target_year)` gives the possible age range for
  a year-only birth record, allowing for the unknown birthday.
- `category_interval(low, high, reference_years, target_year)` takes the union of
  **all plausible** category reference years, with a birthday boundary each way.
  A `None` upper bound stays open. Unknown provider semantics cannot be repaired
  by picking the most convenient reference year.

The review supplies source-compared intervals at the incoming edition. Multiple
compatible original facts about the same source identity can narrow an interval;
contradictory facts hold the case. Overlapping or touching intervals do not
establish separate people. Unresolved source semantics, missing original-field
comparison, unaccounted age uncertainty, or a positive identity bridge also hold
the case. A recorded same-person source ID plus a conflicting age needs conflict
resolution, not a new duplicate profile.

The helper checks arithmetic and the explicit review contract. It cannot establish
that a reviewer's source interpretation is true: a separate source comparison and
independent review still need to assess the original fields and every retained
fact. Unknown or unparsed facts must be recorded as unresolved, not omitted.

## Reviewed weak fuzzy suggestions

A broad name search may return a candidate whose complete original names are
materially unrelated after review of aliases, spelling and compound names. A
reviewer can record `not_a_plausible_match` with a concrete individual reason.
This is a search assessment, **not a definitive different-person assertion**.
Incomplete names, equivalent names, plausible aliases, positive identity bridges
and unresolved facts cannot be cleared through this route. A different club is
not proof of distinction; missing clubs are neutral, and clubs can change.

The frozen London publisher only accepts `same_person` or `different_person`.
The new helper therefore returns `requires_nonblocking_publisher_adapter` when
any candidate is only nonblocking. Such a receipt cannot be translated into
`different_person` or published by that frozen writer. A future separately
versioned adapter must support the explicit outcome, restrict it to new-profile
decisions, bind the exact review and current candidate/collision sets, and keep
all source, privacy, claims, source-locator, fingerprint and replay guards. That
adapter is not provided by this change.

## Private review CLI and importer integration

Use this workflow for a new supervised batch; keep real source data out of Git.

1. Produce fresh full-directory/account candidate screening, complete candidate
   state, uncapped same-edition source collisions and cross-edition checks.
   Include profiles already published by earlier batches. Retain the source
   corpus, snapshot and full-state file hashes.
2. Build a private JSON review matching `evaluate_review()` in the helper. Its
   `evidenceFiles` are unique `{id, path, sha256}` records; relative paths resolve
   against the review file. `bindings` maps `snapshot`, `candidateState` and
   `sourceCorpus` to those IDs. Preserve the actual `snapshotFingerprint`.
3. For each case, retain `groupId`, `groupDigest`, `editionDate`, all
   `sourceObservationKeys`, original names, source evidence IDs, source quality
   flags and eligibility. Record every `SAFEGUARDS` check explicitly. These are
   evidence-bound reviewer assertions, not checks silently performed by the CLI.
4. Copy the exact current `candidateTokens` and `sourceCollisionGroupIds`; review
   every one exactly once in `candidateReviews`/`collisionReviews`. Each review
   has `ref`, `requestedDisposition`, `originalNames`, `nameRelationship`, an
   individual `rationale`, `evidenceIds`, optional `ageEvidence`,
   `allRetainedNamesReviewed`, `sourceFactsConsistent`, `identityBridgePresent`
   and `unresolvedIssues`. All known aliases and facts must be accounted for.
5. `ageEvidence` contains nonempty `incomingFacts` and `candidateFacts`. Each fact
   has `low`, `high`, `basis`, `atEditionDate`, `evidenceIds`, a `referenceDescription`, and explicit
   `originalFieldsCompared`, `sourceSemanticsResolved`, `uncertaintyIncluded`
   booleans. Every `atEditionDate` must equal the case's incoming `editionDate`. `basis` is
   `birth_year`, `bounded_category`, `lower_bound_category` or `explicit_age`.
6. Run the CLI, which hashes all pinned evidence files and refuses to overwrite a
   receipt. It has no database or network path:

   ```sh
   python3 scripts/review-source-identity-policy.py \
     --review /private/new-batch/identity-review.json \
     --output /private/new-batch/identity-policy-receipt.json
   ```

7. Freeze the input and receipt hashes as evidence in the supervised publication
   proposal. Only `eligible_distinct_profile_review` cases can use the unchanged
   London publisher. Copy each actual source-supported exclusion reason and
   evidence references; the policy receipt is **not** publication approval.
8. The publisher independently compares the exact current candidate/collision
   sets and complete preimages, source eligibility/quality, locators, privacy,
   claims, fingerprint and capture/approval validity. Use the existing copied
   trial, replay and live verification. A changed snapshot requires a new review.

The private receipt preserves the input hash, evidence hashes and code/document
pins, with case statuses `eligible_distinct_profile_review`,
`requires_nonblocking_publisher_adapter` or `hold`. It explicitly authorises no
publication, existing-profile link, structural merge or verification upgrade.
Source files and frozen prior receipts are never modified.

For a synthetic complete manifest, see `review_fixture()` in
`scripts/verify-reviewed-source-identity-policy.py`. Future importers can call
`evaluate_review()` directly, but must reproduce the CLI's evidence-file hash
checks and their own live/source/publication guards before relying on its output.
This opt-in reviewed workflow leaves the default London matcher unchanged.

## Focused regression check

```sh
python3 scripts/verify-reviewed-source-identity-policy.py
```

The check uses synthetic names and source files only. It covers uncertainty and
overlap, contradictory age facts, aliases and same names, missing evidence,
complete candidate/collision accounting, source/privacy holds, weak-outcome
separation, hash changes and immutable receipt output. No database, web request,
production data or application build is required.
