import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarWindowEnd, readinessReport } from "./world-triathlon-readiness.mjs";

// Synthetic counts only. No production athlete records or private audit data.
const snapshot = () => ({
  scope: "world-triathlon-linked-event-histories-v1",
  as_of: "2026-11-02", window_end: "2027-02-02",
  events: 3, edition_rows: 8, upcoming_rows: 4, next_three_months: 3,
  next_three_months_blank_starts: 2, future_other_distance: 3,
  histories: 4, athletes: 4, performance_rows: 20,
  published_histories: 3, complete_histories: 1, keyed_rows: 18,
  duplicate_key_groups: 0, cross_profile_duplicate_keys: 0,
  capture_approvals: [{ approval_basis: "owner_private_import", scope: "staff_only", n: 2 }],
});

test("uses three calendar months, not 90 days, including leap and month-end clamps", () => {
  assert.equal(calendarWindowEnd("2026-11-02"), "2027-02-02");
  assert.equal(calendarWindowEnd("2026-11-30"), "2027-02-28");
  assert.equal(calendarWindowEnd("2023-11-30"), "2024-02-29");
  assert.equal(calendarWindowEnd("2026-01-31"), "2026-04-30");
});
test("rejects malformed or impossible dates", () => {
  for (const date of [null, "2026-2-1", "2026-02-30", "2026-13-01", "not-a-date"])
    assert.throws(() => calendarWindowEnd(date));
});
test("describes limited key coverage without claiming verification or publication", () => {
  const text = readinessReport(snapshot());
  assert.match(text, /rows outside that key audit: 2/);
  assert.match(text, /not counts of public fixtures/);
  assert.match(text, /does not establish identity/);
  assert.match(text, /New fixtures: 0\. New results: 0\. New profiles: 0\. Merges: 0/);
});
test("staff-only owner capture does not authorise bulk collection", () => {
  const text = readinessReport(snapshot());
  assert.match(text, /All recorded capture approvals.*staff-only/);
  assert.match(text, /not provider permission/);
});
test("other approval labels cannot enable collection automatically", () => {
  const data = snapshot();
  data.capture_approvals = [{ approval_basis: "provider_licence", scope: "public", n: 1 }];
  assert.match(readinessReport(data), /require individual scope and evidence review/);
  assert.match(readinessReport(data), /never grants collection/);
});
test("rejects invalid counts, unknown scope and incorrect window", () => {
  for (const patch of [
    { athletes: -1 }, { keyed_rows: 21 }, { next_three_months_blank_starts: 4 },
    { complete_histories: 5 }, { cross_profile_duplicate_keys: 1 },
    { performance_rows: "20" }, { scope: "all-data" }, { window_end: "2027-01-31" },
  ]) assert.throws(() => readinessReport({ ...snapshot(), ...patch }));
});
test("requires an explicit, valid approval summary", () => {
  assert.throws(() => readinessReport({ ...snapshot(), capture_approvals: null }));
  assert.throws(() => readinessReport({ ...snapshot(), capture_approvals: [{}] }));
  assert.match(readinessReport({ ...snapshot(), capture_approvals: [] }), /individual scope/);
});
test("does not mutate the input snapshot", () => {
  const data = snapshot(), before = structuredClone(data);
  readinessReport(data);
  assert.deepEqual(data, before);
});
