import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { publishCountyExpansion } from "./lib/county-expansion-publication.mjs";
import { COUNTY_EXPANSION_MORE } from "./lib/county-expansion-more.mjs";

if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[county-expansion-more] skipping outside production/main");
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent database required");
const data = JSON.parse(
  await readFile(new URL("../src/data/county-expansion-more-2026-10-21.json", import.meta.url)),
);
const baseline = JSON.parse(
  await readFile(new URL("./lib/county-expansion-more-baseline.json", import.meta.url)),
);
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");
  const publishing = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  console.log(
    "[county-expansion-more]",
    await publishCountyExpansion(await getSql(), publishing, data, baseline, COUNTY_EXPANSION_MORE),
  );
} finally {
  await vite.close();
}
