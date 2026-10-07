# Sports fixture detail audit — 7 October 2026

## Scope

All ten `/sports/*` pages returned HTTP 200 and their first-page fixture output was inspected (153 grouped fixture listings). All use the shared fixture query and row component, including Road Running, Trail Running, Parkrun, Track and Field, Triathlon, Road Cycling, Mountain Biking, Track Cycling, BMX and Swimming.

A read-only aggregate query screened every upcoming catalogue edition from 7 October 2026, including sports without a dedicated navigation page. These counts measure stored fields, not independent organiser verification. Empty strings are excluded from stored-start counts. Distances and recurring dates count separately; the large Parkrun total is not a count of distinct venues. Every screened record had a country, and none of the event summaries contained the removed product names or source-check wording.

| Sport | Upcoming distance/edition records | Stored nonblank starts | Missing descriptions | Missing town/city | No distinct county/state |
| --- | ---: | ---: | ---: | ---: | ---: |
| Aquabike | 1 | 0 | 0 | 0 | 1 |
| Aquathlon | 4 | 1 | 0 | 0 | 4 |
| Athletics | 1089 | 0 | 0 | 0 | 1078 |
| Cycling | 98 | 8 | 0 | 0 | 16 |
| Duathlon | 20 | 11 | 0 | 0 | 10 |
| OCR | 7 | 4 | 0 | 0 | 6 |
| Parkrun | 189504 | 189504 | 0 | 576 | 2688 |
| Rowing | 2 | 2 | 0 | 0 | 0 |
| Running | 5029 | 2661 | 1 | 14 | 1145 |
| Swimming | 6 | 2 | 0 | 0 | 5 |
| Triathlon | 194 | 46 | 0 | 0 | 90 |
| Walking | 11 | 11 | 0 | 0 | 0 |

## Additional organiser checks

- Cal Tri Charlotte, 10 October: the detailed organiser schedule confirms Sprint 08:00 EDT and Olympic 08:20 EDT. The homepage registration tile gives 08:00 for both, so the dedicated race-day schedule takes precedence. Statesville, North Carolina. https://charlotte.californiatriathlon.org/Race/CalTriCharlotte/Page/Schedule
- Cal Tri Los Angeles, 18 October: Sprint 08:00 PDT and Olympic 08:20 PDT; Dockweiler State Beach, Playa del Rey, Los Angeles, California. https://losangeles.californiatriathlon.org/Race/2019TrickorTri/Page/Schedule
- Moris Ride/Run cycling, 11 October: both 69 km and 89 km start at SPARC, Cascavelle at 07:00 Mauritius time (UTC+4). The older event 46 link now opens the trail-running programme; the fixture Details link now uses the organiser's cycling page. https://mauritiusrace.com/journee/route/
- La Grande Traversée de l'Ouest, 1 November: 10 km solo and relay swimming starts at 05:30 Mauritius time (UTC+4). https://ipn.sportevents.mu/en/events/72/la-grande-traversee-de-louest
- La Iguanera MTB, 15 November: Pochutla, Oaxaca, Mexico; recreational 25 km and competitive categories confirmed. Registration lists a general 06:00 event time; this was not assumed to be a race start for every distance. https://www.chronostart.com.mx/registrate/categorias_disponibles/526
- Track cycling junior/U23 European Championships: 13–18 July 2027, Heusden-Zolder. BMX European Championships: 9–11 July 2027, same town. Summaries updated; session starts remain TBC. https://www.belgiancycling.be/belgian-cycling-team/toegekende-os-wk-en-ek/

These seven edition-specific records add seven verified distance starts across triathlon, cycling and swimming, plus short descriptions and venue details. Start checks do not carry into another year's edition. No fixture, athlete or result records were inserted or deleted by this release.

## Catalogue issues requiring a separate correction

- Chillswim Ullswater on 10 July 2027 is incorrectly stored as `5mi` / 8.05 km although its title and organiser specify 7.5 miles. The organiser's published wave information still relates to 2026, so a 2027 clock time cannot be inferred. https://chillswim.com/chillswim-ullswater-end-to-end/
- Kent Classic on 24 October has two source-derived event records, one incorrectly located in Newmarket. The organiser confirms Lingfield Park Racecourse, with separate start windows (long 08:30–09:15, medium 09:15–09:45, short 09:45–10:00). Its route-summary and map distances also differ, so those need reconciliation before editing distances. Do not merge event identities or remove records without checking linked results. https://www.ukcyclingevents.co.uk/products/2026/2026-10-24
- Street Child Sierra Leone Marathon & Cycle Challenge is stored in England and shows a marathon distance on the road-cycling page, with an implausible 01:00 start. Its 21 October listing appears to be the trip's opening date, not independently confirmed race day. Needs an organiser-led date, sport, country and distance correction.
- Chillswim Triple Crown has a 2026 title attached to a September 2027 edition. Needs programme/date reconciliation.

These findings are an audit queue, not claims of completed corrections or complete source verification. The shared UI preserves unknown starts as TBC and unknown venue time zones explicitly; it does not invent missing administrative locations.
