# UK and Ireland half-marathon and 10-mile daily follow-up

Checked through 30 August 2026 for the catalogue horizon ending 31 December 2027.

## Published coverage

- Added 54 officially verified series: 44 half marathons and 10 ten-mile races across England, Scotland, Wales and Ireland.
- Added 13 verified 2027 editions to existing canonical cards rather than creating duplicate race series.
- Used organiser, club or direct-registration pages for every published date and entry route.
- Preserved Cambridge as `TBC` without a checkout because the organiser has announced the date but has not opened general entry.
- The latest scan added official 2027 dates for the Due North trail-half series while withholding entry links until its announced 5 September 2026 opening.

## Duplicate controls

The verifier rejects duplicate slugs, duplicate names after year/punctuation normalization, duplicate `seriesSlug|date` editions, catalogue rows dropped by the merge, stale source checks and held candidates leaking into the public catalogue.

Events already represented elsewhere were not recreated. This includes Beverley Half Marathon, Clontarf Half Marathon, Run Tatton, Hampton Court Palace, Richmond Park, Windsor Trail, Carsington Water and Running GP Goodwood; verified dates were attached to their canonical cards.

## Held candidates

The research queue holds permit-pending Temple Newsam, Ripon, Thirsk, Chippenham and Abbeyknockmoy races; date-conflicted Salisbury, Achill, Carsington Water, Battersea Park and Othnesbery's Revenge races; governing-status-pending Fastlane Summer; entry-state-conflicted Tarpley 10/20; and the World Half Marathon Festival, whose 2027 weekend conflicts with stale years in its ticket headings. Challenge-walk candidate Corvedale remains held pending confirmation that it is a timed running race. Lundy Island, Winter Wipeout and CBTE Charm Bracelet remain outside the canonical half catalogue because their official distances are non-standard or approximate.

## 29 August 2026 scan

Six verified 2027 half-marathon cards were added from direct official SiEntries pages: Wolf Moon Trail, Great North West, Hameldown Hammer, Merthyr, SilverBackTrails Oswiu's Revenge and CBTE Morland. Each uses the direct event checkout while retaining its public event page as source provenance.

The existing Women Can Marathon card was enriched with its official half-marathon and 10K distances and a same-day 2027 half-marathon edition, rather than creating a duplicate card. Winter Wipeout remains held because the organiser describes the distance as a half marathon "ish"; CBTE Charm Bracelet remains held from the canonical-half queue because the official route is 14.35 miles.

## 30 August 2026 scan

Burnsall Trail Half on 17 April 2027 and Kettlewell Trail Half on 19 June 2027 were added as new verified cards. The 4 September 2027 Malham Trail Half was attached to the established Malham Half Marathon & 10K card. All three official pages confirm a 10:00 start and state that entry opens on 5 September 2026, so the catalogue records the dates as `TBC` without premature checkout links.

Othnesbery's Revenge remains held because its 2027 entry page still labels the edition `MMXXVI`. Lundy Island remains held from the canonical-half catalogue because the official route is 13.5 miles. Abbeyknockmoy remains held while its Athletics Ireland permit is pending.

Run `npm run verify:uk-ireland-half-ten-mile-daily` to validate the release.
