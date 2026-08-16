import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { gunzipSync } from "node:zlib";

const [
  { athletes: athletesBase },
  { athletesRn2025B1 },
  { athletesRn2025B2 },
  { athletesRn2025B3 },
  { clubs: baseClubs },
  { athleticsIrelandClubs },
  { belfastClubs },
  { triathlonIrelandClubs },
  { welshAthleticsClubs },
  { auditedClubAdditions, clubSlugAliases },
  { editions },
  { resultsA },
  { resultsB },
  { resultsRn2025B1 },
  { resultsRn2025B2 },
  { resultsRn2025B3 },
  { seriesList },
  { catalogueMetadata },
] = await Promise.all([
  import("../src/data/athletes.ts"),
  import("../src/data/athletes-rn2025-b1.ts"),
  import("../src/data/athletes-rn2025-b2.ts"),
  import("../src/data/athletes-rn2025-b3.ts"),
  import("../src/data/clubs.ts"),
  import("../src/data/clubs-athletics-ireland.ts"),
  import("../src/data/clubs-belfast.ts"),
  import("../src/data/clubs-triathlon-ireland.ts"),
  import("../src/data/clubs-welsh-athletics.ts"),
  import("../src/data/club-enrichment.ts"),
  import("../src/data/editions.ts"),
  import("../src/data/results-a.ts"),
  import("../src/data/results-b.ts"),
  import("../src/data/results-rn2025-b1.ts"),
  import("../src/data/results-rn2025-b2.ts"),
  import("../src/data/results-rn2025-b3.ts"),
  import("../src/data/series.ts"),
  import("../src/data/catalogue-metadata.ts"),
]);

const athletes = [
  ...athletesBase,
  ...athletesRn2025B1,
  ...athletesRn2025B2,
  ...athletesRn2025B3,
].map((athlete) => ({
  ...athlete,
  club_slug: clubSlugAliases[athlete.club_slug] ?? athlete.club_slug,
  second_club_slug: athlete.second_club_slug
    ? (clubSlugAliases[athlete.second_club_slug] ?? athlete.second_club_slug)
    : undefined,
}));
const clubs = [
  ...baseClubs,
  ...athleticsIrelandClubs,
  ...belfastClubs,
  ...triathlonIrelandClubs,
  ...welshAthleticsClubs,
  ...auditedClubAdditions,
]
  .filter(
    (club, index, rows) =>
      rows.findIndex(
        (candidate) =>
          (clubSlugAliases[candidate.slug] ?? candidate.slug) ===
          (clubSlugAliases[club.slug] ?? club.slug),
      ) === index,
  )
  .map((club) => ({ ...club, slug: clubSlugAliases[club.slug] ?? club.slug }));
const results = [
  ...resultsA,
  ...resultsB,
  ...resultsRn2025B1,
  ...resultsRn2025B2,
  ...resultsRn2025B3,
];

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} contains duplicates`);
}

assert.equal(athletesRn2025B2.length, 90, "Run Norwich batch 2 must add 90 athletes");
assert.equal(resultsRn2025B2.length, 93, "Run Norwich batch 2 must add 93 results");
assert(
  athletesRn2025B2.every((athlete) => !/placeholder/i.test(athlete.bio)),
  "Run Norwich batch 2 contains a placeholder biography",
);
assert(
  athletesRn2025B2.every((athlete) => athlete.slug !== "tom-lamb"),
  "Run Norwich batch 2 must not duplicate the existing tom-lamb slug",
);
assertUnique(
  athletesRn2025B2.map((athlete) => athlete.slug),
  "Run Norwich batch 2 athlete slugs",
);

assert.equal(athletesRn2025B3.length, 93, "Run Norwich batch 3 must add 93 athletes");
assert.equal(resultsRn2025B3.length, 94, "Run Norwich batch 3 must add 94 results");
assert(
  athletesRn2025B3.every((athlete) => !/placeholder/i.test(athlete.bio)),
  "Run Norwich batch 3 contains a placeholder biography",
);
assertUnique(
  athletesRn2025B3.map((athlete) => athlete.slug),
  "Run Norwich batch 3 athlete slugs",
);
const preBatch3AthleteSlugs = new Set(
  [...athletesBase, ...athletesRn2025B1, ...athletesRn2025B2].map((athlete) => athlete.slug),
);
assert(
  athletesRn2025B3.every((athlete) => !preBatch3AthleteSlugs.has(athlete.slug)),
  "Run Norwich batch 3 includes an athlete already present in the catalogue",
);

// This verifier loads the original catalogue plus the first three Run Norwich
// batches for its historical assertions below. Club sources are all loaded so
// the canonical club count can still be checked against production metadata.
assert.equal(
  clubs.length,
  catalogueMetadata.merged_counts.clubs,
  "Canonical club count does not match the recorded metadata",
);

assertUnique(
  clubs.map((club) => club.slug),
  "Club slugs",
);
assertUnique(
  athletes.map((athlete) => athlete.slug),
  "Athlete slugs",
);
assertUnique(
  seriesList.map((series) => series.slug),
  "Race-series slugs",
);
assertUnique(
  editions.map((edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`),
  "Edition keys",
);
assertUnique(
  results.map(
    (result) => `${result.eventSlug}|${result.date}|${result.distance}|${result.athleteSlug}`,
  ),
  "Result keys",
);

for (const [rows, label] of [
  [athletes, "Athlete source IDs"],
  [seriesList, "Race-series source IDs"],
  [editions, "Edition source IDs"],
  [results, "Result source IDs"],
]) {
  assertUnique(
    rows.map((row) => row.source_id).filter((value) => value != null),
    label,
  );
}
assertUnique(athletes.map((athlete) => athlete.athrecs_id).filter(Boolean), "Athrecs IDs");

const clubSlugs = new Set(clubs.map((club) => club.slug));
const athleteSlugs = new Set(athletes.map((athlete) => athlete.slug));
const seriesSlugs = new Set(seriesList.map((series) => series.slug));
const editionKeys = new Set(
  editions.map((edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`),
);
for (const athlete of athletes) {
  assert(clubSlugs.has(athlete.club_slug), `Unknown primary club ${athlete.club_slug}`);
  if (athlete.second_club_slug) {
    assert(
      clubSlugs.has(athlete.second_club_slug),
      `Unknown secondary club ${athlete.second_club_slug}`,
    );
  }
  if (athlete.parent_athlete_slug) {
    assert(
      athleteSlugs.has(athlete.parent_athlete_slug),
      `Unknown parent athlete ${athlete.parent_athlete_slug}`,
    );
  }
}
for (const edition of editions) {
  assert(seriesSlugs.has(edition.seriesSlug), `Unknown series ${edition.seriesSlug}`);
}
for (const result of results) {
  assert(athleteSlugs.has(result.athleteSlug), `Unknown athlete ${result.athleteSlug}`);
  assert(
    editionKeys.has(`${result.eventSlug}|${result.date}|${result.distance}`),
    `Unknown edition for ${result.athleteSlug} at ${result.eventSlug}`,
  );
}

const runNorwichPlaces = results
  .filter(
    (result) =>
      result.eventSlug === "run-norwich" &&
      result.date === "2025-09-07" &&
      result.distance === "10K" &&
      result.place >= 101 &&
      result.place <= 200,
  )
  .map((result) => result.place)
  .sort((a, b) => a - b);
assert.deepEqual(
  runNorwichPlaces,
  Array.from({ length: 100 }, (_, index) => index + 101),
  "Run Norwich 2025 places 101–200 must be present exactly once",
);

const runNorwichBatch3Places = results
  .filter(
    (result) =>
      result.eventSlug === "run-norwich" &&
      result.date === "2025-09-07" &&
      result.distance === "10K" &&
      result.place >= 201 &&
      result.place <= 300,
  )
  .map((result) => result.place)
  .sort((a, b) => a - b);
assert.deepEqual(
  runNorwichBatch3Places,
  Array.from({ length: 100 }, (_, index) => index + 201),
  "Run Norwich 2025 places 201–300 must be present exactly once",
);

const paul = athletes.find((athlete) => athlete.slug === "paul-browne");
assert(paul, "Paul Browne is missing");
assert.equal(paul.display_name, "Paul Browne");
assert.equal(paul.club_slug, "unattached");
assert.equal(paul.second_club_slug, undefined);
assert.equal(paul.date_of_birth, "1978-05-20");
assert(
  ![paul.source_club_name, paul.source_second_club_name]
    .filter(Boolean)
    .some((name) => /norfolk gazelles/i.test(name)),
  "Paul Browne retains a Norfolk Gazelles club relationship",
);
const ostersund = results.find(
  (result) =>
    result.athleteSlug === "paul-browne" &&
    result.eventSlug === "ostersund-marathon" &&
    result.date === "2007-07-21",
);
assert(ostersund, "Paul Browne's Östersund Marathon result is missing");
assert.equal(ostersund.time, "3:29:49");
assert.equal(ostersund.finishTimeSeconds, 12_589);

const backupUrl = new URL(
  "../data-backups/athrecs-live-export-2026-08-10.json.gz",
  import.meta.url,
);
if (fs.existsSync(backupUrl)) {
  const compressedBackup = fs.readFileSync(backupUrl);
  const backupBuffer = gunzipSync(compressedBackup);
  assert.equal(
    crypto.createHash("sha256").update(backupBuffer).digest("hex"),
    catalogueMetadata.source_sha256,
    "Fuller-site backup checksum changed",
  );
  const backup = JSON.parse(backupBuffer.toString("utf8"));
  assert.deepEqual(backup.metadata.counts, catalogueMetadata.source_counts);
  assert.equal(backup.athletes.length, catalogueMetadata.source_counts.athletes);
  assert.equal(backup.race_series.length, catalogueMetadata.source_counts.race_series);
  assert.equal(backup.editions.length, catalogueMetadata.source_counts.editions);
  assert.equal(backup.results.length, catalogueMetadata.source_counts.results);
} else {
  process.stderr.write(
    "Fuller-site backup archive is not committed; checksum verification skipped.\n",
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      source_counts: catalogueMetadata.source_counts,
      merged_counts: catalogueMetadata.merged_counts,
      run_norwich_2025_batch_2: {
        athletes: athletesRn2025B2.length,
        results: resultsRn2025B2.length,
        places: "101-200 complete",
      },
      run_norwich_2025_batch_3: {
        athletes: athletesRn2025B3.length,
        results: resultsRn2025B3.length,
        places: "201-300 complete",
      },
      paul_browne: {
        club: "Unattached",
        date_of_birth: paul.date_of_birth,
        ostersund_marathon: ostersund.time,
      },
    },
    null,
    2,
  )}\n`,
);
