# UK October duplicate continuation — 26 October 2026

**Publication authorised by the owner on 26 October 2026.** The seven corrections passed local checks, and the final read-only production check confirmed the selected identities, dates, distances and stored starts were unchanged. Release uses the existing GitHub-to-Vercel deployment process.

Continue the owner's request to retain the complete programme when the same race appears twice. This review covers **1–31 October 2026**, UK running fixtures, excluding parkrun. The live read-only inventory contained **544 UK events and 775 dated distance rows**. Matching also included the 1,194 global October running-event identities, so a different country label did not prevent comparison.

After excluding the previously reviewed date-specific duplicates, broad name, token-subset and specific-source comparisons produced 65 candidate pairs. These are screening matches, not 65 confirmed duplicates. A separate database check found no repeated event/date/distance-code keys in the UK October scope.

## Seven additional corrections

The shared publication filter suppresses seven redundant event/date listings, containing eight distance rows. Every suppressed distance remains on its retained programme. No database records, results, registrations, entry options or other dependants are deleted or moved. Only the reviewed October date is affected; other dates remain unchanged.

| Date | Suppressed event | Retained event | Distances retained | Opened source |
| --- | --- | --- | --- | --- |
| 4 Oct | `ea-runevents-iow-marathon-cowes` | `isle-of-wight-marathon` | Marathon | [Organiser's 2026 results archive](https://rydeharriers.eventrac.co.uk/e/the-isle-of-wight-marathon-10323/results) |
| 11 Oct | `alcester-autumn-10k` | `alcester-10k` | 10K | [Organiser](https://www.alcester10k.com/) |
| 17 Oct | `great-south-run-5k` | `aj-bell-great-south-5k-2026` | 5K | [Dated organiser briefing](https://www.greatrun.org/news/what-to-expect-this-weekend-at-the-great-south-run/) |
| 18 Oct | `blickling-half-marathon-autumn` | `autumn-blickling-half` | Half marathon | [Organiser-linked 2026 results](https://totalracetiming.co.uk/raceresults/669) |
| 25 Oct | `fleet-10k-5k` | `fleet-10k5k-peter-driver-memorial` | 5K and 10K | [Organiser](https://fleet10k.co.uk/) |
| 25 Oct | `ea-runevents-runthrough-haltemprice-10k-nr-hull` | `haltemprice-10k` | 10K | [Organiser's dated programme](https://www.runthrough.co.uk/event/haltemprice-10k-october-2026) |
| 28 Oct | `evensplits-leeds-5k-series-2026` | `leeds-5k-series-august` | 5K | [Authorised October entry](https://racebest.com/races/xt975) |

Live event IDs, source URLs, original distance codes and checked date are stored in the seven appended review records. Isle of Wight's stored 42.2/42.195 km values are the same marathon with five metres of rounding difference. All other suppressed distances match the retained stored distances exactly.

## Starts and source qualifications

- Alcester: organiser confirms 11 October 2026, 10K, 10:00.
- Great South 5K: the organiser's 13 October briefing identifies the Saturday race at 09:00 and the separate Sunday ten-mile race. The current generic race page has advanced to 2027; it was not used as proof of the 2026 date. Saturday event guide was opened but its embedded flippingbook had no readable text.
- Blickling: [the organiser](https://epicnorfolk.com/autumn-blickling-half-marathon/) explicitly links the 2026 results used above. Those results record 18 October 2026 at 09:00. [Race-day instructions](https://epicnorfolk.com/autumn-blickling-half-marathon-race-information/) independently give 09:00. The retained record previously had no start, while the duplicate stored 08:00. Only the reviewed 2026 retained edition receives 09:00.
- Fleet: both organiser-listed distances start at 09:30; both are retained together.
- Haltemprice: the exact-edition organiser page confirms 25 October and 09:00. Its results page status also identifies that date.
- Leeds: [organiser calendar and FAQ](https://evensplits.events/leeds5k) and RaceBest both identify 28 October 2026 at the Brownlee Centre. RaceBest explicitly confirms 5 km and 19:30. The organiser's linked participant-instructions PDF points to a **2024** file and returned 403; it is not evidence for a different 2026 clock. No later wave is advertised in the opened October entry. Reconfirm on race day, 28 October, through the existing start-time process; no new automation is created. The retained October display name is corrected from its legacy August slug to “Leeds 5K Series — October”.
- Isle of Wight: date, marathon distance and Cowes identity are confirmed. Historical time remains conflicting: the indexed 2026 entry description says 11:00, while the opened organiser results archive lists 10:00; the current entry page has advanced to 2027. The retained 2026 start is explicitly unconfirmed, without guessing a timezone conversion. Stored source values remain intact. The organiser website and linked results page timed out. Further resolution requires its 2026 race-day instructions.

The edition-specific projection confirms seven distance starts across six programmes and withholds the conflicting Isle of Wight start. No start is copied to a different date.

## Held and distinct cases

- Dorney, 3 October: current organiser URL returned no readable programme; the indexed alternate host was inaccessible. Leave its possible duplicate unchanged until all three distances and starts can be checked from accessible primary evidence.
- Polesden Lacey, 25 October: the current National Trust page now lists November/December only and calls it an informal run. Do not infer the precise October edition from recurrence or consolidate it in this pass.
- Roundhay, 4 October: earlier organiser-versus-stored programme conflict still requires distance repair.
- Maverick South Downs: 21K and half-marathon distance codes need source comparison before equivalence is assumed.
- Victoria Park, Run Kent/Tonbridge, Bath–Bristol, Heaton Park, Leicester, Kielder, Windsor Dorney and Yorkshire: complementary distances must not be lost by suppressing an entire event/date. Programme consolidation needs a fuller review.
- Cardiff, Chester, Jarrow, Epping, Illuminator and Delamere: federation/timing placeholders need comparison with complete programmes before suppression.
- Great South: junior, 5K and ten-mile races are distinct. A legacy ten-mile row dated 17 October is a separate date-correction lead; it is not removed as a 5K duplicate.
- Cross-country leagues and regional relays at different venues, different countries with similar names, Atlantic Coast formats and separate UK Ultra distances remain separate.

## Verification

- Compared the exact live event IDs, dates and distance values for all seven pairs before release.
- Checked shared date-filter suppression and retained-programme visibility, all eight retained distance rows, unchanged unrelated dates and idempotent filtering.
- Checked reviewed starts, including the explicit Isle of Wight conflict and the October Leeds display name.
- Ran TypeScript, public-catalogue and calendar verification. No database migration is needed for this reversible publication review.

This pass adds no new fixtures and does not claim that every possible October alias or programme conflict has been resolved.
