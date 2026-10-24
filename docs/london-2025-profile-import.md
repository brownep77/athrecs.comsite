# London Marathon 2025 profile import

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
  London 2025 edition after its event title, year, marathon distance, original
  source identity and exact time have been compared. Its original date precision
  remains unchanged. A frozen, snapshot-bound review is required for this path.
- Ambiguous identities, source-quality flags, conflicting facts and excluded
  records remain held. MarathonGuide-only observations remain private pending
  source review. Multiple existing identities are never structurally merged by
  this adapter.

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

## Focused checks

```sh
python3 scripts/verify-london-profile-plan.py
node scripts/verify-london-profile-apply.mjs
node scripts/verify-public-result-licence.mjs
```

Public-source registry checks remain separate from collection permission and
participant verification. Both newly researched sources remain disabled for
automatic collection; see the London source evidence note in `source-registry`.
