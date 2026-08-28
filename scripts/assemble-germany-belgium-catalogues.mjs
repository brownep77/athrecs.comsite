#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

async function write(path, content) {
  await writeFile(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function requireAnchor(content, anchor, label) {
  if (!content.includes(anchor)) throw new Error(`Missing ${label} anchor`);
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
  const importBlock = `import {\n  germanyEnduranceRaceEditions,\n  germanyEnduranceRaceSeries,\n} from "./germany-endurance-races";\n`;
  content = insertBefore(
    content,
    'import type { ClubSeed, Edition, Series } from "./types";\n',
    importBlock,
    "catalogue type import",
  );
  content = insertBefore(
    content,
    "  ...(runabcSeries as Series[]),\n",
    "  ...(germanyEnduranceRaceSeries as Series[]),\n",
    "runABC series",
  );
  const editionBlock = `  ...(germanyEnduranceRaceEditions as Edition[]).filter((edition) =>\n    extraSlugs.has(edition.seriesSlug),\n  ),\n`;
  content = insertBefore(
    content,
    "  ...(runabcEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),\n",
    editionBlock,
    "runABC editions",
  );
  await write(path, content);
}

async function updateVerifiedAllSport() {
  const path = "src/data/verified-all-sport.ts";
  let content = await read(path);
  const importBlock = `import {\n  belgiumEliteYouthCompetitionEditions,\n  belgiumEliteYouthCompetitionSeries,\n} from "./belgium-elite-youth-competitions.ts";\n`;
  content = insertAfter(
    content,
    'import type { Edition, Series } from "./types";\n',
    importBlock,
    "verified-all-sport type import",
  );
  content = insertAfter(
    content,
    "export const verifiedAllSportSeries: Series[] = [\n",
    "  ...belgiumEliteYouthCompetitionSeries,\n",
    "verified all-sport series array",
  );
  content = insertAfter(
    content,
    "export const verifiedAllSportEditions: Edition[] = [\n",
    "  ...belgiumEliteYouthCompetitionEditions,\n",
    "verified all-sport editions array",
  );
  await write(path, content);
}

async function updateDuplicateVerifier() {
  const path = "scripts/verify-fixture-duplicates.mjs";
  let content = await read(path);
  const helper = `function competitionGender(name) {\n  const value = compact(name);\n  if (/(?:women|womens|female|dames|vrouwen|femmes)/.test(value)) return "women";\n  if (/(?:men|mens|male|heren|hommes)/.test(value)) return "men";\n  return null;\n}\n\n`;
  content = insertBefore(content, "const groups = new Map();\n", helper, "duplicate groups");
  const candidateAnchor = "      if (left.series.slug === right.series.slug) continue;\n";
  const genderCheck = `      const leftGender = competitionGender(left.series.name);\n      const rightGender = competitionGender(right.series.name);\n      if (leftGender && rightGender && leftGender !== rightGender) continue;\n`;
  content = insertAfter(content, candidateAnchor, genderCheck, "duplicate candidate loop");
  await write(path, content);
}

async function updateImportServer() {
  const path = "src/lib/athrecs/import.server.ts";
  let content = await read(path);
  content = insertAfter(
    content,
    "  source?: string;\n",
    "  notes?: string;\n",
    "import edition source field",
  );

  const columnAnchor = `          entry_url, source_url, start_time\n`;
  if (!content.includes("entry_url, source_url, start_time, notes")) {
    requireAnchor(content, columnAnchor, "edition insert columns");
    content = content.replace(columnAnchor, "          entry_url, source_url, start_time, notes\n");
  }
  const valueAnchor = `          \${raw.entryUrl ?? null}, \${raw.source ?? null}, \${raw.startTime ?? null}\n`;
  if (!content.includes("${raw.notes ?? null}")) {
    requireAnchor(content, valueAnchor, "edition insert values");
    content = content.replace(
      valueAnchor,
      "          ${raw.entryUrl ?? null}, ${raw.source ?? null}, ${raw.startTime ?? null},\n          ${raw.notes ?? null}\n",
    );
  }
  const conflictAnchor = `          source_url = coalesce(excluded.source_url, editions.source_url),\n          start_time = excluded.start_time\n`;
  if (!content.includes("notes = coalesce(excluded.notes, editions.notes)")) {
    requireAnchor(content, conflictAnchor, "edition conflict update");
    content = content.replace(
      conflictAnchor,
      `          source_url = coalesce(excluded.source_url, editions.source_url),\n          start_time = excluded.start_time,\n          notes = coalesce(excluded.notes, editions.notes)\n`,
    );
  }
  await write(path, content);
}

async function updateCatalogueRollback() {
  const path = "src/lib/athrecs/catalogue-publishing.server.ts";
  let content = await read(path);
  const sqlAnchor = `         source_url = $5,\n         start_time = $6\n`;
  if (!content.includes("notes = $7")) {
    requireAnchor(content, sqlAnchor, "edition rollback SQL");
    content = content.replace(
      sqlAnchor,
      `         source_url = $5,\n         start_time = $6,\n         notes = $7\n`,
    );
  }
  const valuesAnchor = `      record.source_url ?? null,\n      record.start_time ?? null,\n`;
  if (!content.includes("record.notes ?? null")) {
    requireAnchor(content, valuesAnchor, "edition rollback values");
    content = content.replace(
      valuesAnchor,
      `      record.source_url ?? null,\n      record.start_time ?? null,\n      record.notes ?? null,\n`,
    );
  }
  await write(path, content);
}

async function updatePublisher() {
  const path = "scripts/publish-germany-belgium-catalogues.mjs";
  let content = await read(path);
  const anchor = `    ...(edition.source ? { source: edition.source } : {}),\n`;
  content = insertAfter(
    content,
    anchor,
    "    ...(edition.notes ? { notes: edition.notes } : {}),\n",
    "catalogue publisher edition source",
  );
  await write(path, content);
}

async function updatePackage() {
  const path = "package.json";
  const pkg = JSON.parse(await read(path));
  pkg.scripts["verify:germany-endurance-calendar"] =
    "node --experimental-strip-types scripts/verify-germany-endurance-calendar.mjs";
  pkg.scripts["verify:belgium-elite-youth-competitions"] =
    "node --experimental-strip-types scripts/verify-belgium-elite-youth-competitions.mjs";
  pkg.scripts["verify:germany-belgium-publication"] =
    "node --experimental-strip-types scripts/verify-germany-belgium-publication.mjs";

  const publisher = "node scripts/publish-germany-belgium-catalogues.mjs";
  if (!pkg.scripts.build.includes(publisher)) {
    pkg.scripts.build = `${pkg.scripts.build} && ${publisher}`;
  }

  const commands = [
    "npm run verify:germany-endurance-calendar",
    "npm run verify:belgium-elite-youth-competitions",
  ];
  const anchor = "npm run verify:slug-stability";
  if (!pkg.scripts["ci:verify"].includes(anchor)) {
    throw new Error("Could not locate ci:verify insertion point");
  }
  for (const command of commands) {
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
  const content = `# Germany and Belgium catalogue release — 28 August 2026\n\n## Germany\n\n- 38 verified endurance event series.\n- 150 separately published date/distance editions.\n- Running, cycling, triathlon and duathlon coverage.\n- Every edition retains a verified primary official entry or information option.\n- BMW BERLIN-MARATHON and the in-window German IRONMAN 70.3 races remain supplied by their existing AIMS and IRONMAN feeds, avoiding duplicate event cards.\n\n## Belgium\n\n- 100 exact-dated restricted-entry competition series and 100 editions.\n- 97 cycling, two duathlon and one triathlon fixture.\n- Professional, elite, youth and mixed elite/youth categories.\n- No misleading public entry links. Every edition retains an explicit restriction note.\n- Explicitly labelled men's and women's competitions remain separate when held on the same date and course.\n\n## Production publication\n\nThe release uses three bounded catalogue batches through ATHRECS's stage, validate and transactional publish pipeline: one German batch and two 50-event Belgian batches. The source keys and payloads are stable, so repeat deployments create no additional revisions. Edition notes are preserved by the staged importer and rollback snapshots.\n\nA clean PostgreSQL workflow publishes all three batches twice and verifies counts, entry-option handling, restriction notes, gender-paired competitions and idempotency.\n`;
  await write("docs/germany-belgium-catalogue-release-2026-08-28.md", content);
}

await updateCatalogue();
await updateVerifiedAllSport();
await updateDuplicateVerifier();
await updateImportServer();
await updateCatalogueRollback();
await updatePublisher();
await updatePackage();
await writeReleaseNotes();

console.log("Assembled the Germany and Belgium catalogues on current main.");
