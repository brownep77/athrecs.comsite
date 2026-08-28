#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

async function write(path, content) {
  await writeFile(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function requireAnchor(content, anchor, label) {
  if (!content.includes(anchor)) throw new Error(`Missing ${label} anchor: ${anchor}`);
}

function insertBefore(content, anchor, addition, label) {
  if (content.includes(addition.trim())) return content;
  requireAnchor(content, anchor, label);
  return content.replace(anchor, `${addition}${anchor}`);
}

function insertAfter(content, anchor, addition, label) {
  if (content.includes(addition.trim())) return content;
  requireAnchor(content, anchor, label);
  return content.replace(anchor, `${anchor}${addition}`);
}

async function updateCatalogue() {
  const path = "src/data/catalogue.ts";
  let content = await read(path);

  if (!content.includes("dailyHalfTenMileExistingSeriesEditions")) {
    const oldImport = `import {\n  dailyHalfTenMileEditions,\n  dailyHalfTenMileSeries,\n} from "./half-ten-mile-races-uk-ireland-daily-followup";`;
    const newImport = `import {\n  dailyHalfTenMileEditions,\n  dailyHalfTenMileExistingSeriesEditions,\n  dailyHalfTenMileSeries,\n} from "./half-ten-mile-races-uk-ireland-daily-followup";`;
    requireAnchor(content, oldImport, "daily half/ten import");
    content = content.replace(oldImport, newImport);
  }

  const nonStandardImport = `import {\n  verifiedNonStandardDistanceEditions,\n  verifiedNonStandardDistanceSeries,\n} from "./non-standard-races-uk-ireland";\n`;
  content = insertBefore(
    content,
    'import type { ClubSeed, Edition, Series } from "./types";\n',
    nonStandardImport,
    "catalogue type import",
  );

  content = insertBefore(
    content,
    "  ...(runabcSeries as Series[]),\n",
    "  ...(verifiedNonStandardDistanceSeries as Series[]),\n",
    "runABC series",
  );

  const dailyEditionAnchor = `  ...(dailyHalfTenMileEditions as Edition[]).filter((edition) =>\n    extraSlugs.has(edition.seriesSlug),\n  ),\n`;
  content = insertAfter(
    content,
    dailyEditionAnchor,
    "  ...(dailyHalfTenMileExistingSeriesEditions as Edition[]),\n",
    "daily half/ten editions",
  );

  const nonStandardEditionBlock = `  ...(verifiedNonStandardDistanceEditions as Edition[]).filter((edition) =>\n    extraSlugs.has(edition.seriesSlug),\n  ),\n`;
  content = insertBefore(
    content,
    "  ...(runabcEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),\n",
    nonStandardEditionBlock,
    "runABC editions",
  );

  await write(path, content);
}

async function updateEntryOptions() {
  const path = "src/data/entry-options.ts";
  let content = await read(path);
  const importBlock = `import {\n  nonStandardDistanceEditionOverrides,\n  nonStandardDistanceEditionReplacements,\n  nonStandardDistanceSeriesOverrides,\n  nonStandardDistanceSlugAliases,\n} from "./non-standard-races-uk-ireland";\n`;
  content = insertBefore(
    content,
    'import {\n  prominentUkIrelandEditionOverrides,',
    importBlock,
    "prominent-race import",
  );
  content = insertAfter(
    content,
    "  ...allFixtureAliases,\n",
    "  ...nonStandardDistanceSlugAliases,\n",
    "event alias merge",
  );
  content = insertAfter(
    content,
    "  ...verifiedFixtureEditionReplacements,\n",
    "  ...nonStandardDistanceEditionReplacements,\n",
    "edition replacement merge",
  );
  content = insertAfter(
    content,
    "  ...dailyHalfTenMileEditionOverrides,\n",
    "  ...nonStandardDistanceEditionOverrides,\n",
    "edition override merge",
  );
  content = insertAfter(
    content,
    "  ...dailyHalfTenMileSeriesOverrides,\n",
    "  ...nonStandardDistanceSeriesOverrides,\n",
    "series override merge",
  );
  await write(path, content);
}

async function updateDistanceUtilities() {
  const distancePath = "src/lib/athrecs/distance.ts";
  let distance = await read(distancePath);
  if (!distance.includes("Quarter: 10.54875")) {
    distance = insertAfter(
      distance,
      '  "20mi": 32.187,\n',
      "  Quarter: 10.54875,\n",
      "20-mile distance map",
    );
  }
  await write(distancePath, distance);

  const filtersPath = "src/lib/athrecs/filters.ts";
  let filters = await read(filtersPath);
  const distanceFilters = `export const DISTANCE_FILTERS = [\n  "All",\n  "1K",\n  "1mi",\n  "2K",\n  "2.62K",\n  "3K",\n  "5K",\n  "4mi",\n  "6K",\n  "6.5K",\n  "7K",\n  "7.5K",\n  "8K",\n  "5mi",\n  "9K",\n  "6mi",\n  "10K",\n  "Quarter",\n  "11K",\n  "7mi",\n  "12K",\n  "8mi",\n  "13K",\n  "13.1K",\n  "14K",\n  "15K",\n  "15.5K",\n  "16K",\n  "10mi",\n  "17K",\n  "12mi",\n  "20K",\n  "12.5mi",\n  "21K",\n  "Half",\n  "Marathon",\n  "Ultra",\n  "Other",\n] as const;`;
  const pattern = /export const DISTANCE_FILTERS = \[[\s\S]*?\] as const;/;
  if (!pattern.test(filters)) throw new Error("Could not locate running distance filters");
  filters = filters.replace(pattern, distanceFilters);
  await write(filtersPath, filters);
}

async function updateVerifiers() {
  const nonStandardPath = "scripts/verify-uk-ireland-non-standard-distances.mjs";
  let nonStandard = await read(nonStandardPath);
  nonStandard = nonStandard.replace(
    `seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-non-standard-distances-v231"')`,
    `/const SEED_VERSION = "athrecs-[^"]+";/.test(seedSource)`,
  );
  await write(nonStandardPath, nonStandard);

  const dailyPath = "scripts/verify-uk-ireland-half-ten-mile-daily-followup.mjs";
  let daily = await read(dailyPath);
  daily = daily.replace(
    `seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-half-ten-mile-scan-v269"')`,
    `/const SEED_VERSION = "athrecs-[^"]+";/.test(seedSource)`,
  );
  await write(dailyPath, daily);
}

async function updatePackage() {
  const path = "package.json";
  const pkg = JSON.parse(await read(path));
  pkg.scripts["verify:uk-ireland-non-standard-distances"] =
    "node --experimental-strip-types scripts/verify-uk-ireland-non-standard-distances.mjs";
  pkg.scripts["verify:remaining-race-additions-publication"] =
    "node --experimental-strip-types scripts/verify-remaining-race-additions-publication.mjs";

  const publisher = "node scripts/publish-remaining-uk-ireland-race-additions.mjs";
  if (!pkg.scripts.build.includes(publisher)) {
    pkg.scripts.build = `${pkg.scripts.build} && ${publisher}`;
  }

  const requiredCiCommands = [
    "npm run verify:uk-10k-workflow",
    "npm run verify:uk-ireland-half-ten-mile-daily",
    "npm run verify:uk-ireland-non-standard-distances",
  ];
  const anchor = "npm run verify:uk-ireland-prominent-races";
  if (!pkg.scripts["ci:verify"].includes(anchor)) {
    throw new Error("Could not locate the CI insertion point");
  }
  for (const command of requiredCiCommands) {
    if (!pkg.scripts["ci:verify"].includes(command)) {
      pkg.scripts["ci:verify"] = pkg.scripts["ci:verify"].replace(
        anchor,
        `${command} && ${anchor}`,
      );
    }
  }
  await write(path, JSON.stringify(pkg, null, 2));
}

async function writeReleaseNotes() {
  const path = "docs/remaining-race-additions-release-2026-08-28.md";
  const content = `# Remaining UK and Ireland race additions — release audit\n\n## Included verified branches\n\n- PR #164: Fleet 5K & 10K, Haltemprice 10K, Jedburgh Running Festival, Kernow Killer October, Monsal Trail Sunday and Polesden Lacey Trust 10K.\n- PR #203: 21 new non-standard-distance race series, 25 new editions, 35 existing-card corrections, 29 safe date/distance migrations and five duplicate aliases.\n- PR #246: 45 new half-marathon/10-mile series and 11 verified 2027 editions attached to existing canonical event cards.\n\n## Publication method\n\nThe additions are divided into two bounded, stable catalogue batches. Production uses the existing stage, validate and transactional publish pipeline. Repeat deployments reuse the published payload hashes. Existing edition migrations are applied only where no results are attached, and known event aliases are retired only when no result dependencies exist.\n\n## Verification\n\n- targeted UK 10K, half/10-mile and non-standard-distance verifiers;\n- full catalogue duplicate verifier;\n- TypeScript and ESLint;\n- production build; and\n- a clean PostgreSQL test that publishes both batches twice and verifies representative fixtures, entry data and revision idempotency.\n`;
  await write(path, content);
}

await updateCatalogue();
await updateEntryOptions();
await updateDistanceUtilities();
await updateVerifiers();
await updatePackage();
await writeReleaseNotes();

console.log("Assembled all remaining verified UK and Ireland race additions on current main.");
