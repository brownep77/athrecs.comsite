import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
registerHooks({
  resolve(s, c, n) {
    if ((s.startsWith(".") && c.parentURL?.includes("/src/")) || s.startsWith("@/")) {
      let p = s.startsWith("@/")
        ? path.resolve("src", s.slice(2))
        : fileURLToPath(new URL(s, c.parentURL));
      if (!path.extname(p)) p = fs.existsSync(p + ".ts") ? p + ".ts" : path.join(p, "index.ts");
      return n(pathToFileURL(p).href, c);
    }
    return n(s, c);
  },
});

const { verifiedOrganiserUrl, verifiedGuideOrganiser } =
  await import("../src/lib/athrecs/race-organiser.ts");
const { racePageMetadata } = await import("../src/lib/athrecs/race-page-metadata.ts");
const { sportsEventJsonLd } = await import("../src/lib/athrecs/seo.ts");
const { ROAD_MARATHONS } = await import("../src/data/road-marathons/index.ts");
const { ROAD_HALF_MARATHONS } = await import("../src/data/road-half-marathons/index.ts");
const { roadRaceHead } = await import("../src/lib/running/road-marathon-seo.ts");
const { ROAD_ULTRAS } = await import("../src/lib/running/road-ultras.ts");
const { roadUltraHead } = await import("../src/lib/running/road-ultra-seo.ts");
const edition = {
  event_date: "2027-04-19",
  distance_code: "Marathon",
  status: "Open",
  start_time: "09:00",
};
const event = {
  slug: "boston-marathon",
  name: "Boston Marathon",
  organiser: "Boston Athletic Association",
  website: "https://www.baa.org/races/boston-marathon/",
  country: "United States",
  county: "Massachusetts",
  city: "Boston",
};
const metadata = racePageMetadata(event, [edition]);
assert.equal(metadata.organiserWebsite, "https://www.baa.org/");
const previous = racePageMetadata({ ...event, website: null }, [edition]);
assert.deepEqual(
  { ...metadata, organiserWebsite: undefined },
  previous,
  "URL repair cannot alter edition, venue, clocks or offsets",
);
const schema = sportsEventJsonLd({
  ...event,
  startDate: edition.event_date,
  startTime: metadata.startTime,
  utcOffset: metadata.utcOffset,
  website: metadata.organiserWebsite,
});
assert.equal(schema.organizer.url, "https://www.baa.org/");
assert.equal(schema.startDate, "2027-04-19T09:00-04:00");
assert.equal(schema.url, "https://www.athrecs.com/races/boston-marathon");
for (const website of [
  null,
  "",
  "not a URL",
  "http://www.baa.org/",
  "//www.baa.org/",
  "https://baa.org.evil.test/",
  "https://evil.test/baa.org",
  "https://user:password@baa.org/",
  "https://baa.org:444/",
  "https://www.athrecs.com/races/boston-marathon",
  "https://www.sientries.co.uk/",
  "https://runsignup.com/",
  "https://worldathletics.org/",
  "https://totalracetiming.co.uk/",
]) {
  assert.equal(verifiedOrganiserUrl(event.organiser, website), undefined, String(website));
  assert.equal(racePageMetadata({ ...event, website }, [edition]).organiserWebsite, undefined);
}
for (const organiser of [
  null,
  "",
  "Unknown",
  "See official site",
  "RunThrough",
  "Boston Athletic Association / local organiser",
]) {
  assert.equal(verifiedOrganiserUrl(organiser, event.website), undefined, String(organiser));
}
assert.equal(
  verifiedOrganiserUrl("  Boston   Athletic Association ", event.website),
  "https://www.baa.org/",
);
assert.equal(
  verifiedOrganiserUrl("parkrun", "https://www.parkrun.dk/amager/"),
  "https://www.parkrun.com/",
);
assert.equal(
  verifiedOrganiserUrl("parkrun / local volunteer team", "https://www.parkrun.org.uk/blickling/"),
  "https://www.parkrun.com/",
);
assert.equal(
  verifiedOrganiserUrl("Different running club", "https://www.nice-work.org.uk/e/partner-race"),
  undefined,
  "Entry provider must not replace a club organiser",
);
assert.equal(
  verifiedOrganiserUrl("Nice Work", "https://www.nice-work.org.uk/e/owned-race"),
  "https://www.nice-work.org.uk/",
);
assert.equal(verifiedGuideOrganiser("unknown-guide", event.website), undefined);
assert.equal(verifiedGuideOrganiser("boston-marathon-usa", "https://example.org/"), undefined);
assert.equal(
  sportsEventJsonLd({
    ...event,
    organiser: "See official site",
    startDate: edition.event_date,
    website: metadata.organiserWebsite,
  }).organizer,
  undefined,
);
assert.equal(
  sportsEventJsonLd({ ...event, website: metadata.organiserWebsite })["@type"],
  "WebPage",
);
const expected = new Map([
  ["boston-marathon-usa", "https://www.baa.org/"],
  ["boston-half-marathon", "https://www.baa.org/"],
  ["dartmoor-discovery", "https://www.teignbridgetrotters.co.uk/"],
  ["goodwood-50k", "https://www.runthrough.co.uk/"],
]);
let guides = 0,
  added = 0;
for (const race of [...ROAD_MARATHONS, ...ROAD_HALF_MARATHONS, ...ROAD_ULTRAS]) {
  const ultra = ROAD_ULTRAS.includes(race);
  const head = ultra
    ? roadUltraHead("2026-10-26", race)
    : roadRaceHead(race, "2026-10-26T12:00:00Z");
  const graphs = head.scripts.flatMap((s) => JSON.parse(s.children)["@graph"] ?? []);
  const events = graphs.filter((s) => s["@type"] === "SportsEvent");
  for (const item of events) {
    if (expected.has(race.slug)) {
      assert.equal(item.organizer?.url, expected.get(race.slug));
      added++;
    } else assert.equal(item.organizer, undefined, `${race.slug}: no inferred guide organiser`);
    assert(item.startDate);
    assert(item.url);
    assert(item.location);
  }
  guides++;
}
assert(added >= 4);
console.log(
  `PASS: verified organiser routing, mismatched identities/domains, placeholders, archive, time/canonical preservation; ${guides} guides, ${added} supported guide Events.`,
);
