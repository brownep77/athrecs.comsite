# Colombia running calendar — 28 October 2026 review

This release expands the Colombia running calendar with **18 confirmed events and
52 distance-specific editions**, racing from 1 November 2026 to 25 July 2027.
It is a reviewed addition, not a claim that every Colombian race has been found.
No recurring 2027 or 2028 date has been inferred from a previous edition.

## Publication and identity

The programme reuses the existing Cali, Cartagena and latest Bogotá series IDs.
The Bogotá URL retains its historical 2026 suffix to preserve links and results;
the visible event name and programme show the confirmed 2027 edition.
Fifteen other event identities are new. Existing athlete results, historical
editions, featured flags and primary entry providers remain intact.

`src/data/colombia-races.ts` contains the reviewed catalogue records and the
exact public metadata baselines for the three existing identities.
`src/data/colombia-fixture-details-2026-10-28.json` contains the dated display
evidence, Colombian timezone, race-day notes and wave labels. The adjacent
`review-2026-10-28.json` contains source URLs, research outcomes and retry dates.

The production/main build runs the bounded Colombia publisher before general
catalogue seeding. It stages and validates the batch, then publishes through the
existing revision ledger within one enclosing transaction. It rejects changed
baseline metadata, conflicting event identities, overwritten start times and
unexpected readback differences. All 18 identities and 52 edition keys are read
back before commit. The batch is idempotent and respects a deliberate rollback.
Preview builds do not publish to the persistent catalogue.

## Dates, distances and starts

There are **33 source-verified distance starts and 19 unresolved starts**. All
confirmed clocks use `America/Bogota` (UTC−5). Bogotá's 08:30 first half-marathon
wave is explicitly reviewed as the event programme start. Individual calendar
exports retain the wave label and do not assign every runner that first wave.
An unknown clock stays date-only; it never becomes midnight.

The Desert Marathon's competitive stages run **28–30 May 2027**, separate from
the wider festival and kit collection dates. Del Mar a la Cima and Chicamocha
retain the separate dates and starts for each distance. The advertised short
Columbia Trail Challenge route is technically 11 km; its longer route is held
because the same official page gives conflicting 21.3 km and 23.3 km values.
Technical lengths are retained for Del Mar a la Cima and Chicamocha, with their
marketing labels explained in the public notes.

The advertised 21K programmes keep 21 km where no exact measured length was
confirmed. The Bogotá rules explicitly give 21,097 metres. No certification,
elevation gain, current entry price or unverified start venue has been inferred.
Cali's 2027 date is confirmed while its entry availability remains unknown.

Café and Frontera remain visible with unknown starts after the documented
in-window research. Café is due for daily follow-up; Frontera's next review is
31 October. Partial future-edition reviews remain `unchecked` with completed
attempts recorded. The existing daily fixture process owns follow-up; this
release does not create a parallel automation. See
`docs/fixture-geography/start-time-process.md` for the retry policy.

## Country page

The preferred country running URL is
`/races/places/south-america/colombia/running`. Its design adds a Colombian flag
accent, responsive overview, current event counts, calendar jump link,
road/trail discovery and city links. Counts, location links and the archive
remain driven by catalogue data. Filtered views retain their normal canonical
and indexing rules. The copy and visible FAQs share the existing page metadata
pipeline; the calendar uses CollectionPage, ItemList and BreadcrumbList markup.
Individual race pages continue to use edition-scoped Event metadata. No ranking
or indexing outcome is promised.

Twenty-five organiser, race and authorised entry sources were added to the
source registry for manual review. Automatic ingestion remains disabled for
these new sources; registration does not assert reproduction or crawling rights.

## Verification

- `npm run verify:colombia-running-calendar`: merged identity and distance
  coverage, unknown clocks, UTC conversion, first-wave semantics, staged dates,
  entry availability and the held conflicting distance.
- `npm run verify:colombia-publication`: real stage/validate/publish code against
  in-memory PGlite; 70 ledger changes, identity preservation, provenance,
  idempotence, exact rollback, stale baselines, second-precision clocks,
  intervening writes, and rollback on a simulated late import failure.
- Existing race-place, duplicate, source-registry, type, lint and build checks.

The boundary scenarios use state injection in a single-backend PGlite rehearsal;
they are not a claim of multi-session PostgreSQL contention testing. Production
completion additionally requires the exact deployment commit, a successful
publisher log and live country/race-page readbacks.
