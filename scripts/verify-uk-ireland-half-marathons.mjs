import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { rolldown } from "rolldown";

const CHECKED_AT = "2026-08-22";
const HORIZON = "2027-12-31";
const NEW_SERIES_COUNT = 31;
const OVERRIDE_SLUGS = new Set([
  "belfast-half",
  "kilkenny-medieval-marathon",
  "rock-the-lough-5k-2026",
  "run-galway-bay-marathon",
  "wa-antrim-coast-half-marathon-7238724",
]);

const bundle = await rolldown({ input: "src/data/catalogue.ts" });
const generated = await bundle.generate({ format: "esm" });
const catalogue = await import(
  `data:text/javascript;base64,${Buffer.from(generated.output[0].code).toString("base64")}`
);

const dataBundle = await rolldown({ input: "src/data/half-marathons-uk-ireland-followup.ts" });
const dataGenerated = await dataBundle.generate({ format: "esm" });
const data = await import(
  `data:text/javascript;base64,${Buffer.from(dataGenerated.output[0].code).toString("base64")}`
);

const {
  verifiedHalfMarathonFollowupEditionOverrides,
  verifiedHalfMarathonFollowupEditions,
  verifiedHalfMarathonFollowupEntryOptions,
  verifiedHalfMarathonFollowupResearchQueue,
  verifiedHalfMarathonFollowupSeries,
  verifiedHalfMarathonFollowupSeriesOverrides,
} = data;

assert.equal(
  verifiedHalfMarathonFollowupSeries.length,
  NEW_SERIES_COUNT,
  "The UK and Ireland half-marathon series batch is incomplete",
);
assert.equal(
  verifiedHalfMarathonFollowupEditions.length,
  NEW_SERIES_COUNT,
  "Every new half-marathon series needs one edition",
);
assert.equal(
  Object.keys(verifiedHalfMarathonFollowupSeriesOverrides).length,
  OVERRIDE_SLUGS.size,
  "The existing-series enrichment set is incomplete",
);
assert.equal(
  verifiedHalfMarathonFollowupResearchQueue.length,
  5,
  "The held half-marathon research queue is incomplete",
);

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
const newSlugs = new Set();
const newNameKeys = new Set();
for (const series of verifiedHalfMarathonFollowupSeries) {
  assert(!newSlugs.has(series.slug), `Duplicate new half-marathon slug: ${series.slug}`);
  newSlugs.add(series.slug);
  const nameKey = normalize(series.name);
  assert(!newNameKeys.has(nameKey), `Duplicate new half-marathon name: ${series.name}`);
  newNameKeys.add(nameKey);
  assert(series.distances.includes("Half"), `${series.slug} does not advertise a half marathon`);
  assert(
    ["Ireland", "Northern Ireland"].includes(series.country),
    `${series.slug} has an out-of-scope country ${series.country}`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
}

const priorSeries = catalogue.seriesList.filter((series) => !newSlugs.has(series.slug));
const priorNameKeys = new Set(priorSeries.map((series) => normalize(series.name)));
for (const series of verifiedHalfMarathonFollowupSeries) {
  assert(
    !priorNameKeys.has(normalize(series.name)),
    `${series.slug} duplicates an existing catalogue event name`,
  );
  assert.equal(
    catalogue.seriesList.filter((item) => item.slug === series.slug).length,
    1,
    `${series.slug} was dropped or duplicated during catalogue merge`,
  );
}

const rawEditionKeys = new Set();
for (const edition of verifiedHalfMarathonFollowupEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!rawEditionKeys.has(key), `Duplicate half-marathon edition in batch: ${key}`);
  rawEditionKeys.add(key);
  assert(newSlugs.has(edition.seriesSlug), `${edition.seriesSlug} has no new series`);
  assert(
    edition.date >= CHECKED_AT && edition.date <= HORIZON,
    `${key} is outside the audit horizon`,
  );
  assert.equal(edition.distance, "Half", `${key} is not represented as a half marathon`);
  assert.equal(edition.distanceKm, 21.0975, `${key} has the wrong metric distance`);
  assert.match(edition.source, /^https:\/\//, `${key} source must use HTTPS`);
  assert(edition.entryOptions?.length, `${key} needs a checked official entry source`);
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

for (const slug of OVERRIDE_SLUGS) {
  const series = catalogue.seriesList.find((item) => item.slug === slug);
  assert(series, `Existing override target is missing: ${slug}`);
  assert(series.distances.includes("Half"), `${slug} lost its confirmed half-marathon distance`);
}
assert.equal(
  catalogue.seriesList.find((series) => series.slug === "belfast-half")?.country,
  "Northern Ireland",
  "Belfast City Half Marathon is still assigned to Scotland",
);
assert.deepEqual(
  catalogue.seriesList.find((series) => series.slug === "rock-the-lough-5k-2026")?.distances,
  ["5K", "10K", "Half"],
  "Rock the Lough lost one of its confirmed distances",
);

for (const [key, override] of Object.entries(verifiedHalfMarathonFollowupEditionOverrides)) {
  assert.match(
    override.source ?? "https://verified.invalid",
    /^https:\/\//,
    `${key} source must use HTTPS`,
  );
}
for (const [key, options] of Object.entries(verifiedHalfMarathonFollowupEntryOptions)) {
  assert(options.length > 0, `${key} has an empty entry-source override`);
  for (const option of options) {
    assert.equal(option.checkedAt, CHECKED_AT, `${key} has a stale override entry check`);
    assert.match(option.entryUrl, /^https:\/\//, `${key} entry URL must use HTTPS`);
  }
}

for (const candidate of verifiedHalfMarathonFollowupResearchQueue) {
  assert(
    !newSlugs.has(candidate.slug),
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
const entryOptionsSource = await fs.readFile(
  new URL("../src/data/entry-options.ts", import.meta.url),
  "utf8",
);
const seedSource = await fs.readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(
  catalogueSource.includes('from "./half-marathons-uk-ireland-followup"'),
  "The half-marathon dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedHalfMarathonFollowupSeries as Series[])"),
  "The half-marathon series are not merged into the catalogue",
);
assert(
  entryOptionsSource.includes("...verifiedHalfMarathonFollowupSeriesOverrides"),
  "The half-marathon series overrides are not merged",
);
assert(
  entryOptionsSource.includes("...verifiedHalfMarathonFollowupEntryOptions"),
  "The half-marathon entry overrides are not merged",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-albania-running-calendar-v247"'),
  "The persistent catalogue seed version was not advanced",
);

console.log(
  `Verified ${NEW_SERIES_COUNT} new half-marathon series, ${OVERRIDE_SLUGS.size} in-place event enrichments and ${verifiedHalfMarathonFollowupResearchQueue.length} held candidates with catalogue-level duplicate protection.`,
);
