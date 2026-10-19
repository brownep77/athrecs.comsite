import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const root = fileURLToPath(new URL("../", import.meta.url));
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith("@/") ||
      (specifier.startsWith(".") &&
        context.parentURL?.startsWith(pathToFileURL(`${root}src/`).href))
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
const athrecs = await import("../src/lib/athrecs/seo.ts");
const runrecs = await import("../src/runrecs/seo.ts");
const { roadRaceHead } = await import("../src/lib/running/road-marathon-seo.ts");
const { roadUltraHead } = await import("../src/lib/running/road-ultra-seo.ts");
const { ROAD_MARATHONS } = await import("../src/data/road-marathons/index.ts");
const { ROAD_HALF_MARATHONS } = await import("../src/data/road-half-marathons/index.ts");
const { ROAD_ULTRAS } = await import("../src/lib/running/road-ultras.ts");
const invalidDates = [
  undefined,
  null,
  "",
  "TBC",
  "2027",
  "2027-02",
  "2027-2-3",
  "2027-02-29",
  "2027-04-31",
  "2027-13-01",
  "2027-00-01",
  "2027-01-00",
  "2027-01-32",
  "2027-04-25T09:00:00Z",
];
const clone = (value) => JSON.parse(JSON.stringify(value));
const race = {
  name: "Synthetic archive",
  slug: "synthetic-archive",
  description: "Historical editions retained",
  city: "Example City",
  country: "GB",
};
for (const seo of [athrecs, runrecs]) {
  for (const startDate of invalidDates) {
    const item = clone(seo.sportsEventJsonLd({ ...race, startDate, startTime: "09:00" }));
    assert.equal(item["@type"], "WebPage", `${seo.SITE_NAME}: ${startDate}`);
    assert.equal(item.url, `${seo.SITE_URL}/races/${race.slug}`);
    assert.equal(item.description, race.description);
    for (const field of ["startDate", "endDate", "eventStatus", "location", "offers"])
      assert.equal(field in item, false);
  }
  for (const startTime of [
    undefined,
    null,
    "",
    "TBC",
    "about 9am",
    "9:00",
    "24:00",
    "09:60",
    "09:30:60",
    " ",
  ]) {
    const item = clone(seo.sportsEventJsonLd({ ...race, startDate: "2027-04-25", startTime }));
    assert.equal(item["@type"], "SportsEvent");
    assert.equal(item.startDate, "2027-04-25", `${seo.SITE_NAME}: ${startTime}`);
  }
  for (const startTime of ["00:00", "09:30", "09:30:00", "23:59:59"])
    assert.equal(
      seo.sportsEventJsonLd({ ...race, startDate: "2028-02-29", startTime }).startDate,
      `2028-02-29T${startTime}`,
    );
}
function nodes(value) {
  if (!value || typeof value !== "object") return [];
  return [value, ...Object.values(value).flatMap(nodes)];
}
const events = (head) =>
  head.scripts
    .flatMap((script) => nodes(JSON.parse(script.children)))
    .filter((item) =>
      [item["@type"]].flat().some((type) => type === "Event" || type === "SportsEvent"),
    );
const at = "2026-10-19";
let checked = 0;
for (const race of [...ROAD_MARATHONS, ...ROAD_HALF_MARATHONS, ...ROAD_ULTRAS]) {
  const ultra = ROAD_ULTRAS.includes(race);
  const head = (r) => (ultra ? roadUltraHead(at, r) : roadRaceHead(r, at));
  for (const item of events(head(race))) {
    assert.match(item.startDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(item.startDate).toISOString().slice(0, 10), item.startDate);
    checked++;
  }
  const snapshot = clone(race);
  assert.equal(events(head({ ...race, editions: [] })).length, 0);
  assert.deepEqual(race, snapshot, "Rendering must preserve stored editions");
}
for (const [seed, head] of [
  [ROAD_MARATHONS[0], (r) => roadRaceHead(r, at)],
  [ROAD_HALF_MARATHONS[0], (r) => roadRaceHead(r, at)],
  [ROAD_ULTRAS[0], (r) => roadUltraHead(at, r)],
]) {
  for (const date of invalidDates) {
    // A real end date must never rescue a missing or invalid start date.
    const synthetic = {
      ...seed,
      editions: [
        {
          date,
          endDate: "2027-12-31",
          url: "https://example.org",
          sourceUrl: "https://example.org",
        },
      ],
    };
    const snapshot = clone(synthetic);
    assert.equal(events(head(synthetic)).length, 0, `${seed.slug}: ${date}`);
    assert.deepEqual(clone(synthetic), snapshot);
  }
}
console.log(
  `Event startDate guards passed for both brands, malformed times, all guide builders and ${checked} current guide events; no dates invented.`,
);
