import { readFile, writeFile } from "node:fs/promises";

const path = "scripts/verify-result-claims.mjs";
let source = await readFile(path, "utf8");

const replacements = [
  [
    "assert.match(claimRoute, /Matched claims are linked to your Athlete Account immediately/);",
    "assert.match(claimRoute, /Confirm a matched result once and it is added immediately/);",
  ],
  [
    "assert.match(claimRoute, /Evidence is not required to claim a result/);",
    "assert.match(claimRoute, /No evidence is needed/);",
  ],
  [
    "assert.match(claimRoute, /Evidence link 3/);",
    "assert.match(claimRoute, /Not required · add up to three/);",
  ],
  [
    "assert.match(claimRoute, /Add result to my profile/);",
    "assert.match(claimRoute, /Add this result to my profile/);",
  ],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) throw new Error(`Missing verifier assertion: ${before}`);
  source = source.replace(before, after);
}

await writeFile(path, source);
console.log("Updated result-claim verifier for the redesigned claim journey");
