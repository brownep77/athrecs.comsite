import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migration = await readFile(
  resolve(root, "migrations/0021_athlete_profile_photos.sql"),
  "utf8",
);
const handler = await readFile(
  resolve(root, "src/lib/athrecs/profile-photo.server.ts"),
  "utf8",
);
const apiRoute = await readFile(
  resolve(root, "src/routes/api/athlete-profile-photo.ts"),
  "utf8",
);
const uploader = await readFile(
  resolve(root, "src/components/athletes/ProfilePhotoUploader.tsx"),
  "utf8",
);
const accountApi = await readFile(
  resolve(root, "src/lib/athrecs/athlete-account-api.ts"),
  "utf8",
);
const profileRoute = await readFile(
  resolve(root, "src/routes/my-athlete-profile.tsx"),
  "utf8",
);
const routeTree = await readFile(resolve(root, "src/routeTree.gen.ts"), "utf8");
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const vercelConfig = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));

assert.match(migration, /create table if not exists athlete_profile_photos/);
assert.match(migration, /blob_pathname text not null/);
assert.match(migration, /references "user" \("id"\) on delete cascade/);
assert.doesNotMatch(migration, /bytea/i, "Postgres must not contain photo binary data");

assert.match(handler, /auth\.api\.getSession\(\{ headers: request\.headers \}\)/);
assert.match(handler, /mutationIsSameOrigin/);
assert.match(handler, /MAX_UPLOAD_BYTES = 2 \* 1024 \* 1024/);
assert.match(handler, /image\/webp/);
assert.match(handler, /fileSignatureMatches/);
assert.match(handler, /access: "private"/);
assert.match(handler, /BLOB_READ_WRITE_TOKEN/);
assert.match(handler, /Cache-Control.*private, no-store/s);
assert.match(handler, /delete from athlete_profile_photos where user_id/);
assert.match(handler, /old private blob cleanup failed/);
assert.doesNotMatch(handler, /access: "public"/);

for (const method of ["GET", "POST", "DELETE"]) {
  assert.match(apiRoute, new RegExp(`${method}: async`));
}
assert.match(apiRoute, /handleAthleteProfilePhotoRequest/);

assert.match(uploader, /Position your profile photo/);
assert.match(uploader, /OUTPUT_SIZE = 512/);
assert.match(uploader, /canvas\.toBlob/);
assert.match(uploader, /image\/webp/);
assert.match(uploader, /stripped of the original file metadata/);
assert.match(uploader, /Private photo storage required/);
assert.match(uploader, /method: "DELETE"/);
assert.match(uploader, /getBearerToken/);
assert.doesNotMatch(uploader, /accept="image\/\*"/, "File picker must use an explicit allowlist");

for (const field of [
  "profilePhotoUrl",
  "profilePhotoUpdatedAt",
  "profilePhotoUploadAvailable",
  "authImageUrl",
]) {
  assert.match(accountApi, new RegExp(field));
}
assert.match(accountApi, /from athlete_profile_photos/);
assert.match(accountApi, /safeImageUrl/);
assert.match(accountApi, /url\.protocol === "https:"/);

assert.match(profileRoute, /ProfilePhotoUploader/);
assert.match(profileRoute, /fallbackImageUrl=\{data\.authImageUrl\}/);
assert.match(profileRoute, /uploadAvailable=\{data\.profilePhotoUploadAvailable\}/);
assert.match(profileRoute, /photograph and ordinary athlete profile are not published publicly/);
assert.match(profileRoute, /rounded-3xl/);

assert.match(routeTree, /AthleteProfilePhotoRouteImport/);
assert.match(routeTree, /\/api\/athlete-profile-photo/);
assert.ok(packageJson.dependencies["@vercel/blob"], "@vercel/blob dependency is required");
assert.equal(packageJson.scripts["verify:profile-photo"], "node scripts/verify-profile-photo.mjs");
assert.match(packageJson.scripts["ci:verify"], /verify:profile-photo/);

const apiHeaders = vercelConfig.headers.find(
  (entry) => entry.source === "/api/athlete-profile-photo",
);
assert.ok(apiHeaders, "Private photo endpoint needs explicit no-store headers");
const cacheControl = apiHeaders.headers.find(
  (header) => header.key.toLowerCase() === "cache-control",
)?.value;
assert.match(cacheControl ?? "", /private/);
assert.match(cacheControl ?? "", /no-store/);

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table "user" (
    "id" text primary key,
    "name" text not null,
    "email" text not null,
    "emailVerified" boolean not null,
    "image" text
  );
`);
await db.exec(migration);
await db.exec(`
  insert into "user" ("id", "name", "email", "emailVerified")
  values ('photo-user', 'Photo Runner', 'photo@example.com', true);
  insert into athlete_profile_photos (
    user_id, blob_pathname, content_type, byte_size, width, height
  ) values (
    'photo-user', 'athlete-profile-photos/account/photo.webp',
    'image/webp', 120000, 512, 512
  );
`);
const rows = await db.query(`
  select user_id, blob_pathname, content_type, byte_size, width, height
  from athlete_profile_photos
`);
assert.deepEqual(rows.rows[0], {
  user_id: "photo-user",
  blob_pathname: "athlete-profile-photos/account/photo.webp",
  content_type: "image/webp",
  byte_size: 120000,
  width: 512,
  height: 512,
});
await assert.rejects(
  db.query(`
    insert into athlete_profile_photos (
      user_id, blob_pathname, content_type, byte_size, width, height
    ) values (
      'photo-user', 'athlete-profile-photos/account/bad.svg',
      'image/svg+xml', 100, 512, 512
    )
  `),
  /check|duplicate/i,
);
await db.close();

console.log("Private profile photo verification passed");
