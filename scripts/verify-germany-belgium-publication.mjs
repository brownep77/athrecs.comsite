#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import pg from "pg";

import {
  germanyEnduranceRaceEditions,
  germanyEnduranceRaceSeries,
} from "../src/data/germany-endurance-races.ts";
import {
  belgiumEliteYouthCompetitionEditions,
  belgiumEliteYouthCompetitionSeries,
} from "../src/data/belgium-elite-youth-competitions.ts";

const SOURCE_KEYS = [
  "athrecs-code:germany-endurance-calendar:2026-08-28",
  "athrecs-code:belgium-restricted-competitions:a:2026-08-28",
  "athrecs-code:belgium-restricted-competitions:b:2026-08-28",
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
  assert.equal(result.status, 0, `${script} failed with exit code ${result.status}\n${output}`);
  return output;
}

runNode("scripts/migrate.mjs");
const publisherEnv = {
  VERCEL_ENV: "production",
  VERCEL_GIT_COMMIT_REF: "main",
};
const firstOutput = runNode("scripts/publish-germany-belgium-catalogues.mjs", publisherEnv);
assert.match(firstOutput, /published germany-endurance revision \d+:/);
assert.equal(
  (firstOutput.match(/published belgium-restricted-[ab] revision \d+:/g) ?? []).length,
  2,
  "Both Belgian catalogue batches must publish",
);

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
  assert.equal(batches.rows.length, 3, "All three reviewed catalogue batches must be recorded");
  const bySource = new Map(batches.rows.map((batch) => [batch.source_key, batch]));

  const germanyBatch = bySource.get(SOURCE_KEYS[0]);
  assert.equal(germanyBatch?.status, "published");
  assert.equal(germanyBatch.publish_summary.eventsUpserted, 38);
  assert.equal(germanyBatch.publish_summary.editionsUpserted, 150);
  assert(
    germanyBatch.publish_summary.entryOptionsUpserted >= 150,
    "Every German edition requires a verified official entry or information option",
  );

  for (const sourceKey of SOURCE_KEYS.slice(1)) {
    const batch = bySource.get(sourceKey);
    assert.equal(batch?.status, "published");
    assert.equal(batch.publish_summary.eventsUpserted, 50);
    assert.equal(batch.publish_summary.editionsUpserted, 50);
    assert.equal(
      batch.publish_summary.entryOptionsUpserted,
      0,
      "Restricted Belgian competitions must not receive public entry options",
    );
  }

  const germanySlugs = germanyEnduranceRaceSeries.map((series) => series.slug);
  const belgiumSlugs = belgiumEliteYouthCompetitionSeries.map((series) => series.slug);
  assert.equal(new Set(germanySlugs).size, 38);
  assert.equal(new Set(belgiumSlugs).size, 100);

  const germanyCounts = await one(
    `select
       count(distinct ev.id)::int as events,
       count(ed.id)::int as editions,
       count(distinct case when eo.is_verified and eo.is_primary then ed.id end)::int as verified_primary_editions
     from events ev
     left join editions ed on ed.event_id = ev.id
     left join edition_entry_options eo on eo.edition_id = ed.id
     where ev.slug = any($1::text[])`,
    [germanySlugs],
  );
  assert.equal(germanyCounts.events, germanyEnduranceRaceSeries.length);
  assert.equal(germanyCounts.editions, germanyEnduranceRaceEditions.length);
  assert.equal(
    germanyCounts.verified_primary_editions,
    germanyEnduranceRaceEditions.length,
    "Every German distance edition must retain a verified primary official option",
  );

  const germanySports = await client.query(
    `select sport, count(*)::int as count
     from events
     where slug = any($1::text[])
     group by sport
     order by sport`,
    [germanySlugs],
  );
  const expectedSports = Object.entries(
    Object.groupBy(germanyEnduranceRaceSeries, (series) => series.sport),
  )
    .map(([sport, rows]) => ({ sport, count: rows.length }))
    .sort((left, right) => left.sport.localeCompare(right.sport));
  assert.deepEqual(germanySports.rows, expectedSports, "German endurance sport split changed");

  const belgiumCounts = await one(
    `select
       count(distinct ev.id)::int as events,
       count(ed.id)::int as editions,
       count(eo.id)::int as entry_options,
       count(*) filter (
         where ed.notes ~* 'not a public-entry race|federation licence|licensed competition categories|published youth/development age classes'
       )::int as restricted_notes
     from events ev
     left join editions ed on ed.event_id = ev.id
     left join edition_entry_options eo on eo.edition_id = ed.id
     where ev.slug = any($1::text[])`,
    [belgiumSlugs],
  );
  assert.equal(belgiumCounts.events, belgiumEliteYouthCompetitionSeries.length);
  assert.equal(belgiumCounts.editions, belgiumEliteYouthCompetitionEditions.length);
  assert.equal(belgiumCounts.entry_options, 0);
  assert.equal(
    belgiumCounts.restricted_notes,
    belgiumEliteYouthCompetitionEditions.length,
    "Every Belgian restricted edition must explain its entry restriction",
  );

  const pairedRaces = await one(
    `select count(*)::int as count
     from events
     where slug = any($1::text[])`,
    [["be-uci-omloop-nieuwsblad-men", "be-uci-omloop-nieuwsblad-women"]],
  );
  assert.equal(pairedRaces.count, 2, "Men's and women's Omloop races must remain separate");

  const berlin = await one(
    `select exists(
       select 1
       from events ev
       join editions ed on ed.event_id = ev.id
       where ev.slug = 'berlin-marathon'
         and ed.event_date = date '2026-09-27'
         and ed.distance_code = 'Marathon'
     ) as present`,
  );
  assert.equal(berlin.present, true, "The existing BMW BERLIN-MARATHON record disappeared");

  const ironman = await one(
    `select count(*)::int as count
     from events ev
     join editions ed on ed.event_id = ev.id
     where (ev.slug || '|' || ed.event_date::text || '|' || ed.distance_code)
       = any($1::text[])`,
    [[
      "ironman-703-erkner|2026-09-13|70.3",
      "ironman-703-kraichgau|2027-05-23|70.3",
    ]],
  );
  assert.equal(ironman.count, 2, "Existing German IRONMAN 70.3 fixtures disappeared");

  const revisionsBefore = await one(
    `select count(*)::int as count, max(id)::text as max_id
     from catalogue_revisions
     where batch_id = any($1::text[])`,
    [batches.rows.map((batch) => batch.id)],
  );
  assert.equal(revisionsBefore.count, 3, "Expected one revision per reviewed batch");

  const secondOutput = runNode("scripts/publish-germany-belgium-catalogues.mjs", publisherEnv);
  assert.equal(
    (secondOutput.match(/was already published; no database change needed/g) ?? []).length,
    3,
    "Repeat publication did not reuse all three published batches",
  );
  const revisionsAfter = await one(
    `select count(*)::int as count, max(id)::text as max_id
     from catalogue_revisions
     where batch_id = any($1::text[])`,
    [batches.rows.map((batch) => batch.id)],
  );
  assert.equal(revisionsAfter.count, revisionsBefore.count);
  assert.equal(revisionsAfter.max_id, revisionsBefore.max_id);
} finally {
  await client.end();
}

console.log(
  "Verified Germany and Belgium catalogue publication, restricted-entry handling and idempotent repeat deployment.",
);
