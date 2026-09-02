#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import {
  buildBulkSourceJobManifest,
  parseFixtureSourceRegistry,
  summarizeFixtureSourceRegistry,
} from "../src/lib/athrecs/source-registry.ts";

const registryUrl = new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url);
const registryCsv = fs.readFileSync(registryUrl, "utf8");
const sources = parseFixtureSourceRegistry(registryCsv);
const manifest = buildBulkSourceJobManifest(sources);
const summary = summarizeFixtureSourceRegistry(manifest);

assert.equal(manifest.length, sources.length, "Every registry source must create one bulk-run job");
assert.equal(
  new Set(manifest.map((source) => source.source_id)).size,
  manifest.length,
  "Bulk-run manifest contains duplicate source jobs",
);
assert.equal(summary.sources, 282, "Bulk run no longer contains all 282 registered sources");
assert.equal(summary.runnable, 36, "Runnable source count changed without registry review");
assert.equal(summary.blocked, 246, "Blocked source count changed without registry review");

for (const source of manifest) {
  if (source.queue_status === "queued") {
    assert.equal(source.enabled, true, `${source.source_id} queued while disabled`);
    assert.equal(source.block_reason, null, `${source.source_id} queued with a block reason`);
  } else {
    assert(source.block_reason, `${source.source_id} blocked without an auditable reason`);
  }
}

const firstBlocked = sources.find((source) => !source.enabled);
assert(firstBlocked, "Expected at least one disabled source for the automatic-enable check");
const futureManifest = buildBulkSourceJobManifest(
  sources.map((source) =>
    source.source_id === firstBlocked.source_id
      ? {
          ...source,
          enabled: true,
          rights_status: "Permitted by published crawl rules",
        }
      : source,
  ),
);
assert.equal(
  futureManifest.find((source) => source.source_id === firstBlocked.source_id)?.queue_status,
  "queued",
  "An approved CSV source should automatically join the runnable queue",
);

const sourceIdsHash = createHash("sha256")
  .update(manifest.map((source) => source.source_id).join("\n"))
  .digest("hex");

process.stdout.write(
  JSON.stringify(
    {
      source_jobs: summary.sources,
      queued: summary.runnable,
      blocked: summary.blocked,
      duplicate_source_jobs: 0,
      new_approved_sources_auto_queue: true,
      source_ids_sha256: sourceIdsHash,
    },
    null,
    2,
  ) + "\n",
);
