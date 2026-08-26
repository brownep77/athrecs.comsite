import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const claimRoute = await readFile(resolve(root, "src/routes/claim-results.tsx"), "utf8");
const privateProfileRoute = await readFile(
  resolve(root, "src/routes/my-athlete-profile.tsx"),
  "utf8",
);
const accountApi = await readFile(
  resolve(root, "src/lib/athrecs/athlete-account-api.ts"),
  "utf8",
);
const vercelConfig = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));

assert.match(claimRoute, /Add this result to your profile/);
assert.match(claimRoute, /Add this result to my profile/);
assert.match(claimRoute, /Optional evidence links/);
assert.match(claimRoute, /Not required · add up to three/);
assert.match(claimRoute, /View my private profile/);
assert.match(claimRoute, /to="\/my-athlete-profile"/);
assert.match(claimRoute, /Claim history/);
assert.match(claimRoute, /Tick the confirmation box to confirm this is your result/);
assert.doesNotMatch(claimRoute, /to="\/athletes\/\$slug"/);
assert.doesNotMatch(claimRoute, /View athlete profile/i);
assert.doesNotMatch(claimRoute, /verification detail/i);
assert.doesNotMatch(claimRoute, /Resubmit claim/i);
assert.doesNotMatch(claimRoute, /disabled=\{submitClaim\.isPending \|\| !declaration\}/);

assert.match(privateProfileRoute, /createFileRoute\("\/my-athlete-profile"\)/);
assert.match(privateProfileRoute, /getMyAthleteAccount/);
assert.match(privateProfileRoute, /enabled: Boolean\(user\)/);
assert.match(privateProfileRoute, /Private profile/);
assert.match(privateProfileRoute, /Personal bests/);
assert.match(privateProfileRoute, /Only you and authorised ATHRECS staff can view this profile/);
assert.match(privateProfileRoute, /noindex, nofollow, noarchive/);
assert.match(accountApi, /middleware\(\[authMiddleware\]\)/);

const privateProfileHeaders = vercelConfig.headers.find(
  (entry) => entry.source === "/my-athlete-profile",
);
assert.ok(privateProfileHeaders, "Private profile must have an explicit Vercel header rule");
const cacheControl = privateProfileHeaders.headers.find(
  (header) => header.key.toLowerCase() === "cache-control",
);
const robots = privateProfileHeaders.headers.find(
  (header) => header.key.toLowerCase() === "x-robots-tag",
);
assert.match(cacheControl?.value ?? "", /private/);
assert.match(cacheControl?.value ?? "", /no-store/);
assert.match(robots?.value ?? "", /noindex/);

console.log("Claim experience verification passed");
