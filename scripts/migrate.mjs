#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations to DATABASE_URL. Each file is applied in one transaction and
 * recorded in a `_migrations` table, so it runs once and is safe to re-run.
 *
 * No DATABASE_URL (local / preview builds) -> skip; the PGLite fallback applies
 * the same files at startup instead (see src/lib/db.ts).
 *
 * Local and preview builds may skip an unavailable database. Production is
 * deliberately strict: a missing or unreachable database fails the deployment,
 * leaving Vercel's previous known-good application and schema live.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const strictMigrations =
  process.env.MIGRATIONS_STRICT === "true" ||
  process.env.MIGRATIONS_REQUIRED === "true" ||
  process.env.VERCEL_ENV === "production";
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  if (strictMigrations) {
    console.error(
      "[migrate] DATABASE_URL is required for production; refusing an ephemeral deployment.",
    );
    process.exit(1);
  }
  console.log(
    "[migrate] DATABASE_URL not set — skipping (the PGLite fallback migrates itself).",
  );
  process.exit(0);
}

const migrationsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

function poolConfig(url) {
  const needsSsl =
    /neon\.tech|sslmode=require|ssl=true|amazonaws\.com/i.test(url) ||
    process.env.PGSSLMODE === "require";
  return {
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 30_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

function isTransientDbError(err) {
  const code = err?.code;
  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "EAI_AGAIN" ||
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH" ||
    code === "57P01" || // admin_shutdown
    code === "57P03" // cannot_connect_now
  ) {
    return true;
  }
  const msg = String(err?.message ?? err ?? "");
  return /timeout|ECONNREFUSED|ENOTFOUND|getaddrinfo|Connection terminated|ssl|password authentication failed|too many connections/i.test(
    msg,
  );
}

async function connectWithRetry(pool, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await pool.connect();
    } catch (err) {
      lastErr = err;
      if (!isTransientDbError(err) || i === attempts) throw err;
      const wait = i * 1500;
      console.warn(
        `[migrate] connect attempt ${i}/${attempts} failed (${err?.code || err?.message}); retrying in ${wait}ms…`,
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

async function main() {
  const pool = new pg.Pool(poolConfig(databaseUrl));
  let client;
  try {
    client = await connectWithRetry(pool);
  } catch (err) {
    if (isTransientDbError(err) && !strictMigrations) {
      console.warn(
        "[migrate] could not reach DATABASE_URL — skipping migrations for this non-production build.",
      );
      console.warn(`[migrate]   ${err?.code || ""} ${err?.message || err}`);
      await pool.end().catch(() => undefined);
      process.exit(0);
    }
    throw err;
  }

  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = new Set(
      (await client.query("SELECT name FROM _migrations")).rows.map(
        (r) => r.name,
      ),
    );

    let files;
    try {
      files = (await readdir(migrationsDir))
        .filter((f) => f.endsWith(".sql"))
        .sort();
    } catch {
      console.log("[migrate] no migrations/ directory — nothing to do.");
      return;
    }

    let count = 0;
    for (const name of files) {
      if (applied.has(name)) continue;
      const text = await readFile(join(migrationsDir, name), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [
          name,
        ]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // keep original error
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(
      count
        ? `[migrate] done — ${count} migration(s) applied.`
        : "[migrate] up to date.",
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  if (isTransientDbError(err) && !strictMigrations) {
    console.warn(
      "[migrate] transient DB error — skipping migrations for this build.",
    );
    console.warn(`[migrate]   ${err?.code || ""} ${err?.message || err}`);
    process.exit(0);
  }
  console.error("[migrate] failed:", err?.message || err);
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  process.exit(1);
});
