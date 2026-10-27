import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Execute both actual catalogue queries against an isolated database. This catches
// a duplicate resurfacing as an undated recommendation after its dates are hidden.
const source = await readFile("src/lib/athrecs/api.ts", "utf8");
const listStart = source.indexOf("with scoped_editions as not materialized");
const listSql = source.slice(listStart, source.indexOf("`;", listStart));
const relatedStart = source.indexOf("    const relatedRows = await sql<");
const relatedTemplate = source.indexOf(">`", relatedStart) + 2;
const relatedSql = source.slice(relatedTemplate, source.indexOf("`;", relatedTemplate));
const pg = new PGlite();
try {
  await pg.exec(`
    create table events(id int primary key,slug text,name text,sport text,country text,county text,region text,city text,area text,surface text,summary text,organiser text,website text);
    create table editions(id int primary key,event_id int,event_date date,distance_code text,distance_km double precision,status text,start_time text);
    create table event_distances(event_id int,distance_code text);
    create table event_groups(event_id int,group_code text,label text,level text,source_url text,checked_at date,note text);
  `);
  for (const [id, slug] of [
    [1, "canonical"],
    [2, "duplicate-only"],
    [3, "other-date"],
    [4, "genuinely-undated"],
    [5, "valid-history"],
  ]) {
    await pg.query(
      "insert into events(id,slug,name,sport,country,city) values($1,$2,$2,'Running','England','Test town')",
      [id, slug],
    );
  }
  for (const [id, eventId, date] of [
    [11, 1, "2026-11-01"],
    [21, 2, "2026-11-01"],
    [31, 3, "2026-11-01"],
    [32, 3, "2027-11-01"],
    [51, 5, "2025-11-01"],
  ]) {
    await pg.query("insert into editions values($1,$2,$3,'10K',10,'Open','09:00')", [
      id,
      eventId,
      date,
    ]);
  }
  const before = (await pg.query("select * from editions order by id")).rows;
  const sql = async (strings, ...values) => {
    const query = strings.reduce((text, part, i) => text + (i ? `$${i}` : "") + part, "");
    return (await pg.query(query, values)).rows;
  };
  const bindings = {
    sql,
    event: { id: 1, sport: "Running", city: "Test town", country: "England" },
    today: "2026-10-26",
    heldDistanceIds: [],
    excludedEditionIds: [],
    retainedFixtureAliasSlugs: [],
    withheldFixtureDateKeys: ["duplicate-only|2026-11-01", "other-date|2026-11-01"],
    shortRaces: false,
    dateFrom: null,
    dateTo: null,
    distance: null,
    sport: null,
    q: null,
    surface: null,
    group: null,
    country: null,
    county: null,
    city: null,
    postcode: null,
    upcomingOnly: false,
    fetchLimit: 80,
    offset: 0,
  };
  for (const [name, query] of [
    ["list", listSql],
    ["related", relatedSql],
  ]) {
    assert.ok(query.includes("select"), "Extract the actual query");
    const read = Function(...Object.keys(bindings), "return sql`" + query + "`");
    const rows = await read(...Object.values(bindings));
    const slugs = rows.map((r) => r.slug);
    assert.equal(
      slugs.includes("duplicate-only"),
      false,
      `${name}: withheld-only event must not become a Date TBC card`,
    );
    for (const slug of ["other-date", "genuinely-undated", "valid-history"])
      assert.ok(slugs.includes(slug), `${name}: preserve ${slug}`);
    assert.equal(rows.find((r) => r.slug === "other-date").next_date, "2027-11-01");
  }
  assert.deepEqual((await pg.query("select * from editions order by id")).rows, before);
  console.log(
    "Event cards passed: both real queries exclude withheld-only duplicates and preserve other dates, genuinely undated events, valid history and original rows.",
  );
} finally {
  await pg.close();
}
