import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { rolldown } from "rolldown";

const CHECKED_AT = "2026-08-22";
const PREVIOUS_CHECKED_AT = "2026-08-23";
const PRIOR_CHECKED_AT = "2026-08-24";
const LATEST_CHECKED_AT = "2026-08-25";
const PREVIOUS_CURRENT_CHECKED_AT = "2026-08-26";
const CURRENT_CHECKED_AT = "2026-08-27";
const LATEST_CURRENT_CHECKED_AT = "2026-08-28";
const HORIZON = "2027-12-31";
const NEW_SERIES_COUNT = 46;
const NEW_EDITION_COUNT = 49;
const EXISTING_SERIES_EDITION_COUNT = 11;

async function loadModule(input) {
  const bundle = await rolldown({ input });
  const generated = await bundle.generate({ format: "esm" });
  return import(
    `data:text/javascript;base64,${Buffer.from(generated.output[0].code).toString("base64")}`
  );
}

const catalogue = await loadModule("src/data/catalogue.ts");
const data = await loadModule("src/data/half-ten-mile-races-uk-ireland-daily-followup.ts");
const {
  dailyHalfTenMileEditionOverrides,
  dailyHalfTenMileEditions,
  dailyHalfTenMileEntryOptions,
  dailyHalfTenMileExistingSeriesEditions,
  dailyHalfTenMileResearchQueue,
  dailyHalfTenMileSeries,
  dailyHalfTenMileSeriesOverrides,
} = data;

assert.equal(dailyHalfTenMileSeries.length, NEW_SERIES_COUNT, "The daily follow-up is incomplete");
assert.equal(
  dailyHalfTenMileEditions.length,
  NEW_EDITION_COUNT,
  "The daily follow-up edition total changed unexpectedly",
);
assert.equal(
  dailyHalfTenMileEditions.filter((edition) => edition.distance === "Half").length,
  39,
  "The half-marathon total changed unexpectedly",
);
assert.equal(
  dailyHalfTenMileEditions.filter((edition) => edition.distance === "10mi").length,
  10,
  "The 10-mile total changed unexpectedly",
);

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
const normalizeUrl = (value) => {
  const url = new URL(value);
  const ignoredParameters = new Set(["elid", "uid"]);
  const parameters = [...url.searchParams]
    .filter(([key]) => !ignoredParameters.has(key.toLowerCase()) && !key.startsWith("utm_"))
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      `${leftKey}=${leftValue}`.localeCompare(`${rightKey}=${rightValue}`),
    );
  const query = new URLSearchParams(parameters).toString();
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const pathname = url.pathname.toLowerCase().replace(/\/$/, "");
  return `${hostname}${pathname}${query ? `?${query}` : ""}`;
};
const slugs = new Set();
const names = new Set();
const sourceUrls = new Set();
for (const series of dailyHalfTenMileSeries) {
  assert(!slugs.has(series.slug), `Duplicate follow-up slug: ${series.slug}`);
  slugs.add(series.slug);
  const name = normalize(series.name);
  assert(!names.has(name), `Duplicate follow-up name: ${series.name}`);
  names.add(name);
  const sourceUrl = normalizeUrl(series.source_url);
  assert(!sourceUrls.has(sourceUrl), `Duplicate follow-up source URL: ${series.source_url}`);
  sourceUrls.add(sourceUrl);
  assert.equal(series.sport, "Running", `${series.slug} is not a running event`);
  assert(
    ["England", "Scotland", "Wales", "Ireland"].includes(series.country),
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
    assert(
      [
        CHECKED_AT,
        PREVIOUS_CHECKED_AT,
        PRIOR_CHECKED_AT,
        LATEST_CHECKED_AT,
        PREVIOUS_CURRENT_CHECKED_AT,
        CURRENT_CHECKED_AT,
        LATEST_CURRENT_CHECKED_AT,
      ].includes(option.checkedAt),
      `${key} has a stale entry check date`,
    );
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

const rabbitSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "rabbit-run-wales-half-marathon-2027",
);
const rabbitEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "rabbit-run-wales-half-marathon-2027",
);
assert(rabbitSeries && rabbitEdition, "Rabbit Run Wales 2027 is missing");
assert.equal(
  rabbitSeries.source_url,
  "https://www.rabbitrun.wales/enter-now/",
  "Rabbit Run Wales does not use the official organiser source",
);
assert.match(
  rabbitEdition.entryUrl ?? "",
  /^https:\/\/www\.letsdothis\.com\/gb\/o\/154485\/checkout\/ticket\?/,
  "Rabbit Run Wales does not use the direct open checkout",
);
assert.equal(
  rabbitEdition.entryOptions?.[0]?.checkedAt,
  PREVIOUS_CURRENT_CHECKED_AT,
  "Rabbit Run Wales entry provenance was not checked in the 26 August scan",
);

const eyamSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "eyam-half-marathon-2027",
);
const eyamEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "eyam-half-marathon-2027",
);
assert(eyamSeries && eyamEdition, "The verified Eyam Half Marathon 2027 race is missing");
assert.equal(
  eyamSeries.source_url,
  "https://www.eyamhalfmarathon.org/",
  "Eyam does not use the official organiser source",
);
assert.equal(
  eyamEdition.entryUrl,
  "https://www.sientries.co.uk/event.php?event_id=18017",
  "Eyam does not use the direct official entry URL",
);
assert.equal(
  eyamEdition.entryOptions?.[0]?.checkedAt,
  CURRENT_CHECKED_AT,
  "Eyam entry provenance was not checked in the current scan",
);

const quadrathonSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "quadrathon-challenge-half-marathon-2027",
);
const quadrathonEditions = dailyHalfTenMileEditions.filter(
  (edition) => edition.seriesSlug === "quadrathon-challenge-half-marathon-2027",
);
assert(quadrathonSeries, "The verified Quadrathon Challenge 2027 card is missing");
assert.equal(
  quadrathonSeries.source_url,
  "https://www.sientries.co.uk/event.php?event_id=18491",
  "Quadrathon does not use its direct official registration source",
);
assert.deepEqual(
  quadrathonEditions.map((edition) => edition.date),
  ["2027-08-12", "2027-08-13", "2027-08-14", "2027-08-15"],
  "Quadrathon must publish one half-marathon edition for each event day",
);
for (const edition of quadrathonEditions) {
  assert.equal(
    edition.entryUrl,
    "https://www.sientries.co.uk/enter.php?event_id=18491",
    "Quadrathon does not use the direct open checkout",
  );
  assert.equal(
    edition.entryOptions?.[0]?.checkedAt,
    LATEST_CURRENT_CHECKED_AT,
    "Quadrathon entry provenance was not checked in the 28 August scan",
  );
}

assert.equal(
  dailyHalfTenMileExistingSeriesEditions.length,
  EXISTING_SERIES_EDITION_COUNT,
  "The existing-card edition enrichment total changed unexpectedly",
);
const existingEditionKeys = new Set();
const existingEditionSourceUrls = new Set();
for (const edition of dailyHalfTenMileExistingSeriesEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!editionKeys.has(key), `Existing-card edition duplicates a new series edition: ${key}`);
  assert(!existingEditionKeys.has(key), `Duplicate existing-card edition: ${key}`);
  existingEditionKeys.add(key);
  assert(
    priorSlugs.has(edition.seriesSlug),
    `${key} should enrich an existing series instead of creating a second card`,
  );
  assert(edition.date >= CHECKED_AT && edition.date <= HORIZON, `${key} is outside the horizon`);
  assert.equal(edition.distance, "Half", `${key} uses the wrong primary distance`);
  assert.equal(edition.distanceKm, 21.0975, `${key} has the wrong metric distance`);
  const sourceUrl = normalizeUrl(edition.source);
  assert(
    !existingEditionSourceUrls.has(sourceUrl),
    `${key} duplicates another existing-card source URL`,
  );
  existingEditionSourceUrls.add(sourceUrl);
  assert.equal(edition.status, "Open", `${key} should be open`);
  assert(edition.entryOptions?.length, `${key} needs a checked official entry option`);
  for (const option of edition.entryOptions ?? []) {
    assert(
      [LATEST_CHECKED_AT, PREVIOUS_CURRENT_CHECKED_AT, CURRENT_CHECKED_AT].includes(
        option.checkedAt,
      ),
      `${key} has a stale entry check date`,
    );
    assert.equal(option.isVerified, true, `${key} has an unverified entry source`);
    assert.equal(option.isPrimary, true, `${key} primary source is not marked`);
    assert.equal(
      normalizeUrl(option.entryUrl),
      sourceUrl,
      `${key} does not use the direct official entry URL`,
    );
  }
  assert.equal(
    catalogue.editions.filter(
      (item) => item.seriesSlug === edition.seriesSlug && item.date === edition.date,
    ).length,
    1,
    `${key} was dropped or duplicated during catalogue merge`,
  );
  const catalogueSeries = catalogue.seriesList.find((series) => series.slug === edition.seriesSlug);
  assert(catalogueSeries, `${edition.seriesSlug} disappeared during catalogue merge`);
  assert(
    dailyHalfTenMileExistingSeriesEditions.some(
      (candidate) =>
        candidate.seriesSlug === edition.seriesSlug &&
        normalizeUrl(candidate.source) === normalizeUrl(catalogueSeries.source_url),
    ),
    `${edition.seriesSlug} does not expose a current official organiser source`,
  );
}

const clontarfEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) =>
    edition.seriesSlug === "clontarf-half-marathon-autumn-2026" && edition.date === "2027-07-03",
);
assert(clontarfEdition, "The verified Clontarf July 2027 edition is missing");
assert.equal(clontarfEdition.startTime, "10:00", "Clontarf has the wrong start time");
assert.equal(
  clontarfEdition.entryOptions?.[0]?.checkedAt,
  PREVIOUS_CURRENT_CHECKED_AT,
  "Clontarf entry provenance was not checked in the 26 August scan",
);

const beverleyEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) => edition.seriesSlug === "beverley-half-marathon" && edition.date === "2027-08-22",
);
assert(beverleyEdition, "The verified Beverley August 2027 edition is missing");
assert.equal(beverleyEdition.startTime, "09:00", "Beverley has the wrong start time");
assert.equal(
  beverleyEdition.entryOptions?.[0]?.checkedAt,
  CURRENT_CHECKED_AT,
  "Beverley entry provenance was not checked in the current scan",
);
assert.equal(
  dailyHalfTenMileSeriesOverrides["beverley-half-marathon"].source_url,
  "https://www.runthrough.co.uk/event/beverley-half-marathon-august-2027",
  "Beverley does not expose the official organiser source on its existing card",
);

const brightenSeries = catalogue.seriesList.find((series) => series.slug === "brighten-marina");
assert(brightenSeries, "The existing BrighTEN Marina card disappeared");
assert.deepEqual(
  brightenSeries.distances,
  ["10mi", "10K"],
  "The existing BrighTEN Marina card was not enriched with its 10-mile distance",
);
assert.equal(
  brightenSeries.source_url,
  dailyHalfTenMileSeriesOverrides["brighten-marina"].source_url,
  "The BrighTEN Marina card does not use the official organiser source",
);
const brightenEdition = catalogue.editions.find(
  (edition) => edition.seriesSlug === "brighten-marina" && edition.date === "2027-02-13",
);
assert(brightenEdition, "The existing BrighTEN Marina edition disappeared");
assert.equal(brightenEdition.distance, "10mi", "BrighTEN Marina still uses 10K as primary");
assert.equal(brightenEdition.distanceKm, 16.09, "BrighTEN Marina has the wrong metric distance");
assert.equal(
  brightenEdition.source,
  dailyHalfTenMileEditionOverrides["brighten-marina|2027-02-13|10K"].source,
  "BrighTEN Marina does not use the official organiser edition source",
);
assert.deepEqual(
  brightenEdition.entryOptions,
  dailyHalfTenMileEntryOptions["brighten-marina|2027-02-13|10mi"],
  "BrighTEN Marina does not use the verified official entry option",
);

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
assert(
  dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === "achill-half-marathon-2027"),
  "The internally inconsistent Achill 2027 candidate must remain held",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "carsington-water-trail-half-marathon-10k-august-2027",
  ),
  "The date-conflicted Carsington Water August candidate must remain held",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "battersea-park-half-marathon-december-2027",
  ),
  "The malformed Battersea Park December candidate must remain held",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "thirsk-10-mile-road-race-2027",
  ),
  "Thirsk 10 must remain held while its race licence is TBC",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "temple-newsam-10-2027",
  ),
  "Temple Newsam 10 must remain held while its race licence is pending",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "fastlane-summer-edition-2027",
  ),
  "Fastlane Summer must remain held while its governing status is TBA",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "tarpley-10-and-20-mile-2027",
  ),
  "Tarpley must remain held while its official entry state is internally conflicted",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "world-half-marathon-festival-2027",
  ),
  "World Half Marathon Festival must remain held while its ticket headings conflict",
);

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
  catalogueSource.includes("...(dailyHalfTenMileExistingSeriesEditions as Edition[])"),
  "The verified existing-card editions are not merged into the catalogue",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-half-ten-mile-scan-v272"'),
  "The persistent catalogue seed version was not advanced",
);
assert(
  packageSource.includes('"verify:uk-ireland-half-ten-mile-daily"'),
  "The daily follow-up verifier is not exposed as an npm script",
);

console.log(
  `Verified ${NEW_SERIES_COUNT} new race series (36 half marathons and 10 ten-milers), ${NEW_EDITION_COUNT} new-series editions, ${EXISTING_SERIES_EDITION_COUNT} new editions on existing cards, one enriched multi-distance card, ${dailyHalfTenMileResearchQueue.length} held candidates and catalogue-level duplicate protection.`,
);
