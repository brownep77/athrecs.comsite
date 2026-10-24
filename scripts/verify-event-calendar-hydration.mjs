import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium, firefox, webkit } from "playwright";
import {
  ANALYTICS_CHOICE_KEY,
  WEB_ANALYTICS_NOTICE_KEY,
  WEB_ANALYTICS_NOTICE_VERSION,
} from "../src/lib/athrecs/web-analytics.ts";

// Exercise the compiled application without production data, delivery or writes.
const origin = "http://127.0.0.1:8130";
const racePath = "/running/races/london-marathon";
const selector = 'summary[aria-label^="Share "]';
const bannerSelector = 'section[aria-labelledby="analytics-choices-title"]';
const privacySelector = 'button[aria-label="Review analytics privacy choices"]';
const keys = { choice: ANALYTICS_CHOICE_KEY, notice: WEB_ANALYTICS_NOTICE_KEY };
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_INVITATION_RESEND_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "MICROSOFT_CLIENT_ID",
  "MICROSOFT_CLIENT_SECRET",
  "APPLE_CLIENT_ID",
  "APPLE_PRIVATE_KEY",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "TWITTER_CLIENT_ID",
  "TWITTER_CLIENT_SECRET",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GROK_AUTH_CLIENT_ID",
  "GROK_AUTH_CLIENT_SECRET",
])
  process.env[key] = "";
Object.assign(process.env, {
  VITE_AUTH_ENABLED: "false",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "hydration-test-only-secret-at-least-32-characters",
});
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
  );
  assert.equal(url.origin, origin, "Server requests must stay on the isolated test origin");
  return realFetch(input, init);
};
const { default: app } = await import("../.vercel/output/functions/__server.func/index.mjs");
const staticRoot = path.resolve(".vercel/output/static");
const serverWrites = [];
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if (!["GET", "HEAD"].includes(req.method)) {
      serverWrites.push({ method: req.method, path: url.pathname });
      res.writeHead(405).end("Writes are disabled in this regression server");
      return;
    }
    const file = path.resolve(staticRoot, "." + decodeURIComponent(url.pathname));
    if (
      file.startsWith(staticRoot + path.sep) &&
      fs.existsSync(file) &&
      fs.statSync(file).isFile()
    ) {
      const types = {
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".json": "application/json",
      };
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      });
      res.end(fs.readFileSync(file));
      return;
    }
    const response = await app.fetch(
      new Request(url, { method: req.method, headers: req.headers }),
      {},
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error.message);
    res.writeHead(500).end("Isolated application request failed");
  }
});
await new Promise((resolve, reject) =>
  server.once("error", reject).listen(8130, "127.0.0.1", resolve),
);
fs.mkdirSync("artifacts", { recursive: true });

const frames = (page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
const snapshot = (page) =>
  page.evaluate(
    ({ selector, keys, bannerSelector }) => {
      const summary = document.querySelector(selector);
      if (!summary) return { url: location.href, x: scrollX, y: scrollY, summary: null };
      const rect = summary.getBoundingClientRect();
      return {
        url: location.href,
        x: scrollX,
        y: scrollY,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        center: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
        ready: !summary.parentElement.querySelector("button")?.disabled,
        open: summary.parentElement.open,
        sameNode: summary === window.__heldShareSummary,
        mainTop: document.querySelector("main[data-athrecs-main]")?.getBoundingClientRect().top,
        banner: !!document.querySelector(bannerSelector),
        consent: localStorage.getItem(keys.choice),
        notice: localStorage.getItem(keys.notice),
      };
    },
    { selector, keys, bannerSelector },
  );
async function settled(page, choice, phase) {
  phase("wait for hydrated Share and consent UI");
  await page.waitForFunction(
    ({ selector, bannerSelector, privacySelector, choice }) => {
      const copy = document.querySelector(selector)?.parentElement.querySelector("button");
      return (
        copy &&
        !copy.disabled &&
        document.querySelector(choice === "fresh" ? bannerSelector : privacySelector)
      );
    },
    { selector, bannerSelector, privacySelector, choice },
  );
  phase("wait for hydrated layout frames");
  await frames(page);
}
const hashAligned = (page, id) =>
  page.waitForFunction((id) => {
    const top = document.getElementById(id)?.getBoundingClientRect().top;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const atEnd = Math.abs(scrollY - maxScroll) <= 2;
    return top >= -2 && top < (atEnd ? innerHeight : innerHeight / 2);
  }, id);

async function check(browser, engine, choice) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    ...(engine === "firefox" ? {} : { isMobile: true }),
    locale: "en-GB",
    timezoneId: "Europe/London",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [],
    posts = [],
    unexpectedWrites = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let release,
    gatedScripts = 0,
    phase = "server HTML",
    before,
    hydrated;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let analyticsSeen;
  const firstAnalytics = new Promise((resolve) => {
    analyticsSeen = resolve;
  });
  const stem = `artifacts/calendar-hydration-${engine}-${choice}`;
  const started = Date.now(),
    progress = [];
  let timeoutError, timeoutPhase, timeoutCapture;
  const mark = (next) => {
    if (timeoutError) throw timeoutError;
    phase = next;
    const entry = { phase, elapsedMs: Date.now() - started };
    progress.push(entry);
    console.log(`HYDRATION ${engine}/${choice} +${entry.elapsedMs}ms: ${phase}`);
    fs.writeFileSync(
      `${stem}-progress.json`,
      JSON.stringify({ engine, choice, progress }, null, 2),
    );
  };
  const diagnostics = async () => {
    let timer;
    try {
      return await Promise.race([
        Promise.all([
          snapshot(page).catch(() => null),
          page.evaluate(() => window.__hydrationEvents).catch(() => []),
        ]).then(([state, events]) => ({ state, events })),
        new Promise((resolve) => {
          timer = setTimeout(() => resolve({ diagnosticsTimedOut: true }), 2000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
  const writeFailure = (error, details = {}) =>
    fs.writeFileSync(
      `${stem}-failure.json`,
      JSON.stringify(
        {
          engine,
          choice,
          phase: timeoutPhase || phase,
          timedOut: !!timeoutError,
          elapsedMs: Date.now() - started,
          error: error.stack,
          before,
          hydrated,
          errors,
          posts,
          unexpectedWrites,
          serverWrites,
          progress,
          ...details,
        },
        null,
        2,
      ),
    );
  const watchdog = setTimeout(() => {
    timeoutPhase = phase;
    timeoutError = Error(`Hydration case exceeded 60000ms during ${phase}`);
    console.error(`TIMEOUT hydration ${engine}/${choice}: ${phase}`);
    writeFailure(timeoutError);
    timeoutCapture = diagnostics().then((details) => writeFailure(timeoutError, details));
    void timeoutCapture
      .finally(() => {
        release();
        return context.close();
      })
      .catch((error) => console.error(`Hydration timeout cleanup: ${error.message}`));
  }, 60000);
  try {
    mark("configure script gate and consent");
    await context.addInitScript(
      ({ keys, choice, version }) => {
        localStorage.removeItem(keys.choice);
        localStorage.removeItem(keys.notice);
        if (choice !== "fresh") {
          localStorage.setItem(keys.choice, choice);
          localStorage.setItem(keys.notice, version);
        }
        window.__hydrationEvents = [];
        for (const type of ["pointerdown", "pointerup", "pointercancel", "click", "toggle"])
          document.addEventListener(
            type,
            (event) => {
              const target =
                event.target instanceof Element
                  ? event.target.closest("summary,button,a,details")
                  : null;
              window.__hydrationEvents.push({
                type,
                trusted: event.isTrusted,
                pointerType: event.pointerType,
                label:
                  target?.getAttribute("aria-label") || target?.textContent.trim().slice(0, 100),
                x: event.clientX,
                y: event.clientY,
                scrollY,
                time: performance.now(),
              });
              if (window.__hydrationEvents.length > 40) window.__hydrationEvents.shift();
            },
            true,
          );
      },
      { keys, choice, version: WEB_ANALYTICS_NOTICE_VERSION },
    );
    await context.route("**/*", async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (!["GET", "HEAD"].includes(request.method())) {
        const body = request.postData() || "";
        const record = { path: url.pathname, method: request.method() };
        if (
          request.method() === "POST" &&
          body.includes("consentVersion") &&
          body.includes("sessionId")
        ) {
          posts.push(record);
          analyticsSeen();
        } else unexpectedWrites.push(record);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: '{"result":{"accepted":true}}',
        });
        return;
      }
      if (url.origin !== origin || request.resourceType() === "font") return route.abort();
      if (url.pathname.startsWith("/api/auth/"))
        return route.fulfill({ status: 200, contentType: "application/json", body: "null" });
      if (request.resourceType() === "script") {
        gatedScripts++;
        await gate;
      }
      await route.continue();
    });
    mark("wait for server HTML commit");
    const response = await page.goto(origin + racePath, { waitUntil: "commit", timeout: 60000 });
    assert.equal(response.status(), 200);
    mark("wait for SSR footer");
    await page.locator("footer").waitFor({ state: "attached" });
    mark("wait for local stylesheets");
    await page.waitForFunction(() => {
      const links = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(
        (el) => new URL(el.href).origin === location.origin,
      );
      return links.length > 0 && links.every((el) => el.sheet);
    });
    // FontFaceSet.ready also waits for document loading, which our held module
    // scripts intentionally prevent. Font requests are aborted above; loaded
    // stylesheets and layout frames keep the fallback-font geometry stable.
    mark("scroll SSR Share with font requests blocked");
    const summary = page.locator(selector).first();
    await summary.evaluate((el) => {
      window.__heldShareSummary = el;
      el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    });
    mark("wait for SSR layout frames");
    await frames(page);
    mark("measure unhydrated Share");
    before = await snapshot(page);
    assert(gatedScripts > 0, "Production JavaScript is held at the network gate");
    assert.equal(before.ready, false, "The gesture starts on genuinely unhydrated HTML");
    assert(before.y > 0 && !before.banner && !before.open);
    assert.deepEqual(posts, [], "No analytics before application hydration");
    const point = { x: Math.round(before.center.x), y: Math.round(before.center.y) };
    const cdp = engine === "chromium" ? await context.newCDPSession(page) : null;
    mark("pointer held across hydration");
    if (cdp)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ ...point, id: 1, radiusX: 1, radiusY: 1, force: 1 }],
      });
    else {
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
    }
    const down = await page.evaluate(() =>
      window.__hydrationEvents.find((event) => event.type === "pointerdown"),
    );
    assert(down?.trusted && down.label?.startsWith("Share "), "The one gesture starts on Share");
    assert.equal(down.pointerType, cdp ? "touch" : "mouse");
    mark("release script gate while pointer stays down");
    release();
    await settled(page, choice, mark);
    mark("check held-pointer geometry");
    hydrated = await snapshot(page);
    assert(hydrated.sameNode, "Hydration retains the pressed native summary");
    assert(
      Math.abs(hydrated.center.x - before.center.x) <= 2 &&
        Math.abs(hydrated.center.y - before.center.y) <= 2,
      `Share moved under the held pointer: ${JSON.stringify({ before, hydrated })}`,
    );
    assert(
      await summary.evaluate(
        (el, point) => el.contains(document.elementFromPoint(point.x, point.y)),
        point,
      ),
      "The original release coordinates still hit Share",
    );
    assert.equal(hydrated.open, false, "The gesture has not yet activated Share");
    mark("release at original coordinates");
    if (cdp) await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    else await page.mouse.up();
    await summary.locator("xpath=parent::details[@open]").waitFor({ state: "attached" });
    const clickEvents = await page.evaluate(() =>
      window.__hydrationEvents.filter((event) => event.type === "click"),
    );
    assert.equal(clickEvents.length, 1, "One gesture produces one click");
    assert(clickEvents[0].trusted && clickEvents[0].label?.startsWith("Share "));
    assert.equal((await snapshot(page)).consent, choice === "fresh" ? null : choice);
    if (choice === "granted") {
      mark("wait for granted analytics positive control");
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(Error("No granted analytics request observed")),
          10000,
        );
        firstAnalytics.then(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
      assert(posts.length > 0, "Granted analytics is intercepted as a positive control");
    } else assert.deepEqual(posts, [], "Fresh/denied consent never sends analytics");

    mark("SPA navigation without another scroll");
    const expectedY = hydrated.y;
    const token = `${engine}-${choice}-${Date.now()}`;
    await page.evaluate(
      ({ expectedY, token }) => {
        if (Math.abs(scrollY - expectedY) > 2) throw Error("Scroll changed before SPA navigation");
        window.__hydrationDocument = token;
        const link = document.querySelector('nav[aria-label="Breadcrumb"] a[href="/running"]');
        if (!link) throw Error("Expected actual TanStack Running link");
        // A locator click would auto-scroll this offscreen link, hiding the bug.
        link.click();
      },
      { expectedY, token },
    );
    await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === "/running");
    await page.waitForFunction(
      () => !document.querySelector('summary[aria-label^="Share "]') && Math.abs(scrollY) <= 2,
    );
    assert.equal(
      await page.evaluate(() => window.__hydrationDocument),
      token,
      "Navigation stays in this document",
    );
    mark("Back without another scroll");
    await page.goBack();
    await page.waitForURL(origin + racePath);
    await settled(page, choice, mark);
    mark("verify Back restored the preserved position");
    await page.waitForFunction((y) => Math.abs(scrollY - y) <= 2, expectedY);
    assert.equal(
      await page.evaluate(() => window.__hydrationDocument),
      token,
      "Back stays in this document",
    );
    mark("capture restored page");
    await page.screenshot({ path: `${stem}.png` });

    if (choice === "fresh") {
      mark("subsequent hash navigation");
      await page
        .locator('a[href="#entry"]')
        .first()
        .evaluate((el) => el.click());
      await page.waitForURL((url) => url.hash === "#entry");
      await hashAligned(page, "entry");
      mark("initial hash navigation");
      await page.goto(origin + racePath + "#dates", { waitUntil: "domcontentloaded" });
      await settled(page, choice, mark);
      mark("verify initial hash alignment");
      await hashAligned(page, "dates");
    }
    mark("final error and consent checks");
    assert.deepEqual(errors, [], "No uncaught application errors");
    assert.deepEqual(unexpectedWrites, [], "No unrelated mutation or diagnostic requests");
    assert.deepEqual(serverWrites, [], "No writes reach the application server");
    if (choice !== "granted")
      assert.deepEqual(posts, [], "Analytics remains off through navigation");
    console.log(
      `PASS hydration ${engine}/${choice}: ${cdp ? "trusted held touch" : "trusted held mouse"}, stable Share, one click, SPA top/Back${choice === "fresh" ? ", initial/subsequent hashes" : ""}`,
    );
  } catch (error) {
    if (timeoutCapture) await timeoutCapture;
    else {
      writeFailure(error, await diagnostics());
      await page.screenshot({ path: `${stem}-failure.png`, timeout: 2000 }).catch(() => {});
    }
    throw timeoutError || error;
  } finally {
    clearTimeout(watchdog);
    release();
    await context.close();
  }
}

try {
  for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await browserType.launch({
      headless: true,
      ...(engine === "chromium" && process.env.ATHRECS_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE }
        : {}),
    });
    try {
      for (const choice of ["fresh", "denied", "granted"]) await check(browser, engine, choice);
    } finally {
      await browser.close();
    }
  }
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  globalThis.fetch = realFetch;
}
