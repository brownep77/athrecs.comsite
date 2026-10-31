import { REEPHAM_CONFIRMATION_REVIEW } from "./lib/reepham-organiser-confirmation-2026-10-31-review.mjs";
import reephamConfirmation from "../src/data/reepham-organiser-confirmation-2026-10-31.json" with { type: "json" };
import { REEPHAM_LAP_STARTS_DETAILS } from "./lib/reepham-lap-starts-details.mjs";
import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { START_TIME_REVIEW } from "./lib/official-start-time-review.mjs";
import { OFFICIAL_START_TIME_DETAILS } from "./lib/official-start-time-details.mjs";
import { NORFOLK_CLARIFICATION_REVIEW } from "./lib/norfolk-start-clarification-review.mjs";
import { NORFOLK_CLARIFICATION_DETAILS } from "./lib/norfolk-start-clarification-details.mjs";
import { REEPHAM_LAP_STARTS_REVIEW } from "./lib/reepham-lap-starts-review.mjs";
import { MARRIOTTS_CONFIRMATION_REVIEW } from "./lib/marriotts-organiser-confirmation-review.mjs";
import marriottsConfirmation from "../src/data/marriotts-organiser-confirmation-2026-10-23.json" with { type: "json" };
const { FIXTURE_DETAILS, checkedFixtureStart, checkedFixtureEventStart } =
  await import("../src/data/fixture-details.ts");
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");

// Rehearse the exact four public fixture corrections in disposable Postgres.
const { pg, sql } = await bulkFixture();
try {
  for (const [key, row] of Object.entries(START_TIME_REVIEW.baseline)) {
    const [slug, date, distance] = key.split("|");
    await sql.query(
      "insert into events(id,slug,name,sport,country) values($1,$2,$2,'Running','England') on conflict do nothing",
      [row.event_id, slug],
    );
    await sql.query(
      "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes,entry_url) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [
        row.id,
        row.event_id,
        date,
        distance,
        row.distance_km,
        row.status,
        row.start_time,
        row.source_url,
        row.notes,
        row.event_id === 74 ? "https://totalracetiming.co.uk/race/693" : null,
      ],
    );
  }
  await sql.query("update editions set start_time='11:00' where id=71609696");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time=null where id=71609696");
  const result = await publishCheckedFixtures(
    sql,
    publishing,
    OFFICIAL_START_TIME_DETAILS,
    START_TIME_REVIEW,
  );
  assert(result.revisionId);
  const rows = await sql.query("select * from editions order by id");
  assert.equal(rows.length, 4, "no new editions");
  for (const [key, before] of Object.entries(START_TIME_REVIEW.baseline)) {
    const [slug, date, distance] = key.split("|");
    const row = rows.find((r) => r.id === before.id);
    const detail = OFFICIAL_START_TIME_DETAILS[`${slug}|${date}`];
    assert.equal(row.start_time, detail.starts[distance].time);
    assert.equal(row.source_url, detail.sourceUrl);
    assert.equal(row.distance_km, before.distance_km);
    assert.equal(row.status, before.status);
    assert(row.notes.startsWith(before.notes));
    assert(row.notes.includes(detail.starts[distance].note));
    assert.equal(checkedFixtureStart(slug, date.replace("2027", "2028"), distance, null), null);
  }
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [result.revisionId],
  );
  assert.equal(audit.length, 4);
  assert(audit.every((change) => change.before_json.record.start_time === null));
  assert(
    (await publishCheckedFixtures(sql, publishing, OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW))
      .alreadyPublished,
  );
  // Rehearse the follow-up against the exact state produced by the previous batch.
  await sql.query("update editions set start_time='10:45' where id=109456641");
  await assert.rejects(
    publishCheckedFixtures(
      sql,
      publishing,
      NORFOLK_CLARIFICATION_DETAILS,
      NORFOLK_CLARIFICATION_REVIEW,
    ),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 1);
  await sql.query("update editions set start_time='10:15' where id=109456641");
  const followup = await publishCheckedFixtures(
    sql,
    publishing,
    NORFOLK_CLARIFICATION_DETAILS,
    NORFOLK_CLARIFICATION_REVIEW,
  );
  const updated = await sql.query("select * from editions order by id");
  assert.equal(updated.length, 4);
  for (const [key, before] of Object.entries(NORFOLK_CLARIFICATION_REVIEW.baseline)) {
    const [slug, date, distance] = key.split("|");
    const row = updated.find((r) => r.id === before.id);
    const detail = NORFOLK_CLARIFICATION_DETAILS[`${slug}|${date}`];
    assert.equal(row.start_time, detail.starts[distance].time);
    assert.equal(row.source_url, detail.sourceUrl);
    assert.equal(row.distance_km, before.distance_km);
    assert.equal(row.status, before.status);
    assert(row.notes.startsWith(before.notes));
    assert(row.notes.includes(detail.starts[distance].note));
    assert.equal(
      checkedFixtureStart(slug, date.replace("2027", "2028"), distance, "08:00"),
      "08:00",
    );
  }
  assert(updated.filter((row) => row.event_id === 3059189).every((row) => row.start_time === null));
  assert.equal(updated.find((row) => row.id === 71609696).start_time, "09:00");
  assert.equal(updated.find((row) => row.id === 71609697).start_time, "10:30");
  assert(
    FIXTURE_DETAILS["reepham-cross-country|2027-01-31"].starts["5K"].note.includes(
      "juniors start 10:00",
    ),
  );
  const followupAudit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [followup.revisionId],
  );
  assert.equal(followupAudit.length, 4);
  const held = followupAudit.filter((change) => change.before_json.record.event_id === 3059189);
  assert.equal(held.length, 2);
  assert(
    held.every(
      (change) =>
        change.before_json.record.start_time === "10:15" &&
        change.after_json.record.start_time === null,
    ),
  );
  assert(
    (
      await publishCheckedFixtures(
        sql,
        publishing,
        NORFOLK_CLARIFICATION_DETAILS,
        NORFOLK_CLARIFICATION_REVIEW,
      )
    ).alreadyPublished,
  );
  assert(
    (await publishCheckedFixtures(sql, publishing, OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW))
      .alreadyPublished,
  );
  assert.equal(
    (await sql.query("select start_time from editions where id=109456641"))[0].start_time,
    null,
  );
  // Apply the owner's distance-specific clarification, preserving both historical batches.
  const lapDetails = REEPHAM_LAP_STARTS_DETAILS;
  await sql.query("update editions set start_time='10:45' where id=109456641");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, lapDetails, REEPHAM_LAP_STARTS_REVIEW),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 2);
  await sql.query("update editions set start_time=null where id=109456641");
  const laps = await publishCheckedFixtures(sql, publishing, lapDetails, REEPHAM_LAP_STARTS_REVIEW);
  for (const [details, review] of [
    [OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW],
    [NORFOLK_CLARIFICATION_DETAILS, NORFOLK_CLARIFICATION_REVIEW],
    [lapDetails, REEPHAM_LAP_STARTS_REVIEW],
  ])
    assert((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  const finalRows = await sql.query("select * from editions order by id");
  assert.equal(finalRows.length, 4, "no new editions or duplicate junior category");
  assert.deepEqual(
    finalRows.filter((row) => row.event_id === 74),
    updated.filter((row) => row.event_id === 74),
    "Marriott's Way is untouched",
  );
  for (const [distance, time] of [
    ["5K", "10:15"],
    ["10K", "10:30"],
  ]) {
    const row = finalRows.find((row) => row.event_id === 3059189 && row.distance_code === distance);
    const before =
      REEPHAM_LAP_STARTS_REVIEW.baseline[`reepham-cross-country|2027-01-31|${distance}`];
    assert.equal(row.start_time, time);
    assert.equal(
      checkedFixtureStart("reepham-cross-country", "2027-01-31", distance, null),
      "10:15",
    );
    assert(row.notes.startsWith(before.notes));
    assert.match(row.notes, /Owner clarification on 21 October 2026/);
    assert.equal(row.source_url, before.source_url);
    assert.equal(row.status, before.status);
    assert.equal(row.distance_km, before.distance_km);
    assert.equal(checkedFixtureStart("reepham-cross-country", "2028-01-31", distance, null), null);
  }
  const lapAudit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [laps.revisionId],
  );
  assert.equal(lapAudit.length, 2);
  assert(lapAudit.every((change) => change.before_json.record.start_time === null));
  assert.deepEqual(lapAudit.map((change) => change.after_json.record.start_time).sort(), [
    "10:15",
    "10:30",
  ]);
  // A direct organiser reply now replaces exactly the two Marriott's Way clocks.
  const confirmation = () =>
    publishCheckedFixtures(sql, publishing, marriottsConfirmation, MARRIOTTS_CONFIRMATION_REVIEW);
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, marriottsConfirmation, {
      ...MARRIOTTS_CONFIRMATION_REVIEW,
      startCorrections: undefined,
    }),
    /Start changed since review/,
  );
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, marriottsConfirmation, {
      ...MARRIOTTS_CONFIRMATION_REVIEW,
      baseline: undefined,
    }),
    /Start changed since review/,
  );
  await sql.query("update editions set start_time='10:45' where id=71609697");
  await assert.rejects(confirmation(), /Reviewed baseline changed/);
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 3);
  assert.equal(
    (await sql.query("select start_time from editions where id=71609696"))[0].start_time,
    "09:00",
  );
  await sql.query("update editions set start_time='10:30' where id=71609697");
  const confirmed = await confirmation();
  const confirmedRows = await sql.query("select * from editions order by id");
  assert.equal(confirmedRows.length, 4);
  assert.deepEqual(
    confirmedRows.filter((row) => row.event_id !== 74),
    finalRows.filter((row) => row.event_id !== 74),
    "No unrelated race changes",
  );
  const { sportsEventJsonLd } = await import("../src/lib/athrecs/seo.ts");
  for (const [distance, time] of [
    ["Marathon", "08:30"],
    ["Half", "10:00"],
  ]) {
    const row = confirmedRows.find(
      (item) => item.event_id === 74 && item.distance_code === distance,
    );
    const before = finalRows.find((item) => item.id === row.id);
    assert.equal(row.start_time, time);
    assert(row.notes.startsWith(before.notes));
    assert.match(
      row.notes,
      /Janice of Boghopper Races confirmed directly by email on 23 October 2026/,
    );
    assert.match(
      row.notes,
      /One mass start for runners and walkers; gun-timed start and chip-timed finish/,
    );
    assert.deepEqual({ ...row, start_time: before.start_time, notes: before.notes }, before);
    assert.equal(
      checkedFixtureStart("marriotts-way-races", "2027-02-21", distance, before.start_time),
      time,
    );
    assert.equal(
      checkedFixtureStart("marriotts-way-races", "2028-02-21", distance, "12:00"),
      "12:00",
    );
    assert.equal(
      sportsEventJsonLd({
        name: `Marriott's Way ${distance}`,
        slug: "marriotts-way-races",
        startDate: row.event_date,
        startTime: row.start_time,
      }).startDate,
      `2027-02-21T${time}`,
    );
  }
  const confirmationAudit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [confirmed.revisionId],
  );
  assert.equal(confirmationAudit.length, 2);
  assert.equal(checkedFixtureEventStart("marriotts-way-races", "2027-02-21", "10:00"), "08:30");
  assert.equal(checkedFixtureEventStart("marriotts-way-races", "2028-02-21", "10:00"), "10:00");
  assert.equal(checkedFixtureEventStart("reepham-cross-country", "2027-01-31", "10:15"), "10:15");
  assert.equal(
    sportsEventJsonLd({
      name: "Marriott’s Way Marathon & Half",
      slug: "marriotts-way-races",
      startDate: "2027-02-21",
      startTime: checkedFixtureEventStart("marriotts-way-races", "2027-02-21", "10:00"),
    }).startDate,
    "2027-02-21T08:30",
  );
  assert.deepEqual(confirmationAudit.map((change) => change.before_json.record.start_time).sort(), [
    "09:00",
    "10:30",
  ]);
  assert.deepEqual(confirmationAudit.map((change) => change.after_json.record.start_time).sort(), [
    "08:30",
    "10:00",
  ]);
  for (const [details, review] of [
    [OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW],
    [NORFOLK_CLARIFICATION_DETAILS, NORFOLK_CLARIFICATION_REVIEW],
    [marriottsConfirmation, MARRIOTTS_CONFIRMATION_REVIEW],
  ])
    assert((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  assert.deepEqual(await sql.query("select * from editions order by id"), confirmedRows);
  const { withheldFixtureDateKeys } = await import("../src/data/fixture-date-reviews.ts");
  for (const key of [
    "gear-10k-kings-lynn|2026-11-08",
    "marriotts-way-10k|2026-11-01",
    "lingwood-duathlon|2027-03-21",
  ])
    assert.ok(withheldFixtureDateKeys.includes(key), `Earlier date hold must remain: ${key}`);
  console.log(
    "Historical batches and Marriott organiser confirmation passed: exact scope, guarded replacements, rollback, source history, structured starts and replay safety.",
  );
  // Rehearse the organiser correction with raw notes, never public decorated notes.
  const reephamBefore = new Map();
  for (const row of Object.values(REEPHAM_CONFIRMATION_REVIEW.baseline)) {
    const [current] = await sql.query("select * from editions where id=$1", [row.id]);
    assert.equal(current.start_time, row.start_time);
    assert(!Object.hasOwn(row, "notes"), "public annotations are not a raw database baseline");
    reephamBefore.set(row.id, current.notes);
  }
  await sql.query("update editions set start_time='10:45' where id=109456642");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, reephamConfirmation, REEPHAM_CONFIRMATION_REVIEW),
    /Reviewed baseline changed/,
  );
  await sql.query("update editions set start_time='10:30' where id=109456642");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, reephamConfirmation, {
      ...REEPHAM_CONFIRMATION_REVIEW,
      startCorrections: undefined,
    }),
    /Start changed since review/,
  );
  const reephamConfirmed = await publishCheckedFixtures(
    sql,
    publishing,
    reephamConfirmation,
    REEPHAM_CONFIRMATION_REVIEW,
  );
  for (const before of Object.values(REEPHAM_CONFIRMATION_REVIEW.baseline)) {
    const [row] = await sql.query("select * from editions where id=$1", [before.id]);
    assert.equal(row.start_time, "10:15");
    assert(row.notes.startsWith(reephamBefore.get(before.id)));
    assert.match(row.notes, /31 October 2026 13:51 UTC/);
  }
  assert(
    (
      await publishCheckedFixtures(
        sql,
        publishing,
        reephamConfirmation,
        REEPHAM_CONFIRMATION_REVIEW,
      )
    ).alreadyPublished,
  );
  const reephamAudit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [reephamConfirmed.revisionId],
  );
  assert.equal(reephamAudit.length, 2);
  assert(reephamAudit.every((change) => change.after_json.record.start_time === "10:15"));
} finally {
  await pg.close();
}
