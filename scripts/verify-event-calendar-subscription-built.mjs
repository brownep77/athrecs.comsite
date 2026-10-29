import { signupDetails } from "./fixtures/signup-details.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

// The actual production bundle, with an isolated in-memory database and no delivery.
const origin = "http://127.0.0.1:8129";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL_NON_POOLING: "",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "calendar-browser-test-only-secret-at-least-32-characters",
  RESEND_API_KEY: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  MICROSOFT_CLIENT_ID: "",
  MICROSOFT_CLIENT_SECRET: "",
  APPLE_CLIENT_ID: "",
});
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(origin + "/"), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const { default: app } = await import("../.vercel/output/functions/__server.func/index.mjs");
const staticRoot = path.resolve(".vercel/output/static");
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1:8129");
    const file = path.resolve(staticRoot, "." + decodeURIComponent(url.pathname));
    if (file.startsWith(staticRoot + "/") && fs.existsSync(file) && fs.statSync(file).isFile()) {
      const types = {
        ".js": "text/javascript",
        ".css": "text/css",
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
        ".png": "image/png",
      };
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      });
      res.end(fs.readFileSync(file));
      return;
    }
    const body = [];
    for await (const chunk of req) body.push(chunk);
    const response = await app.fetch(
      new Request(url, {
        method: req.method,
        headers: req.headers,
        ...(body.length ? { body: Buffer.concat(body) } : {}),
      }),
      {},
    );
    const headers = Object.fromEntries(response.headers);
    if (response.headers.getSetCookie().length)
      headers["set-cookie"] = response.headers.getSetCookie();
    res.writeHead(response.status, headers);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    console.error(e.message);
    res.writeHead(500);
    res.end("Error");
  }
});
await new Promise((resolve) => server.listen(8129, "127.0.0.1", resolve));
const browser = await chromium.launch({
  executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE || undefined,
  headless: true,
});
try {
  fs.mkdirSync("artifacts", { recursive: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route("**/*", (route) =>
    route
      .request()
      .url()
      .startsWith(origin + "/")
      ? route.continue()
      : route.abort(),
  );
  const page = await context.newPage();
  const errors = [];
  const privateReads = [];
  page.on("response", (response) => {
    if (response.request().method() === "GET" && response.url().includes("raceId"))
      privateReads.push(response);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const email = "calendar-runner@example.test";
  const password = "Calendar-test-only-123!";
  const signup = await context.request.post(origin + "/api/auth/sign-up/email", {
    data: { email, password, ...signupDetails("Calendar Test Runner") },
    headers: { origin },
  });
  assert.equal(signup.status(), 200, await signup.text());
  await context.clearCookies();
  await page.goto(origin + "/races/holkham-half-10k");
  await page.locator('summary[aria-label$="to calendar"]').first().click();
  await page
    .locator("details[open]")
    .getByRole("link", { name: "Apple Calendar", exact: true })
    .click();
  const selectionUrl = page.url();
  assert(selectionUrl.includes("/my-race-calendar?race=edition-"));
  await page.getByRole("button", { name: "Sign in or create account", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email address", { exact: true }).fill(email);
  await dialog.getByLabel("Password", { exact: true }).fill(password);
  await dialog.getByRole("button", { name: "Sign in with email", exact: true }).click();
  await page.waitForURL(selectionUrl);
  await page.getByRole("button", { name: "Add race to my calendar", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Open Apple Calendar", exact: true }).count(),
    0,
  );
  await page.getByRole("heading", { name: "Selected races (0)", exact: true }).waitFor();
  console.log("PASS: real sign-in preserves the chosen edition and never automatically saves it");

  let writeRequest;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.postData()?.includes('"action"'))
      writeRequest = { url: request.url(), body: request.postData(), headers: request.headers() };
  });
  await page.getByRole("button", { name: "Add race to my calendar", exact: true }).click();
  const apple = page.getByRole("link", { name: "Open Apple Calendar", exact: true });
  await apple.waitFor();
  await page.getByRole("heading", { name: "Selected races (1)", exact: true }).waitFor();
  const appleHref = await apple.getAttribute("href");
  assert.equal(new URL(appleHref).protocol, "webcal:");
  assert.equal(
    new URL(appleHref).host,
    new URL(origin).host,
    "Subscription stays on the signed-in site",
  );
  assert.match(new URL(appleHref).pathname, /^\/api\/race-calendar\/[a-f0-9]{64}$/);
  const localFeed = (url) => origin + new URL(url).pathname;
  const firstFeed = localFeed(appleHref);
  const feed = await fetch(firstFeed);
  assert.equal(feed.status, 200);
  assert.match(feed.headers.get("content-disposition"), /^inline/);
  const ics = await feed.text();
  assert.match(ics, /DTSTART:20270516T080000Z/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 1);
  assert(!ics.includes(email));
  assert(!ics.includes("Calendar Test Runner"));
  assert(!ics.includes("runABC"));
  console.log(
    "PASS: explicit add produces an anonymous-readable private feed with the canonical race time",
  );
  assert(privateReads.length > 0, "Capture authenticated calendar reads");
  for (const response of privateReads) {
    assert.equal(response.headers()["cache-control"], "private, no-store");
    assert.match(response.headers().vary, /Cookie/);
  }
  assert(writeRequest, "Capture actual authenticated mutation for boundary checks");
  const { cookie, ...anonymousHeaders } = writeRequest.headers;
  // A copied API request without the session must not read or mutate this account.
  const denied = await fetch(writeRequest.url, {
    method: "POST",
    headers: { ...anonymousHeaders, "sec-fetch-site": "same-origin" },
    body: writeRequest.body,
  });
  const deniedBody = await denied.text();
  assert.match(
    deniedBody,
    /Unauthorized|Sign in|UnauthorizedError/i,
    "Unauthenticated mutation rejected",
  );
  assert(!deniedBody.includes('"saved":true'));
  const crossSite = await context.request.post(writeRequest.url, {
    headers: { ...anonymousHeaders, "sec-fetch-site": "cross-site" },
    data: writeRequest.body,
  });
  const crossSiteBody = await crossSite.text();
  assert.match(
    crossSiteBody,
    /cross-site request blocked|CrossSiteRequestError/i,
    "Cross-site mutation rejected",
  );
  assert(!crossSiteBody.includes('"saved":true'));
  console.log("PASS: actual server functions reject anonymous and cross-site mutations");

  await page.reload();
  await page.getByText("This race is already in your calendar.", { exact: true }).waitFor();
  assert.equal(await apple.getAttribute("href"), appleHref);
  await page.locator("summary").filter({ hasText: "Subscription address and controls" }).click();
  const address = page.getByRole("textbox", { name: "Private subscription address", exact: true });
  assert.equal(await address.inputValue(), localFeed(appleHref));
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `No overflow at ${width}px`,
    );
    await page.screenshot({ path: `artifacts/calendar-subscription-${width}.png`, fullPage: true });
  }
  console.log(
    "PASS: repeat visits do not duplicate races; private address controls fit mobile and desktop",
  );

  const second = await browser.newContext();
  const signup2 = await second.request.post(origin + "/api/auth/sign-up/email", {
    data: {
      email: "other-calendar-runner@example.test",
      password,
      ...signupDetails("Other Test Runner"),
    },
    headers: { origin },
  });
  assert.equal(signup2.status(), 200, await signup2.text());
  const secondPage = await second.newPage();
  await secondPage.goto(origin + "/my-race-calendar");
  await secondPage.getByRole("heading", { name: "Selected races (0)", exact: true }).waitFor();
  assert.equal(
    await secondPage.getByRole("link", { name: "Open Apple Calendar", exact: true }).count(),
    0,
  );
  await second.close();
  console.log(
    "PASS: another real authenticated account cannot see these selections or their subscription link",
  );

  await page.getByRole("button", { name: "Reset private link", exact: true }).click();
  await page.waitForFunction(
    (oldHref) => document.querySelector('a[href^="webcal:"]')?.getAttribute("href") !== oldHref,
    appleHref,
  );
  assert.equal((await fetch(firstFeed)).status, 404);
  const resetFeed = localFeed(await apple.getAttribute("href"));
  assert.equal((await fetch(resetFeed)).status, 200);
  await page.getByRole("button", { name: "Disable subscription", exact: true }).click();
  await page.getByRole("button", { name: "Create subscription link", exact: true }).waitFor();
  assert.equal((await fetch(resetFeed)).status, 404);
  await page.getByRole("heading", { name: "Selected races (1)", exact: true }).waitFor();
  await page.getByRole("button", { name: "Create subscription link", exact: true }).click();
  await apple.waitFor();
  const newFeed = localFeed(await apple.getAttribute("href"));
  assert.notEqual(newFeed, resetFeed);
  await page.getByRole("button", { name: /^Remove Holkham/ }).click();
  await page.getByRole("heading", { name: "Selected races (0)", exact: true }).waitFor();
  const empty = await fetch(newFeed);
  assert.equal(empty.status, 200);
  assert(!(await empty.text()).includes("BEGIN:VEVENT"));
  console.log(
    "PASS: reset and disable revoke old links; removals propagate to the subscribed feed",
  );

  await page.goto(origin + "/running/races/great-north-run");
  await page.locator('summary[aria-label$="to calendar"]').first().click();
  await page
    .locator("details[open]")
    .getByRole("link", { name: "Apple Calendar", exact: true })
    .click();
  await page.getByRole("button", { name: "Add race to my calendar", exact: true }).click();
  await page.getByRole("heading", { name: "Selected races (1)", exact: true }).waitFor();
  assert.equal(localFeed(await apple.getAttribute("href")), newFeed);
  const guide = await (await fetch(newFeed)).text();
  assert.match(guide, /DTSTART;VALUE=DATE:20270912/);
  assert.equal((guide.match(/BEGIN:VEVENT/g) || []).length, 1);
  assert.equal((await fetch(origin + "/api/race-calendar/invalid")).status, 404);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: curated guide races use the same subscription; invalid links fail closed; no browser errors",
  );
  await context.close();
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
