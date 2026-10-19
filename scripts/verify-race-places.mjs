import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith("@/") ||
      (specifier.startsWith(".") &&
        context.parentURL?.startsWith(pathToFileURL(`${root}/src/`).href))
    ) {
      let target = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : fileURLToPath(new URL(specifier, context.parentURL));
      if (!path.extname(target))
        target = fs.existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, "index.ts");
      return nextResolve(pathToFileURL(target).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { buildRacePlaces, nextPlaceEdition, racePlacePage } =
  await import("../src/lib/athrecs/race-places.ts");
const { racePlaceHead } = await import("../src/lib/athrecs/race-places-seo.ts");
const { queryRacePlaceRows, racePlaceSitemapPaths } =
  await import("../src/lib/athrecs/race-places.server.ts");
const { PGlite } = await import("@electric-sql/pglite");
const now = "2026-10-19T23:30:00Z";
const edition = (date, status = "Open", endDate = null) => ({
  date,
  status,
  endDate,
  distance: "10K",
});
const race = (id, changes = {}) => ({
  id,
  slug: `synthetic-race-${id}`,
  name: `Synthetic race ${id}`,
  sport: "Running",
  country: "England",
  county: "Norfolk",
  region: null,
  city: "Norwich",
  summary: "Synthetic fixture for regression checks.",
  featured: false,
  timeZone: "Europe/London",
  editions: [edition("2026-10-19")],
  lastDate: null,
  ...changes,
});
const races = [
  race(1),
  race(2, { featured: true, editions: [edition("2026-10-20")] }),
  race(3, { editions: [edition("2026-10-20", "Cancelled")] }),
  race(4, { editions: [] }),
  race(5, { editions: [edition("2026-10-19", "Open", "2026-10-21")] }),
  race(6, {
    country: "USA",
    region: "US-CA",
    county: "Orange County",
    city: "Irvine",
    timeZone: "America/Los_Angeles",
  }),
  race(7, { country: "USA", county: "Creekside Plaza", city: "Creekside Plaza" }),
  race(8, { country: "Country TBC", county: "Norfolk" }),
  race(9, { country: "Ireland", county: "Dublin", city: "Dublin", timeZone: "Europe/Dublin" }),
  race(10, { country: "Scotland", county: "Highland", city: "Inverness" }),
  race(11, { country: "England", county: "Norfolk", region: "East of England" }),
];
const places = buildRacePlaces(races);
assert.deepEqual(places.get("europe/united-kingdom/england/norfolk").raceIds, [1, 2, 3, 4, 5, 11]);
assert.deepEqual(places.get("north-america/united-states/california/orange-county").raceIds, [6]);
assert(!places.has("north-america/united-states/creekside-plaza"));
assert(
  !buildRacePlaces([race(21, { county: "Monkton Stadium, Jarrow" })]).has(
    "europe/united-kingdom/england/monkton-stadium-jarrow",
  ),
);
assert(places.has("europe/united-kingdom/scotland/highland"));
assert(places.has("europe/ireland/dublin"));
assert(!places.has("europe/united-kingdom/ireland"));
assert.equal(places.get("").raceIds.length, 10, "unknown country must not be guessed");
assert.equal(nextPlaceEdition(races[0], now), null, "finished local day must disappear");
assert.equal(nextPlaceEdition(races[5], now).date, "2026-10-19", "race stays on its local day");
assert.equal(
  nextPlaceEdition(races[4], now).endDate,
  "2026-10-21",
  "multi-day race remains visible",
);
assert.equal(nextPlaceEdition(races[2], now), null, "cancelled races cannot be upcoming");
assert.equal(
  nextPlaceEdition(race(20, { editions: [edition("2026-10-20", "Finished")] }), now),
  null,
);
assert.equal(nextPlaceEdition(race(20, { editions: [edition("9999-99-99")] }), now), null);
assert.equal(
  nextPlaceEdition(race(20, { editions: [edition("2028-04-01")] }), now).date,
  "2028-04-01",
  "no hard-coded year cutoff",
);
assert(
  nextPlaceEdition(race(20, { timeZone: null }), now),
  "unknown time zone must not expire early",
);
const key = "europe/united-kingdom/england/norfolk";
const before = racePlacePage([race(1)], key, "2026-10-19T10:00:00Z");
const after = racePlacePage([race(1)], key, now);
assert.equal(before.upcomingCount, 1);
assert.equal(after.upcomingCount, 0);
assert.equal(before.place.path, after.place.path, "permanent location URL");
assert.equal(after.archivePreview.length, 1, "historical guide survives");
assert.equal(
  racePlacePage([race(1, { editions: [edition("2027-10-19")] })], key, now).upcomingCount,
  1,
  "new edition reappears",
);
const page = racePlacePage(races, key, now);
assert.equal(page.races[0].id, 2, "featured events lead the list");
assert.equal(page.upcomingCount, 2);
assert.equal(
  racePlacePage(races, key, now, 1, true).races.find((r) => r.id === 3).cancelledDate,
  "2026-10-20",
);
assert.equal(racePlacePage(races, key, now, 2), null, "out-of-range pages are real 404s");
assert.equal(racePlacePage(races, "europe/does-not-exist", now), null);
const head = racePlaceHead(page);
const graph = JSON.parse(head.scripts[0].children)["@graph"];
assert.equal(graph.find((x) => x["@type"] === "ItemList").numberOfItems, page.races.length);
assert(
  !graph.some((x) => x["@type"] === "SportsEvent"),
  "listing pages must not emit incomplete event markup",
);
assert(head.meta.find((x) => x.name === "robots").content.startsWith("index"));
assert(
  racePlaceHead(after)
    .meta.find((x) => x.name === "robots")
    .content.startsWith("index"),
  "seasonal page persists",
);
const empty = racePlacePage(races, "antarctica", now);
assert.equal(empty.total, 0);
assert(
  racePlaceHead(empty)
    .meta.find((x) => x.name === "robots")
    .content.startsWith("noindex"),
);
const sitemap = racePlaceSitemapPaths(races);
assert(sitemap.includes(page.place.path));
assert(!sitemap.includes("/races/places/antarctica"));
const multi = Array.from({ length: 35 }, (_, i) =>
  race(100 + i, { editions: [edition("2027-01-01")] }),
);
assert.equal(racePlacePage(multi, key, now).races.length, 30);
assert.equal(racePlacePage(multi, key, now, 2).races.length, 5);
assert(racePlaceHead(racePlacePage(multi, key, now, 2)).links[0].href.endsWith("?page=2"));
const db = new PGlite();
await db.exec(`create table events(id int, slug text, name text, sport text, country text, county text, region text, city text, summary text, featured boolean);
 create table editions(event_id int, event_date date, distance_code text, status text, end_date date, end_source_url text, end_checked_at date);
 create table event_groups(event_id int,level text);
 create table slug_redirects(entity_type text, old_slug text, current_slug text);
 insert into events values (1,'synthetic-uk','UK fixture','Running','England','Norfolk',null,'Norwich','Test',true),
 (2,'synthetic-private-sport','Unsupported sport','Cycling','England','Norfolk',null,'Norwich','Test',true);
 insert into editions values (1,'2026-10-19','10K','Open','2026-10-23',null,null),
 (1,'2027-05-01','Half','Closed',null,null,null);`);
const sql = { query: async (text, values) => (await db.query(text, values)).rows };
const loaded = await queryRacePlaceRows(sql, now);
assert.equal(loaded.length, 1, "public sport boundary");
assert.equal(loaded[0].editions[0].endDate, null, "unsupported end date cannot prolong an event");
assert.equal(loaded[0].timeZone, "Europe/London");
assert.equal(
  nextPlaceEdition(loaded[0], now).date,
  "2027-05-01",
  "closed entry remains a scheduled race",
);
await db.close();
console.log(
  "Race-place checks passed: location hierarchy, state/county matching, date rollover, cancellation, new editions, archive preservation, pagination, SEO and public SQL.",
);
