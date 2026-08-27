import { readFile, writeFile } from "node:fs/promises";

const profilePath = "src/routes/my-athlete-profile.tsx";
let profile = await readFile(profilePath, "utf8");

const photoImport =
  'import { ProfilePhotoUploader } from "@/components/athletes/ProfilePhotoUploader";\n';
const bioImport = 'import { AthleteBioCard } from "@/components/athletes/AthleteBioCard";\n';
if (!profile.includes(bioImport)) {
  if (!profile.includes(photoImport)) throw new Error("Profile photo import anchor not found");
  profile = profile.replace(photoImport, `${bioImport}${photoImport}`);
}

const cardAnchor = `      </section>\n\n      {data.claimedProfiles.length ? (`;
const cardInsertion = `      </section>\n\n      <AthleteBioCard />\n\n      {data.claimedProfiles.length ? (`;
if (!profile.includes("<AthleteBioCard />")) {
  if (!profile.includes(cardAnchor)) throw new Error("Profile bio card anchor not found");
  profile = profile.replace(cardAnchor, cardInsertion);
}
await writeFile(profilePath, profile);

const packagePath = "package.json";
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
packageJson.scripts["verify:athlete-bio"] =
  "node --experimental-strip-types scripts/verify-athlete-bio.mjs";
const bioCommand = "npm run verify:athlete-bio";
if (!packageJson.scripts["ci:verify"].includes(bioCommand)) {
  const photoCommand = "npm run verify:profile-photo";
  if (!packageJson.scripts["ci:verify"].includes(photoCommand)) {
    throw new Error("Profile photo quality-gate anchor not found");
  }
  packageJson.scripts["ci:verify"] = packageJson.scripts["ci:verify"].replace(
    photoCommand,
    `${photoCommand} && ${bioCommand}`,
  );
}
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log("Athlete Profile bio card and quality gate registered");
