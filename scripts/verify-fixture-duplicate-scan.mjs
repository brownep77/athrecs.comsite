// Daily duplicate check: likely duplicates are flagged, different races are not.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs"; // isolated database; no network
const { findDuplicates, nameSimilarity, duplicateSummaryEmail, scanFixtureDuplicates } =
  await import("../src/lib/race-collector/fixture-duplicate-scan.server.ts");
let id = 0;
const row = (name, extra = {}) => ({
  edition_id: ++id,
  event_id: id,
  slug: name.toLowerCase().replace(/\W+/g, "-"),
  name,
  country: "England",
  city: "Norwich",
  website: "",
  date: "2027-04-04",
  distance_km: 10,
  distance_code: "10K",
  ...extra,
});
assert(nameSimilarity("Norwich Riverside 10K 2027", "The Riverside Norwich 10k") >= 0.8);
assert(nameSimilarity("Norwich Riverside 10K", "Cromer Pier 10K") < 0.34);
const findings = findDuplicates([
  row("Norwich Riverside 10K"),
  row("The Norwich Riverside 10k 2027"), // duplicate by name
  row("Cromer Pier 10K", { city: "Cromer" }), // different race
  row("Spring Dash", { website: "https://springdash.example/2027" }),
  row("Norwich Spring 10K", { website: "https://www.springdash.example/" }), // same site, same town
  row("Riverside 10K", { country: "Ireland", city: "Cork" }), // other country
  row("Norwich Riverside 10K", { date: "2027-05-05" }), // other date
  row("Norwich Riverside 10K", { distance_km: 5, distance_code: "5K" }), // other distance
  row("Park Fun Run", { website: "https://www.eventbrite.co.uk/e/1" }),
  row("Lake Fun Run", { website: "https://www.eventbrite.co.uk/e/2", city: "Diss" }), // shared platform
]);
assert.deepEqual(
  findings.map((f) => [f.first.name, f.second.name, f.reason]),
  [
    ["Norwich Riverside 10K", "The Norwich Riverside 10k 2027", "Names match closely"],
    ["Spring Dash", "Norwich Spring 10K", "Same organiser website"],
  ],
);
const email = duplicateSummaryEmail(findings, 7);
assert.equal(email.to[0], "paul@athrecs.com");
assert.match(email.text, /Nothing has been merged or hidden/);
assert.match(email.text, /athrecs\.com\/races\//);
// Against the real tables: a pair is reported as new once, then only re-seen.
const f = await bulkFixture();
try {
  await f.pg.exec(await readFile("migrations/20261107_fixture_duplicate_findings.sql", "utf8"));
  await f.sql`insert into events(id,slug,name,sport,country,city) values
    (995001,'dup-a','Norwich Riverside 10K','Running','England','Norwich'),
    (995002,'dup-b','The Norwich Riverside 10k 2027','Running','England','Norwich')`;
  await f.sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values
    (995001,995001,'2027-04-04','10K',10),(995002,995002,'2027-04-04','10K',10)`;
  const first = await scanFixtureDuplicates({ sqlOverride: f.sql, today: "2026-11-07" });
  assert.equal(first.fresh.length, 1);
  const second = await scanFixtureDuplicates({ sqlOverride: f.sql, today: "2026-11-07" });
  assert.equal(second.fresh.length, 0, "A pair already flagged is not reported again");
  assert.equal(second.open, 1);
} finally {
  await f.pg.close();
}
console.log(
  "Fixture duplicate scan checks passed: close names and shared organiser sites flagged; other dates, distances, countries and shared platforms not.",
);
