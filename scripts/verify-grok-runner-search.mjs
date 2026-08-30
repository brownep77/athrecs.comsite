import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [api, panel, account, envExample, migration] = await Promise.all([
  readFile(resolve(root, "src/lib/athrecs/grok-runner-search-api.ts"), "utf8"),
  readFile(resolve(root, "src/components/athletes/PotentialResultMatchesPanel.tsx"), "utf8"),
  readFile(resolve(root, "src/routes/athlete-account.tsx"), "utf8"),
  readFile(resolve(root, ".env.example"), "utf8"),
  readFile(resolve(root, "migrations/0025_athlete_identity_lookup.sql"), "utf8"),
]);

assert.match(api, /middleware\(\[authMiddleware\]\)/);
assert.match(api, /performance_insights/);
assert.match(api, /XAI_API_KEY/);
assert.match(api, /web_search/);
assert.match(api, /Never invent/);
assert.doesNotMatch(api, /postcode|verifiedEmail|equipmentBrands/);
assert.match(panel, /Search Power of 10 and parkrun/);
assert.match(panel, /findExternalRunnerMatches/);
assert.match(panel, /suggestions, not confirmed ownership/i);
assert.match(account, /Previous or known-as names/);
assert.match(account, /parkrun barcode/);
assert.match(account, /A race you know you ran/);
assert.match(envExample, /XAI_API_KEY=/);
assert.doesNotMatch(envExample, /VITE_XAI_API_KEY/);
assert.match(migration, /previous_names/);
assert.match(migration, /athlete_external_match_searches/);

console.log(
  "Grok runner search verification passed: private identity fields, consent gate, server-only xAI key and suggestion-only UI are present.",
);
