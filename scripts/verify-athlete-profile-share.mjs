import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import {
  buildShareSlug,
  isValidShareSlug,
  sharedProfilePath,
  slugifyShareName,
} from "../src/lib/athrecs/athlete-profile-share.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migration = await readFile(
  resolve(root, "migrations/0026_athlete_public_shares.sql"),
  "utf8",
);
const helpers = await readFile(
  resolve(root, "src/lib/athrecs/athlete-profile-share.ts"),
  "utf8",
);
const api = await readFile(
  resolve(root, "src/lib/athrecs/athlete-profile-share-api.ts"),
  "utf8",
);
const card = await readFile(
  resolve(root, "src/components/athletes/ShareProfileCard.tsx"),
  "utf8",
);
const button = await readFile(
  resolve(root, "src/components/athletes/ShareProfileButton.tsx"),
  "utf8",
);
const sharedPage = await readFile(
  resolve(root, "src/components/athletes/SharedAccountProfile.tsx"),
  "utf8",
);
const profileRoute = await readFile(resolve(root, "src/routes/my-athlete-profile.tsx"), "utf8");
const athleteRoute = await readFile(resolve(root, "src/routes/athletes/$slug.tsx"), "utf8");
const privacy = await readFile(resolve(root, "src/routes/privacy.tsx"), "utf8");
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

assert.match(migration, /create table if not exists athlete_public_shares/);
assert.match(migration, /enabled boolean not null default false/);
assert.match(migration, /references "user" \("id"\) on delete cascade/);
const tableSql = migration.replace(/--.*$/gm, "").replace(/comment on[\s\S]*?;/gi, "");
assert.doesNotMatch(tableSql, /email|date_of_birth|postcode|photo|previous_names/i);

assert.match(helpers, /slugifyShareName/);
assert.match(helpers, /sharedProfilePath/);
assert.equal(slugifyShareName("Alex Runner"), "alex-runner");
assert.equal(sharedProfilePath("alex-runner-abcd1234"), "/athletes/alex-runner-abcd1234");
assert.equal(isValidShareSlug("alex-runner-abcd1234"), true);
assert.equal(isValidShareSlug("Nope"), false);

const slug = buildShareSlug("Alex Runner", "user-1");
assert.match(slug, /^alex-runner-[a-f0-9]{8}$/);
assert.equal(buildShareSlug("Alex Runner", "user-1"), slug);

assert.match(api, /middleware\(\[authMiddleware\]\)/);
assert.match(api, /getPublishedSharedProfile/);
assert.match(api, /enabled = true/);
assert.match(api, /athlete_profile_hidden_results/);
assert.match(api, /Confirm that you want to publish/);
assert.doesNotMatch(api, /verified_email|date_of_birth|postcode|profilePhotoUrl|previous_names/);
assert.match(api, /no photograph|share_bio|share_results|share_club|share_location/i);

assert.match(card, /Share profile/);
assert.match(card, /Create a shareable profile link/);
assert.match(card, /unlisted/);
assert.match(card, /Save sharing/);
assert.match(button, /Copy link/);
assert.match(button, /navigator.share/);
assert.match(sharedPage, /Shared by athlete/);
assert.match(sharedPage, /photograph stay private/);

assert.match(profileRoute, /ShareProfileCard/);
assert.match(athleteRoute, /getPublishedSharedProfile/);
assert.match(athleteRoute, /ShareProfileButton/);
assert.match(athleteRoute, /noindex, nofollow, noarchive/);
assert.match(privacy, /shareable profile/);

assert.equal(
  packageJson.scripts["verify:athlete-profile-share"],
  "node --experimental-strip-types scripts/verify-athlete-profile-share.mjs",
);
assert.match(packageJson.scripts["ci:verify"], /verify:athlete-profile-share/);

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table "user" (
    "id" text primary key,
    "name" text not null,
    "email" text not null
  );
`);
await db.exec(migration);
await db.exec(`
  insert into "user" ("id", "name", "email")
  values ('share-user', 'Alex Runner', 'alex@example.com');
  insert into athlete_public_shares (user_id, slug, enabled)
  values ('share-user', 'alex-runner-abcd1234', false);
`);
const disabled = await db.query(`
  select enabled from athlete_public_shares where slug = 'alex-runner-abcd1234'
`);
assert.equal(disabled.rows[0].enabled, false);

await assert.rejects(
  db.query(`
    insert into athlete_public_shares (user_id, slug, enabled)
    values ('missing-user', 'not valid', true)
  `),
  /foreign key|check|invalid/i,
);

await db.exec(`
  update athlete_public_shares
  set enabled = true, acknowledged_at = now(), published_at = now()
  where user_id = 'share-user'
`);
const enabled = await db.query(`
  select enabled, slug from athlete_public_shares where enabled = true
`);
assert.equal(enabled.rows.length, 1);
assert.equal(enabled.rows[0].slug, "alex-runner-abcd1234");
await db.close();

console.log("Athlete profile share verification passed");
