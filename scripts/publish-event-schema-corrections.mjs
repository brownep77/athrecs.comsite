import { createServer } from "vite";
import { publishEventSchemaCorrections } from "./lib/event-schema-corrections.mjs";

if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[event-schema] skipping publication outside production/main");
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
  const { eventSchemaCorrections } = await vite.ssrLoadModule(
    "/src/data/event-schema-corrections.ts",
  );
  await publishEventSchemaCorrections(await getSql(), publishing, eventSchemaCorrections);
} finally {
  await vite.close();
}
