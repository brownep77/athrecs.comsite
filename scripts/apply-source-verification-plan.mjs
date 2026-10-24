#!/usr/bin/env node
import { open, readFile } from "node:fs/promises";
import { Client } from "pg";
import { postgresConnectionConfig } from "../src/lib/postgres-connection.js";
import {
  applySourceVerificationPlan,
  sourceVerificationPlanHash,
} from "./lib/source-verification-batch.mjs";

const args = process.argv.slice(2),
  options = {};
for (let index = 0; index < args.length; index++) {
  const arg = args[index];
  if (["--apply", "--help"].includes(arg)) options[arg.slice(2)] = true;
  else if (["--plan", "--connection-file", "--plan-hash", "--receipt"].includes(arg)) {
    if (!args[index + 1] || args[index + 1].startsWith("--"))
      throw new Error(`Missing value for ${arg}.`);
    options[arg.slice(2)] = args[++index];
  } else throw new Error(`Unknown argument: ${arg}`);
}
if (options.help) {
  console.log(
    "Usage: node scripts/apply-source-verification-plan.mjs --plan PRIVATE_PLAN.json --connection-file PRIVATE_DATABASE_URL_FILE --receipt PRIVATE_RECEIPT.json [--apply --plan-hash SHA256]\nDefault: executes all checks and database triggers, then rolls back. The input, connection file and receipt are private and must stay outside git. Receipt files are never overwritten.",
  );
} else {
  if (!options.plan || !options["connection-file"] || !options.receipt)
    throw new Error("Provide --plan, --connection-file and --receipt; use --help for usage.");
  const plan = JSON.parse(await readFile(options.plan, "utf8"));
  const planHash = sourceVerificationPlanHash(plan);
  if (options.apply && options["plan-hash"] !== planHash)
    throw new Error(`Applying requires --plan-hash ${planHash} for this exact reviewed plan.`);
  const url = (await readFile(options["connection-file"], "utf8")).trim();
  if (!/^postgres(?:ql)?:\/\//.test(url))
    throw new Error("The connection file must contain one Postgres URI.");
  // Reserve the private receipt before any database change; never fail after commit
  // merely because the requested path already exists or cannot be created.
  const receiptFile = await open(options.receipt, "wx", 0o600);
  const client = new Client(postgresConnectionConfig(url, { connectionTimeoutMillis: 15000 }));
  try {
    await client.connect();
    const sql = {
      query: async (text, values = []) => (await client.query(text, values)).rows,
      transaction: async (work) => {
        await client.query("begin");
        try {
          const value = await work(sql);
          await client.query("commit");
          return value;
        } catch (error) {
          await client.query("rollback");
          throw error;
        }
      },
    };
    const receipt = await applySourceVerificationPlan(sql, plan, { dryRun: !options.apply });
    await receiptFile.writeFile(JSON.stringify(receipt, null, 2) + "\n");
    console.log(JSON.stringify(receipt));
  } finally {
    await client.end();
    await receiptFile.close();
  }
}
