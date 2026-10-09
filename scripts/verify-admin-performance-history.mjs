import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  publishAdminHistory,
  readManagedHistory,
  excludeHistoryPerformance,
} from "../src/lib/athlete-workspace/admin-history.server.ts";
import { loadPublishedSourceHistories } from "../src/lib/athrecs/athlete-publication.server.ts";
import { buildRaceWinAchievements } from "../src/lib/athrecs/race-win-achievements.ts";
const db = new PGlite();
const sqlFor = (c) => {
  const sql = async (strings, ...values) =>
    (
      await c.query(
        strings.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
        values,
      )
    ).rows;
  sql.transaction = (fn) => c.transaction((tx) => fn(sqlFor(tx)));
  return sql;
};
const sql = sqlFor(db),
  staff = { userId: "staff", staff: true },
  owner = { userId: "owner", staff: false },
  stranger = { userId: "stranger", staff: false };
try {
  await db.exec(`create table "user"(id text primary key,"emailVerified" boolean);insert into "user" values ('staff',true),('owner',true),('stranger',true);
 create table athletes(id int primary key,profile_visibility text,profile_type text);insert into athletes values(1,'public','Athlete'),(2,'private','Athlete');
 create table athlete_account_links(athlete_id int,user_id text,status text);insert into athlete_account_links values(1,'owner','active');
 create table athlete_public_shares(user_id text,enabled boolean,share_results boolean);
 create table network_audit_log(id serial,actor_user_id text,action text,entity_type text,entity_id text,before_value jsonb,after_value jsonb,note text);
 create table athlete_result_proposals(id uuid primary key,athlete_id int,revision int,entries jsonb,updated_at timestamptz);
 create table athlete_result_review_invitations(batch_id uuid,revoked_at timestamptz,responded_at timestamptz);`);
  for (const file of ["0035_athlete_source_histories.sql", "0036_source_history_publication.sql"])
    await db.exec(await readFile(new URL("../migrations/" + file, import.meta.url), "utf8"));
  const row = {
    year: 2012,
    yearLabel: "2011 / 2012",
    date: "",
    dateLabel: "29 Jan · 2011 / 2012",
    sourceDate: "29 Jan",
    ageGroup: "",
    discipline: "60m",
    performance: "8.04i",
    wind: "",
    place: "3",
    venue: "Synthetic arena",
    meeting: "Synthetic games",
    sourceUrls: ["https://example.test/results"],
    labels: [],
    notes: "Year unresolved; mark retained exactly.",
  };
  const batchId = crypto.randomUUID();
  await sql`insert into athlete_result_proposals values(${batchId}::uuid,1,1,${JSON.stringify([{ index: 1, state: "pending", race: row.meeting, response: "unsure" }])}::jsonb,now())`;
  const input = {
    athleteId: 1,
    requestId: crypto.randomUUID(),
    sourceUrl: row.sourceUrls[0],
    performances: [row],
    administratorApproval: true,
    reason: "Administrator approved an unverified historic performance with provenance.",
    batches: [{ id: batchId, revision: 1, indexes: [1] }],
  };
  await assert.rejects(() => publishAdminHistory(sql, input, owner), /Staff/);
  await assert.rejects(() =>
    publishAdminHistory(sql, { ...input, administratorApproval: false }, staff),
  );
  await assert.rejects(
    () => publishAdminHistory(sql, { ...input, athleteId: 2 }, staff),
    /private/,
  );
  await db.exec(`insert into athlete_public_shares values('owner',false,true)`);
  await assert.rejects(() => publishAdminHistory(sql, input, staff), /disabled/);
  await db.exec(`delete from athlete_public_shares`);
  await sql`update athlete_result_proposals set entries='[{"index":1,"state":"pending","response":"no"}]' where id=${batchId}::uuid`;
  await assert.rejects(() => publishAdminHistory(sql, input, staff), /denied/);
  await sql`update athlete_result_proposals set entries='[{"index":1,"state":"pending","response":"unsure"}]' where id=${batchId}::uuid`;
  assert.deepEqual(await publishAdminHistory(sql, input, staff), { added: 1, replay: false });
  assert.deepEqual(await publishAdminHistory(sql, input, staff), { added: 1, replay: true });
  await assert.rejects(
    () => publishAdminHistory(sql, { ...input, reason: "Changed content must not replay." }, staff),
    /different data/,
  );
  const [published] = await loadPublishedSourceHistories(sql, 1);
  assert.equal(published.performances[0].performance, "8.04i");
  assert.equal(published.performances[0].date, "");
  assert.equal(published.performances[0].verificationStatus, "unverified");
  const [batch] = await sql`select entries from athlete_result_proposals where id=${batchId}::uuid`;
  assert.equal(batch.entries[0].state, "approved");
  assert.equal(batch.entries[0].response, "unsure");
  assert.equal(batch.entries[0].responseBy, undefined);
  assert.equal((await readManagedHistory(sql, 1, owner))[0].performances.length, 1);
  await assert.rejects(() => readManagedHistory(sql, 1, stranger), /linked athlete/);
  const removal = {
    athleteId: 1,
    externalId: input.requestId,
    index: 0,
    excluded: true,
    reason: "Not mine.",
  };
  await assert.rejects(() => excludeHistoryPerformance(sql, removal, stranger), /linked athlete/);
  await assert.rejects(() => excludeHistoryPerformance(sql, removal, staff), /linked athlete/);
  await excludeHistoryPerformance(sql, removal, owner);
  assert.equal((await loadPublishedSourceHistories(sql, 1))[0].performances.length, 0);
  assert.equal((await readManagedHistory(sql, 1, owner))[0].performances[0].profileExcluded, true);
  await excludeHistoryPerformance(sql, { ...removal, excluded: false }, owner);
  assert.equal((await loadPublishedSourceHistories(sql, 1))[0].performances.length, 1);
  await assert.rejects(
    () => excludeHistoryPerformance(sql, { ...removal, athleteId: 2 }, owner),
    /linked athlete/,
  );
  await db.exec(`insert into athlete_public_shares values('owner',true,false)`);
  assert.deepEqual(await loadPublishedSourceHistories(sql, 1), []);
  await db.exec(
    `delete from athlete_public_shares;update athletes set profile_visibility='private' where id=1`,
  );
  assert.deepEqual(await loadPublishedSourceHistories(sql, 1), []);
  await db.exec(`update athletes set profile_visibility='public' where id=1`);
  assert.deepEqual(
    buildRaceWinAchievements(
      [],
      [
        {
          ...published,
          performances: [
            {
              ...row,
              date: "2020-01-01",
              discipline: "5K",
              performance: "20:00",
              labels: ["Overall Position: 1"],
              verificationStatus: "unverified",
            },
          ],
        },
      ],
    ),
    [],
  );
  const count = (await sql`select count(*)::int as n from athlete_source_histories`)[0].n;
  await db.exec(
    `create function reject_history_audit() returns trigger language plpgsql as $$ begin raise exception 'synthetic audit failure'; end $$;create trigger reject_history_audit before insert on network_audit_log for each row execute function reject_history_audit();`,
  );
  await assert.rejects(
    () =>
      publishAdminHistory(sql, { ...input, requestId: crypto.randomUUID(), batches: [] }, staff),
    /synthetic audit failure/,
  );
  assert.equal((await sql`select count(*)::int as n from athlete_source_histories`)[0].n, count);
  console.log(
    "PASS: staff-only explicit approval, unchanged athlete response, raw precision/unknown dates, atomic audit, replay, denial/private sharing protection, owner-only removal/restore and exclusion from verified wins.",
  );
} finally {
  await db.close();
}
