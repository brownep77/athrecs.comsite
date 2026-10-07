import assert from "node:assert/strict";
import {
  ROAD_ULTRAS,
  ULTRA_GUIDE_PATH,
  ultraPath,
  ukToday,
  upcomingEditions,
} from "../src/lib/running/road-ultras.ts";

assert.equal(new Set(ROAD_ULTRAS.map((race) => race.slug)).size, ROAD_ULTRAS.length);
for (const race of ROAD_ULTRAS) {
  assert.match(race.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(race.sources.length, `${race.slug}: missing primary source`);
  assert.ok(race.surface && race.entry && race.course, `${race.slug}: missing reader information`);
  for (const source of [...race.sources, ...race.editions]) {
    assert.equal(new URL(source.url).protocol, "https:");
  }
  assert.equal(new Set(race.editions.map((edition) => edition.date)).size, race.editions.length);
  for (const edition of race.editions) {
    assert.match(edition.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!edition.endDate || edition.endDate >= edition.date);
  }
}

// London midnight must work during both summer time and winter time.
assert.equal(ukToday(new Date("2027-06-04T23:30:00Z")), "2027-06-05");
assert.equal(ukToday(new Date("2027-12-04T23:30:00Z")), "2027-12-04");
const tunnel = ROAD_ULTRAS.find((race) => race.slug === "the-tunnel-200");
assert.equal(
  upcomingEditions(tunnel, "2027-03-06").length,
  1,
  "ongoing multi-day race must remain visible",
);
assert.equal(upcomingEditions(tunnel, "2027-03-07").length, 1, "keep the final race day");
assert.equal(upcomingEditions(tunnel, "2027-03-08").length, 0, "expired race must move to TBC");
const dartmoor = ROAD_ULTRAS.find((race) => race.slug === "dartmoor-discovery");
assert.equal(
  upcomingEditions(dartmoor, "2027-06-06").length,
  0,
  "do not invent the next annual edition",
);
const belfast = ROAD_ULTRAS.find((race) => race.slug === "belfast-24");
assert.ok(
  belfast.editions.every((edition) => edition.provisional),
  "council approval is still pending",
);
const twoTunnels = ROAD_ULTRAS.find((race) => race.slug === "bath-two-tunnels-50k");
assert.deepEqual(
  twoTunnels.editions.map((edition) => edition.date),
  ["2027-08-15"],
  "other meetings are not verified 50K dates",
);
for (const slug of ["mallory-park-50k-100k", "sri-chinmoy-perth-ultras"]) {
  assert.equal(
    ROAD_ULTRAS.find((race) => race.slug === slug).editions.length,
    0,
    "historical race must not be advertised as upcoming",
  );
}
console.log(
  `Verified ${ROAD_ULTRAS.length} road-ultra guides, source links, date boundaries and edition distinctions.`,
);

// Optional integration checks against the built app or deployment.
const base = process.argv[2];
if (base) {
  const { load } = await import("cheerio");
  const paths = [ULTRA_GUIDE_PATH, ...ROAD_ULTRAS.map((race) => ultraPath(race.slug))];
  for (const route of paths) {
    const response = await fetch(new URL(route, base));
    assert.equal(response.status, 200, route);
    const $ = load(await response.text());
    assert.equal($("h1").length, 1, route);
    assert.equal($("link[rel=canonical]").attr("href"), `https://www.athrecs.com${route}`, route);
    assert.ok($("meta[name=robots]").attr("content").startsWith("index"), route);
    const graph = $('script[type="application/ld+json"]')
      .toArray()
      .flatMap((element) => JSON.parse($(element).html())["@graph"] ?? []);
    const events = graph.filter((item) => item["@type"] === "SportsEvent");
    const race = ROAD_ULTRAS.find((item) => route === ultraPath(item.slug));
    if (race) {
      const scheduled = upcomingEditions(race, ukToday()).filter((edition) => !edition.provisional);
      assert.equal(
        events.length,
        scheduled.length,
        `${route}: scheduled schema must exclude TBC, provisional and expired editions`,
      );
      assert.deepEqual(
        events.map((event) => event.startDate),
        scheduled.map((edition) => edition.date),
      );
      for (const source of race.sources) {
        assert.ok(
          $("main a")
            .toArray()
            .some((element) => $(element).attr("href") === source.url),
          `${route}: missing primary source link`,
        );
      }
    } else {
      assert.equal(
        graph.find((item) => item["@type"] === "ItemList").numberOfItems,
        ROAD_ULTRAS.length,
      );
      for (const event of ROAD_ULTRAS)
        assert.ok(
          $("main a")
            .toArray()
            .some((element) => $(element).attr("href") === ultraPath(event.slug)),
          `${route}: missing detail link`,
        );
    }
  }
  const sitemap = await fetch(new URL("/sitemaps/pages.xml", base));
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  for (const route of paths)
    assert.ok(xml.includes(`https://www.athrecs.com${route}`), `Missing sitemap entry: ${route}`);
  const directory = load(await (await fetch(new URL("/site-map", base))).text());
  assert.ok(directory(`a[href='${ULTRA_GUIDE_PATH}']`).length, "Missing directory link");
  const hub = load(await (await fetch(new URL("/running", base))).text());
  assert.ok(hub(`a[href='${ULTRA_GUIDE_PATH}']`).length, "Missing Running hub link");
  assert.equal(
    (await fetch(new URL("/running/ultramarathons/not-a-real-ultra", base))).status,
    404,
  );
  console.log(
    `Verified ${paths.length} rendered pages, source links, structured dates, sitemap, directory, hub and unknown-slug 404.`,
  );
}
