import { createServer } from "vite";
import { publishColombiaRunning } from "./lib/colombia-running-publication.mjs";

if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[colombia-running] skipping outside production/main");
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent database required");
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
});
try {
  const data = await vite.ssrLoadModule("/src/data/colombia-races.ts");
  const publishing = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");
  console.log("[colombia-running]", await publishColombiaRunning(await getSql(), publishing, data));
} finally {
  await vite.close();
}
