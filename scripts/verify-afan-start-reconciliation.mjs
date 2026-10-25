import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { catalogueCalendarRace } = await import("../src/lib/athrecs/catalogue-calendar.ts");
const { buildCalendarEvent, calendarIcs } = await import("../src/lib/athrecs/event-calendar.ts");
const { publicCatalogueContent } = await import("../src/lib/athrecs/public-catalogue-content.ts");
const dir = "docs/fixture-reviews/afan-start-2026-10-25";
const review = JSON.parse(await readFile(`${dir}/review.json`, "utf8"));
const sourceSql = await readFile(`${dir}/publish.sql`, "utf8");
const captured = process.argv[2] ? JSON.parse(await readFile(process.argv[2], "utf8")) : null;
const { pg, sql } = await bulkFixture();
const sha = (x) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
let assertions = 0;
const check = (a, b, message) => {
  assert.deepEqual(a, b, message);
  assertions++;
};
try {
  await sql.query("set timezone='UTC'");
  // Mirror public production columns added since the core publication fixture.
  for (const [table, record] of [
    ["events", review.before_event],
    ["editions", review.before_editions[0]],
    ["edition_entry_options", review.before_options[0]],
  ]) {
    const cols = new Set(
      (
        await sql.query("select column_name from information_schema.columns where table_name=$1", [
          table,
        ])
      ).map((x) => x.column_name),
    );
    for (const [key, value] of Object.entries(record))
      if (!cols.has(key))
        await sql.query(
          `alter table ${table} add column ${key} ${typeof value === "number" ? "double precision" : typeof value === "boolean" ? "boolean" : "text"}`,
        );
    const insert = async (row) => {
      const keys = Object.keys(row);
      await sql.query(
        `insert into ${table}(${keys.join(",")}) values(${keys.map((_, i) => `$${i + 1}`).join(",")})`,
        Object.values(row),
      );
    };
    if (table === "events") await insert(review.before_event);
    if (table === "editions") for (const d of review.before_editions) await insert(d);
    if (table === "edition_entry_options") for (const o of review.before_options) await insert(o);
  }
  for (const d of review.before_distances)
    await sql.query("insert into event_distances(event_id,distance_code) values($1,$2)", [
      d.event_id,
      d.distance_code,
    ]);
  // Independent canary fixture and historic audit ensure no unrelated writes.
  await sql.query(
    "insert into events(id,slug,name,sport,country) values(900,'unrelated-held','Unrelated held race','Running','Wales')",
  );
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time) values(901,900,'2026-11-29','5K',5,'TBC',null)",
  );
  await sql.query(
    "insert into catalogue_import_batches(id,source_key,payload_hash,payload,submitted_by,status) values('historic384','historic384','historic','{}','test','published')",
  );
  await sql.query(
    "insert into catalogue_revisions(id,batch_id,published_by) values(384,'historic384','test')",
  );
  for (let i = 0; i < 19; i++)
    await sql.query(
      "insert into catalogue_change_log(revision_id,entity_type,entity_key,operation,before_json,after_json) values(384,'edition',$1,'update','{}','{}')",
      [`historic-${i}`],
    );
  await sql.query("select setval('catalogue_revisions_id_seq',384)");
  await sql.query("update catalogue_publish_state set current_revision_id=384 where id=1");
  for (const plan of review.queue) {
    const original = captured?.queue.find((x) => x.id === plan.id);
    const payload = original?.payload ?? {
      events: [
        { slug: "unrelated-held", name: "Unrelated held race", sport: "Running", country: "Wales" },
      ],
      editions: Array.from({ length: Math.max(...plan.rows.map((x) => x.row_number)) }, (_, i) => ({
        eventSlug: "unrelated-held",
        date: "2026-11-29",
        distance: `Held ${i}`,
        distanceKm: 5,
        status: "TBC",
      })),
    };
    for (const row of plan.rows) payload.editions[row.row_number - 1] = row.before;
    await sql.query(
      "insert into catalogue_import_batches(id,source_key,payload_hash,payload,submitted_by,status,validation_summary,validated_at) values($1,$2,$3,$4::jsonb,'test','ready',$5::jsonb,$6)",
      [
        plan.id,
        plan.source_key,
        plan.before_hash,
        JSON.stringify(payload),
        JSON.stringify(plan.before_validation_summary),
        plan.before_validated_at,
      ],
    );
    for (const [i, d] of payload.editions.entries())
      await sql.query(
        "insert into catalogue_staged_rows(batch_id,row_type,row_number,natural_key,payload) values($1,'edition',$2,$3,$4::jsonb)",
        [plan.id, i + 1, `${d.eventSlug}|${d.date}|${d.distance}`, JSON.stringify(d)],
      );
    for (const [i, e] of payload.events.entries())
      await sql.query(
        "insert into catalogue_staged_rows(batch_id,row_type,row_number,natural_key,payload) values($1,'event',$2,$3,$4::jsonb)",
        [plan.id, i + 1, e.slug, JSON.stringify(e)],
      );
    if (!captured) {
      plan.before_md5 = (
        await sql.query(
          "select md5(payload::text) hash from catalogue_import_batches where id=$1",
          [plan.id],
        )
      )[0].hash;
      const after = (
        await sql.query("select payload from catalogue_import_batches where id=$1", [plan.id])
      )[0].payload;
      for (const row of plan.rows) after.editions[row.row_number - 1] = row.after;
      plan.after_hash = sha(after);
    }
  }
  // Exact captured production rehearsal uses the unchanged SQL file. Synthetic
  // CI mode substitutes only queue baseline data, retaining all SQL guards.
  const statement = captured
    ? sourceSql
    : sourceSql.replace(
        /review jsonb := '.*'::jsonb;/,
        `review jsonb := '${JSON.stringify(review).replaceAll("'", "''")}'::jsonb;`,
      );
  const snapshot = async () => {
    const result = {};
    for (const table of [
      "events",
      "editions",
      "event_distances",
      "edition_entry_options",
      "catalogue_import_batches",
      "catalogue_staged_rows",
      "catalogue_revisions",
      "catalogue_change_log",
      "catalogue_publish_state",
    ])
      result[table] = await sql.query(`select * from ${table}`);
    return result;
  };
  const original = await snapshot();
  for (const [table, expected] of [
    ["events", review.before_event],
    ["editions", review.before_editions[0]],
    ["edition_entry_options", review.before_options[0]],
  ]) {
    const actual = (
      await sql.query(`select to_jsonb(x) data from ${table} x where id=$1`, [expected.id])
    )[0].data;
    check(actual, expected, `${table} rehearsal baseline matches production`);
  }
  for (const mutate of [
    "update editions set start_time='12:00' where id=108804223",
    "update catalogue_publish_state set current_revision_id=null where id=1",
    `update catalogue_import_batches set payload=payload||'{"concurrent":true}'::jsonb where id='${review.queue[0].id}'`,
    `update catalogue_staged_rows set payload=payload||'{"concurrent":true}'::jsonb where batch_id='${review.queue.at(-1).id}' and row_type='edition' and row_number=${review.queue.at(-1).rows[0].row_number}`,
    `insert into catalogue_import_batches(id,source_key,payload_hash,payload,submitted_by,status) values('concurrent-import','concurrent','x','{}','test','ready'); insert into catalogue_staged_rows(batch_id,row_type,row_number,natural_key,payload) values('concurrent-import','event',1,'rtt-afan-forest-trail-10k-5k','{}')`,
  ]) {
    await pg.exec("BEGIN");
    await pg.exec(mutate);
    await assert.rejects(
      () => pg.exec(statement),
      /Reviewed Afan baseline changed|Catalogue revision changed|query returned no rows|Queued staged row changed|Pending Afan import set changed/,
    );
    assertions++;
    await pg.exec("ROLLBACK");
    check(await snapshot(), original, "failed guard writes nothing");
  }
  await pg.exec(statement);
  const after = await snapshot();
  check(after.events, original.events, "event identity preserved");
  check(after.event_distances, original.event_distances, "distances preserved");
  check(after.edition_entry_options, original.edition_entry_options, "entry options preserved");
  check(
    after.editions.find((x) => x.id === 901),
    original.editions.find((x) => x.id === 901),
    "unverified canary held",
  );
  check(
    after.catalogue_change_log.filter((x) => x.revision_id === 384),
    original.catalogue_change_log,
    "19 original audits untouched",
  );
  check(
    after.catalogue_change_log.filter((x) => x.revision_id !== 384).length,
    2,
    "only two edition audits",
  );
  for (const plan of review.queue) {
    const before = original.catalogue_import_batches.find((x) => x.id === plan.id);
    const updated = after.catalogue_import_batches.find((x) => x.id === plan.id);
    const expected = structuredClone(before.payload);
    for (const row of plan.rows) expected.editions[row.row_number - 1] = row.after;
    check(updated.payload, expected, "only reviewed queued entries change");
    check(updated.payload_hash, sha(expected), "payload hash remains valid");
    check(updated.status, "ready", "unrelated import work remains available");
    // Run the real validator on the actual capture; it must still accept each batch.
    if (captured)
      check(
        (await publishing.validateCatalogueBatch(plan.id, sql)).status,
        "ready",
        "real queued batch validation",
      );
  }
  const beforeReplay = await snapshot();
  await pg.exec(statement);
  check(await snapshot(), beforeReplay, "repeat execution is a no-op");
  for (const d of after.editions.filter((x) => x.event_id === 3061155)) {
    check(d.start_time, "11:00", "both clocks stored");
    const input = publicCatalogueContent(
      catalogueCalendarRace(review.before_event, d, "https://www.athrecs.com"),
    );
    check(input.timeZone, "Europe/London", "local timezone");
    const ics = calendarIcs(buildCalendarEvent(input));
    assert.match(ics, /DTSTART:20261129T110000Z/);
    assertions++;
    assert.doesNotMatch(ics, /runabc|Original queued|Start checked/);
    assertions++;
  }
  // Exercise the real publisher with each reconciled Afan subset, proving the
  // old omissions cannot clear either clock after normal queued publication.
  for (const plan of review.queue) {
    const staged = await publishing.stageCatalogueBatch(
      { sourceKey: `replay-test:${plan.id}`, editions: plan.rows.map((x) => x.after) },
      "test",
      sql,
    );
    check((await publishing.validateCatalogueBatch(staged.batchId, sql)).status, "ready");
    await publishing.publishCatalogueBatch(staged.batchId, "test", sql);
    check(
      (await sql.query("select start_time from editions where event_id=3061155 order by id")).map(
        (x) => x.start_time,
      ),
      ["11:00", "11:00"],
      "real queued imports retain both clocks",
    );
  }
  console.log(
    `Afan reconciliation passed ${assertions} checks (${captured ? "exact production snapshot" : "synthetic queues"}): guards, rollback, IDs, queue scope, hashes, audit, replay and calendar.`,
  );
} finally {
  await pg.close();
}
