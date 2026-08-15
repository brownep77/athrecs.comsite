import { dbSource, getPglite, type Sql, type SqlRow } from "@/lib/db";

/**
 * Run a unit of Athrecs work on one database connection.
 *
 * The existing shared Sql abstraction intentionally hides driver connections,
 * which is ideal for ordinary server functions but cannot guarantee that BEGIN,
 * writes and COMMIT use the same pg Pool client. This small server-only helper
 * supplies that missing atomic boundary for publishing result batches and
 * applying reviewed submissions. It works with both production Neon and the
 * local PGLite fallback.
 */

type QueryRunner = <T>(text: string, params: unknown[]) => Promise<T[]>;

function toSql(run: QueryRunner): Sql {
  const sql = (async <T = SqlRow>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0];
    for (let index = 0; index < values.length; index += 1) {
      text += `$${index + 1}${strings[index + 1]}`;
    }
    return run<T>(text, values);
  }) as Sql;

  sql.query = <T = SqlRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<T[]> => run<T>(text, params);

  return sql;
}

const globalRef = globalThis as typeof globalThis & {
  __athrecsTransactionPool__?: import("pg").Pool;
};

async function getTransactionPool(): Promise<import("pg").Pool> {
  if (globalRef.__athrecsTransactionPool__) {
    return globalRef.__athrecsTransactionPool__;
  }

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for a Neon transaction");
  }

  const { Pool, types } = await import("pg");
  // Match src/lib/db.ts so transaction reads have the same JSON-safe shapes.
  types.setTypeParser(20, Number); // int8
  types.setTypeParser(1082, (value: string) => value); // date
  types.setTypeParser(1186, (value: string) => value); // interval

  globalRef.__athrecsTransactionPool__ = new Pool({ connectionString });
  return globalRef.__athrecsTransactionPool__;
}

export async function withSqlTransaction<T>(
  work: (sql: Sql) => Promise<T>,
): Promise<T> {
  if (dbSource === "pglite") {
    const pg = await getPglite();
    return pg.transaction(async (transaction) => {
      const sql = toSql(async <Row>(text: string, params: unknown[]) => {
        const response = await transaction.query<Row>(text, params);
        return response.rows;
      });
      return work(sql);
    });
  }

  const pool = await getTransactionPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const sql = toSql(async <Row>(text: string, params: unknown[]) => {
      const response = await client.query(text, params);
      return response.rows as Row[];
    });
    const result = await work(sql);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
