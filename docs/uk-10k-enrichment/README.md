# UK 10K enrichment workflow

This folder is the loss-prevention ledger for the remaining runABC-derived UK 10K catalogue.

- `queue.json` is the immutable ordered master queue created against seed `athrecs-uk-10k-entry-batch-sixty-two-v207`.
- `progress.json` records only active or completed checkpoints; unlisted checkpoints remain queued.
- Each checkpoint contains exactly three races.
- Four checkpoints (A-D) form one twelve-race production release.
- A race is never removed because it is cancelled, postponed, full or date-TBC. Its public status is corrected instead.

Checkpoint statuses move in this order:

`queued → researched → coded → tested → checkpoint_saved → deployed → live_verified`

Use `blocked` only when a material contradiction or missing authoritative source requires review. Record the reason in `notes` and continue with other checkpoints without silently skipping the race.

## Commands

The existing queue is immutable. The generator exits without changing it unless `--force` is supplied. Use `--force` only when intentionally starting a new catalogue phase and after updating the configured first key and release number:

```sh
node scripts/generate-uk-10k-enrichment-queue.mjs --force
```

Validate queue integrity and progress against the catalogue and entry-option data:

```sh
npm run verify:uk-10k-workflow
```

Before a production release, also run:

```sh
npm run typecheck
npm run verify:catalogue
npm run verify:clubs
npm run verify:race-groups
npm run build
```

The connected GitHub app is used for branches, file commits, pull requests and merges. A checkpoint can be saved to the active release branch after its focused checks pass; production is merged only after all four checkpoints in that release pass the complete suite.
