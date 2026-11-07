import type { Sql } from "../db";

const progressKey = "history-sports-backfill-v1";

/**
 * Fill athlete_history_sports for histories that existed before the cache
 * table. Each call classifies one batch (about 0.7 ms per history) so the
 * worker stays well inside its time limit; new and changed histories are
 * kept current by the database trigger. Returns whether the cache is complete.
 */
export async function backfillHistorySports(sql: Sql, batch = 25_000) {
  const [done] = await sql.query<{ payload: { complete?: boolean } }>(
    "select payload from collection_stats_snapshots where key=$1",
    [progressKey],
  );
  if (done?.payload?.complete) return { complete: true, added: 0 };
  return sql.transaction(async (tx) => {
    await tx.query("set local statement_timeout='45s'");
    await tx.query("set local lock_timeout='5s'");
    await tx.query("select pg_advisory_xact_lock(hashtext($1))", [progressKey]);
    const added = await tx.query<{ provider: string }>(
      `insert into athlete_history_sports (provider, external_id, athlete_id, sports)
       select h.provider, h.external_id, h.athlete_id, athlete_history_sports_v5(h.provider, h.performances)
       from athlete_source_histories h
       where not exists (
         select 1 from athlete_history_sports c
         where c.provider = h.provider and c.external_id = h.external_id)
       limit $1
       on conflict (provider, external_id) do nothing
       returning provider`,
      [batch],
    );
    const complete = added.length < batch;
    if (complete)
      await tx.query(
        `insert into collection_stats_snapshots (key, payload, generated_at)
         values ($1, '{"complete":true}'::jsonb, now())
         on conflict (key) do update set payload = excluded.payload, generated_at = now()`,
        [progressKey],
      );
    return { complete, added: added.length };
  });
}
