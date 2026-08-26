import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

function gitJson(ref, path) {
  return JSON.parse(execFileSync("git", ["show", `${ref}:${path}`], { encoding: "utf8" }));
}

const branchPackage = gitJson("HEAD", "package.json");
const mainPackage = gitJson("origin/main", "package.json");

mainPackage.dependencies["@vercel/blob"] = branchPackage.dependencies["@vercel/blob"];
mainPackage.scripts["verify:profile-photo"] = branchPackage.scripts["verify:profile-photo"];

if (!mainPackage.scripts["ci:verify"].includes("verify:profile-photo")) {
  mainPackage.scripts["ci:verify"] = mainPackage.scripts["ci:verify"].replace(
    "npm run verify:claim-experience &&",
    "npm run verify:claim-experience && npm run verify:profile-photo &&",
  );
}

if (!mainPackage.scripts["ci:verify"].includes("verify:multisport-taxonomy")) {
  throw new Error("The synchronized quality gate lost multisport taxonomy verification");
}
if (!mainPackage.scripts["ci:verify"].includes("verify:profile-photo")) {
  throw new Error("The synchronized quality gate lost profile photo verification");
}

await writeFile("package.json", `${JSON.stringify(mainPackage, null, 2)}\n`);
console.log("Combined current main verification with private profile photo support");
