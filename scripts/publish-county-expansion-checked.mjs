import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { publishCountyExpansion } from "./lib/county-expansion-publication.mjs";
import { publishCountyTbcReview } from "./lib/county-tbc-publication.mjs";

if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[county-expansion-checked] skipping outside production/main");
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent database required");
const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url)));
const data = await read("../src/data/county-expansion-checked-2026-10-21.json");
const baseline = await read("./lib/county-expansion-checked-baseline.json");
const review = await read("../src/data/county-tbc-review-2026-10-21.json");
const reviewBaseline = await read("./lib/county-tbc-review-baseline.json");
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");
  const publishing = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  const sql = await getSql();
  console.log(
    "[county-expansion-checked]",
    await publishCountyExpansion(sql, publishing, data, baseline, {
      sourcePrefix: "athrecs:county-expansion-checked:2026-10-21",
      expectedEvents: 14,
      expectedEditions: 66,
    }),
  );
  console.log(
    "[county-tbc-review]",
    await publishCountyTbcReview(sql, publishing, review, reviewBaseline),
  );
} finally {
  await vite.close();
}
