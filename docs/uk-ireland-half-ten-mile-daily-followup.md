# UK and Ireland half-marathon and 10-mile daily follow-up

Checked through 8 September 2026 for the catalogue horizon ending 31 December 2027.

## Published coverage

- Added 59 officially verified series: 48 half marathons and 11 ten-mile races across England, Scotland, Wales and Ireland.
- Added 16 verified editions to existing canonical cards rather than creating duplicate race series.
- Used organiser, club or direct-registration pages for every published date and entry route.
- Preserved Cambridge as `TBC` without a checkout because the organiser has announced the date but has not opened general entry.
- Burnsall, Kettlewell and Malham now use the live official Due North series checkout.

## Duplicate controls

The verifier rejects duplicate slugs, duplicate names after year/punctuation normalization, duplicate `seriesSlug|date` editions, catalogue rows dropped by the merge, stale source checks and held candidates leaking into the public catalogue.

Events already represented elsewhere were not recreated. This includes Beverley Half Marathon, Clontarf Half Marathon, Run Tatton, Hampton Court Palace, Richmond Park, Windsor Trail, Carsington Water and Running GP Goodwood; verified dates were attached to their canonical cards.

## Held candidates

The research queue holds permit-pending Temple Newsam, Ripon, Thirsk, Clowne, Chippenham, Borrowdale, Abbeyknockmoy, Kinsale and RunClare races, plus the provisional Tom Scott 10; date- or timetable-conflicted Salisbury, Achill, Carsington Water, Battersea Park, Othnesbery's Revenge and Delphi races; governing-status-pending Fastlane Summer; entry-state-conflicted Tarpley 10/20; and the World Half Marathon Festival, whose 2027 weekend conflicts with stale years in its ticket headings. Challenge-walk candidate Corvedale remains held pending confirmation that it is a timed running race. Lundy Island, Winter Wipeout and CBTE Charm Bracelet remain outside the canonical half catalogue because their official distances are non-standard or approximate.

## 29 August 2026 scan

Six verified 2027 half-marathon cards were added from direct official SiEntries pages: Wolf Moon Trail, Great North West, Hameldown Hammer, Merthyr, SilverBackTrails Oswiu's Revenge and CBTE Morland. Each uses the direct event checkout while retaining its public event page as source provenance.

The existing Women Can Marathon card was enriched with its official half-marathon and 10K distances and a same-day 2027 half-marathon edition, rather than creating a duplicate card. Winter Wipeout remains held because the organiser describes the distance as a half marathon "ish"; CBTE Charm Bracelet remains held from the canonical-half queue because the official route is 14.35 miles.

## 30 August 2026 scan

Burnsall Trail Half on 17 April 2027 and Kettlewell Trail Half on 19 June 2027 were added as new verified cards. The 4 September 2027 Malham Trail Half was attached to the established Malham Half Marathon & 10K card. All three official pages confirm a 10:00 start and state that entry opens on 5 September 2026, so the catalogue records the dates as `TBC` without premature checkout links.

Othnesbery's Revenge remains held because its 2027 entry page still labels the edition `MMXXVI`. Lundy Island remains held from the canonical-half catalogue because the official route is 13.5 miles. Abbeyknockmoy remains held while its Athletics Ireland permit is pending.

## 31 August to 4 September 2026 scans

Tiree 10K & Half Marathon, Kinvara Rock and Road and Cape Clear Island Races were added from their direct official registration pages. The existing Scurry Around Vogrie card was enriched with its 17 January 2027 half-marathon edition and complete multi-distance programme. Cape Clear initially withheld its checkout until the announced 18:00 opening on 4 September.

Borrowdale Trail Half remains held while its Trail Running Association licence is pending. Delphi Half Marathon & 10K remains held because its official page gives conflicting half-marathon start times.

## 5 September 2026 scan

Beacon Beast Marathon & The Beastly Half was added for 25 April 2027 as one canonical multi-distance card with direct event-specific entry. The official SiEntries page consistently confirms the date, programme and open registration.

Hardmoors 26.2 Farndale was attached to its established card for 8 August 2027, retaining the marathon, half-marathon and 10K programme. The race date and 10:00 half start are verified; entry remains withheld because the official page's voucher and public-opening schedule is not yet internally consistent.

Cape Clear's entry is now open and uses its direct event-specific checkout. Burnsall and Kettlewell also moved from `TBC` to open via the official Due North series checkout. Malham remains `TBC` until its separately advertised 12:00 opening. The existing Collingbourne card now uses its current official 08:30 start and event-specific SiEntries checkout rather than its stale 07:30 record.

## 6 September 2026 scan

The official Sue Ryder organiser page and RaceBest checkout consistently confirm the Bronte Half Marathon and 10K on 20 September 2026 at 09:00. The verified edition and both distances were attached to the existing Bronte card, with the direct entry URL, rather than creating a duplicate series.

Malham's announced entry time has passed and its official page now shows open registration, so its existing 4 September 2027 edition uses the Due North series checkout. Clowne Half remained unpublished because its licence was still `TBC`; Tadcaster was held for the placeholder licence shown at that check and rechecked below.

## 7 September 2026 scan

RaceBest now publishes UKA licence `2026-28391` for Tadcaster 10, replacing the placeholder shown in the previous scan. The verified 22 November 2026 road race was moved from the research queue into the public catalogue with its 09:30 start and direct official checkout. Clowne, Temple Newsam, Ripon and Thirsk remain held while their licences are still TBC or pending.

## 8 September 2026 scan

No additional race cleared the publication threshold. Kinsale 10 Mile was queued with its official 28 February 2027 date and 10:30 start because its Athletics Ireland permit is pending. The RunClare series' 10-mile finale was queued for 11 April 2027 because its permit is pending and its race name and venue remain unannounced.

Scottish Athletics lists the Tom Scott 10 Mile on 28 March 2027 in its official 2026–27 road-running handbook, but the organiser still describes the date as provisional and subject to securing the required licence, so the edition remains unpublished. All previously held candidates were rechecked; none resolved its permit, date, timetable, distance or entry-state conflict.

Run `npm run verify:uk-ireland-half-ten-mile-daily` to validate the release.
