import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migration = await readFile(
  resolve(root, "migrations/0024_athlete_profile_hidden_results.sql"),
  "utf8",
);
const api = await readFile(
  resolve(root, "src/lib/athrecs/athlete-profile-results-api.ts"),
  "utf8",
);
const component = await readFile(
  resolve(root, "src/components/athletes/AthleteResultsSection.tsx"),
  "utf8",
);
const profileRoute = await readFile(
  resolve(root, "src/routes/my-athlete-profile.tsx"),
  "utf8",
);
const bioApi = await readFile(
  resolve(root, "src/lib/athrecs/athlete-bio-api.ts"),
  "utf8",
);
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

assert.match(migration, /create table if not exists athlete_profile_hidden_results/);
assert.match(migration, /primary key \(user_id, result_id\)/);
assert.match(migration, /references results \(id\) on delete cascade/);
assert.doesNotMatch(migration, /delete from results/i);

assert.match(api, /middleware\(\[authMiddleware\]\)/);
assert.match(api, /resultBelongsToAccount/);
assert.match(api, /account_link\.status = 'active'/);
assert.match(api, /insert into athlete_profile_hidden_results/);
assert.match(api, /delete from athlete_profile_hidden_results/);
assert.doesNotMatch(api, /delete from results/i);
assert.doesNotMatch(api, /update results/i);

assert.match(component, /ResultViewMode = "list" \| "cards"/);
assert.match(component, /useState<ResultViewMode>\("list"\)/);
assert.match(component, /Remove from profile/);
assert.match(component, /Removed from my profile/);
assert.match(component, /Restore/);
assert.match(component, /official result stays in ATHRECS/i);
assert.match(component, /CompactResultList/);
assert.match(component, /queryKey: \["my-athlete-bio"\]/);

assert.match(profileRoute, /AthleteResultsSection/);
assert.match(profileRoute, /getMyProfileResultVisibility/);
assert.match(profileRoute, /hiddenResultIds/);
assert.match(profileRoute, /hiddenResults=\{hiddenResults\}/);
assert.doesNotMatch(profileRoute, /function ResultCard/);

assert.match(bioApi, /athlete_profile_hidden_results/);
assert.match(bioApi, /not exists/i);

assert.equal(
  packageJson.scripts["verify:athlete-profile-results"],
  "node scripts/verify-athlete-profile-results.mjs",
);
assert.match(packageJson.scripts["ci:verify"], /verify:athlete-profile-results/);

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table "user" ("id" text primary key);
  create table results (id serial primary key);
`);
await db.exec(migration);
await db.exec(`
  insert into "user" ("id") values ('runner-1');
  insert into results (id) values (101), (102);
  insert into athlete_profile_hidden_results (user_id, result_id)
  values ('runner-1', 101);
`);
const rows = await db.query(`
  select user_id, result_id
  from athlete_profile_hidden_results
  order by result_id
`);
assert.deepEqual(rows.rows, [{ user_id: "runner-1", result_id: 101 }]);
await assert.rejects(
  db.query(`
    insert into athlete_profile_hidden_results (user_id, result_id)
    values ('runner-1', 101)
  `),
  /duplicate|unique/i,
);
await db.query(`delete from results where id = 101`);
const afterCascade = await db.query(`select count(*)::int as count from athlete_profile_hidden_results`);
assert.equal(afterCascade.rows[0].count, 0);
await db.close();

console.log("Private Athlete Profile result visibility verification passed");
