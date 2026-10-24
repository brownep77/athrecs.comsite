import * as jsxRuntime from "react/jsx-runtime";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
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
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const require = (name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected test import: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", compiled.outputText)(require, module, module.exports);
  return module.exports;
}

const parkrun = loadTypeScript("src/lib/athrecs/parkrun-timing.ts");
const catalogueContent = loadTypeScript("src/lib/athrecs/public-catalogue-content.ts");
const sportPages = loadTypeScript("src/lib/athrecs/sport-pages.ts", { "./public-sports.ts": loadTypeScript("src/lib/athrecs/public-sports.ts") });
const { resultCredit } = loadTypeScript("src/lib/athrecs/result-credit.ts", { "./public-catalogue-content.ts": catalogueContent });
assert.deepEqual(resultCredit("https://totalracetiming.co.uk/raceresults/123", "import"), { name: "Total Race Timing", url: "https://totalracetiming.co.uk/raceresults/123" });
assert.equal(resultCredit("https://example.com/result", "Example Timing").name, "Example Timing");
assert.equal(resultCredit("javascript:alert(1)", "Unsafe"), null);
assert.equal(resultCredit(null, "No source"), null);
assert.equal(resultCredit("https://totalracetiming.co.uk.example.org/results", "import").name, "totalracetiming.co.uk.example.org");
const search = loadTypeScript("src/lib/athrecs/public-results-search.ts", { "./sport-pages": sportPages, "./result-slug.ts": loadTypeScript("src/lib/athrecs/result-slug.ts") });
const format = loadTypeScript("src/lib/athrecs/format.ts", {
  "./timezone.ts": loadTypeScript("src/lib/athrecs/timezone.ts"),
});
const { publicResultsHead } = loadTypeScript("src/lib/athrecs/public-results-seo.ts", {
  "./parkrun-timing.ts": parkrun,
  "./format": format,
  "./result-slug": loadTypeScript("src/lib/athrecs/result-slug.ts"),
  "./seo": loadTypeScript("src/lib/athrecs/seo.ts"),
});
assert.equal(search.normalizeResultsSearch({ category: "trail-running" }).category, "trail-running");
assert.equal(search.normalizeResultsSearch({ category: "all-running" }).category, "all-running");
assert.equal(search.normalizeResultsSearch({ category: "running" }).category, "road-running", "Legacy running category keeps its Road Running meaning");
assert.equal(search.normalizeResultsSearch({ category: "unknown" }).category, "");
for (const category of ["hybrid-fitness", "hyrox", "deka", "crossfit", "functional-fitness", "swimrun", "aquathlon", "aquabike", "rowing", "indoor-rowing", "orienteering", "adventure-racing", "obstacle-course-racing"]) {
  assert.equal(search.normalizeResultsSearch({ category }).category, category);
}
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
  assert.match(text.trim(), /^(select\s|with held as materialized)/i, "Public handlers must only issue SELECT statements");
  queryCount += 1;
  return (await db.query(text, values)).rows;
};
const createServerFn = ({ method }) => {
  assert.equal(method, "GET");
  return { validator: (validate) => ({ handler: (run) => ({ data } = {}) => run({ data: validate(data) }) }) };
};
const scope = { IS_RUNRECS_SITE: false };
const api = loadTypeScript("src/lib/athrecs/public-results-api.ts", {
  "./public-catalogue-content.ts": catalogueContent,
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
      profile_type text, profile_visibility text, parent_athlete_id integer, profile_details jsonb default '{}');
    create table results (id integer primary key, athlete_id integer, edition_id integer,
      status text, result_details jsonb default '{}', result_visibility text,
      source_url text, result_source text,
      overall_place integer, gender_place integer, category_place integer, category text,
      finish_time_seconds integer, chip_time_seconds integer, gun_time_seconds integer);
    create table athlete_account_links (user_id text, athlete_id integer, status text);
    create table athlete_public_shares (user_id text, enabled boolean, share_results boolean);
    create table athlete_profile_hidden_results (user_id text, result_id integer);
    insert into events (id, name, sport, city, country) values (10, 'Synthetic 10K', 'Running', 'Example town', 'United Kingdom'),
      (11, 'Future race', 'Running', 'Example town', 'United Kingdom');
    insert into editions values (10, 10, '2026-09-20', '10K'), (11, 11, '2027-01-01', '10K');
    insert into clubs values (1, 'Synthetic Club');
    insert into athletes(id,display_name,slug,club_id,profile_type,profile_visibility) values
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
    update results set source_url = 'https://totalracetiming.co.uk/raceresults/123', result_source = 'Total Race Timing' where id = 1;
    update results set result_details = '{"verificationStatus":"source_verified","sourceNationality":"KEN"}' where id = 1;
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
  assert.equal(detail.results[0].source_url, "https://totalracetiming.co.uk/raceresults/123");
  assert.equal(detail.results[0].result_source, "Total Race Timing");
  assert.equal(detail.results[0].gun_time_seconds, 1901);
  assert.equal(detail.results[0].nationality, "KEN", "Use the explicitly recorded result nationality, not the UK event location");
  assert.equal(detail.results[1].nationality, null, "Absent nationality must stay unknown");
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

  // Source nationality must not override claimed-profile controls or expose raw evidence.
  await db.exec("insert into athlete_account_links values ('u1', 1, 'active')");
  assert.equal((await api.getPublicRaceResults({ data: { editionId: 10 } })).results[0].nationality, null);
  await db.exec("delete from athlete_account_links where user_id = 'u1'");
  for (const sourceNationality of [null, {}, 42, "", "unknown", "N/A", "?", "x".repeat(101)]) {
    await db.query("update results set result_details = $1 where id = 1", [JSON.stringify({ verificationStatus: "source_verified", sourceNationality })]);
    assert.equal((await api.getPublicRaceResults({ data: { editionId: 10 } })).results[0].nationality, null);
  }
  await db.query("update results set result_details = $1 where id = 1", [JSON.stringify({ sourceNationality: "RUS" })]);
  assert.equal((await api.getPublicRaceResults({ data: { editionId: 10 } })).results[0].nationality, null, "Unverified source rows are not published as nationality evidence");
  await db.query("update results set result_details = $1 where id = 1", [JSON.stringify({ verificationStatus: "source_verified", sourceNationality: "KEN", privateEvidence: "staff-only" })]);
  assert(!JSON.stringify(await api.getPublicRaceResults({ data: { editionId: 10 } })).includes("staff-only"));

  // Exact source marks are display values; private provenance stays in storage.
  for (const reportedPerformance of ["17:04.9", "9.71m", "2903", "SCR"]) {
    await db.query("update results set result_details = $1 where id = 1", [JSON.stringify({
      verificationStatus: "unverified", reportedPerformance, reportedPlace: "2",
      archiveReference: { sourceRow: "private-locator" },
    })]);
    const source = (await api.getPublicRaceResults({ data: { editionId: 10 } })).results[0];
    assert.equal(source.reported_performance, reportedPerformance);
    assert.equal(source.reported_place, "2");
    assert.equal(source.verification_status, "unverified");
    assert(!JSON.stringify(source).includes("private-locator"));
  }

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
      (34, 'Velodrome Meet', 'Cycling', 'Velodrome'),
      (35, 'Synthetic parkrun', 'Parkrun', 'Road'),
      (36, 'Field Meeting', 'Athletics', 'Field'),
      (37, 'Fell Athletics', 'Athletics', 'Fell'),
      (38, 'XC Athletics', 'Athletics', 'XC'),
      (39, 'Mixed Athletics', 'Athletics', 'Mixed'),
      (40, 'Park Mixed Athletics', 'Athletics', 'Park / mixed');
    insert into editions select id, id, '2026-09-01', 'Other' from events where id >= 20;
    insert into results (id, athlete_id, edition_id, status, result_visibility)
      select id, 1, id, 'Finished', 'public' from editions where id >= 20;
  `);
  const namesFor = async (category) => (await api.listPublicResultEditions({ data: { category } })).editions.map(row => row.event_name).sort();
  assert.deepEqual(await namesFor("trail-running"), ["Trail Athletics", "Trail Run"]);
  assert.deepEqual(await namesFor("track-and-field"), ["Track Meeting", "Track Run"]);
  assert.deepEqual(await namesFor("road-running"), ["Athletics Road", "Synthetic 10K"]);
  assert.deepEqual(await namesFor("road-cycling"), ["Road Cycling"]);
  assert.deepEqual(await namesFor("mountain-biking"), ["MTB Gravel Programme", "MTB Race"]);
  assert.deepEqual(await namesFor("track-cycling"), ["Track Cycling", "Velodrome Meet"]);
  assert.deepEqual(await namesFor("bmx"), ["BMX Race"]);
  await db.exec(`
    insert into events (id, name, sport, surface)
      select n, 'Recent Cycling ' || n, 'Cycling', 'Road' from generate_series(200, 229) n;
    insert into editions select n, n, '2026-09-22', 'Other' from generate_series(200, 229) n;
    insert into results (id, athlete_id, edition_id, status, result_visibility)
      select n, 1, n, 'Finished', 'public' from generate_series(200, 229) n;
  `);
  const broadBefore = await snapshot();
  const allRunning = await api.listPublicResultEditions({ data: { category: "all-running" } });
  assert.deepEqual(allRunning.editions.map((row) => row.event_name).sort(), [
    "Athletics Road", "Cross Country", "Fell Athletics", "Mixed Athletics", "Park Mixed Athletics",
    "Synthetic 10K", "Track Run", "Trail Athletics", "Trail Run", "XC Athletics",
  ], "All running matches homepage scope, excluding Parkrun and Athletics track/field before pagination");
  assert.equal(allRunning.hasMore, false, "More recent excluded sports must not consume the result limit");
  assert.equal(allRunning.editions.find((row) => row.edition_id === 10).result_count, 3, "Broad scope keeps result/profile privacy and owner opt-outs");
  assert.deepEqual(await namesFor("running"), ["Athletics Road", "Synthetic 10K"]);
  assert.deepEqual((await api.listPublicResultEditions({ data: { sport: "Running" } })).editions.map((row) => row.event_name).sort(), ["Synthetic 10K", "Track Run", "Trail Run"], "Explicit sport=Running is not broadened");
  assert.equal(await snapshot(), broadBefore, "New category only reads existing public results");
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

  const head1 = publicResultsHead(resultPage1.edition, resultPage1.results, { q: "", page: 1 });
  const head2 = publicResultsHead(resultPage2.edition, resultPage2.results, { q: "", page: 2 });
  assert.equal(head2.links[0].href, head1.links[0].href + "?page=2", "Later result pages must have their own canonical URL");
  assert.match(head2.meta.find((meta) => meta.name === "robots").content, /^index, follow/);
  const structured1 = JSON.parse(head1.scripts[0].children);
  const structured2 = JSON.parse(head2.scripts[0].children);
  assert.equal(structured2["@type"], "CollectionPage");
  assert.equal(structured2.mainEntity.numberOfItems, 8, "Describe exactly the rendered public page");
  assert.deepEqual(structured2.mainEntity.itemListElement.map((row) => row.item.name), resultPage2.results.map((row) => row.athlete_name));
  assert.equal(structured1.about["@type"], "Thing");
  assert.match(structured1.about.description, /2026-09-20/);
  assert.doesNotMatch(JSON.stringify([structured1, structured2]), /"@type":"(?:SportsEvent|Event)"/,
    "Results archives must not advertise attendance/ticket Event rich results");
  assert.match(structured1.description, /coverage may be partial/);
  assert.match(structured1.mainEntity.itemListElement[0].description, /source position 7/);
  assert.match(structured1.mainEntity.itemListElement[0].description, /chip time 31:31; gun time 31:41/);
  assert.equal(structured2.mainEntity.itemListElement.at(-1).description, "Disqualified", "Do not publish a DQ time as a finish in structured data");
  assert(structured2.mainEntity.itemListElement.every((row) => !('position' in row)), "Page order must not be presented as official placing");
  assert.doesNotMatch(JSON.stringify([structured1, structured2]), /Private Athlete|Hidden Result|Disabled Profile|No Results Share|Private Performance|raceresults\/123/);
  const filtered = publicResultsHead(resultPage2.edition, resultPage2.results, { q: "Alex", page: 2 });
  assert.equal(filtered.meta.find((meta) => meta.name === "robots").content, "noindex, follow");
  assert.equal(filtered.links[0].href, head1.links[0].href);
  assert.deepEqual(filtered.scripts, []);
  const injection = publicResultsHead(resultPage1.edition, [{ ...resultPage1.results[0], athlete_name: "</script><script>alert(1)</script>" }], { q: "", page: 1 });
  assert(!injection.scripts[0].children.includes("<"), "Escape user text before embedding JSON-LD");
  assert.equal(JSON.parse(injection.scripts[0].children).mainEntity.itemListElement[0].item.name, "</script><script>alert(1)</script>");

  // Exercise the real route loader and head contract, including empty-page handling.
  const route = loadTypeScript("src/routes/results/$editionId.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "@/lib/athrecs/parkrun-timing": parkrun,
    "@tanstack/react-router": { Link: ({children,to}) => createElement("a",{href:to},children), createFileRoute: () => (options) => options, notFound: () => new Error("notFound"), redirect: (options) => Object.assign(new Error("redirect"), options) },
    "lucide-react": { ArrowLeft: () => null, SearchCheck: () => null }, "@/components/ui/badge": {}, "@/components/ui/button": { Button: ({children}) => createElement("button",null,children) },
    "@/components/athletes/CountryFlag": { CountryFlag: () => null },
    "@/components/races/EventBadges": { SportBadge: () => null, DistanceBadge: () => null },
    "@/lib/athrecs/public-results-api": api,
    "@/lib/athrecs/public-results-search": search,
    "@/lib/athrecs/format": format,
    "@/lib/athrecs/public-results-seo": { publicResultsHead },
    "@/lib/athrecs/result-slug": loadTypeScript("src/lib/athrecs/result-slug.ts"),
    "@/lib/site-scope": scope,
    "@/lib/athrecs/result-credit": { resultCredit },
  }).Route;
  route.useSearch = () => ({});
  route.useLoaderData = () => resultPage1;
  const roadTable = load(renderToStaticMarkup(route.component()));
  assert(roadTable("th").toArray().some((cell) => roadTable(cell).text() === "Chip"));
  const parkrunEdition = { ...resultPage1.edition, sport: "Parkrun", event_name: "Synthetic parkrun", distance_code: "5K" };
  route.useLoaderData = () => ({ ...resultPage1, edition: parkrunEdition });
  const parkrunTable = load(renderToStaticMarkup(route.component()));
  const labels = parkrunTable("th").toArray().map((cell) => parkrunTable(cell).text());
  assert(labels.includes("Finish time"));
  assert(!labels.includes("Chip") && !labels.includes("Gun"));
  assert(parkrunTable.text().includes("parkrun does not use chip timing"));
  assert.equal(parkrunTable("tbody tr").first().find("td").length, labels.length);
  const parkrunHead = publicResultsHead(parkrunEdition, resultPage1.results, { q: "", page: 1 });
  const parkrunDetails = JSON.parse(parkrunHead.scripts[0].children).mainEntity.itemListElement[0].description;
  assert(parkrunDetails.includes(parkrun.PARKRUN_TIMING_LABEL));
  assert.doesNotMatch(parkrunDetails, /chip time [0-9]|gun time [0-9]/);
  const params = { editionId: "synthetic-10k-2026-09-20-10k-10" };
  // Bookmarked numeric URLs and older race names retain filters and pagination
  // while redirecting directly to the same current public edition.
  for (const oldSlug of ["10", "old-race-name-10"]) {
    await assert.rejects(
      route.loader({ params: { editionId: oldSlug }, deps: search.normalizeResultsSearch({ q: "Alex", page: 2 }) }),
      (error) => {
        assert.equal(error.statusCode, 301);
        assert.equal(error.to, "/results/$editionId");
        assert.deepEqual(error.params, params);
        assert.deepEqual(error.search, { q: "Alex", page: 2 });
        return true;
      },
    );
  }
  await assert.rejects(route.loader({ params: { editionId: "unpublished-race-11" }, deps: search.normalizeResultsSearch({}) }), /notFound/);
  const loaded = await route.loader({ params, deps: search.normalizeResultsSearch({ page: 2 }) });
  assert.equal(route.head({ loaderData: loaded, match: { search: { page: 2 } } }).links[0].href, head2.links[0].href);
  await assert.rejects(route.loader({ params, deps: search.normalizeResultsSearch({ page: 3 }) }), /notFound/);
  assert.equal((await route.loader({ params, deps: search.normalizeResultsSearch({ q: "no-match" }) })).results.length, 0);

  // Explicit results-only holds keep already-public performances available,
  // without inventing a profile or exposing accounts, private histories or evidence.
  await db.exec(`
    create table athlete_source_histories (athlete_id integer, provider text, external_id text,
      source_url text, performances jsonb, published_at timestamptz);
    insert into athletes(id,display_name,slug,profile_type,profile_visibility,profile_details) values
      (900001,'Jo? Example','damaged-name','Athlete','private','{"nameReview":{"mode":"results_only","candidateIds":[987]}}'),
      (900002,'Owned? Example','owned-name','Athlete','private','{"nameReview":{"mode":"results_only"}}');
    insert into athlete_account_links values ('owner',900002,'active');
    insert into results(id,athlete_id,edition_id,status,result_visibility,finish_time_seconds) values
      (900001,900001,10,'finished','public',2222),
      (900002,900002,10,'finished','public',2223),
      (900003,900001,10,'finished','private',2224),
      (900004,900001,11,'finished','public',2225);
    insert into athlete_source_histories values
      (900001,'Example Timer','source-1','https://example.test/results',
       '[{"year":2025,"meeting":"Year-only marathon","discipline":"Marathon","performance":"3:11:22","notes":"PRIVATE EVIDENCE","archiveReference":{"private":"SECRET"}},
         {"year":2025,"meeting":"Excluded","profileExcluded":true},
         {"year":2027,"meeting":"Future"}]',now()),
      (900001,'Example Timer','source-2','https://example.test/results','[{"year":2025,"meeting":"Private history"}]',null),
      (900002,'Example Timer','source-3','https://example.test/results','[{"year":2025,"meeting":"Owned history"}]',now());
  `);
  const heldResult = (await api.getPublicRaceResults({ data: {editionId:10,q:'Jo?'} })).results;
  assert.equal(heldResult.length,1);
  assert.equal(heldResult[0].athlete_slug,null);
  const heldHead=publicResultsHead(resultPage1.edition,heldResult,{q:'',page:1});
  assert.doesNotMatch(heldHead.scripts[0].children,/\/athletes\/null|"@type":"Person"/);
  const unlinked=loadTypeScript('src/lib/athrecs/unlinked-results-api.ts',{
    '@tanstack/react-start':{createServerFn},'@/lib/db':{getSql:async()=>sql},
    '@/lib/site-scope':scope,'./seed.server':{ensureAthrecsSeeded:async()=>{}},
    './format':{todayIso:()=> '2026-09-23'},'./public-results-search':search,
  });
  const heldPage=await unlinked.listUnlinkedResults({data:{}});
  assert.equal(heldPage.results.length,2);
  assert.equal(heldPage.results.find(row=>row.meeting==='Year-only marathon').date,'');
  assert.equal((await unlinked.listUnlinkedResults({data:{year:'2025'}})).results.length,1);
  assert.equal((await unlinked.listUnlinkedResults({data:{q:'no-match'}})).results.length,0);
  assert.doesNotMatch(JSON.stringify(heldPage),/PRIVATE|SECRET|candidateIds|Owned|Excluded|Future|Private history|damaged-name/);
  await db.exec("update results set source_url='https://runabc.co.uk/synthetic',result_source='runABC' where id=900001");
  const withheldProvider = (await api.getPublicRaceResults({ data: { editionId: 10, q: 'Jo?' } })).results;
  assert.equal(withheldProvider.length, 1, 'Source suppression must retain the published performance');
  assert.doesNotMatch(JSON.stringify(withheldProvider), /runabc/i);
  assert.equal((await db.query('select result_source from results where id=900001')).rows[0].result_source, 'runABC', 'Stored evidence must be unchanged');

  await db.exec("update athletes set profile_details='{}' where id=900001");
  assert.equal((await unlinked.listUnlinkedResults({data:{}})).results.length,0,'Resolving a hold removes results-only projection');

  scope.IS_RUNRECS_SITE = true;
  const previousQueryCount = queryCount;
  assert.equal((await api.listPublicResultEditions({ data: {} })).editions.length, 0);
  assert.equal(await api.getPublicRaceResults({ data: { editionId: 10 } }), null);
  assert.equal((await unlinked.listUnlinkedResults({data:{}})).results.length,0);
  assert.equal(queryCount, previousQueryCount, "RunRecs must not query the AthRecs archive");

  const pageSource = readFileSync("src/routes/results/$editionId.tsx", "utf8");
  assert.match(pageSource, /to="\/claim-results" search=\{\{ resultId: result.id \}\}/);
  assert.match(pageSource, /slug: result.athlete_slug/);
  assert.doesNotMatch(pageSource, /submitResultClaim|applyResultsImport|applyImportBundle/);
  console.log("PASS: all-running category scope, legacy category/sport compatibility, public results privacy, page-specific canonicals, indexable pagination, filtered/empty pages, qualified structured data, script escaping, recorded placings, distinct chip/gun times and RunRecs isolation.");
} finally {
  await db.close();
}
