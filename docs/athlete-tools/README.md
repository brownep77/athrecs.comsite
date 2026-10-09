# Combined athlete tools

The staff entry point is `/admin/athlete-tools` (normally on `update.athrecs.com`).
It brings Single athlete, Find profiles, Results file, Review results and Club scans
onto one screen. Heavy tools load when first opened; their form state is retained
when changing tabs. Existing standalone URLs still work. The combined file importer
starts with blank race details and unspecified timing, rather than a previous race.

## One athlete from a link

1. Paste an individual World Athletics, Power of 10 or UK Parkrun profile URL.
2. Check for an existing stable source identity. An exact existing record opens for
   review; conflicting legacy records block creation.
3. If the source has not been recorded, open it and enter the displayed name. An
   optional previous name broadens the duplicate check. Source pages are **not**
   fetched or scraped by this feature and URL slugs are never turned into names.
4. Review source profiles and private account matches together. Link to an eligible
   unmanaged athlete, or explicitly confirm that suggested matches are different
   people before creating a new private profile. Account-owned identities use the
   existing owner-review path. Document identity evidence and authority before saving.
5. Open the saved athlete directly in the profile/results workspace.

This creates only a private profile and/or a mapping in `athlete_source_identities`.
It does not import performances, publish profiles, claim accounts, infer demographics,
change existing profile fields, enable timing sources or merge people. Review/audit
records retain the source URL/ID, staff-confirmed name, evidence, reviewer and time.
A recognised URL alone is not independent verification of that athlete.

The existing staff middleware enforces host, verified Google staff identity and
same-origin access. The service also rejects RunRecs, missing live databases and
writes from Vercel preview deployments. Within a serializable transaction it repeats
identity checks, checks ownership, enforces unique provider IDs and saves an atomic
audit/receipt. A repeated save request returns its receipt; altered or stale requests
are rejected. Compact full-directory identity checks deliberately preserve the existing
accent/alias-aware matching so a profile on a later search page cannot be missed.

No database migration, existing-source activation or scheduled-task change is needed.
The review tools display their existing database queues. The separate timing-directory
scan still saves file/PR proposals; this change does not claim to ingest those files
into the UI automatically. PR #515's separate draft import path is not merged here.

## Add races with an approval note

Open **Add races & record approval** from a staff athlete profile, or use the
**Review results** tab with the intended athlete selected. Open a saved proposal,
select the races and enter **Why I approved these races** (at least 12 characters).
Check the source, identity and publication authority, resolve any conflicting
evidence, then choose **Add checked results to profile**. The same note applies
to every selected race; review separately when different races need different notes.

Each added result retains the note, any conflict resolution, reviewer, timestamp
and request reference. Staff can expand **Approval note** under a stored race.
Earlier workspace approvals are read from their original audit without modifying
the result. Duplicate approvals retain the original result and approval note.
Notes are absent from public result details, member workspaces and recipient review
links. Existing visibility, owner-confirmation and source checks still apply.

## Validation

- `node scripts/verify-athlete-link.mjs`: actual service transactions on the migrated,
  disposable PGlite schema using fictional people; URL boundaries, private creation,
  provider and legacy matches, protected accounts, aliases, conflicts, stale checks,
  rollback, request replay and deployment/access guards. PGlite has no parallel
  sessions, so production advisory-lock contention is not simulated.
- `node scripts/verify-athlete-tools-browser.mjs`: actual React components with
  synthetic API responses; link checking, explicit save gates, retry, profile handoff,
  existing records, tab/file retention and mobile layout. No live records are written.
- Full typecheck, focused lint, database-free application build and existing importer
  and backend-navigation browser checks cover the component extraction.

An additional legacy `verify-staff-microsite.mjs` static check fails on unchanged
main because it expects an inline `socialProviders: {` declaration; current auth
uses a separately declared `socialProviders` object. This change does not alter
that authentication code or weaken its checks.
