#!/usr/bin/env node
import assert from "node:assert/strict";
const compactSource = (value) => value.replace(/\s+/g, "").replace(/,([\])])/g, "$1");
import { readFile } from "node:fs/promises";

const migration = await readFile("migrations/0027_sportsrecs_network_foundation.sql", "utf8");

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
assert(
  server.includes("on conflict (event_id) do nothing"),
  "Sync must preserve reviewed classifications",
);
assert(server.includes("migration_state = 'shadow'"), "Sync must only refresh shadow rows");

const api = await readFile("src/lib/athrecs/sportsrecs-network-api.ts", "utf8");
assert(api.includes(".middleware([staffMiddleware])"), "Network API must require staff access");
assert(
  api.includes("publicUrlCutoverEnabled: false"),
  "Network API must report URL cutover disabled",
);
assert(
  api.includes("specialistDomainWritesEnabled: false"),
  "Specialist-domain writes must be disabled",
);

const route = await readFile("src/routes/admin/network.tsx", "utf8");
assert(route.includes('createFileRoute("/admin/network"'), "Network staff route is missing");
assert(route.includes("Read-only foundation"), "Network route must show its read-only state");

const shell = await readFile("src/components/staff/StaffMicrositeShell.tsx", "utf8");
assert(shell.includes('to: "/admin/network"'), "Staff navigation must expose the network view");

const runRecsApi =
  (await readFile("src/runrecs/api.ts", "utf8")) +
  (await readFile("src/lib/running/catalogue.server.ts", "utf8"));
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
  "ATHRECS public reads must default to Athletics",
);
assert(
  compactSource(athleticsApi).includes(
    compactSource(
      '["Athletics", "Running", "Parkrun", "Triathlon", "Cycling", "Swimming", "Duathlon"].includes(result.event.sport)',
    ),
  ) &&
    athleticsApi.includes("queryRunningEvents") &&
    !athleticsApi.includes("isTemporaryRunningEdition"),
  "AthRecs direct URLs must include published Athletics, Running, Parkrun, Triathlon and Cycling events",
);
assert(
  athleticsApi.includes('export * from "../lib/athrecs/api"'),
  "The shared staff and import backend must remain available",
);

const athleticsFilters = await readFile("src/athletics/filters.ts", "utf8");
assert(
  compactSource(athleticsFilters).includes(
    compactSource(
      'export const SPORTS = ["Athletics", "Running", "Parkrun", "Triathlon", "Cycling", "Swimming", "Duathlon"] as const',
    ),
  ) && athleticsFilters.includes('export const DEFAULT_SPORT = "Athletics" as const'),
  "ATHRECS must default to Athletics while offering Running, Parkrun, Triathlon and Cycling",
);

const athleticsRoutes = await Promise.all([
  readFile("src/athletics/routes/index.tsx", "utf8"),
  readFile("src/athletics/routes/calendar.tsx", "utf8"),
  readFile("src/athletics/routes/race-series.tsx", "utf8"),
  readFile("src/athletics/routes/$language/$country/index.tsx", "utf8"),
]);
for (const routeSource of athleticsRoutes) {
  for (const forbidden of [
    'sport: "Parkrun"',
    'sport: "Triathlon"',
    'sport: "Cycling"',
    "World Marathon Majors",
    "UTMB World Series",
  ]) {
    assert(!routeSource.includes(forbidden), `ATHRECS Athletics route leaked ${forbidden}`);
  }
}

const athleticsOfficialEntry = await readFile("src/athletics/official-entry.server.ts", "utf8");
const runRecsOfficialEntry = await readFile("src/runrecs/official-entry.server.ts", "utf8");
assert(
  athleticsOfficialEntry.includes(
    "sport in ('Athletics', 'Running', 'Parkrun', 'Triathlon', 'Cycling', 'Swimming', 'Duathlon')",
  ) && athleticsOfficialEntry.includes("if (!allowed.length) return null"),
  "ATHRECS official-entry redirects must fail closed outside Athletics, Running, Parkrun, Triathlon and Cycling",
);
assert(
  runRecsOfficialEntry.includes("sport in ('Running', 'Parkrun')") &&
    runRecsOfficialEntry.includes("if (!allowed.length) return null"),
  "RunRecs official-entry redirects must fail closed outside Running and Parkrun",
);

const athleticsSharedProfile = await readFile("src/athletics/athlete-profile-share-api.ts", "utf8");
const runRecsSharedProfile = await readFile("src/runrecs/athlete-profile-share-api.ts", "utf8");
assert(
  athleticsSharedProfile.includes('export * from "../lib/athrecs/athlete-profile-share-api"'),
  "ATHRECS shared profiles must use the complete, opt-in profile API",
);
assert(
  runRecsSharedProfile.includes("event.sport in ('Running', 'Parkrun')") &&
    runRecsSharedProfile.includes("if (!runRecsPrimary && !results.length) return null"),
  "RunRecs unlisted shared profiles must expose Running and Parkrun only",
);

const viteConfig = await readFile("vite.config.ts", "utf8");
assert(
  viteConfig.includes("VERCEL_PROJECT_PRODUCTION_URL") &&
    viteConfig.includes('projectProductionHost.includes("runrecs")'),
  "A Vercel project named runrecs must activate the specialist build automatically",
);
for (const alias of [
  '["@/lib/athrecs/api", "src/athletics/api.ts"]',
  '["@/lib/athrecs/filters", "src/athletics/filters.ts"]',
  '["@/lib/athrecs/official-entry.server", "src/athletics/official-entry.server.ts"]',
  '["@/lib/athrecs/athlete-profile-share-api", "src/athletics/athlete-profile-share-api.ts"]',
  '["@/lib/athrecs/official-entry.server", "src/runrecs/official-entry.server.ts"]',
  '["@/lib/athrecs/athlete-profile-share-api", "src/runrecs/athlete-profile-share-api.ts"]',
]) {
  assert(viteConfig.includes(alias), `Specialist Vite alias is missing: ${alias}`);
}
assert(
  viteConfig.includes("function athleticsVariantPlugin(): Plugin") &&
    viteConfig.includes('projectProductionHost.includes("runrecs")'),
  "Default ATHRECS builds must use the Athletics facade without overriding RunRecs",
);

const siteScope = await readFile("src/lib/site-scope.ts", "utf8");
assert(
  siteScope.includes('sport === "Running" || sport === "Parkrun"') &&
    compactSource(siteScope).includes(
      compactSource(
        '["Athletics", "Running", "Parkrun", "Triathlon", "Cycling", "Swimming", "Duathlon"].includes(sport)',
      ),
    ),
  "Signed-in specialist pages need one shared sport-scope predicate",
);

const [accountApi, resultMatchApi, resultClaimsApi] = await Promise.all([
  readFile("src/lib/athrecs/athlete-account-api.ts", "utf8"),
  readFile("src/lib/athrecs/result-match-api.ts", "utf8"),
  readFile("src/lib/athrecs/result-claims-api.ts", "utf8"),
]);
assert(
  accountApi.includes("loadLinkedProfileResults(sql, userId)"),
  "Signed-in accounts must use the shared linked-result loader",
);
const linkedResults = await readFile("src/lib/athrecs/linked-profile-results.server.ts", "utf8");
for (const source of [linkedResults, resultMatchApi, resultClaimsApi]) {
  assert(
    source.includes("result.event_sport as event_sport") &&
      source.includes("sport: row.event_sport") &&
      source.includes("athlete_claimable_results result"),
    "Signed-in result payloads must carry sport for specialist-site filtering",
  );
}
const claimableResultsView = await readFile(
  "migrations/20261011_source_history_claims.sql",
  "utf8",
);
assert(
  claimableResultsView.includes("e.sport event_sport") &&
    claimableResultsView.includes("coalesce(s.performance->>'eventSlug',''),'Running'"),
  "Result claims must retain the event sport through the canonical/source-history claimable view",
);

const potentialMatches = await readFile(
  "src/components/athletes/PotentialResultMatchesPanel.tsx",
  "utf8",
);
const accountRoute = await readFile("src/routes/athlete-account.tsx", "utf8");
const claimRoute = await readFile("src/routes/claim-results.tsx", "utf8");
const privateProfileRoute = await readFile("src/routes/my-athlete-profile.tsx", "utf8");
assert(
  /matches\.data\.rows\.filter\(\(row\)\s*=>\s*sportIsInAthleteProfileScope\(\s*row\.kind === "profile" \? row\.match\.sport : \(row\.match\.sport \?\? "Running"\)/.test(
    potentialMatches,
  ),
  "Combined profile and archive suggestions must use the unified profile scope, with a Running fallback only for archives without a sport",
);
assert(
  accountRoute.includes("ACCOUNT_SPORTS") &&
    accountRoute.includes("= ATHLETE_SPORTS;") &&
    accountRoute.includes("const hiddenSports = IS_ATHRECS_SITE") &&
    accountRoute.includes("sportIsInAthleteProfileScope(result.sport)"),
  "ATHRECS accounts must support all sports and preserve existing sport settings",
);
assert(
  claimRoute.includes("sportIsInAthleteProfileScope(claim.sport)") &&
    claimRoute.includes("sportIsInAthleteProfileScope(result.data.sport)"),
  "Claim pages must use the athlete profile scope",
);
assert(
  privateProfileRoute.includes("sportIsInAthleteProfileScope(result.sport)") &&
    privateProfileRoute.includes("sportIsInAthleteProfileScope(sport.sportCode)"),
  "Private profiles must use the complete athlete profile scope",
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
assert(
  docs.includes("Public URL migration and domain activation require a separate approved release."),
);

// Exercise the production sync query against dated meetings. The original
// suggestion view emits only the first day; explicit legacy ranges must survive
// subsequent staff syncs without changing active network records.
const { PGlite } = await import("@electric-sql/pglite");
const { syncSportsRecsNetworkFoundation } = await import(
  "../src/lib/athrecs/sportsrecs-network.server.ts"
);
const syncStatements = [];
await syncSportsRecsNetworkFoundation({ query: async (statement) => syncStatements.push(statement) });
const rangeDb = new PGlite();
try {
  await rangeDb.exec(`
    create table editions(event_id int, event_date date, end_date date);
    insert into editions values
      (1,'2027-02-05','2027-02-06'), (1,'2027-02-05','2027-02-07'),
      (1,'2027-02-20','2027-02-21'), (2,'2027-03-01',null),
      (3,'2027-04-05','2027-04-07'), (4,'2027-05-08','2027-05-09');
    create view sportsrecs_network_edition_suggestions as
      select event_id, 'Synthetic meeting'::text as edition_name,
        event_date as start_date, event_date as end_date, 'TBC'::text as status,
        count(*)::int as legacy_edition_count
      from editions group by event_id,event_date;
    create table network_event_editions(
      event_id int, edition_name text, start_date date, end_date date, status text,
      migration_state text, legacy_edition_count int, updated_at timestamptz,
      unique(event_id,start_date)
    );
    insert into network_event_editions values
      (3,'Reviewed active meeting','2027-04-05','2027-04-10','Open','active',1,null),
      (4,'Previous shadow meeting','2027-05-08','2027-05-08','TBC','shadow',1,null);
  `);
  const rangeSync = syncStatements.find((statement) =>
    statement.includes("insert into network_event_editions"),
  );
  assert(rangeSync, "Network sync query is missing");
  await rangeDb.exec(rangeSync);
  await rangeDb.exec(rangeSync);
  const { rows: ranges } = await rangeDb.query(`
    select event_id,start_date::text,end_date::text,migration_state
    from network_event_editions order by event_id,start_date
  `);
  assert.deepEqual(ranges, [
    { event_id: 1, start_date: "2027-02-05", end_date: "2027-02-07", migration_state: "shadow" },
    { event_id: 1, start_date: "2027-02-20", end_date: "2027-02-21", migration_state: "shadow" },
    { event_id: 2, start_date: "2027-03-01", end_date: "2027-03-01", migration_state: "shadow" },
    { event_id: 3, start_date: "2027-04-05", end_date: "2027-04-10", migration_state: "active" },
    { event_id: 4, start_date: "2027-05-08", end_date: "2027-05-09", migration_state: "shadow" },
  ]);
} finally {
  await rangeDb.close();
}

process.stdout.write(
  "SportsRecs network and complete specialist public-scope verification passed.\n",
);
