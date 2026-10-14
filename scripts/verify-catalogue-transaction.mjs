import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { runCatalogueTransaction } from "../src/lib/athrecs/catalogue-transaction.ts";

// PostgreSQL error states after real writes: prove rollback before any retry.
const db = new PGlite();
let transactions = 0;
let locks = 0;
const sql = {
  transaction: (work) => {
    transactions += 1;
    return db.transaction((tx) =>
      work({
        query: async (text, params) => {
          // PGlite has one session. Independent-session locking is tested below.
          if (text.includes("pg_advisory_xact_lock")) {
            locks += 1;
            return [];
          }
          return (await tx.query(text, params)).rows;
        },
      }),
    );
  },
};
try {
  await db.exec(
    "create table retry_probe (id int primary key, value int not null); insert into retry_probe values (1, 0)",
  );
  for (const code of ["40P01", "40001"]) {
    const before = transactions;
    let attempts = 0;
    await runCatalogueTransaction(sql, async (tx) => {
      attempts += 1;
      await tx.query("update retry_probe set value=value+1");
      if (attempts === 1)
        await tx.query(
          `do $$ begin raise exception 'synthetic abort' using errcode='${code}'; end $$`,
        );
    });
    assert.equal(transactions - before, 2);
  }
  assert.equal((await db.query("select value from retry_probe")).rows[0].value, 2);
  const beforeExhaustion = transactions;
  await assert.rejects(
    runCatalogueTransaction(sql, async (tx) => {
      await tx.query("update retry_probe set value=value+1");
      await tx.query(
        "do $$ begin raise exception 'persistent abort' using errcode='40P01'; end $$",
      );
    }),
    { code: "40P01" },
  );
  assert.equal(transactions - beforeExhaustion, 4, "Retries are bounded");
  for (const code of ["23505", "42501", "08006", "53100", "XX000"]) {
    const before = transactions;
    await assert.rejects(
      runCatalogueTransaction(sql, async (tx) => {
        await tx.query("update retry_probe set value=value+1");
        throw Object.assign(new Error("non-retryable failure"), { code });
      }),
      { code },
    );
    assert.equal(transactions - before, 1, `Do not retry ${code}`);
  }
  assert.equal(
    (await db.query("select value from retry_probe")).rows[0].value,
    2,
    "Exhaustion and non-retryable errors leave no partial writes",
  );
  assert.equal(locks, transactions, "Every new transaction reacquires the catalogue lock");
} finally {
  await db.close();
}
console.log("Catalogue transaction rollback, retry limits and fail-closed errors passed.");

// CI has a disposable PostgreSQL service. Never connect to a deployment DB.
if (process.env.CI === "true") {
  const url = new URL(process.env.DATABASE_URL || "");
  assert(
    ["127.0.0.1", "localhost"].includes(url.hostname) && url.pathname === "/athrecs_ci",
    "Concurrent regression requires the disposable local athrecs_ci database",
  );
  const { Client } = await import("pg");
  const first = new Client({ connectionString: url.href });
  const second = new Client({ connectionString: url.href });
  const schema = `catalogue_retry_${process.pid}`;
  let attempts = 0;
  let releaseReader;
  let readerReady;
  const readerStarted = new Promise((resolve) => {
    readerReady = resolve;
  });
  const writerStarted = new Promise((resolve) => {
    releaseReader = resolve;
  });
  try {
    await first.connect();
    await second.connect();
    await first.query(`create schema ${schema}`);
    for (const client of [first, second]) {
      await client.query(`set search_path to ${schema}`);
      await client.query("set statement_timeout = '15s'");
    }
    await first.query(
      "create table writer_table (id int primary key, value int); create table reader_table (id int); insert into writer_table values (1, 0)",
    );
    // Prefer the writer as victim, so this exercises its recovery deterministically.
    await first.query("set deadlock_timeout = '50ms'");
    await second.query("set deadlock_timeout = '5s'");
    const realSql = {
      transaction: async (work) => {
        await first.query("begin");
        try {
          const result = await work({
            query: async (text, params) => (await first.query(text, params)).rows,
          });
          await first.query("commit");
          return result;
        } catch (error) {
          await first.query("rollback");
          throw error;
        }
      },
    };
    const reader = (async () => {
      await second.query("begin");
      try {
        await second.query("select * from reader_table");
        readerReady();
        await writerStarted;
        await second.query("select * from writer_table");
        await second.query("commit");
      } catch (error) {
        await second.query("rollback");
        throw error;
      }
    })();
    const writer = runCatalogueTransaction(realSql, async (tx) => {
      attempts += 1;
      await tx.query("update writer_table set value=value+1");
      await tx.query("lock table writer_table in access exclusive mode");
      if (attempts === 1) {
        await readerStarted;
        releaseReader();
      }
      await tx.query("lock table reader_table in access exclusive mode");
    });
    const outcomes = await Promise.allSettled([reader, writer]);
    for (const outcome of outcomes) if (outcome.status === "rejected") throw outcome.reason;
    assert.equal(attempts, 2, "Real AccessShare/AccessExclusive deadlock is retried");
    assert.equal((await first.query("select value from writer_table")).rows[0].value, 1);
    const lock = await second.query(
      "select pg_try_advisory_xact_lock($1) as acquired",
      [1_095_527_506],
    );
    assert.equal(lock.rows[0].acquired, true, "Commit releases the catalogue lock");
    console.log(
      "Real PostgreSQL concurrent reader/schema deadlock recovered with one committed write.",
    );
  } finally {
    await first.query("rollback").catch(() => {});
    await second.query("rollback").catch(() => {});
    await first.query(`drop schema if exists ${schema} cascade`).catch(() => {});
    await Promise.all([first.end(), second.end()]);
  }
}
