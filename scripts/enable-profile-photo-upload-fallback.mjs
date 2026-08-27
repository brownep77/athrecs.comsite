import { readFile, writeFile } from "node:fs/promises";

const path = "src/lib/athrecs/athlete-account-api.ts";
let source = await readFile(path, "utf8");

const availabilityBefore = `  const profilePhotoUploadAvailable = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_STORE_ID?.trim(),
  );`;
const availabilityAfter = `  // Upload is always available: private Blob is preferred, with an
  // authenticated Postgres bytea fallback until an object store is connected.
  const profilePhotoUploadAvailable = true;`;
if (!source.includes(availabilityBefore)) {
  throw new Error("Could not find profile-photo availability block");
}
source = source.replace(availabilityBefore, availabilityAfter);

const urlBefore = `    profilePhotoUrl:
      photo && profilePhotoUploadAvailable
        ? \`/api/athlete-profile-photo?v=\${encodeURIComponent(photo.updated_at)}\`
        : "",`;
const urlAfter = `    profilePhotoUrl: photo
      ? \`/api/athlete-profile-photo?v=\${encodeURIComponent(photo.updated_at)}\`
      : "",`;
if (!source.includes(urlBefore)) {
  throw new Error("Could not find profile-photo URL block");
}
source = source.replace(urlBefore, urlAfter);

await writeFile(path, source);
console.log("Profile photo upload enabled with private database fallback");
