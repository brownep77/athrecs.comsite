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
  "Existing ATHRECS identifiers and legacy publication records must remain protected",
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

const shell = await readFile("src/components/staff/StaffMicrositeShell.tsx", "utf8");
assert(shell.includes('to: "/admin/network"'), "Staff navigation must expose the network view");

const runRecsApi = await readFile("src/runrecs/api.ts", "utf8");
assert(
  runRecsApi.includes("e.sport in ('Running', 'Parkrun')") &&
    runRecsApi.includes("event.sport in ('Running', 'Parkrun')"),
  "RunRecs public reads must remain limited to Running and Parkrun",
);

const athleticsApi = await readFile("src/athletics/api.ts", "utf8");
assert(
  athleticsApi.includes('const ATHLETICS_SPORT = "Athletics"') &&
    athleticsApi.includes("event.sport = 'Athletics'") &&
    athleticsApi.includes("sport: ATHLETICS_SPORT"),
  "ATHRECS public reads must be limited to Athletics",
);
assert(
  athleticsApi.includes("if (!result || !isAthleticsSport(result.event.sport)) return null"),
  "Direct non-Athletics event URLs must fail closed on ATHRECS",
);
assert(
  athleticsApi.includes('export * from "../lib/athrecs/api"'),
  "The shared staff and import backend must remain available",
);

const athleticsFilters = await readFile("src/athletics/filters.ts", "utf8");
assert(
  athleticsFilters.includes('export const SPORTS = ["Athletics"] as const') &&
    athleticsFilters.includes('export const DEFAULT_SPORT = "Athletics" as const'),
  "ATHRECS must expose Athletics as its only public discipline",
);

const athleticsRoutes = await Promise.all([
  readFile("src/athletics/routes/index.tsx", "utf8"),
  readFile("src/athletics/routes/calendar.tsx", "utf8"),
  readFile("src/athletics/routes/race-series.tsx", "utf8"),
  readFile("src/athletics/routes/$language/$country/index.tsx", "utf8"),
]);
for (const routeSource of athleticsRoutes) {
  for (const forbidden of [
    'sport: "Running"',
    'sport: "Parkrun"',
    'sport: "Triathlon"',
    'sport: "Cycling"',
    "World Marathon Majors",
    "UTMB World Series",
  ]) {
    assert(!routeSource.includes(forbidden), `ATHRECS Athletics route leaked ${forbidden}`);
  }
}

const viteConfig = await readFile("vite.config.ts", "utf8");
assert(
  viteConfig.includes("VERCEL_PROJECT_PRODUCTION_URL") &&
    viteConfig.includes('projectProductionHost.includes("runrecs")'),
  "A Vercel project named runrecs must activate the specialist build automatically",
);
assert(
  viteConfig.includes("function athleticsVariantPlugin(): Plugin") &&
    viteConfig.includes('["@/lib/athrecs/api", "src/athletics/api.ts"]') &&
    viteConfig.includes('["@/lib/athrecs/filters", "src/athletics/filters.ts"]') &&
    viteConfig.includes('projectProductionHost.includes("runrecs")'),
  "Default ATHRECS builds must use the Athletics facade without overriding RunRecs",
);

const publisher = await readFile("scripts/publish-after-build.mjs", "utf8");
assert(
  publisher.includes("VERCEL_PROJECT_PRODUCTION_URL") &&
    publisher.includes('projectProductionHost.includes("runrecs")') &&
    publisher.includes("process.exit(0)"),
  "RunRecs project builds must never execute the shared catalogue publishers",
);

const brandStatic = await readFile("scripts/write-brand-static.mjs", "utf8");
assert(
  brandStatic.includes("https://www.athrecs.com") &&
    brandStatic.includes("https://www.runrecs.com") &&
    brandStatic.includes("sitemap.xml") &&
    brandStatic.includes("robots.txt"),
  "Each specialist site must receive brand-safe static SEO files",
);

const packageJson = await readFile("package.json", "utf8");
const vercel = await readFile("vercel.json", "utf8");
assert(
  packageJson.includes("node scripts/write-brand-static.mjs") &&
    vercel.includes("node scripts/write-brand-static.mjs"),
  "Local and Vercel builds must both generate brand-safe static files",
);

const docs = await readFile("docs/sportsrecs-network-foundation.md", "utf8");
assert(docs.includes("Public URL migration and domain activation require a separate approved release."));

process.stdout.write("SportsRecs network and specialist public-scope verification passed.\n");
