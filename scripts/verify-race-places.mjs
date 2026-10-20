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
const { racePlaceCopy, runningDistanceNames } =
  await import("../src/lib/athrecs/race-places-copy.ts");
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
const { placeEntryUrl } = await import("../src/lib/athrecs/race-place-facets.ts");
const { racePlaceUrl } = await import("../src/lib/athrecs/race-places-seo.ts");
const facetRows = [
  race(301, {
    editions: [edition("2027-02-01"), { ...edition("2027-01-01"), distance: "Half" }],
    city: "Wymondham",
  }),
  race(302, { editions: [edition("2027-01-20"), edition("2027-02-20", "Closed")] }),
  race(303, { editions: [edition("2027-01-31", "Open", "2027-02-02")] }),
  race(304, { sport: "Triathlon", editions: [edition("2027-02-01")] }),
  race(305, { sport: "Athletics", editions: [edition("2027-02-01")] }),
  race(306, { editions: [edition("2027-02-01", "Cancelled")] }),
  race(307, { distanceCodes: ["10K"], editions: [], lastDate: "2025-01-01" }),
];
const tenK = racePlacePage(facetRows, `${key}/running/10k`, now);
assert.deepEqual(
  tenK.races.map((r) => r.id),
  [302, 303, 301],
  "distance dates, not other-distance dates, control chronological order",
);
assert.equal(
  tenK.total,
  4,
  "triathlon, athletics and cancelled-only distances do not become running races",
);
assert(tenK.indexable);
assert.equal(tenK.archiveCount, 1, "old distance membership survives a rolling SQL date window");
const february = racePlacePage(facetRows, `${key}/running/10k`, now, 1, false, {
  month: "2027-02",
});
assert.deepEqual(
  february.races.map((r) => r.id),
  [303, 301, 302],
  "month filter includes overlapping multi-day events and later editions",
);
assert.equal(february.races.find((r) => r.id === 302).next.date, "2027-02-20");
assert(!february.indexable);
assert(racePlaceUrl(february, 2).endsWith("?page=2&month=2027-02"));
assert(!racePlaceUrl(february, 1, true).includes("month"), "archive navigation clears month");
const town = racePlacePage(facetRows, `${key}/running/10k`, now, 1, false, {
  month: "2027-02",
  city: "wymondham",
});
assert.deepEqual(
  town.races.map((r) => r.id),
  [301],
  "city and month combine without case sensitivity",
);
assert(!town.indexable);
assert.equal(racePlacePage(facetRows, `${key}/triathlon/10k`, now), null);
assert.equal(racePlacePage(facetRows, `${key}/running/not-a-distance`, now), null);
assert(
  !racePlacePage([facetRows[0]], `${key}/running/10k`, now).indexable,
  "small focused pages remain useful but noindex",
);
const paths = racePlaceSitemapPaths(facetRows);
assert(paths.includes(`/races/places/${key}/running/10k`));
assert(!paths.includes(`/races/places/${key}/triathlon`));
assert(
  paths.every((p) => !p.includes("?")),
  "no arbitrary filter combinations in sitemap",
);
assert(
  racePlacePage(facetRows, `${key}/running/10k`, "2029-01-01T12:00:00Z").indexable,
  "established distance page survives the off-season",
);
assert.equal(placeEntryUrl("javascript:alert(1)"), null);
assert.equal(placeEntryUrl("https://user:secret@example.org"), null);
assert.equal(placeEntryUrl("https://example.org/entry"), "https://example.org/entry");
const facetGraph = JSON.parse(racePlaceHead(tenK).scripts[0].children)["@graph"];
assert(
  facetGraph
    .find((item) => item["@type"] === "BreadcrumbList")
    .itemListElement.at(-1)
    .item.endsWith("/running/10k"),
);
assert.equal(
  facetGraph.find((item) => item["@type"] === "CollectionPage").about.name,
  "Norfolk",
  "sport is not a geographical place",
);
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
assert.equal(page.races[0].id, 5, "earliest date leads the calendar, including ongoing events");
assert.equal(page.featuredRaces[0].id, 2, "featured events have a separate section");
assert.equal(page.upcomingCount, 2);
assert.equal(
  page.archivePreview.length,
  4,
  "archive remains visible below an active upcoming calendar",
);
assert(
  page.archivePreview.every((race) => !race.next),
  "archived guides never contain upcoming entries",
);
assert(
  page.races.every((race) => race.next),
  "upcoming calendar never contains archived guides",
);
assert.equal(
  racePlacePage(races, key, now, 1, false, { city: "Wymondham" }).archivePreview.length,
  0,
  "archive preview respects town selection",
);

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
const prose = (paragraph) =>
  paragraph.map((part) => (typeof part === "string" ? part : part.text)).join("");
const distancesPage = racePlacePage(
  [
    race(201, {
      editions: [
        edition("2027-01-01"),
        edition("2028-01-01"),
        { ...edition("2027-01-01"), distance: "Half" },
      ],
    }),
    race(202, { sport: "Triathlon", editions: [{ ...edition("2027-01-01"), distance: "5K" }] }),
    race(203, { editions: [{ ...edition("2027-01-01", "Cancelled"), distance: "Marathon" }] }),
  ],
  key,
  now,
);
assert.deepEqual(new Set(runningDistanceNames(distancesPage)), new Set(["10K", "half marathon"]));
assert.equal(
  distancesPage.overview.distances.find((x) => x.code === "10K").count,
  1,
  "do not count two editions as two events",
);
assert(
  !runningDistanceNames(distancesPage).includes("5K"),
  "triathlon legs are not standalone running races",
);
assert(
  !runningDistanceNames(distancesPage).includes("marathon"),
  "cancelled distance cannot be promoted",
);
assert(!prose(racePlaceCopy(after).intro[0]).includes("event with an upcoming date"));
assert.equal(
  racePlaceCopy(empty).questions.length,
  0,
  "do not pad an empty page with generic FAQs",
);
const chronological = racePlacePage(
  [
    race(210, { name: "Later featured race", featured: true, editions: [edition("2028-01-01")] }),
    race(211, { name: "Earlier local race", editions: [edition("2027-01-01", "Closed")] }),
  ],
  key,
  now,
);
const nextAnswer = prose(racePlaceCopy(chronological).questions[0].answer);
assert(
  nextAnswer.indexOf("Earlier local race") < nextAnswer.indexOf("Later featured race"),
  "next-date answer must be chronological, independently of featured order",
);
assert(nextAnswer.includes("entry closed"), "dated race is not a promise of entry availability");
const abstract = graph.find((x) => x["@type"] === "CollectionPage");
assert.equal(
  abstract.abstract,
  racePlaceCopy(page).intro.map(prose).join(" "),
  "structured summary must match visible introduction",
);
assert.equal(abstract.about.containedInPlace.name, "England");
assert(
  !graph.some((x) => ["FAQPage", "SportsEvent"].includes(x["@type"])),
  "no inapplicable rich-result markup",
);
const db = new PGlite();
await db.exec(`create table events(id int, slug text, name text, sport text, country text, county text, region text, city text, summary text, featured boolean);
 create table editions(event_id int, event_date date, distance_code text, status text, end_date date, end_source_url text, end_checked_at date);
 create table event_groups(event_id int,level text);
 create table slug_redirects(entity_type text, old_slug text, current_slug text);
 insert into events values (1,'synthetic-uk','UK fixture','Running','England','Norfolk',null,'Norwich','Test',true),
 (2,'synthetic-private-sport','Unsupported sport','Cycling','England','Norfolk',null,'Norwich','Test',true);
 insert into editions values (1,'2026-10-19','10K','Open','2026-10-23',null,null),
 (1,'2027-05-01','Half','Closed',null,null,null);
 alter table editions add column entry_url text;`);
const sql = { query: async (text, values) => (await db.query(text, values)).rows };
const loaded = await queryRacePlaceRows(sql, now);
assert.equal(loaded.length, 1, "public sport boundary");
assert.equal(loaded[0].editions[0].endDate, null, "unsupported end date cannot prolong an event");
assert.equal(loaded[0].timeZone, "Europe/London");
assert.deepEqual(new Set(loaded[0].distanceCodes), new Set(["10K", "Half"]));
assert.equal(
  nextPlaceEdition(loaded[0], now).date,
  "2027-05-01",
  "closed entry remains a scheduled race",
);
await db.close();
if (process.argv.includes("--catalogue")) {
  const { seriesList, editions } = await import("../src/data/catalogue.ts");
  const bySlug = new Map();
  for (const item of editions) {
    const entries = bySlug.get(item.seriesSlug) ?? [];
    entries.push({ date: item.date, distance: item.distance, status: item.status, endDate: null });
    bySlug.set(item.seriesSlug, entries);
  }
  const sourceRows = seriesList
    .filter((item) => ["Running", "Athletics", "Triathlon"].includes(item.sport))
    .map((item, index) => ({
      ...item,
      id: index + 1,
      region: null,
      timeZone: null,
      lastDate: null,
      editions: bySlug.get(item.slug) ?? [],
    }));
  const locations = buildRacePlaces(sourceRows);
  const validPaths = new Set(
    [...locations.keys()].map((item) => (item ? `/races/places/${item}` : "/races/places")),
  );
  validPaths.add("/races/places");
  for (const item of sourceRows) validPaths.add(`/races/${encodeURIComponent(item.slug)}`);
  const audit = [];
  for (const location of [...locations.values()].filter((item) => item.raceIds.length)) {
    const ids = new Set(location.raceIds);
    const data = racePlacePage(
      sourceRows.filter((item) => ids.has(item.id)),
      location.key,
      now,
    );
    const copy = racePlaceCopy(data);
    const paragraphs = [...copy.intro, ...copy.questions.map((item) => item.answer)];
    const text = paragraphs.map(prose).join("\n");
    assert(!/\b(?:undefined|NaN|Invalid Date)\b/.test(text), location.key);
    assert(copy.heading.includes(location.name) || location.kind === "world", location.key);
    for (const part of paragraphs.flat().filter((item) => typeof item !== "string"))
      assert(validPaths.has(part.href), `${location.key}: ${part.href}`);
    audit.push({
      key: location.key,
      kind: location.kind,
      upcoming: data.upcomingCount,
      title: copy.title,
      description: copy.description,
      intro: copy.intro.map(prose),
      questions: copy.questions.map(({ question, answer }) => ({
        question,
        answer: prose(answer),
      })),
    });
  }
  fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "artifacts/race-place-copy-audit.json"),
    JSON.stringify(audit, null, 2),
  );
  console.log(
    `Content and links checked across ${audit.length} populated seed locations (${new Set(audit.map((item) => item.kind)).size} location levels). Seed coverage is not a live count or a new source verification.`,
  );
}
console.log(
  "Race-place checks passed: location hierarchy, state/county matching, date rollover, cancellation, new editions, archive preservation, pagination, SEO and public SQL.",
);
