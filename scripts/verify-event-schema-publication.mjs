import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import {
  publishEventSchemaCorrections,
  publishEventOrganiserCorrections,
  publishEventPublicNotes,
} from "./lib/event-schema-corrections.mjs";
import { sportsEventJsonLd } from "../src/lib/athrecs/seo.ts";
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { applyImportBundle } = await import("../src/lib/athrecs/import.server.ts");
const { pg, sql } = await bulkFixture();
try {
  await sql.query("alter table editions add column if not exists start_time text");
  for (const file of ["20261012_entry_option_evidence_notes", "20261015_event_end_evidence"]) {
    const migration = await readFile(`migrations/${file}.sql`, "utf8");
    await pg.exec(migration);
    await pg.exec(migration);
  }
  await sql.query(
    "insert into events(id,slug,name,sport,country,organiser,website) values(901001,'synthetic-schema-race','Synthetic Race','Running','England','','https://example.org/source')",
  );
  await sql.query("insert into event_distances(event_id,distance_code) values(901001,'5K')");
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values(901001,901001,'2027-05-09','5K',5,'Open','07:30','https://example.org/source','Original evidence')",
  );
  await sql.query(
    "insert into edition_entry_options(edition_id,provider_code,provider_name,entry_url,entry_type,status,is_verified,checked_at,notes) values(901001,'existing','Existing option','https://example.org/entry','official','unknown',false,'2026-10-01','Keep original option')",
  );
  const beforeEvent = (await sql.query("select * from events where id=901001"))[0];
  const beforeEdition = (await sql.query("select * from editions where id=901001"))[0];
  const beforeOptions = await sql.query(
    "select * from edition_entry_options where edition_id=901001",
  );
  const correction = {
    slug: "synthetic-schema-race",
    expectedWebsite: "https://example.org/source",
    organiser: "Example Club",
    website: "https://example.org/",
    sourceUrl: "https://example.org/source",
    note: "Source checked 15 October 2026",
    publicNote: "Official programme: 9 May 2027, 07:30–10:00 local time.",
    editions: [
      {
        date: "2027-05-09",
        distance: "5K",
        expectedStart: "07:30",
        expectedStatus: "Open",
        endDate: "2027-05-09",
        endTime: "10:00",
        endSourceUrl: "https://example.org/source",
        endCheckedAt: "2026-10-15",
      },
    ],
  };
  for (const patch of [
    { endDate: "2027-02-29" },
    { endDate: "2027-05-08" },
    { endTime: "25:00" },
    { endTime: "06:30" },
    { endSourceUrl: "" },
    { endCheckedAt: "" },
  ]) {
    await assert.rejects(
      publishEventSchemaCorrections(sql, publishing, [
        { ...correction, editions: [{ ...correction.editions[0], ...patch }] },
      ]),
      /validation failed/,
    );
    assert.equal(
      (await sql.query("select count(*)::int as n from catalogue_import_batches"))[0].n,
      0,
      "Failed validation must roll back staging",
    );
    assert.deepEqual((await sql.query("select * from editions where id=901001"))[0], beforeEdition);
  }
  await assert.rejects(
    publishEventSchemaCorrections(sql, publishing, [
      { ...correction, expectedWebsite: "https://example.org/changed" },
    ]),
    /evidence changed/,
  );
  await publishEventSchemaCorrections(sql, publishing, [correction]);
  const current = (await sql.query("select * from editions where id=901001"))[0];
  assert.equal(current.end_date, "2027-05-09");
  assert.equal(current.end_time, "10:00");
  assert.equal(current.end_source_url, "https://example.org/source");
  assert.equal(current.notes, "Original evidence\nSource checked 15 October 2026");
  assert.deepEqual(
    await sql.query("select * from edition_entry_options where edition_id=901001"),
    beforeOptions,
    "Unrelated options unchanged",
  );
  assert.equal(
    sportsEventJsonLd({
      name: "Synthetic Race",
      slug: correction.slug,
      startDate: current.event_date,
      startTime: current.start_time,
      endDate: current.end_date,
      endTime: current.end_time,
    }).endDate,
    "2027-05-09T10:00",
  );
  await publishEventSchemaCorrections(sql, publishing, [correction]);
  assert.equal(
    (await sql.query("select count(*)::int as n from catalogue_revisions"))[0].n,
    1,
    "Idempotent publication",
  );
  // A later ordinary import that knows nothing about end evidence preserves it.
  const result = await applyImportBundle(
    {
      editions: [
        {
          eventSlug: correction.slug,
          date: current.event_date,
          distance: current.distance_code,
          distanceKm: current.distance_km,
          status: current.status,
          startTime: current.start_time,
          source: current.source_url,
          notes: current.notes,
        },
      ],
    },
    { sqlOverride: sql },
  );
  assert.deepEqual(result.errors, []);
  assert.deepEqual((await sql.query("select * from editions where id=901001"))[0], current);
  const revision = (await sql.query("select id from catalogue_revisions"))[0].id;
  assert.deepEqual(
    (await sql.query("select * from events where id=901001"))[0],
    beforeEvent,
    "Routine publication preserves existing event metadata by default",
  );
  await assert.rejects(
    publishEventOrganiserCorrections(sql, publishing, [
      { ...correction, expectedWebsite: "https://example.org/changed" },
    ]),
    /evidence changed/,
  );
  await publishEventOrganiserCorrections(sql, publishing, [correction]);
  const namedEvent = (await sql.query("select * from events where id=901001"))[0];
  assert.deepEqual(
    namedEvent,
    { ...beforeEvent, organiser: "Example Club", website: "https://example.org/" },
    "Explicit correction changes only the two approved identity fields",
  );
  assert.deepEqual((await sql.query("select * from editions where id=901001"))[0], current);
  assert.deepEqual(
    await sql.query("select * from edition_entry_options where edition_id=901001"),
    beforeOptions,
  );
  const identityRevision = (
    await sql.query("select id from catalogue_revisions order by id desc limit 1")
  )[0].id;
  const identityChange = (
    await sql.query(
      "select before_json,after_json from catalogue_change_log where revision_id=$1",
      [identityRevision],
    )
  )[0];
  assert.equal(identityChange.before_json.record.organiser, "");
  assert.equal(identityChange.after_json.record.organiser, "Example Club");
  await publishEventOrganiserCorrections(sql, publishing, [correction]);
  assert.equal((await sql.query("select count(*)::int as n from catalogue_revisions"))[0].n, 2);
  await assert.rejects(
    publishEventPublicNotes(sql, publishing, [{ ...correction, note: "Different evidence" }]),
    /evidence changed/,
  );
  await publishEventPublicNotes(sql, publishing, [correction]);
  const publicEdition = (await sql.query("select * from editions where id=901001"))[0];
  assert.deepEqual(publicEdition, { ...current, notes: `Original evidence\n${correction.publicNote}` });
  assert.deepEqual((await sql.query("select * from events where id=901001"))[0], namedEvent);
  assert.deepEqual(
    await sql.query("select * from edition_entry_options where edition_id=901001"), beforeOptions,
  );
  const noteRevision = (await sql.query("select max(id) as id from catalogue_revisions"))[0].id;
  await publishEventPublicNotes(sql, publishing, [correction]);
  assert.equal((await sql.query("select count(*)::int as n from catalogue_revisions"))[0].n, 3);
  await publishing.rollbackCatalogueRevision(noteRevision, "test-reviewer@example.org", sql);
  await publishEventPublicNotes(sql, publishing, [correction]);
  assert.deepEqual((await sql.query("select * from editions where id=901001"))[0], current);
  await publishing.rollbackCatalogueRevision(identityRevision, "test-reviewer@example.org", sql);
  assert.deepEqual((await sql.query("select * from events where id=901001"))[0], beforeEvent);
  await publishEventOrganiserCorrections(sql, publishing, [correction]);
  assert.deepEqual(
    (await sql.query("select * from events where id=901001"))[0],
    beforeEvent,
    "Rolled-back organiser correction never replays",
  );
  await publishing.rollbackCatalogueRevision(revision, "test-reviewer@example.org", sql);
  assert.deepEqual((await sql.query("select * from events where id=901001"))[0], beforeEvent);
  assert.deepEqual((await sql.query("select * from editions where id=901001"))[0], beforeEdition);
  assert.deepEqual(
    await sql.query("select * from edition_entry_options where edition_id=901001"),
    beforeOptions,
  );
  await publishEventSchemaCorrections(sql, publishing, [correction]);
  assert.equal(
    (await sql.query("select end_date from editions where id=901001"))[0].end_date,
    null,
    "Rolled-back correction never replays",
  );

  // New official offers are tied to one existing edition and retain source dates.
  await sql.query(
    "insert into events(id,slug,name,sport,country,organiser,website) values(901002,'synthetic-entry-race','Synthetic Entry Race','Running','Wales','','https://example.org/listing')",
  );
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url) values(901002,901002,'2026-11-07','Half',21.0975,'TBC',null,'https://example.org/listing')",
  );
  await publishEventSchemaCorrections(sql, publishing, [
    {
      ...correction,
      slug: "synthetic-entry-race",
      expectedWebsite: "https://example.org/listing",
      editions: [
        {
          date: "2026-11-07",
          distance: "Half",
          expectedStart: null,
          expectedStatus: "TBC",
          startTime: "09:30",
          price: 40,
        },
      ],
    },
  ]);
  const offer = (await sql.query("select * from edition_entry_options where edition_id=901002"))[0];
  assert.equal(Number(offer.price_amount), 40);
  assert.equal(offer.opens_at, "2025-12-01");
  assert.equal(offer.closes_at, "2026-11-01");
  assert.equal(offer.is_verified, true);
  assert.equal(offer.source_url, "https://example.org/source");
  assert.equal(
    (await sql.query("select count(*)::int as n from events"))[0].n,
    2,
    "No duplicate events",
  );
  console.log(
    "Event schema publication verified: evidence validation, exact existing records, atomic publication, preserved options, idempotence and rollback.",
  );
} finally {
  await pg.close();
}
