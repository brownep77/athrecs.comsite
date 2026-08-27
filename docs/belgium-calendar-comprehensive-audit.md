# Belgium running calendar — comprehensive audit

Checked: **27 August 2026**

This release supersedes the earlier sample-scale Belgium coverage. It adds or corrects **151 race series** and **415 distance-specific edition rows**. Together with the retained non-overlapping Belgium data in `belgium-netherlands-races.ts`, the catalogue target is **178 Belgian series and 496 rows**, compared with 33 series and 97 rows before this audit.

## Scope

Included:
- Public running races with an exact published date and at least one adult/open running distance.
- Road, trail, mixed-terrain, park, relay, half-marathon, marathon and ultra formats.
- Confirmed 2025, 2026 and 2027 editions where a published date exists.
- Every separately advertised same-day distance, using `publishAllDistances: true`.

Excluded:
- Walking-only and youth-only programmes.
- Cycling, triathlon and non-running disciplines.
- Listings that publish only a month or season.
- Conflicting exact dates that could not be resolved from stronger evidence.
- A future Brussels Airport Marathon edition until the organiser publishes a date.

## Source boundary

The audit reconciles:
- Official race and organiser sites, Belgian municipalities and tourism bodies.
- Golazo / Running Tour organiser calendars.
- Challenge Delhalle’s full 14-event 2026 programme.
- Atletiek Vlaanderen, LBFA / World Athletics and recognised federation records.
- Loopkalender, Go Dare and Finishers as discovery/cross-check calendars, with calendar-only entries deliberately receiving no verified official entry link.

Source tiers in this file:
- Official: **51 series**
- Federation: **4 series**
- Calendar cross-check: **96 series**

## Regional coverage

| Belgian region/province | Series |
|---|---:|
| Antwerp | 23 |
| Brussels-Capital | 5 |
| East Flanders | 32 |
| Flemish Brabant | 15 |
| Hainaut | 7 |
| Limburg | 14 |
| Liège | 10 |
| Luxembourg | 9 |
| Namur | 7 |
| Walloon Brabant | 2 |
| West Flanders | 27 |

## Key corrections

- Added the **Brussels Airport Marathon** series with its confirmed 2 November 2025 programme: 7K, half marathon and marathon. No later date is guessed.
- Added the confirmed **20 km de Bruxelles** edition for 30 May 2027.
- Corrected **Dwars door Mechelen** to 6K, 10K and half marathon.
- Restored the **full marathon at Arlon**.
- Corrected **Trail Knokke-Heist** from 25K to 24K.
- Corrected **Genk Loopt** from 10 miles to 16K.
- Corrected the **Antwerp 10 Miles weekend** short race from 5 miles to 6K.
- Corrected **Nationaal Park Marathon** so all four running distances sit on Sunday 1 March; Saturday is walking-only.
- Added the complete 14-event **Challenge Delhalle** calendar.

## Deliberately withheld pending stronger confirmation

- Le Bortolin Marathon de Hesbaye 2026: source dates conflict.
- Trail des 600 Boitheux 2026: exact date was not confirmed by an organiser source.
- Trail Meyboom Brussels 2026: sources agree only on “early September”; no organiser-confirmed exact day was found.

## Regression protection

`npm run verify:belgium-comprehensive` checks:
- locked series and row counts;
- duplicate slugs, names and distance rows;
- valid dates, distances and HTTPS evidence;
- all Belgian regions represented in the audit;
- Brussels Marathon and 20 km de Bruxelles presence;
- Mechelen, Arlon, Knokke, Genk, Antwerp and Nationaal Park corrections.

The quality gate runs this verifier before merge.
