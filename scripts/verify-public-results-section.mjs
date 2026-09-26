import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

// No production connection, exported athlete data or external timing requests.
// Run the actual API handler/SQL against an isolated PostgreSQL WASM database.
function loadTypeScript(path, dependencies = {}) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(path, "utf8"), {
    fileName: path,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  const require = (name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected test import: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", compiled.outputText)(require, module, module.exports);
  return module.exports;
}

const sportPages = loadTypeScript("src/lib/athrecs/sport-pages.ts");
const search = loadTypeScript("src/lib/athrecs/public-results-search.ts", { "./sport-pages": sportPages });
assert.equal(search.normalizeResultsSearch({ category: "trail-running" }).category, "trail-running");
assert.equal(search.normalizeResultsSearch({ category: "unknown" }).category, "");
assert.equal(search.normalizeResultsSearch(undefined).page, 1);
for (const page of [-1, 0, NaN, Infinity, "bad", {}, []]) {
  assert.equal(search.normalizeResultsSearch({ page }).page, 1);
}
assert.equal(search.normalizeResultsSearch({ page: 9999 }).page, 1000);
assert.equal(search.normalizeResultsSearch({ q: "x".repeat(200) }).q.length, 120);
for (const editionId of [0, -1, "x", "1.5", true, null, {}, "2147483648"]) {
  assert.throws(() => search.parseResultsEditionId(editionId));
}
assert.equal(search.parseResultsEditionId("42"), 42);

const db = new PGlite();
await db.waitReady;
let queryCount = 0;
const sql = async (strings, ...values) => {
  let text = strings[0];
  for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
  assert.match(text.trim(), /^select\s/i, "Public handlers must only issue SELECT statements");
  queryCount += 1;
  return (await db.query(text, values)).rows;
};
const createServerFn = ({ method }) => {
  assert.equal(method, "GET");
  return { validator: (validate) => ({ handler: (run) => ({ data } = {}) => run({ data: validate(data) }) }) };
};
const scope = { IS_RUNRECS_SITE: false };
const api = loadTypeScript("src/lib/athrecs/public-results-api.ts", {
  "@tanstack/react-start": { createServerFn },
  "@/lib/db": { getSql: async () => sql },
  "@/lib/site-scope": scope,
  "./seed.server": { ensureAthrecsSeeded: async () => {} },
  "./format": { todayIso: () => "2026-09-23" },
  "./public-results-search": search,
  "./sport-pages": sportPages,
});

try {
  await db.exec(`
    create table events (id integer primary key, name text, sport text, city text, country text, surface text default 'Road');
    create table editions (id integer primary key, event_id integer, event_date date, distance_code text);
    create table clubs (id integer primary key, name text);
    create table athletes (id integer primary key, display_name text, slug text, club_id integer,
      profile_type text, profile_visibility text);
    create table results (id integer primary key, athlete_id integer, edition_id integer,
      status text, result_details jsonb default '{}', result_visibility text,
      overall_place integer, gender_place integer, category_place integer, category text,
      finish_time_seconds integer, chip_time_seconds integer, gun_time_seconds integer);
    create table athlete_account_links (user_id text, athlete_id integer, status text);
    create table athlete_public_shares (user_id text, enabled boolean, share_results boolean);
    create table athlete_profile_hidden_results (user_id text, result_id integer);
    insert into events (id, name, sport, city, country) values (10, 'Synthetic 10K', 'Running', 'Example town', 'United Kingdom'),
      (11, 'Future race', 'Running', 'Example town', 'United Kingdom');
    insert into editions values (10, 10, '2026-09-20', '10K'), (11, 11, '2027-01-01', '10K');
    insert into clubs values (1, 'Synthetic Club');
    insert into athletes values
      (1, 'Alex Example', 'alex-example-one', 1, 'Athlete', 'public'),
      (2, 'Private Athlete', 'private', 1, 'Athlete', 'private'),
      (3, 'Hidden Result', 'hidden', 1, 'Athlete', 'public'),
      (4, 'Disabled Profile', 'disabled', 1, 'Athlete', 'public'),
      (5, 'No Results Share', 'no-share', 1, 'Athlete', 'public'),
      (6, 'Alex Example', 'alex-example-two', 1, 'Athlete', 'public'),
      (7, 'Synthetic Public Figure', 'public-figure', 1, 'Public figure', 'private'),
      (8, 'Private Performance', 'private-performance', 1, 'Athlete', 'public'),
      (9, 'Figure Opt Out', 'figure-opt-out', 1, 'Public figure', 'public');
    insert into results (id, athlete_id, edition_id, status, result_visibility,
      overall_place, gender_place, category_place, category,
      finish_time_seconds, chip_time_seconds, gun_time_seconds)
      select id, id, 10, 'Finished', case when id = 8 then 'private' else 'public' end,
        id + 6, id, id, 'V40', 1900 + id, 1890 + id, 1900 + id from athletes;
    update results set result_details = '{"disqualification":{"reason":"other"}}' where id = 7;
    insert into results (id, athlete_id, edition_id, status, result_visibility) values
      (90, 1, 11, 'Finished', 'public');
    insert into athlete_account_links values ('u3', 3, 'active'), ('u4', 4, 'active'),
      ('u5', 5, 'active'), ('u9', 9, 'active');
    insert into athlete_public_shares values ('u3', true, true), ('u4', false, true),
      ('u5', true, false), ('u9', false, true);
    insert into athlete_profile_hidden_results values ('u3', 3);
  `);

  const snapshot = async () => JSON.stringify((await db.query("select * from results order by id")).rows);
  const before = await snapshot();
  const index = await api.listPublicResultEditions({ data: {} });
  assert.equal(index.editions.length, 1, "Future races must not appear");
  assert.equal(index.editions[0].result_count, 3, "Counts must use the same privacy filters as rows");
  const detail = await api.getPublicRaceResults({ data: { editionId: 10 } });
  assert.deepEqual(detail.results.map((row) => row.id), [1, 6, 7]);
  assert.equal(detail.results[2].disqualified, true);
  assert.equal(detail.results[0].overall_place, 7, "Do not renumber official placings");
  assert.equal(detail.results[0].chip_time_seconds, 1891);
  assert.equal(detail.results[0].gun_time_seconds, 1901);
  assert.notEqual(detail.results[0].athlete_slug, detail.results[1].athlete_slug,
    "Same-name identities must remain distinct");
  assert.equal(detail.results[0].athlete_name, detail.results[1].athlete_name);
  assert.equal(await api.getPublicRaceResults({ data: { editionId: 999 } }), null);
  assert.equal(await api.getPublicRaceResults({ data: { editionId: 11 } }), null);
  for (const q of ["%", "_", "' OR 1=1 --"]) {
    assert.equal((await api.listPublicResultEditions({ data: { q } })).editions.length, 0);
  }
  assert.equal((await api.listPublicResultEditions({ data: { year: "2025" } })).editions.length, 0);
  assert.equal((await api.listPublicResultEditions({ data: { sport: "Cycling" } })).editions.length, 0);
  assert.equal((await api.getPublicRaceResults({ data: { editionId: 10, q: "Alex Example" } })).results.length, 2);
  assert.equal(await snapshot(), before, "Reading must not mutate canonical results");

  await db.exec(`
    insert into events (id, name, sport, surface) values
      (20, 'Trail Run', 'Running', 'Trail'),
      (21, 'Track Meeting', 'Athletics', 'Track'),
      (22, 'Track Run', 'Running', 'Track'),
      (23, 'Cross Country', 'Athletics', 'Cross Country'),
      (24, 'Track Cycling', 'Cycling', 'Track'),
      (25, 'Trail Athletics', 'Athletics', 'Trail'),
      (26, 'Athletics Road', 'Athletics', 'Road'),
      (27, 'Road Cycling', 'Cycling', 'Road'),
      (28, 'MTB Race', 'Cycling', 'MTB'),
      (29, 'Trail Ride', 'Cycling', 'Trail'),
      (30, 'MTB Gravel Programme', 'Cycling', 'MTB / Gravel'),
      (31, 'BMX Race', 'Cycling', 'BMX Track'),
      (32, 'Cyclo-cross Race', 'Cycling', 'Cyclo-cross'),
      (33, 'Gravel Race', 'Cycling', 'Gravel'),
      (34, 'Velodrome Meet', 'Cycling', 'Velodrome');
    insert into editions select id, id, '2026-09-01', 'Other' from events where id >= 20;
    insert into results (id, athlete_id, edition_id, status, result_visibility)
      select id, 1, id, 'Finished', 'public' from editions where id >= 20;
  `);
  const namesFor = async (category) => (await api.listPublicResultEditions({ data: { category } })).editions.map(row => row.event_name).sort();
  assert.deepEqual(await namesFor("trail-running"), ["Trail Athletics", "Trail Run"]);
  assert.deepEqual(await namesFor("track-and-field"), ["Track Meeting", "Track Run"]);
  assert.deepEqual(await namesFor("road-running"), ["Athletics Road", "Synthetic 10K"]);
  assert.deepEqual(await namesFor("road-cycling"), ["Road Cycling"]);
  assert.deepEqual(await namesFor("mountain-biking"), ["MTB Gravel Programme", "MTB Race", "Trail Ride"]);
  assert.deepEqual(await namesFor("track-cycling"), ["Track Cycling", "Velodrome Meet"]);
  assert.deepEqual(await namesFor("bmx"), ["BMX Race"]);
  await db.exec(`delete from results where edition_id >= 20; delete from editions where id >= 20; delete from events where id >= 20;`);

  await db.exec(`
    insert into events (id, name, sport, city, country) select n, 'Synthetic event ' || n, 'Running', 'Example town', 'United Kingdom'
      from generate_series(100, 130) n;
    insert into editions select n, n, '2026-08-01'::date, '5K' from generate_series(100, 130) n;
    insert into results (id, athlete_id, edition_id, status, result_visibility)
      select n, 1, n, 'Finished', 'public' from generate_series(100, 130) n;
    insert into athletes select n, 'Synthetic athlete ' || n, 'synthetic-' || n, 1, 'Athlete', 'public'
      from generate_series(1000, 1104) n;
    insert into results (id, athlete_id, edition_id, status, result_visibility, overall_place)
      select n, n, 10, 'Finished', 'public', n from generate_series(1000, 1104) n;
  `);
  const page1 = await api.listPublicResultEditions({ data: { page: 1 } });
  const page2 = await api.listPublicResultEditions({ data: { page: 2 } });
  assert.equal(page1.editions.length, 24);
  assert.equal(page1.hasMore, true);
  assert.equal(page2.editions.length, 8);
  assert.equal(page2.hasMore, false);
  assert.equal(new Set([...page1.editions, ...page2.editions].map((row) => row.edition_id)).size, 32);
  const resultPage1 = await api.getPublicRaceResults({ data: { editionId: 10, page: 1 } });
  const resultPage2 = await api.getPublicRaceResults({ data: { editionId: 10, page: 2 } });
  assert.equal(resultPage1.results.length, 100);
  assert.equal(resultPage1.hasMore, true);
  assert.equal(resultPage2.results.length, 8);
  assert.equal(resultPage2.hasMore, false);
  assert.equal(new Set([...resultPage1.results, ...resultPage2.results].map((row) => row.id)).size, 108);

  scope.IS_RUNRECS_SITE = true;
  const previousQueryCount = queryCount;
  assert.equal((await api.listPublicResultEditions({ data: {} })).editions.length, 0);
  assert.equal(await api.getPublicRaceResults({ data: { editionId: 10 } }), null);
  assert.equal(queryCount, previousQueryCount, "RunRecs must not query the AthRecs archive");

  const pageSource = readFileSync("src/routes/results/$editionId.tsx", "utf8");
  assert.match(pageSource, /to="\/claim-results" search=\{\{ resultId: result.id \}\}/);
  assert.match(pageSource, /slug: result.athlete_slug/);
  assert.doesNotMatch(pageSource, /submitResultClaim|applyResultsImport|applyImportBundle/);
  console.log("PASS: public results SQL, privacy exclusions, same-name identity separation, recorded placings, distinct chip/gun times, query escaping, pagination and RunRecs isolation.");
} finally {
  await db.close();
}
