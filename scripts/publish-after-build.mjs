#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const siteBrand = process.env.VITE_SITE_BRAND?.trim().toLowerCase();
if (siteBrand === "runrecs") {
  console.log("[publish-after-build] RunRecs is a read-through specialist site; ATHRECS remains the sole catalogue publisher.");
  process.exit(0);
}

const publishers = [
  "scripts/publish-uk-ireland-prominent-races.mjs",
  "scripts/publish-remaining-uk-ireland-race-additions.mjs",
  "scripts/publish-germany-belgium-catalogues.mjs",
  "scripts/publish-uk-ireland-five-k-release.mjs",
  "scripts/publish-uk-home-nation-championships.mjs",
  "scripts/publish-uk-10k-release-64.mjs",
];

for (const publisher of publishers) {
  const result = spawnSync(process.execPath, [publisher], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
