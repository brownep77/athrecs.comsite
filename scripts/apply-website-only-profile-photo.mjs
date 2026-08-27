import { readFile, writeFile } from "node:fs/promises";

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first === -1) throw new Error(`Could not find ${label}`);
  if (source.indexOf(before, first + before.length) !== -1) {
    throw new Error(`Expected one occurrence of ${label}`);
  }
  return `${source.slice(0, first)}${after}${source.slice(first + before.length)}`;
}

const profilePath = "src/routes/my-athlete-profile.tsx";
let profile = await readFile(profilePath, "utf8");
profile = replaceOnce(
  profile,
  "              fallbackImageUrl={data.authImageUrl}\n",
  "",
  "Google profile-image fallback on the private profile",
);
await writeFile(profilePath, profile);

const uploaderPath = "src/components/athletes/ProfilePhotoUploader.tsx";
let uploader = await readFile(uploaderPath, "utf8");
uploader = replaceOnce(
  uploader,
  "  fallbackImageUrl?: string;\n",
  "",
  "fallback image property",
);
uploader = replaceOnce(
  uploader,
  "  fallbackImageUrl = \"\",\n",
  "",
  "fallback image parameter",
);
uploader = replaceOnce(
  uploader,
  "  const visibleImage = privateImageUrl || fallbackImageUrl;",
  "  const visibleImage = privateImageUrl;",
  "visible profile image selection",
);
uploader = replaceOnce(
  uploader,
  '{visibleImage ? "Change" : "Add photo"}',
  '{visibleImage ? "Change" : "Upload"}',
  "portrait overlay label",
);
uploader = replaceOnce(
  uploader,
  '{visibleImage ? "Change photo" : "Upload photo"}',
  '{visibleImage ? "Change photo" : "Upload from device"}',
  "website upload button label",
);
uploader = replaceOnce(
  uploader,
  `      </div>\n\n      {message ? (\n`,
  `      </div>\n\n      <p className="max-w-xs text-xs leading-5 text-slate-300">\n        Upload directly from this device. ATHRECS does not use your Google profile picture.\n      </p>\n\n      {message ? (\n`,
  "direct-upload explanation",
);
await writeFile(uploaderPath, uploader);

const verifierPath = "scripts/verify-profile-photo.mjs";
let verifier = await readFile(verifierPath, "utf8");
verifier = replaceOnce(
  verifier,
  "assert.match(uploader, /Upload photo/);",
  "assert.match(uploader, /Upload from device/);\nassert.match(uploader, /ATHRECS does not use your Google profile picture/);\nassert.doesNotMatch(uploader, /fallbackImageUrl/);",
  "upload-label assertion",
);
verifier = replaceOnce(
  verifier,
  "assert.match(profileRoute, /fallbackImageUrl=\\{data\\.authImageUrl\\}/);",
  "assert.doesNotMatch(profileRoute, /fallbackImageUrl=/);\nassert.doesNotMatch(profileRoute, /authImageUrl/);",
  "profile fallback assertion",
);
await writeFile(verifierPath, verifier);

console.log("Website-only Athlete Profile photo changes applied");
