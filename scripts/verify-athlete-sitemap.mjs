import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  athleteSitemapPageCount,
  athleteSitemapSlugs,
  sitemapXml,
} from "../src/lib/athrecs/athlete-sitemap.server.ts";

import { isApprovedAthleteIndexable } from "../src/lib/athrecs/athlete-search-policy.server.ts";

const db = new PGlite();
const sql = { query: async (query, values) => (await db.query(query, values)).rows };
try {
  await db.exec(`
    create table athletes (id int primary key, slug text, profile_type text, profile_visibility text);
    create table athlete_public_shares (user_id text, enabled boolean, share_results boolean, search_indexable boolean);
    create table athlete_account_links (athlete_id int, user_id text, status text);
    create table athlete_resolved_ids (athlete_id int);
    create table athlete_source_histories (athlete_id int, provider text, external_id text, published_at timestamptz);
    create table network_audit_log (entity_id text, action text, after_value jsonb);
    insert into athletes select i, 'athlete-' || i, 'Athlete', 'public' from generate_series(1, 5001) i;
    insert into athletes values
      (5002, 'private-source', 'Athlete', 'private'),
      (5003, 'private-public-figure', 'Public figure', 'private'),
      (5004, 'account-no-sharing-choice', 'Athlete', 'public'),
      (5005, 'unlisted-account', 'Athlete', 'public'),
      (5006, 'released-source', 'Athlete', 'public'),
      (5007, 'no-history', 'Athlete', 'public'),
      (5008, 'unapproved-history', 'Athlete', 'public'),
      (5009, 'wrong-athlete-approval', 'Athlete', 'public'),
      (5010, 'unpublished-history', 'Athlete', 'public'),
      (5011, 'search-opt-in', 'Athlete', 'public'),
      (5012, 'sharing-withdrawn', 'Athlete', 'public'),
      (5013, 'results-withdrawn', 'Athlete', 'public'),
      (5014, 'missing-identifier', 'Athlete', 'public');
    insert into athlete_resolved_ids select id from athletes where id <> 5014;
    insert into athlete_source_histories
      select id, 'synthetic', id::text, case when id=5010 then null else now() end
      from athletes where id <> 5007;
    insert into network_audit_log
      select 'synthetic:' || id, 'athlete.history_admin_published',
        jsonb_build_object('athleteId', case when id=5009 then 9999 else id end)
      from athletes where id <> 5008;
    insert into network_audit_log select * from network_audit_log where entity_id='synthetic:1';
    insert into athlete_account_links values
      (5004, 'missing-choice', 'active'), (5005, 'unlisted', 'active'),
      (5006, 'withdrawn', 'revoked'), (5011, 'opt-in', 'active'),
      (5012, 'withdrawn', 'active'), (5013, 'results-withdrawn', 'active');
    insert into athlete_public_shares values
      ('unlisted', true, true, false), ('opt-in', true, true, true),
      ('withdrawn', false, true, true), ('results-withdrawn', true, false, true);
  `);
  assert.equal(await athleteSitemapPageCount(sql), 2);
  const first = await athleteSitemapSlugs(sql, 1);
  const second = await athleteSitemapSlugs(sql, 2);
  assert.equal(first.length, 5000);
  assert.deepEqual(second, ["athlete-5001", "released-source", "search-opt-in"]);
  assert.equal(new Set([...first, ...second]).size, 5003);
  assert.deepEqual(await athleteSitemapSlugs(sql, 3), []);
  for (const page of [0, -1, 1.5, NaN]) assert.deepEqual(await athleteSitemapSlugs(sql, page), []);
  for (let id = 5001; id <= 5014; id++) {
    assert.equal(
      await isApprovedAthleteIndexable(sql, id),
      [5001, 5006, 5011].includes(id),
      `Indexing decision for ${id}`,
    );
  }
  await db.exec("update athletes set profile_visibility='private' where id=5001");
  assert(
    !(await athleteSitemapSlugs(sql, 2)).includes("athlete-5001"),
    "Privacy changes apply immediately",
  );
  await db.exec("update athletes set profile_visibility='public' where id=5002");
  assert(
    (await athleteSitemapSlugs(sql, 2)).includes("private-source"),
    "Approved publications need no rebuild",
  );
  await db.exec("update athlete_public_shares set search_indexable=false where user_id='opt-in'");
  assert.equal(await isApprovedAthleteIndexable(sql, 5011), false);
  assert(!(await athleteSitemapSlugs(sql, 2)).includes("search-opt-in"));
  await db.exec("update athlete_public_shares set search_indexable=true where user_id='opt-in'");
  await db.exec("insert into athlete_account_links values (5011, 'missing-choice', 'active')");
  assert.equal(
    await isApprovedAthleteIndexable(sql, 5011),
    false,
    "Every active owner must permit indexing",
  );
  await db.exec(
    "update athlete_account_links set status='revoked' where athlete_id=5011 and user_id='missing-choice'",
  );
  assert.equal(await isApprovedAthleteIndexable(sql, 5011), true);
  await db.exec("update athlete_source_histories set published_at=null where athlete_id=5011");
  assert.equal(
    await isApprovedAthleteIndexable(sql, 5011),
    true,
    "Owner-approved profile remains public while an individual history is withdrawn",
  );
  await db.exec("update athlete_account_links set status='revoked' where athlete_id=5011");
  assert.equal(
    await isApprovedAthleteIndexable(sql, 5011),
    false,
    "An unpublished history without another publication approval is excluded",
  );
  await db.exec("delete from network_audit_log where entity_id='synthetic:5006'");
  assert.equal(await isApprovedAthleteIndexable(sql, 5006), false, "Missing approval fails closed");
  await db.exec(`
    insert into network_audit_log values ('5007', 'athlete.bulk_publish', '{"profile_visibility":"public"}');
  `);
  assert.equal(
    await isApprovedAthleteIndexable(sql, 5007),
    true,
    "Existing audited bulk publications do not require a separate history-editor approval",
  );
  await db.exec("update athletes set profile_visibility='private' where id=5007");
  assert.equal(
    await isApprovedAthleteIndexable(sql, 5007),
    false,
    "A historical bulk approval never overrides current private visibility",
  );
  await db.exec(`
    insert into network_audit_log values ('5008', 'athlete.bulk_publish', '{"profile_visibility":"private"}');
  `);
  assert.equal(
    await isApprovedAthleteIndexable(sql, 5008),
    false,
    "A non-public audit is not publication permission",
  );
  assert.match(
    sitemapXml([{ url: "https://example.test/race", lastmod: "2026-10-07" }]),
    /<lastmod>2026-10-07<\/lastmod>/,
  );
  assert(!sitemapXml(["https://example.test/unchanged"]).includes("lastmod"));
  assert.match(sitemapXml(["https://example.test/a?x=1&y=2"]), /x=1&amp;y=2/);
  assert.match(sitemapXml(["https://example.test/sitemaps/athletes-1.xml"], true), /<sitemapindex/);
  console.log(
    "Athlete sitemap passed: complete pagination, audited publication, matching page eligibility, private/unapproved exclusions, owner opt-in/withdrawal and XML escaping.",
  );
} finally {
  await db.close();
}
