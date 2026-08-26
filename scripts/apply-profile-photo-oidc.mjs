import { readFile, writeFile } from "node:fs/promises";

function replaceOnce(source, before, after, label) {
  const index = source.indexOf(before);
  if (index === -1) throw new Error(`Could not find ${label}`);
  if (source.indexOf(before, index + before.length) !== -1) {
    throw new Error(`Expected one occurrence of ${label}`);
  }
  return `${source.slice(0, index)}${after}${source.slice(index + before.length)}`;
}

const accountPath = "src/lib/athrecs/athlete-account-api.ts";
let account = await readFile(accountPath, "utf8");
account = replaceOnce(
  account,
  "  const profilePhotoUploadAvailable = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());",
  `  const profilePhotoUploadAvailable = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_STORE_ID?.trim(),
  );`,
  "profile photo storage availability",
);
await writeFile(accountPath, account);

const verifyPath = "scripts/verify-profile-photo.mjs";
let verification = await readFile(verifyPath, "utf8");
verification = replaceOnce(
  verification,
  `assert.match(handler, /BLOB_READ_WRITE_TOKEN/);`,
  `assert.match(handler, /BLOB_READ_WRITE_TOKEN/);
assert.match(handler, /BLOB_STORE_ID/);
assert.match(handler, /blobStorageConnected/);
assert.match(handler, /blobAuthOptions/);
assert.match(handler, /storeId/);`,
  "Blob credential verification",
);
verification = replaceOnce(
  verification,
  `assert.match(accountApi, /safeImageUrl/);`,
  `assert.match(accountApi, /safeImageUrl/);
assert.match(accountApi, /process\\.env\\.BLOB_STORE_ID/);`,
  "account OIDC storage verification",
);
await writeFile(verifyPath, verification);

console.log("Private profile photos now support Vercel Blob OIDC and legacy tokens");
