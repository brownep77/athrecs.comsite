#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import pg from "pg";

const SOURCE_KEYS = [
  "athrecs-code:uk-ireland-non-standard-distances:2026-08-28",
  "athrecs-code:uk-ireland-half-ten-mile-and-10k-checkpoints:2026-08-28",
  "athrecs-code:uk-ireland-half-ten-mile-and-10k-checkpoints-overflow:2026-09-05",
];

assert(process.env.DATABASE_URL?.trim(), "DATABASE_URL is required for publication verification");

function runNode(script, extraEnv = {}) {
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  assert.equal(
    result.status,
    0,
    `${script} failed with exit code ${result.status}\n${output}`,
  );
  return output;
}

runNode("scripts/migrate.mjs");
const publisherEnv = {
  VERCEL_ENV: "production",
  VERCEL_GIT_COMMIT_REF: "main",
};
const firstOutput = runNode(
  "scripts/publish-remaining-uk-ireland-race-additions.mjs",
  publisherEnv,
);
assert.match(firstOutput, /published non-standard-distances revision \d+:/);
assert.match(firstOutput, /published half-ten-mile-and-10k-checkpoints-part-1 revision \d+:/);
assert.match(firstOutput, /published half-ten-mile-and-10k-checkpoints-part-2 revision \d+:/);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

async function one(query, values = []) {
  const result = await client.query(query, values);
  return result.rows[0];
}

try {
  const batches = await client.query(
    `select id, source_key, status, publish_summary
     from catalogue_import_batches
     where source_key = any($1::text[])
     order by source_key`,
    [SOURCE_KEYS],
  );
  assert.equal(batches.rows.length, 3, "All reviewed catalogue batches must be recorded");
  for (const batch of batches.rows) {
    assert.equal(batch.status, "published", `${batch.source_key} did not publish`);
    assert(batch.publish_summary.eventsUpserted > 0, `${batch.source_key} published no events`);
    assert(batch.publish_summary.eventsUpserted <= 75, `${batch.source_key} exceeded event limits`);
    assert(batch.publish_summary.editionsUpserted > 0, `${batch.source_key} published no editions`);
    assert(batch.publish_summary.editionsUpserted <= 200, `${batch.source_key} exceeded edition limits`);
    assert(
      batch.publish_summary.entryOptionsUpserted > 0,
      `${batch.source_key} published no verified entry options`,
    );
  }

  const requiredEditions = [
    "maverick-kielder-forest-gravel-2026|2026-09-05|6K",
    "eyam-half-marathon-2027|2027-05-16|Half",
    "beverley-half-marathon|2027-08-22|Half",
    "fleet-10k5k-peter-driver-memorial|2026-10-25|5K",
    "fleet-10k5k-peter-driver-memorial|2026-10-25|10K",
    "jedburgh-half-marathon|2026-10-25|10K",
    "jedburgh-half-marathon|2026-10-25|Half",
    "polesden-lacey-10k|2026-10-25|10K",
  ];
  const editionCount = await one(
    `select count(*)::int as count
     from editions ed
     join events ev on ev.id = ed.event_id
     where (ev.slug || '|' || ed.event_date::text || '|' || ed.distance_code)
       = any($1::text[])`,
    [requiredEditions],
  );
  assert.equal(
    editionCount.count,
    requiredEditions.length,
    "One or more representative reviewed editions was not published",
  );

  const quarter = await one(
    `select exists(
       select 1
       from event_distances d
       join events ev on ev.id = d.event_id
       where ev.slug = 'harvest-trail-half-and-quarter-marathon'
         and d.distance_code = 'Quarter'
     ) as present`,
  );
  assert.equal(quarter.present, true, "Quarter-marathon distance was not published");

  const polesden = await one(
    `select ed.status, eo.price_amount, eo.price_currency, eo.is_verified
     from editions ed
     join events ev on ev.id = ed.event_id
     left join edition_entry_options eo on eo.edition_id = ed.id and eo.is_primary
     where ev.slug = 'polesden-lacey-10k'
       and ed.event_date = date '2026-10-25'
       and ed.distance_code = '10K'`,
  );
  assert.equal(polesden.status, "Open");
  assert.equal(Number(polesden.price_amount), 0);
  assert.equal(polesden.price_currency, "GBP");
  assert.equal(polesden.is_verified, true);

  const aliasCount = await one(
    `select count(*)::int as count
     from events
     where slug = any($1::text[])`,
    [["3k-on-the-green-september", "3k-on-the-green-october"]],
  );
  assert.equal(aliasCount.count, 0, "Known duplicate event aliases were republished");

  const revisionsBefore = await one(
    `select count(*)::int as count, max(id)::text as max_id
     from catalogue_revisions
     where batch_id = any($1::text[])`,
    [batches.rows.map((batch) => batch.id)],
  );
  assert.equal(revisionsBefore.count, 3, "Expected one revision per reviewed batch");

  const secondOutput = runNode(
    "scripts/publish-remaining-uk-ireland-race-additions.mjs",
    publisherEnv,
  );
  assert.equal(
    (secondOutput.match(/was already published; no database change needed/g) ?? []).length,
    3,
    "Repeat publication did not reuse all existing batches",
  );

  const revisionsAfter = await one(
    `select count(*)::int as count, max(id)::text as max_id
     from catalogue_revisions
     where batch_id = any($1::text[])`,
    [batches.rows.map((batch) => batch.id)],
  );
  assert.equal(revisionsAfter.count, revisionsBefore.count, "Repeat deployment created a revision");
  assert.equal(revisionsAfter.max_id, revisionsBefore.max_id);
} finally {
  await client.end();
}

console.log(
  "Verified all remaining race-addition batches, representative fixtures, entry data and idempotent repeat publication.",
);
