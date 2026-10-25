// Synthetic data only: real Postgres semantics, no application database or network.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  identityNameReason,
  identityCandidateQuery,
} from "../src/lib/athlete-finder/identity-review.ts";
import { reviewAthleteIdentities } from "../src/lib/athlete-finder/identity-review.server.ts";

assert.equal(
  identityNameReason("Chris Example", "Christopher Example"),
  "Common given-name variant",
);
assert.equal(identityNameReason("C. Example", "Christopher Example"), "Initial-only name");
assert.equal(
  identityNameReason("Charles Example", "Christopher Example"),
  "Same first initial only",
);
assert.equal(identityNameReason("Bob Example", "Robert Example"), "Common given-name variant");
assert.equal(identityNameReason("Chris John Example", "Chris James Example"), null);
assert.equal(identityNameReason("Chris J Example", "Chris John Example"), "Middle-name variant");
assert.equal(identityNameReason("Chris Example", "Alan Example"), null);
assert.equal(identityNameReason("李 小明", "王 小明"), null);
assert.equal(identityNameReason("***", "???"), null);
assert.equal(identityCandidateQuery(["Runner"]), null);

const db = new PGlite();
await db.waitReady;
const queries = [];
const wrap = (connection) => {
  const sql = {
    query: async (query, values = []) => {
      queries.push(query);
      return (await connection.query(query, values)).rows;
    },
  };
  sql.transaction = (work) => db.transaction((tx) => work(wrap(tx)));
  return sql;
};
const sql = wrap(db);
try {
  await db.exec(`create table athletes(id integer primary key,display_name text,slug text,
    profile_visibility text default 'public',parent_athlete_id integer,source_club_name text,
    source_second_club_name text,club_id integer,second_club_id integer,profile_details jsonb default '{}');
    create table athlete_account_links(athlete_id integer,status text);
    create table clubs(id integer primary key,name text);
    create table athlete_clubs(athlete_id integer,club_id integer,relationship text,source_name text);
    create index athlete_finder_athlete_names on athletes using gin(to_tsvector('simple',regexp_replace(normalize(left(coalesce(display_name,''),2000),NFKC),'[^[:alnum:]]+',' ','g')));
    insert into clubs values(1,'Current Club'),(2,'Former Club');
    insert into athletes(id,display_name,slug,club_id,source_club_name,profile_details) values
      (1,'Christopher Example','christopher-example',1,'Current Club','{"aliases":["Chris Example","C Micklesynthetic"],"clubHistory":[{"name":"Former Club"}]}'),
      (2,'C Example','c-example',2,'Former Club','{}'),
      (3,'Charles Example','charles-example',null,null,'{}'),
      (4,'Alan Example','alan-example',1,'Current Club','{}'),
      (5,'Chris Example','merged-example',2,'Former Club','{"nameReview":{"mode":"merged_source_entry"}}'),
      (6,'Robert Sample','robert-sample',null,null,'{}'),
      (7,'François Démo','francois-demo',null,null,'{}'),
      (8,'Jane O’Example','jane-oexample',null,null,'{}'),
      (9,'李 小明','synthetic-unicode',null,null,'{}'),
      (10,'Chris Child','child-profile',null,null,'{}');
    update athletes set parent_athlete_id=1 where id in(5,10);
    insert into athlete_clubs values(1,2,'historical','Former Club');
    insert into athlete_account_links values(3,'active');`);
  await db.exec(readFileSync("migrations/20261025_athlete_identity_alias_search.sql", "utf8"));
  const before = await db.query(
    "select jsonb_agg(to_jsonb(a) order by id) snapshot from athletes a",
  );
  const review = await reviewAthleteIdentities(sql, { name: "Chris Example", club: "Former Club" });
  assert.deepEqual(
    review.candidates.map((c) => c.id),
    [1, 2, 3],
  );
  assert.equal(review.candidates[0].clubMatch, "Historical club matches: Former Club");
  assert.ok(review.candidates[0].reasons.includes("Recorded racing-name alias"));
  assert.equal(review.candidates[1].weak, true);
  assert.equal(review.candidates[2].managed, true);
  assert.equal(review.candidates[2].weak, true);
  assert.equal(
    (await reviewAthleteIdentities(sql, { name: "C Micklesynthetic" })).candidates[0].id,
    1,
    "Recorded surname aliases stay discoverable",
  );
  assert.equal(
    (await reviewAthleteIdentities(sql, { name: "Bob Sample" })).candidates[0].id,
    6,
    "Nickname with different initial is found",
  );
  assert.equal((await reviewAthleteIdentities(sql, { name: "François Démo" })).candidates[0].id, 7);
  assert.equal(
    (await reviewAthleteIdentities(sql, { name: "Jane O’Example" })).candidates[0].id,
    8,
  );
  assert.equal((await reviewAthleteIdentities(sql, { name: "李 小明" })).candidates[0].id, 9);
  assert.equal(
    (await reviewAthleteIdentities(sql, { name: "Chris Child" })).candidates[0].id,
    10,
    "A parent/child profile link is not a merge",
  );
  assert.equal((await reviewAthleteIdentities(sql, { name: "Nobody Else" })).candidates.length, 0);
  assert.ok((await reviewAthleteIdentities(sql, { name: "***" })).message);
  await reviewAthleteIdentities(sql, { name: "C '); drop table athletes; -- Example" });
  await assert.rejects(reviewAthleteIdentities(sql, { name: "Chris Example", athleteId: 1 }));
  const after = await db.query(
    "select jsonb_agg(to_jsonb(a) order by id) snapshot from athletes a",
  );
  assert.deepEqual(after.rows, before.rows, "Flagging does not rewrite or publish any profile");
  assert.ok(queries.includes("set transaction read only"));
  assert.ok(queries.includes("set local statement_timeout = '7000ms'"));
  await db.exec(
    "insert into athletes(id,display_name,slug) select n,'C Busy','busy-'||n from generate_series(100,305) n",
  );
  const capped = await reviewAthleteIdentities(sql, { name: "Christopher Busy" });
  assert.equal(capped.candidates.length, 200);
  assert.equal(capped.truncated, true);
  assert.match(capped.message, /not a complete/);
  console.log(
    "PASS: exact names, initials, nickname variants, conflicting middle names, aliases, former clubs, Unicode, merged records, family links, ownership warnings, bounded read-only SQL and truncation.",
  );
} finally {
  await db.close();
}
