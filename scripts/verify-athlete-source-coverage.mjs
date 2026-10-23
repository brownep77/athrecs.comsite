import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const modules = new Map();
function loadTs(filename) {
  filename = resolve(filename);
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} };
  modules.set(filename, module);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const localRequire = (name) =>
    name.startsWith(".") ? loadTs(resolve(dirname(filename), `${name}.ts`)) : require(name);
  new Function("require", "module", "exports", source)(localRequire, module, module.exports);
  return module.exports;
}
const { athleteFinderSourceCoverage } = loadTs("src/lib/athlete-finder/coverage.server.ts");
const { sourceCoverageInputSchema } = loadTs("src/lib/athlete-finder/coverage.ts");

const api = readFileSync("src/lib/athlete-finder/coverage-api.ts", "utf8");
assert.match(api, /\.middleware\(\[staffMiddleware\]\)/, "Source metadata must remain staff-only");
assert.equal(sourceCoverageInputSchema.safeParse({ limit: 101 }).success, false);
assert.equal(sourceCoverageInputSchema.safeParse({ offset: -1 }).success, false);
assert.equal(sourceCoverageInputSchema.safeParse({ q: "x".repeat(161) }).success, false);

const registry = [
  {
    source_id: "alpha_main",
    source_name: "Alpha main",
    start_url: "https://www.alpha.test/index",
    allowed_domains: "www.alpha.test|alpha.test|cdn.alpha.test",
    enabled: true,
  },
  {
    source_id: "alpha_results",
    source_name: "Alpha results",
    start_url: "https://alpha.test/results",
    allowed_domains: "alpha.test",
    enabled: false,
  },
  {
    source_id: "beta",
    source_name: "Beta documents",
    start_url: "https://beta.test/",
    allowed_domains: "beta.test",
    enabled: true,
    rights_status: "Restricted",
  },
  {
    source_id: "delta",
    source_name: "Delta links",
    start_url: "https://delta.test/",
    allowed_domains: "delta.test",
    enabled: false,
  },
  {
    source_id: "no_data",
    source_name: "No linked data",
    start_url: "https://none.test/",
    allowed_domains: "none.test",
    enabled: false,
  },
  {
    source_id: "trt",
    source_name: "Total Race Timing",
    start_url: "https://totalracetiming.co.uk/result",
    allowed_domains: "totalracetiming.co.uk",
    enabled: true,
  },
].map((source) => ({
  source_type: "results",
  country_focus: "Test",
  rights_status: "No published crawl restriction found",
  ...source,
}));

const db = new PGlite();
let queryCount = 0;
let failHistoryRead = false;
function sqlFor(connection) {
  const sql = async (parts, ...values) =>
    sql.query(
      parts.reduce((text, part, index) => text + (index ? `$${index}` : "") + part, ""),
      values,
    );
  sql.query = async (text, values = []) => {
    if (!/^set local /i.test(text)) queryCount += 1;
    if (failHistoryRead && /FROM athlete_source_histories/i.test(text))
      throw Object.assign(new Error("Synthetic timeout"), { code: "57014" });
    return (await connection.query(text, values)).rows;
  };
  sql.transaction = (work) => db.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db);
const request = (input = {}, sources = registry) =>
  athleteFinderSourceCoverage(sql, sourceCoverageInputSchema.parse(input), sources);

try {
  const missing = await request();
  assert.equal(queryCount, 1, "Absent optional stores should not be queried");
  assert.equal(missing.total, registry.length);
  assert.ok(Object.values(missing.stores).every((available) => !available));
  assert.equal(missing.summary.stored.canonicalResults, null);
  assert.equal(missing.summary.inventory.knownResultItems, null);
  assert.equal(missing.summary.inventory.savedResultLinks, null);
  assert.ok(
    missing.rows.every((row) => row.coverageState === "incomplete"),
    "Unknown collections cannot be reported as having no stored rows",
  );
  assert.ok(missing.notes.some((note) => note.includes("unknown, not zero")));

  // Synthetic schemas contain only the production columns the read service uses.
  // No external database or provider is contacted by this verifier.
  await db.exec(`
    create table results(id int,source_url text);
    create table result_archive_datasets(id int,source_url text);
    create table result_archive_entries(id int,dataset_id int,payload jsonb);
    create table result_archive_capture_approvals(id text,scope text,revoked_at timestamptz);
    create table result_archive_source_captures(id int,provider text,source_key text,
      approval_id text,source_url text,payload jsonb,source_check text,row_count int,captured_at timestamptz);
    create table athlete_source_histories(source_url text,performances jsonb);
    create table edition_result_links(results_url text);
    create table event_register_sources(source_key text,name text,url text,host text,country text,cursors jsonb);
    create table event_register_source_records(source_host text,source_url text);
    create table event_register_extraction_items(source_host text,source_url text,kind text,state text);

    insert into results values
      (1,'https://alpha.test/race/1'),(2,'https://www.alpha.test/race/2'),
      (3,'https://results.alpha.test/race/3'),(4,'https://alpha.test.evil/race/4'),(5,null);
    insert into result_archive_datasets values (1,'https://alpha.test/race/1'),(2,'https://cdn.alpha.test/race/2');
    insert into result_archive_entries values
      (1,1,'{"name":"PRIVATE PARTICIPANT SENTINEL"}'),(2,1,'{"name":"PRIVATE PARTICIPANT SENTINEL"}');
    insert into result_archive_capture_approvals values ('active','staff_only',null),('revoked','staff_only','2026-10-22');
    insert into result_archive_source_captures values
      (1,'test','normal','active','https://alpha.test/normal','{"publication":"staff_only","name":"PRIVATE PARTICIPANT SENTINEL"}','compared',9,'2026-10-20'),
      (2,'test','normal','active','https://alpha.test/normal','{"publication":"staff_only"}','compared',3,'2026-10-21'),
      (3,'test','held','active','https://alpha.test/held','{"publication":"staff_only"}','compared',7,'2026-10-20'),
      (4,'test','held','active','https://alpha.test/held','{"publication":"staff_only"}','held',4,'2026-10-22'),
      (5,'test','revoked','active','https://alpha.test/revoked','{"publication":"staff_only"}','compared',8,'2026-10-20'),
      (6,'test','revoked','revoked','https://alpha.test/revoked','{"publication":"staff_only"}','compared',6,'2026-10-22'),
      (7,'test','public','active','https://alpha.test/public','{"publication":"staff_only"}','compared',8,'2026-10-20'),
      (8,'test','public','active','https://alpha.test/public','{"publication":"public"}','compared',5,'2026-10-22'),
      (9,'test','empty','active','https://alpha.test/empty','{"publication":"staff_only"}','empty',0,'2026-10-22'),
      (10,'test','document','active','https://beta.test/document','{"publication":"staff_only"}','held',0,'2026-10-22');
    insert into athlete_source_histories values
      ('https://alpha.test/athlete/1','[{"name":"PRIVATE PARTICIPANT SENTINEL"},{}]'),
      ('https://alpha.test/athlete/2','[{}]'),('https://gamma.test/athlete/3','[{}]');
    insert into edition_result_links values
      ('https://totalracetiming.co.uk/raceresults/123'),
      ('https://www.totalracetiming.co.uk/raceresults/124'),
      ('https://totalracetiming.co.uk.evil/not-the-source'),
      ('https://alpha.test/result-link');
    insert into event_register_sources values
      ('alpha-main','Alpha inventory','https://alpha.test/','www.alpha.test','Test','[{"url":"https://alpha.test/saved"}]'),
      ('beta-docs','Beta documents','https://beta.test/','beta.test','Test','[]'),
      ('gamma-a','Gamma inventory','https://gamma.test/','gamma.test','Test','[]'),
      ('gamma-b','Alternative gamma name','https://gamma.test/archive','gamma.test','Test','[]'),
      ('delta','Delta fixture links','https://delta.test/','delta.test','Test','[{"url":"https://delta.test/a"},{"url":"https://delta.test/b"}]');
    insert into event_register_source_records values
      ('alpha.test','https://alpha.test/race/1'),('www.alpha.test','https://alpha.test/race/2'),
      ('delta.test','https://delta.test/fixture');
    insert into event_register_extraction_items values
      ('alpha.test','https://alpha.test/race/1','results','extracted'),
      ('beta.test','https://beta.test/1','results','pending'),
      ('beta.test','https://beta.test/2','results','partial'),
      ('beta.test','https://beta.test/3','results','held'),
      ('beta.test','https://beta.test/4','results','failed'),
      ('beta.test','https://beta.test/not-a-race','results','excluded'),
      ('beta.test','https://beta.test/fixtures','fixture','extracted'),
      ('delta.test','https://delta.test/navigation','unclassified','pending');
  `);

  queryCount = 0;
  const response = await request();
  assert.equal(
    queryCount,
    9,
    "Use one availability query and at most one aggregate per store, never one query per registry source",
  );
  assert.ok(Object.values(response.stores).every(Boolean));
  assert.equal(response.total, 7, "Include one wider-inventory row per unregistered domain");
  assert.equal(response.summary.registrySources, 6);
  assert.equal(response.summary.registryDomains, 5);
  assert.equal(response.summary.metadataRunnableSources, 2);
  assert.equal(response.summary.inventorySources, 5);
  assert.equal(response.summary.inventoryDomains, 4);
  assert.equal(
    response.summary.domainsWithStoredRows,
    4,
    "Unknown source URLs do not fabricate a domain",
  );
  assert.deepEqual(response.summary.stored, {
    canonicalResults: 5,
    archiveDatasets: 2,
    archiveRows: 2,
    capturePages: 2,
    captureRows: 3,
    historyProfiles: 3,
    historyRows: 4,
  });
  assert.equal(
    response.summary.inventory.knownResultItems,
    5,
    "Exclude fixtures, navigation, and excluded extraction work",
  );
  assert.equal(response.summary.inventory.heldCapturePages, 2);
  assert.equal(response.summary.inventory.savedResultLinks, 4);
  const alpha = response.rows.find((row) => row.sourceId === "alpha_main");
  const secondAlpha = response.rows.find((row) => row.sourceId === "alpha_results");
  assert.equal(alpha.sharedDomain, true);
  assert.deepEqual(
    alpha.stored,
    secondAlpha.stored,
    "Repeated same-domain source rows intentionally share coverage",
  );
  assert.equal(alpha.stored.canonicalResults, 3, "Match subdomains but reject lookalike suffixes");
  assert.equal(
    alpha.stored.archiveDatasets,
    2,
    "Allowed alias and parent-domain matches cannot double count a dataset",
  );
  assert.equal(
    alpha.stored.captureRows,
    3,
    "Do not resurrect older rows behind held, revoked, or non-staff latest captures",
  );
  assert.equal(alpha.inventory.records, 2);
  assert.equal(alpha.inventory.heldCapturePages, 1);
  assert.equal(alpha.inventory.savedResultLinks, 1);
  assert.equal(
    secondAlpha.inventory.savedResultLinks,
    1,
    "Same-domain link counts must remain shared",
  );
  assert.equal(alpha.coverageState, "stored_rows");
  assert.equal(
    secondAlpha.metadataRunnable,
    false,
    "Searching existing data must not turn on collection",
  );
  const beta = response.rows.find((row) => row.sourceId === "beta");
  assert.equal(beta.metadataRunnable, false, "Enabled with restricted rights remains blocked");
  assert.equal(beta.coverageState, "needs_extraction");
  assert.equal(beta.inventory.knownResultItems, 4);
  assert.equal(beta.inventory.pendingResultItems, 1);
  assert.equal(beta.inventory.partialResultItems, 1);
  assert.equal(beta.inventory.heldResultItems, 1);
  assert.equal(beta.inventory.failedResultItems, 1);
  assert.equal(response.rows.find((row) => row.sourceId === "delta").coverageState, "links_only");
  assert.equal(
    response.rows.find((row) => row.sourceId === "no_data").coverageState,
    "no_linked_rows",
  );
  assert.equal(response.rows.find((row) => row.sourceId === "trt").participantCheck, "trt");
  assert.equal(
    response.rows.find((row) => row.sourceId === "trt").coverageState,
    "links_only",
    "Saved edition result URLs are recognised without event-inventory rows",
  );
  assert.equal(
    response.rows.find((row) => row.sourceId === "trt").inventory.savedResultLinks,
    2,
    "Strip www and reject lookalike source domains",
  );
  assert.equal(alpha.participantCheck, "manual");
  const gamma = response.rows.find((row) => row.domain === "gamma.test");
  assert.equal(gamma.origin, "inventory");
  assert.equal(gamma.registrySourceId, null);
  assert.equal(gamma.sharedDomain, true);
  assert.equal(gamma.stored.historyRows, 1);
  assert.equal((await request({ q: "alternative gamma name" })).rows[0].sourceId, gamma.sourceId);
  assert.equal((await request({ q: "ALPHA.TEST" })).total, 2);
  assert.equal(
    (await request({ q: "%_' OR 1=1 --" })).total,
    0,
    "Source search treats SQL syntax as literal metadata text",
  );
  assert.equal(
    JSON.stringify(response).includes("PRIVATE PARTICIPANT SENTINEL"),
    false,
    "Only aggregate counts and source metadata may leave the service",
  );

  const firstPage = await request({ limit: 3 });
  const secondPage = await request({ limit: 3, offset: firstPage.nextOffset });
  const finalPage = await request({ limit: 3, offset: secondPage.nextOffset });
  assert.equal(firstPage.total, response.total);
  assert.equal(finalPage.nextOffset, null);
  assert.deepEqual(
    [...firstPage.rows, ...secondPage.rows, ...finalPage.rows].map((row) => row.sourceId),
    response.rows.map((row) => row.sourceId),
  );

  failHistoryRead = true;
  const busy = await request({ q: "alpha main" });
  assert.equal(busy.stores.histories, false);
  assert.equal(busy.summary.stored.historyRows, null, "A timed-out count is unknown, not zero");
  assert.equal(busy.rows[0].stored.canonicalResults, 3, "Other collection counts remain available");
  assert.equal(
    busy.rows[0].coverageState,
    "stored_rows",
    "Known rows remain visible even with another collection unavailable",
  );
  const busyEmpty = await request({ q: "No linked data" });
  assert.equal(
    busyEmpty.rows[0].coverageState,
    "incomplete",
    "A failed history read cannot prove there are no stored rows",
  );
  const busyLinks = await request({ q: "Total Race Timing" });
  assert.equal(
    busyLinks.rows[0].coverageState,
    "incomplete",
    "Incomplete stored coverage takes priority over links-only classification",
  );
  assert.equal(
    busyLinks.rows[0].inventory.savedResultLinks,
    2,
    "Known URL counts survive an unavailable participant collection",
  );
  failHistoryRead = false;

  await db.exec(
    "drop table result_archive_entries; drop table result_archive_capture_approvals; drop table event_register_extraction_items; drop table edition_result_links",
  );
  const partial = await request({ q: "alpha main" });
  assert.equal(partial.stores.archive, false);
  assert.equal(partial.stores.captures, false);
  assert.equal(partial.stores.extraction, false);
  assert.equal(partial.stores.resultLinks, false);
  assert.equal(partial.rows[0].inventory.savedResultLinks, null);
  assert.equal(partial.rows[0].stored.archiveRows, null);
  assert.equal(partial.rows[0].stored.captureRows, null);
  assert.equal(partial.rows[0].stored.canonicalResults, 3);
  assert.equal(partial.rows[0].coverageState, "stored_rows");

  console.log(
    "Athlete source coverage verified: bounded domain aggregation, latest approved captures, source overlap, saved result links, extraction states, literal filters, pagination, incomplete stores, and staff-only metadata.",
  );
} finally {
  await db.close();
}
