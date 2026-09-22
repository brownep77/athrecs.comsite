# RunRecs race information update

Race cards now lead with the race name, date, readable location and distance. Starts
and entry actions are visible without opening a tooltip. Multi-distance events
show starts by distance. The listing query selects date, distance, time and entry
from the same edition and respects the selected date window.

Race pages put the distance timetable, entry links and practical location details
first. Runners can select a distance/date when comparing entry providers. Existing
course descriptions remain visible. Closed, sold-out and expired provider entries
are not promoted as open; legacy links are not described as verified official entry.

The new layout applies to RunRecs. AthRecs keeps its existing page layout. Shared
entry-link safety and availability corrections apply to both sites.

## Source-checked practical details

`src/data/runrecs-race-guides.ts` records 10 event guides covering 11 distances,
checked on 22 September 2026. Each guide is bound to an exact edition date and an
explicit slug or organiser page. Start times only supplement empty fields;
non-empty stored values are preserved for review. No production database is rewritten.

- Bure Valley 10, 27 September 2026: 09:30, village-green finish, two-hour limit and race rules.
  Source: https://totalracetiming.co.uk/race/695
- Cawston Trail, 4 October 2026: 10:00, venue/postcode, arrival, parking and facilities.
  Source: https://totalracetiming.co.uk/race/660
- Run Bournemouth, 10–11 October 2026: six distance-specific starts, locations and junior age ranges.
  Sources: https://www.runbournemouth.com/ and the six linked distance pages.
- Rugeley 10, 14 February 2027: 10:00, HQ postcode, start-line walk, parking and facilities.
  Source: https://www.entrycentral.com/Rugeley-10-miler
- Shakespeare half/full marathon, 25 April 2027: both 09:00, venue/postcode, laps and included services.
  Source: https://www.runthrough.co.uk/event/shakespeare-marathon-half-marathon-april-2027

This is a first enrichment batch, not verification of the whole race catalogue.
Unknown times and arrival details remain explicitly unconfirmed. Display facts
include source links and check dates. Calendar supplements use exact slug matches;
listing/detail supplements can also match the recorded organiser page.

## Follow-up data issues

- Run Sandringham's 27 September 2026 catalogue edition says 10K. The current entry
  page lists a 5K, half marathon and community mile. Do not attach the half-marathon
  start to the 10K row. The source itself also disagrees on the mile start
  (12:15 in prose, 12:30 in its entry table). Resolve edition identities first.
  Source: https://totalracetiming.co.uk/race/646
- Autumn Blickling and West Acre now advertise waiting lists. Their stored entry
  availability should be reviewed against current provider records before promotion.
  Sources: https://totalracetiming.co.uk/race/669 and https://totalracetiming.co.uk/race/668
- Some imported ultra editions already contain 23:00 start times. This is stored
  catalogue data, not a timezone-formatting error. Check the organiser's exact
  distance/day before correcting any overnight start.

## Verification

`npm run verify:runrecs-race-information` executes the production listing query
against a disposable PGLite database with synthetic races. It covers sport scope,
multi-distance starts, date/distance intersection, matching entry URLs, unknown
times, same-day deadlines, sold-out entries, safe URLs and exact-date source matching.
Typecheck, targeted lint, RunRecs calendar/network checks and a RunRecs production
build are also required for this change. Deployment smoke checks cover the listing,
an enriched race page and a multi-distance race page.
