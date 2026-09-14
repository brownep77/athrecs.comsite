import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { bulkFixture, service } from "./collector-bulk-fixture.mjs";
const f = await bulkFixture();
const { pg, sql, add, action, runId } = f;
const count = async (table) => (await sql.query(`select count(*)::int n from ${table}`))[0].n;
const row = async (id) =>
  (await sql`select * from race_collector_candidates where id=${id}::uuid`)[0];
try {
  const ready = await add("Orchard Spring Run"),
    held = await add("Forest Challenge", {}, { status: "held", reason: "Possible alias" });
  const unselected = await add("Seaside Dash");
  const ids = [ready.id, held.id];
  for (const override of [
    { confirmed: false },
    { ids: [] },
    { ids: [ready.id, ready.id] },
    { ids: Array.from({ length: 51 }, randomUUID) },
    { action: "remove" },
    { runId: "invalid" },
  ])
    await assert.rejects(() => action(ids, "keep", override));
  await assert.rejects(() => action([ready.id, randomUUID()], "keep"), /belong to this scan/);
  assert.deepEqual(await row(ready.id), ready);
  assert.equal((await action(ids, "keep")).changed, 2);
  assert.equal((await action(ids, "keep")).reused, true);
  assert.equal((await action(ids, "dismiss")).changed, 2);
  assert.equal((await action(ids, "dismiss")).changed, 0);
  assert.equal((await action(ids, "keep")).changed, 2);
  for (const original of [ready, held]) {
    const saved = await row(original.id);
    for (const key of [
      "candidate",
      "status",
      "reason",
      "event_id",
      "event_slug",
      "batch_id",
      "reviewed_at",
    ])
      assert.deepEqual(saved[key], original[key], `Keep/dismiss preserves ${key}`);
    assert(saved.kept_at);
    assert.equal(saved.dismissed_at, null);
  }
  assert.deepEqual(await row(unselected.id), unselected);
  await assert.rejects(() => action(ids, "publish"), /Only ready/);
  await assert.rejects(() => action([ready.id], "publish", { sourcesReviewed: false }));
  assert.equal(await count("catalogue_import_batches"), 0);

  // A single confirmation publishes two ready races through the real staged publisher.
  const second = await add("Harbour Sunset Circuit", {
    date: "2027-06-13",
    distance: 5,
    distanceKm: 5,
    distanceLabel: "5K",
    entryUrl: "https://entry.example.org/harbour",
    entryStatus: "Open",
  });
  const published = await action([ready.id, second.id], "publish");
  assert.equal(published.published, 2);
  assert.equal(await count("editions"), 2);
  assert.equal(await count("catalogue_revisions"), 1);
  for (const item of [ready, second]) {
    const saved = await row(item.id);
    assert.equal(saved.batch_id, published.batchId);
    assert(saved.reviewed_at && saved.kept_at);
    assert.deepEqual(saved.candidate, item.candidate);
    const edition = (
      await sql`select ed.* from editions ed join events e on e.id=ed.event_id where e.slug=${item.event_slug}`
    )[0];
    assert.equal(edition.event_date, item.candidate.date);
    assert.equal(edition.distance_km, item.candidate.distanceKm);
    assert.equal(edition.source_url, item.candidate.sourceUrl);
    assert(edition.notes.includes(item.candidate.evidence));
  }
  assert.deepEqual(await row(unselected.id), unselected);
  assert.equal((await action([second.id, ready.id], "publish")).reused, true);
  assert.equal(await count("catalogue_revisions"), 1);
  assert.equal(await count("editions"), 2);
  const dashboard = await service.dashboard(runId, sql, { status: "kept" });
  assert.equal(dashboard.candidates.filter((r) => r.publication_status === "published").length, 2);
  await action([ready.id, second.id], "dismiss");
  assert.equal(await count("editions"), 2, "Dismiss never unpublishes catalogue races");
  await action([ready.id, second.id], "keep");

  // New distance for a canonical event retains its existing identity, details and entry route.
  const existingEvent = (await sql`select * from events where slug=${second.event_slug}`)[0];
  const existingEdition = (await sql`select * from editions where event_id=${existingEvent.id}`)[0];
  const entries =
    await sql`select * from edition_entry_options where edition_id=${existingEdition.id}`;
  const extraDistance = await add(
    second.candidate.name,
    { ...second.candidate, distance: 10, distanceKm: 10, distanceLabel: "10K" },
    { eventId: existingEvent.id, eventSlug: existingEvent.slug },
  );
  await action([extraDistance.id], "publish");
  assert.deepEqual(
    (await sql`select * from events where id=${existingEvent.id}`)[0],
    existingEvent,
  );
  assert.deepEqual(
    (await sql`select * from editions where id=${existingEdition.id}`)[0],
    existingEdition,
  );
  assert.deepEqual(
    await sql`select * from edition_entry_options where edition_id=${existingEdition.id}`,
    entries,
  );

  const failedSelection = async (items, pattern) => {
    const before = await Promise.all(items.map((item) => row(item.id)));
    const counts = await Promise.all(
      ["events", "editions", "catalogue_revisions", "catalogue_import_batches"].map(count),
    );
    await assert.rejects(
      () =>
        action(
          items.map((item) => item.id),
          "publish",
        ),
      pattern,
    );
    assert.deepEqual(await Promise.all(items.map((item) => row(item.id))), before);
    assert.deepEqual(
      await Promise.all(
        ["events", "editions", "catalogue_revisions", "catalogue_import_batches"].map(count),
      ),
      counts,
    );
  };
  // Stale reviewed rows cannot bypass a new equivalent edition or a newly introduced alias.
  const duplicate = await add(
    "Harbour Sunset Circuit",
    { ...second.candidate, distanceLabel: "3.1mi", distance: 3.1, unit: "mi", distanceKm: 4.989 },
    { eventId: existingEvent.id, eventSlug: existingEvent.slug },
  );
  await failedSelection([unselected, duplicate], /identity changed|equivalent/);
  const alias = await add("Former Harbour Challenge");
  await sql`insert into slug_redirects(entity_type,entity_id,old_slug,current_slug) values('event',${existingEvent.id},${alias.event_slug},${existingEvent.slug})`;
  await failedSelection([unselected, alias], /identity changed/);
  const pending = await add("Mountain Skyline Race");
  await service.stageReviewed([pending.id], "fixture@example.org", sql);
  const overlapping = await add(pending.candidate.name, {
    ...pending.candidate,
    distanceLabel: "6.2mi",
    distance: 6.2,
    unit: "mi",
    distanceKm: 9.9779,
  });
  await failedSelection([unselected, overlapping], /identity changed|equivalent/);

  // Force an error after the publisher has already inserted the first edition.
  const failA = await add("Meadow Lantern Loop"),
    failB = await add("Riverside Beacon Dash");
  await pg.exec(`create function fixture_fail_second() returns trigger language plpgsql as $$ begin
    if exists(select 1 from editions ed join events e on e.id=ed.event_id where e.name in ('Meadow Lantern Loop','Riverside Beacon Dash')) then raise exception 'Fixture second edition failure'; end if;
    return new; end $$;
    create trigger fixture_fail_second before insert on editions for each row execute function fixture_fail_second();`);
  await failedSelection([failA, failB], /Fixture second edition failure/);
  await pg.exec(
    "drop trigger fixture_fail_second on editions; drop function fixture_fail_second();",
  );
  assert.equal((await action([failA.id, failB.id], "publish")).published, 2);
  console.log(
    "Collector bulk actions: confirmation, selection boundaries, retention, atomic publication, retry, aliases, pending duplicates and rollback passed.",
  );
} finally {
  await pg.close();
}
