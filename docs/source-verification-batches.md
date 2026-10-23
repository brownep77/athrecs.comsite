# Reviewed source-verification batches

`scripts/lib/source-verification-batch.mjs` applies an explicitly reviewed plan of
result verification decisions. It does not discover evidence, infer authority from
a URL, confirm account ownership, or make a profile public. Review the actual
source or retained original capture under `docs/result-evidence-policy.md` first.
Private plans, source rows, exports, credentials and receipts must stay outside git.

Several imports intentionally began with `verificationStatus: "unverified"`, even
when a source row had already been transcribed and compared. This is an import
state, not evidence that the published mark is wrong. A later review can confirm
the exact source athlete, event and result and set `source_verified` while account
ownership and the source profile's personal-identity status remain unconfirmed.
A transcription check alone is insufficient: source authority, exact athlete
match, all supplied values and unresolved holds still need review. A provider name
or existing source link alone never upgrades a result through this helper.

## Plan shape

The plan has `schemaVersion: 1`, a unique `batchId` of 8–120 lowercase letters,
digits or hyphens, an honest `reviewedAt`, and an `actor` containing
`kind: "automation"`, `name` and `purpose`. It contains at most 200 target groups,
2,000 reviewed records and 10 MiB of JSON. Split larger reviews into bounded plans.

Canonical entries contain:

- `target: {kind: "result", resultId, athleteId}`.
- `before`: the complete `to_jsonb(results)` record from the intended database.
- `evidence`: the comparison described below.

History entries contain:

- `target: {kind: "history", athleteId, provider, externalId}`.
- `before`: the **complete original `performances` array**, in its original order.
- `reviews: [{index, evidence}]`, using zero-based indexes into that array.

Both entry types can include a `profileGuard` containing `displayName`, `gender`,
`parentAthleteId`, `sourceUrl`, the complete `profileDetails` JSON object, and
`activeAccountLinks: [{user_id, status: "active"}]`. Preserve the exact text
`user_id`, without numeric conversion. Read these values with the source-identity
review. At application the profile and active links are locked and compared;
changed names, parents, profile metadata or active ownership links stop the plan.
The existing archive identity lock serializes cooperating identity writers.
Regardless of whether a guard is supplied, current profile-level identity,
qualification and conflict holds are checked before updating results.

Every evidence object requires an HTTPS `sourceUrl`, `sourceKind` (one of
`governing_body`, `organiser`, `official_timer`, `owner_accepted_source`), an
`authorityEvidence` explanation, the exact `locator`, `identityEvidence`, a
nonempty original `sourceRow` object, and comparison qualifications in `note`.
`sourceChecked` must be true. `fieldsCompared` must confirm all seven keys:
`athleteIdentity`, `race`, `editionDate`, `distance`, `finishStatus`, `timing`, and
`placings`. Confirm only what was actually checked; where a field is absent from
the source, check that the stored record does not fabricate it.

`captureKind` is `live` or `retained_capture`. Preserve `capturedAt` separately
from the later `checkedAt`. ISO dates are accepted when only the date is known;
do not manufacture timestamp precision. A retained capture also needs a stable
`captureReference` such as its private archive ID and hash.

For evidence in the private source-capture database, add:

```json
{
  "captureGuard": {
    "id": "123",
    "provider": "Example Timer",
    "sourceKey": "example-race",
    "payloadHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "sourceSha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  }
}
```

These are synthetic placeholders, not usable evidence. At application, this
guard locks and checks the capture and its active staff-only approval, both hashes,
the original capture date, `source_check='compared'`, and absence of a newer
capture for the same provider and source key. A newer held capture also blocks an
older one. The helper does not decode the original bytes or independently repeat
the field comparison; that must be completed before preparing the plan.
Database references such as `db-capture:123` require the guard. A private retained
file reference outside that database may use its actual file/hash reference.
Preserve database timestamp precision when preparing a guard: select the capture
timestamp as text with all fractional digits. JavaScript `Date.toISOString()`
drops PostgreSQL microseconds, and that rounded timestamp deliberately fails the
exact comparison. For example, use
`to_char(c.captured_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`.

An explicit prior staff decision or rejected verification request blocks the
plan. An intentionally reconsidered decision requires an `overrideDecision` on
that exact review, with a detailed `reason`, the unchanged original
`staffVerification` object where present, and complete original `rejectedRequests`
snapshots where applicable. Do not use this to dismiss unresolved identity or
source conflicts.
Active `sourceIdentityReview` or `sourceQualificationReview` decisions, explicit
conflict/hold flags, non-finishes, disqualifications and future results stop the
batch. Canonical rows excluded solely as display mirrors may be reviewed while
retaining their exclusion; an excluded row with an active hold remains blocked.

## Dry-run and apply

The CLI reads a Postgres URI from a private file and does not print it. It reserves
the private receipt file before opening the connection. Default execution runs
the real transaction, including database triggers and readback, then rolls back.

```sh
node scripts/apply-source-verification-plan.mjs \
  --plan /tmp/reviewed-plan.private.json \
  --connection-file /tmp/database-url.private \
  --receipt /tmp/verification-dry-run.private.json
```

Review the receipt and use its exact `planHash` when applying:

```sh
node scripts/apply-source-verification-plan.mjs \
  --plan /tmp/reviewed-plan.private.json \
  --connection-file /tmp/database-url.private \
  --receipt /tmp/verification-applied.private.json \
  --apply --plan-hash REVIEWED_SHA256
```

The module also accepts an existing SQL adapter with `query(text,params)` returning
rows and `transaction(callback)`. It never obtains credentials or connects on its
own. Use this interface with the established execution environment where needed.

## Invariants and reporting

The transaction compares complete preimages, preserves history ordering, and
changes only `verificationStatus` and private `staffVerification` evidence in each
reviewed result. Exact marks, dates, places, original evidence, exclusions,
publication and ownership remain unchanged. It preserves both include and exclude
choices using PostgreSQL's `md5(jsonb::text)` and carries over their original
confirmation time. Existing claim mirrors and verification requests receive the
same decision. Unexpected new mirrors, stale evidence or concurrent edits abort
the complete batch.

The private audit retains original result/history values, prior request decisions,
the exact plan hash, source comparison and honest automation identity.
`actor_user_id` and request `reviewed_by` remain null; the automation does not
impersonate a human staff member. Canonical result-change triggers receive the
automation actor and batch reference through transaction-local settings.

Receipt `recordCount` counts changed records. `historyPerformanceCount`,
`canonicalResultCount` and `excludedCanonicalResultCount` are separate because a
canonical graph row can mirror a displayed history performance. Do not report
these mirror writes as extra athlete performances. A repeat of the same plan
returns `alreadyApplied` without rewriting anything, after checking that the
audited result/history values remain unchanged. A changed plan needs a new batch
ID and a new review.

## Regression test

```sh
node scripts/verify-source-verification-batch.mjs
```

Synthetic PGlite tests exercise real source-history and result-audit triggers,
dry-run and failure rollback, exact full-history guards, retained-capture guards,
manual/rejected decisions, original fields and visibility, choice hashes,
mirrored claims, request decisions, honest audit identity and idempotent retries.
