# UK and Ireland half-marathon and 10-mile daily follow-up

Checked on 22 August 2026 for the catalogue horizon ending 31 December 2027.

## Published coverage

- Added seven officially dated half-marathon series in England, Scotland and Wales.
- Added eight officially dated 10-mile series in England, covering road, motor-circuit and trail surfaces.
- Used organiser, club or direct-registration pages for every published date and entry route.
- Preserved Cambridge as `TBC` without a checkout because the organiser has announced the date but has not opened general entry.

## Duplicate controls

The verifier rejects duplicate slugs, duplicate names after year/punctuation normalization, duplicate `seriesSlug|date` editions, catalogue rows dropped by the merge, stale source checks and held candidates leaking into the public catalogue.

Events already represented elsewhere were not recreated. This includes ATW St Albans, Great Manchester Run, Liverpool Half Marathon & 10 Miler, Great South Run, Derby 10 Mile, M10 Swansea and the Victoria Park July 2027 card.

## Held candidates

Chippenham Spring 10 Mile 2027 remains unpublished because its organiser page still shows the race permit as TBC. The existing Ireland research queues continue to hold Nenagh, Cork City, Waterford Viking, Kinsale and RunClare until their permit status clears.

Run `npm run verify:uk-ireland-half-ten-mile-daily` to validate the release.
