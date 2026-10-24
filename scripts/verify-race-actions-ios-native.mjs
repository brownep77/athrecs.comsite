import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";
import { verifyNativeSafariInput } from "./ios-safari-input-probe.mjs";
import { verifyNativeShareSheet } from "./ios-safari-share-sheet.mjs";
import { requestAppiumJson } from "./ios-safari-appium-http.mjs";
import { ensureNativeControlClear, rectIsClear } from "./ios-safari-clear-control.mjs";

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
  visibilityChecks: [],
  views: [],
  notCovered: [
    "Physical iPhone/iPad hardware",
    "DOM, JavaScript event.isTrusted, provider URL payloads or CSS measurements",
    "Recipient delivery through the native share sheet",
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
async function api(method, route, body, timeout = 65000) {
  try {
    return await requestAppiumJson({ endpoint, method, route, body, timeout });
  } catch (error) {
    let serverProcess;
    const pid = Number(process.env.ATHRECS_APPIUM_PROCESS);
    if (Number.isSafeInteger(pid) && pid > 0) {
      try {
        process.kill(pid, 0);
        serverProcess = { pid, alive: true };
      } catch (processError) {
        serverProcess = { pid, alive: false, code: processError.code };
      }
    }
    report.lastRequestFailure = {
      method,
      route,
      timeout,
      elapsedMs: error.elapsedMs,
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      cause: error.cause
        ? { name: error.cause.name, message: error.cause.message, code: error.cause.code }
        : undefined,
      serverProcess,
    };
    save();
    throw error;
  }
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
    // Mobile Safari exposes a labelled Link/Button and often a same-named
    // StaticText child. Only the actionable parent is a menu control.
    const matches = await find(
      `${labelPredicate(label)} AND type IN {"XCUIElementTypeLink", "XCUIElementTypeButton"} AND enabled == true`,
    );
    if (!matches.length) return null;
    assert.equal(matches.length, 1, `Ambiguous native menu control: ${label}`);
    return describe(matches[0]);
  });
}
const trueAttribute = (value) => value === true || value === "true" || value === 1;
async function showControl(control, { hittable = false, enabled = true, webContent = true } = {}) {
  const { element, label, type } = control;
  let clearanceIndex, clearance;
  if (webContent) {
    clearanceIndex = report.visibilityChecks.length;
    clearance = await ensureNativeControlClear({
      control,
      mobile,
      command,
      find,
      attribute,
      record: (evidence) => {
        report.visibilityChecks[clearanceIndex] = { phase, ...evidence };
        save();
      },
    });
  } else {
    const alreadyVisible = trueAttribute(await attribute(element, "visible"));
    const alreadyHittable = alreadyVisible && trueAttribute(await attribute(element, "hittable"));
    if (!alreadyHittable) await mobile("scrollToElement", { elementId: element[elementKey] });
  }
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
    accessible: trueAttribute(await attribute(element, "accessible")),
    ...(clearanceIndex === undefined ? {} : { clearanceIndex }),
    rect: await command("GET", `/element/${element[elementKey]}/rect`),
  };
  report.controls.push(evidence);
  save();
  if (clearance)
    assert(
      rectIsClear(evidence.rect, clearance.viewport),
      "Native web control moved outside the observed clear viewport before use",
    );
  return evidence;
}
async function tap(targetControl, { shareMustBeOpen = false } = {}) {
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
  if (shareMustBeOpen) {
    assert(!(await shareClosed()), "Share must still be open immediately before the outside tap");
    evidence.shareWasOpenBeforeTap = true;
  }
  const measured = evidence.rect;
  assert(measured.width > 0 && measured.height > 0, "Native target must have a nonempty rectangle");
  // A web summary can be an inaccessible AX container with an accessible text
  // child. Tap its observed screen centre directly, without asking XCTest to
  // choose an accessibility activation point. The preceding local input probe
  // must independently prove that this route delivers one trusted browser tap.
  const point = {
    x: measured.x + measured.width / 2,
    y: measured.y + measured.height / 2,
  };
  const currentRect = await command("GET", `/element/${element[elementKey]}/rect`);
  for (const key of ["x", "y", "width", "height"])
    assert(
      Math.abs(currentRect[key] - measured[key]) <= 1,
      `Native target moved before tap: ${key}`,
    );
  report.taps.push({
    ...evidence,
    point,
    method: "XCTest tap at the measured native screen centre",
    at: new Date().toISOString(),
  });
  save();
  // Exactly one touch; a missing state transition fails instead of retapping.
  await mobile("tap", point);
}
async function verifyLabels(labels, label) {
  const found = [];
  // A landscape viewport need not contain the entire menu at once. Prove each
  // option can actually be brought into view, without activating its link.
  for (const expected of labels) {
    const control = await named(expected);
    assert(
      ["XCUIElementTypeLink", "XCUIElementTypeButton"].includes(control.type),
      `${expected} must be an actionable native link or button, found ${control.type}`,
    );
    found.push(await showControl(control, { hittable: true }));
  }
  passed(label);
  return found;
}
async function shareClosed() {
  const matches = await find(`${labelPredicate("Copy link")} OR ${labelPredicate("Link copied")}`);
  return matches.length === 0;
}
async function screenshot(label, orientation) {
  const png = Buffer.from(await command("GET", "/screenshot", undefined, 65000), "base64");
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
  const xml = await command("GET", "/source", undefined, 65000);
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
  await tap(second.calendar, { shareMustBeOpen: true });
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
  await tap(first.calendar, { shareMustBeOpen: true });
  await until("second Share closes after the outside calendar tap", shareClosed);
  await verifyLabels(calendarLabels, `${orientation}: first-distance calendar works`);
  await tap(first.calendar);
  await until("first calendar closed", async () => (await exact("Google Calendar")).length === 0);
  assert.equal((await mobile("activeAppInfo")).bundleId, bundleId);
  passed(`${orientation}: all actions remained in installed Mobile Safari`);
}

async function checkSystemSharing(view) {
  const { orientation } = view;
  mark(`${orientation}: return to the first distance for native sharing`);
  await command("POST", "/orientation", { orientation });
  assert.equal(await command("GET", "/orientation"), orientation);
  await mobile("deepLink", { url: target + "#race-schedule", bundleId });
  assert.equal((await mobile("activeAppInfo")).bundleId, bundleId);
  const [first] = await discoverRows();
  assert(await shareClosed(), "System-sharing check starts with the web disclosure closed");
  await tap(first.share);
  mark(`${orientation}: open and cancel the native system share sheet`);
  view.nativeShareSheet = await verifyNativeShareSheet({
    mobile,
    command,
    find,
    attribute,
    describe,
    showControl: (control, options) =>
      showControl(control, { ...options, webContent: control.label === "More sharing options" }),
    screenshot,
    saveSource,
    until,
    target,
    orientation,
    platformVersion:
      report.capabilities.platformVersion || report.capabilities["appium:platformVersion"],
    record: (evidence) => {
      view.nativeShareSheet = evidence;
      save();
    },
    save,
  });
  passed(`${orientation}: native system share sheet opens, cancels and reopens without copying`);

  await tap(first.share);
  await until("sharing closed after native sheet cancellation", shareClosed);
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
  report.serverStartup = JSON.parse(
    fs.readFileSync("artifacts/race-actions-ios-native-server-startup.json", "utf8"),
  );
  assert.equal(report.serverStartup.status, "ready", "Appium must be ready before Simulator boot");
  assert.equal(
    report.serverStartup.lastResponse?.version,
    "3.8.0",
    "Unexpected Appium server version",
  );
  const appiumManagedStartup = setup.mode === "appium-managed";
  if (appiumManagedStartup) {
    assert.equal(setup.status, "selected", "Managed startup requires a completed device selection");
  } else {
    assert.equal(setup.status, "passed", "The installed Simulator must finish setup");
  }
  const sessionCreationTimeout = 600000;
  report.startup = {
    owner: appiumManagedStartup ? "Appium XCUITest" : "Simulator preparation script",
    preparationMode: setup.mode || "prebooted",
    preparationStatus: setup.status,
    deviceSelectionOnly: appiumManagedStartup,
    sessionCreationTimeoutMs: sessionCreationTimeout,
    ...(appiumManagedStartup ? { simulatorStartupTimeoutMs: 300000 } : {}),
    finalProofRequired: "Native session, device, Safari screenshots, taps and application checks",
  };
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
  const prebuiltCapabilities = {};
  const derivedDataPath = process.env.ATHRECS_WDA_DERIVED_DATA_PATH;
  const prebuiltAppPath = process.env.ATHRECS_WDA_PREBUILT_APP_PATH;
  assert(
    !appiumManagedStartup || prebuiltAppPath,
    "Appium-managed startup requires the verified official preinstalled WDA app",
  );
  assert(
    !(derivedDataPath && prebuiltAppPath),
    "Choose either a verified downloaded WDA app or a derived-data build, not both",
  );
  if (prebuiltAppPath) {
    mark("validate the verified official Simulator WebDriverAgent app");
    assert(path.isAbsolute(prebuiltAppPath), "Downloaded WDA app path must be absolute");
    const sourceReport = "artifacts/race-actions-ios-native-wda-download.json";
    const download = JSON.parse(fs.readFileSync(sourceReport, "utf8"));
    assert.equal(download.status, "passed", "Official WDA preparation must have passed");
    assert.equal(download.download?.verified, true, "Official WDA checksum must be verified");
    assert.match(download.download.actualDigest || "", /^sha256:[a-f0-9]{64}$/);
    assert.equal(download.download.actualDigest, download.release?.expectedDigest);
    assert.equal(
      download.app?.path,
      prebuiltAppPath,
      "WDA app must match the verified download report",
    );
    assert(fs.statSync(prebuiltAppPath).isDirectory(), "Verified Simulator WDA app is missing");
    report.prebuiltWDA = {
      sourceReport,
      appPath: prebuiltAppPath,
      installed: download.installed,
      release: download.release,
      download: download.download,
    };
    prebuiltCapabilities["appium:usePreinstalledWDA"] = true;
    prebuiltCapabilities["appium:prebuiltWDAPath"] = prebuiltAppPath;
    save();
  } else if (derivedDataPath) {
    mark("validate WebDriverAgent built before Simulator boot");
    assert(path.isAbsolute(derivedDataPath), "Prebuilt WDA derived-data path must be absolute");
    const products = path.join(derivedDataPath, "Build", "Products");
    const runnerApp = path.join(
      products,
      "Debug-iphonesimulator",
      "WebDriverAgentRunner-Runner.app",
    );
    assert(fs.statSync(runnerApp).isDirectory(), "Prebuilt Simulator WDA app is missing");
    const testRuns = fs
      .readdirSync(products)
      .filter((name) => /^WebDriverAgentRunner_.*\.xctestrun$/.test(name));
    assert(testRuns.length > 0, "Prebuilt WDA test-run metadata is missing");
    report.prebuiltWDA = { derivedDataPath, runnerApp, testRuns };
    // Official Appium prebuild flow: reuse build-for-testing output and run
    // test-without-building. A missing build fails above rather than rebuilding
    // while the Simulator is already consuming the runner's resources.
    prebuiltCapabilities["appium:usePrebuiltWDA"] = true;
    prebuiltCapabilities["appium:derivedDataPath"] = derivedDataPath;
    save();
  }
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
    "appium:screenshotQuality": 0,
    "appium:showXcodeLog": true,
    "appium:wdaLaunchTimeout": 120000,
    "appium:wdaConnectionTimeout": 60000,
    "appium:wdaStartupRetries": 1,
    "appium:newCommandTimeout": 120,
    // State assertions below remain explicit. Avoid spending ten seconds on
    // each XCTest idle check while Safari's first-boot services are settling.
    "appium:waitForIdleTimeout": 1,
    // The iOS 18 runner reached WDA but XCTest's plain Safari launch timed
    // out. This supported URL launch uses the alternative native launch path;
    // the same session, fixture and production assertions still follow.
    ...(selected.runtime.version === "18.5"
      ? { "appium:initialDeeplinkUrl": target + "#race-schedule" }
      : {}),
    ...prebuiltCapabilities,
    ...(appiumManagedStartup
      ? {
          "appium:isHeadless": false,
          "appium:simulatorStartupTimeout": 300000,
          "appium:forceAppLaunch": true,
        }
      : {}),
  };
  report.requestedCapabilities = capabilities;
  mark("create native XCTest session for Mobile Safari");
  const session = await api(
    "POST",
    "/session",
    { capabilities: { alwaysMatch: capabilities } },
    sessionCreationTimeout,
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
  await command("POST", "/orientation", { orientation: "PORTRAIT" });
  report.inputProbe = await verifyNativeSafariInput({
    mobile,
    command,
    find,
    attribute,
    describe,
    // The controlled fixture has no fixed site navigation. Its independent
    // trusted-event telemetry and screenshots prove each actual target hit.
    showControl: (control, options) => showControl(control, { ...options, webContent: false }),
    screenshot,
    saveSource,
    record: (evidence) => {
      report.inputProbe = evidence;
      save();
    },
    phase: mark,
  });
  passed(
    "Native centre taps deliver one trusted click on a button and a disclosure in Mobile Safari",
  );
  for (const orientation of ["PORTRAIT", "LANDSCAPE"]) await checkView(orientation);
  for (const view of report.views) await checkSystemSharing(view);
  report.status = "passed";
  mark("complete");
} catch (error) {
  failure = error;
  report.status = "failed";
  report.failure = { phase, message: error.message, stack: error.stack };
  save();
  console.error(`FAIL native iOS Safari (${phase}): ${error.stack}`);
  if (sessionId) {
    // XCTest has one command stream. Serial diagnostic reads avoid queueing
    // three expensive native snapshots behind a stalled request.
    report.failure.diagnostics = [];
    for (const [kind, collect] of [
      ["native accessibility XML", () => saveSource("failure")],
      ["native screenshot", () => screenshot("failure")],
      ["active app", () => mobile("activeAppInfo", {}, 65000)],
    ]) {
      try {
        const value = await collect();
        report.failure.diagnostics.push({
          kind,
          status: "fulfilled",
          ...(kind === "active app" ? { value } : {}),
        });
      } catch (diagnosticError) {
        report.failure.diagnostics.push({
          kind,
          status: "rejected",
          error: diagnosticError.message,
        });
      }
      save();
    }
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
