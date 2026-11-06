import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { publishReviewedParkrunFixtures } from "./lib/parkrun-reviewed-publication.mjs";

if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[parkrun-reviewed] skipping outside production/main");
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent database required");

const review = JSON.parse(
  await readFile(new URL("../src/data/parkrun-review-2026-11-06.json", import.meta.url), "utf8"),
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
    "[parkrun-reviewed]",
    await publishReviewedParkrunFixtures(await getSql(), publishing, review),
  );
} finally {
  await vite.close();
}
