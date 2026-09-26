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
const { ROAD_MARATHONS, roadMarathonsForCountry } =
  await import("../src/data/road-marathons/index.ts");
const { MARATHON_COUNTRIES } = await import("../src/data/road-marathons/countries.ts");
const { raceLocalDate, upcomingRoadEditions, nextRaceDateChange, currentRoadDateNotes } =
  await import("../src/lib/running/road-marathon-calendar.ts");
const { countryMarathonHead, roadRaceHead } =
  await import("../src/lib/running/road-marathon-seo.ts");
const now = process.env.MARATHON_VERIFY_NOW ?? new Date().toISOString();
const countries = new Set(MARATHON_COUNTRIES.map((country) => country.id));
assert.equal(countries.size, 7);
assert.equal(roadMarathonsForCountry("uk").length, 15);
assert.equal(
  new Set(ROAD_MARATHONS.map((race) => race.slug)).size,
  ROAD_MARATHONS.length,
  "Race URLs must be globally unique",
);
const checkUrl = (value) => assert(["http:", "https:"].includes(new URL(value).protocol), value);
for (const race of ROAD_MARATHONS) {
  assert(countries.has(race.country), race.slug);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(race.slug), race.slug);
  assert(race.name && race.city && race.description && race.course.summary, race.slug);
  assert(race.entryMethods.length > 0, `Entry methods missing: ${race.slug}`);
  assert(race.course.links.length > 0, `Route source missing: ${race.slug}`);
  assert(race.sources.length > 0, `Sources missing: ${race.slug}`);
  assert.equal(new Date(race.checkedAt).toISOString().slice(0, 10), race.checkedAt);
  assert(race.checkedAt <= now.slice(0, 10), `Future source check: ${race.slug}`);
  raceLocalDate(race.timeZone, now);
  checkUrl(race.officialUrl);
  checkUrl(race.resultsUrl);
  const links = [...race.sources, ...race.course.links, ...race.entryMethods, ...race.media];
  for (const link of links) checkUrl(link.url);
  for (const practical of race.practical ?? []) checkUrl(practical.sourceUrl);
  for (const note of race.dateNotes ?? []) {
    assert(note.text, race.slug);
    checkUrl(note.sourceUrl);
    assert.equal(new Date(note.expiresAfter).toISOString().slice(0, 10), note.expiresAfter);
    assert(note.expiresAfter <= "2027-12-31", race.slug);
  }
  if (race.fieldSize) {
    assert(race.fieldSize.display && race.fieldSize.basis && race.fieldSize.year);
    checkUrl(race.fieldSize.sourceUrl);
  }
  for (const edition of race.editions) {
    assert.equal(new Date(edition.date).toISOString().slice(0, 10), edition.date);
    assert(
      edition.date >= "2026-09-26" && edition.date <= "2027-12-31",
      `${race.slug}: date outside requested period`,
    );
    assert(edition.date <= (edition.endDate ?? edition.date));
    checkUrl(edition.sourceUrl);
  }
  assert.equal(new Set(race.editions.map((edition) => edition.date)).size, race.editions.length);
  assert.equal(
    new Set(race.pastEditions.map((edition) => edition.year)).size,
    race.pastEditions.length,
    `Duplicate archive year: ${race.slug}`,
  );
  for (const edition of race.pastEditions) {
    assert(edition.year <= 2026 && edition.summary, race.slug);
    if (edition.date)
      assert(edition.date <= raceLocalDate(race.timeZone, now), `Future results: ${race.slug}`);
    checkUrl(edition.resultsUrl);
    assert.equal(
      new Set(edition.categories.map((category) => category.category)).size,
      edition.categories.length,
      `Duplicate categories: ${race.slug}`,
    );
    for (const category of edition.categories) {
      assert(category.category && category.summary);
      checkUrl(category.sourceUrl);
    }
  }
  const head = roadRaceHead(race, now);
  const graph = JSON.parse(head.scripts[0].children)["@graph"];
  assert.equal(
    graph.filter((item) => item["@type"] === "SportsEvent").length,
    upcomingRoadEditions(race, now).length,
  );
  assert.equal(graph.find((item) => item["@type"] === "FAQPage").mainEntity.length, 4);
  assert(head.links[0].href.endsWith(`/running/races/${race.slug}`));
  assert.equal(upcomingRoadEditions(race, "2028-01-02T12:00:00Z").length, 0);
  assert.equal(currentRoadDateNotes(race, "2028-01-02T12:00:00Z").length, 0);
}
for (const country of MARATHON_COUNTRIES) {
  const races = roadMarathonsForCountry(country.id);
  assert(races.length > 0, country.id);
  const head = countryMarathonHead(country, races, now);
  const list = JSON.parse(head.scripts[0].children)["@graph"].find((item) =>
    item["@id"]?.endsWith("#races"),
  );
  assert.equal(list.numberOfItems, races.length);
}
// The same instant can be the day after a race in Auckland but race day in Los Angeles.
const sample = {
  ...ROAD_MARATHONS[0],
  editions: [{ date: "2027-01-01", sourceUrl: "https://example.test" }],
};
assert.equal(
  upcomingRoadEditions({ ...sample, timeZone: "Pacific/Auckland" }, "2027-01-01T12:00:00Z").length,
  0,
);
assert.equal(
  upcomingRoadEditions({ ...sample, timeZone: "America/Los_Angeles" }, "2027-01-01T12:00:00Z")
    .length,
  1,
);
const twoDays = {
  ...sample,
  timeZone: "Europe/London",
  editions: [{ date: "2027-04-24", endDate: "2027-04-25", sourceUrl: "https://example.test" }],
};
const provisional = {
  ...sample,
  timeZone: "Africa/Johannesburg",
  editions: [],
  dateNotes: [
    {
      text: "Calendar estimate: 1 January 2027. Awaiting organiser confirmation.",
      sourceUrl: "https://example.test/provisional",
      expiresAfter: "2027-01-01",
    },
  ],
};
assert.equal(currentRoadDateNotes(provisional, "2027-01-01T21:59:59Z").length, 1);
assert.equal(currentRoadDateNotes(provisional, "2027-01-01T22:00:00Z").length, 0);
for (const instant of ["2027-01-01T21:59:59Z", "2027-01-01T22:00:00Z"]) {
  const graph = JSON.parse(roadRaceHead(provisional, instant).scripts[0].children)["@graph"];
  assert.equal(graph.filter((item) => item["@type"] === "SportsEvent").length, 0);
  const answer = graph.find((item) => item["@type"] === "FAQPage").mainEntity[0].acceptedAnswer
    .text;
  assert(answer.includes("TBC (to be confirmed)"));
  assert(!answer.includes("Calendar estimate"));
}
assert.equal(upcomingRoadEditions(twoDays, "2027-04-25T22:59:59Z").length, 1);
assert.equal(upcomingRoadEditions(twoDays, "2027-04-25T23:00:00Z").length, 0);
for (const [zone, date, expected] of [
  ["Europe/London", "2027-03-28T12:00:00Z", "2027-03-28T23:00:00Z"],
  ["America/New_York", "2027-03-14T12:00:00Z", "2027-03-15T04:00:00Z"],
  ["Pacific/Auckland", "2026-09-26T12:00:00Z", "2026-09-27T11:00:00Z"],
])
  assert(
    Math.abs(nextRaceDateChange([zone], new Date(date)) - new Date(expected).getTime()) < 501,
    zone,
  );
console.log(
  `Passed: ${ROAD_MARATHONS.length} race guides across ${countries.size} countries, unique URLs, source links, date and result bounds, entry/course coverage, SEO and local-time/DST expiry.`,
);
console.log(
  JSON.stringify(
    MARATHON_COUNTRIES.map((country) => {
      const races = roadMarathonsForCountry(country.id);
      return {
        country: country.name,
        races: races.length,
        datedEditions: races.reduce((n, race) => n + race.editions.length, 0),
        pastEditions: races.reduce((n, race) => n + race.pastEditions.length, 0),
        categoryRecaps: races.reduce(
          (n, race) =>
            n + race.pastEditions.reduce((sum, edition) => sum + edition.categories.length, 0),
          0,
        ),
        noCategoryRecap: races
          .filter((race) => !race.pastEditions.some((edition) => edition.categories.length))
          .map((race) => race.name),
      };
    }),
    null,
    2,
  ),
);
