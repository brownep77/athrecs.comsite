import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const blobMigration = await readFile(
  resolve(root, "migrations/0021_athlete_profile_photos.sql"),
  "utf8",
);
const fallbackMigration = await readFile(
  resolve(root, "migrations/0022_athlete_profile_photo_database_fallback.sql"),
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

assert.match(blobMigration, /create table if not exists athlete_profile_photos/);
assert.match(blobMigration, /references "user" \("id"\) on delete cascade/);
assert.match(fallbackMigration, /photo_bytes bytea/);
assert.match(fallbackMigration, /storage_backend text/);
assert.match(fallbackMigration, /alter column blob_pathname drop not null/);
assert.match(fallbackMigration, /storage_backend = 'database'/);
assert.match(fallbackMigration, /storage_backend = 'blob'/);

assert.match(handler, /auth\.api\.getSession\(\{ headers: request\.headers \}\)/);
assert.match(handler, /mutationIsSameOrigin/);
assert.match(handler, /MAX_UPLOAD_BYTES = 2 \* 1024 \* 1024/);
assert.match(handler, /image\/webp/);
assert.match(handler, /fileSignatureMatches/);
assert.match(handler, /access: "private"/);
assert.match(handler, /BLOB_READ_WRITE_TOKEN/);
assert.match(handler, /BLOB_STORE_ID/);
assert.match(handler, /saveDatabasePhoto/);
assert.match(handler, /storage_backend = 'database'/);
assert.match(handler, /Buffer\.from\(await file\.arrayBuffer\(\)\)/);
assert.match(handler, /Postgres fallback/);
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
assert.match(uploader, /Upload photo/);
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
assert.match(accountApi, /const profilePhotoUploadAvailable = true/);
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
await db.exec(blobMigration);
await db.exec(fallbackMigration);
await db.exec(`
  insert into "user" ("id", "name", "email", "emailVerified") values
    ('blob-photo-user', 'Blob Runner', 'blob@example.com', true),
    ('database-photo-user', 'Database Runner', 'database@example.com', true);

  insert into athlete_profile_photos (
    user_id, blob_pathname, photo_bytes, storage_backend,
    content_type, byte_size, width, height
  ) values (
    'blob-photo-user', 'athlete-profile-photos/account/photo.webp', null, 'blob',
    'image/webp', 120000, 512, 512
  );
`);
await db.query(
  `insert into athlete_profile_photos (
     user_id, blob_pathname, photo_bytes, storage_backend,
     content_type, byte_size, width, height
   ) values ($1, null, $2, 'database', 'image/webp', $3, 512, 512)`,
  ["database-photo-user", Uint8Array.from([82, 73, 70, 70, 1, 2, 3, 4]), 8],
);

const rows = await db.query(`
  select
    user_id,
    blob_pathname,
    storage_backend,
    content_type,
    byte_size,
    octet_length(photo_bytes)::int as stored_bytes
  from athlete_profile_photos
  order by user_id
`);
assert.deepEqual(rows.rows, [
  {
    user_id: "blob-photo-user",
    blob_pathname: "athlete-profile-photos/account/photo.webp",
    storage_backend: "blob",
    content_type: "image/webp",
    byte_size: 120000,
    stored_bytes: null,
  },
  {
    user_id: "database-photo-user",
    blob_pathname: null,
    storage_backend: "database",
    content_type: "image/webp",
    byte_size: 8,
    stored_bytes: 8,
  },
]);

await assert.rejects(
  db.query(
    `update athlete_profile_photos
     set blob_pathname = $1, photo_bytes = $2, storage_backend = 'database'
     where user_id = 'database-photo-user'`,
    ["athlete-profile-photos/account/invalid.webp", Uint8Array.from([1])],
  ),
  /check/i,
);
await assert.rejects(
  db.query(`
    update athlete_profile_photos
    set content_type = 'image/svg+xml'
    where user_id = 'blob-photo-user'
  `),
  /check/i,
);
await db.close();

console.log("Private profile photo verification passed");
