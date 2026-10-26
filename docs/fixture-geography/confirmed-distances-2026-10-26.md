# Confirmed fixture distances — 26 October 2026

The owner requires a confirmed distance before a race fixture is announced.
The publication gate rejects unresolved upcoming race distances, including
`Other`, `Ultra`, `Cross Country`, blank labels and invalid kilometre values.
Confirmed timed races retain their duration. Track-and-field and pool meetings
can retain an explicit programme type; a generic `Other` is not a programme.

Public fixture queries omit unresolved upcoming editions before pagination.
The same hold applies to event pages, home updates, location pages, running
discovery, athletics calendars and direct calendar subscriptions. Other known
distances at the same event remain visible, and original records and historical
results are retained. Both staged publishing and the legacy importer reject new
unresolved future editions; publish rechecks batches that were previously ready.

## Source-checked changes

Production batch `fixture-distance-review-20261026-a` was published as catalogue
revision **392**, after rehearsal on an isolated Neon branch. All 30 exact
date/distance/km/start/source combinations were read back successfully. The batch
updated nine existing editions, added 21 options and affected nine canonical
events; 39 change-log records retain edition and event-distance before/after
snapshots. Revision 391, full edition baselines, canonical IDs, target-key
collisions and overlapping pending imports were checked under the publication
lock. No event identities or result records were merged or deleted.

| Event | Confirmed programme |
| --- | --- |
| Abbott Dash to the Finish Line | 5K; first elite 08:30, general field from 08:45 |
| Hamilton Mizuno Elite | 5K, 09:30; separate from the mass-participation start |
| Liddiard Trophy | Senior five miles, 14:15 |
| North West London junior league | U12 2K, U14 3K, U16 4K, U18 5K |
| English Cross Country Relays | Nine age/sex programmes, with leg distances in each label and team totals in kilometres |
| Delamere Night Runner | 10K 19:00, half marathon 18:00, junior 1K with start still unverified |
| Allithwaite 8 | Approximately eight miles / 13 km, 11:00; not a certified-course claim |
| Balexert 20km de Genève | 20K, 10K, junior 2K, 1K and 500m; wave labels preserved |
| Mallorca by UTMB | Actual routes 138K, 104K, 56K, 26K and 7K; not the UTMB category labels |

Exact sources, notes and prior records are in
`confirmed-distance-changes-2026-10-26.json`. Public practical details are in
`src/data/confirmed-distances-2026-10-26.json`. Seed corrections are applied only
to existing seed identities; Abbott and Genève are live-only canonical events.
The seed overlay does not invent those identities or affect other years.

## Outstanding review

This was a complete automated missing-distance screen of upcoming stored
editions, **not** an independent source audit of every numeric distance. Of
2,428 initially unfilled or zero-distance candidates, 579 required a distance
review after allowing explicit timed races and sport programmes. Eight original
unfilled editions were resolved by this batch; the ninth update clarified an
already numeric Delamere entry.

There are **571** remaining review entries: Running 341, Athletics 89, Triathlon
66, Cycling 64, Duathlon 4, Aquathlon 2, Rowing 2, Swimming 2 and Aquabike 1.
`distance-review-queue-2026-10-26.json` retains every ID, source URL, review state
and next action, ordered by date. Unchecked sources remain explicitly unchecked.
The hold is derived from live data, so subsequent imports and corrections are
screened too; the JSON queue is a dated work snapshot.

Specific unresolved cases:

- The ResultsBase Delamere placeholder duplicates the organiser programme under
  the existing canonical event. It stays held pending record reconciliation.
  The source returned HTTP 403; the organiser FAQ and competitor-notes link did
  not establish the junior start. Retry 27 October.
- Race You To The Summit has conflicting adult route measurements: the organiser
  page and FRA give 4.3 miles / 7 km, while the authorised entry programme says
  7.40 km. Preserve the conflict and retry 27 October. Four junior distances are
  source-supported but still require a staged duplicate check/publication.

Prioritise today/48 hours, seven days, 30 days, then the rest of the rolling
three-month window. Match year, date, distance, category and wave against the
organiser, authorised entry programme or governing body. Do not infer from race
names, recurrence or another edition. A passing completeness check cannot mark
an uninspected source as verified.

## Validation

The distance regression uses an isolated PostgreSQL-compatible database to check
timed events, mixed confirmed/unconfirmed siblings, historical retention,
staged validation, stale-ready publish rejection and legacy imports. Existing
sport-fixture pagination, start clarity, location-page and calendar-subscription
checks cover the public read paths. Type checking and the development production
bundle build pass without running live publication scripts locally.
