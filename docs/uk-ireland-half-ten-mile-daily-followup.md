# UK and Ireland half-marathon and 10-mile daily follow-up

Checked through 27 August 2026 for the catalogue horizon ending 31 December 2027.

## Published coverage

- Added 45 officially verified series: 35 half marathons and 10 ten-mile races across England, Scotland, Wales and Ireland.
- Added 11 verified 2027 editions to existing canonical cards rather than creating duplicate race series.
- Used organiser, club or direct-registration pages for every published date and entry route.
- Preserved Cambridge as `TBC` without a checkout because the organiser has announced the date but has not opened general entry.
- The latest scan added Eyam Half Marathon on 16 May 2027 and enriched the existing Beverley Half Marathon card with its 22 August 2027 edition.

## Duplicate controls

The verifier rejects duplicate slugs, duplicate names after year/punctuation normalization, duplicate `seriesSlug|date` editions, catalogue rows dropped by the merge, stale source checks and held candidates leaking into the public catalogue.

Events already represented elsewhere were not recreated. This includes Beverley Half Marathon, Clontarf Half Marathon, Run Tatton, Hampton Court Palace, Richmond Park, Windsor Trail, Carsington Water and Running GP Goodwood; verified dates were attached to their canonical cards.

## Held candidates

The research queue holds permit-pending Ripon, Thirsk and Chippenham 10-mile races; date-conflicted Salisbury, Achill, Carsington Water and Battersea Park races; governing-status-pending Fastlane Summer; entry-state-conflicted Tarpley 10/20; and the World Half Marathon Festival, whose 2027 weekend conflicts with stale years in its ticket headings. Challenge-walk candidate Corvedale remains held pending confirmation that it is a timed running race.

Run `npm run verify:uk-ireland-half-ten-mile-daily` to validate the release.
