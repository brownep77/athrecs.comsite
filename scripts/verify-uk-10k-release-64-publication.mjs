#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import pg from "pg";
import { createServer } from "vite";

const SOURCE_KEY = "athrecs-code:uk-10k-release-64:2026-08-29";
assert(process.env.DATABASE_URL?.trim(), "DATABASE_URL is required for publication verification");

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

let release;
let catalogue;
try {
  [release, catalogue] = await Promise.all([
    vite.ssrLoadModule("/src/data/uk-10k-release-64.ts"),
    vite.ssrLoadModule("/src/data/catalogue.ts"),
  ]);
} finally {
  await vite.close();
}

const keyOf = (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
const catalogueByKey = new Map(catalogue.editions.map((edition) => [keyOf(edition), edition]));
assert.equal(release.ukTenKRelease64Keys.length, 12);

for (const key of release.ukTenKRelease64Keys) {
  const edition = catalogueByKey.get(key);
  assert(edition, `Catalogue is missing UK 10K release 64 edition: ${key}`);
  assert.equal(edition.distance, "10K");
  assert.equal(edition.date, "2026-10-25");
  const primaries = (edition.entryOptions ?? []).filter(
    (option) => option.isPrimary && option.isVerified,
  );
  assert.equal(primaries.length, 1, `${key} must have one verified primary entry option`);
  assert.equal(
    primaries[0].entryUrl,
    release.ukTenKRelease64ExpectedPrimaryUrls[key],
    `${key} has the wrong primary entry URL`,
  );
}

function runNode(script, extraEnv = {}) {
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  assert.equal(result.status, 0, `${script} failed with exit code ${result.status}\n${output}`);
  return output;
}

runNode("scripts/migrate.mjs");
const publisherEnv = { VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: "main" };
const firstOutput = runNode("scripts/publish-uk-10k-release-64.mjs", publisherEnv);
assert.match(
  firstOutput,
  /\[uk-10k-release-64\] published revision \d+: 12 events, 12 editions, \d+ entry options/,
);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

async function one(query, values = []) {
  return (await client.query(query, values)).rows[0];
}

try {
  const batch = await one(
    `select id, status, publish_summary
     from catalogue_import_batches
     where source_key = $1
     limit 1`,
    [SOURCE_KEY],
  );
  assert.equal(batch?.status, "published");
  assert.equal(batch.publish_summary.eventsUpserted, 12);
  assert.equal(batch.publish_summary.editionsUpserted, 12);
  assert(batch.publish_summary.entryOptionsUpserted >= 12);

  const publishedEditions = await one(
    `select count(*)::int as count
     from editions ed
     join events ev on ev.id = ed.event_id
     where (
       ev.slug || '|' || to_char(ed.event_date, 'YYYY-MM-DD') || '|' || ed.distance_code
     ) = any($1::text[])`,
    [[...release.ukTenKRelease64Keys]],
  );
  assert.equal(publishedEditions.count, 12);

  const revisionsBefore = await one(
    `select count(*)::int as count, max(id)::text as max_id
     from catalogue_revisions
     where batch_id = $1`,
    [batch.id],
  );
  const secondOutput = runNode("scripts/publish-uk-10k-release-64.mjs", publisherEnv);
  assert.match(secondOutput, /was already published; no database change needed/);
  const revisionsAfter = await one(
    `select count(*)::int as count, max(id)::text as max_id
     from catalogue_revisions
     where batch_id = $1`,
    [batch.id],
  );
  assert.deepEqual(revisionsAfter, revisionsBefore);
} finally {
  await client.end();
}

console.log(
  "Verified UK 10K release 64 catalogue coverage, PostgreSQL publication and idempotent repeat deployment.",
);
