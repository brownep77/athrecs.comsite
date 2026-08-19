import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [
  { seriesList: coreSeries },
  { editions: coreEditions },
  { raceCollectionEditions, raceCollectionSeries },
  { verifiedUkEditions, verifiedUkSeries },
  { runabcEditions, runabcSeries },
  { multiSportEditions, multiSportSeries },
  { parkrunSeries },
  { worldAthleticsEditions, worldAthleticsSeries },
  { worldTriathlonEditions, worldTriathlonSeries },
  { mrdMarathonEditions, mrdMarathonSeries },
  { mrdEuMarathonEditions, mrdEuMarathonSeries },
  { verifiedAllSportEditions, verifiedAllSportSeries },
  { verifiedGlobalEditions, verifiedGlobalSeries },
  marathonOptions,
  halfMarathonOptions,
  tenKOptions,
  { allFixtureAliases, verifiedFixtureEditionOverrides, verifiedFixtureSeriesOverrides },
  { parkrunDates },
] = await Promise.all([
  import("../src/data/series.ts"),
  import("../src/data/editions.ts"),
  import("../src/data/race-collections.ts"),
  import("../src/data/verified-races-uk.ts"),
  import("../src/data/runabc.ts"),
  import("../src/data/multisport.ts"),
  import("../src/data/parkrun-uk.ts"),
  import("../src/data/world-athletics.ts"),
  import("../src/data/world-triathlon.ts"),
  import("../src/data/mrd-marathons.ts"),
  import("../src/data/mrd-marathons-eu.ts"),
  import("../src/data/verified-all-sport.ts"),
  import("../src/data/verified-global-fixtures.ts"),
  import("../src/data/entry-options-uk-marathons.ts"),
  import("../src/data/entry-options-uk-half-marathons.ts"),
  import("../src/data/entry-options-uk-10ks.ts"),
  import("../src/data/fixture-deduplication.ts"),
  import("../src/lib/athrecs/parkrun-dates.ts"),
]);

const editionOverrides = {
  ...marathonOptions.ukMarathonEditionOverrides,
  ...halfMarathonOptions.ukHalfMarathonEditionOverrides,
  ...tenKOptions.ukTenKEditionOverrides,
  ...verifiedFixtureEditionOverrides,
};
const seriesOverrides = {
  ...marathonOptions.ukMarathonSeriesOverrides,
  ...halfMarathonOptions.ukHalfMarathonSeriesOverrides,
  ...tenKOptions.ukTenKSeriesOverrides,
  ...verifiedFixtureSeriesOverrides,
};

function normalisedName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const coreNames = new Set(coreSeries.map((series) => normalisedName(series.name)));
const usedSlugs = new Set(coreSeries.map((series) => series.slug));
const extraSeries = [];
for (const series of [
  ...raceCollectionSeries,
  ...verifiedAllSportSeries,
  ...verifiedGlobalSeries,
  ...verifiedUkSeries,
  ...runabcSeries,
  ...multiSportSeries,
  ...parkrunSeries,
  ...worldAthleticsSeries,
  ...worldTriathlonSeries,
  ...mrdMarathonSeries,
  ...mrdEuMarathonSeries,
]) {
  if (allFixtureAliases[series.slug]) continue;
  const name = seriesOverrides[series.slug]?.name ?? series.name;
  const nameKey = normalisedName(name);
  if (usedSlugs.has(series.slug) || coreNames.has(nameKey)) continue;
  usedSlugs.add(series.slug);
  coreNames.add(nameKey);
  extraSeries.push(series);
}

const seriesList = [...coreSeries, ...extraSeries].map((series) => ({
  ...series,
  ...seriesOverrides[series.slug],
}));
const extraSlugs = new Set(extraSeries.map((series) => series.slug));
const editionSources = [
  ...coreEditions,
  ...raceCollectionEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...verifiedAllSportEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...verifiedGlobalEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...verifiedUkEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...runabcEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...multiSportEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...worldAthleticsEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...worldTriathlonEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...mrdMarathonEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...mrdEuMarathonEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
];
const seenEditions = new Set();
const editions = [];
for (const sourceEdition of editionSources) {
  const sourceKey = `${sourceEdition.seriesSlug}|${sourceEdition.date}|${sourceEdition.distance}`;
  const edition = { ...sourceEdition, ...editionOverrides[sourceKey] };
  const editionKey = `${edition.seriesSlug}|${edition.date}`;
  if (seenEditions.has(editionKey)) continue;
  seenEditions.add(editionKey);
  editions.push(edition);
}

const supportedSports = [
  "Running",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Parkrun",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
  "Athletics",
];
const checkpointSports = ["Aquabike", "Rowing", "OCR"];
const today = "2026-08-19";
const coverageSnapshot = JSON.parse(
  await fs.readFile(
    new URL("../docs/all-sport-fixtures/catalogue-audit-2026-08-19.json", import.meta.url),
    "utf8",
  ),
);

assert.equal(verifiedAllSportSeries.length, 3, "Checkpoint must contain three verified series");
assert.equal(verifiedAllSportEditions.length, 3, "Checkpoint must contain three verified editions");
assert.deepEqual(
  [...new Set(verifiedAllSportSeries.map((series) => series.sport))].sort(),
  [...checkpointSports].sort(),
  "Checkpoint sports changed unexpectedly",
);

const seriesBySlug = new Map(seriesList.map((series) => [series.slug, series]));
for (const series of verifiedAllSportSeries) {
  assert.equal(
    seriesBySlug.get(series.slug)?.sport,
    series.sport,
    `${series.slug} is not in catalogue`,
  );
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} needs an HTTPS source`);
}

for (const edition of verifiedAllSportEditions) {
  assert(edition.date >= today, `${edition.seriesSlug} is not a future fixture`);
  assert.equal(edition.entryOptions?.length, 1, `${edition.seriesSlug} needs one primary entry`);
  const [entry] = edition.entryOptions;
  assert.equal(entry.entryType, "official", `${edition.seriesSlug} entry is not official`);
  assert.equal(entry.isVerified, true, `${edition.seriesSlug} entry has not been verified`);
  assert.equal(entry.isPrimary, true, `${edition.seriesSlug} entry is not primary`);
  assert.equal(entry.checkedAt, today, `${edition.seriesSlug} check date is stale`);
  assert.match(edition.source, /^https:\/\//, `${edition.seriesSlug} needs an HTTPS source`);
}

const catalogueFutureCounts = Object.fromEntries(supportedSports.map((sport) => [sport, 0]));
for (const edition of editions) {
  if (edition.date < today) continue;
  const sport = seriesBySlug.get(edition.seriesSlug)?.sport;
  if (sport in catalogueFutureCounts) catalogueFutureCounts[sport] += 1;
}

// Parkrun editions are generated weekly by the database seed rather than held
// as static edition rows. Count every scheduled Saturday 5K and Sunday junior
// 2K remaining in the configured calendar window.
catalogueFutureCounts.Parkrun = seriesList
  .filter((series) => series.sport === "Parkrun")
  .reduce((count, series) => count + parkrunDates(series.name, today).length, 0);

for (const sport of supportedSports) {
  assert(catalogueFutureCounts[sport] > 0, `${sport} has no current or future fixture`);
  assert(
    catalogueFutureCounts[sport] >= coverageSnapshot.future_fixture_counts[sport],
    `${sport} lost fixtures from the saved all-sport checkpoint`,
  );
}

process.stdout.write(
  JSON.stringify(
    {
      checked_at: today,
      supported_sports: supportedSports.length,
      sports_with_future_fixtures: Object.values(catalogueFutureCounts).filter(Boolean).length,
      checkpoint_added: Object.fromEntries(
        checkpointSports.map((sport) => [
          sport,
          verifiedAllSportSeries.filter((series) => series.sport === sport).length,
        ]),
      ),
      future_fixture_counts: catalogueFutureCounts,
      participant_result_rows: "excluded",
    },
    null,
    2,
  ) + "\n",
);
