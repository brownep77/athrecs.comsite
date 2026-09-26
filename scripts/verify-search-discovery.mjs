import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { contentSitemapPageCount, contentSitemapPaths } from "../src/lib/athrecs/content-sitemap.server.ts";
import { resultSlug, resultEditionId } from "../src/lib/athrecs/result-slug.ts";

const first = { edition_id: 17, event_name: "Éxample Race", event_date: "2026-09-20", distance_code: "10K" };
assert.equal(resultSlug(first), "example-race-2026-09-20-10k-17");
assert.equal(resultEditionId(resultSlug(first)), 17);
assert.equal(resultEditionId("17"), 17);
assert.notEqual(resultSlug(first), resultSlug({ ...first, edition_id: 18 }));
assert.equal(resultEditionId(resultSlug({ ...first, event_name: "Renamed race" })), 17);
for (const bad of ["", "../17", "abc", "race-0", "race-2147483648", "race-1?x=2", -1, null]) assert.throws(() => resultEditionId(bad));

const db = new PGlite();
const sql = { query: async (query, values) => (await db.query(query, values)).rows };
try {
  await db.exec(`
    create table events (id int primary key, slug text unique, name text, sport text, country text);
    create table editions (id int primary key, event_id int, event_date date, distance_code text);
    create table clubs (id int primary key, slug text unique, sports text);
    create table athletes (id int primary key, club_id int, profile_visibility text, profile_type text);
    create table results (id int primary key, edition_id int, athlete_id int, result_visibility text);
    create table athlete_account_links (athlete_id int, user_id text, status text);
    create table athlete_public_shares (user_id text, enabled bool, share_results bool);
    create table athlete_profile_hidden_results (user_id text, result_id int);
    create table catalogue_change_log (revision_id int, entity_type text, operation text, after_json jsonb);
    create table catalogue_revisions (id int, batch_id int);
    create table catalogue_import_batches (id int, source_key text);
    insert into events values
      (1, 'track-meeting', 'Track Meeting', 'Athletics', 'United Kingdom'),
      (2, 'short-road-race', 'Short Road Race', 'Running', 'Ireland'),
      (3, 'runrecs-only', 'RunRecs Only', 'Running', 'Ireland'),
      (4, 'marathon', 'Marathon', 'Running', 'United Kingdom'),
      (5, 'outside-window', 'Outside Window', 'Running', 'Ireland'),
      (6, 'cycling', 'Cycling', 'Cycling', 'United Kingdom');
    insert into editions values (1,1,'2026-09-20','1500m'), (2,2,'2026-09-20','10K'),
      (3,3,'2026-09-20','5K'), (4,4,'2026-09-20','Marathon'), (5,5,'2028-01-01','5K'),
      (6,6,'2026-09-20','Road race'), (7,1,'9999-01-01','1500m'),
      (8,1,'2026-09-20','800m'), (9,1,'2026-09-20','400m'),
      (10,1,'2026-09-20','200m'), (11,1,'2026-09-20','100m');
    insert into catalogue_import_batches values (1,'runrecs:collector:test');
    insert into catalogue_revisions values (1,1);
    insert into catalogue_change_log values (1,'edition','insert','{"record":{"id":3}}');
    insert into clubs values (1,'athletics-club','Athletics'), (2,'running-club','Running'),
      (3,'private-member-only','Running'), (4,'out-of-scope','Cycling');
    insert into athletes values (1,2,'public','Athlete'), (2,3,'private','Athlete'),
      (3,4,'public','Athlete'), (4,1,'public','Athlete'), (5,1,'public','Athlete'),
      (6,1,'public','Athlete');
    insert into results values (1,1,1,'public'), (2,8,2,'public'), (3,6,3,'public'),
      (4,9,4,'public'), (5,10,5,'public'), (6,11,6,'private'), (7,7,1,'public');
    insert into athlete_account_links values (4,'disabled','active'), (5,'hidden','active');
    insert into athlete_public_shares values ('disabled',false,true), ('hidden',true,true);
    insert into athlete_profile_hidden_results values ('hidden',5);
  `);
  assert.deepEqual(await contentSitemapPaths(sql, "races", 1), ["/races/track-meeting", "/races/short-road-race"]);
  assert.deepEqual(await contentSitemapPaths(sql, "clubs", 1), ["/clubs/athletics-club", "/clubs/running-club"]);
  assert.deepEqual(await contentSitemapPaths(sql, "results", 1), ["/results/track-meeting-2026-09-20-1500m-1", "/results/cycling-2026-09-20-road-race-6"]);
  assert.equal(await contentSitemapPageCount(sql, "results"), 1);
  await db.exec("update athlete_public_shares set enabled=true where user_id='disabled'");
  assert((await contentSitemapPaths(sql,"results",1)).some((url)=>url.endsWith('-9')));
  await db.exec("update results set result_visibility='private' where id=1");
  assert(!(await contentSitemapPaths(sql,"results",1)).some((url)=>url.endsWith('-1')));
  await db.exec("insert into clubs select id, 'club-' || id, 'Athletics' from generate_series(10,5009) id");
  assert.equal(await contentSitemapPageCount(sql,"clubs"),2);
  const clubs=[...await contentSitemapPaths(sql,"clubs",1),...await contentSitemapPaths(sql,"clubs",2)];
  assert.equal(clubs.length,5002);
  assert.equal(new Set(clubs).size,5002);
  assert.deepEqual(await contentSitemapPaths(sql,"clubs",3),[]);
  assert.deepEqual(await contentSitemapPaths(sql,"clubs",0),[]);
  console.log("PASS: readable collision-safe result URLs; complete sitemap pagination; event scope; RunRecs exclusions; private, hidden, disabled and future result exclusions; immediate publication changes.");
} finally { await db.close(); }
