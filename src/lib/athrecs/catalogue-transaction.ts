import type { Sql } from "../db";

const CATALOGUE_SEED_LOCK_ID = 1_095_527_506;
const MAX_ATTEMPTS = 4;

/** Retry only transactions PostgreSQL has definitively aborted, after rollback. */
export async function runCatalogueTransaction(
  sql: Sql,
  refresh: (tx: Sql) => Promise<void>,
): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await sql.transaction(async (tx) => {
        // Reacquire the same cross-deployment lock and recheck catalogue markers
        // on every attempt. Never replay just the failed statement or reuse a tx.
        await tx.query("select pg_advisory_xact_lock($1)", [CATALOGUE_SEED_LOCK_ID]);
        await refresh(tx);
      });
      return;
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (attempt >= MAX_ATTEMPTS || (code !== "40P01" && code !== "40001")) throw error;
      // Live readers, migrations and imports do not all take the catalogue lock.
      // Jitter avoids overlapping deployments immediately colliding again.
      const delayMs = 250 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      console.warn(
        `[catalogue-seed] transaction aborted (${code}); retry ${attempt + 1}/${MAX_ATTEMPTS} in ${delayMs}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
