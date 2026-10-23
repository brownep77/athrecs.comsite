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
let failCaptureReadCode = null;
let captureAggregateOverride = null;
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
    const captureRead = /FROM result_archive_source_captures\b/i.test(text);
    if (captureRead && failCaptureReadCode)
      throw Object.assign(new Error("PRIVATE DATABASE ERROR SENTINEL"), {
        code: failCaptureReadCode,
      });
    const rows = (await connection.query(text, values)).rows;
    return captureRead && captureAggregateOverride ? captureAggregateOverride(rows) : rows;
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
  assert.equal(missing.issues.length, 8);
  assert.ok(missing.issues.every((issue) => issue.reason === "missing"));
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
  assert.deepEqual(response.issues, []);
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

  const urlCases = [
    ["HTTPS://WWW.ALPHA.TEST.:443/results", "alpha"],
    ["https://%61lpha.test/results", "alpha"],
    ["https://alpha.test:65535/results", "alpha"],
    ["http://alpha.test:0/results", "alpha"],
    ["https://alpha.test:65536/results", "invalid"],
    ["https://alpha.test:999999999999999/results", "invalid"],
    ["https://user:secret@alpha.test/results", "invalid"],
    ["https://alpha.test.evil/results", "lookalike"],
    ["javascript:alpha.test/results", "invalid"],
    ["https://bücher.test/results", "idn"],
    ["https://xn--bcher-kva.test/results", "idn"],
  ];
  for (const [index, [url]] of urlCases.entries()) {
    await db.query("insert into results values ($1,$2)", [1000 + index, url]);
  }
  const idnSource = {
    ...registry[0],
    source_id: "idn_source",
    source_name: "IDN source",
    start_url: "https://bücher.test/",
    allowed_domains: "xn--bcher-kva.test",
  };
  const normalized = await request({}, [...registry, idnSource]);
  assert.equal(
    normalized.rows.find((row) => row.sourceId === "alpha_main").stored.canonicalResults,
    7,
    "Normalize case, www, trailing dots, encoded hosts and valid ports; reject credentials and invalid ports",
  );
  assert.equal(
    normalized.rows.find((row) => row.sourceId === "idn_source").stored.canonicalResults,
    2,
    "Unicode and punycode versions of the same host must share coverage",
  );
  assert.equal(normalized.summary.stored.canonicalResults, 5 + urlCases.length);
  await db.exec(`
    insert into event_register_sources values
      ('idn-a','Unicode inventory','https://bücher.test/','bücher.test','Test','[]'),
      ('idn-b','Punycode inventory alias','https://xn--bcher-kva.test/','xn--bcher-kva.test','Test','[]')
  `);
  const idnInventory = await request({ q: "Punycode inventory alias" });
  assert.equal(idnInventory.rows.length, 1);
  assert.equal(idnInventory.rows[0].domain, "xn--bcher-kva.test");
  assert.equal(idnInventory.rows[0].stored.canonicalResults, 2);
  assert.equal(idnInventory.rows[0].inventory.sources, 2);
  assert.equal(idnInventory.rows[0].sharedDomain, true);
  const idnRegistered = await request({ q: "Punycode inventory alias" }, [...registry, idnSource]);
  assert.equal(
    idnRegistered.rows.length,
    1,
    "Registry metadata takes precedence over inventory aliases",
  );
  assert.equal(idnRegistered.rows[0].registrySourceId, "idn_source");
  await db.exec(
    "delete from results where id>=1000; delete from event_register_sources where source_key like 'idn-%'",
  );

  await db.exec(`
    insert into event_register_sources values
      ('overlap-parent','Overlap parent','https://overlap.test/','overlap.test','Test','[]'),
      ('overlap-child','Overlap child','https://results.overlap.test/','results.overlap.test','Test','[]');
    insert into results values
      (2000,'https://overlap.test/race'),
      (2001,'https://results.overlap.test/race'),
      (2002,'https://nested.results.overlap.test/race')
  `);
  const overlapRegistry = [
    ...registry,
    {
      ...registry[0],
      source_id: "overlap_specific",
      source_name: "Overlap registered subdomain",
      start_url: "https://results.overlap.test/",
      allowed_domains: "results.overlap.test|*.nested.results.overlap.test",
    },
  ];
  const overlapping = await request({ q: "Overlap" }, overlapRegistry);
  assert.equal(overlapping.total, 2, "The registered subdomain replaces its inventory row");
  const registeredOverlap = overlapping.rows.find((row) => row.registrySourceId);
  const inventoryOverlap = overlapping.rows.find((row) => row.origin === "inventory");
  assert.equal(
    registeredOverlap.stored.canonicalResults,
    2,
    "A child domain cannot claim its parent's rows",
  );
  assert.equal(inventoryOverlap.stored.canonicalResults, 3);
  assert.equal(registeredOverlap.sharedDomain, true);
  assert.equal(
    inventoryOverlap.sharedDomain,
    true,
    "Inventory and registry overlap must both be flagged",
  );
  assert.equal(
    overlapping.summary.stored.canonicalResults,
    8,
    "Shared rows count only once in global totals",
  );
  await db.exec(
    "delete from results where id>=2000; delete from event_register_sources where source_key like 'overlap-%'",
  );

  const tiedNames = ["tie_z", "tie_a"].map((sourceId) => ({
    ...registry[0],
    source_id: sourceId,
    source_name: "Identical source title",
  }));
  const tiedFirst = await request({ q: "Identical source title", limit: 1 }, tiedNames);
  const tiedSecond = await request(
    { q: "Identical source title", limit: 1, offset: tiedFirst.nextOffset },
    tiedNames,
  );
  assert.equal(tiedFirst.rows[0].sourceId, "tie_a");
  assert.equal(tiedSecond.rows[0].sourceId, "tie_z");
  assert.equal(tiedSecond.nextOffset, null);
  const beyond = await request({ q: "Identical source title", offset: 999 }, tiedNames);
  assert.deepEqual(beyond.rows, []);
  assert.equal(beyond.total, 2);
  assert.equal(beyond.nextOffset, null);
  assert.deepEqual(
    beyond.summary.stored,
    response.summary.stored,
    "Pagination and filters cannot change collection totals",
  );

  await db.exec(`
    insert into result_archive_source_captures values
      (50,'test','same-timestamp','active','https://alpha.test/tie','{"publication":"staff_only"}','compared',100,'2026-10-23'),
      (51,'test','same-timestamp','active','https://alpha.test/tie','{"publication":"staff_only"}','held',100,'2026-10-23'),
      (52,'provider-two','normal','active','https://alpha.test/other-provider','{"publication":"staff_only"}','compared',2,'2026-10-23'),
      (53,'provider-three','normal','active','https://alpha.test/third-provider','{"publication":"staff_only"}','compared',4,'2026-10-23'),
      (54,'test','moved','active','https://alpha.test/old-location','{"publication":"staff_only"}','compared',20,'2026-10-22'),
      (55,'test','moved','active','https://beta.test/new-location','{"publication":"staff_only"}','compared',5,'2026-10-23'),
      (56,'test','missing-publication','active','https://alpha.test/no-publication','{"publication":"staff_only"}','compared',30,'2026-10-22'),
      (57,'test','missing-publication','active','https://alpha.test/no-publication','{}','compared',30,'2026-10-23')
  `);
  const superseded = await request();
  assert.equal(superseded.summary.stored.captureRows, 14);
  assert.equal(superseded.summary.stored.capturePages, 5);
  assert.equal(superseded.rows.find((row) => row.sourceId === "alpha_main").stored.captureRows, 9);
  assert.equal(superseded.rows.find((row) => row.sourceId === "beta").stored.captureRows, 5);
  assert.equal(
    superseded.rows.find((row) => row.sourceId === "alpha_main").inventory.heldCapturePages,
    2,
  );
  await db.exec("delete from result_archive_source_captures where id>=50");

  const capturedWarnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => capturedWarnings.push(args);
  try {
    for (const [code, reason] of [
      ["57014", "timed_out"],
      ["55P03", "locked"],
      ["08006", "unavailable"],
      ["42P01", "missing"],
    ]) {
      failCaptureReadCode = code;
      queryCount = 0;
      const failed = await request({ q: "No linked data" });
      assert.equal(
        queryCount,
        9,
        "A collection failure must not trigger automatic expensive retries",
      );
      assert.equal(failed.stores.captures, false);
      assert.equal(failed.summary.stored.captureRows, null);
      assert.equal(failed.rows[0].coverageState, "incomplete");
      assert.equal(failed.issues.find((issue) => issue.store === "captures").reason, reason);
      assert.equal(JSON.stringify(failed).includes("PRIVATE DATABASE ERROR SENTINEL"), false);
      failCaptureReadCode = null;
      const recovered = await request({ q: "No linked data" });
      assert.equal(
        recovered.stores.captures,
        true,
        "A fresh request must recover without stale failure state",
      );
      assert.equal(recovered.summary.stored.captureRows, 3);
      assert.equal(recovered.rows[0].coverageState, "no_linked_rows");
      assert.deepEqual(recovered.issues, []);
    }
  } finally {
    console.warn = originalWarn;
    failCaptureReadCode = null;
  }
  assert.equal(capturedWarnings.length, 4);
  assert.equal(JSON.stringify(capturedWarnings).includes("PRIVATE DATABASE ERROR SENTINEL"), false);
  for (const invalid of [NaN, Infinity, -1, 1.5, null, "", true, "9007199254740992", undefined]) {
    captureAggregateOverride = (rows) =>
      rows.map((row, index) => (index === 0 ? { ...row, captureRows: invalid } : row));
    const invalidCount = await request();
    assert.equal(
      invalidCount.stores.captures,
      false,
      `Reject malformed aggregate ${String(invalid)}`,
    );
    assert.equal(invalidCount.summary.stored.captureRows, null);
    assert.equal(
      invalidCount.issues.find((issue) => issue.store === "captures").reason,
      "invalid_data",
    );
  }
  captureAggregateOverride = (rows) =>
    rows.map((row, index) => ({ ...row, captureRows: index ? 1 : Number.MAX_SAFE_INTEGER }));
  const overflowingCount = await request();
  assert.equal(
    overflowingCount.stores.captures,
    false,
    "Reject totals that lose integer precision",
  );
  captureAggregateOverride = null;

  const firstPage = await request({ limit: 3 });
  const secondPage = await request({ limit: 3, offset: firstPage.nextOffset });
  const finalPage = await request({ limit: 3, offset: secondPage.nextOffset });
  assert.equal(firstPage.total, response.total);
  assert.equal(finalPage.nextOffset, null);
  assert.deepEqual(
    [...firstPage.rows, ...secondPage.rows, ...finalPage.rows].map((row) => row.sourceId),
    response.rows.map((row) => row.sourceId),
  );

  await db.exec(`
    insert into athlete_source_histories values
      ('https://alpha.test/athlete/repeated','[{},{}]'),
      ('https://alpha.test/athlete/repeated','[]')
  `);
  const repeatedHistory = await request({ q: "alpha main" });
  assert.equal(
    repeatedHistory.rows[0].stored.historyProfiles,
    4,
    "Grouping repeated source URLs must preserve every stored history profile",
  );
  assert.equal(repeatedHistory.rows[0].stored.historyRows, 5);
  assert.equal(repeatedHistory.summary.stored.historyProfiles, 5);
  assert.equal(repeatedHistory.summary.stored.historyRows, 6);
  await db.exec(
    "delete from athlete_source_histories where source_url='https://alpha.test/athlete/repeated'",
  );

  // Legacy malformed JSON must not silently turn missing performance counts
  // into zero, even though modern schemas require an array in this column.
  for (const malformed of ['{"not":"an array"}', '"text"', "42", "true", "null", null]) {
    await db.query("insert into athlete_source_histories values ($1,$2::jsonb)", [
      "https://none.test/malformed-history",
      malformed,
    ]);
    const malformedHistory = await request();
    assert.equal(malformedHistory.stores.histories, false);
    assert.equal(malformedHistory.summary.stored.historyProfiles, null);
    assert.equal(malformedHistory.summary.stored.historyRows, null);
    assert.equal(malformedHistory.summary.stored.archiveRows, 2);
    assert.equal(malformedHistory.summary.stored.captureRows, 3);
    assert.equal(
      malformedHistory.issues.find((issue) => issue.store === "histories").reason,
      "invalid_data",
    );
    assert.equal(
      malformedHistory.rows.find((row) => row.sourceId === "no_data").coverageState,
      "incomplete",
      "Malformed histories leave the collection unknown rather than claim no stored rows",
    );
    assert.equal(
      malformedHistory.rows.find((row) => row.sourceId === "alpha_main").coverageState,
      "stored_rows",
      "Other known collections remain visible when malformed histories cannot be counted",
    );
    await db.exec(
      "delete from athlete_source_histories where source_url='https://none.test/malformed-history'",
    );
  }

  await db.exec("alter table event_register_sources rename to unavailable_source_inventory");
  const unavailableInventory = await request({ q: "Gamma inventory" });
  assert.deepEqual(unavailableInventory.rows, []);
  assert.equal(unavailableInventory.total, 0);
  assert.equal(unavailableInventory.stores.inventorySources, false);
  assert.equal(unavailableInventory.summary.inventorySources, null);
  assert.equal(
    unavailableInventory.issues.find((issue) => issue.store === "inventorySources").reason,
    "missing",
  );
  await db.exec("alter table unavailable_source_inventory rename to event_register_sources");
  assert.equal((await request({ q: "Gamma inventory" })).rows.length, 1);

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
    "Athlete source coverage verified: bounded aggregates, URL authority normalization, registry/inventory overlap, latest capture supersession, repeated history URLs, malformed histories/counts, saved links, extraction states, deterministic pagination, safe failure diagnostics, explicit recovery, and staff-only metadata.",
  );
} finally {
  await db.close();
}
