# Remaining UK and Ireland race additions — release audit

## Included verified branches

- PR #164: Fleet 5K & 10K, Haltemprice 10K, Jedburgh Running Festival, Kernow Killer October, Monsal Trail Sunday and Polesden Lacey Trust 10K.
- PR #203: 21 new non-standard-distance race series, 25 new editions, 35 existing-card corrections, 29 safe date/distance migrations and five duplicate aliases.
- PR #246: 46 new half-marathon/10-mile series and 11 verified 2027 editions attached to existing canonical event cards.

## Publication method

The additions are divided into two bounded, stable catalogue batches. Production uses the existing stage, validate and transactional publish pipeline. Repeat deployments reuse the published payload hashes. Existing edition migrations are applied only where no results are attached, and known event aliases are retired only when no result dependencies exist.

Fleet's separately verified 5K is published as its own edition even though that distance was absent from the older core seed. The production publisher constructs this reviewed edition from its official event metadata and creates a verified official entry option rather than omitting or collapsing it into the 10K.

Polesden Lacey Trust 10K is also preserved even though its reviewed metadata originally existed only as a catalogue override. Complete override-only races are promoted to standalone event records, retaining their official organiser, location, surface, distance and source information.

## Verification

- targeted UK 10K, half/10-mile and non-standard-distance verifiers;
- full catalogue duplicate verifier;
- TypeScript and ESLint;
- production build; and
- a clean PostgreSQL test that publishes both batches twice and verifies representative fixtures, entry data and revision idempotency.
