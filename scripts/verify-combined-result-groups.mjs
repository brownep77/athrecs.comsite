import assert from "node:assert/strict";
import {
  candidateMark,
  sameResultCandidate,
  groupResultCandidates,
} from "../src/lib/athrecs/result-candidate-groups.ts";
const a = {
  athleteId: 1,
  name: "Synthetic Runner",
  date: "2026-09-01",
  distance: "10K",
  event: "Synthetic Race",
  performance: "40:00",
  sources: ["https://example.test/results"],
};
assert(sameResultCandidate(a, { ...a, performance: "00:40:00", distance: "10 km" }));
assert(sameResultCandidate(a, { ...a, performance: "40:00\n(40:03)" }));
assert(!sameResultCandidate(a, { ...a, performance: "40:00(40:03)", sources: [] }));
for (const change of [
  { athleteId: 2 },
  { date: "2026" },
  { distance: "10000" },
  { performance: "40:00.1" },
  { round: "Heat: 2" },
  { qualification: "DQ" },
  { name: "Another Runner" },
  { event: "Other Race", sources: [] },
])
  assert(!sameResultCandidate(a, { ...a, ...change }), JSON.stringify(change));
assert(!sameResultCandidate({ ...a, bib: "12" }, { ...a, bib: "13" }));
assert(
  !sameResultCandidate(
    { ...a, distance: "5K", event: "Synthetic junior parkrun" },
    { ...a, distance: "parkrun", event: "Synthetic junior parkrun" },
  ),
);
assert(
  sameResultCandidate(
    { ...a, distance: "5K", event: "Synthetic parkrun" },
    { ...a, distance: "parkrun", event: "Synthetic parkrun # 10" },
  ),
);
assert.equal(
  groupResultCandidates([a, { ...a, athleteId: 2 }, { ...a, athleteId: undefined }], (x) => x)
    .length,
  3,
  "Ambiguous archive cannot choose an owner",
);
assert.equal(
  groupResultCandidates(
    [
      { ...a, bib: "12" },
      { ...a, bib: null },
      { ...a, bib: "13" },
    ],
    (x) => x,
  ).length,
  2,
  "Weak intermediary cannot merge contradictory bibs",
);
for (const mark of ["", "NT", "DNF", "DNS", "DQ", "Unverified", "0", "00:00", "1:00 +", "NaN"])
  assert.equal(candidateMark(mark), null, mark);
for (const mark of ["40:00", "40:00c", "40:00\n(40:03)", "17.54.1", "10.14.48", "6.52", "1000"])
  assert(candidateMark(mark), mark);
assert.equal(candidateMark("", 2400), "time:2400");
assert.equal(candidateMark("", 0), null);
console.log(
  "PASS: exact candidate grouping; annotated source marks retained; track, rounds, bib conflicts and ambiguous owners stay separate; empty performances excluded.",
);
