# All-sport fixture checkpoints

This folder records small, reversible fixture additions for Athrecs' 11 supported sport categories.

## 2026-08-19 checkpoint

- Added three organiser-verified fixtures to the thinnest UK categories: Rowing, Aquabike and OCR.
- Confirmed that every supported sport has at least one current or future catalogue edition.
- Stored official source and entry links on each fixture, with the date on which entry status was checked.
- Kept the update at event level only. No participant-level result rows were collected or imported.

Run `npm run verify:all-sport-fixtures` to confirm the checkpoint and print current future-fixture counts by sport.

Future batches should remain small, use organiser or governing-body pages, avoid duplicate series names, and update the verification date whenever an entry status changes.
