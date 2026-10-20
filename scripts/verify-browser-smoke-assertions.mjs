#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { resolve } from "node:path";

// Exercise the real smoke CLI against a local page, including its exit codes.
// Country-card descriptions and navigation are valid; the retired heading is not.
const home = `<main>
  <h1>Find your sport. Find your next race.</h1>
  <h2>Choose your sport</h2>
  <h2>Explore sports by country</h2>
  <a href="/en/united-kingdom"><p>Running, other sports and event calendars</p></a>
  <nav><a href="/calendar">Event calendar</a></nav>
</main>`;
let html = home;
const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

async function check(name, content, expectedCode, overrides = {}) {
  html = content;
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith("BROWSER_SMOKE_")) delete env[key];
  }
  const child = spawn(
    process.execPath,
    ["scripts/browser-smoke.mjs", url, resolve(`artifacts/smoke-assertions-${name}.png`)],
    {
      env: {
        ...env,
        BROWSER_SMOKE_EXPECT_TEXT: "Choose your sport||Explore sports by country",
        BROWSER_SMOKE_REJECT_TEXT: "Upcoming athletics||Browse verified athletics fixtures",
        BROWSER_SMOKE_REJECT_HEADING: "Event calendar",
        ...overrides,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  assert.equal(code, expectedCode, `${name}: ${stdout}\n${stderr}`);
  return JSON.parse(stdout);
}

try {
  const desktop = await check("country-copy-and-navigation", home, 0);
  assert.deepEqual(desktop.presentRejectedHeadings, []);
  await check("mobile", home, 0, {
    BROWSER_SMOKE_VIEWPORT_WIDTH: "390",
    BROWSER_SMOKE_VIEWPORT_HEIGHT: "844",
  });
  const retired = await check("retired-heading", `${home}<h2>Event <span>calendar</span></h2>`, 4);
  assert.deepEqual(retired.presentRejectedHeadings, ["Event calendar"]);
  await check("aria-heading", `${home}<div role="heading" aria-level="2">Event calendar</div>`, 4);
  const retiredCopy = await check(
    "retired-copy",
    `${home}<p>Browse verified athletics fixtures</p>`,
    4,
  );
  assert.deepEqual(retiredCopy.presentRejectedTexts, ["Browse verified athletics fixtures"]);
  const missing = await check("missing-sports", "<main>Incomplete homepage</main>", 3);
  assert.deepEqual(missing.missingTexts, ["Choose your sport", "Explore sports by country"]);
  console.log(
    "Browser smoke assertions: valid copy/navigation pass on desktop/mobile; retired headings/copy and missing sports fail.",
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
