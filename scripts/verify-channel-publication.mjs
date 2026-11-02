import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { readReviewedChannelRows } from "../src/lib/athrecs/channel-publication-query.ts";
import { channelNative, channelListing } from "../src/lib/athrecs/english-channel.ts";
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
