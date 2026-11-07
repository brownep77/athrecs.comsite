#!/usr/bin/env node
// Checks the source scorecard rules and that the committed scorecard is current.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  buildScorecard,
  permissionFor,
  scoreSource,
  tierFor,
} from "./source-registry/score-sources.mjs";

const base = {
  source_id: "x",
  source_name: "X",
  start_url: "https://example.com",
  source_type: "directory",
  enabled: "0",
  source_section: "",
  region_scope: "UK",
  country_focus: "United Kingdom",
  coverage_scope: "Past | Present | Future",
  timing_scope: "",
  chip_timed_status: "Provider-confirmed",
  profile: "generic",
  rights_status: "Rights review required",
  notes: "running races",
};

// A blocked source is never ranked for collection, however strong otherwise.
const blocked = {
  ...base,
  enabled: "1",
  profile: "some_adapter",
  rights_status: "Blocked by site terms",
};
assert.equal(permissionFor(blocked), "Not allowed");
assert.equal(scoreSource(blocked).tier, "Retired");

// Only enabled, permitted sources can reach tier A.
const open = {
  ...base,
  enabled: "1",
  profile: "some_adapter",
  rights_status: "Permitted by published crawl rules",
};
assert.equal(scoreSource(open).tier, "A");
assert.notEqual(scoreSource({ ...open, enabled: "0" }).tier, "A");
assert.equal(tierFor(95, "Needs review", { enabled: "0" }), "B");

// Live data moves a source: no new records drops it, strong volume lifts it.
const quiet = scoreSource(base, { records_30d: "0", rejection_rate_pct: "60" }).score;
const busy = scoreSource(base, { records_30d: "500", rejection_rate_pct: "2" }).score;
assert.ok(busy > scoreSource(base).score && quiet < scoreSource(base).score);

// Scores stay within 0-100 and every row gets a tier and check frequency.
const rows = buildScorecard([
  open,
  blocked,
  base,
  { ...base, source_id: "y", region_scope: "", start_url: "" },
]);
for (const row of rows) {
  assert.ok(row.score >= 0 && row.score <= 100);
  assert.ok(row.check_frequency);
}

execFileSync(process.execPath, ["scripts/source-registry/score-sources.mjs", "--check"], {
  stdio: "inherit",
});
console.log("Source scorecard checks passed.");
