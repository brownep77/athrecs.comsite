import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { PGlite } from "@electric-sql/pglite";
import { isParkrunResult, PARKRUN_TIMING_LABEL } from "../src/lib/athrecs/parkrun-timing.ts";
import { personalBestGroup, timingBasis } from "../src/lib/athrecs/profile-records.ts";
import { selectProfilePersonalBests } from "../src/lib/athrecs/reported-personal-bests.ts";
import { profilePersonalBestSummary } from "../src/lib/athrecs/profile-personal-best-summary.ts";
import { profileAchievementResults } from "../src/lib/athrecs/profile-history-results.ts";
import { buildProfileAchievements } from "../src/lib/athrecs/profile-achievements.ts";
import { resultIssues } from "../src/lib/athlete-workspace/core.ts";

const finish = {
  resultId: 1,
  editionId: 1,
  eventName: "Synthetic parkrun",
  eventSlug: "",
  sport: "Running",
  surface: "Road",
  country: "GBR",
  eventDate: "2020-01-04",
  distanceCode: "5K",
  distanceKm: 5,
  status: "finished",
  finishTimeSeconds: 1200,
  chipTimeSeconds: 1200,
  gunTimeSeconds: 1200,
  overallPlace: 10,
  category: null,
  sourceUrls: [],
  details: { verificationStatus: "unverified" },
};
const road = { ...finish, resultId: 2, editionId: 2, eventName: "Synthetic road 5K" };
for (const context of [
  { sport: "Parkrun" },
  { eventName: "Synthetic junior parkrun" },
  { distanceCode: "parkrunCX" },
])
  assert(isParkrunResult(context));
for (const context of [
  { eventName: "Synthetic Park Run", distanceCode: "5K" },
  { eventName: "Synthetic (not)parkrun", sport: "Parkrun" },
])
  assert(!isParkrunResult(context));
assert.equal(timingBasis(finish), "parkrun finish");
assert.equal(timingBasis(road), "Chip / gun");
assert.notEqual(personalBestGroup(finish), personalBestGroup(road));
assert.equal(
  personalBestGroup(finish),
  personalBestGroup({ ...finish, sport: "Parkrun", surface: "Parkrun" }),
);
assert.equal(selectProfilePersonalBests([finish, road]).length, 2);
assert.equal(
  new Set(profilePersonalBestSummary([finish, road], []).map((best) => best.id)).size,
  2,
);
assert.equal(selectProfilePersonalBests([finish])[0].verified, false);
assert.equal(
  selectProfilePersonalBests([{ ...finish, details: { verificationStatus: "source_verified" } }])[0]
    .verified,
  true,
);
assert.equal(buildProfileAchievements([finish, road]).finishes.length, 2);

const history = {
  year: 2020,
  date: "2020-01-04",
  sourceDate: "4 Jan",
  discipline: "5K",
  performance: "20:00",
  meeting: "Synthetic parkrun",
  venue: "",
  ageGroup: "",
  place: "10",
  wind: "",
  labels: [],
  sourceUrls: [],
  verificationStatus: "unverified",
  timing: { basis: "chip", chip: "20:00", gun: "20:00" },
};
const projected = profileAchievementResults(
  [],
  [{ provider: "Synthetic", externalId: "test", performances: [history] }],
);
assert.equal(projected[0].sport, "Parkrun");
assert.equal(projected[0].finishTimeSeconds, 1200);
assert.equal(projected[0].chipTimeSeconds, null);
assert.equal(projected[0].gunTimeSeconds, null);
assert.equal(history.timing.chip, "20:00", "Original source evidence is preserved");
const draft = {
  index: 1,
  race: "Synthetic parkrun",
  date: "2020-01-04",
  distance: "5K",
  time: "20:00",
  sourceUrl: "https://example.test/results",
  bib: "",
  place: "",
  timingBasis: "chip",
};
assert(resultIssues(draft).some((issue) => issue.includes("parkrun is not chip timed")));
assert.deepEqual(resultIssues({ ...draft, timingBasis: "unspecified" }), []);

const server = await createServer({
  configFile: false,
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": new URL("../src", import.meta.url).pathname } },
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { ResultTiming, HistoricalTiming } = await server.ssrLoadModule(
    "/src/components/athletes/ResultTiming.tsx",
  );
  const { ClaimResultDetails } = await server.ssrLoadModule(
    "/src/components/athletes/ClaimResultDetails.tsx",
  );
  const { PersonalBestStrip } = await server.ssrLoadModule(
    "/src/components/athletes/ProfileAchievements.tsx",
  );
  const text = (component, props) =>
    load(renderToStaticMarkup(createElement(component, props))).text();
  assert.equal(text(ResultTiming, { result: finish }), PARKRUN_TIMING_LABEL);
  assert.equal(text(ResultTiming, { result: road }), "Chip / gun time");
  assert.equal(
    text(HistoricalTiming, {
      performance: "20:00",
      discipline: "5K",
      eventName: "Synthetic parkrun",
      timing: history.timing,
    }),
    PARKRUN_TIMING_LABEL,
  );
  assert.equal(
    text(HistoricalTiming, {
      performance: "12:00",
      discipline: "2K",
      eventName: "Synthetic junior parkrun",
    }),
    PARKRUN_TIMING_LABEL,
  );
  assert.equal(
    text(HistoricalTiming, { performance: "20:00", discipline: "5K" }),
    "Timing unknown",
  );
  assert.equal(text(ClaimResultDetails, { result: finish }), PARKRUN_TIMING_LABEL);
  const pb = text(PersonalBestStrip, { results: [finish], showEvidence: true });
  assert(pb.includes(PARKRUN_TIMING_LABEL));
  assert(!pb.includes("Not verified by chip time"));
  const reportedPb = text(PersonalBestStrip, {
    results: [],
    reportedBests: [
      {
        id: "synthetic",
        ...finish,
        event: finish.eventName,
        date: finish.eventDate,
        note: "",
        sources: [{ label: "Synthetic", url: "https://example.test/results" }],
      },
    ],
    showEvidence: true,
  });
  assert(reportedPb.includes(PARKRUN_TIMING_LABEL));
  assert(!reportedPb.includes("Not verified by chip time"));
} finally {
  await server.close();
}

const db = new PGlite();
try {
  await db.exec(`create table events(id int primary key, name text, sport text);
    create table editions(id int primary key, event_id int);
    create table results(id int primary key, edition_id int, finish_time_seconds int, chip_time_seconds int, gun_time_seconds int, verification_status text);
    insert into events values (1,'Synthetic parkrun','Running'),(2,'Synthetic road 5K','Running'),(3,'Synthetic (not)parkrun','Parkrun');
    insert into editions values (1,1),(2,2),(3,3);
    insert into results values (1,1,1200,1200,1200,'unverified'),(2,2,1200,1200,1201,'source_verified'),(3,1,1200,1199,1200,'unverified'),(4,3,1200,1200,1200,'unverified');`);
  const archiveMigration = await readFile(
    new URL("../migrations/20261009_results_archive_foundation.sql", import.meta.url),
    "utf8",
  );
  await db.exec(
    archiveMigration.slice(
      archiveMigration.indexOf("create table result_change_history ("),
      archiveMigration.indexOf("comment on table result_archive_entries"),
    ),
  );
  const migration = await readFile(
    new URL("../migrations/20261024_parkrun_finish_times.sql", import.meta.url),
    "utf8",
  );
  await db.exec(`begin; ${migration} commit;`);
  assert.deepEqual((await db.query("select * from results where id=1")).rows[0], {
    id: 1,
    edition_id: 1,
    finish_time_seconds: 1200,
    chip_time_seconds: null,
    gun_time_seconds: null,
    verification_status: "unverified",
  });
  const audit = (await db.query("select * from result_change_history")).rows;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].before_value.chip_time_seconds, 1200);
  assert.match(audit[0].note, /parkrun timing classification/);
  assert.equal(
    (await db.query("select chip_time_seconds from results where id=2")).rows[0].chip_time_seconds,
    1200,
  );
  assert.equal(
    (await db.query("select chip_time_seconds from results where id=3")).rows[0].chip_time_seconds,
    1199,
    "Conflicting marks need review",
  );
  assert.equal(
    (await db.query("select chip_time_seconds from results where id=4")).rows[0].chip_time_seconds,
    1200,
    "Self-timed (not)parkrun is excluded",
  );
  await db.exec(`begin; ${migration} commit;`);
  assert.equal((await db.query("select count(*)::int n from result_change_history")).rows[0].n, 1);
} finally {
  await db.close();
}
console.log(
  "parkrun finish labels, separate PBs, verification independence, input validation and audited migration verified.",
);
