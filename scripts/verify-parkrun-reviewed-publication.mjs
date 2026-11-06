#!/usr/bin/env node
// Exercise real publication/import code using synthetic fixtures in disposable
// PostgreSQL. This test never loads application credentials or a network DB.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as crypto from "node:crypto";
import * as util from "node:util";
import { PGlite } from "@electric-sql/pglite";
import {
  PARKRUN_EVENT_METADATA_FIELDS,
  publishReviewedParkrunFixtures,
} from "./lib/parkrun-reviewed-publication.mjs";

const ts = createRequire(import.meta.url)("typescript");
function loadTs(path, dependencies = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    fileName: path,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  new Function("require", "module", "exports", outputText)(
    (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected rehearsal dependency: ${name}`);
      return dependencies[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}

const pg = new PGlite({ parsers: { 20: Number, 1082: (value) => value } });
await pg.waitReady;
let failEditionInsert = 0;
function adapter(connection, inTransaction = false) {
  const query = async (statement, values = []) => {
    if (
      failEditionInsert &&
      /insert\s+into\s+editions\s*\(/i.test(statement) &&
      --failEditionInsert === 0
    )
      throw new Error("Synthetic late parkrun import failure");
    return (await connection.query(statement, values)).rows;
  };
  const sql = async (parts, ...values) =>
    query(
      parts.reduce((text, part, index) => text + (index ? `$${index}` : "") + part, ""),
      values,
    );
  sql.query = query;
  sql.transaction = (work) =>
    inTransaction ? work(sql) : pg.transaction((tx) => work(adapter(tx, true)));
  return sql;
}
const sql = adapter(pg);
const isolatedConnection = {
  dbSource: "neon",
  getSql: async () => {
    throw new Error("Only the isolated SQL override is allowed");
  },
};
const importer = loadTs("src/lib/athrecs/import.server.ts", {
  "@/lib/db": isolatedConnection,
  "./results-import.server": {},
});
const publishing = loadTs("src/lib/athrecs/catalogue-publishing.server.ts", {
  "@/lib/db": isolatedConnection,
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
  "slug_redirects",
  "catalogue_import_batches",
  "catalogue_staged_rows",
  "catalogue_revisions",
  "catalogue_change_log",
  "catalogue_publish_state",
];
async function snapshot(selected = tables) {
  const result = {};
  for (const table of selected)
    result[table] = (
      await sql.query(
        `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from ${table} t`,
      )
    )[0].rows;
  return JSON.stringify(result);
}
const event = (slug, name, extra = {}) => ({
  slug,
  name,
  sport: "Parkrun",
  country: "England",
  county: "",
  city: "",
  area: "",
  surface: "",
  summary: "A free community parkrun.",
  description: "Walk, jog, run or volunteer.",
  organiser: "parkrun",
  website: `https://www.parkrun.org.uk/${slug.replace(/-parkrun$/, "")}/`,
  distances: ["5K"],
  ...extra,
});
const weekly = (fromDate, weekday = 6, distance = "5K", extra = {}) => ({
  fromDate,
  weekday,
  startTime: "09:00",
  distance,
  distanceKm: distance === "5K" ? 5 : 2,
  sourceUrl: "https://organiser.example.test/weekly-programme",
  ...extra,
});
async function seed() {
  await pg.exec(
    "truncate events,catalogue_import_batches,catalogue_publish_state,slug_redirects restart identity cascade; insert into catalogue_publish_state(id) values(1)",
  );
  await importer.applyImportBundle(
    {
      events: [
        event("synthetic-existing-parkrun", "Synthetic Existing parkrun"),
        event("synthetic-correction-parkrun", "Synthetic Correction parkrun"),
        event("synthetic-unrelated", "Synthetic Unrelated", {
          sport: "Running",
          distances: ["10K"],
        }),
      ],
    },
    { sqlOverride: sql },
  );
  await sql.query(
    "update events set source_url='https://source.example.test/original',featured=true where slug='synthetic-existing-parkrun'",
  );
  const rows = await sql.query("select * from events order by id");
  const existing = rows.find((row) => row.slug === "synthetic-existing-parkrun");
  const correction = rows.find((row) => row.slug === "synthetic-correction-parkrun");
  const unrelated = rows.find((row) => row.slug === "synthetic-unrelated");
  const insert = async (id, date, code, km, start, status = "Open") =>
    (
      await sql.query(
        `insert into editions(event_id,event_date,distance_code,distance_km,start_time,status,source_url,notes,entry_url,end_date,end_time,end_source_url,end_checked_at,results_official_url,results_permission_note)
     values($1,$2::date,$3,$4,$5,$6,'https://source.example.test/original-edition','Original notes: keep me','https://entry.example.test/original',$2::date,'12:00','https://source.example.test/end','2026-10-01','https://timing.example.test/results','Existing rights evidence') returning id`,
        [id, date, code, km, start, status],
      )
    )[0].id;
  await insert(existing.id, "2026-11-07", "5K", 5, "09:15", "Cancelled");
  await insert(existing.id, "2026-11-14", "Other", 0, null, "TBC");
  const changedId = await insert(correction.id, "2026-11-07", "5K", 5, "08:00:00");
  await insert(correction.id, "2026-11-14", "5K", 5, "07:30");
  await insert(correction.id, "2026-11-21", "5K", 5, "08:00", "Cancelled");
  await insert(correction.id, "2026-11-28", "2K", 2, "08:00");
  await insert(correction.id, "2026-12-05", "5K", 4, "08:00");
  await insert(correction.id, "2026-11-06", "5K", 5, "08:00");
  await insert(correction.id, "2028-01-01", "5K", 5, "08:00");
  await insert(unrelated.id, "2026-11-07", "10K", 10, "10:20");
  // No official option: passing the edition entry_url back into the importer
  // would wrongly create one, so provider preservation is tested explicitly.
  await sql.query(
    `insert into edition_entry_options(edition_id,provider_code,provider_name,entry_url,entry_type,status,price_amount,price_currency,source_url,is_verified,is_primary,notes)
    values($1,'historic-provider','Historic provider','https://entry.example.test/provider','third_party','open',7.5,'GBP','https://source.example.test/entry',true,false,'Preserve private provider evidence')`,
    [changedId],
  );
  const expected = Object.fromEntries(
    PARKRUN_EVENT_METADATA_FIELDS.map((field) => [field, existing[field] ?? null]),
  );
  expected.source_url = existing.source_url;
  expected.distances = ["5K"];
  const review = {
    sourceKey: "staff:synthetic-parkrun-reviewed:v1",
    sourceUrl: "https://source.example.test/review",
    checkedAt: "2026-11-06",
    fromDate: "2026-11-07",
    toDate: "2026-12-06",
    events: [
      {
        event: event(existing.slug, existing.name, { county: "Reviewed county" }),
        expected,
        isNew: false,
        schedule: weekly("2026-11-07"),
      },
      {
        event: event("synthetic-junior-parkrun", "Synthetic junior parkrun", { distances: ["2K"] }),
        isNew: true,
        schedule: weekly("2026-11-22", 0, "2K"),
      },
      {
        event: event("synthetic-seasonal-parkrun", "Synthetic Seasonal parkrun"),
        isNew: true,
        schedule: weekly("2026-11-21", 6, "5K", {
          seasonalStartTimes: [{ months: [12, 1, 2], startTime: "08:00" }],
        }),
      },
      {
        event: event("synthetic-venue-only-parkrun", "Synthetic Venue Only parkrun", {
          distances: [],
        }),
        isNew: true,
        reviewEvidence: { status: "Official map identity only; timetable held." },
      },
      {
        event: event("synthetic-later-parkrun", "Synthetic Later parkrun"),
        isNew: true,
        schedule: weekly("2026-12-12"),
      },
    ],
    startCorrections: [
      {
        slug: correction.slug,
        expectedStartTime: "08:00",
        startTime: "07:30",
        distance: "5K",
        distanceKm: 5,
        sourceUrl: "https://organiser.example.test/reviewed-start",
        fromDate: "2026-11-07",
        toDate: "2027-12-31",
      },
    ],
  };
  return { review, existing, correction, unrelated, changedId };
}
async function rejectsUnchanged(work, pattern) {
  const before = await snapshot();
  await assert.rejects(work, pattern);
  assert.equal(
    await snapshot(),
    before,
    "Rejected publication must roll back every content and audit write",
  );
}

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
    await pg.exec(readFileSync(`migrations/${file}`, "utf8"));
  const groupsSchema = readFileSync("src/lib/athrecs/seed.server.ts", "utf8").match(
    /`(create table if not exists event_groups \([\s\S]+?\))`/,
  );
  await pg.exec(groupsSchema[1]);

  let fixture = await seed();
  const contentBefore = await snapshot(tables.slice(0, 5));
  const originalEditions = await sql.query("select * from editions order by id");
  const originalOptions = await sql.query("select * from edition_entry_options order by id");
  const result = await publishReviewedParkrunFixtures(sql, publishing, fixture.review);
  assert.equal(result.addedEvents, 4);
  assert.equal(result.updatedEvents, 1);
  assert.equal(result.addedEditions, 9);
  assert.equal(result.correctedStarts, 2);
  assert.equal(result.alreadyCorrectStarts, 1);
  for (const original of originalEditions) {
    const [after] = await sql.query("select * from editions where id=$1", [original.id]);
    const changed =
      original.event_id === fixture.correction.id &&
      ["2026-11-07", "2026-11-21"].includes(original.event_date);
    assert.deepEqual(after, { ...original, start_time: changed ? "07:30" : original.start_time });
  }
  assert.deepEqual(
    await sql.query("select * from edition_entry_options order by id"),
    originalOptions,
  );
  const [metadata] = await sql.query("select * from events where id=$1", [fixture.existing.id]);
  assert.equal(metadata.county, "Reviewed county");
  assert.equal(metadata.featured, true);
  assert.equal(metadata.source_url, fixture.existing.source_url);
  const schedules = await sql.query(
    "select e.slug,d.event_date::text as date,d.start_time from editions d join events e on e.id=d.event_id where e.slug like 'synthetic-%' order by e.slug,d.event_date",
  );
  assert.deepEqual(
    schedules.filter((row) => row.slug === "synthetic-junior-parkrun").map((row) => row.date),
    ["2026-11-22", "2026-11-29", "2026-12-06"],
  );
  assert.deepEqual(
    schedules
      .filter((row) => row.slug === "synthetic-seasonal-parkrun")
      .map((row) => [row.date, row.start_time]),
    [
      ["2026-11-21", "09:00"],
      ["2026-11-28", "09:00"],
      ["2026-12-05", "08:00"],
    ],
  );
  assert.equal(
    schedules.filter((row) =>
      ["synthetic-venue-only-parkrun", "synthetic-later-parkrun"].includes(row.slug),
    ).length,
    0,
  );
  assert.equal(
    (
      await sql.query(
        "select count(*)::int n from event_distances d join events e on e.id=d.event_id where e.slug='synthetic-venue-only-parkrun'",
      )
    )[0].n,
    0,
  );
  const [batch] = await sql.query("select * from catalogue_import_batches where id=$1", [
    result.batchId,
  ]);
  assert.equal(batch.status, "published");
  assert.equal(
    batch.payload.editions.find((row) => row.eventSlug === fixture.correction.slug).reviewEvidence
      .sourceUrl,
    fixture.review.startCorrections[0].sourceUrl,
  );
  assert(
    batch.payload.events
      .find((row) => row.slug === "synthetic-venue-only-parkrun")
      .reviewEvidence.review.status.includes("timetable held"),
  );
  const published = await snapshot();
  assert.equal(
    (await publishReviewedParkrunFixtures(sql, publishing, fixture.review)).alreadyPublished,
    true,
  );
  assert.equal(await snapshot(), published, "Completed-source retry must be a true no-op");
  await publishing.rollbackCatalogueRevision(
    result.revisionId,
    "synthetic-reviewer@example.test",
    sql,
  );
  assert.equal(
    await snapshot(tables.slice(0, 5)),
    contentBefore,
    "Rollback restores fixtures, metadata, options and provenance",
  );
  const rolledBack = await snapshot();
  assert.equal(
    (await publishReviewedParkrunFixtures(sql, publishing, fixture.review)).alreadyPublished,
    true,
  );
  assert.equal(await snapshot(), rolledBack, "A rolled-back source key must stay rolled back");

  fixture = await seed();
  const collision = structuredClone(fixture.review);
  collision.events[1].event.website =
    "http://parkrun.org.uk/synthetic-existing/course/?utm_source=test#route";
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, collision),
    /Duplicate parkrun identity/,
  );
  const nameCollision = structuredClone(fixture.review);
  nameCollision.events[1].event.name = "Synthetic EXISTING ParkRun!";
  nameCollision.events[1].event.country = "United Kingdom";
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, nameCollision),
    /Duplicate parkrun identity/,
  );
  await sql.query(
    "update events set source_url='https://www.parkrun.org.uk/synthetic-junior/results/' where id=$1",
    [fixture.correction.id],
  );
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, fixture.review),
    /Duplicate parkrun identity/,
  );

  fixture = await seed();
  await sql.query(
    "insert into slug_redirects(entity_type,entity_id,old_slug,current_slug) values('event',$1,'synthetic-junior-parkrun',$2)",
    [fixture.existing.id, fixture.existing.slug],
  );
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, fixture.review),
    /historic alias/,
  );
  fixture = await seed();
  await sql.query("update events set city='Concurrent city edit' where id=$1", [
    fixture.existing.id,
  ]);
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, fixture.review),
    /metadata changed/,
  );
  for (const changedStart of ["07:45", "08:00:30", null]) {
    fixture = await seed();
    await sql.query("update editions set start_time=$1 where id=$2", [
      changedStart,
      fixture.changedId,
    ]);
    await rejectsUnchanged(
      () => publishReviewedParkrunFixtures(sql, publishing, fixture.review),
      /start changed/,
    );
  }

  // PGlite has one backend. Inject state changes at boundaries to exercise
  // rechecks; this is not a multi-session lock-contention claim.
  fixture = await seed();
  const lateStart = {
    ...publishing,
    validateCatalogueBatch: async (id, tx) => {
      const validation = await publishing.validateCatalogueBatch(id, tx);
      await tx.query("update editions set start_time='07:45' where id=$1", [fixture.changedId]);
      return validation;
    },
  };
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, lateStart, fixture.review),
    /catalogue changed after review/,
  );
  fixture = await seed();
  const lateIdentity = {
    ...publishing,
    validateCatalogueBatch: async (id, tx) => {
      const validation = await publishing.validateCatalogueBatch(id, tx);
      await tx.query(
        "insert into events(slug,name,sport,country,website) values('synthetic-late-alias','Another identity','Parkrun','England','http://parkrun.org.uk/synthetic-junior/')",
      );
      return validation;
    },
  };
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, lateIdentity, fixture.review),
    /Duplicate parkrun identity/,
  );
  fixture = await seed();
  const lateEdition = {
    ...publishing,
    publishCatalogueBatch: async (id, by, tx, options) => {
      await tx.query(
        "insert into editions(event_id,event_date,distance_code,distance_km,status,start_time) values($1,'2026-11-21','5K',5,'Open','23:59')",
        [fixture.existing.id],
      );
      return publishing.publishCatalogueBatch(id, by, tx, options);
    },
  };
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, lateEdition, fixture.review),
    /New parkrun edition changed/,
  );
  fixture = await seed();
  failEditionInsert = 4;
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, fixture.review),
    /Synthetic late parkrun import failure/,
  );
  failEditionInsert = 0;

  fixture = await seed();
  const invalidSeason = structuredClone(fixture.review);
  invalidSeason.events[2].schedule.seasonalStartTimes.push({ months: [12], startTime: "07:00" });
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, invalidSeason),
    /Overlapping or invalid seasonal/,
  );
  const invalidCorrection = structuredClone(fixture.review);
  invalidCorrection.startCorrections[0].distance = "2K";
  await rejectsUnchanged(
    () => publishReviewedParkrunFixtures(sql, publishing, invalidCorrection),
    /Invalid or repeated parkrun start correction/,
  );

  // The narrow explicit-empty change must preserve omitted legacy behavior and
  // never delete an existing distance association.
  const { distances: _omitted, ...omitted } = event(
    "synthetic-omitted-parkrun",
    "Synthetic Omitted parkrun",
  );
  await importer.applyImportBundle(
    {
      events: [
        omitted,
        event("synthetic-empty-running", "Synthetic Empty Running", {
          sport: "Running",
          distances: [],
        }),
        event(fixture.existing.slug, fixture.existing.name, { distances: [] }),
      ],
    },
    { sqlOverride: sql, preserveExistingEvents: true },
  );
  const distanceRows = await sql.query(
    "select e.slug,d.distance_code from events e join event_distances d on d.event_id=e.id order by e.slug,d.distance_code",
  );
  assert(distanceRows.some((row) => row.slug === omitted.slug && row.distance_code === "Other"));
  assert(
    distanceRows.some(
      (row) => row.slug === "synthetic-empty-running" && row.distance_code === "Other",
    ),
  );
  assert(
    distanceRows.some((row) => row.slug === fixture.existing.slug && row.distance_code === "5K"),
  );
  console.log(
    "Reviewed parkrun publication: future launches, seasonal schedules, venue-only records, exact start corrections, preserved evidence, canonical/concurrent guards, atomic rollback and retry idempotence passed.",
  );
} finally {
  await pg.close();
}
