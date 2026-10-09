# Featured road race previews

The AthRecs running section now has 20 editorial race previews at
`/running/featured-races`, each with a dated preview at `/running/previews/:slug`.
The selection covers the UK (5), USA (4), Australia (3), Canada (2),
New Zealand (2), Ireland (2), Spain (1) and Japan (1).

Race information was checked on 30 September 2026. Sources are stored alongside
the editorial records in `src/data/featured-road-races.ts` and linked on each page.
Fourteen named athletes are supported by organiser announcements for six upcoming
editions; eight Instagram handles have matching athlete evidence. Other previews
leave the named field empty. Athlete names link to an official biography or the
relevant race announcement. These are editorial links, not athlete database imports.

Entry status is a dated snapshot. Some organisers have already changed their
entry pages to the following edition (Cardiff and Chicago); the preview explains
that distinction. Sydney's detailed course guide remains labelled 2026. Gold
Coast's 2027 date was checked with its official travel partner because the
organiser's pages rejected requests.

The list removes an edition after its final race day in the race's own timezone.
Existing preview URLs remain available as historical previews and point to
official results. London 2027 remains visible through both 24 and 25 April.
The pages have individual canonicals, article/event metadata and sitemap entries.

## Instagram material

Each upcoming preview provides a portrait 1080 x 1350 PNG and a copyable caption.
The cards use AthRecs colours, exact race information and announced athlete names.
The caption contains the intended public preview URL; Instagram bio or Story
links can direct readers to it. Preview URLs must be published before using
those links in live posts. Entry status and start lists should be refreshed
before posting later in the season. No Instagram post is sent by this feature.

To regenerate the cards with Python/Pillow and DejaVu Sans installed:

```sh
node --experimental-strip-types --input-type=module -e 'import { FEATURED_ROAD_RACES } from "./src/data/featured-road-races.ts"; process.stdout.write(JSON.stringify(FEATURED_ROAD_RACES))' | python3 scripts/generate-featured-race-cards.py
```

No participant/result import, publication gate, crawler schedule, athlete record
or RunRecs source is changed.

## Main integration and regression checks

The 7 October integration retains the current Running landing title, description,
heading and links to `/running/events`, `/running/calendar` and
`/running/race-series`. The featured-races entry is additional. All 20 dated
preview URLs remain available, including completed editions, with their original
metadata and JSON-LD. Sitemap modification dates use the recorded editorial
check dates rather than a build or request date.

`node scripts/verify-featured-road-races.mjs` starts an isolated local application
and checks all 20 previews, cards and date boundaries, the full running-guide SSR
inventory, sitemap coverage, desktop/mobile navigation, country filters, archived
editions and caption copying. It never submits a social post. Optional Google
Fonts are stubbed in the browser test; application resources and errors are checked.
Use `--ssr-only` when a browser is unavailable. `ATHRECS_BROWSER_MODULE` can select
an isolated Playwright installation; the focused workflow uses version 1.56.1,
matching the existing account-navigation workflow, without changing app dependencies.

The focused `Featured road races and running landing` workflow runs these checks
and saves screenshots. The repository-wide `Athrecs quality gate` remains unchanged.
