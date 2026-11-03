import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  assertProductionAuthConfiguration,
  productionAuthConfigurationIssues,
} from "../src/lib/auth/production-config.ts";

const valid = {
  VERCEL_ENV: "production",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_SECRET: "synthetic-secret-that-must-never-appear-in-output",
  BETTER_AUTH_URL: "https://www.athrecs.com",
  DATABASE_URL: "postgresql://synthetic-user:private-database-password@db.example.test/athrecs",
  RESEND_API_KEY: "synthetic-resend-key-that-must-never-appear-in-output",
};
assert.deepEqual(productionAuthConfigurationIssues(valid, true), []);
assert.doesNotThrow(() => assertProductionAuthConfiguration(valid, true));
let assertions = 2;
for (const key of ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "DATABASE_URL", "RESEND_API_KEY"]) {
  for (const absent of [undefined, "", " \t "]) {
    const env = { ...valid, [key]: absent };
    assert.throws(() => assertProductionAuthConfiguration(env, true), new RegExp(key));
    assertions++;
  }
}
for (const override of [
  { VITE_AUTH_ENABLED: "false" },
  { VITE_AUTH_ENABLED: " FALSE " },
  { BETTER_AUTH_SECRET: "short" },
  { BETTER_AUTH_URL: "http://www.athrecs.com" },
  { BETTER_AUTH_URL: "https://localhost" },
  { BETTER_AUTH_URL: "https://127.0.0.1" },
  { BETTER_AUTH_URL: "https://www.athrecs.com/path" },
  { BETTER_AUTH_URL: "https://private-user:private-password@www.athrecs.com" },
  { BETTER_AUTH_URL: "https://www.athrecs.com/?token=private-query" },
  { DATABASE_URL: "file:///tmp/test.db" },
  { DATABASE_URL: "postgresql://user:password@localhost/database" },
  { DATABASE_URL: "postgresql://user:password@127.0.0.2/database" },
  { DATABASE_URL: "postgresql://user:password@[::1]/database" },
  { DATABASE_URL: "postgresql://user:password@db.example.test/" },
]) {
  assert.throws(() => assertProductionAuthConfiguration({ ...valid, ...override }, true));
  assertions++;
}
// Local development and isolated CI deliberately retain the no-email path.
for (const VERCEL_ENV of [undefined, "", "development", "preview"]) {
  assert.doesNotThrow(() =>
    assertProductionAuthConfiguration({ VERCEL_ENV, VITE_AUTH_ENABLED: "false" }, true),
  );
  assertions++;
}
assert.doesNotThrow(() =>
  assertProductionAuthConfiguration({ ...valid, RESEND_API_KEY: undefined }, false),
);
assertions++;
const guard = fileURLToPath(new URL("./verify-deployment-auth-env.mjs", import.meta.url));
for (const env of [
  valid,
  { ...valid, BETTER_AUTH_SECRET: "short" },
  { ...valid, RESEND_API_KEY: "" },
]) {
  const child = spawnSync(process.execPath, [guard], {
    encoding: "utf8",
    env: { PATH: process.env.PATH, ...env },
  });
  assert.equal(child.status, env === valid ? 0 : 1);
  const output = child.stdout + child.stderr;
  for (const secret of [
    valid.BETTER_AUTH_SECRET,
    valid.RESEND_API_KEY,
    "private-database-password",
    "synthetic-user",
  ]) {
    assert(!output.includes(secret), "Configuration diagnostics must never reveal values");
    assertions++;
  }
  assertions++;
}
console.log(
  `Production authentication guard passed ${assertions} behavioral assertions; preview/local remain available and diagnostics contain no secret values.`,
);
