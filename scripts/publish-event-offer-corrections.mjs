import { createServer } from "vite";
import { publishEventOfferCorrections } from "./lib/event-offer-corrections.mjs";

// Publication remains production/main-only, through the normal validation,
// concurrent-change checks, transaction and reversible catalogue revision log.
if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[event-offers] skipping publication outside production/main");
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent database required");

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");
  const publishing = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  const { eventOfferCorrections } = await vite.ssrLoadModule(
    "/src/data/event-offer-corrections.ts",
  );
  const sql = await getSql();
  await publishEventOfferCorrections(sql, publishing, eventOfferCorrections);
} finally {
  await vite.close();
}
