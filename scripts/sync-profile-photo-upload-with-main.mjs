import { readFile, writeFile } from "node:fs/promises";

const packagePath = "package.json";
const pkg = JSON.parse(await readFile(packagePath, "utf8"));
pkg.dependencies ??= {};
pkg.dependencies["@vercel/blob"] ??= "^2.8.0";
pkg.scripts ??= {};
pkg.scripts["verify:profile-photo"] = "node scripts/verify-profile-photo.mjs";

const marker = "npm run verify:claim-experience &&";
let verify = String(pkg.scripts["ci:verify"] ?? "");
if (!verify.includes(marker)) {
  throw new Error("Current main quality gate no longer contains the claim-experience marker");
}
if (!verify.includes("npm run verify:profile-photo")) {
  verify = verify.replace(marker, `${marker} npm run verify:profile-photo &&`);
}
pkg.scripts["ci:verify"] = verify;

await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log("Preserved current main checks and re-added private photo verification");
