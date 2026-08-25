import assert from "node:assert/strict";

const [
  { seriesList: coreSeries },
  { editions: coreEditions },
  { raceCollectionEditions, raceCollectionSeries },
  { marathonDesSablesEditions, marathonDesSablesSeries },
  { verifiedUkEditions, verifiedUkSeries },
  { runabcEditions, runabcSeries },
  { multiSportEditions, multiSportSeries },
  { parkrunSeries },
  { worldAthleticsEditions, worldAthleticsSeries },
  { worldTriathlonEditions, worldTriathlonSeries },
  { mrdMarathonEditions, mrdMarathonSeries },
  { mrdEuMarathonEditions, mrdEuMarathonSeries, mrdEuMarathonSourceRows },
  { mrdIntlMarathonEditions, mrdIntlMarathonSeries, mrdIntlMarathonSourceRows },
  { aimsEuropeEditions, aimsEuropeSeries, aimsEuropeSeriesOverrides },
  { comradesEditions, comradesSeries },
  { twoOceansEditions, twoOceansSeries },
  { verifiedAllSportEditions, verifiedAllSportSeries },
  { verifiedGlobalEditions, verifiedGlobalSeries },
  marathonOptions,
  halfMarathonOptions,
  tenKOptions,
  {
    allFixtureAliases,
    verifiedFixtureAliases,
    verifiedFixtureEditionOverrides,
    verifiedFixtureEditionReplacements,
    verifiedFixtureSeriesOverrides,
  },
] = await Promise.all([
  import("../src/data/series.ts"),
  import("../src/data/editions.ts"),
  import("../src/data/race-collections.ts"),
  import("../src/data/marathon-des-sables.ts"),
  import("../src/data/verified-races-uk.ts"),
  import("../src/data/runabc.ts"),
  import("../src/data/multisport.ts"),
  import("../src/data/parkrun-uk.ts"),
  import("../src/data/world-athletics.ts"),
  import("../src/data/world-triathlon.ts"),
  import("../src/data/mrd-marathons.ts"),
  import("../src/data/mrd-marathons-eu.ts"),
  import("../src/data/mrd-marathons-intl.ts"),
  import("../src/data/aims-europe-road-races.ts"),
  import("../src/data/comrades.ts"),
  import("../src/data/two-oceans.ts"),
  import("../src/data/verified-all-sport.ts"),
  import("../src/data/verified-global-fixtures.ts"),
  import("../src/data/entry-options-uk-marathons.ts"),
  import("../src/data/entry-options-uk-half-marathons.ts"),
  import("../src/data/entry-options-uk-10ks.ts"),
  import("../src/data/fixture-deduplication.ts"),
]);

const aliases = allFixtureAliases;
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
  ...aimsEuropeSeriesOverrides,
};
const today = "2026-08-25";

function exactName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function looseName(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(
      /\b(?:the|race|event|festival|run|running|championships?|saturday|sunday|sat|sun)\b/g,
      " ",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value) {
  return looseName(value).replace(/\s+/g, "");
}

function similarity(left, right) {
  const leftTokens = new Set(looseName(left).split(/\s+/).filter(Boolean));
  const rightTokens = new Set(looseName(right).split(/\s+/).filter(Boolean));
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return shared / Math.max(leftTokens.size, rightTokens.size, 1);
}

const coreNames = new Set(coreSeries.map((series) => exactName(series.name)));
const usedSlugs = new Set(coreSeries.map((series) => series.slug));
const extraSeries = [];
for (const series of [
  ...raceCollectionSeries,
  ...marathonDesSablesSeries,
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
  ...mrdIntlMarathonSeries,
  ...aimsEuropeSeries,
  ...comradesSeries,
  ...twoOceansSeries,
]) {
  if (aliases[series.slug]) continue;
  const key = exactName(seriesOverrides[series.slug]?.name ?? series.name);
  if (usedSlugs.has(series.slug) || coreNames.has(key)) continue;
  usedSlugs.add(series.slug);
  coreNames.add(key);
  extraSeries.push(series);
}

const seriesList = [...coreSeries, ...extraSeries].map((series) => ({
  ...series,
  ...seriesOverrides[series.slug],
}));
const extraSlugs = new Set(extraSeries.map((series) => series.slug));
const editionSources = [
  ...aimsEuropeEditions.filter((edition) => usedSlugs.has(edition.seriesSlug)),
  ...coreEditions,
  ...raceCollectionEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...marathonDesSablesEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...verifiedAllSportEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...verifiedGlobalEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...verifiedUkEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...runabcEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...multiSportEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...worldAthleticsEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...worldTriathlonEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...mrdMarathonEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...mrdEuMarathonEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...mrdIntlMarathonEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...comradesEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...twoOceansEditions.filter((edition) => extraSlugs.has(edition.seriesSlug)),
];

const seenEditions = new Set();
const editions = [];
for (const sourceEdition of editionSources) {
  const sourceKey = `${sourceEdition.seriesSlug}|${sourceEdition.date}|${sourceEdition.distance}`;
  const edition = { ...sourceEdition, ...editionOverrides[sourceKey] };
  const key = `${edition.seriesSlug}|${edition.date}`;
  if (seenEditions.has(key)) continue;
  seenEditions.add(key);
  editions.push(edition);
}

const seriesBySlug = new Map(seriesList.map((series) => [series.slug, series]));
for (const [alias, canonical] of Object.entries(verifiedFixtureAliases)) {
  assert(!seriesBySlug.has(alias), `Retired duplicate remains in catalogue: ${alias}`);
  assert(seriesBySlug.has(canonical), `Duplicate alias has no canonical event: ${canonical}`);
}

for (const replacement of verifiedFixtureEditionReplacements) {
  assert(
    editions.some(
      (edition) =>
        edition.seriesSlug === replacement.seriesSlug &&
        edition.date === replacement.toDate &&
        edition.distance === (replacement.toDistance ?? replacement.distance),
    ),
    `Corrected fixture is missing: ${replacement.seriesSlug}|${replacement.toDate}`,
  );
  assert(
    !editions.some(
      (edition) =>
        edition.seriesSlug === replacement.seriesSlug &&
        edition.date === replacement.fromDate &&
        edition.distance === replacement.distance,
    ),
    `Incorrect fixture date remains: ${replacement.seriesSlug}|${replacement.fromDate}`,
  );
}

const groups = new Map();
for (const edition of editions) {
  if (edition.date < today) continue;
  const series = seriesBySlug.get(edition.seriesSlug);
  if (!series) continue;
  const key = [edition.date, series.sport, compact(series.country), compact(series.city)].join("|");
  const rows = groups.get(key) ?? [];
  rows.push({ edition, series });
  groups.set(key, rows);
}

const highConfidenceDuplicates = [];
let reviewedCandidates = 0;
for (const [key, rows] of groups) {
  for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
      const left = rows[leftIndex];
      const right = rows[rightIndex];
      const score = similarity(left.series.name, right.series.name);
      const leftName = compact(left.series.name);
      const rightName = compact(right.series.name);
      if (score < 0.75 && !leftName.includes(rightName) && !rightName.includes(leftName)) continue;
      reviewedCandidates += 1;
      const resultsBasePair =
        left.series.slug.startsWith("rb-") || right.series.slug.startsWith("rb-");
      const sameSource = left.edition.source === right.edition.source;
      const sameDistanceAndName = score === 1 && left.edition.distance === right.edition.distance;
      if (sameSource || sameDistanceAndName || (resultsBasePair && score >= 0.6)) {
        highConfidenceDuplicates.push({
          key,
          left: left.series.slug,
          right: right.series.slug,
          score,
        });
      }
    }
  }
}

assert.deepEqual(
  highConfidenceDuplicates,
  [],
  "High-confidence fixture duplicates remain after canonicalisation",
);

const mrdCanonicalSlugs = new Set(
  [...mrdEuMarathonSourceRows, ...mrdIntlMarathonSourceRows].map(([slug]) => aliases[slug] ?? slug),
);
const editionsByLocation = new Map();
for (const edition of editions) {
  if (edition.date < today || !["Marathon", "Other"].includes(edition.distance)) continue;
  const series = seriesBySlug.get(edition.seriesSlug);
  if (!series) continue;
  const key = [compact(series.country), compact(series.city)].join("|");
  const rows = editionsByLocation.get(key) ?? [];
  rows.push({ edition, series });
  editionsByLocation.set(key, rows);
}

const nearbyMrdDuplicates = [];
const nearbyPairs = new Set();
for (const rows of editionsByLocation.values()) {
  for (const left of rows) {
    if (!mrdCanonicalSlugs.has(left.series.slug)) continue;
    for (const right of rows) {
      if (left.edition === right.edition) continue;
      const pair = [
        `${left.series.slug}|${left.edition.date}`,
        `${right.series.slug}|${right.edition.date}`,
      ].sort();
      const pairKey = pair.join("::");
      if (nearbyPairs.has(pairKey)) continue;
      nearbyPairs.add(pairKey);
      const days = Math.abs(
        (Date.parse(left.edition.date) - Date.parse(right.edition.date)) / 86_400_000,
      );
      if (days === 0 || days > 14) continue;
      const score = similarity(left.series.name, right.series.name);
      const leftName = compact(left.series.name);
      const rightName = compact(right.series.name);
      const sameSeries = left.series.slug === right.series.slug;
      const explicitShortDistance = /\b(?:half|(?:5|10)\s*k(?:m)?)\b/i;
      if (
        !sameSeries &&
        (explicitShortDistance.test(left.series.name) ||
          explicitShortDistance.test(right.series.name))
      ) {
        continue;
      }
      if (
        !sameSeries &&
        score < 0.75 &&
        !leftName.includes(rightName) &&
        !rightName.includes(leftName)
      ) {
        continue;
      }
      nearbyMrdDuplicates.push({
        left: pair[0],
        right: pair[1],
        days,
        score,
      });
    }
  }
}

assert.deepEqual(
  nearbyMrdDuplicates,
  [],
  "Same or similar MRD marathon records remain on nearby dates",
);

process.stdout.write(
  JSON.stringify(
    {
      checked_at: today,
      sports_checked: [...new Set(seriesList.map((series) => series.sport))].sort(),
      merged_series_checked: seriesList.length,
      static_editions_checked: editions.length,
      same_date_near_name_candidates_reviewed: reviewedCandidates,
      duplicate_series_retired: Object.keys(verifiedFixtureAliases).length,
      incorrect_second_day_dates_corrected: verifiedFixtureEditionReplacements.length,
      high_confidence_duplicates_remaining: highConfidenceDuplicates.length,
      nearby_mrd_duplicates_remaining: nearbyMrdDuplicates.length,
    },
    null,
    2,
  ) + "\n",
);
