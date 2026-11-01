import assert from "node:assert/strict";
import { partitionRaceEditions } from "../src/lib/athrecs/completed-race-presentation.ts";

const today = "2026-11-01";
const edition = {
  id: 42,
  event_date: today,
  status: "Finished",
  result_count: 5,
  results_official_url: "https://example.com/official",
  result_links: [],
};
const editions = [
  { ...edition, id: 48, event_date: "2026-11-02" },
  edition,
  { ...edition, id: 43, status: "Open" },
  { ...edition, id: 44, status: "Cancelled" },
  { ...edition, id: 45, result_count: 0 },
  { ...edition, id: 46, event_date: "2026-10-31" },
];
const before = structuredClone(editions);
const grouped = partitionRaceEditions(editions, today);
assert.deepEqual(
  grouped.upcoming.map((row) => row.id),
  [43, 44, 45, 48],
);
assert.deepEqual(
  grouped.past.map((row) => row.id),
  [42, 46],
);
assert.equal(grouped.past[0], edition, "Keep the original edition and provider attribution");
assert.deepEqual(editions, before);
assert.deepEqual(partitionRaceEditions(editions, today), grouped);
console.log("Race-day and historical edition navigation passed.");
