// The live sitemap and anonymous responses, never staff data, govern submission.
import assert from "node:assert/strict";
import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import {
  ATHLETE_SEARCH_ORIGIN as origin,
  checkAthleteSearchReadiness,
  validateSearchCursor,
} from "./lib/athlete-search-readiness.mjs";

export async function notifyAthleteSearch({
  checkOnly = false,
  fetchImpl = fetch,
  keyFile,
  key,
  cursor,
  batchSize = 500,
} = {}) {
  // Validate the complete batch before any POST. --check never submits anything.
  const options = { cursor, batchSize };
  const result = await checkAthleteSearchReadiness(fetchImpl, options);
  if (!result.ready || checkOnly) return { ...result, submitted: 0 };
  assert.match(keyFile, /^[a-zA-Z0-9-]+\.txt$/);
  assert.match(key, /^[a-zA-Z0-9-]{8,128}$/);
  const keyLocation = `${origin}/${keyFile}`;
  const ownership = await fetchImpl(keyLocation, {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(ownership.status, 200, "Unable to read deployed IndexNow ownership file");
  assert(!ownership.redirected, "IndexNow ownership file must not redirect");
  assert.equal((await ownership.text()).trim(), key, "Deployed IndexNow ownership file must match");
  // Re-read this batch's live sitemap membership and every profile permission.
  // Never submit a cached URL or advance the checkpoint for a changed batch.
  const latest = await checkAthleteSearchReadiness(fetchImpl, options);
  assert.deepEqual(
    latest.urls,
    result.urls,
    "Athlete sitemap batch changed during validation; no URLs submitted",
  );
  for (let offset = 0; offset < result.urls.length; offset += 10000) {
    const urlList = result.urls.slice(offset, offset + 10000);
    const response = await fetchImpl("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(origin).host, key, keyLocation, urlList }),
      signal: AbortSignal.timeout(60000),
    });
    assert([200, 202].includes(response.status), `IndexNow returned HTTP ${response.status}`);
    console.log(
      `IndexNow received ${urlList.length} URLs (HTTP ${response.status}${response.status === 202 ? "; ownership validation pending" : ""}).`,
    );
  }
  return { ...latest, submitted: result.urls.length };
}

export async function runAthleteSearchBatches({
  checkOnly = false,
  stateFile,
  maxBatches = 1,
  maxDurationMs = 25 * 60 * 1000,
  fetchImpl = fetch,
  ...options
} = {}) {
  assert(
    Number.isSafeInteger(maxBatches) && maxBatches >= 1 && maxBatches <= 10,
    "Invalid batch count",
  );
  assert(Number.isSafeInteger(maxDurationMs) && maxDurationMs > 0, "Invalid time budget");
  let cursor;
  if (stateFile) {
    try {
      cursor = JSON.parse(await readFile(stateFile, "utf8"));
      validateSearchCursor(cursor);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const deadline = AbortSignal.timeout(maxDurationMs);
  const boundedFetch = (url, settings = {}) =>
    fetchImpl(url, {
      ...settings,
      signal: AbortSignal.any([deadline, ...(settings.signal ? [settings.signal] : [])]),
    });
  let submitted = 0;
  let checked = 0;
  let batches = 0;
  let result;
  let paused = false;
  for (; batches < maxBatches && !deadline.aborted; batches++) {
    try {
      result = await notifyAthleteSearch({
        ...options,
        checkOnly,
        cursor,
        fetchImpl: boundedFetch,
      });
    } catch (error) {
      if (deadline.aborted && ["TimeoutError", "AbortError"].includes(error.name)) {
        paused = true;
        console.log("Time budget reached; unfinished batch remains pending for the next run.");
        break;
      }
      throw error;
    }
    submitted += result.submitted;
    checked += result.urls.length;
    cursor = result.nextCursor;
    // No checkpoint changes on read-only runs or failed/uncertain receipts.
    // Atomic rename preserves prior progress if a write is interrupted.
    if (!checkOnly && stateFile && cursor) {
      await mkdir(dirname(stateFile), { recursive: true });
      await writeFile(`${stateFile}.tmp`, `${JSON.stringify(cursor)}\n`);
      await rename(`${stateFile}.tmp`, stateFile);
    }
    const message = `Batch ${batches + 1}: ${result.reason} ${checkOnly ? "Read-only; no URLs submitted." : `IndexNow received ${result.submitted} URLs.`}`;
    console.log(message);
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(process.env.GITHUB_STEP_SUMMARY, `${message}\n\n`);
    if (checkOnly || result.cycleComplete) {
      batches++;
      break;
    }
  }
  return {
    submitted,
    checked,
    batches,
    nextCursor: cursor,
    cycleComplete: result?.cycleComplete ?? false,
    paused: paused || deadline.aborted,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    assert(
      args.every(
        (arg) => arg === "--check" || /^--(?:batch-size|max-batches|state-file)=.+$/.test(arg),
      ),
      "Supported options: --check --batch-size=N --max-batches=N --state-file=PATH",
    );
    const value = (name) =>
      args
        .find((arg) => arg.startsWith(`--${name}=`))
        ?.split("=")
        .slice(1)
        .join("=");
    const checkOnly = args.includes("--check");
    const keyFile = (
      await readFile(new URL("./indexnow-key-file.txt", import.meta.url), "utf8")
    ).trim();
    const key = (await readFile(new URL(`../public/${keyFile}`, import.meta.url), "utf8")).trim();
    const result = await runAthleteSearchBatches({
      checkOnly,
      keyFile,
      key,
      batchSize: Number(value("batch-size") ?? 500),
      maxBatches: Number(value("max-batches") ?? 1),
      stateFile: value("state-file"),
    });
    assert(!checkOnly || !result.paused, "Read-only live check timed out; eligibility is unknown");
    const progress = result.cycleComplete
      ? "Reached the end of this sitemap pass."
      : !checkOnly && value("state-file")
        ? "Remaining profiles continue from the saved checkpoint on the next run."
        : "This is a partial catalogue check; remaining profiles have not been checked.";
    const message = `${result.checked} URLs checked in ${result.batches} complete batches.${result.paused ? " Paused at the time budget; unfinished batch remains pending." : ""}\n${checkOnly ? "Read-only readiness check; no URLs submitted or checkpoint changes." : `Submitted ${result.submitted} athlete URLs. Receipt does not guarantee crawling or indexing.`}\n${progress}`;
    console.log(message);
    if (process.env.GITHUB_OUTPUT)
      await appendFile(
        process.env.GITHUB_OUTPUT,
        `count=${result.submitted}\nchecked=${result.checked}\n`,
      );
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `### Athlete search notification\n\n${message}\n`,
      );
  } catch (error) {
    console.error(`Athlete search notification stopped: ${error.message}`);
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        "### Athlete search notification\n\nValidation or submission failed. See the step log; do not override publication safeguards.\n",
      );
    process.exitCode = 1;
  }
}
