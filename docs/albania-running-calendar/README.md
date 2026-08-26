# Albania running calendar through 2027

Checked on 26 August 2026. The active calendar covers advertised Albanian running fixtures from the check date through 31 December 2027. Dates are not inferred from an event's prior annual pattern.

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

No 2027 recurrence is created unless an organiser or clearly labelled live calendar has advertised it. Past-only 2026 races and undated junior/fun runs are therefore not added to the active future calendar.

## Reference sources

- [Ultra 4 Albania 2026](https://ultra4charity.com/albania-2026/) and [2027](https://ultra4charity.com/albania-2027/)
- [GlobalLimits Peaks of the Balkans](https://www.global-limits.com/peaks-of-the-balkan)
- [The Peaks Ultra](https://farcorners.tours/albania)
- [Skampa Half Marathon](https://marathonskampa.run/) and [Shkodra Mini Marathon schedule](https://shkodramarathon.com/itinerari?lang=en)
- [Vjosa Wild River route pages](https://vjosarace.al/) and [Tirana Marathon routes](https://www.tiranamarathon.com/itinerari)
- [Berat Green Half Marathon](https://beratgreenhalfmarathon.com/) and [Enkelana Night Half Marathon](https://marathonenkelana.run/)
- [Race for the Cure Europe](https://www.raceforthecure.eu/en/Races)
- [Migrant Trail 2027 secondary listing](https://ultraracecalendar.com/events/3927/migrant-trail-race-fushe-arrez/)

## Verification

Run:

```bash
npm run verify:albania-running-calendar
npm run verify:fixture-duplicates
```

The Albania verifier checks the 11 event series, all 31 distance-specific records, official-entry metadata, the date horizon, the Vjosa correction, catalogue publication and same-day calendar-card distance badges.
