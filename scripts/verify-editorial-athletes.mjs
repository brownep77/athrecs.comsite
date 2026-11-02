// Real editorial service SQL against disposable, synthetic PostgreSQL data only.
// This verifier does not import the app database/bootstrap, open a server, or use live data.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  editorialAthleteNames,
  editorialAthleteReviewRow,
  editorialNameKey,
} from "../src/lib/athrecs/editorial-athletes.ts";
import {
  readEditorialAthleteReview,
  readPublicEditorialAthleteLinks,
  saveEditorialAthleteLink,
} from "../src/lib/athrecs/editorial-athletes.server.ts";

globalThis.fetch = async () => {
  throw new Error("Live network is forbidden in the editorial athlete verifier");
};

const root = new URL("../", import.meta.url);
const [foldMigration, identifierMigration, api] = await Promise.all([
  readFile(new URL("migrations/20261029_athlete_directory_accent_search.sql", root), "utf8"),
  readFile(new URL("migrations/0030_athlete_identifiers.sql", root), "utf8"),
  readFile(new URL("src/lib/athrecs/editorial-athletes-api.ts", root), "utf8"),
]);

// The real pure search fold and resolved-identifier view are exercised below.
// Importing only these definitions avoids unrelated catalogue migrations/seeds.
const foldSql = foldMigration.match(
  /create or replace function athlete_directory_search_fold[\s\S]*?\$function\$;/,
)?.[0];
const identifierViewSql = identifierMigration.match(
  /create or replace view athlete_resolved_ids[\s\S]*?;/,
)?.[0];
assert(foldSql && identifierViewSql, "Production search fold and identifier view must be found");

// These narrow source checks cover the HTTP/database guard, not an invented auth stub.
// Service identity/privacy decisions are executed against PostgreSQL below.
const queueApi = api.slice(
  api.indexOf("export const getEditorialAthleteQueue"),
  api.indexOf("export const approveEditorialAthleteLink"),
);
const writeApi = api.slice(
  api.indexOf("export const approveEditorialAthleteLink"),
  api.indexOf("export const getPublicEditorialAthleteLinks"),
);
const publicApi = api.slice(api.indexOf("export const getPublicEditorialAthleteLinks"));
assert.match(queueApi, /\.middleware\(\[staffMiddleware\]\)/);
assert.match(writeApi, /\.middleware\(\[staffMiddleware\]\)/);
assert.match(writeApi, /identityChecked:\s*z\.literal\(true\)/);
assert.match(writeApi, /sourceUrl:\s*z\s*\.string\(\)\s*\.url\(\)/);
assert.match(
  api,
  /if\s*\(dbSource\s*!==\s*"neon"\)\s*throw new Error\([\s\S]*?No athletes have been marked missing/,
);
assert.match(api, /write\s*&&\s*process\.env\.VERCEL_ENV\s*===\s*"preview"/);
assert.match(
  publicApi,
  /readPublicEditorialAthleteLinks\(\s*await liveDatabase\(\),\s*article\s*\)/,
);
assert.match(publicApi, /catch\s*\{[\s\S]*?return\s*\{\}/);
assert.doesNotMatch(publicApi, /readEditorialAthleteReview|candidates|sourceUrl|staffEmail/);

const makeArticle = (overrides = {}) => ({
  slug: "synthetic-editorial-athlete-review",
  kind: "news",
  date: "2026-11-02",
  displayDate: "2 November 2026",
  title: "Synthetic results report",
  standfirst: "A synthetic verification fixture.",
  body: [],
  sports: ["road-running"],
  locations: [{ country: "Canada" }],
  ...overrides,
});

const rosterArticle = makeArticle({
  athleteNames: [" Synthetic Celine Runner ", "synthetic céline runner", "", "1234"],
  athleteLinks: { "Synthetic Reviewed Runner": "synthetic-reviewed-runner" },
  sections: [
    {
      id: "podium",
      heading: "Synthetic podium",
      paragraphs: ["A prose mention is not extracted automatically."],
      table: {
        caption: "Synthetic table",
        headings: ["Place", "Athlete", "Time"],
        rows: [
          ["1", "Synthetic Table Runner", "40:00"],
          ["2", "Synthetic Celine Runner", "41:00"],
        ],
      },
    },
  ],
});
assert.deepEqual(editorialAthleteNames(rosterArticle), [
  "Synthetic Celine Runner",
  "Synthetic Reviewed Runner",
  "Synthetic Table Runner",
]);
assert.equal(editorialNameKey("  SYNTHETIC  Céline Runner "), "synthetic celine runner");
assert.equal(editorialAthleteReviewRow("Synthetic Name", [], undefined).status, "not-found");

const db = new PGlite({ parsers: { 20: Number } });
await db.waitReady;
const sql = { query: async (text, values = []) => (await db.query(text, values)).rows };
const actor = { userId: "synthetic-staff", staffEmail: "synthetic-staff@example.test" };
const sourceUrl = "https://results.example.test/synthetic-event/2026";
const note = "Synthetic staff review: source identity checked against the correct profile.";

try {
  await db.exec(`
    create table clubs(id integer primary key,name text not null);
    create table athletes(
      id integer primary key,display_name text not null,slug text unique not null,
      profile_visibility text not null default 'private',profile_type text not null default 'Athlete',
      club_id integer references clubs(id),source_club_name text,country text
    );
    create table athlete_identifiers(number bigint primary key,athlete_id integer unique,user_id text unique);
    create table athlete_account_links(athlete_id integer,user_id text,status text not null);
    create table athlete_public_shares(user_id text primary key,enabled boolean,share_results boolean);
    create table athlete_private_profiles(user_id text primary key,display_name text,full_name text,club_or_team text,country text);
    create table network_audit_log(
      id bigserial primary key,actor_user_id text,action text,entity_type text,entity_id text,
      after_value jsonb,note text,created_at timestamptz not null default now()
    );
    insert into clubs values(1,'Synthetic Club One'),(2,'Synthetic Club Two');
  `);
  await db.exec(foldSql);
  await db.exec(identifierViewSql);

  const profiles = [
    [1, "Synthetic Reviewed Runner", "synthetic-reviewed-runner", "public", "Athlete", 1],
    [2, "Synthetic Private Runner", "synthetic-private-runner", "private", "Athlete", 1],
    [3, "Synthetic Disabled Share", "synthetic-disabled-share", "public", "Athlete", 1],
    [4, "Synthetic Hidden Results", "synthetic-hidden-results", "public", "Athlete", 1],
    [5, "Synthetic Common Name", "synthetic-common-one", "public", "Athlete", 1],
    [6, "Synthetic Common Name", "synthetic-common-two", "public", "Athlete", 2],
    [7, "Synthetic Claimed Runner", "synthetic-claimed-runner", "public", "Athlete", 2],
    [8, "Synthetic Inactive Share", "synthetic-inactive-share", "public", "Athlete", 2],
    [9, "Synthetic Public Figure", "synthetic-public-figure", "private", "Public figure", 1],
    [10, "Synthetic Céline Runner", "synthetic-celine-runner", "public", "Athlete", 1],
    [11, "Synthetic Sole Match", "synthetic-sole-match", "public", "Athlete", 2],
    [12, "Synthetic Reviewed Alias", "synthetic-reviewed-alias", "public", "Athlete", 2],
  ];
  for (const profile of profiles) {
    await sql.query(
      `insert into athletes(id,display_name,slug,profile_visibility,profile_type,club_id,country)
      values($1,$2,$3,$4,$5,$6,'Canada')`,
      profile,
    );
    await sql.query("insert into athlete_identifiers(number,athlete_id) values($1,$2)", [
      1000 + profile[0],
      profile[0],
    ]);
  }
  await db.exec(`
    insert into athlete_identifiers(number,user_id) values(2003,'synthetic-disabled'),(2004,'synthetic-hidden'),
      (2007,'synthetic-claimed'),(2008,'synthetic-inactive'),(2010,'synthetic-private-account');
    insert into athlete_account_links values(3,'synthetic-disabled','active'),(4,'synthetic-hidden','active'),
      (7,'synthetic-claimed','active'),(8,'synthetic-inactive','revoked');
    insert into athlete_public_shares values('synthetic-disabled',false,true),('synthetic-hidden',true,false),
      ('synthetic-claimed',true,true),('synthetic-inactive',false,false);
    insert into athlete_private_profiles values
      ('synthetic-claimed','Synthetic Claimed Runner','Synthetic Claimed Runner','Synthetic Private Club','Canada'),
      ('synthetic-private-account','Synthetic Account Display','Synthetic Account Only','Synthetic Private Club','Australia');
  `);

  const article = makeArticle({
    athleteNames: [
      "Synthetic Reviewed Runner",
      "Synthetic Private Runner",
      "Synthetic Disabled Share",
      "Synthetic Hidden Results",
      "Synthetic Common Name",
      "Synthetic Claimed Runner",
      "Synthetic Inactive Share",
      "Synthetic Public Figure",
      "Synthetic Celine Runner",
      "Synthetic Sole Match",
      "Synthetic Account Only",
      "Synthetic Missing Runner",
    ],
    athleteLinks: {
      "Synthetic Reviewed Runner": "synthetic-reviewed-runner",
      "Synthetic Private Runner": "synthetic-private-runner",
      "Synthetic Disabled Share": "synthetic-disabled-share",
      "Synthetic Hidden Results": "synthetic-hidden-results",
      "Synthetic Inactive Share": "synthetic-inactive-share",
      "Synthetic Public Figure": "synthetic-public-figure",
    },
  });
  const firstLinks = await readPublicEditorialAthleteLinks(sql, article);
  assert.deepEqual(firstLinks, {
    "Synthetic Reviewed Runner": "synthetic-reviewed-runner",
    "Synthetic Inactive Share": "synthetic-inactive-share",
    "Synthetic Public Figure": "synthetic-public-figure",
  });
  assert(Object.values(firstLinks).every((value) => typeof value === "string"));
  assert.doesNotMatch(
    JSON.stringify(firstLinks),
    /athleteId|athleteNumber|country|candidates|sourceUrl|note|staff|Private Club/,
  );
  assert.equal(
    firstLinks["Synthetic Sole Match"],
    undefined,
    "One name match does not authorise a profile link",
  );
  assert.equal(
    firstLinks["Synthetic Common Name"],
    undefined,
    "Ambiguous names never link automatically",
  );

  const initialReview = await readEditorialAthleteReview(sql, article);
  const row = (name, review = initialReview) => review.rows.find((item) => item.name === name);
  assert(Number.isFinite(Date.parse(initialReview.checkedAt)));
  assert.equal(row("Synthetic Reviewed Runner").status, "linked");
  assert.equal(row("Synthetic Private Runner").status, "link-unavailable");
  assert.equal(row("Synthetic Disabled Share").status, "link-unavailable");
  assert.equal(row("Synthetic Hidden Results").status, "link-unavailable");
  assert.equal(
    row("Synthetic Private Runner").totalCandidates,
    1,
    "Private source athletes remain visible to staff",
  );
  assert.equal(row("Synthetic Common Name").status, "review");
  assert.equal(row("Synthetic Common Name").totalCandidates, 2);
  assert.deepEqual(
    row("Synthetic Common Name")
      .candidates.map((candidate) => candidate.club)
      .sort(),
    ["Synthetic Club One", "Synthetic Club Two"],
  );
  assert.equal(row("Synthetic Sole Match").status, "review");
  assert.equal(
    row("Synthetic Celine Runner").status,
    "review",
    "Accent folding preserves source names and finds candidates",
  );
  assert.equal(row("Synthetic Celine Runner").candidates[0].name, "Synthetic Céline Runner");
  assert.equal(
    row("Synthetic Account Only").status,
    "review",
    "Private account profiles cannot be mislabelled missing",
  );
  assert.equal(row("Synthetic Account Only").candidates[0].athleteId, null);
  assert.equal(row("Synthetic Account Only").candidates[0].public, false);
  assert.equal(row("Synthetic Claimed Runner").status, "review");
  assert(
    row("Synthetic Claimed Runner").candidates.some(
      (candidate) => candidate.athleteId === 7 && candidate.athleteNumber === "2007",
    ),
  );
  assert(
    row("Synthetic Claimed Runner").candidates.some((candidate) => candidate.athleteId === null),
  );
  assert.equal(row("Synthetic Missing Runner").status, "not-found");

  // Audited staff review selects one identity, survives subsequent reads and
  // preserves evidence privately. A deliberately different display name tests
  // an explicitly reviewed alias, not a fresh name-only inference.
  await saveEditorialAthleteLink(
    sql,
    article,
    {
      name: "Synthetic Sole Match",
      athleteId: 12,
      sourceUrl,
      note,
    },
    actor,
  );
  const [audit] = await sql.query("select * from network_audit_log order by id desc limit 1");
  assert.equal(audit.actor_user_id, actor.userId);
  assert.equal(audit.action, "editorial.athlete_link_reviewed");
  assert.equal(audit.entity_type, "editorial_article");
  assert.equal(audit.entity_id, article.slug);
  assert.equal(audit.after_value.name, "Synthetic Sole Match");
  assert.equal(audit.after_value.athleteId, 12);
  assert.equal(audit.after_value.sourceUrl, sourceUrl);
  assert.equal(audit.note, note);
  assert(Number.isFinite(Date.parse(audit.after_value.checkedAt)));
  assert.equal(
    (await readPublicEditorialAthleteLinks(sql, article))["Synthetic Sole Match"],
    "synthetic-reviewed-alias",
  );
  assert.equal(
    row("Synthetic Sole Match", await readEditorialAthleteReview(sql, article)).status,
    "linked",
  );
  await saveEditorialAthleteLink(
    sql,
    article,
    { name: "Synthetic Sole Match", athleteSlug: "synthetic-reviewed-alias", sourceUrl, note },
    actor,
  );
  const [aliasAudit] = await sql.query(
    "select after_value from network_audit_log order by id desc limit 1",
  );
  assert.equal(
    aliasAudit.after_value.athleteId,
    12,
    "A reviewed public slug resolves to a stable profile ID",
  );
  assert.equal(
    (await readPublicEditorialAthleteLinks(sql, article))["Synthetic Sole Match"],
    "synthetic-reviewed-alias",
  );
  assert.equal(
    (
      await readPublicEditorialAthleteLinks(sql, {
        ...article,
        slug: "another-synthetic-article",
        athleteLinks: {},
      })
    )["Synthetic Sole Match"],
    undefined,
    "Reviews are article-specific",
  );

  await saveEditorialAthleteLink(
    sql,
    article,
    {
      name: "Synthetic Reviewed Runner",
      remove: true,
      sourceUrl,
      note,
    },
    actor,
  );
  assert.equal(
    (await readPublicEditorialAthleteLinks(sql, article))["Synthetic Reviewed Runner"],
    undefined,
    "A staff removal overrides the original static mapping",
  );
  assert.equal(
    row("Synthetic Reviewed Runner", await readEditorialAthleteReview(sql, article)).status,
    "review",
  );
  await saveEditorialAthleteLink(
    sql,
    article,
    {
      name: "Synthetic Reviewed Runner",
      athleteId: 1,
      sourceUrl,
      note,
    },
    actor,
  );
  await sql.query(
    "update network_audit_log set created_at='2026-11-02T12:00:00Z' where after_value->>'name'=$1",
    ["Synthetic Reviewed Runner"],
  );
  assert.equal(
    (await readPublicEditorialAthleteLinks(sql, article))["Synthetic Reviewed Runner"],
    "synthetic-reviewed-runner",
    "The latest audit ID resolves equal timestamps",
  );

  // An explicit profile/privacy change takes effect even after a successful
  // staff review. Reading or removing a link must never alter that preference.
  await sql.query("update athletes set profile_visibility='private' where id=12");
  assert.equal(
    (await readPublicEditorialAthleteLinks(sql, article))["Synthetic Sole Match"],
    undefined,
  );
  assert.equal(
    row("Synthetic Sole Match", await readEditorialAthleteReview(sql, article)).status,
    "link-unavailable",
  );
  await assert.rejects(
    saveEditorialAthleteLink(
      sql,
      article,
      {
        name: "Synthetic Private Runner",
        athleteId: 2,
        sourceUrl,
        note,
      },
      actor,
    ),
    /unavailable for a public article link/,
  );
  await assert.rejects(
    saveEditorialAthleteLink(
      sql,
      article,
      {
        name: "Synthetic Disabled Share",
        athleteId: 3,
        sourceUrl,
        note,
      },
      actor,
    ),
    /unavailable for a public article link/,
  );
  await assert.rejects(
    saveEditorialAthleteLink(
      sql,
      article,
      {
        name: "Synthetic Hidden Results",
        athleteId: 4,
        sourceUrl,
        note,
      },
      actor,
    ),
    /unavailable for a public article link/,
  );
  await assert.rejects(
    saveEditorialAthleteLink(
      sql,
      article,
      {
        name: "Synthetic Stranger",
        athleteId: 1,
        sourceUrl,
        note,
      },
      actor,
    ),
    /named athlete/,
  );
  await assert.rejects(
    saveEditorialAthleteLink(
      sql,
      article,
      {
        name: "Synthetic Reviewed Runner",
        athleteId: 1,
        sourceUrl,
        note,
      },
      { userId: "", staffEmail: "" },
    ),
    /Staff access required/,
  );
  assert.deepEqual(
    await sql.query("select id,profile_visibility from athletes where id in (2,12) order by id"),
    [
      { id: 2, profile_visibility: "private" },
      { id: 12, profile_visibility: "private" },
    ],
  );

  await sql.query(
    "delete from athlete_identifiers where athlete_id=10 or user_id='synthetic-private-account'",
  );
  const incompleteIdentifiers = await readEditorialAthleteReview(sql, article);
  assert.equal(
    row("Synthetic Celine Runner", incompleteIdentifiers).status,
    "review",
    "A missing ATH identifier must not hide an existing native profile",
  );
  assert.equal(
    row("Synthetic Celine Runner", incompleteIdentifiers).candidates[0].athleteNumber,
    "",
  );
  assert.equal(row("Synthetic Celine Runner", incompleteIdentifiers).candidates[0].public, false);
  assert.equal(
    row("Synthetic Account Only", incompleteIdentifiers).status,
    "review",
    "A private account without an identifier remains a staff candidate",
  );
  assert.doesNotMatch(
    JSON.stringify(incompleteIdentifiers),
    /searchKey|searchName|synthetic-private-account/,
  );
  await assert.rejects(
    saveEditorialAthleteLink(
      sql,
      article,
      {
        name: "Synthetic Celine Runner",
        athleteSlug: "synthetic-celine-runner",
        sourceUrl,
        note,
      },
      actor,
    ),
    /unavailable for a public article link/,
  );

  const cappedCandidates = Array.from({ length: 14 }, (_, index) => ({
    athleteId: 100 + index,
    athleteNumber: String(3000 + index),
    name: "Synthetic Many Matches",
    slug: `synthetic-many-${index}`,
    club: "Synthetic Club",
    country: "Canada",
    public: true,
  }));
  const capped = editorialAthleteReviewRow("Synthetic Many Matches", cappedCandidates);
  assert.equal(capped.status, "review");
  assert.equal(capped.candidates.length, 12);
  assert.equal(capped.totalCandidates, 14, "Truncated candidates retain the true total");
  await assert.rejects(
    readEditorialAthleteReview(
      sql,
      makeArticle({
        athleteNames: Array.from({ length: 251 }, (_, index) => `Synthetic Person ${index}`),
      }),
    ),
    /more than 250 athletes/,
  );

  const unavailableSql = {
    query: async () => {
      throw new Error("Synthetic database outage");
    },
  };
  await assert.rejects(
    readEditorialAthleteReview(unavailableSql, article),
    /Synthetic database outage/,
  );
  await assert.rejects(
    readPublicEditorialAthleteLinks(unavailableSql, article),
    /Synthetic database outage/,
  );
  console.log(
    "Editorial athlete verification passed: real SQL, reviewed links, private/claimed candidates, opt-outs, ambiguity, audit persistence/removal and fail-closed API guards.",
  );
} finally {
  await db.close();
}
