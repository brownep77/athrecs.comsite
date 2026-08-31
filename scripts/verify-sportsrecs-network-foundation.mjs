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

const staffRoute = await readFile("src/routes/admin/network.tsx", "utf8");
assert(staffRoute.includes('createFileRoute("/admin/network"'), "Network staff route is missing");
assert(staffRoute.includes("Read-only foundation"), "Network route must show its read-only state");
assert(
  staffRoute.includes("ATHRECS remains the protected canonical home"),
  "Network route must explain canonical protection",
);

const staffShell = await readFile("src/components/staff/StaffMicrositeShell.tsx", "utf8");
assert(staffShell.includes('to: "/admin/network"'), "Staff navigation must expose the network view");

const landingRoute = await readFile("src/routes/sportsrecs.tsx", "utf8");
assert(landingRoute.includes('createFileRoute("/sportsrecs"'), "SportsRecs landing route is missing");
assert(
  landingRoute.includes("One sporting identity.") && landingRoute.includes("Every competition."),
  "SportsRecs landing page must explain the network proposition",
);
for (const publicBrand of [
  "RunRecs",
  "ATHRECS",
  "CycRecs",
  "SwimRecs",
  "TriRecs",
  "GymRecs",
  "FitRecs",
]) {
  assert(landingRoute.includes(publicBrand), `Landing page is missing ${publicBrand}`);
}
assert(
  landingRoute.includes('href: "https://www.athrecs.com"'),
  "ATHRECS must remain the only explicitly live specialist link",
);
assert(
  !landingRoute.includes('href: "https://runrecs.com"') &&
    !landingRoute.includes('href: "https://cycrecs.com"') &&
    !landingRoute.includes('href: "https://swimrecs.com"'),
  "Unverified specialist destinations must not be activated from the coming-soon page",
);
assert(
  landingRoute.includes("Link activates at launch"),
  "Coming-soon cards must explain that their links are not yet active",
);

const publicShell = await readFile("src/components/layout/AppShell.tsx", "utf8");
assert(
  publicShell.includes('pathname === "/sportsrecs"'),
  "SportsRecs must render without the ATHRECS public navigation shell",
);

const vercelConfig = JSON.parse(await readFile("vercel.json", "utf8"));
const sportsRecsHosts = new Set(
  (vercelConfig.rewrites ?? [])
    .filter((rewrite) => rewrite.destination === "/sportsrecs")
    .flatMap((rewrite) => rewrite.has ?? [])
    .filter((rule) => rule.type === "host")
    .map((rule) => rule.value),
);
assert(sportsRecsHosts.has("sportsrecs.org"), "Apex SportsRecs host rewrite is missing");
assert(sportsRecsHosts.has("www.sportsrecs.org"), "www SportsRecs host rewrite is missing");

const docs = await readFile("docs/sportsrecs-network-foundation.md", "utf8");
assert(docs.includes("Public URL migration and domain activation require a separate approved release."));

process.stdout.write("SportsRecs network foundation verification passed.\n");
