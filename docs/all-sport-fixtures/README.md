# All-sport fixture checkpoints

This folder records the 2026-08-19 fixture checkpoint for Athrecs' original 11 sport categories. Adventure Racing, Functional Fitness and Walking were added to the catalogue taxonomy later and will enter this checkpoint after the scraper supplies verified fixtures.

## 2026-08-19 checkpoint

- Added three organiser-verified fixtures to the thinnest UK categories: Rowing, Aquabike and OCR.
- Confirmed that every supported sport has at least one current or future catalogue edition.
- Stored official source and entry links on each fixture, with the date on which entry status was checked.
- Kept the update at event level only. No participant-level result rows were collected or imported.

## Full duplicate pass

- Checked future fixtures across every supported sport using date, sport, country, city and normalised event names.
- Reviewed same-date near-name candidates rather than merging solely on fuzzy similarity.
- Retired nine confirmed source duplicates in favour of one canonical event record.
- Corrected the Sunday dates for the Isle of Wight Fell Series and Ultra X England.
- Preserved legitimate same-venue competitions, including separate age groups, divisions and para events.
- Saved a loss-prevention snapshot of 213,989 future fixtures across all 11 sports, including generated weekly parkrun editions through December 2027.

Run `npm run verify:all-sport-fixtures` to confirm the checkpoint and print current future-fixture counts by sport.
Run `npm run verify:fixture-duplicates` to rebuild the merged fixture view and fail if a high-confidence duplicate remains.

Future batches should remain small, use organiser or governing-body pages, avoid duplicate series names, and update the verification date whenever an entry status changes.
