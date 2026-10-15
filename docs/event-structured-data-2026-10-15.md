# Event structured-data investigation — 15 October 2026

## Search Console evidence

The Events report for `https://www.athrecs.com/`, last updated 14 October 2026, showed **119 valid items, zero invalid items and 10 optional issue types**. The 15 October email does not mean ten broken event pages. The previously reported required startDate and offer availability issues were Passed with zero affected items.

| Optional issue | GSC affected items |
| --- | ---: |
| endDate | 119 |
| performer | 119 |
| offers | 118 |
| organizer.name | 94 |
| organizer | 4 |
| location.address | 1 |
| offers.validFrom | 1 |
| image | 1 |
| eventStatus | 1 |
| description | 1 |

All 119 example URLs were fetched anonymously from production commit `970f5a6866184cb3d61b8f64488dba16f552f329`. Every URL returned HTTP 200 with its existing canonical and indexing directives. 111 currently emitted SportsEvent and eight had already become archive WebPages. Twelve pages had offers. None emitted an organizer object without a name; that report uses older crawls and is stale relative to the live implementation. This is a markup/database audit, not independent verification of every race's facts.

The 118 race slugs were matched against production event records. Missing organisers correspond to blank stored values. The comparison also found legacy source instructions/licensing labels that the old filter incorrectly accepted as organisation names. The expanded filter omits these from JSON-LD while retaining original database values. This can increase truthful optional organizer warnings until source research supplies real hosts.

## Corrections

- Results pages: use CollectionPage/ItemList with a generic subject, rather than embedding an attendance SportsEvent. The Zugspitz results URL is the sole example for location.address, image, eventStatus and description. Preserve its title, description, canonical, indexability, result list and privacy rules.
- Beacons: existing event 4375839 and editions 108804456/108804457 retain their IDs, dates and distances. Add Andali Events, its official website, Half 09:30 / Marathon 08:30, verified official SiEntries offers £40/£60, and the published sale dates. No inferred race ending. Entry status changes from TBC to Open based on the active official entry page.
- Mother's Day 5K: existing event 4384919 and edition 109455980 retain IDs/date/distance. Add Florida Running Company and its website; store the source-backed 9 May 2027 10:00 local ending. Existing entry options remain unchanged; the $35 headline price lacks confirmed inclusive fees.
- Newcastle Town Moor Half: existing official RunThrough offer 204720879 changes from £34 to £35.70 including the expressly stated 5% mandatory booking fee. Its original sale-opening date remains unknown; do not substitute the research date for validFrom.
- Edition ending support: four nullable columns hold date, local time, source URL and checked date. The API exposes endings only with evidence, the race page displays them and passes them to JSON-LD. Validate real dates/time order, preserve unknown precision, retain evidence through unrelated imports and restore snapshots on rollback.

Publication uses the existing catalogue staging/validation/revision mechanism from production/main builds. Corrections require the reviewed existing records, fail if their evidence changed, and are idempotent. Rolled-back corrections do not automatically replay. No events are recreated, no race URLs change, no performers are invented and no broad same-day ending backfill occurs.

## Sources checked 15 October 2026

| Source | Evidence used |
| --- | --- |
| [Google Event documentation](https://developers.google.com/search/docs/appearance/structured-data/event) | Required/recommended fields, accurate dates, location-based timezone interpretation, inclusive ticket prices |
| [Beacons official entry](https://www.sientries.co.uk/event/beacons-ultra-marathon-and-half-2026-2026) | Race date, entry prices, opening/closing dates and active entry |
| [SiEntries terms](https://www.sientries.co.uk/terms.php) | Booking fee is part of the total entry fee |
| [Andali Events](https://www.andalievents.com/) | Named host and official website |
| [Beacons FAQ](https://www.andalievents.com/events/beacons/beacons-faq) | Start times; suggested Half finish is not a firm ending |
| [Florida Running Company](https://www.floridarunningco.com/) | Explicitly hosts Mother's Day 5K and links its entry page |
| [Mother's Day official entry](https://runsignup.com/Race/FL/Clermont/OrlandoMothersDay5K) | 9 May 2027, 07:30–10:00 EDT |
| [Newcastle official entry](https://www.runthrough.co.uk/event/runthrough-town-moor-exhibition-park-5k-10k-march-2027) | £34 Half price plus 5% mandatory fee; no sale-opening date |
| [Cures for the Colors entry](https://runsignup.com/Race/NC/Goldsboro/CuresfortheColors) | Beneficiary identified, but organiser identity not established by the reviewed evidence |

## Remaining issues and research

Cures for the Colors is the one of Google's four missing-organizer examples that still needs explicit host evidence. The other three are Beacons, Mother's Day and the historical Zugspitz results page. Other blank/placeholder organisers in the URL inventory also need host research; a beneficiary, timing company, sponsor or licensing body is not automatically the organiser.

Most ending dates and inclusive entry offers remain unavailable. Obtain current official schedules and entry terms before populating them. Performer is deliberately omitted: generic runners, the organiser and a sponsor are not a verified performing act. Newcastle validFrom remains unknown. Existing named organisers and offers outside the corrections were compared with stored records, not all freshly independently verified.

## Validation before release

Production follow-up: PR #752 passed all CI and deployed as `a71c82e4`. Revisions
261–263 correctly published Newcastle's price and the Beacons/Mother's Day edition
details. The live database comparison caught that the normal publisher preserves
existing event metadata, so its organiser/website changes had not applied. The
follow-up adds a separate, guarded identity-correction revision for each existing
event. Normal imports still preserve event metadata. The correction checks a blank
organiser and the exact reviewed website, changes only organiser/website, records
normal before/after snapshots and leaves the completed edition revisions intact.
Regression tests now explicitly assert the named organiser, official website,
unchanged editions/options, rollback, no replay and changed-evidence rejection.

Passed: focused event schema tests, actual PGlite staging/publication/rollback tests, offer publication tests, public-results metadata/privacy tests, search-discovery tests, TypeScript, focused lint, catalogue validation, fixture duplicate audit and a complete preview-mode production build. CI additionally runs the existing repository quality gate. Live Google tests and deployment outcome are recorded in the pull request after release; this report does not claim Google's indexed report has already refreshed.

## Production validation

PR #753 passed all applicable CI and deployed as `c83e0e22`. Revisions 264 and 265
published the two named organisers. The database comparison confirms original
event/edition/option IDs, dates, distances, source URLs and unrelated fields are
preserved. A second anonymous audit of all 119 URLs returned HTTP 200 throughout,
with unchanged canonicals and robots directives. There are now 110 attendance
Events and nine archive pages; 43 Events lack a credible organiser, 13 have offers
and one has a supported ending. These are live audit counts, not refreshed Google
index counts.

Google's live tests confirmed a valid Mother's Day Event with its 10:00 ending and
Florida Running Company; only offers and performer remained optional warnings.
Newcastle was valid with its £35.70 offer; endDate, performer and validFrom remain
unknown. The Zugspitz archive no longer exposes an attendance Event. Search Console
accepted validation requests for organizer.name and the four archive-only warnings
(location.address, image, eventStatus and description); all showed Started on
15 October, not Passed.

- [Mother's Day live test](https://search.google.com/test/rich-results/result?id=5poYRhHTg6dBWORMtqh-JQ)
- [Newcastle live test](https://search.google.com/test/rich-results/result?id=h5QPvil8lVm6lqBN2m3-OA)
- [Zugspitz archive live test](https://search.google.com/test/rich-results/result?id=sPMsXO8uJK8choFdiXR7AA)

The final visible-page check found that running races use a separate practical
schedule component. It now displays the same supported ending as the JSON-LD,
including date-only precision when no time is known. A guarded notes-only revision
replaces our exact appended technical audit wording with reader-facing official
details. It retains the earlier notes in revision history and preserves all race
facts and entry options. A rendered-component regression covers timed, date-only
and unknown endings; publication regressions cover notes preservation, evidence
guards, rollback and no replay. Its deployment outcome is recorded in the final PR.

## All affected URLs and live baseline

Every row below was an example for missing endDate/performer in Google's report. The displayed organiser is the live JSON-LD baseline, not a certification of its accuracy. Blank values remain blank. `Archive` means no current SportsEvent. The full stored public metadata baseline is retained in [event-structured-data-2026-10-15-before.json](event-structured-data-2026-10-15-before.json).

| URL | Live type | Live organiser | Offers |
| --- | --- | --- | ---: |
| [/races/utmb-world-series-desertrats](https://www.athrecs.com/races/utmb-world-series-desertrats) | SportsEvent | UTMB World Series / local organiser | 0 |
| [/races/bromley-10k](https://www.athrecs.com/races/bromley-10k) | SportsEvent | See runABC / organiser | 0 |
| [/races/dsw-bruggenloop-rotterdam](https://www.athrecs.com/races/dsw-bruggenloop-rotterdam) | SportsEvent | Golazo Sports | 0 |
| [/races/newcastle-town-moor-half-marathon-march-2027](https://www.athrecs.com/races/newcastle-town-moor-half-marathon-march-2027) | SportsEvent | RunThrough Events | 1 |
| [/races/new-york-city-marathon](https://www.athrecs.com/races/new-york-city-marathon) | SportsEvent | See runABC / organiser | 0 |
| [/races/wimbledon-parkrun](https://www.athrecs.com/races/wimbledon-parkrun) | SportsEvent | parkrun | 0 |
| [/races/battersea-park-10k-half-marathon-august](https://www.athrecs.com/races/battersea-park-10k-half-marathon-august) | SportsEvent | RunThrough | 0 |
| [/races/horspath-parkrun](https://www.athrecs.com/races/horspath-parkrun) | SportsEvent | parkrun | 0 |
| [/races/cheadlehulme-parkrun](https://www.athrecs.com/races/cheadlehulme-parkrun) | SportsEvent | parkrun | 0 |
| [/races/wisbech-juniors-parkrun](https://www.athrecs.com/races/wisbech-juniors-parkrun) | SportsEvent | parkrun | 0 |
| [/races/jordanstown-juniors-parkrun](https://www.athrecs.com/races/jordanstown-juniors-parkrun) | SportsEvent | parkrun | 0 |
| [/races/philipspark-parkrun](https://www.athrecs.com/races/philipspark-parkrun) | SportsEvent | parkrun | 0 |
| [/results/zugspitz-ultra-trail-by-utmb-2026-06-18-107k-109238558](https://www.athrecs.com/results/zugspitz-ultra-trail-by-utmb-2026-06-18-107k-109238558) | SportsEvent |  | 0 |
| [/races/ea-uk-fixtures-wirral-primary-schools-cross-country-series-supported-by-wirral-ac](https://www.athrecs.com/races/ea-uk-fixtures-wirral-primary-schools-cross-country-series-supported-by-wirral-ac) | SportsEvent | England Athletics licensed competition | 0 |
| [/races/adidas-10k-paris](https://www.athrecs.com/races/adidas-10k-paris) | SportsEvent | adidas 10K Paris | 0 |
| [/races/boston-marathon](https://www.athrecs.com/races/boston-marathon) | SportsEvent | Boston Athletic Association | 0 |
| [/races/dream-finders-homes-mother-s-day-5k](https://www.athrecs.com/races/dream-finders-homes-mother-s-day-5k) | SportsEvent |  | 0 |
| [/races/cures-for-the-colors-glow-run](https://www.athrecs.com/races/cures-for-the-colors-glow-run) | SportsEvent |  | 0 |
| [/races/south-west-coast-50-ultra-challenge](https://www.athrecs.com/races/south-west-coast-50-ultra-challenge) | SportsEvent | Action Challenge | 0 |
| [/races/utmb-world-series-saint-jacques](https://www.athrecs.com/races/utmb-world-series-saint-jacques) | SportsEvent | UTMB World Series / local organiser | 0 |
| [/races/aldermankneeshaw-juniors-parkrun](https://www.athrecs.com/races/aldermankneeshaw-juniors-parkrun) | SportsEvent | parkrun | 0 |
| [/races/corre-por-los-bomberos-5k](https://www.athrecs.com/races/corre-por-los-bomberos-5k) | SportsEvent | Octava Compañía de Bomberos de Capiatá K8 | 0 |
| [/races/wa-bilbao-night-half-marathon-7236025](https://www.athrecs.com/races/wa-bilbao-night-half-marathon-7236025) | SportsEvent | Bilbao Night Running Fest | 0 |
| [/races/beacons-trail-marathon-half-marathon-ultra](https://www.athrecs.com/races/beacons-trail-marathon-half-marathon-ultra) | SportsEvent |  | 0 |
| [/races/chiang-mai-marathon](https://www.athrecs.com/races/chiang-mai-marathon) | SportsEvent | Jog & Joy | 0 |
| [/races/ncfc-ecnl-girls-glow-run-chasing-goals-changing-lives](https://www.athrecs.com/races/ncfc-ecnl-girls-glow-run-chasing-goals-changing-lives) | SportsEvent |  | 0 |
| [/races/cork-half-marathon](https://www.athrecs.com/races/cork-half-marathon) | SportsEvent |  | 0 |
| [/races/nl-bierrun-eindhoven-c78bb9](https://www.athrecs.com/races/nl-bierrun-eindhoven-c78bb9) | SportsEvent | Bierbattle | 0 |
| [/races/fredericiavold-parkrun](https://www.athrecs.com/races/fredericiavold-parkrun) | SportsEvent | parkrun | 0 |
| [/races/santa-dash-5k-1-mile-walk-presented-by-fleet-feet](https://www.athrecs.com/races/santa-dash-5k-1-mile-walk-presented-by-fleet-feet) | SportsEvent |  | 0 |
| [/races/ea-uk-fixtures-lancashire-cross-country-championships](https://www.athrecs.com/races/ea-uk-fixtures-lancashire-cross-country-championships) | SportsEvent | England Athletics licensed competition | 0 |
| [/races/beer-city-half-fort-worth](https://www.athrecs.com/races/beer-city-half-fort-worth) | Archive |  | 0 |
| [/races/runthrough-richmond-park-half-marathon](https://www.athrecs.com/races/runthrough-richmond-park-half-marathon) | SportsEvent | RunThrough Events | 1 |
| [/races/nl-springendalloop-olc-93-ootmarsum-384586](https://www.athrecs.com/races/nl-springendalloop-olc-93-ootmarsum-384586) | SportsEvent | OLC'93 | 0 |
| [/races/legendarios-trail-pozos-azules](https://www.athrecs.com/races/legendarios-trail-pozos-azules) | SportsEvent | Desnivel Eventos Deportivos | 0 |
| [/races/wa-marathon-m-nchen-by-brooks-7236403](https://www.athrecs.com/races/wa-marathon-m-nchen-by-brooks-7236403) | Archive |  | 0 |
| [/races/runuk-windsor-dorney-lakeside-half-marathon](https://www.athrecs.com/races/runuk-windsor-dorney-lakeside-half-marathon) | SportsEvent | See runABC / organiser | 0 |
| [/races/royal-parks-foundation-half-marathon](https://www.athrecs.com/races/royal-parks-foundation-half-marathon) | Archive |  | 0 |
| [/races/mountain-range-trail-series-tai-po](https://www.athrecs.com/races/mountain-range-trail-series-tai-po) | SportsEvent | Union Hope Limited | 0 |
| [/races/bank-jateng-borobudur-marathon](https://www.athrecs.com/races/bank-jateng-borobudur-marathon) | SportsEvent | Borobudur Marathon | 0 |
| [/races/nationwide-columbus-marathon](https://www.athrecs.com/races/nationwide-columbus-marathon) | SportsEvent | Nationwide Children's Hospital Columbus Marathon | 0 |
| [/races/battersea-park-half-marathon-10k-5k-may-2027](https://www.athrecs.com/races/battersea-park-half-marathon-10k-5k-may-2027) | SportsEvent | RunThrough Events | 1 |
| [/races/nl-bosloopcompetitie-25-oktober-ccd82b](https://www.athrecs.com/races/nl-bosloopcompetitie-25-oktober-ccd82b) | SportsEvent | AV Athlos | 0 |
| [/races/crescent-city-classic](https://www.athrecs.com/races/crescent-city-classic) | SportsEvent | CCC10K | 0 |
| [/races/loaves-and-fishes-and-veterans-services-of-the-carolinas-run-for-recovery](https://www.athrecs.com/races/loaves-and-fishes-and-veterans-services-of-the-carolinas-run-for-recovery) | SportsEvent |  | 0 |
| [/races/goldsboro-family-ymca-turkey-trot-5k-and-1-mile-fun-run-walk](https://www.athrecs.com/races/goldsboro-family-ymca-turkey-trot-5k-and-1-mile-fun-run-walk) | SportsEvent |  | 0 |
| [/races/monsal-trail-half-marathon-autumn-saturday](https://www.athrecs.com/races/monsal-trail-half-marathon-autumn-saturday) | SportsEvent | Nice Work | 1 |
| [/races/nl-winterbosloop-beek-montferland-run-2-4eae8a](https://www.athrecs.com/races/nl-winterbosloop-beek-montferland-run-2-4eae8a) | SportsEvent | Stichting Omloop Beek | 0 |
| [/races/excalibur-winter-trail-races-10km-and-17km](https://www.athrecs.com/races/excalibur-winter-trail-races-10km-and-17km) | SportsEvent | See runABC / organiser | 0 |
| [/races/dream-finders-homes-great-turkey-trot-5k](https://www.athrecs.com/races/dream-finders-homes-great-turkey-trot-5k) | SportsEvent |  | 0 |
| [/races/clearstream-celebration-of-life-5k-2026](https://www.athrecs.com/races/clearstream-celebration-of-life-5k-2026) | SportsEvent | Cork BHAA | 0 |
| [/races/a2z-dynamic-annual-marathon-2026](https://www.athrecs.com/races/a2z-dynamic-annual-marathon-2026) | SportsEvent | Anchor Dynamic Limpopo Athletics Club | 0 |
| [/races/the-meadows-5k-10-october](https://www.athrecs.com/races/the-meadows-5k-10-october) | Archive |  | 0 |
| [/races/nl-posbank-trail-walk-bf31d7](https://www.athrecs.com/races/nl-posbank-trail-walk-bf31d7) | SportsEvent | Cairn Trails en Adventures | 0 |
| [/races/dinotaeng-run-taichung](https://www.athrecs.com/races/dinotaeng-run-taichung) | SportsEvent | Norns | 0 |
| [/races/nl-gouda-rent-wandelt-bij-kaarslicht-bdab8b](https://www.athrecs.com/races/nl-gouda-rent-wandelt-bij-kaarslicht-bdab8b) | SportsEvent | GO Sportief in Het Groene Hart | 0 |
| [/races/faster-than-pastor-5k](https://www.athrecs.com/races/faster-than-pastor-5k) | SportsEvent |  | 0 |
| [/races/north-carolina-springs-classic-the-fest](https://www.athrecs.com/races/north-carolina-springs-classic-the-fest) | SportsEvent |  | 0 |
| [/races/crystal-coast-cancer-rehab-center-5k-run-1-mile-cancer-survivor-walk](https://www.athrecs.com/races/crystal-coast-cancer-rehab-center-5k-run-1-mile-cancer-survivor-walk) | SportsEvent |  | 0 |
| [/races/carrera-canacine](https://www.athrecs.com/races/carrera-canacine) | SportsEvent | CANACINE / Asociacion Poblana de Atletismo | 0 |
| [/races/strathcarron-hospice-10k-road-race-fun-run](https://www.athrecs.com/races/strathcarron-hospice-10k-road-race-fun-run) | SportsEvent | Strathcarron Hospice | 0 |
| [/races/cork-bhaa-defence-forces-5k-2026](https://www.athrecs.com/races/cork-bhaa-defence-forces-5k-2026) | Archive |  | 0 |
| [/races/race-for-life-york-5k-2027](https://www.athrecs.com/races/race-for-life-york-5k-2027) | SportsEvent | Cancer Research UK | 0 |
| [/races/new-year-s-eve-10k-road-race](https://www.athrecs.com/races/new-year-s-eve-10k-road-race) | SportsEvent | Grange/Fermoy A.C. | 0 |
| [/races/rb-virtual-cattle-creep-series](https://www.athrecs.com/races/rb-virtual-cattle-creep-series) | SportsEvent | See event listing | 0 |
| [/races/blickling-half-marathon-autumn](https://www.athrecs.com/races/blickling-half-marathon-autumn) | SportsEvent | See runABC / organiser | 0 |
| [/races/ultra-trail-du-fjord-du-saguenay](https://www.athrecs.com/races/ultra-trail-du-fjord-du-saguenay) | SportsEvent |  | 0 |
| [/races/blair-castle-trail-weekender-sunday](https://www.athrecs.com/races/blair-castle-trail-weekender-sunday) | SportsEvent | Outsider Events | 1 |
| [/races/edinburgh-marathon-festival-5k](https://www.athrecs.com/races/edinburgh-marathon-festival-5k) | SportsEvent | See runABC / organiser | 0 |
| [/races/nl-wisent-winter-trail-ed8259](https://www.athrecs.com/races/nl-wisent-winter-trail-ed8259) | SportsEvent | AV Veluwe | 0 |
| [/races/nl-graef-castricum-trail-walk-47d605](https://www.athrecs.com/races/nl-graef-castricum-trail-walk-47d605) | SportsEvent | Cairn Trails en Adventures | 0 |
| [/races/ea-runevents-chocks-away-5km-exeter](https://www.athrecs.com/races/ea-runevents-chocks-away-5km-exeter) | SportsEvent | Official event organiser | 0 |
| [/races/nl-pierewaai-ultra-trail-70km-en-100km-380af5](https://www.athrecs.com/races/nl-pierewaai-ultra-trail-70km-en-100km-380af5) | SportsEvent | Ultrarent | 0 |
| [/races/beirut-international-marathon](https://www.athrecs.com/races/beirut-international-marathon) | SportsEvent | See official race site | 0 |
| [/races/nl-amersfoort-night-run-934c10](https://www.athrecs.com/races/nl-amersfoort-night-run-934c10) | SportsEvent | Central Events B.V. | 0 |
| [/races/rb-halloween-twilight-run-scorrier-house](https://www.athrecs.com/races/rb-halloween-twilight-run-scorrier-house) | SportsEvent | See event listing | 0 |
| [/races/nl-taxandria-marathon-oisterwijk-48a52c](https://www.athrecs.com/races/nl-taxandria-marathon-oisterwijk-48a52c) | SportsEvent | Taxandria Atletiek | 0 |
| [/races/nl-podorun-sonderkamp-wijnands-83f15f](https://www.athrecs.com/races/nl-podorun-sonderkamp-wijnands-83f15f) | SportsEvent | Atletiek Helden | 0 |
| [/races/nl-halve-marathon-gouda-287791](https://www.athrecs.com/races/nl-halve-marathon-gouda-287791) | SportsEvent | Stichting Halve Marathon Gouda | 0 |
| [/races/mandiri-jogja-marathon](https://www.athrecs.com/races/mandiri-jogja-marathon) | SportsEvent | Mandiri Jogja Marathon | 0 |
| [/races/nl-tt-marathon-3703c6](https://www.athrecs.com/races/nl-tt-marathon-3703c6) | SportsEvent | TT City Run | 0 |
| [/races/ce-trcame-prilep](https://www.athrecs.com/races/ce-trcame-prilep) | SportsEvent | Če Trčame | 0 |
| [/races/outrun-the-night-ultra](https://www.athrecs.com/races/outrun-the-night-ultra) | SportsEvent | See runABC / organiser | 0 |
| [/races/full-moon-desert-marathon](https://www.athrecs.com/races/full-moon-desert-marathon) | SportsEvent | See official race site | 0 |
| [/races/way-of-the-dead-dartmoor-traverse](https://www.athrecs.com/races/way-of-the-dead-dartmoor-traverse) | SportsEvent | See runABC / organiser | 0 |
| [/races/dream-finders-homes-12ks-of-christmas-christmas-5k-kids-races](https://www.athrecs.com/races/dream-finders-homes-12ks-of-christmas-christmas-5k-kids-races) | SportsEvent |  | 0 |
| [/races/rtt-afan-forest-trail-10k-5k](https://www.athrecs.com/races/rtt-afan-forest-trail-10k-5k) | SportsEvent | See runABC / organiser | 0 |
| [/races/mugdock-country-park-running-festival-2026](https://www.athrecs.com/races/mugdock-country-park-running-festival-2026) | SportsEvent | Up and Running Events | 0 |
| [/races/kent-downs-50-ultra-challenge](https://www.athrecs.com/races/kent-downs-50-ultra-challenge) | SportsEvent | Action Challenge | 0 |
| [/races/ott-trail-marathon-10-mile-2027](https://www.athrecs.com/races/ott-trail-marathon-10-mile-2027) | SportsEvent | Off The Tarmac | 1 |
| [/races/wa-35th-chugoku-high-school-rookie-s-athletics-championships-7245135](https://www.athrecs.com/races/wa-35th-chugoku-high-school-rookie-s-athletics-championships-7245135) | Archive |  | 0 |
| [/races/silverbacktrails-goarhland-v-trigs-challenge-ultra](https://www.athrecs.com/races/silverbacktrails-goarhland-v-trigs-challenge-ultra) | SportsEvent | See runABC / organiser | 0 |
| [/races/invesco-qqq-thanksgiving-day-half-marathon](https://www.athrecs.com/races/invesco-qqq-thanksgiving-day-half-marathon) | SportsEvent | Atlanta Track Club | 1 |
| [/races/monsal-trail-half-marathon-autumn-sunday](https://www.athrecs.com/races/monsal-trail-half-marathon-autumn-sunday) | SportsEvent | Nice Work | 1 |
| [/races/ea-uk-fixtures-british-masters-af-cross-country-relays](https://www.athrecs.com/races/ea-uk-fixtures-british-masters-af-cross-country-relays) | SportsEvent | England Athletics licensed competition | 0 |
| [/races/invereskprecinct-parkrun](https://www.athrecs.com/races/invereskprecinct-parkrun) | SportsEvent | parkrun | 0 |
| [/races/race-across-scotland](https://www.athrecs.com/races/race-across-scotland) | SportsEvent | See runABC / organiser | 0 |
| [/races/monsal-trail-half-marathon-satuday](https://www.athrecs.com/races/monsal-trail-half-marathon-satuday) | SportsEvent | Nice Work | 0 |
| [/races/windsor-trail-run-half-marathon-10k-august](https://www.athrecs.com/races/windsor-trail-run-half-marathon-10k-august) | SportsEvent | RunThrough Events | 1 |
| [/races/runthrough-chase-the-moon-battersea-february-2027](https://www.athrecs.com/races/runthrough-chase-the-moon-battersea-february-2027) | SportsEvent | RunThrough | 0 |
| [/races/the-one-in-the-park-victoria-park-half-marathon](https://www.athrecs.com/races/the-one-in-the-park-victoria-park-half-marathon) | SportsEvent | OneRace Events | 1 |
| [/races/utmb-world-series-istria](https://www.athrecs.com/races/utmb-world-series-istria) | SportsEvent | UTMB World Series / local organiser | 0 |
| [/races/rb-milton-keynes-winter-half-marathon](https://www.athrecs.com/races/rb-milton-keynes-winter-half-marathon) | SportsEvent | See event listing | 0 |
| [/races/marshfield-mudlark](https://www.athrecs.com/races/marshfield-mudlark) | Archive |  | 0 |
| [/races/amsterdam-half-marathon](https://www.athrecs.com/races/amsterdam-half-marathon) | SportsEvent | See runABC / organiser | 0 |
| [/races/kingdom-of-northumbria-coastal-ultra](https://www.athrecs.com/races/kingdom-of-northumbria-coastal-ultra) | SportsEvent | See runABC / organiser | 0 |
| [/races/utmb-world-series-oman](https://www.athrecs.com/races/utmb-world-series-oman) | SportsEvent | UTMB World Series / local organiser | 0 |
| [/races/fife-pilgrim-way-ultra](https://www.athrecs.com/races/fife-pilgrim-way-ultra) | SportsEvent | See runABC / organiser | 0 |
| [/races/berat-green-half-marathon](https://www.athrecs.com/races/berat-green-half-marathon) | SportsEvent | Berat Green Half Marathon | 0 |
| [/races/finsbury-park-half-marathon-5k-10k-half-marathon-april](https://www.athrecs.com/races/finsbury-park-half-marathon-5k-10k-half-marathon-april) | SportsEvent | See runABC / organiser | 0 |
| [/races/edinburgh-marathon-festival-team-relay](https://www.athrecs.com/races/edinburgh-marathon-festival-team-relay) | SportsEvent | See runABC / organiser | 0 |
| [/races/craig-o-barns](https://www.athrecs.com/races/craig-o-barns) | Archive |  | 0 |
| [/races/exeter-half-marathon-2027](https://www.athrecs.com/races/exeter-half-marathon-2027) | SportsEvent | Exeter City Community Trust | 1 |
| [/races/liverpool-half-marathon-10-miler](https://www.athrecs.com/races/liverpool-half-marathon-10-miler) | SportsEvent | BTR Liverpool | 0 |
| [/races/park-west-5k-2027](https://www.athrecs.com/races/park-west-5k-2027) | SportsEvent | Park West race organiser / Eventmaster | 0 |
| [/races/run-jersey-half-marathon-and-road-race-festival](https://www.athrecs.com/races/run-jersey-half-marathon-and-road-race-festival) | SportsEvent | Run Jersey Events | 1 |
| [/races/two-oceans-marathon](https://www.athrecs.com/races/two-oceans-marathon) | SportsEvent | Two Oceans Marathon NPC | 0 |
| [/races/wa-active-oman-half-marthon-7244878](https://www.athrecs.com/races/wa-active-oman-half-marthon-7244878) | SportsEvent | World Athletics / national federation | 0 |
| [/races/altonabeach-parkrun](https://www.athrecs.com/races/altonabeach-parkrun) | SportsEvent | parkrun | 0 |
