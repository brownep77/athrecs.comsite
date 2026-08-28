import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { buildGeneratedAthleteBio } from "../src/lib/athrecs/athlete-bio.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migration = await readFile(
  resolve(root, "migrations/0023_athlete_profile_bios.sql"),
  "utf8",
);
const generator = await readFile(resolve(root, "src/lib/athrecs/athlete-bio.ts"), "utf8");
const api = await readFile(resolve(root, "src/lib/athrecs/athlete-bio-api.ts"), "utf8");
const component = await readFile(
  resolve(root, "src/components/athletes/AthleteBioCard.tsx"),
  "utf8",
);
const profileRoute = await readFile(
  resolve(root, "src/routes/my-athlete-profile.tsx"),
  "utf8",
);
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

assert.match(migration, /create table if not exists athlete_profile_bios/);
assert.match(migration, /mode in \('automatic', 'custom', 'hidden'\)/);
assert.match(migration, /length\(trim\(custom_bio\)\) between 1 and 1200/);
assert.match(migration, /references "user" \("id"\) on delete cascade/);
assert.doesNotMatch(migration, /generated_bio text/i, "Automatic prose must not become stale stored text");

assert.match(generator, /buildGeneratedAthleteBio/);
assert.match(generator, /Fastest claimed performances currently include/);
assert.match(generator, /update automatically as results are uploaded and linked/);
assert.doesNotMatch(generator, /openai|anthropic|gemini|fetch\(/i);

assert.match(api, /middleware\(\[authMiddleware\]\)/);
assert.match(api, /from athlete_account_links/);
assert.match(api, /join results result/);
assert.match(api, /order by edition\.event_date desc/);
assert.match(api, /mode === "hidden"/);
assert.match(api, /mode === "custom"/);
assert.match(api, /insert into athlete_profile_bios/);
assert.match(api, /on conflict \(user_id\) do update/);

assert.match(component, /About me/);
assert.match(component, /Automatic/);
assert.match(component, /Write my own/);
assert.match(component, /Hide bio/);
assert.match(component, /It refreshes when more results are uploaded or linked/);
assert.match(component, /BIO_MAX_LENGTH = 1200/);
assert.match(component, /refetchOnWindowFocus: true/);
assert.match(profileRoute, /AthleteBioCard/);
assert.match(profileRoute, /<AthleteBioCard \/>/);
assert.equal(
  packageJson.scripts["verify:athlete-bio"],
  "node --experimental-strip-types scripts/verify-athlete-bio.mjs",
);
assert.match(packageJson.scripts["ci:verify"], /verify:athlete-bio/);

const baseResults = [
  {
    resultId: 1,
    eventName: "City 10K",
    eventDate: "2025-04-20",
    distanceCode: "10K",
    finishTimeSeconds: 2500,
    overallPlace: 120,
  },
  {
    resultId: 2,
    eventName: "Spring 5K",
    eventDate: "2025-03-10",
    distanceCode: "5K",
    finishTimeSeconds: 1200,
    overallPlace: 40,
  },
  {
    resultId: 3,
    eventName: "Winter 10K",
    eventDate: "2024-12-01",
    distanceCode: "10K",
    finishTimeSeconds: 2600,
    overallPlace: 150,
  },
];

const firstBio = buildGeneratedAthleteBio({
  displayName: "Alex Runner",
  primarySport: "Running",
  city: "Norwich",
  region: "Norfolk",
  country: "United Kingdom",
  clubOrTeam: "Example AC",
  results: baseResults,
});
assert.match(firstBio, /Alex Runner is a runner/);
assert.match(firstBio, /3 claimed results from 3 events/);
assert.match(firstBio, /City 10K/);
assert.match(firstBio, /20 April 2025/);
assert.match(firstBio, /5K in 20:00/);
assert.match(firstBio, /10K in 41:40/);

const updatedBio = buildGeneratedAthleteBio({
  displayName: "Alex Runner",
  primarySport: "Running",
  city: "Norwich",
  region: "Norfolk",
  country: "United Kingdom",
  clubOrTeam: "Example AC",
  results: [
    {
      resultId: 4,
      eventName: "Autumn 10K",
      eventDate: "2026-09-12",
      distanceCode: "10K",
      finishTimeSeconds: 2400,
      overallPlace: 25,
    },
    ...baseResults,
  ],
});
assert.notEqual(updatedBio, firstBio);
assert.match(updatedBio, /4 claimed results from 4 events/);
assert.match(updatedBio, /Autumn 10K/);
assert.match(updatedBio, /10K in 40:00/);

const emptyBio = buildGeneratedAthleteBio({
  displayName: "New Athlete",
  primarySport: "",
  city: "",
  region: "",
  country: "",
  clubOrTeam: "",
  results: [],
});
assert.match(emptyBio, /update automatically as results are uploaded and linked/);

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table "user" (
    "id" text primary key,
    "name" text not null,
    "email" text not null,
    "emailVerified" boolean not null
  );
`);
await db.exec(migration);
await db.exec(`
  insert into "user" ("id", "name", "email", "emailVerified")
  values ('bio-user', 'Bio Athlete', 'bio@example.com', true);
  insert into athlete_profile_bios (user_id, mode, custom_bio)
  values ('bio-user', 'custom', 'A custom athlete biography.');
`);
const rows = await db.query(`
  select user_id, mode, custom_bio from athlete_profile_bios where user_id = 'bio-user'
`);
assert.deepEqual(rows.rows[0], {
  user_id: "bio-user",
  mode: "custom",
  custom_bio: "A custom athlete biography.",
});
await assert.rejects(
  db.query(`
    insert into athlete_profile_bios (user_id, mode)
    values ('invalid-mode', 'public')
  `),
  /foreign key|check/i,
);
await db.close();

console.log("Automatic Athlete Profile bio verification passed");
