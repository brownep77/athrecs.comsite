import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [policy, handler, route, docs] = await Promise.all([
  readFile("src/lib/athrecs/historical-result-sources.ts", "utf8"),
  readFile("src/lib/athrecs/result-source-automation.server.ts", "utf8"),
  readFile("src/routes/api/catalogue-automation.ts", "utf8"),
  readFile("docs/result-source-sync/README.md", "utf8"),
]);

for (const sourceKey of ["total_race_timing_results", "run_norwich_results"]) {
  assert.match(policy, new RegExp(`key: "${sourceKey}"`));
  assert.ok(docs.includes("`" + sourceKey + "`"));
}
assert.match(handler, /ATHRECS_RESULT_SOURCE_APPROVALS_JSON/);
assert.match(handler, /referencesMatch\(permissionReference, configuredReference\)/);
assert.match(handler, /verifyGitHubActionsOidcToken/);
assert.match(handler, /claim-\$\{policy\.key\}-\$\{digest\}/);
assert.match(handler, /sourceAthleteId/);
assert.match(handler, /sourceResultId/);
assert.match(handler, /status = 'completed'/);
assert.match(handler, /applyResultsImport/);
assert.match(handler, /cache-control": "private, no-store"/);
assert.match(route, /mode === "historical-results"/);
assert.match(route, /handleAutomatedHistoricalResultsRequest/);
assert.doesNotMatch(handler, /profile_visibility\s*=\s*['"]public['"]/i);
assert.doesNotMatch(handler, /result_visibility\s*=\s*['"]public['"]/i);

console.log("Historical result source sync safeguards verified.");
