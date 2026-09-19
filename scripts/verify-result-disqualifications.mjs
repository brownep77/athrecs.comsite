import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { findPersonalBests, combineProfileResults } from "../src/lib/athrecs/profile-records.ts";
import { buildProfileAchievements } from "../src/lib/athrecs/profile-achievements.ts";
import { disqualificationLabel, readResultDetails } from "../src/lib/athrecs/result-details.ts";
const sample = {
  resultId: 1,
  editionId: 1,
  eventName: "Test 10K",
  eventSlug: "test-10k",
  sport: "Running",
  surface: "Road",
  country: "England",
  eventDate: "2024-03-03",
  distanceCode: "10K",
  distanceKm: 10,
  status: "finished",
  finishTimeSeconds: 1858,
  chipTimeSeconds: null,
  gunTimeSeconds: null,
  overallPlace: 1,
  category: null,
  sourceUrls: [],
};
const manifest = JSON.parse(
  await readFile(new URL("../docs/joe-skipper-2026-09-19/manifest.json", import.meta.url), "utf8"),
);
const excluded = {
  ...sample,
  resultId: 2,
  editionId: 2,
  eventDate: "2025-06-06",
  finishTimeSeconds: 1700,
  status: "DQ",
  details: { disqualification: manifest.decision },
};
for (const reason of ["whereabouts", "positive_test", "other"]) {
  const row = { ...excluded, details: { disqualification: { ...manifest.decision, reason } } };
  assert.equal(findPersonalBests([sample, row])[0].resultId, 1);
  assert.equal(buildProfileAchievements([sample, row]).finishes.length, 1);
  assert.equal(row.finishTimeSeconds, 1700, "Historical performance is retained");
  assert.equal(
    findPersonalBests([{ ...row, status: "finished" }]).length,
    0,
    "Decision metadata also blocks a stale finish status",
  );
  assert.equal(buildProfileAchievements([{ ...row, status: "finished" }]).finishes.length, 0);
}
assert.match(disqualificationLabel("whereabouts"), /whereabouts/);
assert.doesNotMatch(disqualificationLabel("whereabouts"), /drug|positive/);
assert.match(disqualificationLabel("positive_test"), /positive drug test/);
assert.equal(
  combineProfileResults([sample, { ...sample, details: excluded.details }]).length,
  2,
  "Conflicting decisions cannot be collapsed away",
);
assert.equal(manifest.results.length, 44);
assert.equal(manifest.results.filter((r) => r.status === "DQ").length, 12);
for (const row of manifest.results) {
  readResultDetails(row.details);
  assert.equal(row.status === "DQ", row.date >= "2025-05-15");
  assert.equal(row.sport === "Swimming", false, "Triathlon swim legs are not separate swim races");
}
const db = new PGlite();
try {
  await db.exec("create table results(id integer primary key,status text not null);");
  await db.exec(
    await readFile(
      new URL("../migrations/0037_result_disqualifications.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.query("insert into results(id,status,result_details) values(1,$1,$2)", [
    "DQ",
    JSON.stringify(excluded.details),
  ]);
  await assert.rejects(
    db.query("update results set status=$1 where id=1", ["finished"]),
    /result_details_disqualification_status/,
  );
  await assert.rejects(
    db.query("insert into results values(2,$1,$2)", [
      "DQ",
      JSON.stringify({ disqualification: { ...manifest.decision, reason: "unsupported" } }),
    ]),
  );
} finally {
  await db.close();
}
console.log(
  "Disqualification reasons, retained performances, PB/achievement exclusion and SQL constraints passed.",
);
