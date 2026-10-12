// Execute the actual register queries against PostgreSQL-compatible synthetic
// data. Never opens the application's DATABASE_URL or seeds production records.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { PGlite } from "@electric-sql/pglite";
import { z } from "zod";
const require = createRequire(import.meta.url),
  ts = require("typescript");
function load(path, deps = {}) {
  const m = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(
    (name) => {
      if (!(name in deps)) throw Error(`Unexpected dependency ${name}`);
      return deps[name];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const db = new PGlite({ parsers: { 20: Number, 1082: (v) => v } });
function sqlFor(connection) {
  const query = async (q, p = []) => (await connection.query(q, p)).rows;
  const sql = async (parts, ...values) =>
    query(
      parts.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
      values,
    );
  sql.query = query;
  sql.transaction = (work) => db.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db),
  core = load("src/lib/event-register/core.ts", { zod: { z } });
const service = load("src/lib/event-register/service.server.ts", {
  "../db": {
    getSql: () => {
      throw Error("Application database must not be used");
    },
  },
  "../../data/fixture-deduplication": { retainedFixtureAliasSlugs: ["synthetic-alias"] },
  "./core": core,
});
const actor = "synthetic-register-staff";
try {
  await db.waitReady;
  console.log("Applying synthetic database migrations");
  for (const name of readdirSync("migrations")
    .filter((n) => n.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync(`migrations/${name}`, "utf8"));
  console.log("Adding synthetic catalogue");
  await sql`insert into "user"(id,name,email,"emailVerified") values(${actor},'Synthetic Staff','staff@example.test',true)`;
  async function event(slug, sport, surface = "Road", country = "England") {
    return (
      await sql`insert into events(slug,name,sport,country,county,surface,organiser,website)
      values(${slug},${slug},${sport},${country},'Norfolk',${surface},'Synthetic Organiser','https://example.test') returning id`
    )[0].id;
  }
  async function edition(id, date, distance) {
    return (
      await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${id},${date},${distance},5,'Finished') returning id`
    )[0].id;
  }
  const road = await event("synthetic-road", "Running"),
    park = await event("synthetic-parkrun", "Parkrun", "Mixed");
  const track = await event("synthetic-track", "Athletics", "Track"),
    field = await event("synthetic-field", "Athletics", "Track");
  const cycle = await event("synthetic-cycle", "Cycling"),
    tri = await event("synthetic-tri", "Triathlon");
  const empty = await event("synthetic-empty", "Running"),
    alias = await event("synthetic-alias", "Running");
  const road2025 = await edition(road, "2025-10-12", "5K");
  await edition(road, "2026-10-12", "5K");
  await edition(road, "2026-10-12", "10K");
  await edition(park, "2026-10-03", "5K");
  await edition(park, "2026-10-10", "5K");
  const trackRace = await edition(track, "2026-10-01", "1500m");
  await edition(track, "2026-10-01", "Track & Field");
  await edition(track, "2026-10-01", "20km walk");
  await edition(field, "2026-10-01", "Shot Put");
  await edition(cycle, "2026-10-01", "5K");
  await edition(tri, "2026-10-01", "5K");
  await edition(alias, "2026-10-01", "5K");
  const [athlete] =
    await sql`insert into athletes(slug,display_name) values('synthetic-register-person','Synthetic Runner') returning id`;
  await sql`insert into results(edition_id,athlete_id,chip_time_seconds,gun_time_seconds,finish_time_seconds) values(${road2025},${athlete.id},1200,1203,1200)`;
  await sql`insert into results(edition_id,athlete_id,finish_time_seconds) values(${trackRace},${athlete.id},300)`;
  const dataset = "a53d9df6-8d50-407d-a862-6a71b54356a6";
  await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note,expected_rows) values(${dataset},${road2025},'Synthetic Timing','synthetic','https://example.test/results','Synthetic testing permission',2)`;
  await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash) values(${dataset},'one','{}',${"a".repeat(64)})`;
  await db.exec("ANALYZE");
  console.log("Testing catalogue queries");
  let all = await service.listRegister({}, sql);
  assert.equal(
    all.summary.events,
    4,
    "Only running events, including parkrun and identifiable track running; no aliases",
  );
  assert.equal(
    all.summary.editions,
    6,
    "Same-year weekly runs and festival distances remain distinct; mixed athletics excluded",
  );
  assert.equal(all.summary.parkruns, 1);
  assert.ok(
    all.facets.countries.includes("United Kingdom"),
    "UK aggregate is selectable even when the catalogue only has home-nation labels",
  );
  assert.equal(all.summary.result_editions, 2);
  assert.equal(all.summary.archive_editions, 1);
  assert.equal(
    all.rows.find((r) => r.id === road).first_year,
    null,
    "Earliest stored year is not an inferred first-ever year",
  );
  assert.equal(
    all.rows.find((r) => r.id === road).final_year,
    null,
    "Latest stored year is not an inferred final year",
  );
  assert.equal(
    all.rows.find((r) => r.id === road).contact_count,
    0,
    "Website alone is not a direct contact",
  );
  assert.equal(
    all.rows.find((r) => r.id === road).publications,
    null,
    "Catalogue existence is not a publication receipt",
  );
  const subset = await service.listRegister({ year: 2025 }, sql);
  assert.equal(subset.summary.events, 1);
  assert.equal(subset.summary.editions, 1);
  assert.equal((await service.listRegister({ gap: "no-editions" }, sql)).rows[0].id, empty);
  assert.equal(
    (await service.listRegister({ q: "%", gap: "all" }, sql)).summary.events,
    0,
    "Search wildcard treated literally",
  );
  let detail = await service.getRegisterEvent({ eventId: road }, sql);
  assert.equal(detail.editions.find((e) => e.id === road2025).datasets[0].stored_rows, 1);
  assert.equal(detail.editions.find((e) => e.id === road2025).datasets[0].expected_rows, 2);
  const timing = (await service.getRegisterEvent({ eventId: track }, sql)).editions[0];
  assert.equal(timing.unspecified_times, 1);
  assert.equal(timing.chip_times, 0);
  assert.equal(timing.gun_times, 0);
  await assert.rejects(() => service.getRegisterEvent({ eventId: cycle }, sql), /outside/);
  const history = {
    eventId: road,
    expectedRevision: 0,
    firstYear: 1990,
    firstDate: null,
    finalYear: null,
    finalDate: null,
    lifecycle: "active",
    sourceUrl: "https://example.test/history",
    checkedOn: "2026-10-12",
    note: "Synthetic official first-year evidence",
    priority: "high",
    nextCheck: "2026-11-01",
  };
  await assert.rejects(
    () => service.saveHistory({ ...history, sourceUrl: "" }, actor, sql),
    /source/,
  );
  await assert.rejects(
    () => service.saveHistory({ ...history, finalYear: 1989, lifecycle: "ended" }, actor, sql),
    /precede/,
  );
  await assert.rejects(
    () => service.saveHistory({ ...history, finalYear: 2020 }, actor, sql),
    /ended/,
  );
  await assert.rejects(
    () => service.saveHistory({ ...history, firstDate: "1991-01-01" }, actor, sql),
    /agree/,
  );
  await assert.rejects(
    () => service.saveHistory({ ...history, eventId: tri }, actor, sql),
    /outside/,
  );
  console.log("Testing history observations");
  await service.saveHistory(history, actor, sql);
  await assert.rejects(() => service.saveHistory(history, actor, sql), /History changed/);
  detail = await service.getRegisterEvent({ eventId: road }, sql);
  await service.saveHistory(
    { ...history, expectedRevision: detail.history[0].id, finalYear: 2026, lifecycle: "ended" },
    actor,
    sql,
  );
  assert.equal(
    (await service.getRegisterEvent({ eventId: road }, sql)).history.length,
    2,
    "Previous history preserved",
  );
  const contact = {
    eventId: road,
    organiser: "Synthetic Organiser",
    contactName: "Race office",
    email: "race@example.test",
    phone: "",
    contactUrl: "",
    postalAddress: "",
    period: "historical",
    fromYear: 1990,
    toYear: 2000,
    sourceUrl: "https://example.test/archive",
    checkedOn: "2026-10-12",
    note: "Historical contact",
  };
  console.log("Testing contact observations");
  await service.saveContact(contact, actor, sql);
  await service.saveContact(
    { ...contact, period: "current", fromYear: 2026, toYear: null, email: "new@example.test" },
    actor,
    sql,
  );
  detail = await service.getRegisterEvent({ eventId: road }, sql);
  assert.equal(detail.contacts.length, 2);
  assert.equal(detail.contacts[1].email, "race@example.test");
  await assert.rejects(
    () => service.saveContact({ ...contact, eventId: cycle }, actor, sql),
    /outside/,
  );
  await assert.rejects(() =>
    service.saveContact({ ...contact, sourceUrl: "javascript:alert(1)" }, actor, sql),
  );
  await assert.rejects(() =>
    service.saveContact({ ...contact, checkedOn: "2026-02-30" }, actor, sql),
  );
  assert.equal(core.safeExternalUrl("javascript:alert(1)"), undefined);
  assert.match(core.csvCell('=HYPERLINK("bad")'), /^"'/);
  const api = readFileSync("src/lib/event-register/api.ts", "utf8");
  assert.equal((api.match(/createServerFn\(/g) || []).length, 4);
  assert.equal(
    (api.match(/middleware\(\[staffMiddleware\]\)/g) || []).length,
    4,
    "All reads and writes staff-only",
  );
  console.log("Testing UK fixture coverage and pagination");
  const ukIds = [road, park, track, empty];
  for (const country of ["United Kingdom", "Scotland", "Wales", "Northern Ireland", " UK ", "GB"]) {
    const id = await event(
      `synthetic-country-${country.trim().toLowerCase().replaceAll(" ", "-")}`,
      "Running",
      "Road",
      country,
    );
    ukIds.push(id);
    await edition(id, "2026-10-12", "5K");
  }
  for (const country of ["Ireland", "Jersey", "Guernsey", "Isle of Man"]) {
    await event(
      `synthetic-country-${country.toLowerCase().replaceAll(" ", "-")}`,
      "Running",
      "Road",
      country,
    );
  }
  for (const country of ["United Kingdom", " uk ", "Great Britain"]) {
    const uk = await service.listRegister({ country }, sql);
    assert.deepEqual(
      new Set(uk.rows.map((r) => r.id)),
      new Set(ukIds),
      "UK includes every home nation and UK-labelled fixtures, without aliases or neighbouring countries",
    );
    assert.equal(uk.summary.editions, 12);
    assert.equal(uk.summary.parkruns, 1);
  }
  assert.equal((await service.listRegister({ country: "England" }, sql)).summary.events, 4);
  assert.equal((await service.listRegister({ country: "Scotland" }, sql)).summary.events, 1);
  assert.equal((await service.listRegister({ country: "Ireland" }, sql)).summary.events, 1);
  assert.equal(
    (await service.listRegister({ country: "United Kingdom", sport: "Parkrun" }, sql)).rows[0].id,
    park,
  );
  const historicalUk = await service.listRegister({ country: "United Kingdom", year: 2025 }, sql);
  assert.equal(historicalUk.summary.events, 1);
  assert.equal(historicalUk.rows[0].id, road);
  for (let i = 0; i < 45; i++) ukIds.push(await event(`synthetic-page-${i}`, "Running"));
  const firstPage = await service.listRegister({ country: "United Kingdom" }, sql);
  const secondPage = await service.listRegister({ country: "United Kingdom", page: 1 }, sql);
  assert.equal(firstPage.rows.length, 50);
  assert.equal(secondPage.rows.length, 5);
  assert.equal(firstPage.summary.events, 55);
  assert.equal(secondPage.summary.events, 55);
  assert.deepEqual(
    new Set([...firstPage.rows, ...secondPage.rows].map((r) => r.id)),
    new Set(ukIds),
  );
  console.log(
    "Event register checks passed: scope, editions, UK/home-nation filters, pagination, coverage, history evidence, contact history, concurrent edits, safe exports and staff guards.",
  );
} catch (error) {
  console.error("Verification failed", error);
  throw error;
} finally {
  await db.close();
}
