import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { SEVENTH_FIXTURE_QUALITY_REVIEW as review } from "./lib/fixture-quality-seventh-2026-10-26-review.mjs";
import details from "../src/data/fixture-quality-seventh-2026-10-26.json" with { type: "json" };
import duplicates from "../src/data/fixture-duplicate-reviews-seventh-2026-10-26.json" with { type: "json" };
import holds from "../src/data/fixture-distance-holds-seventh-2026-10-26.json" with { type: "json" };
import dateHolds from "../src/data/fixture-date-corrections-seventh-2026-10-26.json" with { type: "json" };
import { reviewConfirmedDistances } from "../src/data/confirmed-distance-editions.ts";
import { fixtureDateIsWithheld } from "../src/data/fixture-date-reviews.ts";
import { isReviewedFixturePlaceholder } from "../src/data/fixture-details.ts";
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { readSportFixtures } = await import("../src/lib/athrecs/sport-fixtures.server.ts");
const { RUNNING_FIXTURE_SCOPE } = await import("../src/lib/athrecs/sport-pages.ts");
const { buildCalendarEvent } = await import("../src/lib/athrecs/event-calendar.ts");
const { unconfirmedFixtureEditionIds } =
  await import("../src/lib/athrecs/fixture-distance-policy.server.ts");
const { pg, sql } = await bulkFixture();
try {
  await pg.exec(
    "alter table events add column if not exists region text; alter table editions add column if not exists end_date date, add column if not exists end_time text, add column if not exists end_source_url text, add column if not exists end_checked_at date;",
  );
  const events = new Map();
  for (const [key, base] of Object.entries(review.baseline))
    events.set(key.split("|")[0], base?.event_id ?? review.additions[key].eventId);
  for (const r of duplicates) {
    events.set(r.duplicateSlug, r.duplicateEventId);
    events.set(r.canonicalSlug, r.canonicalEventId);
  }
  for (const r of holds) events.set(r.slug, r.eventId);
  let syntheticId = 900000;
  for (const key of [...Object.keys(details), ...Object.keys(dateHolds)])
    if (!events.has(key.split("|")[0])) events.set(key.split("|")[0], ++syntheticId);
  for (const [slug, id] of events)
    await sql.query(
      "insert into events(id,slug,name,sport,country,city,surface) values($1,$2,$2,'Running','England','Test venue','Road')",
      [id, slug],
    );
  let editionId = 900000;
  async function insert(slug, date, code, base = {}) {
    const existing = await sql.query(
      "select id from editions where event_id=$1 and event_date=$2 and distance_code=$3",
      [events.get(slug), date, code],
    );
    if (existing.length) return;
    await sql.query(
      "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        base.id ?? ++editionId,
        events.get(slug),
        date,
        code,
        base.distance_km ?? 10,
        base.status ?? "Open",
        Object.hasOwn(base, "start_time") ? base.start_time : "12:34",
        base.source_url ?? "https://organiser.example.org/programme",
        base.notes ?? null,
      ],
    );
  }
  for (const [key, base] of Object.entries(review.baseline))
    if (base) await insert(...key.split("|"), base);
  for (const [key, d] of Object.entries(details))
    for (const c of Object.keys(d.starts))
      if (!Object.hasOwn(review.additions, key + "|" + c)) await insert(...key.split("|"), c);
  for (const r of holds) await insert(r.slug, r.date, r.distance, { id: r.editionId });
  for (const r of duplicates)
    for (const c of r.duplicateDistances)
      await insert(r.duplicateSlug, r.date, c, { distance_km: c === "Other" ? 0 : 10 });
  for (const key of Object.keys(dateHolds)) await insert(...key.split("|"), "10K");
  await insert("attack-of-the-zombie-cows", "2025-10-31", "10K");
  await insert("anglesey-trail-half-marathon", "2027-11-01", "5K");
  const originals = await sql.query("select * from editions order by id");
  // A concurrent addition aborts the entire review, including metadata corrections.
  await insert("rosliston-rumble-autumn", "2026-11-01", "6H", { distance_km: 0 });
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query(
    "delete from editions where event_id=$1 and event_date='2026-11-01' and distance_code='6H'",
    [events.get("rosliston-rumble-autumn")],
  );
  // A zero-distance unknown or a duration/code mismatch cannot use the new path.
  for (const [code, hours] of [
    ["Other", 8],
    ["8H", 6],
    ["8H", 0],
  ]) {
    const key = "attack-of-the-zombie-cows|2026-10-31|" + code;
    const invalid = {
      ...review,
      sourceKey: "synthetic:" + code + hours,
      baseline: { [key]: null },
      additions: {
        [key]: {
          eventId: events.get("attack-of-the-zombie-cows"),
          distanceKm: 0,
          status: "Open",
          timedDurationHours: hours,
        },
      },
    };
    const invalidDetails = {
      "attack-of-the-zombie-cows|2026-10-31": {
        ...details["attack-of-the-zombie-cows|2026-10-31"],
        starts: { [code]: { time: "08:30" } },
      },
    };
    await assert.rejects(
      publishCheckedFixtures(sql, publishing, invalidDetails, invalid),
      /Reviewed baseline changed/,
    );
  }
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  const changedIds = new Set(
    Object.values(review.baseline)
      .filter(Boolean)
      .map((b) => b.id),
  );
  const after = await sql.query("select * from editions order by id");
  assert.deepEqual(
    after.filter((r) => originals.some((o) => o.id === r.id) && !changedIds.has(r.id)),
    originals.filter((r) => !changedIds.has(r.id)),
    "Unreviewed source records, duplicate rows and other years are unchanged",
  );
  for (const [key, base] of Object.entries(review.baseline)) {
    const [slug, date, code] = key.split("|");
    const expected = details[slug + "|" + date].starts[code];
    const rows = await sql.query(
      "select * from editions where event_id=$1 and event_date=$2 and distance_code=$3",
      [events.get(slug), date, code],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].distance_km, base?.distance_km ?? review.additions[key].distanceKm);
    assert.equal(rows[0].start_time, expected.time ?? base?.start_time ?? null);
    assert.equal(
      rows[0].status,
      review.statusCorrections[key]?.to ?? base?.status ?? review.additions[key].status,
    );
  }
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [published.revisionId],
  );
  assert.equal(audit.length, 21);
  assert.equal(audit.filter((r) => r.before_json === null).length, 15);
  assert.ok((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  assert.deepEqual(
    await sql.query("select * from editions order by id"),
    after,
    "Replay is a no-op",
  );
  const hidden = await unconfirmedFixtureEditionIds(sql, "2026-10-01");
  for (const h of holds) {
    assert.ok(hidden.includes(h.editionId));
    assert.ok(isReviewedFixturePlaceholder(h.slug, h.date, h.distance));
    assert.ok(!isReviewedFixturePlaceholder(h.slug, "2030-01-01", h.distance));
  }
  const fixtures = [];
  for (let page = 1; page <= 5; page++) {
    const result = await readSportFixtures(sql, { ...RUNNING_FIXTURE_SCOPE, page }, "2026-10-01");
    fixtures.push(...result.fixtures);
    if (result.fixtures.length < 24) break;
  }
  for (const r of duplicates) {
    assert.ok(!fixtures.some((f) => f.slug === r.duplicateSlug && f.eventDate === r.date));
    const f = fixtures.find((f) => f.slug === r.canonicalSlug && f.eventDate === r.date);
    assert.ok(f);
    assert.deepEqual(f.starts.map((s) => s.distance).sort(), [...r.retainedDistances].sort());
  }
  for (const key of Object.keys(dateHolds)) {
    const [slug, date] = key.split("|");
    assert.ok(fixtureDateIsWithheld(slug, date));
    assert.ok(!fixtures.some((f) => f.slug === slug && f.eventDate === date));
  }
  for (const [key, d] of Object.entries(details)) {
    const [slug, date] = key.split("|");
    const f = fixtures.find((f) => f.slug === slug && f.eventDate === date);
    assert.ok(f, "Missing " + key);
    for (const [c, s] of Object.entries(d.starts)) {
      const actual = f.starts.find((x) => x.distance === c);
      assert.ok(actual, "Missing " + key + " " + c);
      assert.equal(actual.time, s.time);
      assert.equal(actual.note, s.publicNote);
      assert.equal(actual.label, s.label ?? null);
      if (s.time === null) {
        const cal = buildCalendarEvent({ ...actual.calendarRace, status: "Open" });
        assert.ok(cal);
        assert.equal(cal.startUtc, null);
      }
    }
  }
  const croft16 = await readSportFixtures(
    sql,
    { ...RUNNING_FIXTURE_SCOPE, q: "running-gp-croft", distance: "16mi" },
    "2026-10-01",
  );
  assert.equal(
    croft16.fixtures.length,
    0,
    "Unsupported distance cannot produce an empty search card",
  );
  const seeds = reviewConfirmedDistances([], new Set(events.keys()));
  for (const key of Object.keys(review.baseline)) {
    const [slug, date, code] = key.split("|");
    const s = seeds.find((r) => r.seriesSlug === slug && r.date === date && r.distance === code);
    assert.ok(s, "Missing seed " + key);
    assert.equal(s.startTime ?? null, details[slug + "|" + date].starts[code].time);
  }
  console.log(
    "PASS: 21 audited writes (15 additions, 6 metadata updates), guarded timed challenges, atomic stale-baseline rejection, replay, untouched source/history rows, 2 duplicate programmes, 9 distance holds, 3 date/non-race holds, exact starts and honest date-only calendars.",
  );
} finally {
  await pg.close();
}
