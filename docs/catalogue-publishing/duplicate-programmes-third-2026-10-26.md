# Fixture duplicates: third pass, 26 October 2026

Continues the owner-authorised cleanup from October onwards. Twelve additional event/date listings are suppressed in favour of ten retained programmes: fourteen repeated race-distance rows plus five non-race import placeholders. This brings the three review manifests to fifty suppressions, including the four distinct additions already merged in PR #999. No original event, edition, result or dependant is deleted or merged.

The live baseline was refreshed for 22 affected events and 39 edition rows immediately before implementation and matched the source-review snapshot. Main was `fc09a50`. The wider candidate review also included unrelated dates and nearby events as controls. Matching used the opened dated programme, distance and venue, not names alone.

## Decisions

| Date | Suppressed event (ID) | Retained event (ID) | Retained options | Evidence |
| --- | --- | --- | --- | --- |
| 2026-10-04 | `run-yorkshire-roundhay-october` (4372635) | `run-yorkshire-half-marathon-10k-5k` (3061206) | 10K, 5K, Half | [Programme](https://runnation.co.uk/r/Roundhay-HalfMarathon-october-2026) |
| 2026-12-20 | `wimbledon-common-5k-10k-christmas-run` (4375900) | `ea-runevents-wimbledon-common-series-wimbledon` (3147973) | 5K, 10K | [Programme](https://www.letsdothis.com/gb/e/runthrough-wimbledon-common-5k-10k-christmas-run-december-2026-257167) |
| 2027-01-10 | `ea-runevents-templenewsam-10-leeds` (3148047) | `temple-newsam-10-2027` (4384742) | 10mi | [Programme](https://racebest.com/races/qq342) |
| 2026-11-22 | `san-sebastian-marathon` (3061235) | `zurich-san-sebastian-marathon` (4104290) | Marathon | [Programme](https://zurichmaratonsansebastian.com/en/i-am-a-runner/regulation/) |
| 2026-10-04 | `wa-generali-k-ln-marathon-7236087` (3065358) | `cologne-marathon` (3066269) | Marathon, Half, Marathon Relay | [Programme](https://generali-koeln-marathon.de/wp-content/uploads/2026/09/20260831_FAQ-vor-der-Veranstaltung.pdf) |
| 2026-10-04 | `wa-generali-k-ln-half-marathon-7236088` (3065362) | `cologne-marathon` (3066269) | Marathon, Half, Marathon Relay | [Programme](https://generali-koeln-marathon.de/wp-content/uploads/2026/09/20260831_FAQ-vor-der-Veranstaltung.pdf) |
| 2026-10-04 | `wa-marathon-beneva-de-qu-bec-7237449` (3065352) | `beneva-quebec-city-marathon` (3899155) | Marathon | [Programme](https://www.jecoursqc.com/en/beneva-quebec-city-marathon-presented-by-montellier/schedule/) |
| 2026-10-04 | `quebec-city-marathon-marathon-des-deux-rives` (3066343) | `beneva-quebec-city-marathon` (3899155) | Marathon | [Programme](https://www.jecoursqc.com/en/beneva-quebec-city-marathon-presented-by-montellier/schedule/) |
| 2026-10-11 | `wa-bank-of-america-chicago-marathon-7235563` (3065295) | `chicago-marathon` (3060157) | Marathon | [Programme](https://cdn.chicagomarathon.com/app/uploads/2026/10/05135337/2026-Bank-of-America-Chicago-Marathon-Particicpant-Guide_FR.pdf) |
| 2026-10-11 | `wa-top-flight-by-runthrough-mbna-chester-marathon-7244978` (3065311) | `mbna-chester-marathon` (3060821) | Marathon | [Programme](https://www.topflightraces.com/chester-marathon/) |
| 2026-10-03 | `tc-10k` (4356588) | `wa-tc-10k-7245303` (3065380) | 10K | [Programme](https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/tc10k) |
| 2026-11-22 | `hadleigh-5-10-mile` (4375881) | `ea-runevents-hadleigh-10-5-2-hadleigh` (3148026) | 2K, 5mi, 10mi | [Programme](https://www.hadleigh-hares.co.uk/hadleigh-10-and-5-mile-races2026) |

Only the stated dates are withheld. Raw World Athletics Other/0 rows remain in storage; they do not establish additional races. Results and category records remain on their original identities.

## Source review and before/after starts

| Retained programme/date | Stored local starts before review | Reviewed programme |
| --- | --- | --- |
| `run-yorkshire-half-marathon-10k-5k|2026-10-04` | 10K: 10:00; 5K: blank; Half: blank | Half: 09:30; 10K: 10:00; 5K: 10:15 |
| `ea-runevents-wimbledon-common-series-wimbledon|2026-12-20` | 5K: 09:30; 10K: 09:30 | 5K: 09:50; 10K: 09:30 |
| `temple-newsam-10-2027|2027-01-10` | 10mi: 10:00 | 10mi: 10:00 |
| `zurich-san-sebastian-marathon|2026-11-22` | Marathon: 09:00 | Marathon: 09:00 |
| `cologne-marathon|2026-10-04` | Marathon: blank; Half: blank; Marathon Relay: blank | Half: From 08:30 · start blocks until 09:45; Marathon: From 10:30 · start blocks until 10:50; Marathon Relay: From 10:30 · start blocks until 10:50 |
| `beneva-quebec-city-marathon|2026-10-04` | Marathon: blank | Marathon: From 08:00 · wave starts |
| `chicago-marathon|2026-10-11` | Marathon: blank | Marathon: Elite 07:30 · waves 07:35 / 08:00 / 08:35 |
| `mbna-chester-marathon|2026-10-11` | Marathon: blank | Marathon: 09:00 |
| `wa-tc-10k-7245303|2026-10-03` | Other: blank; 10K: blank | 10K: Championship 07:15 · general race 07:30 |
| `ea-runevents-hadleigh-10-5-2-hadleigh|2026-11-22` | 10mi: 10:00; 5mi: 10:00; Fun Run: 10:00 | 2K: 10:00; 10mi: 11:00; 5mi: 11:05 |

All sources were opened on 26 October 2026. Checked starts apply only to the listed edition. Wave labels deliberately keep calendar exports date-only instead of assigning one participant's wave to everyone.

- Roundhay: opened the separate [half marathon](https://runnation.co.uk/r/Roundhay-HalfMarathon-october-2026), [10K](https://runnation.co.uk/r/roundhay10K-october-2026) and [5K](https://runnation.co.uk/r/roundhay5K-october-2026) organiser programmes. These resolve the earlier incomplete-source hold.
- Wimbledon: the dated authorised entry page's race-day timetable agrees with the organiser's [Christmas distances FAQ](https://www.runthrough.co.uk/help/wimbledon-common-5k-10k-christmas-run-distances-and-start-times). The [main event page](https://www.runthrough.co.uk/event/wimbledon-common-5k-10k-christmas-run-december-2026) has mismatched half-marathon body copy and entry buttons leading to Blackburn; that mismatched programme is not used. The organiser [venue calendar](https://www.runthrough.co.uk/venues/wimbledon-common-running-events) confirms December's 5K/10K and the separate November half/10K. The [guide index](https://www.runthrough.co.uk/event-guides) has no December Wimbledon guide yet. This is a documented source-selection decision, not a copied recurring clock. Reconfirm against the final guide at seven and two days (13 and 18 December).
- Temple Newsam: opened the dated RaceBest entry and linked [organiser page](https://www.sttheresasac.org.uk/tnt). Its FAQ says details coming soon; the authorised 2027 entry supplies the confirmed ten-mile start. Reconfirm 3 and 8 January 2027.
- San Sebastián: organiser home, regulations and FAQ inspected. The current dated regulations establish the marathon start and distinguish the earlier 10K. Reconfirm 15 and 20 November.
- Hadleigh: the organiser's 2026 page confirms the junior 2K as well as the adult programme. Its linked [official entry](https://my.raceresult.com/406049/) confirms the same event date. The generic ATW listing and older 2025 page were not substituted for the dated programme. Reconfirm 15 and 20 November.
- Cologne: the dated 2026 organiser FAQ confirms marathon, half and four-person relay, with both first and last start blocks. Preserve the relay as a separate option.
- Quebec: the organiser explicitly retains its schedule as 2026 reference information. Its marathon is in waves; Saturday's shorter races and Sunday's half marathon are not suppressed.
- Chicago: the organiser's linked 2026 participant guide confirms the October edition and separate wheelchair, handcycle, professional, high-performance and general starts. The current website header now advertises 2027; no 2027 time was copied into 2026.
- Chester: Top Flight explicitly describes a wave of the same MBNA marathon. Its separate metric-marathon identity is untouched. The obsolete RunThrough event URL redirects to the events index and was not used as current evidence.
- TC 10K: the organiser's 2026 race page and linked [professional programme](https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/marathonweekendprofessionalathletes) distinguish the championship and general starts. Both imported fixtures point to the same event; the retained display preserves both fields and corrects the venue presentation to St Paul. The 2027 weekend summary is not evidence for this edition.

## Hadleigh publication

The existing guarded checked-fixture publisher adds the confirmed 2K and updates the two adult starts in one audited transaction. Exact adult edition IDs, old clocks, kilometres, status, source and notes are checked before staging. An already-present 2K or changed baseline causes rejection. A unique source key prevents replay, including after rollback. The original Fun Run/0 row (74248496) and all its dependants remain untouched and are excluded from public presentation as the reviewed junior placeholder. The seed correction carries the same programme so a later seed cannot reintroduce the old labels or clocks. No prices, entry options, results or athlete facts are changed.

## Remaining review queue

- Palma: the current organiser schedule and regulations have rolled forward to 2027. The organiser's 2026 archive links Sportmaniacs, whose event page returned 403. The likely duplicate stays unchanged pending accessible 2026 programme evidence; neither the stored 07:00 nor the 2027 08:05 is treated as a newly verified 2026 time.
- November Nightmare: the earlier distance/programme discrepancy still needs separate reconciliation.
- London Riverside MoRun remains a separate venue and date-correction follow-up, not a duplicate of Richmond Park.
- Distinct districts, age/sex championships and unrelated dates remain separate. Cardiff's existing canonical alias is not counted again.

This batch does not certify the full fixture catalogue or clear the wider start-review queue. No new automation or organiser message was created.

## Validation

- Fresh production baseline comparison: all 22 identities and 39 existing editions unchanged before publication.
- PGlite public-reader check: all twelve duplicate dates removed, all ten retained programmes and seventeen options present, unrelated November Wimbledon date retained, exact date scope and wave labels checked. All 54 source inventory edition rows remain; one synthetic junior addition models publication.
- Hadleigh integration regression: concurrent-change rejection, normal staging/validation/publication, preserved adult IDs and raw placeholder, three before/after audit entries, replay protection and seed consistency.
- TypeScript, public-content, start-clarity, calendar and source-registry checks passed before merge.
- Production verification will check Hadleigh, December Wimbledon, Temple Newsam and San Sebastián, with November Wimbledon and Behobia as unchanged controls. Historical dates use the same public-reader policy because the upcoming list excludes past dates.

