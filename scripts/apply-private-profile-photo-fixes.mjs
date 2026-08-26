import { readFile, writeFile } from "node:fs/promises";

const path = "src/lib/athrecs/athlete-account-api.ts";
let source = await readFile(path, "utf8");

const before = `        preferredLanguage: profile.preferred_language ?? "",
        privacyAcknowledged: Boolean(profile.privacy_acknowledged_at),`;
const after = `        preferredLanguage: profile.preferred_language ?? "",
        profilePhotoUrl: "",
        profilePhotoUpdatedAt: null,
        profilePhotoUploadAvailable: false,
        authImageUrl: "",
        privacyAcknowledged: Boolean(profile.privacy_acknowledged_at),`;

if (!source.includes(before)) {
  throw new Error("Could not find the staff Athlete Account response");
}
source = source.replace(before, after);
await writeFile(path, source);
console.log("Added safe private-photo defaults to the staff Athlete Account response");
