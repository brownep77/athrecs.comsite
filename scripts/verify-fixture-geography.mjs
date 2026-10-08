import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { countryFlag, countryNames } from "../src/lib/athrecs/country-flags.ts";
import {
  resolveCountry,
  countryMatchesFilter,
  filterCountryName,
  isoToFlagEmoji,
} from "../src/lib/athrecs/countries.ts";
import { formatFixtureStart, fixtureTimeZone } from "../src/lib/athrecs/fixture-presentation.ts";
import { runabcSeries, runabcEditions } from "../src/data/runabc.ts";
import { venueDetails } from "../src/data/venue-details.ts";
import { FIXTURE_DETAILS } from "../src/data/fixture-details.ts";
import { readSportFixtures } from "../src/lib/athrecs/sport-fixtures.server.ts";
const corrections = JSON.parse(
  fs.readFileSync(
    new URL("../docs/fixture-geography/corrections-2026-10-08.json", import.meta.url),
  ),
);
const repair = fs.readFileSync(
  new URL("../docs/fixture-geography/repair-2026-10-08.sql", import.meta.url),
  "utf8",
);
for (const [iso, name] of Object.entries(countryNames))
  for (const value of [iso, iso.toLowerCase(), name, `  ${name.toUpperCase()}  `]) {
    assert.equal(countryFlag(value).code, iso, value);
    assert.equal(
      resolveCountry({ country: value, name: "Highlands Mountain Race", city: "Perth" }).iso,
      iso,
      value,
    );
    assert.ok(countryMatchesFilter(resolveCountry({ country: value }), name));
    assert.equal(
      isoToFlagEmoji(iso),
      String.fromCodePoint(...[...iso].map((c) => c.charCodeAt(0) + 127397)),
    );
  }
for (const [value, iso] of Object.entries({
  BRN: "BH",
  CRO: "HR",
  TAN: "TZ",
  TPE: "TW",
  SWE: "SE",
  MAC: "MO",
  PYF: "PF",
  Kosovo: "XK",
  "Antigua and Barbuda": "AG",
  Türkiye: "TR",
  "GB-SCT": "GB-SCT",
  "GB-WLS": "GB-WLS",
  "GB-ENG": "GB-ENG",
  "Northern Ireland": "GB",
}))
  assert.equal(countryFlag(value).code, iso);
for (const value of ["", null, "ZZ", "ZZZ", "Atlantis", "Unknown"]) {
  assert.equal(countryFlag(value).code, "");
  assert.equal(
    resolveCountry({ country: value, city: "Perth", name: "London Marathon" }).iso,
    "UN",
  );
}
for (const value of ["International", "EUR", "NAC", "UND", "World"]) {
  assert.equal(countryFlag(value).code, "");
  assert.equal(resolveCountry({ country: value }).iso, "WORLD");
}
assert.equal(isoToFlagEmoji("UN"), "🌐");
assert.equal(isoToFlagEmoji("ZZ"), "🌐");
assert.equal(filterCountryName(resolveCountry({ country: "United Kingdom" })), "United Kingdom");
assert.equal(countryMatchesFilter(resolveCountry({ country: "United Kingdom" }), "England"), false);
assert.equal(countryMatchesFilter(resolveCountry({ country: "Scotland" }), "United Kingdom"), true);
assert.equal(countryMatchesFilter(resolveCountry({ country: "England" }), "SCO"), false);
assert.equal(countryMatchesFilter(resolveCountry({ country: "SCO" }), "Scotland"), true);
for (const [city, country, iso] of [
  ["Perth", "Scotland", "GB"],
  ["Perth", "Australia", "AU"],
  ["Vancouver", "United States", "US"],
  ["Vancouver", "Canada", "CA"],
  ["Newport", "Wales", "GB"],
  ["Newport", "United States", "US"],
  ["Bishop Auckland", "England", "GB"],
  ["Vietnam Highlands", "Vietnam", "VN"],
])
  assert.equal(resolveCountry({ city, country }).iso, iso);
assert.equal(resolveCountry({ city: "Doha (QAT)" }).iso, "QA");
assert.equal(resolveCountry({ city: "Tasmania, AUS" }).iso, "AU");
assert.equal(resolveCountry({ name: "World Marathon", city: "Newport" }).iso, "UN");
assert.equal(fixtureTimeZone("SWE"), "Europe/Stockholm");
assert.equal(
  formatFixtureStart("10:00", "2026-10-10", fixtureTimeZone("Sweden")),
  "10:00 CEST (UTC+2)",
);
for (const c of corrections) {
  assert.equal(runabcSeries.find((e) => e.slug === c.slug).country, c.country, c.slug);
  if (venueDetails[c.slug])
    assert.equal(
      venueDetails[c.slug].nation,
      c.country === "England" ? "United Kingdom" : c.country,
    );
}
assert.ok(runabcSeries.filter((x) => x.county === "Wales").every((x) => x.country === "Wales"));
const g = runabcEditions.filter((x) => x.seriesSlug === "gothenburg-marathon");
assert.equal(g.length, 1);
assert.equal(g[0].date, "2026-10-10");
assert.equal(g[0].startTime, "10:00");
assert.equal(g[0].status, "Closed");
assert.equal(FIXTURE_DETAILS["gothenburg-marathon|2026-10-10"].timeZone, "Europe/Stockholm");
const db = new PGlite();
try {
  await db.exec(`create table events(id integer primary key,slug text unique,name text,sport text,country text,county text,city text,area text,summary text,description text,organiser text,website text,source_url text,surface text,updated_at timestamptz);
 create table editions(id integer primary key,event_id integer,event_date date,distance_code text,start_time text,status text,entry_url text,source_url text,notes text,unique(event_id,event_date,distance_code));create table app_meta(key text primary key,value text not null);`);
  for (const [i, c] of corrections.entries()) {
    // Synthetic IDs; preserve non-geography values to detect accidental broad writes.
    const oldCounty =
      c.beforeCountry === "Scotland"
        ? "Scotland"
        : c.slug.includes("isle-of-man") || c.slug === "western-10-road-run"
          ? "North of England"
          : "South of England";
    await db.query(
      "insert into events values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now())",
      [
        i + 1,
        c.slug,
        c.slug,
        "Running",
        c.beforeCountry,
        oldCounty,
        "Test city",
        "Test area",
        "Listed on runABC (Scotland).",
        "Existing description",
        "Original organiser",
        `https://runabc.co.uk/${c.slug}`,
        null,
        "Road",
      ],
    );
  }
  // Read exact old county from the SQL values so the repair scope is exercised accurately.
  for (const m of repair.matchAll(/\('([^']+)','([^']*)','([^']*)','/g))
    await db.query("update events set county=$1 where slug=$2", [m[3], m[1]]);
  const gid = (await db.query("select id from events where slug='gothenburg-marathon'")).rows[0].id;
  await db.query(
    "insert into editions values(1,$1,'2026-10-09','Marathon','23:00','Open','https://runabc.co.uk/gothenburg-marathon','https://runabc.co.uk/gothenburg-marathon','Original note')",
    [gid],
  );
  await db.exec(
    "insert into events values(1000,'untouched','Untouched','Swimming','Sweden','','Stockholm','','','','','https://example.com',null,'Road',now())",
  );
  const untouched = (await db.query("select * from events where id=1000")).rows;
  await db.transaction((tx) => tx.exec(repair));
  assert.equal(
    (await db.query("select count(*) from app_meta")).rows[0].count,
    corrections.length + 1,
  );
  for (const c of corrections)
    assert.equal(
      (await db.query("select country from events where slug=$1", [c.slug])).rows[0].country,
      c.country,
    );
  const after = (await db.query("select * from editions")).rows;
  assert.equal(after[0].event_date.toISOString().slice(0, 10), "2026-10-10");
  assert.equal(after[0].notes.startsWith("Original note"), true);
  const snapshot = (await db.query("select * from app_meta order by key")).rows;
  await db.transaction((tx) => tx.exec(repair));
  assert.deepEqual((await db.query("select * from app_meta order by key")).rows, snapshot);
  assert.deepEqual((await db.query("select * from editions")).rows, after);
  assert.deepEqual((await db.query("select * from events where id=1000")).rows, untouched);
  // Real SQL query: synonymous country labels share one option and filter.
  await db.exec(
    "insert into events(id,slug,name,sport,country,city,surface) values(1001,'alias','Swedish alias fixture','Running','SWE','Gothenburg','Road');insert into editions(id,event_id,event_date,distance_code) values(2,1001,'2027-01-01','10K')",
  );
  const sql = { query: async (text, params) => (await db.query(text, params)).rows };
  const selection = await readSportFixtures(
    sql,
    { sports: ["Running"], surfaces: ["Road"], country: "Sweden" },
    "2026-10-08",
  );
  assert.equal(selection.fixtures.length, 2);
  assert.ok(selection.fixtures.every((x) => x.country === "Sweden"));
  assert.ok(selection.countries.includes("Sweden"));
  assert.ok(!selection.countries.includes("SWE"));
  assert.equal(selection.fixtures[0].starts[0].time, "10:00");
  assert.equal(
    (
      await readSportFixtures(
        sql,
        { sports: ["Running"], surfaces: ["Road"], country: "Scotland" },
        "2026-10-08",
      )
    ).fixtures.length,
    0,
  );
  // Unique-key conflict must roll back the entire repair rather than partly changing countries.
  await db.query("update events set country='Scotland',county='Scotland' where id=$1", [gid]);
  await db.exec(
    "update editions set event_date='2026-10-09',source_url='https://runabc.co.uk/gothenburg-marathon' where id=1",
  );
  await db.query(
    "insert into editions(id,event_id,event_date,distance_code) values(3,$1,'2026-10-10','Marathon')",
    [gid],
  );
  await assert.rejects(db.transaction((tx) => tx.exec(repair)));
  assert.equal(
    (await db.query("select country from events where id=$1", [gid])).rows[0].country,
    "Scotland",
  );
} finally {
  await db.close();
}
const path = process.argv[2];
if (path) {
  const rows = JSON.parse(fs.readFileSync(path));
  let missing = 0,
    international = 0;
  for (const e of rows) {
    const f = countryFlag(e.country),
      r = resolveCountry(e);
    if (!e.country) missing++;
    else if (r.iso === "WORLD") international++;
    else {
      assert.ok(f.code, e.country);
      assert.equal(f.code.split("-")[0], r.iso, e.slug);
    }
  }
  console.log(
    JSON.stringify({
      events: rows.length,
      missingStoredCountry: missing,
      international,
      recognisedCountryRecords: rows.length - missing - international,
    }),
  );
}
console.log(
  `PASS: ${Object.keys(countryNames).length} country/territory mappings, aliases, home nations, ambiguous cities, unknowns, filters, Gothenburg date/time, ${corrections.length} bounded repairs, before-state backups, repeat safety and atomic rollback.`,
);
