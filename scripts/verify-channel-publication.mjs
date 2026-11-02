import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { readReviewedChannelRows } from "../src/lib/athrecs/channel-publication-query.ts";
import {
  channelNative,
  channelListing,
  channelQuestions,
} from "../src/lib/athrecs/english-channel.ts";
const dir = new URL("../src/data/channel-publication/", import.meta.url);
const data = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(new URL(f, dir))));
assert(data.length > 0);
for (const p of data) {
  assert(p.crossings.length && p.sources.length && p.flags.length && p.checkedAt);
  assert(
    !("held" in p) &&
      p.crossings.length === p.nativeCrossings.length &&
      p.otherEvents.length === p.nativeOtherEvents.length,
  );
  assert.equal(p.questions.length, 3);
  assert.deepEqual(
    p.nativeCrossings.map((c) => c.id),
    p.crossings.map((c) => c.id),
  );
  assert.doesNotMatch(
    JSON.stringify(channelNative(p)),
    /https?:\/\/|How this record was checked|"url":/i,
  );
  for (const card of [...p.crossings, ...p.otherEvents])
    assert(
      card.lines.some((l) => l.url),
      card.title + " lacks evidence",
    );
  for (const card of [...p.crossings, ...p.otherEvents, ...p.sources, ...p.media])
    for (const line of card.lines)
      if (line.url) assert(["https:", "http:"].includes(new URL(line.url).protocol));
}
const entries = new Map(data.map((p) => [p.slug, p]));
for (const slug of ["owen-okeefe-english-channel", "carol-cashell-english-channel"]) {
  assert.equal(channelListing(entries.get(slug)).relay, true, slug + " missing from relay filter");
}
const independentSolo = {
  ...data[0],
  nativeCrossings: [
    { title: "Independent solo after a relay", lines: [{ label: "Solo result", text: "12h" }] },
  ],
};
assert.equal(channelListing(independentSolo).relay, false);
const db = new PGlite();
const sql = { query: async (q, args) => (await db.query(q, args)).rows };
try {
  await db.exec(
    "create table athletes(id int,slug text,bio text,display_name text,profile_visibility text,profile_details jsonb);create table athlete_identifiers(athlete_id int);create table athlete_account_links(athlete_id int);create table network_audit_log(entity_type text,entity_id text,action text,after_value jsonb);",
  );
  const p = data[0],
    bio = p.biography.join("\n\n");
  const read = () => readReviewedChannelRows(sql, entries);
  assert.equal((await read()).length, 0);
  await db.query("insert into athletes values(1,$1,$2,$3,'public',$4)", [
    p.slug,
    bio,
    p.name,
    JSON.stringify({ channelArchiveRevision: p.revision }),
  ]);
  await db.exec("insert into athlete_identifiers values(1)");
  const receipt = (action, obj) =>
    db.query("insert into network_audit_log values('athlete','1',$1,$2)", [
      action,
      JSON.stringify(obj),
    ]);
  await receipt("athlete.profile_admin_published", {
    athleteId: 1,
    profile_visibility: "public",
    channelArchiveRevision: p.revision,
  });
  assert.equal((await read()).length, 0);
  await receipt("athlete.biography_admin_published", { athleteId: 1, biography: bio });
  assert.equal((await read())[0].slug, p.slug);
  await db.exec("update athletes set profile_visibility='private'");
  assert.equal((await read()).length, 0);
  await db.exec(
    "update athletes set profile_visibility='public';insert into athlete_account_links values(1)",
  );
  assert.equal((await read()).length, 0);
  await db.exec("delete from athlete_account_links; update athletes set bio='Changed'");
  assert.equal((await read()).length, 0);
  await db.query("update athletes set bio=$1,profile_details='{}'", [bio]);
  assert.equal((await read()).length, 0);
} finally {
  await db.close();
}
console.log(
  "Passed publication receipts, privacy, source separation, crossing IDs and source links for " +
    data.length +
    " published dossiers, " +
    data.reduce((a, p) => a + channelListing(p).swims, 0) +
    " swims.",
);

const { expandedChannelProfile } = await import("../src/lib/athrecs/channel-edition.server.ts");
const edition = JSON.parse(
  fs.readFileSync(
    new URL("../src/data/channel-editions/2026-11-02-endurance.json", import.meta.url),
  ),
);
const expanded = new Map();
let additions = 0;
for (const [slug, supplement] of Object.entries(edition)) {
  const base = entries.get(slug);
  const next = expandedChannelProfile(base, supplement);
  const ids = [...next.crossings, ...next.otherEvents].map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    next.nativeCrossings.map((c) => c.id),
    next.crossings.map((c) => c.id),
  );
  assert.deepEqual(
    next.nativeOtherEvents.map((c) => c.id),
    next.otherEvents.map((c) => c.id),
  );
  assert.doesNotMatch(JSON.stringify(channelNative(next)), /https?:\/\//);
  assert.equal(next.biography.at(-1), supplement.paragraph);
  assert.notEqual(next.revision, base.revision);
  expanded.set(slug, next);
  additions += supplement.events.length;
  for (const e of supplement.events) {
    assert.match(e.duration, /^\d+:[0-5]\d:[0-5]\d$/);
    assert.match(e.date, /^\d{4}(-\d{2}-\d{2})?$/);
    assert(e.refs.every((ref) => new URL(ref.url).protocol === "https:"));
    if (e.startTime && e.finishTime) {
      const seconds = (mark) => mark.split(":").reduce((a, b) => a * 60 + Number(b), 0);
      assert.equal(
        (seconds(e.finishTime) - seconds(e.startTime) + 86400) % 86400,
        seconds(e.duration),
        e.id,
      );
      if (e.date.length === 10) assert.equal(Boolean(e.endDate), e.startTime > e.finishTime);
    }
  }
}

for (const [slug, counts] of [
  ["alison-streeter-english-channel", "38 selected solo performances"],
  ["des-renford-english-channel", "19 selected solo performances"],
  [
    "shelley-taylor-smith-english-channel",
    "1 selected solo performance and 1 named relay participation",
  ],
]) {
  const p = expanded.get(slug);
  const questions = channelQuestions(p);
  assert(questions[0].value.includes(counts));
  assert.deepEqual(questions.slice(1), p.questions.slice(1));
}

const versionDb = new PGlite();
try {
  const base = entries.get(Object.keys(edition)[0]);
  const next = expanded.get(base.slug);
  await versionDb.exec(
    "create table athletes(id int,slug text,bio text,display_name text,profile_visibility text,profile_details jsonb);create table athlete_identifiers(athlete_id int);create table athlete_account_links(athlete_id int);create table network_audit_log(entity_type text,entity_id text,action text,after_value jsonb);insert into athlete_identifiers values(1);",
  );
  const sql = { query: async (q, args) => (await versionDb.query(q, args)).rows };
  const read = () => readReviewedChannelRows(sql, entries, base.slug, expanded);
  await versionDb.query("insert into athletes values(1,$1,$2,$3,'public',$4)", [
    base.slug,
    base.biography.join("\n\n"),
    base.name,
    JSON.stringify({ channelArchiveRevision: base.revision }),
  ]);
  for (const p of [base, next]) {
    const bio = p.biography.join("\n\n");
    await versionDb.query("update athletes set bio=$1, profile_details=$2", [
      bio,
      JSON.stringify({ channelArchiveRevision: p.revision }),
    ]);
    assert.equal((await read()).length, 0);
    for (const [action, fields] of [
      [
        "athlete.profile_admin_published",
        { profile_visibility: "public", channelArchiveRevision: p.revision },
      ],
      ["athlete.biography_admin_published", { biography: bio }],
    ]) {
      await versionDb.query("insert into network_audit_log values('athlete','1',$1,$2)", [
        action,
        JSON.stringify({ athleteId: 1, ...fields }),
      ]);
    }
    assert.equal((await read())[0].revision, p.revision);
  }
  await versionDb.exec("insert into athlete_account_links values(1)");
  assert.equal((await read()).length, 0);
} finally {
  await versionDb.close();
}
console.log(
  "Checked " + additions + " additional performances and both receipt-bound archive editions.",
);
