import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";
const root = process.cwd();
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith("@/") ||
      (specifier.startsWith(".") &&
        context.parentURL?.startsWith(pathToFileURL(`${root}/src/`).href))
    ) {
      let target = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : fileURLToPath(new URL(specifier, context.parentURL));
      if (!path.extname(target))
        target = fs.existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, "index.ts");
      return nextResolve(pathToFileURL(target).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const { contentSitemapPageCount, contentSitemapPaths } =
  await import("../src/lib/athrecs/content-sitemap.server.ts");
const { eventByPublicSlug } = await import("../src/lib/athrecs/event-slug.server.ts");
import { resultSlug, resultEditionId } from "../src/lib/athrecs/result-slug.ts";

const first = {
  edition_id: 17,
  event_name: "Éxample Race",
  event_date: "2026-09-20",
  distance_code: "10K",
};
assert.equal(resultSlug(first), "example-race-2026-09-20-10k-17");
assert.equal(resultEditionId(resultSlug(first)), 17);
assert.equal(resultEditionId("17"), 17);
assert.notEqual(resultSlug(first), resultSlug({ ...first, edition_id: 18 }));
assert.equal(resultEditionId(resultSlug({ ...first, event_name: "Renamed race" })), 17);
for (const bad of ["", "../17", "abc", "race-0", "race-2147483648", "race-1?x=2", -1, null])
  assert.throws(() => resultEditionId(bad));

const db = new PGlite();
const sql = { query: async (query, values) => (await db.query(query, values)).rows };
try {
  await db.exec(`
    create table events (id int primary key, slug text unique, name text, sport text, country text);
    create table slug_redirects (entity_type text, entity_id int, old_slug text, current_slug text, primary key(entity_type, old_slug));
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
      (6, 'cycling', 'Cycling', 'Cycling', 'United Kingdom'),
      (7, 'parkrun', 'Parkrun', 'Parkrun', 'Australia'),
      (8, 'triathlon', 'Synthetic Triathlon', 'Triathlon', 'United Kingdom');
    insert into editions values (1,1,'2026-09-20','1500m'), (2,2,'2026-09-20','10K'),
      (3,3,'2026-09-20','5K'), (4,4,'2026-09-20','Marathon'), (5,5,'2028-01-01','5K'),
      (6,6,'2026-09-20','Road race'), (7,1,'9999-01-01','1500m'),
      (8,1,'2026-09-20','800m'), (9,1,'2026-09-20','400m'),
      (10,1,'2026-09-20','200m'), (11,1,'2026-09-20','100m'),
      (12,8,'2026-09-20','Sprint');
    insert into catalogue_import_batches values (1,'runrecs:collector:test');
    insert into catalogue_revisions values (1,1);
    insert into catalogue_change_log values (1,'edition','insert','{"record":{"id":3}}');
    insert into clubs values (1,'athletics-club','Athletics'), (2,'running-club','Running'),
      (3,'private-member-only','Cycling'), (4,'out-of-scope','Cycling'),
      (5,'triathlon-club','Triathlon'), (6,'triathlon-result-club',''),
      (7,'private-triathlon-only','');
    insert into athletes values (1,2,'public','Athlete'), (2,3,'private','Athlete'),
      (3,4,'public','Athlete'), (4,1,'public','Athlete'), (5,1,'public','Athlete'),
      (6,1,'public','Athlete'), (7,6,'public','Athlete'), (8,7,'private','Athlete');
    insert into results values (1,1,1,'public'), (2,8,2,'public'), (3,6,3,'public'),
      (4,9,4,'public'), (5,10,5,'public'), (6,11,6,'private'), (7,7,1,'public'),
      (8,12,7,'public'), (9,12,8,'private');
    insert into athlete_account_links values (4,'disabled','active'), (5,'hidden','active');
    insert into athlete_public_shares values ('disabled',false,true), ('hidden',true,true);
    insert into athlete_profile_hidden_results values ('hidden',5);
  `);
  assert.deepEqual(await contentSitemapPaths(sql, "races", 1), [
    "/races/track-meeting",
    "/races/short-road-race",
    "/races/runrecs-only",
    "/races/marathon",
    "/races/outside-window",
    "/races/parkrun",
    "/races/triathlon",
  ]);
  assert.deepEqual(await contentSitemapPaths(sql, "clubs", 1), [
    "/clubs/athletics-club",
    "/clubs/running-club",
    "/clubs/triathlon-club",
    "/clubs/triathlon-result-club",
  ]);
  assert.deepEqual(await contentSitemapPaths(sql, "results", 1), [
    "/results/track-meeting-2026-09-20-1500m-1",
    "/results/cycling-2026-09-20-road-race-6",
    "/results/synthetic-triathlon-2026-09-20-sprint-12",
  ]);
  assert.equal(await contentSitemapPageCount(sql, "results"), 1);
  await db.exec("update athlete_public_shares set enabled=true where user_id='disabled'");
  assert((await contentSitemapPaths(sql, "results", 1)).some((url) => url.endsWith("-9")));
  await db.exec("update results set result_visibility='private' where id=1");
  assert(!(await contentSitemapPaths(sql, "results", 1)).some((url) => url.endsWith("-1")));
  await db.exec(
    "insert into clubs select id, 'club-' || id, 'Athletics' from generate_series(10,5009) id",
  );
  assert.equal(await contentSitemapPageCount(sql, "clubs"), 2);
  const clubs = [
    ...(await contentSitemapPaths(sql, "clubs", 1)),
    ...(await contentSitemapPaths(sql, "clubs", 2)),
  ];
  assert.equal(clubs.length, 5004);
  assert.equal(new Set(clubs).size, 5004);
  assert.deepEqual(await contentSitemapPaths(sql, "clubs", 3), []);
  assert.deepEqual(await contentSitemapPaths(sql, "clubs", 0), []);
  // Synthetic records reproduce stale catalogue aliases after a deliberate rename.
  // Their identities and performance data are not copied from production.
  await db.exec(`
    insert into events values
      (20, 'dingle-marathon-half-2026', 'Synthetic renamed race', 'Running', 'Ireland'),
      (21, 'toronto-waterfront-marathon', 'Synthetic renamed overseas race', 'Running', 'Canada'),
      (22, 'cardiff-half-marathon', 'Synthetic canonical race', 'Running', 'United Kingdom'),
      (23, 'wa-cardiff-half-marathon-7240793', 'Synthetic retained alias', 'Running', 'United Kingdom');
    insert into slug_redirects values
      ('event',20,'dingle-marathon','dingle-marathon-half-2026'),
      ('event',21,'tcs-toronto-waterfront-marathon','toronto-waterfront-marathon');
  `);
  for (const slug of ["dingle-marathon", "dingle-marathon-half-2026"]) {
    assert.equal((await eventByPublicSlug(sql, slug))[0].id, 20);
  }
  for (const slug of [
    "wa-tcs-toronto-waterfront-marathon-7238226",
    "tcs-toronto-waterfront-marathon",
    "toronto-waterfront-marathon",
  ]) {
    assert.equal((await eventByPublicSlug(sql, slug))[0].id, 21);
  }
  assert.equal((await eventByPublicSlug(sql, "wa-cardiff-half-marathon-7240793"))[0].id, 22);
  for (const slug of ["not-a-race", "' OR 1=1 --", "constructor", "__proto__"]) {
    assert.deepEqual(await eventByPublicSlug(sql, slug), []);
  }
  const racePaths = await contentSitemapPaths(sql, "races", 1);
  assert(racePaths.includes("/races/dingle-marathon-half-2026"));
  assert(racePaths.includes("/races/toronto-waterfront-marathon"));
  assert(racePaths.includes("/races/cardiff-half-marathon"));
  assert(
    !racePaths.includes("/races/wa-cardiff-half-marathon-7240793"),
    "Sitemaps must list the canonical page, not its redirect",
  );
  console.log(
    "PASS: readable collision-safe result URLs; complete sitemap pagination; event scope; published Running, Parkrun and Triathlon inclusion; public triathlon clubs; private, hidden, disabled and future result exclusions; immediate publication changes.",
  );
} finally {
  await db.close();
}

await import("./verify-page-slug-routing.mjs");
