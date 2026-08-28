#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import pg from "pg";

import {
  prominentUkIrelandEditions,
  prominentUkIrelandExpectedNewSlugs,
} from "../src/data/uk-ireland-prominent-races-2026-2027.ts";

const SOURCE_KEY = "athrecs-code:uk-ireland-prominent-races:2026-08-27";
const EXISTING_SLUGS = [
  "dingle-marathon-half-2026",
  "connemara-international-marathon",
  "the-village-run-5k-2026",
];
const allSlugs = [...prominentUkIrelandExpectedNewSlugs, ...EXISTING_SLUGS];
const existingEditionKeys = [
  "dingle-marathon-half-2026|2026-09-05|Half",
  "connemara-international-marathon|2027-04-25|Marathon",
  "the-village-run-5k-2026|2026-09-27|5K",
];
const allEditionKeys = [
  ...prominentUkIrelandEditions.map(
    (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`,
  ),
  ...existingEditionKeys,
];

assert(process.env.DATABASE_URL?.trim(), "DATABASE_URL is required for publication verification");
assert.equal(allSlugs.length, 32, "Publication event payload count changed");
assert.equal(allEditionKeys.length, 54, "Publication edition payload count changed");
assert.equal(new Set(allEditionKeys).size, allEditionKeys.length, "Publication edition keys are not unique");

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
const firstOutput = runNode("scripts/publish-uk-ireland-prominent-races.mjs", publisherEnv);
assert.match(firstOutput, /published revision \d+: 32 events, 54 editions, 53 entry options/);

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

async function scalar(query, values = []) {
  const result = await client.query(query, values);
  return result.rows[0];
}

try {
  const batch = await scalar(
    `select id, status, publish_summary
     from catalogue_import_batches
     where source_key = $1
     order by submitted_at desc
     limit 1`,
    [SOURCE_KEY],
  );
  assert(batch, "Published catalogue batch was not recorded");
  assert.equal(batch.status, "published", "Catalogue batch did not reach published status");
  assert.equal(batch.publish_summary.eventsUpserted, 32);
  assert.equal(batch.publish_summary.editionsUpserted, 54);
  assert.equal(batch.publish_summary.entryOptionsUpserted, 53);

  const eventCount = await scalar(
    `select count(*)::int as count
     from events
     where slug = any($1::text[])`,
    [allSlugs],
  );
  assert.equal(eventCount.count, 32, "Not every reviewed event was upserted");

  const editionCount = await scalar(
    `select count(*)::int as count
     from editions ed
     join events ev on ev.id = ed.event_id
     where (ev.slug || '|' || ed.event_date::text || '|' || ed.distance_code)
       = any($1::text[])`,
    [allEditionKeys],
  );
  assert.equal(editionCount.count, 54, "Not every reviewed edition was upserted");

  const entryOptionCount = await scalar(
    `select count(*)::int as count
     from edition_entry_options eo
     join editions ed on ed.id = eo.edition_id
     join events ev on ev.id = ed.event_id
     where (ev.slug || '|' || ed.event_date::text || '|' || ed.distance_code)
       = any($1::text[])`,
    [allEditionKeys],
  );
  assert.equal(entryOptionCount.count, 53, "Verified entry-option count changed");

  const portadown = await scalar(
    `select ed.status, ed.distance_code, ed.distance_km, ed.entry_url
     from editions ed
     join events ev on ev.id = ed.event_id
     where ev.slug = 'portadown-running-festival'
       and ed.event_date = date '2027-03-14'`,
  );
  assert.equal(portadown.status, "TBC");
  assert.equal(portadown.distance_code, "Unspecified");
  assert.equal(Number(portadown.distance_km), 0);
  assert.equal(portadown.entry_url, null);

  const seaton = await scalar(
    `select ed.status, ed.entry_url, eo.status as entry_status, eo.is_verified
     from editions ed
     join events ev on ev.id = ed.event_id
     left join edition_entry_options eo on eo.edition_id = ed.id and eo.is_primary
     where ev.slug = 'seaton-classic-10k'
       and ed.event_date = date '2026-09-26'
       and ed.distance_code = '10K'`,
  );
  assert.equal(seaton.status, "TBC");
  assert.equal(seaton.entry_url, "https://athleticsni.org/Fixtures/Road-Running");
  assert.equal(seaton.entry_status, "unknown");
  assert.equal(seaton.is_verified, true);

  const enrichedDistances = await client.query(
    `select ev.slug, array_agg(ed.distance_code order by ed.distance_code) as distances
     from editions ed
     join events ev on ev.id = ed.event_id
     where ev.slug = any($1::text[])
     group by ev.slug
     order by ev.slug`,
    [EXISTING_SLUGS],
  );
  const distanceMap = new Map(enrichedDistances.rows.map((row) => [row.slug, row.distances]));
  assert.deepEqual(distanceMap.get("dingle-marathon-half-2026"), ["Half", "Marathon"]);
  assert.deepEqual(distanceMap.get("connemara-international-marathon"), ["Half", "Marathon", "Ultra"]);
  assert.deepEqual(distanceMap.get("the-village-run-5k-2026"), [
    "10K",
    "3/4 Marathon",
    "5K",
    "Half",
  ]);

  const revisionBefore = await scalar(
    `select r.id, s.current_revision_id
     from catalogue_revisions r
     join catalogue_publish_state s on s.id = 1
     where r.batch_id = $1`,
    [batch.id],
  );
  assert.equal(String(revisionBefore.id), String(revisionBefore.current_revision_id));

  const secondOutput = runNode("scripts/publish-uk-ireland-prominent-races.mjs", publisherEnv);
  assert.match(secondOutput, /was already published; no database change needed/);

  const revisionAfter = await scalar(
    `select count(*)::int as count, max(id)::text as revision_id
     from catalogue_revisions
     where batch_id = $1`,
    [batch.id],
  );
  assert.equal(revisionAfter.count, 1, "Repeat deployment created another revision");
  assert.equal(revisionAfter.revision_id, String(revisionBefore.id));
} finally {
  await client.end();
}

console.log(
  "Verified production publication: 32 events, 54 editions and 53 entry options; repeat deployment is idempotent.",
);
