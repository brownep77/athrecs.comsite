#!/usr/bin/env node
// Rehearse the real publication and rollback code against disposable PostgreSQL
// in memory. Never loads the application database module or any connection URL.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as crypto from "node:crypto";
import * as util from "node:util";
import { PGlite } from "@electric-sql/pglite";
import {
  colombiaPublicationPayload,
  publishColombiaRunning,
  COLOMBIA_SOURCE_KEY,
} from "./lib/colombia-running-publication.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function loadTs(path, dependencies = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    fileName: path,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  new Function("require", "module", "exports", outputText)(
    (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected test dependency: ${name}`);
      return dependencies[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}

const data = loadTs("src/data/colombia-races.ts");
const payload = colombiaPublicationPayload(data);
const db = new PGlite({ parsers: { 20: Number, 1082: (value) => value } });
await db.waitReady;
let failEditionInsert = false;
let editionInserts = 0;
const sqlFor = (connection, inTransaction = false) => {
  const query = async (text, params = []) => {
    if (failEditionInsert && /insert\s+into\s+editions\s*\(/i.test(text)) {
      editionInserts += 1;
      if (editionInserts === 40) throw new Error("Synthetic late edition-write failure");
    }
    return (await connection.query(text, params)).rows;
  };
  const sql = async (parts, ...values) => {
    let text = parts[0];
    values.forEach((_, index) => (text += `$${index + 1}${parts[index + 1]}`));
    return query(text, values);
  };
  sql.query = query;
  // Match src/lib/db.ts: nested calls share the enclosing transaction.
  sql.transaction = (work) =>
    inTransaction ? work(sql) : db.transaction((tx) => work(sqlFor(tx, true)));
  return sql;
};
const sql = sqlFor(db);
const connection = {
  dbSource: "neon",
  getSql: async () => {
    throw new Error("The rehearsal must always use its isolated SQL override");
  },
};
const importer = loadTs("src/lib/athrecs/import.server.ts", {
  "@/lib/db": connection,
  "./results-import.server": {},
});
const publishing = loadTs("src/lib/athrecs/catalogue-publishing.server.ts", {
  "@/lib/db": connection,
  "./import.server": importer,
  "./fixture-distance-policy.ts": loadTs("src/lib/athrecs/fixture-distance-policy.ts"),
  "./catalogue-automation-policy.ts": loadTs("src/lib/athrecs/catalogue-automation-policy.ts"),
  "node:crypto": crypto,
  "node:util": util,
});

const tables = [
  "events",
  "event_distances",
  "editions",
  "edition_entry_options",
  "catalogue_import_batches",
  "catalogue_staged_rows",
  "catalogue_revisions",
  "catalogue_change_log",
  "catalogue_publish_state",
];
async function snapshot(selected = tables) {
  const state = {};
  for (const table of selected)
    state[table] = (
      await sql.query(
        `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb) as rows from ${table} t`,
      )
    )[0].rows;
  return JSON.stringify(state);
}
async function seedBaseline() {
  await db.exec(
    "truncate events,catalogue_import_batches,catalogue_publish_state restart identity cascade; insert into catalogue_publish_state(id) values(1)",
  );
  for (const event of Object.values(data.colombiaExistingEventBaselines)) {
    const fields = Object.keys(event);
    await sql.query(
      `insert into events(${fields.join(",")},source_url,featured) values(${fields.map((_, index) => `$${index + 1}`).join(",")},$${fields.length + 1},true)`,
      [...Object.values(event), `https://fixture-source.example.test/original/${event.slug}`],
    );
    await sql.query("insert into event_distances(event_id,distance_code) values($1,'Half')", [
      event.id,
    ]);
  }
  // Existing target edition has original source, notes, result link and entry
  // provider to exercise preservation in the before/after audit.
  await sql.query(
    `insert into editions(event_id,event_date,distance_code,distance_km,status,source_url,notes,results_official_url)
     values($1,'2027-04-25','Marathon',42.195,'Open','https://fixture-source.example.test/original-edition','Original source note','https://timing.example.test/results')`,
    [data.colombiaExistingEventBaselines["maraton-de-cali"].id],
  );
  await db.exec(`insert into edition_entry_options(edition_id,provider_code,provider_name,entry_url,is_verified,is_primary)
    select id,'earlier-official','Earlier official provider','https://entry.example.test/previous',true,true from editions;
    insert into events(slug,name,sport,country,source_url) values('synthetic-unrelated-event','Synthetic unrelated event','Running','England','https://fixture-source.example.test/unrelated');`);
}

async function assertRejectedUnchanged(fn, pattern, label) {
  const before = await snapshot();
  await assert.rejects(fn, pattern, label);
  assert.equal(await snapshot(), before, `${label}: rejected operation must be atomic`);
}

let failed = false;
try {
  for (const file of [
    "0002_athrecs.sql",
    "0003_full_catalogue.sql",
    "0004_edition_entry_options.sql",
    "0009_edition_result_links.sql",
    "0015_slug_redirects.sql",
    "0016_catalogue_publishing.sql",
    "0017_slug_insert_guards.sql",
    "20261012_entry_option_evidence_notes.sql",
    "20261015_event_end_evidence.sql",
  ])
    await db.exec(readFileSync(`migrations/${file}`, "utf8"));
  const groupsSchema = readFileSync("src/lib/athrecs/seed.server.ts", "utf8").match(
    /`(create table if not exists event_groups \([\s\S]+?\))`/,
  );
  assert(groupsSchema, "Use the checked-in event-groups schema for rollback dependencies");
  await db.exec(groupsSchema[1]);

  await seedBaseline();
  const contentBefore = await snapshot(tables.slice(0, 4));
  const published = await publishColombiaRunning(sql, publishing, data);
  assert.equal(published.eventsUpserted, 18);
  assert.equal(published.editionsUpserted, 52);
  assert.equal(published.withheldDistanceCount, 0);
  const [batch] = await sql.query("select * from catalogue_import_batches where source_key=$1", [
    COLOMBIA_SOURCE_KEY,
  ]);
  assert.equal(batch.status, "published");
  assert.equal(batch.validation_summary.invalidRows, 0);
  assert.equal(batch.validation_summary.withheldDistanceCount, 0);
  assert.equal((await sql`select count(*)::int n from catalogue_staged_rows`)[0].n, 70);
  const log = await sql`select * from catalogue_change_log order by id`;
  assert.equal(log.length, 70);
  assert.equal(
    log.filter((item) => item.entity_type === "event" && item.operation === "insert").length,
    15,
  );
  assert.equal(
    log.filter((item) => item.entity_type === "event" && item.operation === "update").length,
    3,
  );
  for (const expected of payload.editions) {
    const [actual] = await sql.query(
      `select ed.* from editions ed join events e on e.id=ed.event_id
       where e.slug=$1 and ed.event_date=$2::date and ed.distance_code=$3`,
      [expected.eventSlug, expected.date, expected.distance],
    );
    assert(actual);
    assert.equal(actual.source_url, expected.source);
    assert.equal(actual.distance_km, expected.distanceKm);
    assert.equal(actual.start_time, expected.startTime ?? null);
    assert.equal(actual.end_date, expected.endDate ?? null);
    assert.equal(actual.end_source_url, expected.endSourceUrl ?? null);
    assert.equal(actual.end_checked_at, expected.endCheckedAt ?? null);
    assert.equal(actual.notes, expected.notes);
  }
  for (const [slug, original] of Object.entries(data.colombiaExistingEventBaselines)) {
    const [actual] = await sql.query("select * from events where slug=$1", [slug]);
    assert.equal(actual.id, original.id);
    assert.equal(actual.featured, true, "unrequested existing featured flag survives");
    assert.equal(actual.source_url, `https://fixture-source.example.test/original/${slug}`);
    const change = log.find((item) => item.entity_type === "event" && item.entity_key === slug);
    for (const [key, value] of Object.entries(original))
      assert.equal(change.before_json.record[key], value);
    assert.equal(
      change.after_json.record.name,
      data.colombiaRaceSeries.find((item) => item.slug === slug).name,
    );
  }
  const editionChange = log.find(
    (item) => item.entity_key === "maraton-de-cali|2027-04-25|Marathon",
  );
  assert.equal(
    editionChange.before_json.record.source_url,
    "https://fixture-source.example.test/original-edition",
  );
  assert.equal(
    editionChange.before_json.entryOptions[0].provider_name,
    "Earlier official provider",
  );
  assert.equal(
    editionChange.after_json.record.results_official_url,
    "https://timing.example.test/results",
  );
  assert(
    editionChange.after_json.entryOptions.some((item) => item.provider_code === "earlier-official"),
  );

  const publishedState = await snapshot();
  const repeated = await publishColombiaRunning(sql, publishing, data);
  assert.equal(repeated.alreadyPublished, true);
  assert.equal(await snapshot(), publishedState, "repeat publication must be a true no-op");
  await publishing.rollbackCatalogueRevision(
    published.revisionId,
    "synthetic-reviewer@example.test",
    sql,
  );
  assert.equal(
    await snapshot(tables.slice(0, 4)),
    contentBefore,
    "rollback restores original metadata, editions, source evidence and entry options",
  );
  const rolledBackState = await snapshot();
  assert.equal((await publishColombiaRunning(sql, publishing, data)).alreadyPublished, true);
  assert.equal(
    await snapshot(),
    rolledBackState,
    "a deployment retry must not republish a deliberately rolled-back batch",
  );
  console.log("Colombia success, audit, provenance, idempotence and rollback rehearsal passed.");

  await seedBaseline();
  await sql`update editions set end_date='2027-04-25',end_time='13:00',end_source_url='https://fixture-source.example.test/existing-end',end_checked_at='2026-10-01' where distance_code='Marathon'`;
  await publishColombiaRunning(sql, publishing, data);
  const [preservedEnd] =
    await sql`select end_date,end_time,end_source_url,end_checked_at from editions where event_id=${data.colombiaExistingEventBaselines["maraton-de-cali"].id} and distance_code='Marathon'`;
  assert.deepEqual(
    preservedEnd,
    {
      end_date: "2027-04-25",
      end_time: "13:00",
      end_source_url: "https://fixture-source.example.test/existing-end",
      end_checked_at: "2026-10-01",
    },
    "Omitted end evidence must survive the reviewed addition",
  );

  await seedBaseline();
  await sql`update events set city='Synthetic concurrent correction' where slug='maraton-de-cali'`;
  await assertRejectedUnchanged(
    () => publishColombiaRunning(sql, publishing, data),
    /event changed since review/,
    "Concurrent existing-event metadata correction",
  );

  await seedBaseline();
  await sql`update editions set start_time='04:55' where distance_code='Marathon'`;
  await assertRejectedUnchanged(
    () => publishColombiaRunning(sql, publishing, data),
    /start changed since review/,
    "A newly recorded start must not be cleared",
  );

  await seedBaseline();
  const invalid = { ...data, colombiaRaceEditions: structuredClone(data.colombiaRaceEditions) };
  invalid.colombiaRaceEditions[0].distance = "";
  await assertRejectedUnchanged(
    () => publishColombiaRunning(sql, publishing, invalid),
    /validation failed/,
    "Invalid staged row",
  );
  await seedBaseline();
  failEditionInsert = true;
  editionInserts = 0;
  await assertRejectedUnchanged(
    () => publishColombiaRunning(sql, publishing, data),
    /Synthetic late edition-write failure/,
    "Late import failure",
  );
  failEditionInsert = false;
  console.log(
    "Colombia metadata/start guard, invalid batch and late-write rollback checks passed.",
  );

  // A source-supported time with seconds cannot be silently rounded down.
  await seedBaseline();
  const confirmed = payload.editions.find(
    (item) => item.startTime && data.colombiaExistingEventBaselines[item.eventSlug],
  );
  const confirmedEventId = data.colombiaExistingEventBaselines[confirmed.eventSlug].id;
  const guardFailures = [];
  await sql.query(
    "insert into editions(event_id,event_date,distance_code,distance_km,status,start_time) values($1,$2,$3,$4,'Open',$5)",
    [
      confirmedEventId,
      confirmed.date,
      confirmed.distance,
      confirmed.distanceKm,
      `${confirmed.startTime}:30`,
    ],
  );
  try {
    await assertRejectedUnchanged(
      () => publishColombiaRunning(sql, publishing, data),
      /start changed since review/,
      "A changed second-precision start",
    );
  } catch (error) {
    guardFailures.push(error.message);
  }

  // PGlite has a single backend: inject an absent-row insertion at the
  // validation/publication boundary to model the state seen after a separate
  // importer wins that race. This is a state-transition test, not a claim of
  // multi-session lock-contention coverage.
  await seedBaseline();
  const boundaryPublishing = {
    ...publishing,
    validateCatalogueBatch: async (batchId, tx) => {
      const result = await publishing.validateCatalogueBatch(batchId, tx);
      await tx.query(
        "insert into editions(event_id,event_date,distance_code,distance_km,status,start_time) values($1,$2,$3,$4,'Open','23:59')",
        [confirmedEventId, confirmed.date, confirmed.distance, confirmed.distanceKm],
      );
      return result;
    },
  };
  try {
    await assertRejectedUnchanged(
      () => publishColombiaRunning(sql, boundaryPublishing, data),
      /start.*changed|cannot.*replace|changed.*start/i,
      "An edition inserted after the initial checks",
    );
  } catch (error) {
    guardFailures.push(error.message);
  }

  await seedBaseline();
  const newEvent = payload.events.find((item) => !data.colombiaExistingEventBaselines[item.slug]);
  await sql.query(
    "insert into events(slug,name,sport,country,city,website) values($1,'Synthetic conflicting identity','Running','England','Norwich','https://organiser.example.test')",
    [newEvent.slug],
  );
  try {
    await assertRejectedUnchanged(
      () => publishColombiaRunning(sql, publishing, data),
      /event.*changed|unexpected.*event|existing.*event|identity/i,
      "A previously absent event slug now belongs to another identity",
    );
  } catch (error) {
    guardFailures.push(error.message);
  }
  await seedBaseline();
  const lateIdentityPublishing = {
    ...publishing,
    validateCatalogueBatch: async (batchId, tx) => {
      const result = await publishing.validateCatalogueBatch(batchId, tx);
      await tx.query(
        "insert into events(slug,name,sport,country,city,website) values($1,'Synthetic late conflicting identity','Running','England','Norwich','https://organiser.example.test')",
        [newEvent.slug],
      );
      return result;
    },
  };
  try {
    await assertRejectedUnchanged(
      () => publishColombiaRunning(sql, lateIdentityPublishing, data),
      /event.*changed|unexpected.*event|existing.*event|identity/i,
      "A conflicting identity inserted after validation",
    );
  } catch (error) {
    guardFailures.push(error.message);
  }
  assert.equal(guardFailures.length, 0, guardFailures.join("\n"));
  console.log(
    "Colombia second-precision, publication-boundary and new-event identity guards passed.",
  );
} catch (error) {
  console.error(error.stack ?? error.message);
  failed = true;
} finally {
  await db.close();
}
if (failed) process.exitCode = 1;
