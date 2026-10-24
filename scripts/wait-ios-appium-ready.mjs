import assert from "node:assert/strict";
import fs from "node:fs";
import { setTimeout as pause } from "node:timers/promises";

const endpoint = "http://127.0.0.1:4723/status";
const artifact = "artifacts/race-actions-ios-native-server-startup.json";
const budgetMs = 120_000;
const started = performance.now();
const deadline = started + budgetMs;
const pidText = process.env.ATHRECS_APPIUM_PROCESS;
const report = {
  status: "polling",
  endpoint,
  startedAt: new Date().toISOString(),
  budgetMs,
  maxRequestMs: 5000,
  gapMs: 300,
  processId: pidText || null,
  attempts: 0,
  failedAttempts: [],
  omittedFailedAttempts: 0,
  lastResponse: null,
};
let pid;
let lastProgress = -Infinity;
const remaining = () => Math.max(0, Math.floor(deadline - performance.now()));
const save = () => {
  report.elapsedMs = Math.round(performance.now() - started);
  fs.writeFileSync(artifact, JSON.stringify(report, null, 2) + "\n");
};
const checkProcess = () => {
  if (pid === undefined) return;
  try {
    process.kill(pid, 0); // Liveness only: signal 0 never terminates the server.
  } catch (error) {
    throw new Error(`Appium PID ${pid} is unavailable (${error.code || error.message})`);
  }
};

async function readStatus(response) {
  const reader = response.body?.getReader();
  assert(reader, "Appium /status returned no response body");
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      assert(size <= 32_768, "Appium /status body exceeded the 32 KiB diagnostic limit");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

fs.mkdirSync("artifacts", { recursive: true });
try {
  if (pidText !== undefined) {
    assert(/^\d+$/.test(pidText), "ATHRECS_APPIUM_PROCESS must be a positive numeric PID");
    pid = Number(pidText);
    assert(Number.isSafeInteger(pid) && pid > 0 && pid <= 2_147_483_647, "Invalid Appium PID");
    report.processId = pid;
  }
  save();
  console.log(
    `Waiting up to ${budgetMs / 1000}s for Appium ${endpoint}${pid ? ` (PID ${pid})` : ""}`,
  );
  while (remaining() > 0) {
    checkProcess();
    const timeoutMs = Math.min(5000, remaining());
    if (timeoutMs === 0) break;
    const attempt = {
      number: ++report.attempts,
      elapsedMs: Math.round(performance.now() - started),
      timeoutMs,
    };
    let ready = false;
    try {
      const response = await fetch(endpoint, {
        signal: AbortSignal.timeout(attempt.timeoutMs),
        redirect: "manual",
        headers: { Accept: "application/json" },
      });
      attempt.httpStatus = response.status;
      const body = await readStatus(response);
      const value = body?.value;
      attempt.ready = value?.ready === true;
      report.lastResponse = {
        at: new Date().toISOString(),
        httpStatus: response.status,
        ready: value?.ready ?? null,
        version: value?.build?.version ?? null,
        build: value?.build ?? null,
        message: typeof value?.message === "string" ? value.message.slice(0, 500) : null,
      };
      ready = response.status === 200 && value?.ready === true;
      if (!ready)
        attempt.error = `HTTP ${response.status}; value.ready === true: ${value?.ready === true}`;
    } catch (error) {
      attempt.error = `${error.name || "Error"}: ${error.message || error}`.slice(0, 700);
    }
    checkProcess();
    if (ready) {
      assert(remaining() > 0, "Appium became ready after the 120s startup deadline");
      report.status = "ready";
      report.finishedAt = new Date().toISOString();
      save();
      console.log(
        `Appium ready after ${report.elapsedMs}ms; observed version: ${JSON.stringify(report.lastResponse.version)}`,
      );
      break;
    }
    report.failedAttempts.push(attempt);
    if (report.failedAttempts.length > 100) {
      report.failedAttempts.shift();
      report.omittedFailedAttempts++;
    }
    save();
    if (performance.now() - lastProgress >= 10_000) {
      console.log(
        `Appium still unready after ${report.elapsedMs}ms (attempt ${attempt.number}): ${attempt.error}`,
      );
      lastProgress = performance.now();
    }
    if (remaining() > 0) await pause(Math.min(report.gapMs, remaining()));
  }
  assert.equal(
    report.status,
    "ready",
    `Appium /status did not become ready within ${budgetMs / 1000}s`,
  );
} catch (error) {
  report.status = "failed";
  report.finishedAt = new Date().toISOString();
  report.error = `${error.name || "Error"}: ${error.message || error}`.slice(0, 1000);
  save();
  console.error(`FAIL: Appium server startup: ${report.error}`);
  throw error;
}
