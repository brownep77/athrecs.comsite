import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

// The catalogue's production modules use bundler-style extensionless relative
// imports. Node 24 strips TypeScript syntax natively, but its ESM resolver does
// not add .ts. Keep this verifier on the real catalogue graph by resolving only
// existing relative TypeScript modules; package and built-in resolution remain
// untouched.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL &&
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      !/\.[^/]+$/.test(specifier)
    ) {
      const base = new URL(specifier, context.parentURL);
      for (const candidate of [new URL(`${base.href}.ts`), new URL(`${base.href}/index.ts`)]) {
        if (existsSync(fileURLToPath(candidate))) {
          return { url: candidate.href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [
  migration,
  publicApi,
  claimsApi,
  archiveApi,
  importer,
  archiveRoute,
  staffShell,
  reconciliationServer,
  reconciliationApi,
  reconciliationPanel,
  resultCatalogue,
] = await Promise.all([
  readFile(resolve(root, "migrations/0019_private_result_archive.sql"), "utf8"),
  readFile(resolve(root, "src/lib/athrecs/api.ts"), "utf8"),
  readFile(resolve(root, "src/lib/athrecs/result-claims-api.ts"), "utf8"),
  readFile(resolve(root, "src/lib/athrecs/result-ingestion-api.ts"), "utf8"),
  readFile(resolve(root, "src/lib/athrecs/results-import.server.ts"), "utf8"),
  readFile(resolve(root, "src/routes/admin/result-archive.tsx"), "utf8"),
  readFile(resolve(root, "src/components/staff/StaffMicrositeShell.tsx"), "utf8"),
  readFile(resolve(root, "src/lib/athrecs/result-reconciliation.server.ts"), "utf8"),
  readFile(resolve(root, "src/lib/athrecs/result-reconciliation-api.ts"), "utf8"),
  readFile(resolve(root, "src/components/staff/ResultReconciliationPanel.tsx"), "utf8"),
  readFile(resolve(root, "src/data/results.ts"), "utf8"),
]);

assert.match(migration, /create table if not exists result_ingestion_runs/);
assert.match(migration, /create table if not exists result_ingestion_editions/);
assert.doesNotMatch(
  migration.match(/create table if not exists result_ingestion_editions[\s\S]*?;/)?.[0] ?? "",
  /athlete_name|finish_time|display_name/,
  "The edition coverage ledger must not contain participant names or times",
);
assert.match(publicApi, /result_visibility in \('public', 'public_figure'\)/);
assert.match(publicApi, /a\.profile_type = 'Public figure' or a\.profile_visibility = 'public'/);
const claimableStart = claimsApi.indexOf("export const getClaimableResult");
assert.notEqual(claimableStart, -1);
assert.match(claimsApi.slice(claimableStart, claimableStart + 400), /middleware\(\[authMiddleware\]\)/);
assert.match(claimsApi, /canAccessClaimCandidate/);
assert.match(claimsApi, /Result not available to this account/);
assert.match(archiveApi, /middleware\(\[staffMiddleware\]\)/);
assert.match(importer, /insert into result_ingestion_runs/);
assert.match(importer, /insert into result_ingestion_editions/);
assert.match(importer, /export function parseResultsCsv/);
assert.match(importer, /options\.sourceContent/);
assert.match(importer, /result_visibility/);
assert.match(archiveRoute, /Event-level tracking only/);
assert.match(archiveRoute, /<ResultReconciliationPanel\s*\/>/);
assert.doesNotMatch(archiveRoute, /athleteName|finishTime/);
assert.match(staffShell, /\/admin\/result-archive/);

assert.match(reconciliationServer, /previewRecoverableResultReconciliation/);
assert.match(reconciliationServer, /publishRecoverableResultReconciliation/);
assert.match(reconciliationServer, /on conflict do nothing/);
assert.match(
  reconciliationServer,
  /profileType === "Public figure" \? "public_figure" : "private"/,
);
assert.match(reconciliationServer, /profileType === "Public figure" \? "public" : "private"/);
assert.match(reconciliationServer, /result_ingestion_runs/);
assert.match(reconciliationServer, /result_ingestion_editions/);
assert.doesNotMatch(
  reconciliationServer,
  /delete\s+from\s+(?:clubs|events|editions|athletes|results)\b/i,
);
assert.doesNotMatch(
  reconciliationServer,
  /update\s+(?:clubs|events|editions|athletes|results)\b/i,
);
assert.doesNotMatch(reconciliationServer, /on\s+conflict[\s\S]{0,100}do\s+update/i);
assert.match(reconciliationApi, /middleware\(\[staffMiddleware\]\)/);
assert.match(reconciliationApi, /RESTORE CLAIMABLE RESULTS/);
assert.doesNotMatch(reconciliationApi, /ensureAthrecsSeeded/);
assert.match(reconciliationPanel, /Existing records are never/);
assert.match(reconciliationPanel, /data\.persistent/);
assert.match(resultCatalogue, /const resultByKey = new Map<string, ResultSeed>/);
assert.match(resultCatalogue, /Conflicting duplicate result seed/);

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table "user" (
    "id" text primary key,
    "email" text not null unique
  );
  create table athletes (
    id serial primary key,
    slug text not null unique,
    display_name text not null,
    profile_type text not null default 'Athlete'
  );
  create table events (
    id serial primary key,
    slug text not null unique,
    name text not null,
    sport text not null
  );
  create table editions (
    id serial primary key,
    event_id int not null references events (id) on delete cascade,
    event_date date not null,
    distance_code text not null
  );
  create table results (
    id serial primary key,
    edition_id int not null references editions (id) on delete cascade,
    athlete_id int not null references athletes (id) on delete cascade
  );
`);
await db.exec(`
  insert into "user" ("id", "email") values ('staff-one', 'staff@example.com');
  insert into athletes (id, slug, display_name, profile_type) values
    (1, 'private-runner', 'Private Runner', 'Athlete'),
    (2, 'public-runner', 'Public Runner', 'Public figure');
  insert into events (id, slug, name, sport)
    values (1, 'archive-race', 'Archive Race', 'Running');
  insert into editions (id, event_id, event_date, distance_code)
    values (1, 1, '2025-05-04', '10K');
  insert into results (id, edition_id, athlete_id) values (1, 1, 1), (2, 1, 2);
`);
await db.exec(migration);
const visibility = await db.query(`
  select athlete.slug, athlete.profile_visibility, result.result_visibility
  from results result
  join athletes athlete on athlete.id = result.athlete_id
  order by athlete.id
`);
assert.deepEqual(visibility.rows, [
  { slug: "private-runner", profile_visibility: "private", result_visibility: "private" },
  { slug: "public-runner", profile_visibility: "public", result_visibility: "public_figure" },
]);

await db.exec(`
  insert into result_ingestion_runs (
    id, sport, source_name, acquisition_method, requested_by_user_id,
    rows_detected, rows_imported, edition_count, status, finished_at
  ) values (
    'run-one', 'Running', 'Official timer', 'scan', 'staff-one', 2, 2, 1, 'completed', now()
  );
  insert into result_ingestion_editions (
    ingestion_run_id, event_id, edition_id, sport, event_name, event_slug,
    event_date, distance_code, status, rows_detected, rows_imported, finished_at
  ) values (
    'run-one', 1, 1, 'Running', 'Archive Race', 'archive-race',
    '2025-05-04', '10K', 'complete', 2, 2, now()
  );
`);
const coverage = await db.query(`
  select sport, event_name, event_date::text, distance_code, rows_imported
  from result_ingestion_editions
`);
assert.deepEqual(coverage.rows[0], {
  sport: "Running",
  event_name: "Archive Race",
  event_date: "2025-05-04",
  distance_code: "10K",
  rows_imported: 2,
});

const [{ athletes, editions, results, seriesList }, { catalogueMetadata }] = await Promise.all([
  import("../src/data/catalogue.ts"),
  import("../src/data/catalogue-metadata.ts"),
]);
const resultKeys = results.map(
  (result) => `${result.eventSlug}|${result.date}|${result.distance}|${result.athleteSlug}`,
);
assert.equal(new Set(resultKeys).size, resultKeys.length, "Recoverable result keys must be unique");
assert(
  results.length >= catalogueMetadata.merged_counts.results,
  `Canonical recoverable results (${results.length}) fell below the recorded catalogue floor (${catalogueMetadata.merged_counts.results})`,
);
const athleteSlugs = new Set(athletes.map((athlete) => athlete.slug));
const eventSlugs = new Set(seriesList.map((series) => series.slug));
const editionKeys = new Set(
  editions.map((edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`),
);
for (const result of results) {
  assert(athleteSlugs.has(result.athleteSlug), `Missing athlete seed for ${result.athleteSlug}`);
  assert(eventSlugs.has(result.eventSlug), `Missing event seed for ${result.eventSlug}`);
  assert(
    editionKeys.has(`${result.eventSlug}|${result.date}|${result.distance}`),
    `Missing edition seed for ${result.eventSlug} ${result.date} ${result.distance}`,
  );
}

await db.close();
console.log(
  `Private result archive verification passed for ${results.length.toLocaleString("en-GB")} canonical recoverable results`,
);
