import fs from "node:fs";
import process from "node:process";

const sourcePath = "src/data/belgium-races-comprehensive.ts";
const source = fs.readFileSync(sourcePath, "utf8");
const match = source.match(/const raceConfigs: RaceConfig\[\] = (\[[\s\S]*?\]);\n\nexport const belgiumComprehensiveReplacementSlugs/);
if (!match) {
  throw new Error(`Could not extract strict JSON raceConfigs from ${sourcePath}`);
}
const configs = JSON.parse(match[1]);

const EXPECTED_SERIES = 151;
const EXPECTED_ROWS = 415;
const EXPECTED_REPLACEMENTS = 6;
const EXPECTED_COMBINED_SERIES = 178;
const EXPECTED_COMBINED_ROWS = 496;
const CHECKED_AT = "2026-08-27";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(configs.length === EXPECTED_SERIES, `Expected ${EXPECTED_SERIES} comprehensive Belgian series, got ${configs.length}`);

const rows = configs.flatMap((config) =>
  config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => ({ config, occurrence, distance })),
  ),
);
assert(rows.length === EXPECTED_ROWS, `Expected ${EXPECTED_ROWS} Belgian distance rows, got ${rows.length}`);

const slugs = new Set();
const names = new Set();
const exactRows = new Set();
for (const config of configs) {
  assert(!slugs.has(config.slug), `Duplicate Belgian slug: ${config.slug}`);
  slugs.add(config.slug);
  const normalizedName = config.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  assert(!names.has(normalizedName), `Duplicate Belgian race name: ${config.name}`);
  names.add(normalizedName);
  assert(config.website.startsWith("https://"), `Non-HTTPS website: ${config.slug} -> ${config.website}`);
  assert(config.source.startsWith("https://"), `Non-HTTPS source: ${config.slug} -> ${config.source}`);
  assert(["official", "federation", "calendar"].includes(config.sourceTier), `Bad source tier: ${config.slug}`);
  assert(config.occurrences.length > 0, `No confirmed occurrence: ${config.slug}`);

  for (const occurrence of config.occurrences) {
    assert(/^20(?:25|26|27)-\d{2}-\d{2}$/.test(occurrence.date), `Bad or out-of-scope date: ${config.slug} ${occurrence.date}`);
    assert(!Number.isNaN(Date.parse(`${occurrence.date}T00:00:00Z`)), `Invalid date: ${config.slug} ${occurrence.date}`);
    assert(occurrence.distances.length > 0, `No distances: ${config.slug} ${occurrence.date}`);
    for (const distance of occurrence.distances) {
      assert(typeof distance.label === "string" && distance.label.trim(), `Missing distance label: ${config.slug}`);
      assert(Number.isFinite(distance.km) && distance.km > 0 && distance.km <= 200, `Bad distance: ${config.slug} ${distance.label}`);
      const key = `${config.slug}|${occurrence.date}|${distance.label}`;
      assert(!exactRows.has(key), `Duplicate distance row: ${key}`);
      exactRows.add(key);
    }
  }
}

const regions = new Set(configs.map((config) => config.region));
for (const required of [
  "Antwerp",
  "East Flanders",
  "West Flanders",
  "Flemish Brabant",
  "Limburg",
  "Brussels-Capital",
  "Hainaut",
  "Liège",
  "Luxembourg",
  "Namur",
  "Walloon Brabant",
]) {
  assert(regions.has(required), `Missing Belgian regional coverage: ${required}`);
}

const tiers = new Set(configs.map((config) => config.sourceTier));
for (const tier of ["official", "federation", "calendar"]) {
  assert(tiers.has(tier), `Missing source tier: ${tier}`);
}

function labels(slug, date) {
  const config = configs.find((item) => item.slug === slug);
  assert(config, `Missing required race: ${slug}`);
  const occurrence = config.occurrences.find((item) => item.date === date);
  assert(occurrence, `Missing required occurrence: ${slug} ${date}`);
  return occurrence.distances.map((item) => item.label);
}

assert(
  JSON.stringify(labels("brussels-airport-marathon", "2025-11-02")) ===
    JSON.stringify(["7K", "Half Marathon", "Marathon"]),
  "Brussels Airport Marathon programme is incomplete",
);
assert(labels("20-km-de-bruxelles", "2027-05-30").includes("20K"), "20 km de Bruxelles 2027 missing");
assert(
  JSON.stringify(labels("energyvision-dwars-door-mechelen", "2026-09-27")) ===
    JSON.stringify(["6K", "10K", "Half Marathon"]),
  "Dwars door Mechelen correction regressed",
);
assert(labels("qbuild-arlon-half-marathon", "2026-09-13").includes("Marathon"), "Arlon full marathon missing");
assert(labels("trail-knokke-heist", "2026-11-22").includes("24K"), "Trail Knokke 24K correction missing");
assert(!labels("trail-knokke-heist", "2026-11-22").includes("25K"), "Retired Trail Knokke 25K row returned");
assert(labels("energyvision-genk-loopt", "2026-05-03").includes("16K"), "Genk 16K correction missing");
assert(labels("baloise-antwerp-10-miles", "2026-04-25").includes("6K"), "Antwerp 6K short race missing");
assert(
  labels("nationaal-park-marathon", "2026-03-01").length === 4,
  "Nationaal Park Marathon RUN programme incomplete",
);

const replacementsMatch = source.match(/export const belgiumComprehensiveReplacementSlugs = new Set\(\[([\s\S]*?)\]\);/);
assert(replacementsMatch, "Could not parse replacement slug set");
const replacementCount = (replacementsMatch[1].match(/"/g) ?? []).length / 2;
assert(replacementCount === EXPECTED_REPLACEMENTS, `Expected ${EXPECTED_REPLACEMENTS} replacement slugs, got ${replacementCount}`);

console.log(
  `Belgium comprehensive calendar verified: ${configs.length} new/corrected series, ${rows.length} distance rows; expected combined catalogue ${EXPECTED_COMBINED_SERIES} series / ${EXPECTED_COMBINED_ROWS} rows; checked ${CHECKED_AT}.`,
);
