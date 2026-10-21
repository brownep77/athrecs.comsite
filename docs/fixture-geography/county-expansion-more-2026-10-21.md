# Additional county sports fixtures — 21 October 2026

This second reviewed batch answers the owner’s request for more events in the previously expanded counties. It is a further collection pass, not exhaustive county coverage.

## Reviewed scope

- **30 new event identities** and **38 existing identities enriched** across **24 counties/local areas**.
- **120 new dated listings**: 117 distance options and three whole-meet listings (two swimming, one athletics). These are not 120 separate events.
- 42 equivalent existing distance editions were found and retained. Their stored dates, distances and evidence are unchanged; edition-specific checked starts and source links are shown through the reviewed fixture details.
- Running, cycling, triathlon, duathlon, swimming and athletics are included. The 1,434 recorded UK parkrun venues were checked against the earlier official-map inventory; no additional unmatched venue was found, so no weekly dates were extrapolated.
- The source search covered 21 October 2026 through 31 December 2028. No unannounced 2028 recurrence was added.

## County coverage

| County/local area | New identities | Existing identities improved | New dated listings |
|---|---:|---:|---:|
| Angus | 0 | 1 | 1 |
| Cambridgeshire | 3 | 1 | 8 |
| Cheshire | 0 | 1 | 2 |
| County Durham | 2 | 3 | 6 |
| Cumbria | 3 | 3 | 23 |
| Derbyshire | 1 | 0 | 2 |
| Dorset | 1 | 1 | 5 |
| Essex | 0 | 4 | 4 |
| Glasgow City | 1 | 0 | 2 |
| Greater Manchester | 0 | 1 | 0 |
| Hampshire | 1 | 0 | 2 |
| Lancashire | 1 | 0 | 3 |
| Lincolnshire | 0 | 2 | 1 |
| Norfolk | 2 | 2 | 10 |
| North Yorkshire | 0 | 2 | 3 |
| Northamptonshire | 0 | 2 | 7 |
| Northumberland | 3 | 5 | 9 |
| Nottinghamshire | 8 | 0 | 14 |
| Perth and Kinross | 1 | 0 | 3 |
| South Yorkshire | 1 | 2 | 3 |
| Suffolk | 1 | 1 | 3 |
| Tyne and Wear | 1 | 4 | 6 |
| West Midlands | 0 | 1 | 1 |
| West Yorkshire | 0 | 2 | 2 |

## Source review and decisions

The committed manifest records opened organiser/governing-body URLs, checked dates, date-specific starts, wave notes, distances, venue and capture hashes. Wild Deer, ATW, Outlaw, Curly’s and TPR programmes were read alongside UK Athletics, Great Swim and Swim England announcements. Source captures were reviewed on 21 October 2026. Organiser programme times take priority over summary tables and third-party aggregators. Provisional or conflicting clocks remain TBC.

- High Lodge is assigned to Suffolk using the [Forestry England venue address](https://www.forestryengland.uk/sites/default/files/documents/HighLodgeAccessStatementJanuary2018.pdf), overriding the organiser’s Norfolk label.
- Alice Holt is assigned to Hampshire using [Forestry England’s forest plan](https://www.forestryengland.uk/forest-planning/alice-holt-forest-plan), overriding the organiser’s Surrey label.
- Outlaw Holkham’s 3 July sprint and 4 July half-distance race share the existing umbrella identity. Their source programmes and dates remain separate. St Neots Race 2 is distinct from existing rounds 1 and 3.
- Great North Swim has 16 date/distance combinations across 11–13 June 2027, checked against the organiser’s day-specific tables and its explicit Friday-to-Sunday 2027 entry announcement. Multiple waves remain notes, rather than duplicated races. Saturday’s half-mile clock stays TBC because the quiet-wave description and table differ; other published clocks retain the organiser’s subject-to-change qualification.
- Oundle Tristart uses the programme’s **800m** bike leg (1.45km combined), not 1km. Its age-cutoff text still refers to 2026, so 2027 eligibility is not asserted. Other junior formats retain their own swim/bike/run lengths.
- Hadrian’s Wall Half Marathon advertises a 13.5-mile route: this is stored as 21.726144km, rather than silently converted to the standard half-marathon length.
- Beyond NCL and The Priory had generic 50km `Ultra` placeholders on their reviewed 2027 dates. The opened programmes advertise 25/55km and 100km respectively. Those two legacy rows remain in the audit but are hidden from public fixtures for those exact dates, so visitors see the actual organiser programme.
- Cycling village opening hours, pool lengths, registration times and spectator estimates are not race start times or race distances.
- The Woodhall Spa existing record had a blank country, which caused the collector helper to hold it. The opened organiser venue confirms Woodhall Spa, Lincolnshire. The existing permanent slug is retained and the country/county correction is guarded by the exact stored metadata baseline.

## Held or unresolved

- North Lakes: 2027 header with 2026 body/accommodation references.
- Normanby Hall: 11 July 2027 explicitly provisional.
- Lingwood Duathlon: 2027 date TBC; no copied 2026 date/time.
- Norwich Triathlon: 2027 date announced but the specific distance programme was not established.
- Tour de Broads Summer: venue TBC, so the county venue is not guessed.
- ATW First to Full: new course distances and overlap with existing St Neots identities need further review.
- Geordieman swim-only: distance absent; verified triathlon and duathlon formats are included.
- Henley swims: start-bank/county boundaries need resolution before county assignment.
- Swim England meet disciplines/session clocks and the UK Athletics individual discipline timetable remain unpublished in the checked sources. Whole-meet dates and end dates are included without invented numeric distances.

## Reconciliation, publication and validation

Identity review used 9,917 globally recorded running events, 542 other-sport identities, relevant UK athletics records, 1,434 UK parkruns, permanent slug aliases and 9,859 editions around the requested date range. Exact organiser URL/Eventrac identifiers, venue/programme evidence and canonical aliases were checked. The expanded source pass revisited the remaining Wild Deer programme and official swimming announcements. Forty-two matching editions were skipped, not reimported under different distance labels.

Baseline revision: **278**. The full public fixture metadata snapshot is committed in `scripts/lib/county-expansion-more-baseline.json`; there were no overlapping pending batches. The independent previous release manifests and source keys remain unchanged.

Publication uses two bounded native stage/validate/publish batches under `athrecs:county-expansion-more:2026-10-21:1` and `athrecs:county-expansion-more:2026-10-21:2`. The revision/event locks, exact metadata comparison, equivalent-distance collision check, alias/pending/name guards, immutable payload hashes and audit counts prevent stale or repeated publication. Existing edition rows are preserved. No athlete or result records are touched.

Validation: the PGlite rehearsal runs the real publisher and county query, checks exact geography/starts/sources/end dates, original edition preservation, audit totals, baseline rejection, equivalent-distance collision rejection, immutable payload rejection and repeat no-op. Existing county-release regression, type checking, focused lint and the production bundle are checked before merging.

## Reviewed source index

| Event | Dates checked | Official source |
|---|---|---|
| Goyt Valley Wild Trail Runs | 2026-10-31 | https://www.wilddeerevents.co.uk/e/goyt-valley-wild-trail-runs-2026-11km-and-7km-15893 |
| Rother Valley Remembrance Day Trail Runs | 2026-11-08 | https://www.wilddeerevents.co.uk/e/rother-valley-remembrance-day-trail-runs-2026-14810 |
| Slaley Hall and Forest Trail Runs | 2026-11-15 | https://www.wilddeerevents.co.uk/e/slaley-hall-and-forest-trail-runs-2026-14631 |
| Thirlmere Wild Trail Runs | 2026-11-21 | https://www.wilddeerevents.co.uk/e/thirlmere-wild-trail-runs-15894 |
| Dalby Forest Winter Trail Runs | 2026-11-29 | https://www.wilddeerevents.co.uk/e/dalby-forest-wild-winter-trail-runs-2026-14632 |
| Glamis Castle Festive Trail Runs | 2026-12-06 | https://www.wilddeerevents.co.uk/e/glamis-castle-festive-trail-runs-2026-14682 |
| Moors Valley Festive Trail Runs | 2026-12-06 | https://www.wilddeerevents.co.uk/e/moors-valley-festive-trail-runs-2km-santa-run-5km-and-10km-14910 |
| Sherwood Pines Festive Trail Runs | 2026-12-13 | https://www.wilddeerevents.co.uk/e/sherwood-pines-festive-trail-runs-2026-14700 |
| Gibside Wild New Year Trail Runs | 2027-01-03 | https://www.wilddeerevents.co.uk/e/gibside-wild-new-year-trail-runs-15425 |
| Harewood House New Year Trail Runs | 2027-01-09 | https://www.wilddeerevents.co.uk/e/yorkshire-new-year-trail-runs-2027-harewood-house-14484 |
| Druridge Bay Beach Trail Runs | 2027-01-24 | https://www.wilddeerevents.co.uk/e/druridge-bay-beach-trail-runs-14486 |
| Rivington Wild Trail Runs | 2027-02-20 | https://www.wilddeerevents.co.uk/e/rivington-wild-trail-runs-2027-16100 |
| Alnwick Castle Trail Runs | 2027-02-21 | https://www.wilddeerevents.co.uk/e/alnwick-castle-trail-runs-2027-10km-and-half-marathon-14491 |
| Fountains Abbey Wild Trail Runs | 2027-02-28 | https://www.wilddeerevents.co.uk/e/fountains-abbey-wild-trail-runs-14487 |
| Tatton Park Wild Trail Runs | 2027-03-06 | https://www.wilddeerevents.co.uk/e/tatton-park-wild-trail-runs-2027-14521 |
| Grasmere Wild Trail Runs | 2027-03-20 | https://www.wilddeerevents.co.uk/e/grasmere-wild-trail-runs-2027-14493 |
| Scone Palace Trail Runs | 2027-04-04 | https://www.wilddeerevents.co.uk/e/scone-palace-trail-runs-14510 |
| Bramham Park Trail Runs | 2027-04-04 | https://www.wilddeerevents.co.uk/e/yorkshire-trail-runs-bramham-park-14504 |
| High Lodge Wild Trail Runs | 2027-04-11 | https://www.wilddeerevents.co.uk/e/high-lodge-wild-trail-runs-2027-5km-10km-and-new-half-marathon-14502 |
| Bamburgh Castle Wild 10K Trail Run | 2027-04-17 | https://www.wilddeerevents.co.uk/e/bamburgh-castle-wild-10km-trail-run-15391 |
| Clumber Park Wild Trail Runs | 2027-04-18 | https://www.wilddeerevents.co.uk/e/clumber-park-wild-trail-runs-2027-16191 |
| Beyond Newcastle | 2027-04-24 | https://www.wilddeerevents.co.uk/e/beyond-newcastle-55km-ultra-and-25km-trail-run-14529 |
| Whinlatter Forest Trail Runs | 2027-05-02 | https://www.wilddeerevents.co.uk/e/whinlatter-forest-trail-runs-14519 |
| Moors Valley Wild Trail Runs | 2027-05-02 | https://www.wilddeerevents.co.uk/e/moors-valley-wild-trail-runs-14904 |
| Gibside National Trust Trail Runs | 2027-05-05 | https://www.wilddeerevents.co.uk/e/gibside-national-trust-wild-trail-runs-14511 |
| Beyond Glasgow | 2027-05-08 | https://www.wilddeerevents.co.uk/e/beyond-glasgow-55km-ultra-and-25km-trail-runs-15906 |
| The Derwent 60K Trail Ultra | 2027-05-16 | https://www.wilddeerevents.co.uk/e/the-derwent-60km-trail-ultra-early-bird-prices-16255 |
| Hartlepool Half Marathon | 2027-05-23 | https://www.wilddeerevents.co.uk/e/hartlepool-half-marathon-2027-14522 |
| The Priory 100K Ultra | 2027-05-29 | https://www.wilddeerevents.co.uk/e/the-priory-ultra-100km-14495 |
| Pooley Bridge Wild Trail Runs | 2027-06-05 | https://www.wilddeerevents.co.uk/e/pooley-bridge-wild-trail-runs-14500 |
| Wentworth Castle Gardens Trail Runs | 2027-06-16 | https://www.wilddeerevents.co.uk/e/wentworth-castle-gardens-trail-runs-5km-and-10km-14499 |
| Beyond Nottingham | 2027-06-19 | https://www.wilddeerevents.co.uk/e/beyond-nottingham-55km-ultra-and-25km-trail-run-16090 |
| Chopwell Woods Summer Trail Runs | 2027-06-26 | https://www.wilddeerevents.co.uk/e/the-chopwell-woods-summer-trail-runs-2027-14527 |
| Alice Holt Wild Trail Runs | 2027-06-27 | https://www.wilddeerevents.co.uk/e/alice-holt-wild-trail-runs-2027-10km-and-1-2-marathon-14497 |
| Souter Lighthouse Summer Trail Runs | 2027-07-07 | https://www.wilddeerevents.co.uk/e/souter-lighthouse-summer-trail-runs-15907 |
| Lambton Castle Summer Trail Runs | 2027-08-15 | https://www.wilddeerevents.co.uk/e/lambton-castle-summer-trail-runs-14571 |
| Beyond Manchester | 2027-09-04 | https://www.wilddeerevents.co.uk/e/beyond-manchester-55km-ultra-and-25km-trail-run-early-bird-prices-14561 |
| Raby Castle Trail Runs | 2027-09-05 | https://www.wilddeerevents.co.uk/e/raby-castle-trail-runs-14580 |
| Beyond Durham | 2027-09-18 | https://www.wilddeerevents.co.uk/e/beyond-durham-55km-ultra-and-25km-trail-run-early-bird-prices-15961 |
| Hawkshead Wild Trail Runs | 2027-10-09 | https://www.wilddeerevents.co.uk/e/hawkshead-wild-trail-runs-16271 |
| Hadrian’s Wall Half Marathon | 2027-10-17 | https://www.wilddeerevents.co.uk/e/hadrians-wall-half-marathon-run-early-bird-prices-14627 |
| Outlaw Holkham 10K | 2027-07-03 | https://outlawtriathlon.com/outlaw-holkham/10k |
| Outlaw Holkham | 2027-07-03 | https://outlawtriathlon.com/outlaw-holkham/gravel-sprint |
| Outlaw Holkham | 2027-07-04 | https://outlawtriathlon.com/outlaw-holkham/outlaw-half |
| Outlaw Nottingham Half | 2027-05-23 | https://outlawtriathlon.com/outlaw-nottingham/outlaw-half |
| Outlaw Nottingham Sprint | 2027-05-22 | https://outlawtriathlon.com/outlaw-nottingham/sprint |
| Outlaw Original | 2027-07-25 | https://outlawtriathlon.com/outlaw-original/outlaw-full |
| Outlaw Middle | 2027-07-25 | https://outlawtriathlon.com/outlaw-original/outlaw-middle |
| Outlaw Original Sprint | 2027-07-24 | https://outlawtriathlon.com/outlaw-original/outlaw-sprint |
| Suffolk Go Wild | 2026-11-01 | https://tprevents.co.uk/product/go-wild/ |
| Tour de Broads Winter Series | 2026-11-29 | https://tprevents.co.uk/product/winter-series/ |
| Tour de Broads Winter Series | 2026-12-13 | https://tprevents.co.uk/product/winter-series/ |
| Tour de Broads Winter Series | 2026-12-27 | https://tprevents.co.uk/product/winter-series/ |
| Woodhall Spa 10K | 2027-06-13 | https://curlysathletes.co.uk/woodhall-spa-10k |
| Skegness Coasters 10K | 2027-01-31 | https://curlysathletes.co.uk/skegness-10k |
| ATW St Neots Triathlon – Race 2 | 2027-07-17 | https://www.atwevents.co.uk/e/atw-st-neots-triathlon-race-2-8988 |
| ATW Grafham Triathlon | 2027-09-25 | https://www.atwevents.co.uk/e/atw-grafham-triathlon-8879 |
| ATW Grafman Middle Distance Triathlon | 2027-06-06 | https://www.atwevents.co.uk/e/atw-grafman-middle-distance-triathlon-8919 |
| ATW Oundle Triathlon | 2027-08-15 | https://www.atwevents.co.uk/e/atw-oundle-triathlon-9004 |
| ATW Oundle Childrens Triathlon | 2027-08-15 | https://www.atwevents.co.uk/e/atw-oundle-children-s-triathlon-9006 |
| The Geordieman Triathlons | 2027-08-22 | https://www.wilddeerevents.co.uk/e/the-geordieman-14572 |
| The Geordieman Duathlon | 2027-08-22 | https://www.wilddeerevents.co.uk/e/the-geordieman-14572 |
| ATW Colchester Friday Night Runs | 2027-08-13 | https://www.atwevents.co.uk/e/atw-colchester-friday-night-runs-8894 |
| ATW Debden 10K and 5K | 2027-03-14 | https://www.atwevents.co.uk/e/atw-debden-10k-and-5k-10400 |
| ATW Remembrance Runs | 2026-11-07 | https://www.atwevents.co.uk/e/atw-remembrance-runs-9066 |
| Essex 20 | 2027-03-14 | https://www.atwevents.co.uk/e/essex-20-8956 |
| Cambridge Cambourne 10K and Fun Run | 2027-04-11 | https://www.atwevents.co.uk/e/cambridge-cambourne-10k-and-fun-run-8935 |
| Novuna UK Athletics Championships | 2027-07-31 | https://www.britishathletics.org.uk/events/2027-novuna-uk-athletics-championships/ |
| Great North Swim | 2027-06-11 | https://greatswim.org/great-north-swim/ |
| Great North Swim | 2027-06-12 | https://greatswim.org/great-north-swim/ |
| Great North Swim | 2027-06-13 | https://greatswim.org/great-north-swim/ |
| Swim England East Region Long Course Championships – Norwich | 2027-05-01 | https://www.eastswimming.org/event/regional-long-course-championships-5/ |
| Swim England National Winter Championships | 2026-12-10 | https://www.eastswimming.org/event/swimming-national-winter-championships-25m/ |
