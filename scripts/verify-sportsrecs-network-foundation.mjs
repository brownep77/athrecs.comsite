#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  "migrations/0027_sportsrecs_network_foundation.sql",
  "utf8",
);

for (const table of [
  "brands",
  "brand_domains",
  "sports",
  "disciplines",
  "event_classifications",
  "event_publications",
  "network_event_editions",
  "competitions",
  "network_staff_roles",
  "network_staff_assignments",
  "network_audit_log",
]) {
  assert(
    migration.includes(`create table if not exists ${table}`),
    `Network migration is missing ${table}`,
  );
}

for (const brand of [
  "sportsrecs",
  "runrecs",
  "athrecs",
  "cycrecs",
  "swimrecs",
  "trirecs",
  "gymrecs",
  "fitrecs",
]) {
  assert(migration.includes(`('${brand}',`), `Network migration is missing ${brand}`);
}

for (const view of [
  "sportsrecs_event_classification_suggestions",
  "sportsrecs_network_edition_suggestions",
  "sportsrecs_competition_suggestions",
  "sportsrecs_result_competition_map",
  "sportsrecs_network_migration_report",
]) {
  assert(migration.includes(`view ${view}`), `Network migration is missing ${view}`);
}

assert(
  migration.includes("v1-shadow-no-public-url-cutover"),
  "Network migration must retain the no-cutover safety marker",
);
assert(
  migration.includes("'legacy_live'") && migration.includes("https://www.athrecs.com/races/"),
  "Existing ATHRECS URLs must remain the protected live publications",
);

const server = await readFile("src/lib/athrecs/sportsrecs-network.server.ts", "utf8");
assert(server.includes("on conflict (event_id) do nothing"), "Sync must preserve reviewed classifications");
assert(server.includes("migration_state = 'shadow'"), "Sync must only refresh shadow rows");

const api = await readFile("src/lib/athrecs/sportsrecs-network-api.ts", "utf8");
assert(api.includes(".middleware([staffMiddleware])"), "Network API must require staff access");
assert(api.includes("publicUrlCutoverEnabled: false"), "Network API must report URL cutover disabled");
assert(api.includes("specialistDomainWritesEnabled: false"), "Specialist-domain writes must be disabled");

const route = await readFile("src/routes/admin/network.tsx", "utf8");
assert(route.includes('createFileRoute("/admin/network"'), "Network staff route is missing");
assert(route.includes("Read-only foundation"), "Network route must show its read-only state");
assert(route.includes("ATHRECS remains the protected canonical home"), "Network route must explain canonical protection");

const shell = await readFile("src/components/staff/StaffMicrositeShell.tsx", "utf8");
assert(shell.includes('to: "/admin/network"'), "Staff navigation must expose the network view");

const runRecsApi = await readFile("src/runrecs/api.ts", "utf8");
assert(
  runRecsApi.includes("e.sport in ('Running', 'Parkrun')") &&
    runRecsApi.includes("event.sport in ('Running', 'Parkrun')"),
  "RunRecs public reads must remain limited to Running and Parkrun",
);

const viteConfig = await readFile("vite.config.ts", "utf8");
assert(
  viteConfig.includes("VERCEL_PROJECT_PRODUCTION_URL") &&
    viteConfig.includes('projectProductionHost.includes("runrecs")'),
  "A Vercel project named runrecs must activate the specialist build automatically",
);

const publisher = await readFile("scripts/publish-after-build.mjs", "utf8");
assert(
  publisher.includes("VERCEL_PROJECT_PRODUCTION_URL") &&
    publisher.includes('projectProductionHost.includes("runrecs")') &&
    publisher.includes("process.exit(0)"),
  "RunRecs project builds must never execute the shared catalogue publishers",
);

const docs = await readFile("docs/sportsrecs-network-foundation.md", "utf8");
assert(docs.includes("Public URL migration and domain activation require a separate approved release."));

process.stdout.write("SportsRecs network foundation verification passed.\n");
