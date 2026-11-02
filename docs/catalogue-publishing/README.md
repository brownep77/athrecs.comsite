# Staged catalogue publishing

Routine race additions must not require a Vercel code deployment. The staff
publishing screen writes proposed events and editions to Neon Postgres in three
explicit steps:

1. **Stage** — store the source payload without changing public listings.
2. **Validate** — check required fields, permanent slugs, event references,
   duplicate natural keys, dates and entry links.
3. **Publish** — lock the catalogue revision pointer and apply the complete
   batch in one database transaction.

A failed publication is rolled back by Postgres, so an import cannot leave only
some companion files or rows live. Each successful batch creates a revision
with before/after snapshots.

Source review may mark an unpublished batch `invalid` and retain a
`sourceReviewHold` object in its validation summary, with the reason, reviewer,
checked date, affected natural keys and resolving batch. Validation and publication
both refuse that batch, even if its status is changed back to `ready`. Preserve its
payload, hash and staged rows; restage reviewed, reconciled rows as a new batch.
This keeps confirmed duplicate courses or wrong canonical identities from returning
through an older queued import.

## Rollback limits

Only the latest revision may be rolled back. The rollback refuses to delete an
edition after results or later result links have been attached, and refuses to
delete an event that has later dependent editions or race-group data. This is
deliberately conservative.

## Operational rule

Use the legacy direct CSV/JSON importer only for emergency compatibility. New
manual batches, scheduled race scans and organiser uploads should target the
staged publishing API and should use one stable `sourceKey` per source run.
