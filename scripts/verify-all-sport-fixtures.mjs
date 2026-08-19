import assert from "node:assert/strict";

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
]);

const seriesList = [
  ...coreSeries,
  ...raceCollectionSeries,
  ...verifiedAllSportSeries,
  ...verifiedUkSeries,
  ...runabcSeries,
  ...multiSportSeries,
  ...parkrunSeries,
  ...worldAthleticsSeries,
  ...worldTriathlonSeries,
  ...mrdMarathonSeries,
  ...mrdEuMarathonSeries,
];
const editions = [
  ...coreEditions,
  ...raceCollectionEditions,
  ...verifiedAllSportEditions,
  ...verifiedUkEditions,
  ...runabcEditions,
  ...multiSportEditions,
  ...worldAthleticsEditions,
  ...worldTriathlonEditions,
  ...mrdMarathonEditions,
  ...mrdEuMarathonEditions,
];

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
// as static edition rows. Each configured venue therefore contributes a
// current recurring fixture to this coverage check.
catalogueFutureCounts.Parkrun = parkrunSeries.length;

for (const sport of supportedSports) {
  assert(catalogueFutureCounts[sport] > 0, `${sport} has no current or future fixture`);
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
