# Albania running calendar: full 2026 through 2027

Checked on 26 August 2026 in English and Albanian. The catalogue retains confirmed completed races from 1 January 2026 and advertised future fixtures through 31 December 2027. Dates are not inferred from an event's prior annual pattern.

## Confirmed completed 2026 races recovered by the local-language audit

| Date         | Event                                 | Advertised race distances             | Source status                 |
| ------------ | ------------------------------------- | ------------------------------------- | ----------------------------- |
| 5 Apr 2026   | Berat Green Half Marathon             | Half, 10K                             | Registration partner/archive  |
| 26 Apr 2026  | Kukës Half Marathon                   | Half, 10K; junior distance not stated | Official organiser            |
| 5 May 2026   | Martyrs' Day International Trail Half | Trail half, 10K, 5K                   | Albanian Athletics Federation |
| 25 Jul 2026  | Enkelana Night Half Marathon          | Half, 11.5K                           | Official organiser            |
| 8–9 Aug 2026 | Migrant Trail Race — Fushë-Arrëz      | 100K, 60K, 40K, 21K, 11K              | Official route pages          |

The Migrant organiser heads its short course as 10 km but describes and schedules it as 11 km. ATHRECS uses the detailed 11 km measurement and explains the discrepancy in the edition notes.

## Published race dates

| Date           | Event                             | Advertised race distances        | Source status                      |
| -------------- | --------------------------------- | -------------------------------- | ---------------------------------- |
| 5–6 Sep 2026   | Ultra 4 Albania Mountain Race     | 100K, 50K, 25K                   | Official organiser                 |
| 11–19 Sep 2026 | GlobalLimits Peaks of the Balkans | 200K, six stages                 | Official organiser                 |
| 26 Sep 2026    | The Peaks Ultra                   | 62K, 42K                         | Official organiser                 |
| 4 Oct 2026     | Skampa Half Marathon              | Half, 10K, 5K                    | Official organiser                 |
| 4 Oct 2026     | Shkodra Mini Marathon             | 10K, 5K, 2.5K youth              | Official organiser                 |
| 10 Oct 2026    | Race for the Cure Tirana          | 5K run                           | Official charity calendar          |
| 25 Oct 2026    | Vjosa Wild River Ultra Trail      | 100K, 67K, 44K, 26K, 11K         | Official route pages               |
| 25 Oct 2026    | Tirana Marathon                   | Marathon, Half, 10K, 2.3K We Too | Official organiser                 |
| 4 Apr 2027     | Berat Green Half Marathon         | Half, 10K                        | Official organiser                 |
| 24 Jul 2027    | Enkelana Night Half Marathon      | Half, 11.5K                      | Official organiser                 |
| 7–8 Aug 2027   | Migrant Trail Race — Fushë-Arrëz  | 60K, 40K                         | Provisional secondary listing; TBC |
| 4–5 Sep 2027   | Ultra 4 Albania Mountain Race     | 100K, 50K, 25K                   | Official organiser                 |

The Vjosa record was corrected from 24 October to 25 October 2026 after checking each official route page. The organiser labels its Tepelenë course as 26 km, so the earlier 27K catalogue label was also replaced.

## Recurring series monitored without a speculative date

- Vlora Half Marathon — 5K, 10K and half marathon; the fifth edition was held on 30 November 2025.
- Durrës Marathon — 1K, 5K and 10K; the inaugural edition was held on 2 November 2025.

Neither organiser had advertised a 2026 or 2027 edition when checked. The series are retained for discovery and monitoring but have no invented future fixture. VrapLale Night Edition is not catalogued as a 10K because its 2026 page confirms the event but not the race distance.

## Full-year 2026 short-distance totals

- 5K: 4 confirmed races.
- Exact 10K: 6 confirmed races.
- Half marathon or advertised 21K: 7 confirmed races.
- One additional Migrant short course is described inconsistently as 10 km and 11 km and is conservatively stored as 11K.

No 2027 recurrence is created unless an organiser or clearly labelled live calendar has advertised it.

## Reference sources

- [Ultra 4 Albania 2026](https://ultra4charity.com/albania-2026/) and [2027](https://ultra4charity.com/albania-2027/)
- [GlobalLimits Peaks of the Balkans](https://www.global-limits.com/peaks-of-the-balkan)
- [The Peaks Ultra](https://farcorners.tours/albania)
- [Skampa Half Marathon](https://marathonskampa.run/) and [Shkodra Mini Marathon schedule](https://shkodramarathon.com/itinerari?lang=en)
- [Vjosa Wild River route pages](https://vjosarace.al/) and [Tirana Marathon routes](https://www.tiranamarathon.com/itinerari)
- [Berat Green Half Marathon](https://beratgreenhalfmarathon.com/) and [Enkelana Night Half Marathon](https://marathonenkelana.run/)
- [Kukës Half Marathon](https://www.kukeshalfmarathon.com/) and [Martyrs' Day federation report](https://fsha.org.al/maraton-albania/)
- [Migrant Trail Race official routes](https://migranttrailrace.run/)
- [Municipality of Vlorë 2025 race specification](https://vlora.gov.al/thirrje-per-projekt-propozime-aplikim-per-mbeshtetje-per-projekte-artistike-kulturore-17/) and [Durrës 2025 route notice](https://durreslajm.al/oraret-rruget-e-durresit-ku-qarkullimi-do-te-jete-i-bllokuar-diten-e-diel/)
- [Race for the Cure Europe](https://www.raceforthecure.eu/en/Races)
- [Migrant Trail 2027 secondary listing](https://ultraracecalendar.com/events/3927/migrant-trail-race-fushe-arrez/)

## Verification

Run:

```bash
npm run verify:albania-running-calendar
npm run verify:fixture-duplicates
```

The Albania verifier checks 15 event series, 45 distance-specific records, completed-versus-upcoming status, official-entry metadata, the requested date range, full-year short-distance totals, the Vjosa correction, monitored undated series, catalogue publication and same-day calendar-card distance badges.
