# London Marathon edition profile import

This supervised import uses retained Pace Notes and MarathonGuide observations.
The private collection is checksum-pinned by the mapper. It does not fetch a
blocked timing site, infer missing race facts, or mark secondary records verified.

## Decisions and evidence

- Every source observation is retained in the private capture inbox, including
  its original fields, result locator, capture date and import decision. The
  existing participant search trigger indexes the names for staff review.
- An exact full name and finish time can pair one observation from each source.
  A source result locator identifies a performance, not an enduring athlete.
- Potential existing names and aliases are screened against the entire athlete
  directory and account names. Nicknames, omitted middle names, punctuation,
  diacritics, token order and limited spelling variants are hold signals only.
- Unambiguous Pace Notes observations can create unclaimed, provisional public
  profiles with one unverified source-history performance. Unknown birthday,
  nationality, residence, bib and placings remain empty; finish time has an
  unspecified timing basis. The licence credit is required before publication.
- A reviewed duplicate performance appends private supporting evidence to its
  existing athlete. It does not add another public performance, rewrite an
  existing history, change a privacy hash, claim an account or verify identity.
- A year-only WMM observation may be associated with the independently reviewed
  London edition after its event title, year, marathon distance, original
  source identity and exact time have been compared. Its original date precision
  remains unchanged. A frozen, snapshot-bound review is required for this path.
- Ambiguous identities, source-quality flags, conflicting facts and excluded
  records remain held. MarathonGuide-only observations remain private pending
  source review. Multiple existing identities are never structurally merged by
  this adapter.

The default candidate holds above remain unchanged. A separately supervised held
batch can apply the versioned [reviewed source identity policy](reviewed-source-identity-policy.md)
with a pinned CLI receipt and current per-candidate evidence. That policy does
not require a fixed ten-year age gap or opposite original recorded sex. It does
not turn weak fuzzy suggestions into confirmed different people, publish
unassigned rows, relax existing-profile links, or replace the publication guards.

## Workflow

Keep all connection files, raw inputs, snapshots, plans, reviews and receipts
outside the Git checkout. Never upload credentials or private source exports.

1. Recover and validate the retained collection. Run
   `scripts/lib/london-profile-plan.py::load_sources` to compare all mapped source
   fields with both saved CSV exports and pinned original checksums.
2. Run `scripts/snapshot-london-profiles.py` against the explicitly selected
   branch. It pages the full minimal name directory once, retains relevant
   candidates and scoped London performances, and checks a server fingerprint.
3. Build the pure plan from the unchanged snapshot and a reviewed London edition.
   Freeze any independently reviewed existing-performance associations alongside
   their snapshot digest and original source facts. Validate complete observation
   accounting before mutation.
4. Run the synthetic planner and applier checks. The applier verifier uses an
   in-memory PGlite database; it does not connect to production.
5. Rehearse the same plan on a temporary copy of production, explicitly naming
   its branch. Include new profiles, existing-performance reuse and held captures.
   The rehearsal repeats the actual insertion statements to verify idempotence.
6. Verify that the production deployment includes the fixed Pace Notes CC BY
   credit. Apply with the immutable plan, unchanged snapshot and successful
   rehearsal receipt. Each bounded transaction rechecks source integrity,
   directory freshness, privacy state and publication authority.
7. Verify the receipt and live profile pages. Retain the full import audit and
   held-case queue privately. Report new profiles, existing profiles reused and
   held groups separately; two source observations are not two athletes.

The production applier creates no canonical results and performs no structural
athlete merges. Existing result/history JSON is preserved so per-performance
privacy choices and user-managed facts continue to apply. Stable profile slugs,
provider/history IDs and guarded evidence receipts make interruption and replay
safe; a changed identity snapshot requires renewed review.

## Concurrent profile changes and continuation

A freshness failure after another import, profile edit or merge changes the
athlete directory requires a fresh snapshot, new reviewed plan and new
rehearsal. Preserve the rejection diagnostics, old snapshots, plans, reviews and
receipts; never edit a frozen fingerprint or weaken the existing guards to
force continuation.

Coordinate a window without competing profile writes. Take a new complete
production snapshot into a new private directory, independently review the
resulting plan, and rehearse that exact frozen plan on a matching production
copy. The live source, identity, privacy, lock, statement and freshness checks
still apply.

Include profiles committed by earlier attempts as existing candidates. Reuse
only uniquely matched existing performances, preserving their original source
identities, histories, verification and privacy. Retain earlier partial receipts
and count prior creations, later creations and repeated evidence associations
separately; do not recreate a previously committed profile.

## Additional editions

The original 2025 collection remains the default for compatibility with its
saved plan and receipts. New 2024 and 2023 runs require a validated private
edition configuration; the configuration is copied into the plan as
`editionContext`. It contains the explicit date, canonical/equivalent edition
IDs, batch ID, expected source counts, observed MarathonGuide archive route and
subevent, source-file SHA-256 pins, retained collection identity/hash and owner
instruction. See `scripts/lib/london-edition-context.py` for the exact schema.

Pass `--edition-config /private/edition-context.json` to the snapshot command.
Call the planner's `configure(context)` before loading source files and building
that edition's plan. The snapshot records the context digest. The applier and
independent verifier configure themselves exclusively from the frozen plan and
check the snapshot and receipt digest; there is no separate live configuration
that can silently change a reviewed import. `configure(None)` restores the
original 2025 scope in a local script.

Each edition has a separate plan, snapshot, review receipt and production
receipt. Publish editions sequentially and take a fresh production snapshot for
the next one. This includes newly created profiles in the following duplicate
screen. A shared name in another year still requires identity review; this
extension does not add a name-only cross-year merge rule.

For a full-sized trial of both insertion paths, use `--review --limit 1000
--review-linked-limit 1000 --batch-size 1000`. The existing default linked trial
limit remains 100. The same-plan replay, source-integrity guards, publication
locks and 55-second mutation statement limit are unchanged.

Before publishing 2024 or 2023, deploy the fixed Pace Notes credit with wording
covering selected London editions instead of claiming every subset is 2025.
The live verifier checks the required v3 credit and rejects the old 2025-only
wording on new-edition sample profiles.

## Focused checks

```sh
python3 scripts/verify-london-profile-plan.py
node scripts/verify-london-profile-apply.mjs
node scripts/verify-public-result-licence.mjs
```

Public-source registry checks remain separate from collection permission and
participant verification. Both newly researched sources remain disabled for
automatic collection; see the London source evidence note in `source-registry`.
