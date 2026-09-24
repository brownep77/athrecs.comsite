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
const SCAN_CHECKED_AT = "2026-08-29";
const CURRENT_SCAN_CHECKED_AT = "2026-08-30";
const LATEST_SCAN_CHECKED_AT = "2026-08-31";
const CURRENT_DAILY_SCAN_CHECKED_AT = "2026-09-03";
const LATEST_DAILY_SCAN_CHECKED_AT = "2026-09-05";
const NEWEST_DAILY_SCAN_CHECKED_AT = "2026-09-06";
const CURRENT_DAILY_RELEASE_CHECKED_AT = "2026-09-07";
const NEWEST_DAILY_RELEASE_CHECKED_AT = "2026-09-10";
const CURRENT_OFFICIAL_SCAN_CHECKED_AT = "2026-09-22";
const CURRENT_SITEMAP_SCAN_CHECKED_AT = "2026-09-23";
const HORIZON = "2027-12-31";
const NEW_SERIES_COUNT = 67;
const NEW_EDITION_COUNT = 70;
const EXISTING_SERIES_EDITION_COUNT = 31;

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
  dailyHalfTenMileRetiredSeriesSlugs,
  dailyHalfTenMileSeries,
  dailyHalfTenMileSeriesOverrides,
  dailyHalfTenMileSlugAliases,
} = data;

assert.equal(dailyHalfTenMileSeries.length, NEW_SERIES_COUNT, "The daily follow-up is incomplete");
assert.equal(
  dailyHalfTenMileEditions.length,
  NEW_EDITION_COUNT,
  "The daily follow-up edition total changed unexpectedly",
);
assert.equal(
  dailyHalfTenMileEditions.filter((edition) => edition.distance === "Half").length,
  57,
  "The half-marathon total changed unexpectedly",
);
assert.equal(
  dailyHalfTenMileEditions.filter((edition) => edition.distance === "10mi").length,
  13,
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
    ["England", "Scotland", "Wales", "Northern Ireland", "Ireland"].includes(series.country),
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
  const canonicalSlug = dailyHalfTenMileSlugAliases[series.slug];
  if (canonicalSlug) {
    assert.equal(
      catalogue.seriesList.filter((item) => item.slug === series.slug).length,
      0,
      `${series.slug} must not survive as a second public card`,
    );
    assert(
      dailyHalfTenMileSeriesOverrides[canonicalSlug]?.name,
      `${series.slug} cannot rebuild its established catalogue card`,
    );
    continue;
  }
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
        SCAN_CHECKED_AT,
        CURRENT_SCAN_CHECKED_AT,
        LATEST_SCAN_CHECKED_AT,
        CURRENT_DAILY_SCAN_CHECKED_AT,
        LATEST_DAILY_SCAN_CHECKED_AT,
        NEWEST_DAILY_SCAN_CHECKED_AT,
        CURRENT_DAILY_RELEASE_CHECKED_AT,
        CURRENT_OFFICIAL_SCAN_CHECKED_AT,
        CURRENT_SITEMAP_SCAN_CHECKED_AT,
      ].includes(option.checkedAt),
      `${key} has a stale entry check date`,
    );
    assert.equal(option.isVerified, true, `${key} has an unverified entry source`);
    assert.equal(option.isPrimary, true, `${key} primary source is not marked`);
    assert.match(option.entryUrl, /^https:\/\//, `${key} entry URL must use HTTPS`);
  }
  if (!dailyHalfTenMileSlugAliases[edition.seriesSlug]) {
    assert.equal(
      catalogue.editions.filter(
        (item) =>
          item.seriesSlug === edition.seriesSlug &&
          item.date === edition.date &&
          item.distance === edition.distance,
      ).length,
      1,
      `${key} was dropped or duplicated during catalogue merge`,
    );
  }
}

const expectedScanAdditions = new Map([
  ["wolf-moon-trail-half-marathon-2027", "https://www.sientries.co.uk/enter.php?event_id=18469"],
  ["great-north-west-half-marathon-2027", "https://www.sientries.co.uk/enter.php?event_id=18517"],
  ["hameldown-hammer-half-marathon-2027", "https://www.sientries.co.uk/enter.php?event_id=17537"],
  ["merthyr-half-marathon-2027", "https://www.sientries.co.uk/enter.php?event_id=17706"],
  [
    "silverbacktrails-oswius-revenge-half-marathon-2027",
    "https://www.sientries.co.uk/enter.php?event_id=18024",
  ],
  ["cbte-morland-half-marathon-2027", "https://www.sientries.co.uk/enter.php?event_id=18433"],
]);
for (const [slug, entryUrl] of expectedScanAdditions) {
  const edition = dailyHalfTenMileEditions.find((candidate) => candidate.seriesSlug === slug);
  assert(edition, `${slug} is missing from the current scan`);
  assert.equal(edition.entryUrl, entryUrl, `${slug} does not use its direct official checkout`);
  assert.equal(
    edition.entryOptions?.[0]?.checkedAt,
    SCAN_CHECKED_AT,
    `${slug} entry provenance was not checked in the 29 August scan`,
  );
}

for (const [slug, date] of [
  ["burnsall-trail-half-2027", "2027-04-17"],
  ["kettlewell-trail-half-2027", "2027-06-19"],
]) {
  const series = dailyHalfTenMileSeries.find((candidate) => candidate.slug === slug);
  const edition = dailyHalfTenMileEditions.find(
    (candidate) => candidate.seriesSlug === slug && candidate.date === date,
  );
  assert(series && edition, `${slug} is missing from the current scan`);
  assert.equal(edition.status, "Open", `${slug} should expose the now-open entry`);
  assert.equal(
    edition.entryUrl,
    "https://www.sientries.co.uk/series.php?series_id=896",
    `${slug} does not use the direct official series checkout`,
  );
  assert.equal(
    edition.entryOptions?.[0]?.checkedAt,
    LATEST_DAILY_SCAN_CHECKED_AT,
    `${slug} entry provenance was not checked on 5 September`,
  );
  assert.match(
    series.source_url,
    /^https:\/\/www\.sientries\.co\.uk\/event\//,
    `${slug} does not use the direct official event source`,
  );
}

const kinvaraSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "kinvara-rock-and-road-2027",
);
const kinvaraEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "kinvara-rock-and-road-2027",
);
assert(kinvaraSeries && kinvaraEdition, "The verified Kinvara 2027 event is missing");
assert.deepEqual(kinvaraSeries.distances, ["Half", "10K", "19.65mi"]);
assert.equal(kinvaraSeries.source_url, "https://www.rockandroad.ie/");
assert.equal(kinvaraEdition.date, "2027-03-06", "Kinvara has the wrong date");
assert.equal(kinvaraEdition.entryUrl, "https://eventmaster.ie/event/O1K7CpmH0Z");
assert.equal(kinvaraEdition.entryOptions?.[0]?.priceCurrency, "EUR");

const capeClearSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "cape-clear-island-races-2027",
);
const capeClearEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "cape-clear-island-races-2027",
);
assert(capeClearSeries && capeClearEdition, "The verified Cape Clear 2027 event is missing");
assert.deepEqual(capeClearSeries.distances, ["Half", "10K"]);
assert.equal(
  capeClearSeries.source_url,
  "https://www.sientries.co.uk/event/the-cape-clear-island-races-2027",
);
assert.equal(capeClearEdition.date, "2027-08-28", "Cape Clear has the wrong date");
assert.equal(capeClearEdition.status, "Open", "Cape Clear should expose its now-open entry");
assert.equal(
  capeClearEdition.entryUrl,
  "https://www.sientries.co.uk/enter.php?event_id=18595",
  "Cape Clear does not use its direct event-specific checkout",
);
assert.equal(capeClearEdition.entryOptions?.[0]?.checkedAt, LATEST_DAILY_SCAN_CHECKED_AT);

const tireeSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "tiree-half-marathon-10k-2027",
);
const tireeEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "tiree-half-marathon-10k-2027",
);
assert(tireeSeries && tireeEdition, "The verified Tiree 2027 event is missing");
assert.deepEqual(tireeSeries.distances, ["Half", "10K"]);
assert.equal(tireeEdition.date, "2027-05-01", "Tiree has the wrong date");
assert.equal(tireeEdition.status, "Closed", "Tiree should reflect closed registration");
assert.equal(tireeEdition.entryUrl, undefined, "Tiree must not advertise a closed checkout");

const beaconSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "beacon-beast-marathon-beastly-half-2027",
);
const beaconEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "beacon-beast-marathon-beastly-half-2027",
);
assert(beaconSeries && beaconEdition, "The verified Beacon Beast 2027 event is missing");
assert.deepEqual(beaconSeries.distances, ["Marathon", "Half"]);
assert.equal(beaconEdition.date, "2027-04-25", "Beacon Beast has the wrong date");
assert.equal(beaconEdition.status, "Open", "Beacon Beast should expose open entry");
assert.equal(
  beaconEdition.entryUrl,
  "https://www.sientries.co.uk/enter.php?event_id=18191",
  "Beacon Beast does not use its direct event-specific checkout",
);
assert.equal(beaconEdition.entryOptions?.[0]?.checkedAt, LATEST_DAILY_SCAN_CHECKED_AT);

const currentOfficialAdditions = new Map([
  [
    "battersea-park-half-marathon-10k-5k-may-2027",
    ["2027-05-08", "10:30", "https://www.runthrough.co.uk/event/battersea-park-5k-10k-half-marathon-may-2027"],
  ],
  [
    "carlisle-half-marathon-10k-5k-july-2027",
    ["2027-07-18", "09:00", "https://www.runthrough.co.uk/event/carlisle-half-marathon-10k-july-2027"],
  ],
  [
    "newcastle-half-marathon-10k-july-2027",
    ["2027-07-11", "09:00", "https://www.runthrough.co.uk/event/newcastle-half-marathon-10k-july-2027"],
  ],
  [
    "east-yorkshire-half-marathon-10k-june-2027",
    ["2027-06-20", "09:00", "https://www.runthrough.co.uk/event/east-yorkshire-half-marathon-10k-june-2027"],
  ],
  [
    "newcastle-gateshead-marathon-half-marathon-10k-may-2027",
    ["2027-05-02", "09:25", "https://www.runthrough.co.uk/event/newcastle-gateshead-marathon-half-marathon-10k-may-2027"],
  ],
]);
for (const [slug, [date, startTime, source]] of currentOfficialAdditions) {
  const edition = dailyHalfTenMileEditions.find(
    (candidate) => candidate.seriesSlug === slug && candidate.date === date,
  );
  assert(edition, `${slug} is missing from the 22 September official scan`);
  assert.equal(edition.startTime, startTime, `${slug} has the wrong half-marathon start`);
  assert.equal(edition.entryUrl, source, `${slug} does not use direct organiser entry`);
  assert.equal(edition.entryOptions?.[0]?.checkedAt, CURRENT_OFFICIAL_SCAN_CHECKED_AT);
}

const crystalPalaceMayEdition = dailyHalfTenMileEditions.find(
  (edition) =>
    edition.seriesSlug === "crystal-palace-5k-10k-half-marathon-juniors-may-2027" &&
    edition.date === "2027-05-02",
);
assert(crystalPalaceMayEdition, "Crystal Palace May is missing from the 23 September sitemap scan");
assert.equal(crystalPalaceMayEdition.startTime, "10:00");
assert.equal(
  crystalPalaceMayEdition.entryUrl,
  "https://www.runthrough.co.uk/event/crystal-palace-5k-10k-half-marathon-juniors-may-2027",
  "Crystal Palace May does not use direct organiser entry",
);
assert.equal(
  crystalPalaceMayEdition.entryOptions?.[0]?.checkedAt,
  CURRENT_SITEMAP_SCAN_CHECKED_AT,
);

const tadcasterSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "tadcaster-10-2026",
);
const tadcasterEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "tadcaster-10-2026",
);
assert(tadcasterSeries && tadcasterEdition, "The licensed Tadcaster 10 edition is missing");
assert.equal(tadcasterEdition.date, "2026-11-22", "Tadcaster 10 has the wrong date");
assert.equal(tadcasterEdition.distance, "10mi", "Tadcaster uses the wrong distance");
assert.equal(tadcasterEdition.startTime, "09:30", "Tadcaster 10 has the wrong start time");
assert.equal(
  tadcasterEdition.entryUrl,
  "https://racebest.com/races/e6z7h/enter",
  "Tadcaster 10 does not use the direct official checkout",
);
assert.equal(
  tadcasterEdition.entryOptions?.[0]?.checkedAt,
  CURRENT_DAILY_RELEASE_CHECKED_AT,
  "Tadcaster 10 entry provenance was not refreshed on 7 September",
);
assert.equal(
  dailyHalfTenMileSlugAliases["tadcaster-10-2026"],
  "tadcaster-10",
  "Tadcaster 10 must resolve to its established permanent slug",
);
assert.equal(
  dailyHalfTenMileSeriesOverrides["tadcaster-10"]?.source_url,
  "https://racebest.com/races/e6z7h",
  "The established Tadcaster card lost its verified organiser provenance",
);
assert.equal(
  dailyHalfTenMileEditionOverrides["tadcaster-10|2026-11-22|10mi"]?.entryUrl,
  "https://racebest.com/races/e6z7h/enter",
  "The canonical Tadcaster edition lost its official checkout",
);
assert.equal(
  dailyHalfTenMileEntryOptions["tadcaster-10|2026-11-22|10mi"]?.[0]?.checkedAt,
  CURRENT_DAILY_RELEASE_CHECKED_AT,
  "The canonical Tadcaster entry provenance is stale",
);

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
const longfordEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) =>
    edition.seriesSlug === "abbott-longford-marathon-2026" && edition.date === "2027-08-29",
);
assert(longfordEdition, "The approved 2027 Longford half must enrich its existing card");
assert.equal(longfordEdition.status, "TBC", "Longford must remain TBC before sales open");
assert.equal(longfordEdition.startTime, "09:00", "Longford has the wrong official start time");
assert.equal(
  longfordEdition.source,
  "https://eventmaster.ie/event/3x1jhx4tZW",
  "Longford must use its event-specific official source",
);
assert.equal(longfordEdition.entryUrl, undefined, "Longford must not expose premature checkout");
assert.equal(
  longfordEdition.publishAllDistances,
  true,
  "Longford must retain the festival's published distances on one card",
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
  if (edition.status === "Open") {
    assert(edition.entryOptions?.length, `${key} needs a checked official entry option`);
  } else {
    assert.equal(edition.status, "TBC", `${key} uses an unsupported non-open status`);
    assert.equal(edition.entryUrl, undefined, `${key} must not advertise a premature checkout`);
    assert.equal(edition.entryOptions, undefined, `${key} must not expose a premature checkout`);
  }
  for (const option of edition.entryOptions ?? []) {
    assert(
      [
        LATEST_CHECKED_AT,
        PREVIOUS_CURRENT_CHECKED_AT,
        CURRENT_CHECKED_AT,
        SCAN_CHECKED_AT,
        CURRENT_SCAN_CHECKED_AT,
        LATEST_SCAN_CHECKED_AT,
        CURRENT_DAILY_SCAN_CHECKED_AT,
        LATEST_DAILY_SCAN_CHECKED_AT,
        NEWEST_DAILY_SCAN_CHECKED_AT,
        CURRENT_DAILY_RELEASE_CHECKED_AT,
        CURRENT_OFFICIAL_SCAN_CHECKED_AT,
        CURRENT_SITEMAP_SCAN_CHECKED_AT,
      ].includes(option.checkedAt),
      `${key} has a stale entry check date`,
    );
    assert.equal(option.isVerified, true, `${key} has an unverified entry source`);
    assert.equal(option.isPrimary, true, `${key} primary source is not marked`);
    assert.equal(
      option.entryUrl,
      edition.entryUrl,
      `${key} does not use the direct official entry URL`,
    );
  }
  assert.equal(
    catalogue.editions.filter(
      (item) =>
        item.seriesSlug === edition.seriesSlug &&
        item.date === edition.date &&
        item.distance === edition.distance,
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
        [catalogueSeries.source_url, catalogueSeries.website]
          .filter(Boolean)
          .some((url) => normalizeUrl(candidate.source) === normalizeUrl(url)),
    ),
    `${edition.seriesSlug} does not expose a current official organiser source`,
  );
}

const longfordSeries = catalogue.seriesList.find(
  (series) => series.slug === "abbott-longford-marathon-2026",
);
assert(longfordSeries, "The canonical Longford festival card disappeared");
assert.deepEqual(
  longfordSeries.distances,
  ["5K", "Half", "Marathon", "Ultra"],
  "Longford must expose all verified festival distances on one card",
);
assert.equal(
  longfordSeries.website,
  "https://eventmaster.ie/event/3x1jhx4tZW",
  "Longford must expose the current event-specific official page",
);

for (const [seriesSlug, date, startTime, source] of [
  [
    "runthrough-battersea-park-july-2027",
    "2027-07-04",
    "10:30",
    "https://www.runthrough.co.uk/event/battersea-park-half-marathon-10k-july-2027",
  ],
  [
    "hertfordshire-half-marathon",
    "2027-11-07",
    "09:00",
    "https://www.runthrough.co.uk/event/hertfordshire-half-marathon-10k-november-2027",
  ],
  [
    "henley-half-marathon-river-trail-run-10k-september",
    "2027-09-04",
    "10:00",
    "https://www.runthrough.co.uk/event/henley-river-half-marathon-10k-junior-race-september-2027",
  ],
]) {
  const edition = dailyHalfTenMileExistingSeriesEditions.find(
    (candidate) => candidate.seriesSlug === seriesSlug && candidate.date === date,
  );
  assert(edition, `${seriesSlug} is missing its verified ${date} edition`);
  assert.equal(edition.startTime, startTime, `${seriesSlug} has the wrong start time`);
  assert.equal(edition.entryUrl, source, `${seriesSlug} does not use direct organiser entry`);
  assert.equal(edition.publishAllDistances, true, `${seriesSlug} must retain all distances`);
  assert.equal(edition.entryOptions?.[0]?.checkedAt, CURRENT_OFFICIAL_SCAN_CHECKED_AT);
}

for (const [seriesSlug, date, startTime, source, publishAllDistances] of [
  [
    "basildon-half",
    "2027-09-12",
    "09:00",
    "https://www.runthrough.co.uk/event/basildon-half-marathon-and-juniors-september-2027",
    false,
  ],
  [
    "cheshire-autumn-half",
    "2027-09-12",
    "09:00",
    "https://www.runthrough.co.uk/event/cheshire-autumn-half-marathon-2027",
    false,
  ],
  [
    "crystal-palce-5k-10k-half-marathon-juniors-december",
    "2027-12-05",
    "10:00",
    "https://www.runthrough.co.uk/event/crystal-palace-5k-10k-half-marathon-juniors-december-2027",
    true,
  ],
  [
    "holkham-half-10k",
    "2027-05-16",
    "09:00",
    "https://www.runthrough.co.uk/event/holkham-half-marathon-10k-may-2027",
    true,
  ],
  [
    "newark-half-marathon",
    "2027-08-15",
    "09:00",
    "https://www.runthrough.co.uk/event/newark-half-marathon-august-2027",
    false,
  ],
  [
    "newbury-racecourse-5k-10k-half-marathon-august",
    "2027-08-14",
    null,
    "https://www.runthrough.co.uk/event/newbury-racecourse-half-marathon-10k-5k-august-2027",
    true,
  ],
  [
    "warwick-half-marathon",
    "2027-01-31",
    "09:00",
    "https://www.runthrough.co.uk/event/warwick-half-marathon-january-2027",
    false,
  ],
  ...[
    ["2027-04-04", "april"],
    ["2027-06-20", "june"],
    ["2027-09-05", "september"],
    ["2027-11-21", "november"],
  ].map(([date, month]) => [
    "wimbledon-common-half-marathon-10k-september",
    date,
    "09:30",
    `https://www.runthrough.co.uk/event/wimbledon-common-half-marathon-10k-${month}-2027`,
    true,
  ]),
]) {
  const edition = dailyHalfTenMileExistingSeriesEditions.find(
    (candidate) => candidate.seriesSlug === seriesSlug && candidate.date === date,
  );
  assert(edition, `${seriesSlug} is missing its verified ${date} sitemap edition`);
  if (startTime) assert.equal(edition.startTime, startTime, `${seriesSlug} has the wrong start time`);
  assert.equal(edition.entryUrl, source, `${seriesSlug} does not use direct organiser entry`);
  assert.equal(
    edition.publishAllDistances ?? false,
    publishAllDistances,
    `${seriesSlug} has the wrong distance-publication mode`,
  );
  assert.equal(edition.entryOptions?.[0]?.checkedAt, CURRENT_SITEMAP_SCAN_CHECKED_AT);
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

const womenCanEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) => edition.seriesSlug === "women-can-marathon" && edition.date === "2027-04-18",
);
assert(womenCanEdition, "The Women Can 2027 half-marathon enrichment is missing");
assert.equal(womenCanEdition.startTime, "11:00", "Women Can has the wrong half-marathon start");
assert.equal(
  womenCanEdition.publishAllDistances,
  true,
  "Women Can must retain both same-day distances",
);
assert.equal(
  womenCanEdition.entryUrl,
  "https://www.sientries.co.uk/enter.php?event_id=17314",
  "Women Can does not use the direct official entry URL",
);
assert.deepEqual(
  dailyHalfTenMileSeriesOverrides["women-can-marathon"].distances,
  ["Marathon", "Half", "10K"],
  "The existing Women Can card was not enriched with its official distances",
);

const malhamEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) => edition.seriesSlug === "malham-half-marathon" && edition.date === "2027-09-04",
);
assert(malhamEdition, "The verified Malham 2027 half-marathon enrichment is missing");
assert.equal(malhamEdition.startTime, "10:00", "Malham has the wrong half-marathon start");
assert.equal(malhamEdition.status, "Open", "Malham should expose its now-open entry");
assert.equal(
  malhamEdition.entryUrl,
  "https://www.sientries.co.uk/series.php?series_id=896",
  "Malham does not use the direct official series checkout",
);
assert.equal(
  malhamEdition.entryOptions?.[0]?.checkedAt,
  NEWEST_DAILY_SCAN_CHECKED_AT,
  "Malham entry provenance was not refreshed on 6 September",
);
assert.equal(
  dailyHalfTenMileSeriesOverrides["malham-half-marathon"].source_url,
  "https://www.sientries.co.uk/event/malham-trail-half-2027",
  "Malham does not expose the current official event source on its existing card",
);

const bronteEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) => edition.seriesSlug === "bronte-half-marathon" && edition.date === "2026-09-20",
);
assert(bronteEdition, "The verified Bronte 2026 half-marathon enrichment is missing");
assert.equal(bronteEdition.startTime, "09:00", "Bronte has the wrong start time");
assert.equal(bronteEdition.status, "Open", "Bronte should expose open entry");
assert.equal(bronteEdition.publishAllDistances, true, "Bronte must retain both same-day distances");
assert.equal(
  bronteEdition.entryUrl,
  "https://racebest.com/races/xvxvu/enter",
  "Bronte does not use the direct official entry URL",
);
assert.deepEqual(
  dailyHalfTenMileSeriesOverrides["bronte-half-marathon"].distances,
  ["Half", "10K"],
  "The existing Bronte card was not enriched with both official distances",
);
assert.equal(
  dailyHalfTenMileSeriesOverrides["bronte-half-marathon"].source_url,
  "https://www.sueryder.org/get-involved/fundraise-for-us/events/bronte-half-marathon/",
  "Bronte does not expose the official organiser source",
);

const scurryEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) =>
    edition.seriesSlug === "scurry-around-vogrie-country-park-2027" &&
    edition.date === "2027-01-17",
);
assert(scurryEdition, "The verified Vogrie 2027 half-marathon enrichment is missing");
assert.equal(scurryEdition.startTime, "09:30", "Vogrie has the wrong half-marathon start");
assert.equal(scurryEdition.status, "Open", "Vogrie should expose open entry");
assert.equal(scurryEdition.publishAllDistances, true, "Vogrie must retain all same-day distances");
assert.equal(
  scurryEdition.entryUrl,
  "https://www.entrycentral.com/ScurryVogrieTyneValley",
  "Vogrie does not use the direct official entry URL",
);

const farndaleEdition = dailyHalfTenMileExistingSeriesEditions.find(
  (edition) =>
    edition.seriesSlug === "hardmoors-farndale-trail-races" && edition.date === "2027-08-08",
);
assert(farndaleEdition, "The verified Farndale 2027 half-marathon enrichment is missing");
assert.equal(farndaleEdition.startTime, "10:00", "Farndale has the wrong half start");
assert.equal(farndaleEdition.status, "TBC", "Farndale should not advertise entry yet");
assert.equal(farndaleEdition.entryUrl, undefined, "Farndale must not expose a premature checkout");
assert.equal(
  farndaleEdition.publishAllDistances,
  true,
  "Farndale must retain all same-day distances",
);
assert.deepEqual(
  dailyHalfTenMileSeriesOverrides["hardmoors-farndale-trail-races"].distances,
  ["Marathon", "Half", "10K"],
  "Farndale is missing an official distance",
);

const collingbourneEdition = catalogue.editions.find(
  (edition) =>
    edition.seriesSlug === "collingbourne-races" &&
    edition.date === "2027-05-08" &&
    edition.distance === "Half",
);
assert(collingbourneEdition, "The existing Collingbourne 2027 half disappeared");
assert.equal(collingbourneEdition.startTime, "08:30", "Collingbourne has the wrong start time");
assert.equal(
  collingbourneEdition.entryUrl,
  "https://www.sientries.co.uk/enter.php?event_id=18212",
  "Collingbourne does not use the current direct official checkout",
);
assert.deepEqual(
  collingbourneEdition.entryOptions,
  dailyHalfTenMileEntryOptions["collingbourne-races|2027-05-08|Half"],
  "Collingbourne does not use the verified official entry option",
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

const blarneyEdition = catalogue.editions.find(
  (edition) =>
    edition.seriesSlug === "blarney-stone-mad-half-marathon-2027" &&
    edition.date === "2027-03-14" &&
    edition.distance === "Half",
);
assert(blarneyEdition, "The approved Blarney Stone Mad Half edition disappeared");
assert.equal(blarneyEdition.status, "TBC", "Blarney entry must remain future-dated");
assert.equal(blarneyEdition.entryUrl, undefined, "Blarney must not expose a premature checkout");
assert.equal(blarneyEdition.entryOptions, undefined, "Blarney must not expose premature entry options");
assert.equal(
  blarneyEdition.source,
  "https://eventmaster.ie/event/eoRKHrKF8x",
  "Blarney does not retain direct official provenance",
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
    (candidate) => candidate.slug === "battersea-park-half-marathon-10k-5k-april-2027",
  ),
  "The internally conflicted Battersea Park April candidate must remain held",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) =>
      candidate.slug === "finsbury-park-half-marathon-5k-10k-half-marathon-april-2027",
  ),
  "Finsbury Park April must remain held until its stale prior date is atomically replaced",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "punk-panther-dales-dazzler-2027",
  ),
  "Dales Dazzler must remain outside the canonical half catalogue while its distance conflicts",
);
for (const [slug, message] of [
  [
    "derby-running-festival-5k-10k-half-marathon-august-2027",
    "Derby Running Festival must remain held while its official 2026/2027 copy conflicts",
  ],
  [
    "victoria-park-half-marathon-10k-5k-january-2027",
    "Victoria Park January must retain prior provenance while the new official page conflicts",
  ],
  ...["january", "february", "march", "april"].map((month) => [
    `run-dorney-lake-half-marathon-10k-5k-${month}-2027`,
    `Dorney Lake ${month} must remain held while its official date and start-time copy conflict`,
  ]),
]) {
  assert(
    dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === slug),
    message,
  );
}
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "delphi-half-marathon-10k-2027",
  ),
  "Delphi Half must remain held while its official start times conflict",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "borrowdale-trail-half-marathon-2027",
  ),
  "Borrowdale Trail Half must remain held while its race licence is pending",
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
  dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === "clowne-half-marathon-2026"),
  "Clowne Half must remain held while its race licence is TBC",
);
assert(
  !dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === "tadcaster-10-2026"),
  "Licensed Tadcaster 10 must not remain in the research queue",
);
assert(
  dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === "temple-newsam-10-2027"),
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
assert(
  dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === "winter-wipeout-2027"),
  "Winter Wipeout must remain held while its half-marathon distance is approximate",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "cbte-charm-bracelet-half-marathon-2027",
  ),
  "Charm Bracelet must remain held from the canonical half catalogue at 14.35 miles",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "silverbacktrails-othnesberys-revenge-half-marathon-2027",
  ),
  "Othnesbery's Revenge must remain held while its year-specific heading conflicts",
);
assert(
  dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === "lundy-island-race-2027"),
  "Lundy Island must remain held from the canonical half catalogue at 13.5 miles",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "abbeyknockmoy-half-marathon-2027",
  ),
  "Abbeyknockmoy must remain held while its Athletics Ireland permit is pending",
);
const kinsaleSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "kinsale-10-mile-2027",
);
const kinsaleEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "kinsale-10-mile-2027",
);
assert(kinsaleSeries, "Kinsale 10 was not published after its permit cleared");
assert.equal(kinsaleEdition?.date, "2027-02-28", "Kinsale 10 date changed unexpectedly");
assert.equal(kinsaleEdition?.distance, "10mi", "Kinsale 10 lost its canonical distance");
assert.equal(kinsaleEdition?.startTime, "10:30", "Kinsale 10 start time changed unexpectedly");
assert.equal(kinsaleEdition?.status, "TBC", "Kinsale 10 must remain closed before sales open");
assert(!kinsaleEdition?.entryOptions?.length, "Kinsale 10 must not expose entry before 6 November");
assert.equal(
  kinsaleSeries.source_url,
  "https://eventmaster.ie/event/v7jyuPoSb4",
  "Kinsale 10 lost its official permit provenance",
);

const mallowSeries = dailyHalfTenMileSeries.find(
  (series) => series.slug === "mallow-10-mile-road-race-2027",
);
const mallowEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "mallow-10-mile-road-race-2027",
);
assert(mallowSeries && mallowEdition, "The licensed Mallow 10 Mile edition is missing");
assert.equal(mallowEdition.date, "2027-03-21", "Mallow 10 Mile has the wrong date");
assert.equal(mallowEdition.distance, "10mi", "Mallow uses the wrong distance");
assert.equal(mallowEdition.status, "TBC", "Mallow must remain closed until registration opens");
assert(!mallowEdition.entryOptions?.length, "Mallow must not expose an unopened checkout");
assert.equal(
  mallowSeries.source_url,
  "https://athleticsireland.eventmaster.ie/event-calendar/",
  "Mallow 10 Mile lost its official governing-body provenance",
);
assert.match(
  mallowSeries.description,
  new RegExp(NEWEST_DAILY_RELEASE_CHECKED_AT),
  "Mallow 10 Mile has a stale source check",
);

const omaghEdition = dailyHalfTenMileEditions.find(
  (edition) => edition.seriesSlug === "spar-omagh-half-marathon-5k-2027",
);
assert.equal(omaghEdition?.date, "2027-04-04", "Omagh Half date changed unexpectedly");
assert.equal(omaghEdition?.status, "TBC", "Omagh Half must remain closed during event setup");
assert(!omaghEdition?.entryOptions?.length, "Omagh Half must not expose an unfinished checkout");

assert.equal(
  dailyHalfTenMileEditionOverrides["tibthorpe-loop|2027-02-20|Half"]?.entryUrl,
  "https://www.sientries.co.uk/enter.php?event_id=17658",
  "Tibthorpe Loop lost its direct official checkout",
);
assert.equal(
  dailyHalfTenMileEntryOptions["tibthorpe-loop|2027-02-20|Half"]?.[0]?.checkedAt,
  "2026-09-09",
  "Tibthorpe Loop has a stale direct-entry check",
);
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "runclare-lisdoonvarna-10-mile-2027",
  ),
  "RunClare Lisdoonvarna 10 must remain held while its permit is pending",
);
for (const slug of [
  "walter-raleigh-round-half-marathon-2027",
  "ranger-ultras-loop-the-loop-2027",
  "dartmoor-great-escape-2027",
]) {
  assert(
    dailyHalfTenMileResearchQueue.some((candidate) => candidate.slug === slug),
    `${slug} must remain held from the canonical half catalogue at its non-standard distance`,
  );
}
assert(
  dailyHalfTenMileResearchQueue.some(
    (candidate) => candidate.slug === "tom-scott-10-mile-road-race-2027",
  ),
  "Tom Scott 10 must remain held while its provisional licence status is unresolved",
);
const irishRunner10 = dailyHalfTenMileResearchQueue.find(
  (candidate) =>
    candidate.slug === "athletics-ireland-race-series-irish-runner-10m-challenge-2027",
);
assert(irishRunner10, "Irish Runner 10M must remain held without an event-specific source URL");
assert.equal(irishRunner10.date, "2027-07-18", "Irish Runner 10M has the wrong date");
assert.match(irishRunner10.reason, /26\/516/, "Irish Runner 10M lost its approved permit");
assert.match(
  irishRunner10.reason,
  /normalized-source duplicate protection/,
  "Irish Runner 10M must document why its verified fixture is not yet public",
);
for (const slug of [
  "runcork-half-marathon-2027",
  "sonia-osullivan-cobh-10-mile-2027",
  "sixmilebridge-half-marathon-2027",
  "limerick-runs-10-mile-2027",
  "ennis-half-marathon-2027",
  "glenmore-challenge-running-festival-2027",
]) {
  const candidate = dailyHalfTenMileResearchQueue.find((item) => item.slug === slug);
  assert(candidate, `${slug} must remain held while its Athletics Ireland permit is pending`);
  assert.match(candidate.reason, /pending approval/, `${slug} lost its permit-pending reason`);
}

assert.deepEqual(
  dailyHalfTenMileRetiredSeriesSlugs,
  ["pagan-midwinter-half-marathon-2027"],
  "The invalidated Pagan canonical-half card must remain in the persistent retirement list",
);
assert(
  !catalogue.seriesList.some((series) => series.slug === "pagan-midwinter-half-marathon-2027"),
  "The over-distance Pagan race must not remain in the public catalogue",
);
assert(
  !catalogue.editions.some(
    (edition) => edition.seriesSlug === "pagan-midwinter-half-marathon-2027",
  ),
  "The stale Pagan half edition must not remain public",
);
const paganResearch = dailyHalfTenMileResearchQueue.find(
  (candidate) => candidate.slug === "pagan-midwinter-half-marathon-2027",
);
assert(paganResearch, "Pagan must remain traceable in the research queue");
assert.equal(paganResearch.date, "2027-01-30", "Pagan research has the wrong corrected date");
assert.match(paganResearch.reason, /well over 14 miles/, "Pagan lost its non-standard hold reason");

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
  /const SEED_VERSION = "athrecs-[^"]+";/.test(seedSource),
  "The persistent catalogue seed version was not advanced",
);
assert(
  seedSource.includes("for (const retiredSlug of dailyHalfTenMileRetiredSeriesSlugs)"),
  "Persistent seeding does not retire invalidated public event cards",
);
assert(
  packageSource.includes('"verify:uk-ireland-half-ten-mile-daily"'),
  "The daily follow-up verifier is not exposed as an npm script",
);

console.log(
  `Verified ${NEW_SERIES_COUNT} new race series (54 half marathons and 13 ten-milers), ${NEW_EDITION_COUNT} new-series editions, ${EXISTING_SERIES_EDITION_COUNT} verified editions on existing cards, ${dailyHalfTenMileResearchQueue.length} held candidates, ${dailyHalfTenMileRetiredSeriesSlugs.length} retired invalid card and catalogue-level duplicate protection.`,
);
