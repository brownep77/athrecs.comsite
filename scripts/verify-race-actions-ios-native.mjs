import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

// Native XCTest accessibility and input in the installed Mobile Safari app.
// This deliberately does not request browserName or a WebKit/webview context.
// APIs: https://appium.github.io/appium-xcuitest-driver/latest/reference/execute-methods/
// Locators: https://appium.github.io/appium-xcuitest-driver/latest/reference/locator-strategies/
const target = "https://www.athrecs.com/races/holkham-half-10k";
const bundleId = "com.apple.mobilesafari";
const endpoint = new URL(process.env.ATHRECS_APPIUM_URL || "http://127.0.0.1:4723");
const prefix = "artifacts/race-actions-ios-native";
const elementKey = "element-6066-11e4-a52e-4f735466cecf";
const sharingLabels = ["WhatsApp", "Facebook", "X", "Telegram", "Email", "Copy link"];
const calendarLabels = ["Google Calendar", "Outlook.com", "Microsoft 365", "Apple Calendar"];
const started = Date.now();
const report = {
  startedAt: new Date().toISOString(),
  status: "running",
  target,
  coverage:
    "Installed Mobile Safari in iOS Simulator, driven through native XCTest accessibility and taps",
  host: { platform: process.platform, architecture: process.arch },
  phases: [],
  checks: [],
  taps: [],
  controls: [],
  views: [],
  notCovered: [
    "Physical iPhone/iPad hardware",
    "DOM, JavaScript event.isTrusted, provider URL payloads or CSS measurements",
    "Native share-sheet display/cancellation and recipient delivery",
    "External provider navigation and calendar saves",
  ],
};
let sessionId,
  phase = "setup",
  failure;
fs.mkdirSync("artifacts", { recursive: true });

function save() {
  fs.writeFileSync(`${prefix}.json`, JSON.stringify(report, null, 2) + "\n");
}
function mark(next) {
  phase = next;
  report.phase = phase;
  const entry = { phase, elapsedMs: Date.now() - started };
  report.phases.push(entry);
  console.log(`IOS NATIVE +${entry.elapsedMs}ms: ${phase}`);
  save();
}
function passed(label) {
  report.checks.push(label);
  console.log(`PASS: ${label}`);
  save();
}
async function api(method, route, body, timeout = 30000) {
  const response = await fetch(new URL(route, endpoint), {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(timeout),
  });
  const result = await response.json();
  if (!response.ok || result.value?.error)
    throw Error(`${method} ${route}: ${JSON.stringify(result.value).slice(0, 3000)}`);
  return result.value;
}
const command = (method, route, body, timeout) =>
  api(method, `/session/${sessionId}${route}`, body, timeout);
const mobile = (name, args = {}, timeout) =>
  command("POST", "/execute/sync", { script: `mobile: ${name}`, args: [args] }, timeout);
const literal = (value) => JSON.stringify(value);
const labelPredicate = (label) => `(name == ${literal(label)} OR label == ${literal(label)})`;
const find = (predicate) =>
  command("POST", "/elements", { using: "-ios predicate string", value: predicate });
const attribute = (element, name) =>
  command("GET", `/element/${element[elementKey]}/attribute/${name}`);
const exact = (label) => find(labelPredicate(label));
async function until(label, predicate, timeout = 25000) {
  const deadline = Date.now() + timeout;
  do {
    const result = await predicate();
    if (result) return result;
    await pause(300);
  } while (Date.now() < deadline);
  throw Error(`Timed out: ${label}`);
}
async function describe(element) {
  return {
    element,
    label: (await attribute(element, "label")) || (await attribute(element, "name")),
    type: await attribute(element, "type"),
  };
}
async function named(label) {
  return until(`native element ${label}`, async () => {
    const matches = await find(`${labelPredicate(label)} AND enabled == true`);
    if (!matches.length) return null;
    assert.equal(matches.length, 1, `Ambiguous native menu control: ${label}`);
    return describe(matches[0]);
  });
}
const trueAttribute = (value) => value === true || value === "true" || value === 1;
async function showControl(control, { hittable = false, enabled = true } = {}) {
  const { element, label, type } = control;
  await mobile("scrollToElement", { elementId: element[elementKey] });
  const state = await until(
    `visible${hittable ? "/hittable" : ""} native control ${label}`,
    async () => {
      const visible = trueAttribute(await attribute(element, "visible"));
      const isEnabled = trueAttribute(await attribute(element, "enabled"));
      const isHittable = hittable ? trueAttribute(await attribute(element, "hittable")) : undefined;
      return visible && (!enabled || isEnabled) && (!hittable || isHittable)
        ? { visible, enabled: isEnabled, ...(hittable ? { hittable: isHittable } : {}) }
        : null;
    },
  );
  const current = await describe(element);
  assert.equal(current.label, label, "The chosen native element changed its label");
  assert.equal(current.type, type, "The chosen native element changed its observed type");
  const evidence = {
    phase,
    label,
    type,
    elementId: element[elementKey],
    ...state,
    rect: await command("GET", `/element/${element[elementKey]}/rect`),
  };
  report.controls.push(evidence);
  save();
  return evidence;
}
async function tap(targetControl) {
  const control = typeof targetControl === "string" ? await named(targetControl) : targetControl;
  const { label, element } = control;
  // The test never activates providers, save/download controls, or recipients.
  assert(
    /^Share .*Holkham/i.test(label) ||
      /^Add .*Holkham.* to calendar$/i.test(label) ||
      label === "Copy link",
    `Unexpected native tap target: ${label}`,
  );
  // Reuse the observed element, rather than selecting the first global match:
  // Share titles may be identical for different dated race editions.
  const evidence = await showControl(control, { hittable: true });
  report.taps.push({
    ...evidence,
    method: "XCTest element click",
    at: new Date().toISOString(),
  });
  save();
  // Exactly one click; a missing state transition fails instead of retapping.
  await command("POST", `/element/${element[elementKey]}/click`, {});
}
async function verifyLabels(labels, label) {
  const found = [];
  // A landscape viewport need not contain the entire menu at once. Prove each
  // option can actually be brought into view, without activating its link.
  for (const expected of labels) found.push(await showControl(await named(expected)));
  passed(label);
  return found;
}
async function shareClosed() {
  const matches = await find(`${labelPredicate("Copy link")} OR ${labelPredicate("Link copied")}`);
  return matches.length === 0;
}
async function screenshot(label, orientation) {
  const png = Buffer.from(await command("GET", "/screenshot", undefined, 15000), "base64");
  assert(png.subarray(1, 4).equals(Buffer.from("PNG")), "Expected a native PNG screenshot");
  const size = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
  fs.writeFileSync(`${prefix}-${label}.png`, png);
  if (orientation)
    assert(
      orientation === "PORTRAIT" ? size.height > size.width : size.width > size.height,
      `Screenshot did not actually rotate to ${orientation}: ${JSON.stringify(size)}`,
    );
  return size;
}
async function saveSource(label) {
  const xml = await command("GET", "/source", undefined, 15000);
  assert.equal(typeof xml, "string");
  fs.writeFileSync(`${prefix}-${label}.xml`, xml);
  return xml;
}
async function discoverRows() {
  const shares = await until(
    "Holkham race Share controls in native Safari",
    async () => {
      const found = await find(
        '(name BEGINSWITH "Share " OR label BEGINSWITH "Share ") AND ' +
          '(name CONTAINS[c] "Holkham" OR label CONTAINS[c] "Holkham") AND enabled == true',
      );
      return found.length >= 2 ? found : null;
    },
    45000,
  );
  const calendars = await find(
    '(name BEGINSWITH "Add " OR label BEGINSWITH "Add ") AND ' +
      '(name CONTAINS[c] "Holkham" OR label CONTAINS[c] "Holkham") AND ' +
      '(name ENDSWITH " to calendar" OR label ENDSWITH " to calendar") AND enabled == true',
  );
  const shareRecords = [];
  for (const element of shares) shareRecords.push(await describe(element));
  const rows = [];
  for (const element of calendars) {
    const calendar = await describe(element);
    // Distance labels themselves contain " · ", so derive the complete name
    // and distance from the dated calendar label before matching Share exactly.
    const fields = /^Add (.+), (.+), (\d{4}-\d{2}-\d{2}) to calendar$/.exec(calendar.label);
    if (!fields) continue;
    const [, name, distance, date] = fields;
    const shareLabel = `Share ${name} · ${distance}`;
    const matches = shareRecords.filter((item) => item.label === shareLabel);
    if (!matches.length || rows.some((row) => row.distance === distance)) continue;
    rows.push({
      share: matches[0],
      calendar,
      name,
      distance,
      date,
      shareMatchCount: matches.length,
      chosenShareOccurrence: 0,
    });
    if (rows.length === 2) break;
  }
  assert.equal(
    rows.length,
    2,
    "Two distinct race distances need enabled Share and calendar controls",
  );
  assert.notEqual(rows[0].distance, rows[1].distance);
  return rows;
}
async function checkView(orientation) {
  const view = { orientation, checks: [] };
  report.views.push(view);
  mark(`${orientation}: rotate installed Safari`);
  // Appium's supported JSONWP extension proxies this to XCTest device orientation.
  await command("POST", "/orientation", { orientation });
  assert.equal(await command("GET", "/orientation"), orientation);
  // The public page's existing anchor brings the actual schedule into view
  // through Safari navigation, without injecting scroll or other JavaScript.
  await mobile("deepLink", { url: target + "#race-schedule", bundleId });
  view.activeApp = await mobile("activeAppInfo");
  assert.equal(view.activeApp.bundleId, bundleId);
  assert.equal(await command("GET", "/context"), "NATIVE_APP");
  mark(`${orientation}: discover native accessibility controls`);
  const [first, second] = await discoverRows();
  view.distances = [first, second];
  assert(await shareClosed(), "Sharing starts closed");

  mark(`${orientation}: one native tap opens first-distance Share`);
  await tap(first.share);
  view.sharingLabels = await verifyLabels(
    sharingLabels,
    `${orientation}: five providers and Copy link exposed by native Safari`,
  );
  view.shareScreenshot = await screenshot(`${orientation.toLowerCase()}-share`, orientation);
  await saveSource(`${orientation.toLowerCase()}-share`);

  mark(`${orientation}: native Copy link and Simulator pasteboard`);
  const clipboardSentinel = `athrecs-native-copy-before-${orientation}-${Date.now()}`;
  await mobile("setPasteboard", { content: clipboardSentinel });
  assert.equal(await mobile("getPasteboard"), clipboardSentinel);
  await tap("Copy link");
  view.clipboard = await until("copied URL or visible manual fallback", async () => {
    const contents = await mobile("getPasteboard");
    if (contents === target) return { result: "copied", value: contents };
    const manual = await find(
      `type IN {"XCUIElementTypeTextField", "XCUIElementTypeTextView"} AND value == ${literal(target)}`,
    );
    const notice = await find(
      'name CONTAINS "Select and copy the race link" OR label CONTAINS "Select and copy the race link"',
    );
    if (manual.length && notice.length) {
      await showControl(await describe(notice[0]), { enabled: false });
      await showControl(await describe(manual[0]));
      return { result: "manual fallback", value: target };
    }
    return null;
  });
  passed(`${orientation}: ${view.clipboard.result} verified through native Simulator APIs`);

  mark(`${orientation}: one outside tap opens the other distance's calendar`);
  await tap(second.calendar);
  await until("outside tap closes Share", shareClosed);
  view.calendarLabels = await verifyLabels(
    calendarLabels,
    `${orientation}: other-distance calendar options exposed`,
  );
  view.calendarScreenshot = await screenshot(`${orientation.toLowerCase()}-calendar`, orientation);
  await saveSource(`${orientation.toLowerCase()}-calendar`);
  await tap(second.calendar);
  await until("calendar closed", async () => (await exact("Google Calendar")).length === 0);

  mark(`${orientation}: second-distance Share and first-distance calendar`);
  await tap(second.share);
  await verifyLabels(sharingLabels, `${orientation}: second-distance Share works`);
  await tap(first.calendar);
  await until("second Share closes after the outside calendar tap", shareClosed);
  await verifyLabels(calendarLabels, `${orientation}: first-distance calendar works`);
  await tap(first.calendar);
  await until("first calendar closed", async () => (await exact("Google Calendar")).length === 0);
  assert.equal((await mobile("activeAppInfo")).bundleId, bundleId);
  passed(`${orientation}: all actions remained in installed Mobile Safari`);
}

try {
  assert.equal(process.platform, "darwin", "Native iOS testing requires macOS");
  assert.equal(endpoint.protocol, "http:");
  assert(
    ["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname),
    "Appium must run on local loopback",
  );
  assert(
    !endpoint.username && !endpoint.password && endpoint.pathname === "/",
    "Use a credential-free Appium root URL",
  );
  const setup = JSON.parse(fs.readFileSync("artifacts/race-actions-safari-ios-setup.json", "utf8"));
  assert.equal(setup.status, "passed", "The installed Simulator must finish setup");
  const selected = setup.selectedDevice;
  const udid = process.env.ATHRECS_SAFARI_DEVICE_UDID || selected?.udid;
  assert.match(udid || "", /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i);
  assert.equal(udid.toLowerCase(), selected.udid.toLowerCase());
  report.simulator = selected;
  report.host.macOS = execFileSync("/usr/bin/sw_vers", ["-productVersion"], {
    encoding: "utf8",
    timeout: 10000,
  }).trim();
  report.toolchain = setup.toolchain;
  mark("wait for local Appium readiness");
  await until(
    "Appium ready",
    async () => {
      try {
        return (await api("GET", "/status", undefined, 2000)).ready === true;
      } catch {
        return false;
      }
    },
    30000,
  );
  const capabilities = {
    platformName: "iOS",
    "appium:automationName": "XCUITest",
    "appium:udid": udid,
    "appium:deviceName": selected.name,
    "appium:platformVersion": selected.runtime.version,
    "appium:bundleId": bundleId,
    "appium:noReset": true,
    "appium:fullReset": false,
    "appium:autoWebview": false,
    "appium:showXcodeLog": true,
    "appium:wdaLaunchTimeout": 120000,
    "appium:wdaConnectionTimeout": 30000,
    "appium:wdaStartupRetries": 1,
    "appium:newCommandTimeout": 90,
  };
  report.requestedCapabilities = capabilities;
  mark("create native XCTest session for Mobile Safari");
  const session = await api(
    "POST",
    "/session",
    { capabilities: { alwaysMatch: capabilities } },
    180000,
  );
  sessionId = session.sessionId;
  assert(sessionId, "Appium did not return a session");
  report.capabilities = session.capabilities;
  assert.match(session.capabilities.platformName, /^ios$/i);
  assert.equal(await command("GET", "/context"), "NATIVE_APP");
  report.device = await mobile("deviceInfo");
  assert.equal(
    Number(report.device.isSimulator),
    1,
    "Native device information must prove Simulator use",
  );
  await command("POST", "/timeouts", { implicit: 0 });
  await mobile("activateApp", { bundleId });
  for (const orientation of ["PORTRAIT", "LANDSCAPE"]) await checkView(orientation);
  report.status = "passed";
  mark("complete");
} catch (error) {
  failure = error;
  report.status = "failed";
  report.failure = { phase, message: error.message, stack: error.stack };
  save();
  console.error(`FAIL native iOS Safari (${phase}): ${error.stack}`);
  if (sessionId) {
    const diagnostics = await Promise.allSettled([
      saveSource("failure"),
      screenshot("failure"),
      mobile("activeAppInfo", {}, 10000),
    ]);
    report.failure.diagnostics = diagnostics.map((result, index) => ({
      kind: ["native accessibility XML", "native screenshot", "active app"][index],
      status: result.status,
      ...(result.status === "rejected"
        ? { error: result.reason.message }
        : index === 2
          ? { value: result.value }
          : {}),
    }));
  }
} finally {
  if (sessionId) {
    try {
      await api("DELETE", `/session/${sessionId}`, undefined, 15000);
    } catch (error) {
      report.cleanupError = error.message;
      failure ??= error;
      report.status = "failed";
    }
  }
  report.finishedAt = new Date().toISOString();
  report.elapsedMs = Date.now() - started;
  save();
  if (failure) process.exitCode = 1;
}
