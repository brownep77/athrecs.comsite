import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { rolldown } from "rolldown";

const CHECKED_AT = "2026-08-22";
const HORIZON = "2027-12-31";
const NEW_SERIES_COUNT = 15;

async function loadModule(input) {
  const bundle = await rolldown({ input });
  const generated = await bundle.generate({ format: "esm" });
  return import(
    `data:text/javascript;base64,${Buffer.from(generated.output[0].code).toString("base64")}`
  );
}

const catalogue = await loadModule("src/data/catalogue.ts");
const data = await loadModule("src/data/half-ten-mile-races-uk-ireland-daily-followup.ts");
const { dailyHalfTenMileEditions, dailyHalfTenMileResearchQueue, dailyHalfTenMileSeries } = data;

assert.equal(dailyHalfTenMileSeries.length, NEW_SERIES_COUNT, "The daily follow-up is incomplete");
assert.equal(
  dailyHalfTenMileEditions.length,
  NEW_SERIES_COUNT,
  "Every daily follow-up series needs one edition",
);
assert.equal(
  dailyHalfTenMileEditions.filter((edition) => edition.distance === "Half").length,
  7,
  "The half-marathon total changed unexpectedly",
);
assert.equal(
  dailyHalfTenMileEditions.filter((edition) => edition.distance === "10mi").length,
  8,
  "The 10-mile total changed unexpectedly",
);

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
const normalizeUrl = (value) =>
  value
    .toLowerCase()
    .replace(/^https?:\/\/(?:www\.)?/, "")
    .replace(/\/$/, "");
const slugs = new Set();
const names = new Set();
for (const series of dailyHalfTenMileSeries) {
  assert(!slugs.has(series.slug), `Duplicate follow-up slug: ${series.slug}`);
  slugs.add(series.slug);
  const name = normalize(series.name);
  assert(!names.has(name), `Duplicate follow-up name: ${series.name}`);
  names.add(name);
  assert.equal(series.sport, "Running", `${series.slug} is not a running event`);
  assert(
    ["England", "Scotland", "Wales"].includes(series.country),
    `${series.slug} has an out-of-scope country`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
}

const priorSeries = catalogue.seriesList.filter((series) => !slugs.has(series.slug));
const priorSlugs = new Set(priorSeries.map((series) => series.slug));
const priorNames = new Set(priorSeries.map((series) => normalize(series.name)));
const priorSourceUrls = new Set(
  priorSeries.flatMap((series) =>
    [series.source_url, series.website].filter(Boolean).map(normalizeUrl),
  ),
);
for (const series of dailyHalfTenMileSeries) {
  assert(!priorSlugs.has(series.slug), `${series.slug} duplicates a prior catalogue slug`);
  assert(!priorNames.has(normalize(series.name)), `${series.name} duplicates a prior event name`);
  assert(
    !priorSourceUrls.has(normalizeUrl(series.source_url)),
    `${series.name} duplicates a prior event source URL`,
  );
  assert.equal(
    catalogue.seriesList.filter((item) => item.slug === series.slug).length,
    1,
    `${series.slug} was dropped or duplicated during catalogue merge`,
  );
}

const editionKeys = new Set();
for (const edition of dailyHalfTenMileEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!editionKeys.has(key), `Duplicate follow-up edition: ${key}`);
  editionKeys.add(key);
  assert(edition.date >= CHECKED_AT && edition.date <= HORIZON, `${key} is outside the horizon`);
  assert(["Half", "10mi"].includes(edition.distance), `${key} uses a non-canonical distance`);
  assert.equal(
    edition.distanceKm,
    edition.distance === "Half" ? 21.0975 : 16.09,
    `${key} has the wrong metric distance`,
  );
  assert.match(edition.source, /^https:\/\//, `${key} source must use HTTPS`);
  if (edition.status === "Open") {
    assert(edition.entryOptions?.length, `${key} needs a checked official entry option`);
  }
  for (const option of edition.entryOptions ?? []) {
    assert.equal(option.checkedAt, CHECKED_AT, `${key} has a stale entry check date`);
    assert.equal(option.isVerified, true, `${key} has an unverified entry source`);
    assert.equal(option.isPrimary, true, `${key} primary source is not marked`);
    assert.match(option.entryUrl, /^https:\/\//, `${key} entry URL must use HTTPS`);
  }
  assert.equal(
    catalogue.editions.filter(
      (item) => item.seriesSlug === edition.seriesSlug && item.date === edition.date,
    ).length,
    1,
    `${key} was dropped or duplicated during catalogue merge`,
  );
}

for (const candidate of dailyHalfTenMileResearchQueue) {
  assert(
    !slugs.has(candidate.slug),
    `Held candidate was accidentally published: ${candidate.slug}`,
  );
  assert(
    !catalogue.seriesList.some((series) => series.slug === candidate.slug),
    `Held candidate already exists publicly: ${candidate.slug}`,
  );
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} source must use HTTPS`);
}

const catalogueSource = await fs.readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
const seedSource = await fs.readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
const packageSource = await fs.readFile(new URL("../package.json", import.meta.url), "utf8");
assert(
  catalogueSource.includes('from "./half-ten-mile-races-uk-ireland-daily-followup"'),
  "The daily follow-up dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(dailyHalfTenMileSeries as Series[])"),
  "The daily follow-up series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(dailyHalfTenMileEditions as Edition[]).filter"),
  "The daily follow-up editions are not merged into the catalogue",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-5k-daily-v236"'),
  "The persistent catalogue seed version was not advanced",
);
assert(
  packageSource.includes('"verify:uk-ireland-half-ten-mile-daily"'),
  "The daily follow-up verifier is not exposed as an npm script",
);

console.log(
  `Verified ${NEW_SERIES_COUNT} new race series (7 half marathons and 8 ten-milers), ${dailyHalfTenMileResearchQueue.length} held candidate and catalogue-level duplicate protection.`,
);
