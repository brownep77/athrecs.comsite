import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { PGlite } from "@electric-sql/pglite";
import { z } from "zod";
const require = createRequire(import.meta.url),
  ts = require("typescript");
function load(path, deps) {
  const m = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(
    (n) => {
      if (!(n in deps)) throw Error(n);
      return deps[n];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const db = new PGlite({ parsers: { 20: Number, 1082: (v) => v } });
const sql = { query: async (q, p = []) => (await db.query(q, p)).rows };
const core = load("src/lib/event-register/core.ts", { zod: { z } });
const { listCollection } = load("src/lib/event-register/collection.server.ts", {
  "../db": {
    getSql: () => {
      throw Error("No live database allowed");
    },
  },
  "./core": core,
});
try {
  await db.waitReady;
  for (const file of readdirSync("migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync(`migrations/${file}`, "utf8"));
  await db.exec(`insert into event_register_sources(source_key,name,url,host,country) values
 ('one','Synthetic feed','https://example.test/results','example.test','England'),
 ('two','Synthetic second feed','https://example.test/calendar','example.test','England'),
 ('empty','Unprocessed feed','https://empty.test','empty.test','Wales');
 insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,country,edition_year,event_date,result_observations) values
 ('one','captured-results','Synthetic provider','https://example.test/2024','example.test','one','Year-only Marathon','Marathon','Running','England',2024,null,7),
 ('two','fixture-candidates','Synthetic provider','https://example.test/2027','example.test','two','100% running','10K','Running','Scotland',2027,'2027-06-01',0),
 ('three','catalogue','Synthetic provider','https://example.test/2026','example.test','three','Published parkrun','5K','Parkrun','Wales',2026,'2026-06-01',0);`);
  let result = await listCollection({}, sql);
  assert.equal(result.total, 2);
  assert.equal(result.inventory.records, 3);
  assert.equal(result.summary.year_only, 1);
  result = await listCollection({ year: 2024 }, sql);
  assert.equal(result.total, 1);
  assert.equal(result.rows[0].event_date, null);
  assert.equal(result.rows[0].edition_year, 2024);
  result = await listCollection({ country: "United Kingdom" }, sql);
  assert.equal(result.total, 2);
  result = await listCollection({ q: "%" }, sql);
  assert.equal(result.total, 1);
  assert.equal(result.rows[0].event_name, "100% running");
  result = await listCollection({ origin: "all" }, sql);
  assert.equal(result.total, 3);
  result = await listCollection({ gap: "results" }, sql);
  assert.equal(result.total, 1);
  result = await listCollection({ view: "sources", gap: "no-records" }, sql);
  assert.equal(result.total, 1);
  assert.equal(result.sources[0].host, "empty.test");
  result = await listCollection({ view: "sources", host: "example.test" }, sql);
  assert.equal(result.total, 2);
  assert.equal(result.sources[0].records, 3);
  assert.equal(result.sources[1].records, 3);
  // Progress is website-scoped. Unknown totals remain null; partial and held
  // items cannot round up to completion, and navigation is not a race item.
  assert.equal(result.sources[0].extraction_percent, null);
  await db.exec(`insert into event_register_extraction_items(source_host,item_key,source_url,kind,state) values
    ('example.test','a','https://example.test/a','results','extracted'),
    ('example.test','b','https://example.test/b','results','partial'),
    ('example.test','c','https://example.test/c','results','held'),
    ('example.test','d','https://example.test/d','fixture','pending'),
    ('example.test','nav','https://example.test/nav','unclassified','pending'),
    ('example.test','report','https://example.test/report','results','excluded');`);
  result = await listCollection({ view: "sources", host: "example.test" }, sql);
  assert.equal(result.sources[0].known_items, 4);
  assert.equal(result.sources[0].extraction_percent, 25);
  assert.equal(result.sources[0].partial_items, 1);
  assert.equal(result.sources[1].extraction_percent, 25);
  await db.exec(readFileSync("scripts/event-register/refresh-extraction-progress.sql", "utf8"));
  await db.exec(readFileSync("scripts/event-register/refresh-extraction-progress.sql", "utf8"));
  const guards = await sql.query(
    `select relname,relrowsecurity from pg_class where relname in ('event_register_sources','event_register_source_records','event_register_extraction_items')`,
  );
  assert.equal(guards.length, 3);
  assert(guards.every((r) => r.relrowsecurity));
  await db.exec("create role collection_reader; set role collection_reader");
  await assert.rejects(
    () => db.query("select * from event_register_source_records"),
    /permission denied/,
  );
  await db.exec("reset role");
  const api = readFileSync("src/lib/event-register/api.ts", "utf8");
  assert.match(
    api,
    /getRegisterCollection = createServerFn[\s\S]*?\.middleware\(\[staffMiddleware\]\)/,
  );
  // Actual backfill queries are parsed/executed on empty archive tables; saved
  // observations above and date precision must be preserved on repeat refresh.
  const refresh = readFileSync("scripts/event-register/refresh-source-records.sql", "utf8");
  await db.exec(refresh);
  await db.exec(refresh);
  assert.equal((await listCollection({ year: 2024 }, sql)).rows[0].event_date, null);
  await db.exec(readFileSync("scripts/event-register/reconcile-source-records.sql", "utf8"));
  console.log(
    "PASS: real collection queries, year-only dates, UK filtering, literal search, source coverage, staff guard, RLS and resumable refresh.",
  );
} finally {
  await db.close();
}
