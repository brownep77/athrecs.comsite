# Historical result reconciliation runbook

This workflow restores retained ATHRECS participant results to the persistent database without replacing current data.

## Safety model

- The preview is staff-only and performs no application-level writes.
- Publishing is disabled unless the active backend is persistent Neon.
- Publishing requires the exact confirmation phrase `RESTORE CLAIMABLE RESULTS`.
- The whole publish operation runs in one database transaction.
- Missing athlete and result rows use `INSERT ... ON CONFLICT DO NOTHING`.
- Existing clubs, events, editions, athletes and results are never deleted or updated by reconciliation.
- Ordinary athlete profiles and result rows remain private.
- Identity or source conflicts are blocked for manual review rather than guessed.
- Repeating the same reconciliation is idempotent.

## Before publishing

1. Open the staff-only **Result ingestion & coverage** page.
2. Refresh the reconciliation preview.
3. Confirm the backend is persistent Neon.
4. Record the displayed database totals, canonical baseline, recoverable rows and blocked rows.
5. Review every blocked event, edition, athlete and result conflict.
6. Do not publish while an unexplained stable-ID or identity conflict remains.

## Publishing

1. Type `RESTORE CLAIMABLE RESULTS` exactly.
2. Run the guarded reconciliation once.
3. Record the ingestion run ID and inserted athlete/result counts.
4. Refresh the preview. A successful run should move inserted rows from **Safe to restore** to **Already present**.
5. Run the preview again without publishing. The second preview must be stable.

## Post-publication checks

- Confirm ordinary athlete profiles and results are not publicly listed.
- Confirm public-figure results retain public visibility.
- Test the authenticated claim flow with a known private result.
- Confirm the result archive contains the reconciliation run and per-edition coverage.
- Export or record any blocked conflicts for separate, evidence-led correction.

## Rollback principle

Reconciliation does not include an automatic destructive rollback. If a row is later proven incorrect, correct it through a separately reviewed migration or staff decision that preserves the ingestion audit trail. Never delete a reconciliation run merely to hide its history.
