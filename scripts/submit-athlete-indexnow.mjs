// The live sitemap and anonymous responses, never staff data, govern submission.
import assert from "node:assert/strict";
import { appendFile, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  ATHLETE_SEARCH_ORIGIN as origin,
  checkAthleteSearchReadiness,
} from "./lib/athlete-search-readiness.mjs";

export async function notifyAthleteSearch({
  checkOnly = false,
  fetchImpl = fetch,
  keyFile,
  key,
} = {}) {
  // Validate the complete set before any POST. --check never submits anything.
  const result = await checkAthleteSearchReadiness(fetchImpl);
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
  // Re-read publication after the potentially long validation pass. A changed
  // set must be checked afresh in a subsequent run, not partly submitted.
  const latest = await checkAthleteSearchReadiness(fetchImpl);
  assert.deepEqual(
    [...latest.urls].sort(),
    [...result.urls].sort(),
    "Athlete sitemap changed during validation; no URLs submitted",
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
  return { ...result, submitted: result.urls.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    assert(
      process.argv.slice(2).every((arg) => arg === "--check"),
      "Only --check is supported",
    );
    const checkOnly = process.argv.includes("--check");
    const keyFile = (
      await readFile(new URL("./indexnow-key-file.txt", import.meta.url), "utf8")
    ).trim();
    const key = (await readFile(new URL(`../public/${keyFile}`, import.meta.url), "utf8")).trim();
    const result = await notifyAthleteSearch({ checkOnly, keyFile, key });
    const message = `${result.reason}\n${checkOnly ? "Read-only readiness check; no URLs submitted." : `Submitted ${result.submitted} athlete URLs. Receipt does not guarantee crawling or indexing.`}`;
    console.log(message);
    if (process.env.GITHUB_OUTPUT)
      await appendFile(
        process.env.GITHUB_OUTPUT,
        `ready=${result.ready}\ncount=${result.urls.length}\n`,
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
