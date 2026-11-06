# parkrun review — 6 November 2026

## Reviewed release

The official global map contains 3,017 venues. The fresh AthRecs inventory contained
2,985 parkrun identities. This is not a simple subtraction: older names, inactive
venues, returning events and announced launches need separate treatment.

The release compares 56 map identities absent from the repository export with the
live inventory. Seven UK entries were already added on 21 October. Kew Wakehurst
is the existing Wakehurst identity and retains its canonical AthRecs slug. Sakura
Furusato Hiroba is held as a possible rename/relocation of Sunset Hills Shitasanbashi.

The reviewed payload adds **47 missing venue identities**. Eleven have current
source-supported programmes, and two existing UK venues gain schedules. The
**174 dated fixtures** cover 7 November 2026–6 February 2027, starting no earlier
than an announced official launch. The other **36 new venue entries have no dated
fixtures or distance claims** until their programme has been reviewed.

Four existing venues have 60 future 5K starts each corrected: East Coast Park,
Bishan and West Coast Park in Singapore to 07:30; Coffs Harbour to 07:00. These are
240 existing dates, through December 2027. Past results are outside the correction.
Coffs Harbour moves from the incorrectly stored Queensland to New South Wales.
Kew Wakehurst receives its current name, official home and West Sussex location.

## Evidence and limits

The JSON files retain actual sources, check dates, retrieval failures, launch
qualifications and next actions. The map establishes identity; it does not establish
an inaugural date or a timetable. Sources include organisers, venue owners, councils,
official delivery partners and explicitly attributed event-director statements.

Local cancellation endpoints were inaccessible during this review. Published
recurrences are labelled scheduled, with an instruction to check the official event
page before travelling. They are not presented as individually cleared dates.
Provo's official series starts 21 November, Meadowbank juniors 22 November and
Elsenzufer 28 November; earlier practice events are excluded. No extra holiday
events are inferred.

Retry unresolved imminent starts on 7 November, then follow the existing daily /
three-day / weekly urgency process in `../../start-time-process.md`. Reconfirm
published starts seven and two days before each event. Use the same canonical
inventory and this checkpoint; do not create a parallel collection schedule.

## Publication and verification

`src/data/parkrun-review-2026-11-06.json` is the concrete release plan.
`scripts/publish-parkrun-reviewed.mjs` runs only for production/main through the
existing post-build publisher. The helper locks the catalogue, rechecks canonical
identities and expected metadata, stages and validates the batch, publishes it in
one transaction and checks the audit/readback before committing. The legacy seed
excludes the new venues so it cannot invent dates for map-only entries.

The exact public-fixture plan was rehearsed in disposable PGlite using the actual
staging, import and publication code. It produced 47 new venues, seven metadata
updates, 174 new editions and 240 start corrections. All 60 existing Wakehurst
editions stayed unchanged. The 36 venue-only records stayed undated with no
placeholder distances. A second execution was a complete no-op.

The committed synthetic regression additionally checks duplicate identities,
redirects, concurrent changes, seasonal starts, atomic rollback and preservation of
all other edition and entry-provider fields. The rehearsal is not a live publication
claim; final production status is established by deployment logs and database readback.
