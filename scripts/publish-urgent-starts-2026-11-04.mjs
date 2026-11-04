// Run manually only after Paul's explicit approval; never imported by the build.
import { createServer } from "vite";
import details from "../src/data/urgent-starts-2026-11-04.json" with { type: "json" };
import { URGENT_STARTS_20261104_REVIEW as review } from "./lib/urgent-starts-2026-11-04-review.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
if (!process.argv.includes("--apply"))
  throw new Error("Publication requires explicit --apply after owner approval");
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent database required");
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");
  const publishing = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  console.log(await publishCheckedFixtures(await getSql(), publishing, details, review));
} finally {
  await vite.close();
}
