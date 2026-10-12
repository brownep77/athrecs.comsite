import type { Sql } from "../db";

/** Bound memory for catalogue joins without changing the pool's next request. */
export function withDiscoveryRead<T>(sql: Sql, read: (transaction: Sql) => Promise<T>): Promise<T> {
  return sql.transaction(async (transaction) => {
    // Avoid repeated disk spills at catalogue scale. Disable parallel workers
    // for this read so each worker cannot allocate its own copy of that budget.
    await transaction.query(
      "select set_config('work_mem', '32MB', true), set_config('max_parallel_workers_per_gather', '0', true)",
    );
    return read(transaction);
  });
}
