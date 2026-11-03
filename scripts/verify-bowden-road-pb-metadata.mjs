import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Exercise the actual scoped migration using synthetic athlete identities and
// source records. No production export or private athlete audit is a fixture.
const migration = (
  await readFile(
    new URL("../migrations/20261102_bowden_road_pb_metadata.sql", import.meta.url),
    "utf8",
  )
)
  .replaceAll("'philippa-bowden-wa-14586863'", "'synthetic-road-runner'")
  .replaceAll("'Philippa Bowden'", "'Synthetic Road Runner'");
const performance = (overrides) => ({
  year: 2024,
  date: "2024-09-29",
  sourceDate: "29 SEP 2024",
  ageGroup: "SEN",
  discipline: "Marathon",
  performance: "2:25:47",
  wind: "",
  place: "15",
  venue: "Berlin (GER)",
  meeting: "World Athletics all-time toplist",
  labels: ["Synthetic original label"],
  sourceUrls: ["https://example.test/result"],
  verificationStatus: "source_verified",
  notes: "Synthetic source row, preserve this text.",
  ...overrides,
});
const eligible = [
  performance({}),
  performance({
    date: "2024-04-07",
    discipline: "Half Marathon",
    performance: "1:12:15",
    place: "10",
  }),
  performance({
    year: 2022,
    date: "2022-07-02",
    discipline: "5km",
    performance: "15:44",
    venue: "Leicester",
    meeting: "Leicester — 5km",
    verificationStatus: "unverified",
  }),
  performance({
    date: "2024-03-03",
    discipline: "10K",
    performance: "32:32",
    venue: "Partington",
    meeting: "Partington — 10km",
    timing: { chip: "32:32", gun: "32:35", basis: "chip" },
    verificationStatus: "unverified",
  }),
];
const ineligible = [
  performance({ date: "2023-09-29" }),
  performance({ performance: "2:25:57" }),
  performance({ venue: "Another city" }),
  performance({ discipline: "Trail Marathon" }),
  performance({ meeting: "Different race" }),
  performance({ labels: ["Trail"] }),
  performance({ labels: ["Road", "Track"] }),
  performance({ labels: "malformed" }),
  { ...eligible[3], timing: { chip: "32:32", gun: "32:36", basis: "chip" } },
  { ...eligible[3], timing: { chip: "32:31", gun: "32:35", basis: "chip" } },
  { ...eligible[3], timing: { gun: "32:35", basis: "gun" } },
];
const chipInPerformance = { ...eligible[3], timing: { gun: "32:35", basis: "chip" } };
const excluded = { ...eligible[2], profileExcluded: true, notes: "Synthetic excluded result" };
const rows = [...eligible, ...ineligible, excluded];
const db = new PGlite();
try {
  await db.exec(`
    create table athletes(id integer primary key, slug text unique, display_name text, profile_visibility text);
    create table athlete_source_histories(athlete_id integer,provider text,external_id text,source_url text,captured_at timestamptz,
      complete boolean,years_expected integer[],years_captured integer[],performances jsonb,published_at timestamptz,
      primary key(athlete_id,provider,external_id));
    create table athlete_profile_history_choices(user_id text,athlete_id integer,provider text,external_id text,
      performance_hash text,excluded boolean,confirmed_at timestamptz,
      primary key(user_id,athlete_id,provider,external_id,performance_hash));
    create table network_audit_log(id serial primary key,action text,entity_type text,entity_id text,before_value jsonb,after_value jsonb,note text);
    create table source_history_claim_results(id integer primary key,performance jsonb,available boolean);
    insert into athletes values(1,'synthetic-road-runner','Synthetic Road Runner','public'),(2,'different-runner','Synthetic Other Runner','public');
  `);
  const addHistory = (athleteId, externalId, performances, published = true) =>
    db.query(
      `insert into athlete_source_histories values($1,'Synthetic source',$2,'https://example.test/source','2026-10-01',true,'{2024}','{2024}',$3::jsonb,$4::timestamptz)`,
      [athleteId, externalId, JSON.stringify(performances), published ? "2026-10-01" : null],
    );
  await addHistory(1, "public", rows);
  await addHistory(1, "private", [eligible[0]], false);
  await addHistory(1, "optional-chip", [chipInPerformance]);
  await addHistory(2, "other", eligible);
  await db.query("insert into source_history_claim_results values(1,$1::jsonb,false)", [
    JSON.stringify(eligible[0]),
  ]);
  const addChoice = (row, value, user = "synthetic-owner") =>
    db.query(
      "insert into athlete_profile_history_choices values($1,1,'Synthetic source','public',md5($2::jsonb::text),$3,'2026-10-01')",
      [user, JSON.stringify(row), value],
    );
  await addChoice(eligible[0], true);
  await addChoice(eligible[1], false);
  const snapshot = async () => ({
    histories: (
      await db.query("select * from athlete_source_histories order by athlete_id,external_id")
    ).rows,
    choices: (
      await db.query(
        "select * from athlete_profile_history_choices order by user_id,performance_hash",
      )
    ).rows,
    audit: (await db.query("select * from network_audit_log order by id")).rows,
    athletes: (await db.query("select * from athletes order by id")).rows,
    claims: (await db.query("select * from source_history_claim_results order by id")).rows,
  });
  const before = await snapshot();
  await db.exec(migration);
  const after = await snapshot();
  const updated = after.histories.find(
    (h) => h.athlete_id === 1 && h.external_id === "public",
  ).performances;
  assert.equal(updated.length, rows.length, "No result is inserted, deleted or duplicated");
  assert.deepEqual(
    updated.slice(4, 4 + ineligible.length),
    ineligible,
    "Edition, mark, venue, discipline, title, timing and surface conflicts remain untouched",
  );
  assert.deepEqual(
    updated.slice(0, 4).map((r) => r.meeting),
    ["Berlin Marathon", "Berlin Half Marathon", "Saucony X Podium 5K (B race)", "Trafford 10K"],
  );
  for (const index of [0, 1, 2, 3, rows.length - 1]) {
    const { labels: oldLabels, meeting: oldMeeting, ...oldFacts } = rows[index];
    const { labels: newLabels, meeting: newMeeting, ...newFacts } = updated[index];
    assert.deepEqual(newLabels, [...oldLabels, "Road"]);
    assert.deepEqual(
      newFacts,
      oldFacts,
      "Timing precision, verification, exclusions and source evidence remain unchanged",
    );
    assert.notEqual(newMeeting, oldMeeting);
  }
  assert.equal(updated.at(-1).profileExcluded, true);
  for (const oldHistory of before.histories) {
    const newHistory = after.histories.find(
      (h) => h.athlete_id === oldHistory.athlete_id && h.external_id === oldHistory.external_id,
    );
    const { performances: oldPerformances, ...oldMetadata } = oldHistory;
    const { performances: newPerformances, ...newMetadata } = newHistory;
    assert.deepEqual(
      newMetadata,
      oldMetadata,
      "Publication, provenance and completeness remain unchanged",
    );
    if (oldHistory.athlete_id === 2)
      assert.deepEqual(
        newPerformances,
        oldPerformances,
        "Another athlete's matching records are untouched",
      );
  }
  assert.deepEqual(after.athletes, before.athletes);
  assert.deepEqual(after.claims, before.claims, "Claim references and availability are unchanged");
  assert.deepEqual(
    after.histories.find((h) => h.external_id === "optional-chip").performances,
    [
      {
        ...chipInPerformance,
        meeting: "Trafford 10K",
        labels: [...chipInPerformance.labels, "Road"],
      },
    ],
    "An explicitly chip-based mark needs no redundant timing.chip field",
  );
  assert.equal(after.audit.length, 7);
  const firstAudit = after.audit.find((a) => a.entity_id.endsWith(":public:0"));
  assert.deepEqual(firstAudit.before_value.performance, eligible[0]);
  assert.deepEqual(firstAudit.after_value.performance, updated[0]);
  assert.ok(firstAudit.after_value.sourceUrls.length > 0);
  for (const [index, expected] of [
    [0, true],
    [1, false],
  ]) {
    const { rows: choices } = await db.query(
      "select excluded,confirmed_at::text from athlete_profile_history_choices where performance_hash=md5($1::jsonb::text)",
      [JSON.stringify(updated[index])],
    );
    assert.equal(choices.length, 1);
    assert.equal(
      choices[0].excluded,
      expected,
      "Owner display choice survives the JSON hash change",
    );
    assert.ok(choices[0].confirmed_at.startsWith("2026-10-01"));
  }
  await db.exec(migration);
  assert.deepEqual(
    await snapshot(),
    after,
    "Replay adds no labels, choices, results or audit rows",
  );

  // Reset one exact preimage, then prove conflicting old/new choices roll back.
  await db.query(
    "update athlete_source_histories set performances=$1::jsonb where athlete_id=1 and external_id='public'",
    [JSON.stringify(rows)],
  );
  await db.query(
    "update athlete_profile_history_choices set excluded=false where performance_hash=md5($1::jsonb::text)",
    [JSON.stringify(updated[0])],
  );
  const beforeConflict = await snapshot();
  await assert.rejects(() => db.exec(migration), /Conflicting profile choices/);
  assert.deepEqual(
    await snapshot(),
    beforeConflict,
    "A choice conflict leaves the complete correction untouched",
  );
  await db.query(
    "update athlete_profile_history_choices set excluded=true where performance_hash=md5($1::jsonb::text)",
    [JSON.stringify(updated[0])],
  );

  // An audit failure must not leave a partial correction or copied preferences.
  await db.exec(`create function reject_road_audit() returns trigger language plpgsql as $$ begin raise exception 'synthetic audit failure'; end $$;
    create trigger reject_road_audit before insert on network_audit_log for each row execute function reject_road_audit();`);
  const beforeAuditFailure = await snapshot();
  await assert.rejects(() => db.exec(migration), /synthetic audit failure/);
  assert.deepEqual(await snapshot(), beforeAuditFailure);
  await db.exec("drop trigger reject_road_audit on network_audit_log");

  // A reused slug with a different identity cannot receive this correction.
  await db.exec("update athletes set display_name='Synthetic Different Identity' where id=1");
  const differentIdentity = await snapshot();
  await db.exec(migration);
  assert.deepEqual(await snapshot(), differentIdentity);
  console.log(
    "PASS: scoped road PB metadata, exact-match guards, unchanged result/verification/privacy facts, hash-preserved choices, private before/after audit, idempotency and atomic failures.",
  );
} finally {
  await db.close();
}
