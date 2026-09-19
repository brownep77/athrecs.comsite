import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  publishAthleteProfiles,
  loadPublishedSourceHistories,
} from "../src/lib/athrecs/athlete-publication.server.ts";

// The real publication transaction against an isolated PostgreSQL-compatible database.
const db = new PGlite();
function sqlFor(connection) {
  const sql = async (strings, ...values) =>
    (
      await connection.query(
        strings.reduce((text, part, i) => text + (i ? `$${i}` : "") + part, ""),
        values,
      )
    ).rows;
  sql.transaction = (work) => connection.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db);
try {
  await db.exec(`
    create table "user" (id text primary key);
    insert into "user" values ('staff'), ('owner');
    create table athletes (id integer primary key, profile_visibility text default 'private', profile_type text default 'Athlete', bio text default 'Unchanged');
    insert into athletes(id) select generate_series(1,56);
    update athletes set profile_visibility='public' where id=3;
    update athletes set profile_type='Public figure' where id=4;
    create table athlete_identifiers (number bigint primary key, athlete_id integer, user_id text);
    insert into athlete_identifiers(number,athlete_id) select id+100, id from athletes;
    insert into athlete_identifiers values (999, null, 'owner');
    create table athlete_account_links (athlete_id integer, user_id text, status text);
    insert into athlete_account_links values (5,'owner','active');
    create table results (id integer primary key, athlete_id integer, result_visibility text);
    insert into results select id, id, 'private' from athletes;
    insert into results values (1000,1,'public_figure');
    create table network_audit_log (
      actor_user_id text references "user"(id), actor_email text, action text,
      entity_type text, entity_id text, before_value jsonb, after_value jsonb, note text
    );
  `);
  await db.exec(
    await readFile(
      new URL("../migrations/0035_athlete_source_histories.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(
    await readFile(
      new URL("../migrations/0036_source_history_publication.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
    select id, 'powerof10', id::text, 'https://example.test/'||id, now(), true, array[2026], array[2026], '[]'::jsonb from athletes`);
  const actor = { userId: "staff", staffEmail: "staff@example.test" };
  assert.deepEqual(await loadPublishedSourceHistories(sql, 1), []);
  const result = await publishAthleteProfiles(
    sql,
    ["101", "102", "101", "103", "104", "105", "999", "999999"],
    actor,
  );
  assert.deepEqual(result, { published: 2, resultsPublished: 2, skipped: 5 });
  assert.deepEqual(
    (await sql`select id from athletes where profile_visibility='public' order by id`).map(
      (r) => r.id,
    ),
    [1, 2, 3],
  );
  assert.equal(
    (await sql`select result_visibility from results where id=1000`)[0].result_visibility,
    "public_figure",
  );
  assert.equal((await sql`select count(*)::int n from network_audit_log`)[0].n, 2);
  assert.equal((await sql`select count(*)::int n from athletes where bio <> 'Unchanged'`)[0].n, 0);
  assert.equal((await loadPublishedSourceHistories(sql, 1)).length, 1);
  assert.deepEqual(
    await loadPublishedSourceHistories(sql, 3),
    [],
    "An existing public profile does not expose a private source archive",
  );
  assert.deepEqual(await loadPublishedSourceHistories(sql, 5), []);
  assert.deepEqual(await publishAthleteProfiles(sql, ["101", "102"], actor), {
    published: 0,
    resultsPublished: 0,
    skipped: 2,
  });

  // Roll back visibility and results if any part of publication fails.
  await db.exec(`create function reject_test_publication() returns trigger language plpgsql as $$ begin raise exception 'test publication failure'; end $$;
    create trigger reject_test_publication before update on athlete_source_histories for each row execute function reject_test_publication();`);
  await assert.rejects(publishAthleteProfiles(sql, ["106"], actor), /test publication failure/);
  assert.equal(
    (await sql`select profile_visibility from athletes where id=6`)[0].profile_visibility,
    "private",
  );
  assert.equal(
    (await sql`select result_visibility from results where id=6`)[0].result_visibility,
    "private",
  );
  assert.equal((await sql`select count(*)::int n from network_audit_log`)[0].n, 2);
  await db.exec("drop trigger reject_test_publication on athlete_source_histories");
  const all = Array.from({ length: 51 }, (_, i) => String(i + 106));
  assert.equal(
    (await publishAthleteProfiles(sql, all, actor)).published,
    51,
    "Publication spans multiple directory pages",
  );
  await db.exec(`insert into athlete_account_links values (1,'owner','active')`);
  assert.deepEqual(
    await loadPublishedSourceHistories(sql, 1),
    [],
    "Claiming a profile stops staff archive sharing",
  );
  await db.exec(`update athletes set profile_visibility='private' where id=2`);
  assert.deepEqual(
    await loadPublishedSourceHistories(sql, 2),
    [],
    "A profile made private no longer exposes source history",
  );
  console.log(
    "Athlete bulk publication passed: exact selection, account exclusions, result/history visibility, repeat safety, multiple pages and atomic rollback.",
  );
} finally {
  await db.close();
}
