import assert from "node:assert/strict";
import { selectProfilePersonalBests } from "../src/lib/athrecs/reported-personal-bests.ts";
import { profilePersonalBestSummary } from "../src/lib/athrecs/profile-personal-best-summary.ts";
import { buildProfileAchievements } from "../src/lib/athrecs/profile-achievements.ts";
import { profileAchievementResults } from "../src/lib/athrecs/profile-history-results.ts";
import { withoutProfileEvidence } from "../src/lib/athrecs/profile-evidence.ts";

const row = (extra = {}) => ({
  year: 2020,
  date: "2020-05-10",
  sourceDate: "10 May",
  discipline: "5K",
  performance: "18:02",
  meeting: "Synthetic road race",
  venue: "",
  ageGroup: "",
  place: "4",
  wind: "",
  labels: ["Road"],
  sourceUrls: ["https://example.test/results/1"],
  verificationStatus: "source_verified",
  ...extra,
});
const histories = (rows) => [{ provider: "Synthetic", externalId: "test", performances: rows }];
const bests = (rows) => selectProfilePersonalBests([], [], histories(rows));
assert.equal(bests([row()])[0].value.finishTimeSeconds, 1082);
assert.equal(bests([row({ verificationStatus: "unverified" })]).length, 0);
const reported = row({ verificationStatus: "unverified", reportedPersonalBest: true });
assert.equal(bests([reported])[0].kind, "reported");
assert.equal(
  buildProfileAchievements(profileAchievementResults([], histories([reported]))).finishes.length,
  0,
);
const track = row({ discipline: "5000", performance: "16:12.55", labels: [] });
assert.equal(bests([track])[0].value.finishTimeSeconds, 972.55);
assert.equal(profilePersonalBestSummary([], histories([track]))[0].mark, "16:12.55");
assert.equal(bests([row(), track, row({ discipline: "parkrun", labels: [] })]).length, 3);
assert.equal(bests([row({ discipline: "5 Miles" })])[0].value.distanceKm, 8.04672);
assert.equal(bests([row({ discipline: "Half Marathon" })])[0].value.distanceCode, "Half");
const aided = row({ discipline: "Marathon", performance: "2:45:12a(2:45:14)" });
assert.equal(bests([aided]).length, 0);
assert.equal(
  buildProfileAchievements(profileAchievementResults([], histories([aided]))).marathons.length,
  1,
);
const reportedAided = { ...aided, verificationStatus: "unverified", reportedPersonalBest: true };
assert.equal(bests([reportedAided])[0].value.qualification, "Aided course");
assert.equal(bests([reportedAided])[0].value.displayMark, "2:45:12");
assert.equal(
  bests([
    reportedAided,
    row({ discipline: "Marathon", performance: "2:50:00", date: "2019-05-10" }),
  ]).length,
  2,
);
for (const extra of [
  { discipline: "Long Jump", performance: "7.21" },
  { discipline: "SHORT10M" },
  { discipline: "2M Relay Leg" },
  { discipline: "3KL" },
  { discipline: "ZXC" },
  { discipline: "10K Multi Terrain" },
  { performance: "DNF" },
  { performance: "0:00" },
  { performance: "18:99" },
  { performance: "18:02w" },
  { performance: "18:02c" },
  { profileExcluded: true },
  { syntheticTest: true },
  { date: "2099-01-01" },
  { date: "2020-02-30" },
  { labels: ["Road", "Split"] },
  { labels: ["Road", "Short course"] },
  { labels: [] },
  { wind: "+2.1" },
  { notes: "Conflicting source results" },
]) {
  assert.equal(bests([row(extra)]).length, 0, JSON.stringify(extra));
  assert.equal(bests([{ ...reported, ...extra }]).length, 0, `reported ${JSON.stringify(extra)}`);
}
assert.equal(
  bests([row(), row({ performance: "17:59" })]).length,
  0,
  "Conflicting copies cannot supply a PB",
);
assert.equal(bests([reported, { ...reported, performance: "17:59" }]).length, 0);
const parenthesised = bests([row({ performance: "18:02(18:06)" })])[0].value;
assert.equal(parenthesised.chipTimeSeconds, null);
assert.equal(parenthesised.gunTimeSeconds, null);
const timed = bests([row({ timing: { basis: "chip", chip: "18:02", gun: "18:06" } })])[0].value;
assert.equal(timed.chipTimeSeconds, 1082);
assert.equal(timed.gunTimeSeconds, 1086);
const privateHistory = histories([reported, track, reportedAided]);
assert.deepEqual(
  profilePersonalBestSummary([], withoutProfileEvidence(privateHistory)),
  profilePersonalBestSummary([], privateHistory),
);
assert(!JSON.stringify(profilePersonalBestSummary([], privateHistory)).includes("example.test"));
console.log(
  "Historical PB checks passed: verification, opt-in reports, aided courses, precision, timing, conflicts, privacy and sport separation.",
);

const walk = row({ discipline: "5000 Metres Race Walk", performance: "28:12.45", labels: ["Track"] });
assert.equal(bests([walk])[0].value.sport, "Walking");
assert.equal(bests([walk])[0].value.distanceKm, 5);
assert.equal(profilePersonalBestSummary([], histories([walk]))[0].mark, "28:12.45");
assert.equal(bests([{ ...walk, labels: [] }]).length, 0);
assert.equal(bests([{ ...walk, verificationStatus: "unverified" }]).length, 0);
assert.equal(bests([track, walk]).length, 2, "Running and walking PBs remain separate");
const precise = { ...profileAchievementResults([], histories([track]))[0], history: undefined,
  finishTimeSeconds: 973, details: { reportedPerformance: "16:12.55", verificationStatus: "source_verified" } };
assert.equal(profilePersonalBestSummary([precise], [])[0].mark, "16:12.55");
assert.equal(profilePersonalBestSummary([{ ...precise, details: { reportedPerformance: "15:00" } }], [])[0].mark, "16:13");
