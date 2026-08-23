import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [recoverySource, seedSource, apiSource, adminSource, publicFigureSource] = await Promise.all([
  readFile(new URL("../src/lib/athrecs/catalogue-recovery.server.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/lib/athrecs/seed.server.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/lib/athrecs/api.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/routes/admin/index.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/data/public-figures-wave-2.ts", import.meta.url), "utf8"),
]);

assert.match(recoverySource, /on conflict \(slug\) do nothing/);
assert.match(recoverySource, /on conflict \(event_id, event_date, distance_code\) do nothing/);
assert.match(recoverySource, /sql\.transaction/);
assert.match(recoverySource, /verifyCompleteness/);
assert.match(recoverySource, /fixtures_catalogue_version/);
assert.match(recoverySource, /existingPrimaryRows/);
assert.match(recoverySource, /row\[13\] = false/);
assert.match(recoverySource, /reservedSourceIds/);
assert.match(recoverySource, /row\[0\] = null/);
assert.match(recoverySource, /explicitParkrunOverlapCount/);
assert.doesNotMatch(
  recoverySource,
  /delete from (?:events|editions|results|athletes|athlete_accounts)/i,
);

assert.match(seedSource, /Fixture marker\/count mismatch; staff recovery required/);
assert.match(apiSource, /getCatalogueRecovery[\s\S]*staffMiddleware/);
assert.match(apiSource, /recoverCatalogueBatch[\s\S]*staffMiddleware/);
assert.match(adminSource, /Restore missing catalogue/);
assert.match(adminSource, /Existing rows will not be overwritten/);
assert.doesNotMatch(
  publicFigureSource,
  /(?:seriesSlug|eventSlug): "(?:marine-corps-marathon|great-wall-marathon-china)"/,
);

console.log("Catalogue recovery verification passed");
