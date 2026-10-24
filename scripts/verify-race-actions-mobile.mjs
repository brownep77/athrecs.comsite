import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, firefox, webkit, devices } from "playwright";

// Public production smoke tests: these do not test the PR deployment. The separate
// event-calendar workflow exercises the checked-out components before release.
// Mobile profiles emulate browser input/layout, not a physical phone or its apps.
const origin = "https://www.athrecs.com";
const routes = [
  "/races/holkham-half-10k",
  "/running/races/london-marathon",
  "/running/ultramarathons/dartmoor-discovery",
];
const engine = process.env.ATHRECS_MOBILE_ENGINE || "webkit";
const profiles = {
  webkit: ["iPhone SE", "iPhone 13", "iPad Mini"],
  chromium: ["Galaxy S9+", "Pixel 7"],
  // Playwright does not support isMobile in Firefox. This is touch/responsive
  // coverage in Firefox, not a claim to run the Firefox Android application.
  firefox: ["Firefox narrow touch"],
};
assert(profiles[engine], `Unsupported engine: ${engine}`);
fs.mkdirSync("artifacts", { recursive: true });
const results = [];
const browser = await { chromium, firefox, webkit }[engine].launch({
  headless: true,
  ...(engine === "chromium" ? { channel: "chrome" } : {}),
});

function profileOptions(name) {
  if (engine === "firefox")
    return {
      viewport: { width: 390, height: 664 },
      screen: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: false,
    };
  const { defaultBrowserType: _, ...options } = devices[name];
  return options;
}
const shareSelector = 'summary[aria-label^="Share "]';
const calendarSelector = 'summary[aria-label$="to calendar"]';
const group = (summary, label) =>
  summary.locator("..").getByRole("group", { name: label, exact: true });

async function open(summary) {
  if (!(await summary.evaluate((el) => el.parentElement.open))) await summary.tap();
  await summary.evaluate((el) => {
    window.__awaitedShareSummary = el;
  });
  await summary.locator("xpath=parent::details[@open]").waitFor({ state: "attached" });
}
async function close(summary) {
  if (await summary.evaluate((el) => el.parentElement.open)) await summary.tap();
}
async function checkLayout(page, panel, width, label) {
  const metrics = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
    inner: innerWidth,
    scale: visualViewport?.scale,
  }));
  assert(
    metrics.scroll <= metrics.client + 1,
    `${label}: document overflow ${JSON.stringify(metrics)}`,
  );
  assert(
    metrics.scroll <= width + 1,
    `${label}: mobile layout expanded ${JSON.stringify(metrics)}`,
  );
  assert(Math.abs(metrics.inner - width) <= 1, `${label}: viewport width changed`);
  if (metrics.scale != null)
    assert(Math.abs(metrics.scale - 1) < 0.02, `${label}: initial page scale`);
  for (const control of await panel.locator("a,button,input:not([type=hidden])").all()) {
    if (!(await control.isVisible())) continue;
    // Centering establishes reachability in a short viewport without pretending
    // that a desktop scroll command tests physical finger-swipe behavior.
    await control.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
    const box = await control.boundingBox();
    const sizing = await control.evaluate((el) => ({
      label: el.textContent.trim(),
      width: el.offsetWidth,
      height: el.offsetHeight,
      active: el.matches(":active"),
      scale: getComputedStyle(el).scale,
      transform: getComputedStyle(el).transform,
    }));
    // The shared Button intentionally shrinks to 98% while pressed. Its normal
    // touch target must still be 44px; account only for that known active effect.
    const pressedFeedback = sizing.active && /^0\.98(?: 0\.98)?$/.test(sizing.scale);
    if (pressedFeedback)
      console.log(`Observed pressed-button scale: ${JSON.stringify({ label, box, sizing })}`);
    assert(
      sizing.width >= 44 &&
        sizing.height >= 44 &&
        box &&
        box.width >= 43.5 * (pressedFeedback ? 0.98 : 1) &&
        box.height >= 43.5 * (pressedFeedback ? 0.98 : 1),
      `${label}: target smaller than 44px ${JSON.stringify({ box, sizing })}`,
    );
    assert(box.x >= -1 && box.x + box.width <= width + 1, `${label}: clipped control`);
    assert(
      await control.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
      `${label}: control obstructed`,
    );
    if ((await control.evaluate((el) => el.tagName)) !== "INPUT")
      assert(
        await control.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        `${label}: clipped label`,
      );
  }
}

async function inspectSharing(panel, expectedUrl, title) {
  const destinations = {};
  for (const name of ["WhatsApp", "Facebook", "X", "Telegram", "Email"]) {
    const link = panel.getByRole("link", { name, exact: true });
    const href = await link.getAttribute("href");
    const url = new URL(href);
    destinations[name] = href;
    if (name === "Email") {
      assert.equal(url.protocol, "mailto:");
      assert.equal(url.searchParams.get("subject"), title);
      assert(url.searchParams.get("body").includes(expectedUrl));
    } else {
      const hosts = {
        WhatsApp: "wa.me",
        Facebook: "www.facebook.com",
        X: "x.com",
        Telegram: "t.me",
      };
      assert.equal(url.protocol, "https:");
      assert.equal(url.hostname, hosts[name]);
      assert.equal(await link.getAttribute("target"), "_blank");
      assert.match(await link.getAttribute("rel"), /noopener/);
      assert.equal(await link.getAttribute("referrerpolicy"), "no-referrer");
      if (name === "WhatsApp") {
        assert(url.searchParams.get("text").includes(expectedUrl));
        assert(url.searchParams.get("text").includes(title));
      } else {
        assert.equal(url.searchParams.get(name === "Facebook" ? "u" : "url"), expectedUrl);
        if (name === "Telegram") assert(url.searchParams.get("text").includes(title));
      }
    }
  }
  return destinations;
}

async function interceptProviderTaps(page, context, panel, destinations) {
  // Prove trusted taps open the correct handoff without posting, authenticating,
  // or depending on any third party account. External navigation is intercepted.
  await context.route(/https:\/\/(wa\.me|www\.facebook\.com|x\.com|t\.me)\//, (route) =>
    route.fulfill({ contentType: "text/html", body: "<title>Intercepted sharing handoff</title>" }),
  );
  for (const name of ["WhatsApp", "Facebook", "X", "Telegram"]) {
    const popupPromise = page.waitForEvent("popup");
    await panel.getByRole("link", { name, exact: true }).tap();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    assert.equal(popup.url(), destinations[name], `${name}: tap handoff URL`);
    await popup.close();
    await page.bringToFront();
  }
  const email = panel.getByRole("link", { name: "Email", exact: true });
  await email.evaluate((el) => {
    el.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        window.__emailTap = { trusted: event.isTrusted, href: el.href };
      },
      { once: true },
    );
  });
  await email.tap();
  assert.deepEqual(await page.evaluate(() => window.__emailTap), {
    trusted: true,
    href: destinations.Email,
  });
}

async function nativeAndClipboardFallbacks(page, summary, expectedUrl, title) {
  await close(summary);
  await page.evaluate(() => {
    window.__shareAudit = { calls: [], copied: [], mode: "success", clipboard: "allowed" };
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data) => {
        const state = window.__shareAudit;
        state.calls.push({ data, active: navigator.userActivation?.isActive });
        if (state.mode === "cancel") throw new DOMException("Cancelled", "AbortError");
        if (state.mode === "denied") throw new DOMException("Unavailable", "NotAllowedError");
      },
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (url) => {
          if (window.__shareAudit.clipboard === "denied")
            throw new DOMException("Denied", "NotAllowedError");
          window.__shareAudit.copied.push(url);
        },
      },
    });
  });
  await open(summary);
  const panel = group(summary, "Sharing options");
  const more = panel.getByRole("button", { name: "More sharing options", exact: true });
  await more.tap();
  let audit = await page.evaluate(() => window.__shareAudit);
  assert.equal(audit.calls.length, 1);
  assert.equal(audit.calls[0].data.url, expectedUrl);
  assert.equal(audit.calls[0].data.title, title);
  if (audit.calls[0].active != null)
    assert.equal(audit.calls[0].active, true, "native sharing retains touch activation");
  assert.deepEqual(audit.copied, []);
  await page.evaluate(() => {
    window.__shareAudit.mode = "cancel";
  });
  await more.tap();
  audit = await page.evaluate(() => window.__shareAudit);
  assert.equal(audit.calls.length, 2);
  assert.deepEqual(audit.copied, [], "cancel does not copy");
  assert.equal(await panel.getByLabel("Race link", { exact: true }).count(), 0);
  await page.evaluate(() => {
    window.__shareAudit.mode = "denied";
  });
  await more.tap();
  await panel.getByRole("button", { name: "Link copied", exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__shareAudit.copied), [expectedUrl]);
  await page.evaluate(() => {
    window.__shareAudit.clipboard = "denied";
  });
  await panel.getByRole("button", { name: /^(?:Copy link|Link copied)$/ }).tap();
  const manual = panel.getByLabel("Race link", { exact: true });
  await manual.waitFor();
  assert.equal(await manual.inputValue(), expectedUrl);
  assert.notEqual(await manual.getAttribute("readonly"), null);
  await manual.tap();
  // type=url does not expose selectionStart consistently; Selection text confirms
  // browsers that expose the programmatic selection without forcing another API.
  const selection = await manual.evaluate((el) => ({
    active: document.activeElement === el,
    text: getSelection()?.toString(),
  }));
  assert(selection.active, "manual link receives touch focus");
  return { mockedNativeCalls: 3, manualSelection: selection.text || "not exposed by this engine" };
}

try {
  for (const name of profiles[engine]) {
    const options = profileOptions(name);
    const context = await browser.newContext({
      ...options,
      locale: "en-GB",
      timezoneId: "Europe/London",
      acceptDownloads: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await context.addInitScript(
      ({ name }) => {
        window.__trustedTouchCount = 0;
        document.addEventListener("pointerdown", (event) => {
          if (event.isTrusted && event.pointerType === "touch") window.__trustedTouchCount++;
        });
        if (name === "iPhone 13" && location.pathname === "/running/races/london-marathon") {
          const ids = new WeakMap();
          let nextId = 0;
          const id = (el) => {
            if (!ids.has(el)) ids.set(el, ++nextId);
            return ids.get(el);
          };
          window.__raceActionTrace = [];
          window.__raceSummaryState = () =>
            [...document.querySelectorAll('summary[aria-label^="Share "]')].map((el) => ({
              id: id(el),
              label: el.getAttribute("aria-label"),
              open: el.parentElement.open,
              ready: !el.parentElement.querySelector("button")?.disabled,
              rect: el.getBoundingClientRect().toJSON(),
            }));
          const record = (data) => {
            window.__raceActionTrace.push({
              time: performance.now(),
              scrollY,
              fonts: document.fonts.status,
              ...data,
              summaries: window.__raceSummaryState(),
            });
            if (window.__raceActionTrace.length > 80) window.__raceActionTrace.shift();
          };
          for (const type of ["pointerdown", "pointerup", "click", "toggle"])
            document.addEventListener(
              type,
              (event) => {
                const target =
                  event.target instanceof Element
                    ? event.target.closest("summary,button,a,details")
                    : null;
                record({
                  type,
                  trusted: event.isTrusted,
                  target: target?.getAttribute("aria-label") || target?.textContent.slice(0, 100),
                  x: event.clientX,
                  y: event.clientY,
                  hit: Number.isFinite(event.clientX)
                    ? document
                        .elementFromPoint(event.clientX, event.clientY)
                        ?.outerHTML.slice(0, 250)
                    : null,
                });
              },
              true,
            );
          new MutationObserver((records) => {
            for (const r of records) {
              if (
                r.type === "attributes" &&
                r.target.matches('details:has(summary[aria-label^="Share "])')
              )
                record({ type: "open attribute", open: r.target.open });
              if (
                [...r.removedNodes].some(
                  (n) =>
                    n instanceof Element &&
                    (n.matches('summary[aria-label^="Share "]') ||
                      n.querySelector('summary[aria-label^="Share "]')),
                )
              )
                record({ type: "share DOM removed" });
            }
          }).observe(document, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["open"],
          });
        }
      },
      { name },
    );
    const result = {
      profile: name,
      engine,
      version: browser.version(),
      emulation: true,
      pages: [],
    };
    const stem = `artifacts/race-actions-mobile-${engine}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    try {
      for (const route of routes) {
        await page.setViewportSize(options.viewport);
        const response = await page.goto(origin + route, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        assert.equal(response.status(), 200, route);
        const summary = page.locator(shareSelector).first();
        await open(summary);
        const panel = group(summary, "Sharing options");
        const copy = panel.getByRole("button", { name: "Copy link", exact: true });
        await copy.waitFor();
        await page.waitForFunction((el) => !el.disabled, await copy.elementHandle());
        const title = (await summary.getAttribute("aria-label")).slice("Share ".length);
        const expectedUrl = origin + route;
        const destinations = await inspectSharing(panel, expectedUrl, title);
        await checkLayout(page, panel, options.viewport.width, `${name} ${route}`);
        await copy.tap();
        await page.waitForFunction(
          (el) => /Race link copied\.|Select and copy the race link/.test(el.textContent),
          await panel.elementHandle(),
        );
        const clipboardResult = (await panel.getByRole("status").innerText()).includes("copied")
          ? "copied"
          : "manual fallback";
        const capabilities = await page.evaluate(() => ({
          userAgent: navigator.userAgent,
          touchPoints: navigator.maxTouchPoints,
          nativeShare: typeof navigator.share === "function",
        }));
        const pageResult = { route, title, clipboardResult, capabilities };
        result.pages.push(pageResult);
        if (route === routes[0]) {
          await interceptProviderTaps(page, context, panel, destinations);
          const calendar = page.locator(calendarSelector).nth(1);
          assert(await calendar.count(), "second distance calendar exists");
          // This must activate on ONE tap while the Share panel above is open.
          await calendar.tap();
          await panel.waitFor({ state: "hidden" });
          const calendarPanel = group(calendar, "Calendar options");
          await calendarPanel.waitFor();
          const payload = JSON.parse(
            await calendarPanel.locator('input[name="race"]').inputValue(),
          );
          assert.match(payload.distance, /10K/);
          for (const [label, host] of [
            ["Google Calendar", "calendar.google.com"],
            ["Outlook.com", "outlook.live.com"],
            ["Microsoft 365", "outlook.office.com"],
          ])
            assert.equal(
              new URL(
                await calendarPanel
                  .getByRole("link", { name: label, exact: true })
                  .getAttribute("href"),
              ).hostname,
              host,
            );
          await checkLayout(page, calendarPanel, options.viewport.width, `${name} calendar`);
          const downloadPromise = page.waitForEvent("download");
          await calendarPanel
            .getByRole("button", { name: "Download calendar file (.ics)", exact: true })
            .tap();
          const download = await downloadPromise;
          assert.match(download.suggestedFilename(), /\.ics$/);
          const calendarText = fs.readFileSync(await download.path(), "utf8");
          assert.match(calendarText, /BEGIN:VCALENDAR/);
          assert.match(calendarText, /10K/);
          assert(calendarText.replace(/\r\n /g, "").includes(expectedUrl));
          await close(calendar);
          await open(summary);
          const landscape =
            engine === "firefox"
              ? { width: 750, height: 342 }
              : devices[`${name} landscape`].viewport;
          await page.setViewportSize(landscape);
          assert(await panel.isVisible(), "open panel survives landscape reflow");
          assert.equal((await summary.getAttribute("aria-label")).slice(6), title);
          await checkLayout(page, panel, landscape.width, `${name} landscape`);
          await page.screenshot({ path: `${stem}-landscape.png` });
          await page.setViewportSize(options.viewport);
          pageResult.fallbackChecks = await nativeAndClipboardFallbacks(
            page,
            summary,
            expectedUrl,
            title,
          );
          await checkLayout(page, panel, options.viewport.width, `${name} manual fallback`);
          await page.screenshot({ path: `${stem}-portrait.png` });
          assert(
            (await page.evaluate(() => window.__trustedTouchCount)) >= 10,
            "real touch input was dispatched",
          );
        }
        assert.deepEqual(errors, [], `${name}: browser errors`);
      }
      results.push(result);
      console.log(`PASS mobile ${JSON.stringify(result)}`);
    } catch (error) {
      fs.writeFileSync(
        `${stem}-failure.json`,
        JSON.stringify(
          await page
            .evaluate(() => ({
              url: location.href,
              state: window.__raceSummaryState?.(),
              trace: window.__raceActionTrace,
              awaited: window.__awaitedShareSummary
                ? {
                    connected: window.__awaitedShareSummary.isConnected,
                    open: window.__awaitedShareSummary.parentElement?.open,
                  }
                : null,
            }))
            .catch(() => ({})),
          null,
          2,
        ),
      );
      await page.screenshot({ path: `${stem}-failure.png`, fullPage: true }).catch(() => {});
      fs.writeFileSync(
        `${stem}-failure.txt`,
        `${error.stack}\n${await page
          .locator("body")
          .innerText()
          .catch(() => "")}`,
      );
      throw error;
    } finally {
      await context.close();
    }
    if (engine === "webkit" && name === "iPhone 13") {
      // Hold the production scripts deliberately, tap once using native HTML,
      // then release hydration and require the same menu to remain open.
      const delayed = await browser.newContext({
        ...profileOptions("iPhone 13"),
        serviceWorkers: "block",
      });
      let release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      try {
        const page = await delayed.newPage();
        await delayed.route("**/*", async (route) => {
          if (route.request().resourceType() === "script") await gate;
          await route.continue();
        });
        await page.goto(origin + routes[1], { waitUntil: "commit" });
        const summary = page.locator(shareSelector).first();
        const panel = group(summary, "Sharing options");
        const copy = panel.getByRole("button", { name: "Copy link", exact: true });
        assert(await copy.isDisabled(), "London action is genuinely pre-hydration");
        await summary.tap();
        assert(await panel.isVisible(), "one pre-hydration touch opens the London sharing panel");
        release();
        await page.waitForFunction((el) => !el.disabled, await copy.elementHandle(), {
          timeout: 30000,
        });
        assert(await panel.isVisible(), "London sharing panel remains open after hydration");
        await inspectSharing(
          panel,
          origin + routes[1],
          (await summary.getAttribute("aria-label")).slice(6),
        );
        console.log(
          "PASS WebKit iPhone London: one touch before delayed hydration; open panel and correct links preserved after hydration.",
        );
      } finally {
        release();
        await delayed.unrouteAll({ behavior: "wait" });
        await delayed.close();
      }
    }
  }
  if (engine === "webkit") {
    const context = await browser.newContext({
      ...profileOptions("iPhone 13"),
      javaScriptEnabled: false,
    });
    try {
      const page = await context.newPage();
      await page.goto(origin + routes[0], { waitUntil: "domcontentloaded" });
      const summary = page.locator(shareSelector).first();
      await summary.tap();
      const panel = group(summary, "Sharing options");
      assert(await panel.isVisible(), "no-JavaScript sharing opens by touch");
      await inspectSharing(
        panel,
        origin + routes[0],
        (await summary.getAttribute("aria-label")).slice(6),
      );
      assert(await panel.getByRole("button", { name: "Copy link", exact: true }).isDisabled());
      const calendar = page.locator(calendarSelector).first();
      await calendar.tap();
      assert(
        await group(calendar, "Calendar options").isVisible(),
        "no-JavaScript calendar opens by touch",
      );
      console.log(
        "PASS WebKit iPhone touch with JavaScript disabled: native disclosures and sharing destinations.",
      );
    } finally {
      await context.close();
    }
  }
  fs.writeFileSync(
    `artifacts/race-actions-mobile-${engine}.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(
    `PASS ${engine}: ${results.length} touch profiles, ${results.length * routes.length} live page checks; portrait/landscape, real clipboard outcomes, intercepted provider handoffs, calendar download, mocked native share cancellation and failure.`,
  );
} finally {
  await browser.close();
}
