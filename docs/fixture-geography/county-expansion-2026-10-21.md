# County sports expansion — 21 October 2026

Reviewed for the owner’s request to add more sports through the county pages.
This is a reviewed release batch, not a claim of exhaustive UK county coverage.

## Scope

- 76 event identities across **39 counties/local areas** and all seven current county-page sports.
- **61 new events**, including **7 parkrun venues without extrapolated dates**.
- **15 existing identities** receive source-backed county, venue, organiser and descriptive metadata; permanent slugs and historical editions remain unchanged.
- **167 new dated distance options** across 71 event/date combinations. These are options, not 167 separate event weekends.
- England, Scotland, Wales and Northern Ireland included. New dates span 24 October 2026 to 23 October 2027. No unannounced 2028 recurrence was invented.

## County/local-area coverage in this batch

Counts below are event identities added or enriched, not race-distance options.

| County/local area | Event identities by sport |
|---|---|
| Angus | Parkrun 1 |
| Cambridgeshire | Cycling 1, Triathlon 1 |
| Cheshire | Triathlon 2 |
| County Durham | Swimming 1, Triathlon 2, Duathlon 1 |
| County Londonderry | Running 1 |
| Cumbria | Parkrun 1, Cycling 1, Swimming 3, Triathlon 2, Duathlon 2 |
| Derbyshire | Cycling 1 |
| Devon | Parkrun 1 |
| Dorset | Cycling 1 |
| East Lothian | Duathlon 1 |
| Essex | Swimming 1, Triathlon 2 |
| Glasgow City | Triathlon 1 |
| Gloucestershire | Running 1, Duathlon 1 |
| Greater Manchester | Triathlon 1 |
| Gwynedd | Triathlon 1, Duathlon 1 |
| Hampshire | Parkrun 1, Cycling 2 |
| Lancashire | Triathlon 2, Duathlon 1 |
| Leicestershire | Parkrun 2 |
| Lincolnshire | Triathlon 1 |
| Merseyside | Triathlon 1 |
| Monmouthshire | Triathlon 1 |
| Newport | Triathlon 1 |
| Norfolk | Parkrun 1 |
| North Yorkshire | Cycling 1, Triathlon 1, Duathlon 1 |
| Northamptonshire | Running 1, Duathlon 1 |
| Northumberland | Cycling 1 |
| Nottinghamshire | Duathlon 1 |
| Oxfordshire | Triathlon 1 |
| Perth and Kinross | Cycling 1, Duathlon 1 |
| Shropshire | Triathlon 3 |
| Somerset | Cycling 1 |
| South Yorkshire | Athletics 3, Triathlon 1, Duathlon 1 |
| Suffolk | Cycling 1, Triathlon 1 |
| Surrey | Cycling 2 |
| Tyne and Wear | Cycling 1 |
| Warwickshire | Cycling 1, Triathlon 2 |
| West Midlands | Triathlon 1 |
| West Yorkshire | Cycling 1, Duathlon 1 |
| Wiltshire | Cycling 1 |

## Evidence and unresolved gaps

The committed `src/data/county-expansion-2026-10-21.json` manifest records every source URL,
checked date, confirmed date, distance programme, place and start-time note.
Official organiser pages were opened; the Felixstowe programme uses British Triathlon
and the indoor meets use England Athletics. Start windows are retained as windows.
Estimated or unpublished allocations remain TBC. A timing provider is credited as such,
not treated as the organiser.

The official parkrun event map (`https://images.parkrun.com/events.json`) supplies the seven
new venue identities and coordinates. Local homepages returned access errors, so there
are no invented weekly editions or start clocks. Overseas venues in the UK map feed
were excluded by location. The existing UK parkrun inventory was checked for name and
website matches; the new venues do not duplicate the 1,427 already recorded UK venues.

Held for further source clarification:

- Big Lime Open Water Swim: booking header says 8 August 2027, while the narrative still specifies 9 August 2026.
- Alderford and Birmingham Triathlons: 2027 date TBC/coming soon.
- Lochore Off Road Triathlon: 13km versus 14.4km bike-course conflict.
- Ullswater Epicman Standard: duplicated sections disagree on the 41km/44km bike leg. Sprint and Middle are verified and included; Standard remains held.
- Bamburgh Duathlon: bike legs described only as 20+km and 40+km; exact distances remain unresolved.
- Norfolk swimming championships: venue and qualifying standards published, no verified competition dates in the opened page.
- Athletics NI: Brocagh Bay and Rudolph Run detail pages still show old editions despite newer index entries. Those dates were not carried forward.
- Epic companion duathlons: first-run distance absent from the opened programme. Aquabike/aquathlon and some junior formats are outside this seven-sport batch and need a separate format review.

County labels elsewhere still contain regional placeholders and aliases; this batch corrects
15 matched identities rather than relabelling the entire catalogue from assumptions.
The remaining counties and sports are still to be expanded as dates are announced/verified.

## Canonical matching and publication

Matched against the public identity inventory: 9,914 running events globally, 482 other-sport
identities globally, UK athletics plus relevant championship names, 1,427 UK parkruns and
180 saved slug aliases. Fifteen existing series were reused. The three indoor meets
were matched to their earlier editions at Sheffield. St Neots Race 1 is a different
series round from the existing Race 3; Maldon is distinct from Grafham despite the stale
organiser URL. Existing UKCE provider duplicates were not copied into new identities.

Snapshot revision: 275. No overlapping pending batches or historical slug redirects
were found for the reviewed identities. Two bounded source keys are used:
`athrecs:county-expansion:2026-10-21:1` and `athrecs:county-expansion:2026-10-21:2`.

The publisher locks the catalogue revision, checks the exact event metadata baseline,
rejects new edition/name/alias/pending-batch collisions and stages/validates before
publication. Source payloads are immutable and repeated runs are no-ops. Geography
corrections explicitly opt into guarded before/after audit snapshots; ordinary imports
continue to preserve existing metadata. No result or athlete records are modified.

Legacy generic `Other` rows are retained in storage and their original evidence remains
available. Public fixtures use the checked distance programme for those exact dates.
Undated parkrun venues retain their distance filter/colour without fabricated editions.

## Verification

The real publication service was rehearsed in disposable PostgreSQL with the reviewed
baseline. Checks cover 61 event inserts, 15 metadata updates, 167 edition inserts,
unchanged historical editions, source/start/window display, county mapping, multi-day
meet ends, undated parkruns, baseline rejection and idempotence. Relevant catalogue and
colour regressions, TypeScript and focused lint checks are run before release.

Release preparation also restricts older start-time reviews to their exact baseline keys, so unrelated checks made on the same date cannot enter those historical batches.
