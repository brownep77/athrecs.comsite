#!/usr/bin/env node
import { createServer } from "vite";

const isProduction = process.env.VERCEL_ENV === "production";
const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim();
if (!isProduction || (branch && branch !== "main")) {
  console.log(
    `[athrecs-catalogue] skipping database publication (environment=${process.env.VERCEL_ENV || "local"}, branch=${branch || "unknown"})`,
  );
  process.exit(0);
}

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required to publish the ATHRECS catalogue");
}

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const seed = await vite.ssrLoadModule("/src/lib/athrecs/seed.server.ts");
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");

  await seed.ensureAthrecsSeeded();

  const sql = await getSql();
  const rows = await sql.query(
    `select key, value
     from app_meta
     where key in ('seed_version', 'clubs_catalogue_version', 'fixtures_catalogue_version')`,
  );
  const markers = new Map(rows.map((row) => [row.key, row.value]));
  for (const key of ["seed_version", "clubs_catalogue_version", "fixtures_catalogue_version"]) {
    if (markers.get(key) !== seed.CATALOGUE_SEED_VERSION) {
      throw new Error(
        `ATHRECS catalogue publication did not advance ${key} to ${seed.CATALOGUE_SEED_VERSION}`,
      );
    }
  }

  console.log(`[athrecs-catalogue] published and verified ${seed.CATALOGUE_SEED_VERSION}`);
} finally {
  await vite.close();
}
