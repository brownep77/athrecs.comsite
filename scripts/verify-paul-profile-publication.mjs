import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Prove the one-profile publication migration preserves all other visibility,
// existing share choices, hidden results and permanent athlete references.
const db = new PGlite();
try {
  await db.waitReady;
  const root = new URL("../", import.meta.url);
  for (const name of (await readdir(new URL("migrations/", root))).sort()) {
    if (name.endsWith(".sql"))
      await db.exec(await readFile(new URL(`migrations/${name}`, root), "utf8"));
  }
  await db.exec(`
    insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
    values ('publish-paul', 'Paul Test', 'paul@example.test', true, now(), now()),
           ('publish-other', 'Other Test', 'other@example.test', true, now(), now());
    insert into athlete_private_profiles (user_id, verified_email, full_name, privacy_notice_version, privacy_acknowledged_at, profile_details)
    values ('publish-paul', 'paul@example.test', 'Paul Test', 'test', now(), '{"birthdayVisibility":"hidden"}'),
           ('publish-other', 'other@example.test', 'Other Test', 'test', now(), '{}');
    insert into athletes (id, slug, display_name, profile_visibility, profile_details)
    values (91001, 'paul-browne', 'Paul Test', 'private', '{"birthdayVisibility":"hidden"}'),
           (91002, 'other-publish-test', 'Other Test', 'private', '{}');
    insert into athlete_account_links (athlete_id, user_id, user_email)
    values (91001, 'publish-paul', 'paul@example.test'), (91002, 'publish-other', 'other@example.test');
    insert into athlete_public_shares (user_id, slug, enabled, share_bio, share_results, share_club, share_location)
    values ('publish-paul', 'existing-paul-share', false, false, true, false, false),
           ('publish-other', 'existing-other-share', false, true, true, true, true);
    insert into events (id, slug, name, sport) values (91001, 'publication-test', 'Test event', 'Running');
    insert into editions (id, event_id, event_date, distance_code) values (91001, 91001, '2025-01-01', '10K');
    insert into results (id, edition_id, athlete_id, result_visibility)
    values (91001, 91001, 91001, 'private'), (91002, 91001, 91002, 'private');
    insert into athlete_profile_hidden_results (user_id, result_id) values ('publish-paul', 91001);
  `);
  const beforeIds = (
    await db.query(
      "select athlete_id, athlete_number, source_number from athlete_resolved_ids order by athlete_id",
    )
  ).rows;
  const otherBefore = (
    await db.query("select row_to_json(a) as row from athletes a where id=91002")
  ).rows;
  let migration;
  try {
    migration = await readFile(
      new URL("migrations/0034_publish_paul_compact_profile.sql", root),
      "utf8",
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    migration = await readFile(
      new URL("ops/pending-migrations/0034_publish_paul_compact_profile.sql", root),
      "utf8",
    );
  }
  await db.exec(migration);
  await db.exec(migration);
  assert.deepEqual(
    (await db.query("select id, profile_visibility from athletes order by id")).rows,
    [
      { id: 91001, profile_visibility: "public" },
      { id: 91002, profile_visibility: "private" },
    ],
  );
  assert.deepEqual((await db.query("select id, result_visibility from results order by id")).rows, [
    { id: 91001, result_visibility: "public" },
    { id: 91002, result_visibility: "private" },
  ]);
  assert.deepEqual(
    (
      await db.query(
        "select user_id, slug, enabled, share_bio, share_club, share_location from athlete_public_shares order by user_id",
      )
    ).rows,
    [
      {
        user_id: "publish-other",
        slug: "existing-other-share",
        enabled: false,
        share_bio: true,
        share_club: true,
        share_location: true,
      },
      {
        user_id: "publish-paul",
        slug: "existing-paul-share",
        enabled: true,
        share_bio: false,
        share_club: false,
        share_location: false,
      },
    ],
  );
  assert.deepEqual(
    (
      await db.query(
        "select athlete_id, athlete_number, source_number from athlete_resolved_ids order by athlete_id",
      )
    ).rows,
    beforeIds,
  );
  assert.deepEqual(
    (await db.query("select row_to_json(a) as row from athletes a where id=91002")).rows,
    otherBefore,
  );
  assert.equal(
    (await db.query("select count(*)::int as n from athlete_profile_hidden_results")).rows[0].n,
    1,
  );
  assert.equal(
    (
      await db.query(
        "select profile_details->>'birthdayVisibility' as visibility from athletes where id=91001",
      )
    ).rows[0].visibility,
    "hidden",
  );
  assert.equal(
    (
      await db.query(
        "select profile_details->>'birthdayVisibility' as visibility from athlete_private_profiles where user_id='publish-paul'",
      )
    ).rows[0].visibility,
    "hidden",
  );
  // An account without a share also gets a stable, usable opt-in record.
  await db.exec("delete from athlete_public_shares where user_id='publish-paul'");
  await db.exec(migration);
  const created = (
    await db.query(
      "select slug, enabled, share_results from athlete_public_shares where user_id='publish-paul'",
    )
  ).rows[0];
  assert.match(created.slug, /^paul-browne-[a-f0-9]{8}$/);
  assert.equal(created.enabled, true);
  assert.equal(created.share_results, true);
  console.log(
    "Paul publication migration passed: scoped visibility, repeat application, stable references, preserved sharing and privacy.",
  );
} finally {
  await db.close();
}
