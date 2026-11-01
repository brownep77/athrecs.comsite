import assert from "node:assert/strict";
import { completedRacePresentation } from "../src/lib/athrecs/completed-race-presentation.ts";
import { publicCatalogueContent } from "../src/lib/athrecs/public-catalogue-content.ts";
const edition = { id: 42, event_date: "2026-11-01", status: "Finished", result_count: 5,
  results_official_url: "https://example.com/official", result_links: [] };
const data = { event: { name: "Synthetic race" }, upcoming: [edition], past: [] };
const before = JSON.stringify(data);
const result = completedRacePresentation(data, "2026-11-01");
assert.equal(result.upcoming.length, 0);
assert.equal(result.past.length, 1);
assert.equal(result.past[0].results_official_url, edition.results_official_url);
assert.equal(result.past[0].result_links[0].results_url, "https://www.athrecs.com/results/42");
assert.equal(result.past[0].result_links[0].is_verified, false);
assert.equal(JSON.stringify(data), before, "Do not mutate the original DTO or evidence");
for (const change of [{ event_date: "2026-11-02" }, { status: "Open" }, { result_count: 0 },
  { result_count: null }, { id: -1 }, { event_date: "not-a-date" }]) {
  const fixture = { ...data, upcoming: [{ ...edition, ...change }] };
  assert.equal(completedRacePresentation(fixture, "2026-11-01"), fixture);
}
const duplicate = completedRacePresentation({ ...data, past: [edition] }, "2026-11-01");
assert.equal(duplicate.past.length, 1);
assert.equal(completedRacePresentation(result, "2026-11-01"), result);
assert.deepEqual(publicCatalogueContent({ label: "Safe text", notes: "runABC source." }), { label: "Safe text", notes: "" });
assert.equal(publicCatalogueContent({ result_links: [{ results_url: "https://runabc.co.uk/" }] }).result_links.length, 0);
console.log("Completed-race presentation: 15 assertions passed; publication/privacy gates unchanged.");
