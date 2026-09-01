#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [seedSource, publisherSource, buildPublisherSource] = await Promise.all([
  readFile("src/lib/athrecs/seed.server.ts", "utf8"),
  readFile("scripts/publish-athrecs-catalogue.mjs", "utf8"),
  readFile("scripts/publish-after-build.mjs", "utf8"),
]);

assert.match(seedSource, /pg_advisory_xact_lock/);
assert.match(seedSource, /catalogueMarkersCurrent/);
assert.match(seedSource, /dbSource === "neon"/);
assert.match(publisherSource, /ensureAthrecsSeeded\(\)/);
assert.match(publisherSource, /VERCEL_ENV === "production"/);
assert.match(publisherSource, /VERCEL_GIT_COMMIT_REF/);
assert.match(publisherSource, /CATALOGUE_SEED_VERSION/);
assert(
  buildPublisherSource.includes('"scripts/publish-athrecs-catalogue.mjs"'),
  "Production builds must publish the complete ATHRECS catalogue before serving traffic",
);

console.log("ATHRECS catalogue publication verification passed.");
