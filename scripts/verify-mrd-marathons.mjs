import assert from "node:assert/strict";

const [
  { MRD_EUROPE_SOURCE_URL, mrdEuMarathonEditions, mrdEuMarathonSeries, mrdEuMarathonSourceRows },
  {
    MRD_INTERNATIONAL_SOURCE_URL,
    mrdIntlMarathonEditions,
    mrdIntlMarathonSeries,
    mrdIntlMarathonSourceRows,
  },
  { MRD_SOURCE_CHECKED_AT },
  { verifiedFixtureAliases, verifiedFixtureEditionReplacements },
] = await Promise.all([
  import("../src/data/mrd-marathons-eu.ts"),
  import("../src/data/mrd-marathons-intl.ts"),
  import("../src/data/mrd-marathon-source.ts"),
  import("../src/data/fixture-deduplication.ts"),
]);

assert.equal(MRD_SOURCE_CHECKED_AT, "2026-08-20");
assert.equal(
  MRD_EUROPE_SOURCE_URL,
  "http://www.marathonrunnersdiary.com/races/europe-marathons-list.php",
);
assert.equal(
  MRD_INTERNATIONAL_SOURCE_URL,
  "http://www.marathonrunnersdiary.com/races/international-marathons-list.php",
);

assert.equal(mrdEuMarathonSourceRows.length, 89);
assert.equal(mrdEuMarathonSeries.length, 89);
assert.equal(mrdEuMarathonEditions.length, 63);
assert.equal(mrdIntlMarathonSourceRows.length, 69);
assert.equal(mrdIntlMarathonSeries.length, 69);
assert.equal(mrdIntlMarathonEditions.length, 58);

const rows = [...mrdEuMarathonSourceRows, ...mrdIntlMarathonSourceRows];
const detailPaths = rows.map((row) => row[4]);
assert.equal(new Set(detailPaths).size, detailPaths.length, "MRD detail paths must be unique");

for (const [slug, name, city, country, detailPath, date] of rows) {
  assert(slug && name && city && country && detailPath, `Incomplete MRD row: ${slug || name}`);
  assert(!["U.S.A.", "U.A.E."].includes(country), `Unnormalised country: ${country}`);
  if (date) {
    assert.match(date, /^20\d{2}-\d{2}-\d{2}$/);
    assert(date >= MRD_SOURCE_CHECKED_AT, `Past MRD snapshot edition: ${slug}|${date}`);
  }
}

const sourceFingerprints = rows.map(([slug, name, city, country, , date]) =>
  [slug, name, city, country, date ?? "TBC"].join("|"),
);
assert.equal(
  new Set(sourceFingerprints).size,
  sourceFingerprints.length,
  "MRD source rows contain an exact duplicate",
);

function editionDate(editions, slug) {
  return editions.find((edition) => edition.seriesSlug === slug)?.date;
}

assert.equal(editionDate(mrdEuMarathonEditions, "leipziger-winter-marathon"), "2027-01-16");
assert.equal(editionDate(mrdIntlMarathonEditions, "jordan-impact-marathon"), "2026-11-28");
assert.equal(editionDate(mrdEuMarathonEditions, "warsaw-marathon"), "2026-09-27");
assert.equal(
  verifiedFixtureAliases["wa-48th-warsaw-marathon-7236127"],
  "warsaw-marathon",
  "The World Athletics Warsaw duplicate must resolve to the readable canonical series",
);

const expectedDateCorrections = [
  ["dublin-marathon", "2026-10-24", "2026-10-25"],
  ["venice-marathon", "2026-10-24", "2026-10-25"],
  ["chicago-marathon", "2026-10-10", "2026-10-11"],
  ["barcelona-marathon", "2027-03-15", "2027-03-14"],
  ["paris-marathon", "2027-04-10", "2027-04-11"],
  ["paris-marathon", "2027-04-12", "2027-04-11"],
  ["rome-marathon", "2027-03-21", "2027-03-14"],
  ["marrakech-marathon", "2027-01-24", "2027-01-31"],
  ["great-wall-marathon", "2027-05-14", "2027-05-15"],
  ["sanlam-cape-town-marathon", "2027-05-22", "2027-05-23"],
];

for (const [seriesSlug, fromDate, toDate] of expectedDateCorrections) {
  assert(
    verifiedFixtureEditionReplacements.some(
      (replacement) =>
        replacement.seriesSlug === seriesSlug &&
        replacement.distance === "Marathon" &&
        replacement.fromDate === fromDate &&
        replacement.toDate === toDate,
    ),
    `Missing verified marathon date replacement: ${seriesSlug}|${fromDate}`,
  );
}

process.stdout.write(
  JSON.stringify(
    {
      checked_at: MRD_SOURCE_CHECKED_AT,
      source_rows: rows.length,
      european_series: mrdEuMarathonSeries.length,
      european_dated_editions: mrdEuMarathonEditions.length,
      international_series: mrdIntlMarathonSeries.length,
      international_dated_editions: mrdIntlMarathonEditions.length,
      tbc_series: rows.filter((row) => !row[5]).length,
      warsaw_duplicate_retired: true,
      nearby_date_corrections: expectedDateCorrections.length,
    },
    null,
    2,
  ) + "\n",
);
