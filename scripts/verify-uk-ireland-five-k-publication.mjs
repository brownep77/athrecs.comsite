#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import pg from "pg";
import { createServer } from "vite";

const SOURCE_KEY = "athrecs-code:uk-ireland-five-k-release:2026-08-28";
const CORRECTION_KEYS = [
  "lifford-strabane-5k-2026|2026-09-20|5K",
  "ruthin-evening-5k|2026-09-02|5K",
  "fountains-abbey-wild-trail-runs|2027-02-28|10K",
  "culzean-castle-trail-runs|2027-03-07|10K",
  "bramham-park-trail-runs|2027-04-04|10K",
  "high-lodge-wild-trail-runs|2027-04-11|10K",
  "gibside-national-trust-trail-10k|2027-05-05|5K",
  "margam-wild-trail-runs|2027-05-23|10K",
  "wentworth-castle-trail-runs|2027-06-16|10K",
];

assert(process.env.DATABASE_URL?.trim(), "DATABASE_URL is required for publication verification");

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
let catalogueEditions;
try {
  const catalogue = await vite.ssrLoadModule("/src/data/catalogue.ts");
  catalogueEditions = catalogue.editions;
} finally {
  await vite.close();
}

const catalogueEditionKeys = new Set(
  catalogueEditions.map((edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`),
);
const missingCorrectionKeys = CORRECTION_KEYS.filter((key) => !catalogueEditionKeys.has(key));
assert.deepEqual(
  missingCorrectionKeys,
  [],
  `Catalogue is missing corrected editions: ${missingCorrectionKeys.join(", ")}`,
);

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
       count(*) filter (where ev.slug = 'fountains-abbey-wild-trail-runs' and ed.event_date = '2027-01-31' and ed.distance_code = '10K')::int as fountains_old,
       count(*) filter (where ev.slug = 'gibside-national-trust-trail-10k' and ed.event_date = '2027-05-05' and ed.distance_code = '5K')::int as gibside_target
     from editions ed
     join events ev on ev.id = ed.event_id
     where ev.slug in (
       'lifford-strabane-5k-2026',
       'fountains-abbey-wild-trail-runs',
       'gibside-national-trust-trail-10k'
     )`,
  );
  assert.equal(corrections.lifford_target, 1);
  assert.equal(corrections.lifford_old, 0);
  assert.equal(corrections.fountains_target, 1);
  assert.equal(corrections.fountains_old, 0);
  assert.equal(corrections.gibside_target, 1);

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

  // Production event names/URLs can be reconciled after this release. Replaying
  // the old source batch must follow those permanent identities, not recreate it.
  const renamed = [];
  for (const [oldSlug, currentSlug] of [
    ["runthrough-edinburgh-running-festival-august-2027", "edinburgh-running-festival"],
    [
      "runthrough-goodwood-running-gp-december-2027",
      "running-grand-prix-goodwood-5k-10k-half-marathon-october",
    ],
  ]) {
    const event = await one(
      `update events set slug=$2,name='Synthetic canonical event metadata'
       where slug=$1 returning *`,
      [oldSlug, currentSlug],
    );
    assert(event, `Source event exists before reconciliation: ${oldSlug}`);
    renamed.push(event);
  }
  const eventIds = renamed.map((event) => event.id);
  const editionIdentities = (
    await client.query(
      "select id,event_id,event_date::text,distance_code from editions where event_id=any($1::int[]) order by id",
      [eventIds],
    )
  ).rows;
  const athlete = await one(
    "insert into athletes(slug,display_name) values('synthetic-5k-preservation','Synthetic 5K Preservation') returning *",
  );
  const reviewedResult = await one(
    `insert into results(edition_id,athlete_id,status,finish_time_seconds,source_url,result_details)
     values($1,$2,'finished',1999,'https://example.test/5k-source','{"archive":{"syntheticReview":true}}'::jsonb)
     returning *`,
    [editionIdentities[0].id, athlete.id],
  );
  const redirects = (
    await client.query(
      "select * from slug_redirects where entity_type='event' and entity_id=any($1::int[]) order by old_slug",
      [eventIds],
    )
  ).rows;
  const redirectedOutput = runNode("scripts/publish-uk-ireland-five-k-release.mjs", publisherEnv);
  assert.match(
    redirectedOutput,
    /published revision \d+: 65 events, 75 editions, 75 entry options/,
  );
  for (const event of renamed) {
    assert.deepEqual(await one("select * from events where id=$1", [event.id]), event);
  }
  assert.deepEqual(
    (
      await client.query(
        "select id,event_id,event_date::text,distance_code from editions where event_id=any($1::int[]) order by id",
        [eventIds],
      )
    ).rows,
    editionIdentities,
  );
  assert.deepEqual(await one("select * from athletes where id=$1", [athlete.id]), athlete);
  assert.deepEqual(
    await one("select * from results where id=$1", [reviewedResult.id]),
    reviewedResult,
  );
  assert.deepEqual(
    (
      await client.query(
        "select * from slug_redirects where entity_type='event' and entity_id=any($1::int[]) order by old_slug",
        [eventIds],
      )
    ).rows,
    redirects,
  );
  const revisionCount = await one("select count(*)::int as count from catalogue_revisions");
  assert.match(
    runNode("scripts/publish-uk-ireland-five-k-release.mjs", publisherEnv),
    /was already published; no database change needed/,
  );
  assert.deepEqual(
    await one("select count(*)::int as count from catalogue_revisions"),
    revisionCount,
  );
} finally {
  await client.end();
}

console.log(
  "Verified UK and Ireland 5K publication, corrections and idempotent repeat deployment.",
);
