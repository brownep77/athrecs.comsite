import { readFile, writeFile } from "node:fs/promises";

const apiPath = "src/lib/athrecs/result-claims-api.ts";
let api = await readFile(apiPath, "utf8");
const brokenTag = 'const users = await tx<{ email: string }>\n        `';
const fixedTag = 'const users = await tx<{ email: string }>`\n        ';
if (!api.includes(brokenTag)) throw new Error("Expected generated user query tag was not found");
api = api.replace(brokenTag, fixedTag);
await writeFile(apiPath, api);

const verifyPath = "scripts/verify-result-claims.mjs";
let verify = await readFile(verifyPath, "utf8");
const blockStart = verify.indexOf("assert.match(api, /const requiresReview");
const blockEndMarker = "assert.match(api, /Another verified account was approved/);";
const blockEnd = verify.indexOf(blockEndMarker, blockStart);
if (blockStart === -1 || blockEnd === -1) {
  throw new Error("Instant-approval verifier block was not found");
}
const end = blockEnd + blockEndMarker.length;
const block = verify.slice(blockStart, end);
const correctedBlock = block.replaceAll("\\\\", "\\");
verify = `${verify.slice(0, blockStart)}${correctedBlock}${verify.slice(end)}`;
await writeFile(verifyPath, verify);

console.log("Instant claim patch finalised");
