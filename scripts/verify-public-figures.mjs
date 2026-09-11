import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  publicFigureAthletes,
  publicFigureEditions,
  publicFigureResults,
  publicFigureSeries,
} from "../src/data/public-figures.ts";

const expectedProfiles = [
  "keely-hodgkinson",
  "noah-lyles",
  "dina-asher-smith",
  "josh-kerr",
  "rhasidat-adeleke",
  "femke-broeders-bol",
  "rich-roll",
  "harry-styles",
  "gordon-ramsay",
  "kevin-hart",
  "colin-farrell",
  "jennifer-connelly",
  "arjen-robben",
  "kaka",
  "raul-gonzalez",
  "luis-enrique",
  "john-terry",
  "michael-owen",
  "ryan-reynolds",
  "ashton-kutcher",
  "alicia-keys",
  "natalie-dormer",
  "pavel-nedved",
  "leonardo-bonucci",
  "jack-wilshere",
  "edwin-van-der-sar",
  "christian-dailly",
  "danny-mills",
  "oprah-winfrey",
  "will-ferrell",
  "edward-norton",
  "george-w-bush",
  "katie-holmes",
  "adele-roberts",
  "pippa-middleton",
  "casey-neistat",
  "aaron-ramsey",
  "tony-adams",
  "lee-grant",
  "darren-randolph",
  "kevin-kilbane",
  "muzzy-izzet",
  "dwight-yorke",
  "gary-speed",
  "sebastian-vettel",
  "cynthia-erivo",
  "alastair-cook",
  "harry-judd",
  "alexandra-burke",
  "james-norton",
  "jack-oconnell",
  "joe-wicks",
  "laura-kenny",
  "ben-ainslie",
  "ap-mccoy",
  "tilly-ramsay",
  "romesh-ranganathan",
  "jonny-lee-miller",
  "amanda-holden",
  "pamela-anderson",
  "flea",
  "mario-lopez",
  "christy-turlington",
  "jenson-button",
  "james-cracknell",
  "nell-mcandrew",
];

assert.deepEqual(
  publicFigureAthletes.map((athlete) => athlete.slug),
  expectedProfiles,
  "The reviewed public-figure profile set changed unexpectedly",
);
assert.equal(
  new Set(publicFigureAthletes.map((athlete) => athlete.slug)).size,
  publicFigureAthletes.length,
  "Public-figure athlete slugs must be unique",
);
assert(
  publicFigureAthletes.every(
    (athlete) =>
      athlete.profile_type === "Public figure" &&
      athlete.profile_source_checked_at &&
      athlete.source_url?.startsWith("https://") &&
      !athlete.avatar_url,
  ),
  "Every public figure needs a checked HTTPS source and must not use an unlicensed image",
);

const sitemapSource = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
for (const slug of expectedProfiles) {
  assert.match(
    sitemapSource,
    new RegExp(`<loc>https://www\\.athrecs\\.com/athletes/${slug}</loc>`),
    `Public-figure profile ${slug} must be included in the sitemap`,
  );
}

const catalogueSource = readFileSync(new URL("../src/data/catalogue.ts", import.meta.url), "utf8");
const seedSource = readFileSync(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert.match(catalogueSource, /\.\.\.\(publicFigureSeries as Series\[\]\)/);
assert.match(catalogueSource, /\.\.\.\(publicFigureEditions as Edition\[\]\)/);
assert.match(seedSource, /const PUBLIC_FIGURE_SEED_VERSION =/);
assert.match(seedSource, /public_figures_catalogue_version/);
assert.match(seedSource, /async function publicFigureRowsComplete/);
assert.match(
  seedSource,
  /meta\[0\]\?\.value === PUBLIC_FIGURE_SEED_VERSION[\s\S]*await publicFigureRowsComplete\(sql\)/,
  "The public-figure seed marker must be backed by exact athlete and result checks",
);
assert.match(seedSource, /publicFigureSeries\.map/);
assert.match(seedSource, /publicFigureEditions\.map/);

const rootRouteSource = readFileSync(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const homeRouteSource = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
assert.doesNotMatch(
  rootRouteSource,
  /\{ rel: "canonical", href: SITE_URL \}/,
  "The root route must not add the homepage canonical to every page",
);
assert.match(
  homeRouteSource,
  /links: \[\{ rel: "canonical", href: SITE_URL \}\]/,
  "The homepage must retain its own canonical URL",
);

const publicFigureEditionKeys = new Set(
  publicFigureEditions.map(
    (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`,
  ),
);
assert(
  publicFigureSeries.every((series) => series.source_url?.startsWith("https://")),
  "Every public-figure series needs an HTTPS source",
);

const athleteSlugs = new Set(publicFigureAthletes.map((athlete) => athlete.slug));
const resultKeys = publicFigureResults.map(
  (result) => `${result.eventSlug}|${result.date}|${result.distance}|${result.athleteSlug}`,
);
assert.equal(
  new Set(resultKeys).size,
  resultKeys.length,
  "Public-figure results must not contain duplicate athlete-edition rows",
);
assert(
  publicFigureResults.every(
    (result) =>
      athleteSlugs.has(result.athleteSlug) &&
      publicFigureEditionKeys.has(`${result.eventSlug}|${result.date}|${result.distance}`) &&
      result.finishTimeSeconds > 0 &&
      result.source.startsWith("https://"),
  ),
  "Every public-figure result needs an athlete, catalogue edition, time and HTTPS source",
);
assert(
  publicFigureResults.every((result) => {
    const [hours, minutes, seconds] = result.time.split(":").map(Number);
    return result.finishTimeSeconds === hours * 3600 + minutes * 60 + seconds;
  }),
  "Every displayed time must match its finishTimeSeconds value",
);

console.log(
  `Verified ${publicFigureAthletes.length} public figures, ${publicFigureResults.length} results and ${publicFigureEditions.length} editions.`,
);
