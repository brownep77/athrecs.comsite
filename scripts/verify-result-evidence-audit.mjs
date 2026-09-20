import assert from "node:assert/strict";
import { auditResults, compareResult, readTimingTable } from "./lib/result-evidence-audit.mjs";

const headers = [
  "Position",
  "Forename",
  "Surname",
  "Gender",
  "Gender\nPos",
  "Category",
  "Cat\nPos",
  "Club",
  "Wava",
  "Tag",
  "Gun Time",
  "Chip Time",
];
const row = [
  "210",
  "Example",
  "Runner",
  "M",
  "185",
  "M45-49",
  "20",
  "Club",
  "68.3",
  "484",
  "00:37:47.7",
  "00:37:37.1",
];
const source = {
  url: "https://totalracetiming.co.uk/raceresults/681",
  headings: ["Race", "5 miles"],
  startTimes: ["15/04/2026 19:00"],
  rowCount: 1,
  tables: [{ headers, rows: [row] }],
};
const result = {
  id: 1,
  athlete_id: 1,
  display_name: "Example Runner",
  event_date: "2026-04-15",
  chip_time_seconds: 2257,
  gun_time_seconds: 2268,
  overall_place: 210,
  gender_place: 185,
  category_place: 20,
};
assert.deepEqual(compareResult(result, source).flags, []);
assert.equal(
  readTimingTable(source.tables[0])[0].chip,
  2257.1,
  "Wava column must not shift time fields",
);
assert.deepEqual(compareResult({ ...result, gender_place: 20 }, source).flags, [
  "gender_place_mismatch",
  "gender_place_equals_official_category_place",
]);
assert(
  compareResult({ ...result, chip_time_seconds: 2200 }, source).flags.includes(
    "chip_time_mismatch",
  ),
);
assert(
  compareResult({ ...result, event_date: "2026-04-16" }, source).flags.includes(
    "cited_race_date_mismatch",
  ),
);
assert(
  compareResult({ ...result, display_name: "Absent Runner" }, source).flags.includes(
    "name_not_found_in_cited_race",
  ),
);
assert(
  compareResult(result, { ...source, tables: [...source.tables, ...source.tables] }).flags.includes(
    "multiple_matching_names_or_distances",
  ),
);
assert.equal(readTimingTable({ headers: ["Rank", "Name"], rows: [] }), null);
const candidate = {
  ...result,
  source_url: source.url,
  status: "finished",
  finish_time_seconds: 2257,
};
assert.equal(auditResults([candidate], [source], "2026-09-20").scope.untestedResults, 0);
assert.equal(auditResults([candidate], [], "2026-09-20").scope.untestedResults, 1);
assert(
  auditResults(
    [{ ...candidate, source_url: "https://totalracetiming.co.uk/result" }],
    [],
    "2026-09-20",
  ).issues[0].flags.includes("generic_trt_result_url"),
);
assert(
  auditResults(
    [{ ...candidate, event_date: "2027-01-01" }],
    [source],
    "2026-09-20",
  ).issues[0].flags.includes("future_finished_result"),
);
console.log("Result evidence audit regression checks passed.");
