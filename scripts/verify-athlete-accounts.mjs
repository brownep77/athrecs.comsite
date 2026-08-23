import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migration = await readFile(resolve(root, "migrations/0014_athlete_accounts.sql"), "utf8");
const api = await readFile(resolve(root, "src/lib/athrecs/athlete-account-api.ts"), "utf8");
const accountRoute = await readFile(resolve(root, "src/routes/athlete-account.tsx"), "utf8");
const publicAthleteRoute = await readFile(resolve(root, "src/routes/athletes/$slug.tsx"), "utf8");
const appShell = await readFile(resolve(root, "src/components/layout/AppShell.tsx"), "utf8");
const staffShell = await readFile(
  resolve(root, "src/components/staff/StaffMicrositeShell.tsx"),
  "utf8",
);

for (const functionName of ["getMyAthleteAccount", "saveMyAthleteAccount"]) {
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

const staffStart = api.indexOf("export const listStaffAthleteAccounts");
assert.notEqual(staffStart, -1);
assert.match(api.slice(staffStart), /middleware\(\[staffMiddleware\]\)/);
assert.match(api, /lower\("email"\) as email/, "verified email must be loaded from Better Auth");
assert.match(api, /privacyAcknowledged !== true/, "privacy acknowledgement must be validated");
assert.match(accountRoute, /Full name/);
assert.match(accountRoute, /Verified email/);
assert.match(accountRoute, /Sports nutrition/);
assert.match(accountRoute, /Technology/);
assert.match(accountRoute, /Clothing/);
assert.match(accountRoute, /product research/i);
assert.match(appShell, /AthleteAccountAccess/);
assert.match(staffShell, /\/admin\/athlete-accounts/);
assert.doesNotMatch(
  publicAthleteRoute,
  /athlete_private_profiles|athlete_product_preferences|athlete-account-api/,
  "private Athlete Account data must not be loaded by public athlete pages",
);

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table "user" (
    "id" text primary key,
    "name" text not null,
    "email" text not null unique,
    "emailVerified" boolean not null default false
  );
`);
await db.exec(migration);
await db.exec(`
  insert into "user" ("id", "name", "email", "emailVerified")
  values ('athlete-one', 'Alex Runner', 'alex@example.com', true);
  insert into athlete_private_profiles (
    user_id, verified_email, full_name, country,
    privacy_notice_version, privacy_acknowledged_at
  ) values (
    'athlete-one', 'alex@example.com', 'Alex Runner', 'United Kingdom',
    'test', now()
  );
  insert into athlete_sport_profiles (
    user_id, sport_code, is_primary, experience_level,
    disciplines, preferred_distances, preferred_surfaces,
    training_sessions_per_week, training_hours_per_week,
    weekly_distance_km, events_per_year
  ) values (
    'athlete-one', 'Running', true, 'club',
    array['road'], array['10K', 'Half marathon'], array['road'],
    4, 6.5, 45, 12
  );
  insert into athlete_product_preferences (
    user_id, equipment_items, equipment_brands, nutrition_products,
    technology_devices, technology_apps, clothing_items, recovery_products
  ) values (
    'athlete-one', array['Running shoes'], array['Example Brand'], array['Energy gels'],
    array['GPS watch'], array['Strava'], array['Shorts'], array['Foam roller']
  );
  insert into athlete_account_consents (
    user_id, purpose, status, policy_version, granted_at
  ) values
    ('athlete-one', 'performance_insights', 'granted', 'test', now()),
    ('athlete-one', 'product_research', 'withdrawn', 'test', null),
    ('athlete-one', 'marketing', 'withdrawn', 'test', null);
`);

const profile = await db.query(`
  select verified_email, full_name, country from athlete_private_profiles where user_id = 'athlete-one'
`);
assert.deepEqual(profile.rows[0], {
  verified_email: "alex@example.com",
  full_name: "Alex Runner",
  country: "United Kingdom",
});

const product = await db.query(`
  select equipment_items, nutrition_products, technology_apps, clothing_items
  from athlete_product_preferences where user_id = 'athlete-one'
`);
assert.deepEqual(product.rows[0].equipment_items, ["Running shoes"]);
assert.deepEqual(product.rows[0].nutrition_products, ["Energy gels"]);
assert.deepEqual(product.rows[0].technology_apps, ["Strava"]);
assert.deepEqual(product.rows[0].clothing_items, ["Shorts"]);

await assert.rejects(
  db.exec(`
    insert into athlete_private_profiles (
      user_id, verified_email, full_name, privacy_notice_version, privacy_acknowledged_at
    ) values ('missing-user', 'x@example.com', '', 'test', now())
  `),
  /foreign key|check constraint/i,
);

await assert.rejects(
  db.exec(`
    insert into athlete_sport_profiles (user_id, sport_code, is_primary)
    values ('athlete-one', 'Cycling', true)
  `),
  /unique constraint/i,
  "an account can have only one primary sport",
);

await assert.rejects(
  db.exec(`
    insert into athlete_account_consents (user_id, purpose, status, policy_version)
    values ('athlete-one', 'medical_profiling', 'granted', 'test')
  `),
  /check constraint/i,
  "only approved consent purposes may be stored",
);

const consent = await db.query(`
  select purpose, status from athlete_account_consents
  where user_id = 'athlete-one' order by purpose
`);
assert.deepEqual(consent.rows, [
  { purpose: "marketing", status: "withdrawn" },
  { purpose: "performance_insights", status: "granted" },
  { purpose: "product_research", status: "withdrawn" },
]);

await db.close();
console.log(
  "Athlete Account verification passed: privacy, consent and data constraints are valid.",
);
