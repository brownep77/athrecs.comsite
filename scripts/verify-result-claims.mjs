import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migration = await readFile(resolve(root, "migrations/0013_result_claims.sql"), "utf8");
const api = await readFile(resolve(root, "src/lib/athrecs/result-claims-api.ts"), "utf8");
const athleteApi = await readFile(resolve(root, "src/lib/athrecs/api.ts"), "utf8");
const claimRoute = await readFile(resolve(root, "src/routes/claim-results.tsx"), "utf8");
const athleteRoute = await readFile(resolve(root, "src/routes/athletes/$slug.tsx"), "utf8");
const raceRoute = await readFile(resolve(root, "src/routes/races/$slug.tsx"), "utf8");
const homeRoute = await readFile(resolve(root, "src/routes/index.tsx"), "utf8");
const staffShell = await readFile(
  resolve(root, "src/components/staff/StaffMicrositeShell.tsx"),
  "utf8",
);

for (const functionName of ["submitResultClaim", "listMyResultClaims", "withdrawResultClaim"]) {
  const start = api.indexOf(`export const ${functionName}`);
  assert.notEqual(start, -1, `${functionName} must exist`);
  const nextExport = api.indexOf("export const ", start + 20);
  const definition = api.slice(start, nextExport === -1 ? undefined : nextExport);
  assert.match(
    definition,
    /middleware\(\[authMiddleware\]\)/,
    `${functionName} must require a user`,
  );
}

for (const functionName of [
  "listStaffResultClaims",
  "reviewResultClaim",
  "revokeAthleteOwnership",
]) {
  const start = api.indexOf(`export const ${functionName}`);
  assert.notEqual(start, -1, `${functionName} must exist`);
  const nextExport = api.indexOf("export const ", start + 20);
  const definition = api.slice(start, nextExport === -1 ? undefined : nextExport);
  assert.match(
    definition,
    /middleware\(\[staffMiddleware\]\)/,
    `${functionName} must be staff-only`,
  );
}

const submitStart = api.indexOf("export const submitResultClaim");
const submitEnd = api.indexOf("export const listMyResultClaims", submitStart);
const submitDefinition = api.slice(submitStart, submitEnd);
assert.match(
  submitDefinition,
  /select count\(distinct claimant_user_id\)::int as count/,
  "Competing claimants must be counted as distinct accounts",
);
assert.match(
  submitDefinition,
  /const requiresReview = Boolean\(owner\) \|\| competingClaimCount > 0/,
  "Staff review must be limited to ownership conflicts or competing claimants",
);
assert.match(
  submitDefinition,
  /const nextStatus: ResultClaimStatus = requiresReview \? "pending" : "approved"/,
  "An uncontested claim must be approved automatically",
);
assert.match(
  submitDefinition,
  /select id from athletes where id = \$\{result\.athlete_id\} for update/,
  "Automatic ownership decisions must be serialized per athlete profile",
);
assert.match(submitDefinition, /notifyResultClaimReviewed/);
assert.match(submitDefinition, /notifyResultClaimSubmitted/);

assert.match(athleteRoute, /Claim this result/);
assert.match(raceRoute, /to="\/claim-results"/);
assert.match(homeRoute, /Claim race results/);
assert.match(staffShell, /\/admin\/result-claims/);
assert.match(claimRoute, /Two or more claimants go to staff review/);
assert.match(claimRoute, /response\.status === "approved"/);
assert.match(api, /for update/);
assert.match(api, /Another verified account was approved/);
assert.match(api, /Only an approved claim can have ownership revoked/);
assert.doesNotMatch(
  api,
  /existing\[0\]\?\.status === "pending" \|\| existing\[0\]\?\.status === "needs_info"/,
  "A needs-info claim must be resubmittable",
);
assert.match(
  api,
  /claim\.status !== "pending" && claim\.status !== "needs_info"/,
  "Only active claims may be reviewed",
);
assert.match(athleteApi, /as is_claimed/);
assert.match(athleteRoute, /Verified athlete/);

const claimSelectMatch = api.match(/const CLAIM_SELECT = `([\s\S]*?)`;/);
assert.ok(claimSelectMatch, "The shared claim query must be readable by the verification");
const claimSelect = claimSelectMatch[1];

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table "user" (
    "id" text primary key,
    "email" text not null unique
  );
  create table athletes (
    id serial primary key,
    slug text not null unique,
    display_name text not null
  );
  create table events (
    id serial primary key,
    slug text not null unique,
    name text not null
  );
  create table editions (
    id serial primary key,
    event_id int not null references events (id) on delete cascade,
    event_date date not null,
    distance_code text not null
  );
  create table results (
    id serial primary key,
    edition_id int not null references editions (id) on delete cascade,
    athlete_id int not null references athletes (id) on delete cascade
    ,finish_time_seconds int
    ,overall_place int
    ,bib text
    ,category text
    ,source_url text
  );
`);
await db.exec(migration);
await db.exec(`
  insert into "user" ("id", "email") values
    ('user-one', 'runner@example.com'),
    ('user-two', 'second-runner@example.com'),
    ('staff-one', 'staff@example.com');
  insert into athletes (id, slug, display_name)
    values (1, 'verification-runner', 'Verification Runner');
  insert into events (id, slug, name) values (1, 'verification-race', 'Verification Race');
  insert into editions (id, event_id, event_date, distance_code)
    values (1, 1, '2026-08-22', '5K');
  insert into results (
    id, edition_id, athlete_id, finish_time_seconds, overall_place, bib, category, source_url
  ) values (1, 1, 1, 1200, 10, '42', 'MSEN', 'https://example.com/results');
  insert into result_claims (
    result_id, athlete_id, claimant_user_id, claimant_email,
    verification_method, evidence_text, declaration_accepted
  ) values (
    1, 1, 'user-one', 'runner@example.com', 'bib', 'Bib 42', true
  );
`);

const claims = await db.query(`select status, verification_method from result_claims`);
assert.equal(claims.rows.length, 1);
assert.equal(claims.rows[0].status, "pending");
assert.equal(claims.rows[0].verification_method, "bib");

const claimList = await db.query(
  `${claimSelect} where claim.claimant_user_id = $1 order by claim.submitted_at desc`,
  ["user-one"],
);
assert.equal(claimList.rows.length, 1);
assert.equal(claimList.rows[0].athlete_name, "Verification Runner");

const staffClaimList = await db.query(
  `select
     claim_data.*,
     owner.user_email as existing_owner_email,
     (
       select count(distinct competing.claimant_user_id)::int
       from result_claims competing
       where competing.athlete_id = claim.athlete_id
         and competing.claimant_user_id <> claim.claimant_user_id
         and competing.status in ('pending', 'needs_info', 'approved')
     ) as competing_claim_count
   from (${claimSelect}) claim_data
   join result_claims claim on claim.id = claim_data.claim_id
   left join athlete_account_links owner
     on owner.athlete_id = claim_data.athlete_id and owner.status = 'active'
   where ($1::text = 'all' or claim.status = $1)
   order by
     case claim.status when 'pending' then 0 when 'needs_info' then 1 else 2 end,
     claim.submitted_at desc`,
  ["all"],
);
assert.equal(staffClaimList.rows.length, 1);
assert.equal(staffClaimList.rows[0].competing_claim_count, 0);

await assert.rejects(
  db.query(
    `insert into result_claims (
      result_id, athlete_id, claimant_user_id, claimant_email,
      verification_method, evidence_text, declaration_accepted
    ) values (1, 1, 'user-one', 'runner@example.com', 'bib', 'Duplicate', true)`,
  ),
  /unique|duplicate/i,
);

await assert.rejects(
  db.query(
    `insert into result_claims (
      result_id, athlete_id, claimant_user_id, claimant_email,
      verification_method, evidence_text, evidence_url, declaration_accepted
    ) values (1, 1, 'staff-one', 'staff@example.com', 'other', 'Bad URL', 'http://example.com', true)`,
  ),
  /check/i,
);

await db.exec(`
  insert into athlete_account_links (
    athlete_id, user_id, user_email, source_claim_id
  ) values (1, 'user-one', 'runner@example.com', 1);
  update result_claims set status = 'approved', reviewed_at = now() where id = 1;
  insert into result_claims (
    result_id, athlete_id, claimant_user_id, claimant_email,
    verification_method, evidence_text, declaration_accepted, status, conflict_reason
  ) values (
    1, 1, 'user-two', 'second-runner@example.com', 'other', '', true, 'pending',
    'Another account has claimed this athlete profile.'
  );
`);
const owner = await db.query(`
  select link.user_email, claim.status
  from athlete_account_links link
  join result_claims claim on claim.id = link.source_claim_id
`);
assert.deepEqual(owner.rows[0], { user_email: "runner@example.com", status: "approved" });

const competingClaims = await db.query(`
  select
    claim.claimant_user_id,
    (
      select count(distinct competing.claimant_user_id)::int
      from result_claims competing
      where competing.athlete_id = claim.athlete_id
        and competing.claimant_user_id <> claim.claimant_user_id
        and competing.status in ('pending', 'needs_info', 'approved')
    ) as competing_claim_count
  from result_claims claim
  order by claim.claimant_user_id
`);
assert.deepEqual(competingClaims.rows, [
  { claimant_user_id: "user-one", competing_claim_count: 1 },
  { claimant_user_id: "user-two", competing_claim_count: 1 },
]);

await db.close();
console.log("Result claim verification passed");
