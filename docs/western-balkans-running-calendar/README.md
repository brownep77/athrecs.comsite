# Western Balkans running-calendar audit: 2026 through 2027

Checked on 26 August 2026 in English, Albanian, Macedonian, Croatian, Bosnian, Serbian, Montenegrin and Slovenian. This release covers Kosovo, North Macedonia, Croatia, Bosnia and Herzegovina, Serbia, Montenegro and Slovenia.

The audit found that the apparent shortage of 5K, 10K and half-marathon races was mainly a catalogue problem. Several World Athletics road fixtures were stored as `Athletics / Other`, Kosovo used the source label `KOS`, Bosnia and Herzegovina and Montenegro were absent from the country resolver, and most domestic events were published only on local-language federation, timing or organiser calendars.

## Published coverage

| Country                | Series | Race dates | Distance rows |
| ---------------------- | -----: | ---------: | ------------: |
| Kosovo                 |      7 |          7 |            20 |
| North Macedonia        |     16 |         18 |            37 |
| Croatia                |     10 |         12 |            28 |
| Bosnia and Herzegovina |      4 |          6 |            15 |
| Serbia                 |     12 |         13 |            31 |
| Montenegro             |      5 |          8 |            21 |
| Slovenia               |      5 |          7 |            18 |
| **Total**              | **59** |     **71** |       **170** |

Every advertised competitive running distance is a separate catalogue row with `publishAllDistances: true`, so one event card can display all of its distance badges and still respond correctly to distance filters.

The release includes 66 completed 2026 distance rows and 104 confirmed future rows. It does not infer a 2027 date from annual recurrence. The only new 2027 rows are events with an explicitly published date: Sri Chinmoy Marathon Skopje, HalkEco Skopje Run, Mostar Run Weekend, the European Running Championships in Belgrade and Three Hearts Marathon.

## Representative corrections

- Prishtina Marathon now appears under Kosovo as a running event with marathon, half-marathon, 10K and 5K distances; the two former World Athletics `Athletics / Other` records retire to the canonical event.
- Wizz Air Skopje Marathon retains its AIMS marathon row and gains its advertised half-marathon and 5K.
- Zagreb Marathon retains its AIMS marathon row and gains the half-marathon and Garmin 10K.
- Novi Sad Marathon retains its AIMS marathon row and gains 25K, 10K and 5K.
- NLB Ljubljana Marathon retains its marathon row and gains the Saturday 10K and Sunday half-marathon.
- Podgorica Millennium Run and Bokeški Marathon expose all four road distances rather than making Montenegro appear to have only marathon races.
- Bosnia and Herzegovina and Montenegro now resolve to ISO codes `BA` and `ME`, and all seven country filters display their real national flags.

## Principal sources

### Kosovo

- [Prishtina Marathon](https://prishtinamarathon.com/) and [World Athletics date record](https://worldathletics.org/competition/calendar-results/results/7242723)
- [Prishtina Trails](https://prishtinatrails.com/)
- [Peja Trail Run](https://pejatrailrun.org/)
- [High Scardus Ultra](https://highscardusultra.com/)
- [Kosovo in Motion organiser announcement](https://www.koha.net/en/reklama-marketing/behu-pjese-e-gares-vrapuese-kosova-ne-levizje-te-dielen-me-22-mars)

### North Macedonia

- [Macedonian Running League 2026](https://www.mtl.mk/en/races/)
- [trki.mk live race calendar](https://trki.mk/en)
- [Wizz Air Skopje Marathon rules](https://skopskimaraton.com.mk/en/terms-and-conditions/)
- [Sri Chinmoy Marathon Skopje 2027](https://mk.srichinmoyraces.org/scm-skopje)
- [November Run Gevgelija](https://novemberrun.com/en)

The live registration platform moved Če Trčame from the league's earlier 30 August listing to 18 October 2026, so the newer date is used.

### Croatia

- [Split Marathon](https://splitmarathon.com/) and [Split Night Half registration](https://live.splitmarathon.com/event/SNH26/register)
- [Pula Marathon timing page](https://www.utrka.com/utrke/xica/2026/info/)
- [Zagreb Marathon registration](https://www.zagreb-marathon.com/hr/prijave/)
- [Makarska Half Marathon timing page](https://www.utrka.com/utrke/apfelhalf/2026/info/)
- [Ston Wall Marathon tourism calendar](https://visitdubrovnik.hr/hr/kalendar-dogadanja/ston-wall-marathon/)

### Bosnia and Herzegovina

- [Mostar Run](https://mostar.run/en/)
- [Vučko Trail official information](https://vuckotrail.ba/informations/)
- [NGO Marathon Sarajevo](https://sarajevomarathon.ba/en)
- [Banja Luka Marathon](https://banjalukamaraton.com/)

### Serbia

- [Novi Sad Half Marathon](https://www.marathon.org.rs/polumaraton/) and [Novi Sad Marathon](https://www.marathon.org.rs/en/marathon/)
- [Serbian-language race calendar](https://trkesrbija.rs/)
- [World Athletics Belgrade 10K record](https://worldathletics.org/competition/calendar-results/results/7244711)
- [European Running Championships Belgrade 2027](https://www.erch2027.com/course/)

### Montenegro

- [One Run Montenegro](https://onerunmontenegro.com/)
- [Durmitor Trail](https://www.durmitortrail.run/en/raceinfo)
- [Bjelasica Trail](https://bjelasicatrail.me/)
- [Podgorica Millennium Run](https://www.podgorica.run/)
- [Bokeški Marathon registration](https://www.3hn.live/event/BM26/register)

### Slovenia

- [Istrian Marathon programme](https://istrski-maraton.si/en/useful-informations/program/)
- [Three Hearts Marathon](https://www.maraton-radenci.si/en/) and [2027 companion-distance listing](https://races.runna.com/events/three-hearts-marathon-4edf)
- [Bovec Marathon calendar entry](https://tekaski-koledar.si/en/races/2026/r000200-blitz-bovec-maraton-2026/)
- [Konjice Marathon](https://konjiskimaraton.si/en/about-marathon/)
- [NLB Ljubljana Marathon schedule](https://ljubljanskimaraton.si/en/schedule)

## Verification

```bash
npm run verify:western-balkans-running-calendar
npm run verify:fixture-duplicates
npm run verify:catalogue
npm run verify:catalogue-publishing
```

The regional verifier checks the seven country codes and flags, exact series/date/row totals, distance-aware same-day publication, completed-versus-future status, explicit 2027 evidence, canonical World Athletics aliases and persistent seed advancement.
