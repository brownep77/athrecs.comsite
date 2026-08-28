#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import pg from "pg";

const SOURCE_KEY = "athrecs-code:uk-ireland-five-k-release:2026-08-28";
assert(process.env.DATABASE_URL?.trim(), "DATABASE_URL is required for publication verification");

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
const firstOutput = runNode("scripts/publish-uk-ireland-five-k-release.mjs", publisherEnv);
assert.match(firstOutput, /published revision \d+: 67 events, 75 editions, 75 entry options/);

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
  assert.equal(batch.publish_summary.eventsUpserted, 67);
  assert.equal(batch.publish_summary.editionsUpserted, 75);
  assert.equal(batch.publish_summary.entryOptionsUpserted, 75);

  const sentinels = await one(
    `select count(*)::int as count
     from events
     where slug = any($1::text[])`,
    [
      [
        "an-riocht-5k-series-2026",
        "st-vincents-secondary-school-5k-2026",
        "annaghmore-running-festival-5k-2026",
        "race-for-life-cardiff-5k-2027",
        "atw-colchester-friday-night-runs-5k-2027",
        "runthrough-chase-the-moon-battersea-december-2027",
      ],
    ],
  );
  assert.equal(sentinels.count, 6);

  const corrections = await one(
    `select
       count(*) filter (where ev.slug = 'lifford-strabane-5k-2026' and ed.event_date = '2026-09-20')::int as lifford_target,
       count(*) filter (where ev.slug = 'lifford-strabane-5k-2026' and ed.event_date = '2026-09-06')::int as lifford_old,
       count(*) filter (where ev.slug = 'fountains-abbey-wild-trail-runs' and ed.event_date = '2027-02-28' and ed.distance_code = '10K')::int as fountains_target,
       count(*) filter (where ev.slug = 'fountains-abbey-wild-trail-runs' and ed.event_date = '2027-01-31' and ed.distance_code = '10K')::int as fountains_old
     from editions ed
     join events ev on ev.id = ed.event_id
     where ev.slug in ('lifford-strabane-5k-2026', 'fountains-abbey-wild-trail-runs')`,
  );
  assert.equal(corrections.lifford_target, 1);
  assert.equal(corrections.lifford_old, 0);
  assert.equal(corrections.fountains_target, 1);
  assert.equal(corrections.fountains_old, 0);

  const revisionsBefore = await one(
    `select count(*)::int as count, max(id)::text as max_id
     from catalogue_revisions
     where batch_id = $1`,
    [batch.id],
  );
  const secondOutput = runNode("scripts/publish-uk-ireland-five-k-release.mjs", publisherEnv);
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
  "Verified UK and Ireland 5K publication, corrections and idempotent repeat deployment.",
);
