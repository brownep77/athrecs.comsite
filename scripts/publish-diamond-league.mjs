import { createServer } from "vite";
import { publishDiamondLeagueEditions } from "./lib/diamond-league-publication.mjs";

if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[diamond-league] skipping outside production/main");
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
  const { DIAMOND_LEAGUE_2027 } = await vite.ssrLoadModule("/src/data/diamond-league.ts");
  console.log(
    "[diamond-league]",
    await publishDiamondLeagueEditions(await getSql(), publishing, DIAMOND_LEAGUE_2027),
  );
} finally {
  await vite.close();
}
