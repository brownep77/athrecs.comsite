import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { parseProfileRoles } from "../src/lib/athrecs/athlete-profile-roles.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const api = await readFile(resolve(root, "src/lib/athrecs/api.ts"), "utf8");
const route = await readFile(resolve(root, "src/routes/athletes/$slug.tsx"), "utf8");
const shareApi = await readFile(
  resolve(root, "src/lib/athrecs/athlete-profile-share-api.ts"),
  "utf8",
);
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

assert.equal(parseProfileRoles(["Marathon runner"], null).join(","), "Marathon runner");
assert.deepEqual(parseProfileRoles(undefined, "Singer, Actor"), ["Singer", "Actor"]);
assert.deepEqual(parseProfileRoles(undefined, null), []);
assert.deepEqual(parseProfileRoles(undefined, undefined), []);
assert.deepEqual(parseProfileRoles([], ""), []);
assert.deepEqual(parseProfileRoles(["  Chef  ", ""], "ignored"), ["Chef"]);

assert.match(api, /export const getPrivateAthleteBySlug/);
assert.match(api, /coalesce\(a\.profile_visibility, 'private'\) <> 'public'/);
const privateFn = api.slice(
  api.indexOf("export const getPrivateAthleteBySlug"),
  api.indexOf("export const listClubs"),
);
assert.match(privateFn, /select a\.slug, a\.display_name/);
assert.doesNotMatch(privateFn, /date_of_birth|postcode|bio|email|previous_names|profile_photo/i);

assert.match(route, /kind: "private-athlete"/);
assert.match(route, /This athlete profile is private/);
assert.match(route, /noindex, nofollow, noarchive/);
assert.match(route, /parseProfileRoles/);
assert.match(route, /getPrivateAthleteBySlug/);
assert.match(route, /throw notFound\(\)/);
assert.doesNotMatch(route, /profile_roles\s*\n\s*\?\.split/);

assert.match(shareApi, /Missing table or lookup failure must 404/);

assert.equal(
  packageJson.scripts["verify:private-athlete-profile"],
  "node --experimental-strip-types scripts/verify-private-athlete-profile.mjs",
);
assert.match(packageJson.scripts["ci:verify"], /verify:private-athlete-profile/);

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table athletes (
    id serial primary key,
    slug text not null unique,
    display_name text not null,
    profile_type text not null default 'Athlete',
    profile_visibility text not null default 'private',
    date_of_birth date,
    bio text not null default ''
  );
  insert into athletes (slug, display_name, profile_type, profile_visibility, date_of_birth, bio)
  values
    ('james-senior', 'James Senior', 'Athlete', 'private', '1994-01-17', 'should stay private'),
    ('laura-kenny', 'Dame Laura Kenny', 'Public figure', 'private', null, ''),
    ('open-runner', 'Open Runner', 'Athlete', 'public', null, '');
`);

const privateRows = await db.query(`
  select slug, display_name
  from athletes
  where slug = 'james-senior'
    and profile_type <> 'Public figure'
    and coalesce(profile_visibility, 'private') <> 'public'
`);
assert.equal(privateRows.rows.length, 1);
assert.equal(privateRows.rows[0].display_name, "James Senior");

const publicFigure = await db.query(`
  select slug
  from athletes
  where slug = 'laura-kenny'
    and profile_type <> 'Public figure'
    and coalesce(profile_visibility, 'private') <> 'public'
`);
assert.equal(publicFigure.rows.length, 0);

const publicAthlete = await db.query(`
  select slug
  from athletes
  where slug = 'open-runner'
    and profile_type <> 'Public figure'
    and coalesce(profile_visibility, 'private') <> 'public'
`);
assert.equal(publicAthlete.rows.length, 0);
await db.close();

console.log("Private athlete profile verification passed");
