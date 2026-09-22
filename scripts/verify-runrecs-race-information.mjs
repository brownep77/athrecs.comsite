// Run the production listing query against disposable Postgres (PGLite).
// No deployed database, race catalogue or external entry provider is modified.
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { rolldown } from "rolldown";

async function moduleFrom(path) {
  const bundle = await rolldown({ input: path });
  const { output } = await bundle.generate({ format: "esm" });
  await bundle.close();
  return import(`data:text/javascript;base64,${Buffer.from(output[0].code).toString("base64")}`);
}

const { editionEntry, entryDeadlinePassed, raceLink, raceLocation } = await moduleFrom(
  "src/lib/athrecs/race-information.ts",
);
const { supplementedStart } = await moduleFrom("src/data/runrecs-race-guides.ts");
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
assert.equal(entryDeadlinePassed(today), false, "Date-only deadlines include their closing day");
assert.equal(entryDeadlinePassed("2000-01-01"), true);
assert.equal(raceLink("javascript:alert(1)"), null);
assert.equal(raceLink("https://user:password@example.com"), null);
assert.equal(raceLocation(["Norwich", "Norwich", "Norfolk", "TBC"]), "Norwich · Norfolk");
const option = {
  entry_url: "https://example.com/entry",
  status: "open",
  entry_type: "official",
  is_verified: true,
  is_primary: true,
  closes_at: today,
};
const edition = {
  event_date: "2099-10-01",
  status: "Open",
  entry_url: option.entry_url,
  entry_options: [option],
};
assert.equal(editionEntry(edition)?.label, "Official entry");
assert.equal(
  editionEntry({ ...edition, entry_options: [{ ...option, status: "waitlist" }] })?.label,
  "Waiting list",
);
assert.equal(
  editionEntry({ ...edition, entry_options: [{ ...option, status: "sold_out" }] }),
  null,
);
assert.equal(editionEntry({ ...edition, status: "Closed" }), null);
assert.equal(editionEntry({ ...edition, event_date: "2000-01-01" }), null);
assert.equal(
  editionEntry({ ...edition, entry_options: [{ ...option, closes_at: "2000-01-01" }] }),
  null,
);
assert.equal(editionEntry({ ...edition, entry_options: [] })?.label, "Entry details");
const bure = { slug: "bure-valley-10-miles" };
assert.equal(supplementedStart(bure, "2026-09-27", "10mi", null), "09:30");
assert.equal(
  supplementedStart(bure, "2027-09-27", "10mi", null),
  null,
  "Facts never leak into another year",
);
assert.equal(
  supplementedStart(bure, "2026-09-27", "5K", null),
  null,
  "Facts never leak into another distance",
);
assert.equal(
  supplementedStart(bure, "2026-09-27", "10mi", "10:00"),
  "10:00",
  "Stored conflicts remain reviewable",
);

const db = new PGlite();
try {
  for (const file of (await readdir("migrations")).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  // The existing seed bootstrap also owns schema additions used by the listing.
  const seed = await readFile("src/lib/athrecs/seed.server.ts", "utf8");
  const schema = seed.match(
    /async function ensureSchema[\s\S]*?const statements = \[([\s\S]*?)\n {2}\];/,
  )?.[1];
  assert(schema, "Production seed schema must be present");
  for (const statement of schema.matchAll(/`([^`]+)`/g)) await db.exec(statement[1]);
  await db.exec(`
    insert into events (id, slug, name, sport, county, city) values
      (900001, 'fixture-running', 'Race Information Fixture', 'Running', 'Norfolk', 'Norwich'),
      (900002, 'fixture-swimming', 'Swim Information Fixture', 'Swimming', 'Norfolk', 'Norwich');
    insert into event_distances (event_id, distance_code) values (900001, '5K'), (900001, '10K'), (900002, '5K');
    insert into editions (id, event_id, event_date, distance_code, distance_km, start_time, status) values
      (900001, 900001, '2099-10-01', '5K', 5, '09:00', 'Open'),
      (900002, 900001, '2099-10-01', '10K', 10, '10:30', 'Open'),
      (900003, 900001, '2099-11-01', '5K', 5, null, 'Open'),
      (900004, 900002, '2099-10-01', '5K', 5, '08:00', 'Open');
    insert into edition_entry_options (edition_id, provider_code, provider_name, entry_url, entry_type, status, is_verified, is_primary) values
      (900001, 'fixture', 'Fixture entry', 'https://example.com/5k', 'official', 'open', true, true),
      (900002, 'fixture', 'Fixture entry', 'https://example.com/10k', 'official', 'open', true, true);
  `);
  const source = await readFile("src/runrecs/api.ts", "utf8");
  const query = source.match(/const rows = await sql<RawEventRow>`([\s\S]*?)`;/)?.[1];
  assert(query, "Production listing query must be exercised");
  const defaults = {
    today,
    requestedSport: null,
    q: null,
    surface: null,
    group: null,
    country: null,
    county: null,
    city: null,
    postcode: null,
    distance: null,
    dateFrom: null,
    dateTo: null,
    upcomingOnly: true,
    fetchLimit: 100,
    offset: 0,
  };
  const sql = async (parts, ...params) => {
    const text = parts.reduce((text, part, index) => text + (index ? `$${index}` : "") + part, "");
    return (await db.query(text, params)).rows;
  };
  const runQuery = new Function("sql", ...Object.keys(defaults), `return sql\`${query}\`;`);
  const list = (filters = {}) => runQuery(sql, ...Object.values({ ...defaults, ...filters }));
  const [race] = await list();
  assert.equal((await list()).length, 1, "RunRecs excludes other sports");
  assert.equal(race.next_start_time, "09:00");
  assert.equal(race.next_entry_url, "https://example.com/5k");
  assert.deepEqual(JSON.parse(race.next_starts_json), [
    { distance: "5K", time: "09:00" },
    { distance: "10K", time: "10:30" },
  ]);
  const [tenK] = await list({ distance: "10K" });
  assert.equal(tenK.next_start_time, "10:30");
  assert.equal(
    tenK.next_entry_url,
    "https://example.com/10k",
    "Entry link must belong to the displayed distance",
  );
  const [november] = await list({ dateFrom: "2099-11-01", dateTo: "2099-11-30" });
  assert.equal(november.next_date, "2099-11-01");
  assert.equal(november.next_start_time, null, "Unknown time stays unknown");
  assert.equal(november.next_entry_url, null, "Do not borrow another edition's entry link");
  assert.equal(
    (await list({ distance: "10K", dateFrom: "2099-11-01", dateTo: "2099-11-30" })).length,
    0,
  );
  await db.query("update edition_entry_options set closes_at = $1 where edition_id = 900001", [
    today,
  ]);
  assert.equal((await list())[0].next_entry_url, "https://example.com/5k");
  await db.exec("update edition_entry_options set status = 'sold_out' where edition_id = 900001");
  assert.equal((await list())[0].next_entry_url, null, "Sold-out entries cannot appear open");
  console.log(
    "RunRecs race information: query alignment, entry availability, safe links and source matching passed.",
  );
} finally {
  await db.close();
}
