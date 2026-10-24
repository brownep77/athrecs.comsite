import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

// Native Safari, not Playwright WebKit. Runner setup must first enable safaridriver.
// Protocol: https://www.w3.org/TR/webdriver2/ ; iOS: https://webkit.org/blog/9395/
const platform = process.env.ATHRECS_SAFARI_PLATFORM || "macos";
const deviceUDID = process.env.ATHRECS_SAFARI_DEVICE_UDID;
const target = "https://www.athrecs.com/races/holkham-half-10k";
const prefix = `artifacts/race-actions-safari-${platform}`;
const elementKey = "element-6066-11e4-a52e-4f735466cecf";
fs.mkdirSync("artifacts", { recursive: true });
const report = {
  startedAt: new Date().toISOString(),
  target,
  requestedPlatform: platform,
  checks: [],
  views: [],
  notCovered: [
    "Native OS share sheets and recipient delivery",
    "Physical iPhone/iPad hardware",
    "Clipboard contents independently read back",
  ],
};
let driver,
  driverError,
  sessionId,
  failure,
  phase = "setup";
const driverLog = fs.createWriteStream(`${prefix}-driver.log`);
async function api(method, route, body, timeout = 60000) {
  const response = await fetch(`http://127.0.0.1:4444${route}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(timeout),
  });
  const result = await response.json();
  if (!response.ok || result.value?.error)
    throw new Error(`${method} ${route}: ${JSON.stringify(result.value)}`);
  return result.value;
}
const command = (method, route, body) => api(method, `/session/${sessionId}${route}`, body);
const inspect = (fn, ...args) =>
  command("POST", "/execute/sync", { script: `return (${fn}).apply(null, arguments);`, args });
const click = (element) => command("POST", `/element/${element[elementKey]}/click`, {});
const open = (summary) => inspect((el) => el.parentElement.open, summary);
async function until(label, predicate, timeout = 30000) {
  const deadline = Date.now() + timeout;
  do {
    const value = await predicate();
    if (value) return value;
    await pause(150);
  } while (Date.now() < deadline);
  throw new Error(`Timed out: ${label}`);
}
function passed(label) {
  report.checks.push(label);
  console.log("PASS: " + label);
}
async function screenshot(label) {
  fs.writeFileSync(
    `${prefix}-${label}.png`,
    Buffer.from(await command("GET", "/screenshot"), "base64"),
  );
}
async function links(summary, groupName) {
  return inspect(
    (el, name) =>
      [...el.parentElement.querySelectorAll(`[aria-label="${name}"] a`)]
        .filter((a) => a.getClientRects().length)
        .map((a) => ({
          label: a.textContent.trim(),
          href: a.href,
          target: a.target,
          rel: a.rel,
          referrer: a.referrerPolicy,
        })),
    summary,
    groupName,
  );
}
async function checkSharing(row) {
  const entries = await links(row.share, "Sharing options");
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(row.race.date + "T00:00:00Z"));
  for (const [label, host, pathname] of [
    ["WhatsApp", "wa.me", "/"],
    ["Facebook", "www.facebook.com", "/sharer/sharer.php"],
    ["X", "x.com", "/intent/tweet"],
    ["Telegram", "t.me", "/share/url"],
    ["Email", "", ""],
  ]) {
    const entry = entries.find((item) => item.label === label);
    assert(entry, `Missing ${label} for ${row.race.distance}`);
    const url = new URL(entry.href);
    assert.equal(url.hostname, host);
    assert.equal(url.pathname, pathname);
    assert.equal(url.protocol, label === "Email" ? "mailto:" : "https:");
    const text = url.searchParams.get(label === "Email" ? "body" : "text");
    if (label === "WhatsApp" || label === "Email")
      assert(text.endsWith("\r\n\r\n" + row.race.pageUrl));
    else assert.equal(url.searchParams.get(label === "Facebook" ? "u" : "url"), row.race.pageUrl);
    if (label !== "Facebook") {
      assert(text.includes(row.race.distance), `${label} selected distance`);
      assert(text.includes(date), `${label} selected date`);
    }
    if (label !== "Email") {
      assert.equal(entry.target, "_blank");
      assert.match(entry.rel, /noopener/);
      assert.match(entry.rel, /noreferrer/);
      assert.equal(entry.referrer, "no-referrer");
    }
  }
  passed(`Five sharing links match ${row.race.distance} ${row.race.date}`);
}
async function checkCalendar(row) {
  const entries = await links(row.calendar, "Calendar options");
  for (const [label, host] of [
    ["Google Calendar", "calendar.google.com"],
    ["Outlook.com", "outlook.live.com"],
    ["Microsoft 365", "outlook.office.com"],
  ]) {
    const entry = entries.find((item) => item.label === label);
    assert(entry, `Missing ${label}`);
    const url = new URL(entry.href);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, host);
    assert(
      url.searchParams
        .get(label === "Google Calendar" ? "text" : "subject")
        .includes(row.race.distance),
    );
    assert(
      url.searchParams.get(label === "Google Calendar" ? "dates" : "startdt"),
      `${label} date`,
    );
  }
  passed(`Three calendar links match selected ${row.race.distance}`);
}
async function checkLayout(summary) {
  const sizes = await inspect(
    (el) => ({
      width: innerWidth,
      clientWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      visualViewport: window.visualViewport
        ? { width: visualViewport.width, scale: visualViewport.scale }
        : null,
      controls: [el, ...el.parentElement.querySelectorAll("a,button,input")]
        .filter((control) => control.getClientRects().length)
        .map((control) => {
          const r = control.getBoundingClientRect();
          return {
            label: control.textContent.trim(),
            x: r.x,
            width: r.width,
            height: r.height,
            scroll: control.scrollWidth,
            client: control.clientWidth,
          };
        }),
    }),
    summary,
  );
  assert(
    sizes.documentWidth <= sizes.clientWidth + 1,
    "Page horizontally overflows document client width",
  );
  if (platform === "ios") {
    assert(
      sizes.visualViewport && Math.abs(sizes.visualViewport.scale - 1) < 0.01,
      "iOS viewport unexpectedly zoomed or scaled to fit an overflowing layout",
    );
    assert(
      sizes.documentWidth <= sizes.visualViewport.width + 1,
      "Page horizontally overflows iOS visual viewport",
    );
  }
  for (const control of sizes.controls) {
    assert(control.width >= 43.5 && control.height >= 43.5, `Small target: ${control.label}`);
    assert(
      control.x >= -1 && control.x + control.width <= sizes.clientWidth + 1,
      `Clipped target: ${control.label}`,
    );
    assert(control.scroll <= control.client + 1, `Overflowing control text: ${control.label}`);
  }
}
try {
  assert.equal(
    process.platform,
    "darwin",
    "Native Safari smoke requires a macOS runner; no substitute browser or skipped PASS",
  );
  assert(["macos", "ios"].includes(platform), "ATHRECS_SAFARI_PLATFORM must be macos or ios");
  report.hostMacOSVersion = execFileSync("/usr/bin/sw_vers", ["-productVersion"], {
    encoding: "utf8",
  }).trim();
  if (platform === "ios") {
    const inventory = JSON.parse(
      execFileSync("/usr/bin/xcrun", ["simctl", "list", "--json"], { encoding: "utf8" }),
    );
    report.simulators = Object.entries(inventory.devices).flatMap(([runtime, devices]) =>
      devices
        .filter((device) => (deviceUDID ? device.udid === deviceUDID : device.state === "Booted"))
        .map((device) => ({
          name: device.name,
          udid: device.udid,
          state: device.state,
          runtime:
            inventory.runtimes.find((item) => item.identifier === runtime)?.version ?? runtime,
        })),
    );
    assert(
      report.simulators.some((device) => device.state === "Booted"),
      "Requested iOS Simulator is not booted",
    );
  }
  driver = spawn("/usr/bin/safaridriver", ["--port", "4444"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  driver.on("error", (error) => {
    driverError = error;
  });
  driver.stdout.pipe(driverLog, { end: false });
  driver.stderr.pipe(driverLog, { end: false });
  await until(
    "safaridriver ready",
    async () => {
      if (driverError) throw driverError;
      if (driver.exitCode !== null || driver.signalCode !== null)
        throw new Error(`safaridriver exited ${driver.exitCode ?? driver.signalCode}`);
      try {
        return (await api("GET", "/status", undefined, 2000)).ready;
      } catch {
        return false;
      }
    },
    20000,
  );
  const capabilities = { browserName: "Safari", pageLoadStrategy: "normal" };
  if (platform === "ios")
    Object.assign(capabilities, {
      platformName: "ios",
      "safari:useSimulator": true,
      ...(deviceUDID ? { "safari:deviceUDID": deviceUDID } : {}),
    });
  phase = "create native Safari session";
  const session = await api("POST", "/session", { capabilities: { alwaysMatch: capabilities } });
  sessionId = session.sessionId;
  report.capabilities = session.capabilities;
  assert(sessionId);
  assert.equal(session.capabilities.browserName.toLowerCase(), "safari");
  assert(session.capabilities.browserVersion, "Safari did not return a browser version");
  assert.match(session.capabilities.platformName, platform === "ios" ? /ios/i : /mac/i);
  report.coverage =
    platform === "ios"
      ? "Native Safari in iOS Simulator; not physical hardware"
      : "Native macOS Safari; narrow desktop windows are not phone emulation";
  console.log(
    JSON.stringify({
      coverage: report.coverage,
      capabilities: report.capabilities,
      hostMacOS: report.hostMacOSVersion,
      simulators: report.simulators,
    }),
  );
  await command("POST", "/timeouts", { implicit: 0, pageLoad: 45000, script: 15000 });
  phase = "navigate and hydrate public race page";
  await command("POST", "/url", { url: target });
  await until("two hydrated public race actions", () =>
    inspect(
      () =>
        document.querySelectorAll('#race-schedule summary[aria-label^="Share "]').length >= 2 &&
        [...document.querySelectorAll('[aria-label="Sharing options"] button')].some(
          (button) => button.textContent.trim() === "Copy link" && !button.disabled,
        ),
    ),
  );
  assert.equal(await command("GET", "/url"), target);
  await inspect(() => {
    window.__athrecsSafariQa = { errors: [], clicks: [], keys: [] };
    addEventListener("error", (event) => window.__athrecsSafariQa.errors.push(event.message));
    addEventListener("unhandledrejection", (event) =>
      window.__athrecsSafariQa.errors.push(String(event.reason)),
    );
    document.addEventListener(
      "click",
      (event) => {
        const el = event.target instanceof Element ? event.target.closest("summary,button") : null;
        if (el)
          window.__athrecsSafariQa.clicks.push({
            label: el.getAttribute("aria-label") || el.textContent.trim(),
            trusted: event.isTrusted,
            userActivation: navigator.userActivation?.isActive ?? null,
          });
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape")
          window.__athrecsSafariQa.keys.push({ key: event.key, trusted: event.isTrusted });
      },
      true,
    );
  });
  let desktopWidth;
  for (const view of platform === "ios" ? ["ios-simulator"] : ["desktop", "narrow"]) {
    phase = `${view}: window and distinct distances`;
    const requested =
      view === "desktop" ? { width: 1280, height: 1000 } : { width: 390, height: 844 };
    const windowRect = platform === "ios" ? null : await command("POST", "/window/rect", requested);
    const viewport = await inspect(() => ({
      innerWidth,
      innerHeight,
      clientWidth: document.documentElement.clientWidth,
      visualViewport: window.visualViewport
        ? { width: visualViewport.width, scale: visualViewport.scale }
        : null,
      devicePixelRatio,
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
    }));
    if (view === "desktop") desktopWidth = viewport.innerWidth;
    if (view === "narrow")
      assert(viewport.innerWidth < desktopWidth, "Safari did not provide a narrower window");
    const observed = {
      view,
      requestedWindow: platform === "ios" ? null : requested,
      windowRect,
      viewport,
    };
    report.views.push(observed);
    console.log(JSON.stringify(observed));
    const rows = await inspect(() =>
      [...document.querySelectorAll("#race-schedule li")].flatMap((li) => {
        const calendar = li.querySelector('summary[aria-label$="to calendar"]'),
          share = li.querySelector('summary[aria-label^="Share "]'),
          input = li.querySelector('input[name="race"]');
        return calendar && share && input
          ? [{ calendar, share, race: JSON.parse(input.value) }]
          : [];
      }),
    );
    const first = rows[0],
      second = rows.find((row) => row.race.distance !== first?.race.distance);
    assert(first && second, "The public page must expose two distinct available race distances");
    for (const row of [first, second])
      assert.equal(row.race.pageUrl, target, "Shared URL must identify the viewed public race");
    observed.distances = [first, second].map(({ race }) => ({
      distance: race.distance,
      date: race.date,
      pageUrl: race.pageUrl,
    }));
    phase = `${view}: trusted disclosure and Escape`;
    await click(first.share);
    await until("share disclosure open", () => open(first.share));
    await checkSharing(first);
    await checkLayout(first.share);
    await inspect((el) => el.focus(), first.share);
    await command("POST", "/actions", {
      actions: [
        {
          type: "key",
          id: "keyboard",
          actions: [
            { type: "keyDown", value: "\uE00C" },
            { type: "keyUp", value: "\uE00C" },
          ],
        },
      ],
    });
    await until("Escape closes share", async () => !(await open(first.share)));
    assert(
      await inspect((el) => document.activeElement === el, first.share),
      "Escape did not return focus to Share",
    );
    passed(`${view}: real WebDriver Escape closes and restores focus`);
    phase = `${view}: same-click outside distance action`;
    await click(first.share);
    await until("share reopened", () => open(first.share));
    await click(second.calendar);
    await until(
      "one outside click both opens other calendar and closes Share",
      async () => (await open(second.calendar)) && !(await open(first.share)),
    );
    await checkCalendar(second);
    await checkLayout(second.calendar);
    await click(second.calendar);
    passed(`${view}: one trusted outside click activates the other distance`);
    phase = `${view}: real Clipboard API`;
    await click(second.share);
    await until("second sharing disclosure open", () => open(second.share));
    await checkSharing(second);
    const copy = await until("Copy link enabled", () =>
      inspect(
        (el) =>
          [...el.parentElement.querySelectorAll("button")].find(
            (button) => button.textContent.trim() === "Copy link" && !button.disabled,
          ) ?? null,
        second.share,
      ),
    );
    observed.clipboardApiAvailable = await inspect(
      () => typeof navigator.clipboard?.writeText === "function",
    );
    await click(copy);
    observed.clipboard = await until("real clipboard success or manual fallback", () =>
      inspect((el) => {
        const text = el.parentElement.querySelector('[role="status"]')?.textContent.trim();
        if (!text) return null;
        const input = el.parentElement.querySelector('input[type="url"]');
        return {
          feedback: text,
          manualValue: input?.value ?? null,
          readOnly: input?.readOnly ?? null,
        };
      }, second.share),
    );
    assert.match(observed.clipboard.feedback, /link copied|select and copy/i);
    if (/select and copy/i.test(observed.clipboard.feedback)) {
      assert.equal(observed.clipboard.manualValue, second.race.pageUrl);
      assert.equal(observed.clipboard.readOnly, true);
    }
    console.log("REAL CLIPBOARD RESULT: " + JSON.stringify(observed.clipboard));
    await checkLayout(second.share);
    await screenshot(view);
    await click(second.share);
    passed(
      `${view}: real clipboard ${/copied/i.test(observed.clipboard.feedback) ? "success reported by app" : "manual fallback verified"}`,
    );
    phase = `${view}: first-distance calendar`;
    await click(first.calendar);
    await until("first calendar open", () => open(first.calendar));
    await checkCalendar(first);
    await click(first.calendar);
  }
  report.interactions = await inspect(() => window.__athrecsSafariQa);
  assert(
    report.interactions.clicks.length > 0 &&
      report.interactions.clicks.every((event) => event.trusted),
    "Expected trusted WebDriver input",
  );
  assert(
    report.interactions.keys.length > 0 && report.interactions.keys.every((event) => event.trusted),
    "Expected trusted WebDriver Escape key input",
  );
  assert.deepEqual(report.interactions.errors, [], "Browser interaction errors");
  passed("No captured interaction errors; all recorded clicks were trusted");
} catch (error) {
  failure = error;
  report.failure = { phase, message: error.message, stack: error.stack };
  console.error(`FAIL (${phase}): ${error.stack}`);
  if (sessionId) {
    try {
      await screenshot("failure");
    } catch (capture) {
      report.screenshotError = capture.message;
    }
    try {
      fs.writeFileSync(`${prefix}-failure.html`, await command("GET", "/source"));
    } catch (capture) {
      report.sourceError = capture.message;
    }
    try {
      report.interactions = await inspect(() => window.__athrecsSafariQa ?? null);
    } catch {
      /* Driver failure is already recorded. */
    }
  }
} finally {
  if (sessionId)
    try {
      await api("DELETE", `/session/${sessionId}`);
    } catch (error) {
      report.cleanupError = error.message;
      failure ??= error;
    }
  if (driver && driver.exitCode === null && driver.signalCode === null) {
    driver.kill("SIGTERM");
    await pause(300);
    if (driver.exitCode === null && driver.signalCode === null) driver.kill("SIGKILL");
  }
  driverLog.end();
  report.finishedAt = new Date().toISOString();
  report.result = failure ? "FAIL" : "PASS";
  fs.writeFileSync(`${prefix}-report.json`, JSON.stringify(report, null, 2) + "\n");
  if (failure) process.exitCode = 1;
  else
    console.log(`PASS: ${report.coverage}; ${report.checks.length} checks. ${prefix}-report.json`);
}
