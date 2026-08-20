import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { raceQualifications } = await import("../src/data/race-qualifications.ts");

assert.deepEqual(Object.keys(raceQualifications).sort(), [
  "boston-marathon",
  "comrades-marathon",
  "two-oceans-marathon",
]);

for (const qualification of Object.values(raceQualifications)) {
  assert.equal(qualification.checkedAt, "2026-08-20");
  assert.match(qualification.sourceUrl, /^https:\/\//);
  assert(qualification.summary.length >= 80);
  assert(qualification.requirements.length >= 3);
  assert((qualification.tables?.length ?? 0) >= 1);
  for (const table of qualification.tables ?? []) {
    assert(table.headers.length >= 2);
    assert(table.rows.length >= 6);
    assert(table.rows.every((row) => row.length === table.headers.length));
  }
}

assert.equal(raceQualifications["comrades-marathon"].tables?.[0].rows.length, 10);
assert.equal(raceQualifications["two-oceans-marathon"].tables?.[0].rows.length, 6);
assert.equal(raceQualifications["boston-marathon"].tables?.[0].rows.length, 11);

const routeSource = readFileSync(new URL("../src/routes/races/$slug.tsx", import.meta.url), "utf8");
const deduplicationSource = readFileSync(
  new URL("../src/data/fixture-deduplication.ts", import.meta.url),
  "utf8",
);
assert.match(routeSource, /raceQualifications\[event\.slug\]/);
assert.match(routeSource, /Official qualification rules/);
assert.match(
  deduplicationSource,
  /seriesSlug: "boston-marathon",[\s\S]*?fromDate: "2027-04-11",[\s\S]*?toDate: "2027-04-19"/,
);
assert.match(
  deduplicationSource,
  /"boston-marathon": \{[\s\S]*?organiser: "Boston Athletic Association"/,
);
assert.match(deduplicationSource, /website: "https:\/\/www\.baa\.org\/races\/boston-marathon"/);

process.stdout.write(
  JSON.stringify(
    {
      checked_at: "2026-08-20",
      qualification_profiles: Object.keys(raceQualifications).length,
      standards_rows: Object.values(raceQualifications).reduce(
        (total, qualification) =>
          total +
          (qualification.tables ?? []).reduce((subtotal, table) => subtotal + table.rows.length, 0),
        0,
      ),
      boston_fixture: "2027-04-19",
      retired_boston_duplicate: "2027-04-11",
    },
    null,
    2,
  ) + "\n",
);
