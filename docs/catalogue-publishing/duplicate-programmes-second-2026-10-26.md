# Fixture duplicates: second pass, 26 October 2026

Continues the owner-authorised duplicate cleanup across the fixtures from October 2026 onwards. This batch suppresses **14 additional event/date listings (15 distance rows)** in favour of **12 retained event/date programmes**. It adds no race editions and performs no database deletion or identity merge. The previous 20 suppressions remain unchanged; the two batches total 34.

Baseline: production catalogue read on 26 October 2026; source revision `8027227db32c0c1207f11e71d1d3f5b2397d7c70`. The second pass began from the prior 6,088-event, 11,866-edition inventory and refreshed the 27 candidate event identities before editing. Original events, dependants, source URLs and other dates remain in storage. Shared exact-date publication rules apply to database and seed-backed views.

## Confirmed duplicate decisions

| Date | Suppressed event (ID) | Retained event (ID) | Retained distances | Opened evidence |
| --- | --- | --- | --- | --- |
| 2026-10-28 | `leeds-5k-series-august` (3060734) | `evensplits-leeds-5k-series-2026` (3059589) | 5K | [Programme](https://racebest.com/races/xt975) |
| 2026-11-25 | `leeds-5k-series-august` (3060734) | `evensplits-leeds-5k-series-2026` (3059589) | 5K | [Programme](https://racebest.com/races/64t79) |
| 2026-11-01 | `leigh-on-sea-striders-10k` (4375864) | `ea-runevents-leigh-on-sea-10k-leigh-on-sea` (3148012) | 10K, 5K | [Programme](https://www.entrycentral.com/Leigh10k) |
| 2026-11-15 | `tweed-valley-forest-ultra-trail` (3061582) | `rb-tweed-valley-ultra` (3061782) | Ultra | [Programme](https://www.highterrainevents.co.uk/tweed-valley-ultra) |
| 2026-12-27 | `pednor-10` (3060983) | `ea-runevents-pednor-10-and-pednor-relay-chesham` (3148044) | 10mi | [Programme](https://www.chilternharriers.com/pednor-10.html) |
| 2026-11-08 | `athens-classic-marathon` (3059917) | `athens-authentic-marathon` (4077462) | Marathon | [Programme](https://www.athensauthenticmarathon.gr/en/c/agones-2-26/authentic-marathon-1/marathonios-dromos-33) |
| 2026-10-17 | `baltimore-marathon` (4338272) | `baltimore-running-festival-marathon` (3580924) | Marathon | [Programme](https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Marathon) |
| 2026-10-18 | `blickling-half-marathon-autumn` (3060028) | `autumn-blickling-half` (5) | Half | [Programme](https://epicnorfolk.com/autumn-blickling-half-marathon/) |
| 2026-10-25 | `ea-runevents-runthrough-haltemprice-10k-nr-hull` (3148007) | `haltemprice-10k` (3060526) | 10K | [Programme](https://www.runthrough.co.uk/event/haltemprice-10k-october-2026) |
| 2027-05-08 | `helsinki-city-run-marathon` (3066313) | `saucony-helsinki-city-marathon` (4059579) | Marathon | [Programme](https://helsinkicityrun.fi/en/helsinkicitymarathon/) |
| 2027-05-08 | `valio-helsinki-city-run` (3669011) | `saucony-helsinki-city-marathon` (4059579) | Marathon | [Programme](https://helsinkicityrun.fi/en/helsinkicitymarathon/) |
| 2027-05-30 | `ottawa-international-marathon` (3642558) | `tamarack-ottawa-international-marathon` (3899157) | Marathon | [Programme](https://www.runottawa.ca/races-and-events/ottawa-marathon/) |
| 2026-11-22 | `tulsa-route-66-marathon` (4338283) | `williams-route-66-marathon` (3836976) | Marathon | [Programme](https://organizations.hakuapp.com/sites/organization_sites/4e4a1babfb986f62bd16/pages/get_involved) |
| 2027-05-30 | `ottawa-marathon` (3066385) | `tamarack-ottawa-international-marathon` (3899157) | Marathon | [Programme](https://www.runottawa.ca/races-and-events/ottawa-marathon/) |

Each suppressed distance has an equivalent on the retained date, with kilometre rounding differences no greater than five metres. Decisions and identity qualifications are recorded in `fixture-duplicate-reviews-second-2026-10-26.json`. This is manual source confirmation after candidate screening, not fuzzy automatic consolidation.

## Start preservation and previous values

All 13 retained distance options across 12 dates have a reviewed local start. Exact-date overrides preserve raw values and do not carry starts into another year. Wave labels remain explicit in fixtures and calendar exports.

| Retained event/date | Previous stored starts | Reviewed local starts |
| --- | --- | --- |
| `evensplits-leeds-5k-series-2026|2026-10-28` | 5K 19:30 | 5K 19:30 (Europe/London) |
| `evensplits-leeds-5k-series-2026|2026-11-25` | 5K 19:30 | 5K 19:30 (Europe/London) |
| `ea-runevents-leigh-on-sea-10k-leigh-on-sea|2026-11-01` | 10K 18:00; 5K 18:00 | 10K 18:00; 5K 18:00 (Europe/London) |
| `rb-tweed-valley-ultra|2026-11-15` | Ultra 08:00 | Ultra 08:00 (Europe/London) |
| `ea-runevents-pednor-10-and-pednor-relay-chesham|2026-12-27` | 10mi 10:00 | 10mi 10:00 (Europe/London) |
| `athens-authentic-marathon|2026-11-08` | Marathon 08:30 | Marathon First wave 08:30 EET · later blocks follow (Europe/Athens) |
| `baltimore-running-festival-marathon|2026-10-17` | Marathon blank | Marathon 08:00 (America/New_York) |
| `autumn-blickling-half|2026-10-18` | Half blank | Half 09:00 (Europe/London) |
| `haltemprice-10k|2026-10-25` | 10K 09:00 | 10K 09:00 (Europe/London) |
| `saucony-helsinki-city-marathon|2027-05-08` | Marathon blank | Marathon First wave 09:30 EEST · second wave 09:40 (Europe/Helsinki) |
| `tamarack-ottawa-international-marathon|2027-05-30` | Marathon blank | Marathon 07:00 (America/Toronto) |
| `williams-route-66-marathon|2026-11-22` | Marathon blank | Marathon 08:00 (America/Chicago) |

- Leeds: opened the organiser series page and separate October/November RaceBest entry programmes; both confirm 19:30. The monthly programme alone was not used to infer the clocks.
- Leigh: organiser site returned HTTP 403. Its authorised EntryCentral programme resolves the earlier uncertainty: 1 November, 18:00, open 5K/10K and junior 5K entry. Retain the combined stored distances without inventing separate junior records.
- Pednor: the old organiser domain was unavailable; the current [Chiltern Harriers page](https://www.chilternharriers.com/pednor-10.html) explicitly confirms 27 December 2026, 10:00 and 10 miles. Its solo and relay are distinct formats. The old 2025 instructions notice is not used as current timetable evidence.
- Blickling: the organiser page has rolled forward to 17 October 2027 but explicitly links [2026 results, event 669](https://totalracetiming.co.uk/raceresults/669), which confirms 18 October 2026 at 09:00. This corrects the duplicate’s 08:00 without changing any result or participant data.
- Helsinki: the [organiser home page](https://helsinkicityrun.fi/en/) identifies Valio as the whole 7–8 May 2027 weekend. Only the duplicated marathon rows are suppressed; the distinct half, relay, 5K and double are not combined. The specific marathon page publishes 09:30/09:40 waves.
- Tulsa: opened organiser distances, race-weekend, FAQ and get-involved pages. The [2026 weekend page](https://organizations.hakuapp.com/sites/organization_sites/4e4a1babfb986f62bd16/pages/race_weekend5) confirms 20–21 November expo dates and says the 2026 participant guide is in preparation; the [organiser announcement](https://organizations.hakuapp.com/sites/organization_sites/4e4a1babfb986f62bd16/pages/get_involved) gives marathon Sunday 22 November, and [FAQ](https://organizations.hakuapp.com/sites/organization_sites/4e4a1babfb986f62bd16/pages/faqs) gives 08:00. The separate schedule page is presently empty; the 2025 guide is not used.

## Unresolved or separate programmes

- Tweed Valley: only the identical 50K records are consolidated. The organiser current header advertises 67K whereas older body copy says 65K. Neither longer option is in these stored records; adding or correcting that separate route requires its own programme review.
- London MoRun and London Riverside MoRun are separate venues/programmes. Official Riverside information gives 29 November rather than the stored 8 November and lists half/10K/junior options; this is a date/distance correction follow-up, not evidence to merge it with Richmond Park on 8 November. Both identities remain intact.
- Hadleigh, Wimbledon, Roundhay and November Nightmare remain held for the conflicting programme issues documented in the first-pass audit. Same-city races, separate age/sex championships and different districts are not merged.
- This batch does not certify the remaining catalogue or clear the wider start-review queue. Confirmed starts remain subject to the existing seven-day/two-day recheck process. No additional automation or organiser message is created.

## Validation

- Passed: compared all 14 decisions against the fresh production snapshot: exact event IDs/dates, complete distance coverage and equivalent kilometre values.
- The production before-check found an additional Ottawa directory record beyond the initial candidate pairs; it was refreshed and included before publication.
- Passed: the shared date-review filter suppresses duplicate keys only, retains every canonical key and preserves unrelated years/dates.
- Passed: exact-date starts and labels, unrelated-date fallbacks, 34 original edition rows retained, wave-safe calendar behavior, TypeScript, public-catalogue, start-clarity, calendar and source-registry verification.
- Verify the deployed production fixtures for all nine upcoming affected search/month combinations, including both Leeds months, Leigh, Athens, Tweed, Tulsa, Pednor, Helsinki and Ottawa. Historical October dates are checked through the shared policy and source evidence because the upcoming list excludes past races.
