import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Native XCTest only: attaching Safari automation can resolve navigator.share
// without presenting any UI (WebKit Source/WebCore/page/Navigator.cpp).
// Observed OS selectors, not a promise of stable Apple accessibility identifiers:
// https://github.com/mozilla-mobile/firefox-ios/blob/783d862f7e2789643ce4e4bf8c640107e4e10c78/firefox-ios/firefox-ios-tests/Tests/XCUITests/Selectors/PhotonActionSheetSelectors.swift
// https://github.com/mozilla-mobile/firefox-ios/blob/783d862f7e2789643ce4e4bf8c640107e4e10c78/firefox-ios/firefox-ios-tests/Tests/XCUITests/PageScreens/PhotonActionSheetScreen.swift
// Supported native tap and Simulator pasteboard commands:
// https://github.com/appium/appium-xcuitest-driver/blob/v12.20.0/lib/commands/gesture.ts
// https://github.com/appium/appium-xcuitest-driver/blob/v12.20.0/lib/commands/pasteboard.ts
const elementKey = "element-6066-11e4-a52e-4f735466cecf";
const sheetNode =
  "XCUIElementTypeOther[(@name='ActivityListView' or @label='ActivityListView') and not(ancestor::XCUIElementTypeWebView)]";
const sheetPath = `//${sheetNode}`;
const windowPath = `//XCUIElementTypeWindow[.//${sheetNode}]`;
const headerPath =
  `${windowPath}//XCUIElementTypeNavigationBar[` +
  "(@name='UIActivityContentView' or @label='UIActivityContentView') and not(ancestor::XCUIElementTypeWebView)]";
const closePath =
  `${headerPath}//XCUIElementTypeButton[` +
  "@name='header.closeButton' or ((not(@name) or @name='' or @name='Close') and @label='Close')]";
const regionPath =
  `${windowPath}//XCUIElementTypeOther[` +
  "(@name='PopoverDismissRegion' or @label='PopoverDismissRegion') and not(ancestor::XCUIElementTypeWebView)]";
const morePredicate =
  '(name == "More sharing options" OR label == "More sharing options") AND type == "XCUIElementTypeButton"';
const truth = (value) => value === true || value === "true" || value === 1;
const centre = (rect) => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
const contains = (rect, point) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

export async function verifyNativeShareSheet({
  mobile,
  command,
  find,
  attribute,
  describe,
  showControl,
  screenshot,
  saveSource,
  until,
  target,
  orientation,
  platformVersion,
  record,
}) {
  const evidence = {
    status: "running",
    target,
    orientation,
    platformVersion: platformVersion || null,
    coverage: "Native Apple share sheet opens and cancels twice; no recipient or provider selected",
    events: [],
    cycles: [],
  };
  const persist = () => record(evidence);
  const event = (action, details = {}) => {
    evidence.events.push({ at: new Date().toISOString(), action, ...details });
    persist();
  };
  const xpath = (value) => command("POST", "/elements", { using: "xpath", value });
  const rect = async (element) => {
    const result = await command("GET", `/element/${element[elementKey]}/rect`);
    assert(
      ["x", "y", "width", "height"].every((key) => Number.isFinite(result[key])) &&
        result.width > 0 &&
        result.height > 0,
      "A native tap target needs a finite, nonempty rectangle",
    );
    return result;
  };
  const unique = (matches, label) => {
    assert(matches.length <= 1, `Ambiguous native ${label}: ${matches.length} matches`);
    return matches[0];
  };
  const ready = async (element) =>
    truth(await attribute(element, "visible")) &&
    truth(await attribute(element, "enabled")) &&
    truth(await attribute(element, "hittable"));
  const noFallback = async () => {
    const matches = await find(
      'name == "Race link" OR label == "Race link" OR ' +
        'name CONTAINS "Select and copy the race link" OR label CONTAINS "Select and copy the race link" OR ' +
        'name == "Link copied" OR label == "Link copied" OR ' +
        `(type IN {"XCUIElementTypeTextField", "XCUIElementTypeTextView"} AND value == ${JSON.stringify(target)})`,
    );
    assert.equal(matches.length, 0, "Cancelling native sharing must not show copy/manual fallback");
  };
  const more = () =>
    until("enabled More sharing options", async () => {
      const element = unique(await find(morePredicate), "More sharing options button");
      if (!element || !truth(await attribute(element, "enabled"))) return null;
      return describe(element);
    });
  const sheet = () =>
    until("one visible native ActivityListView", async () => {
      const element = unique(await xpath(sheetPath), "ActivityListView");
      return element && truth(await attribute(element, "visible")) ? element : null;
    });

  async function safeTap(control, kind, selector, sheetElement) {
    assert.equal(await command("GET", "/context"), "NATIVE_APP");
    if (kind === "open") {
      assert.equal(control.type, "XCUIElementTypeButton");
      assert.equal(control.label, "More sharing options");
      assert.equal((await xpath(sheetPath)).length, 0, "A sheet must not already be open");
    } else {
      assert.equal((await sheet())[elementKey], sheetElement[elementKey]);
      assert.equal(
        unique(await xpath(selector), "scoped dismiss control")?.[elementKey],
        control.element[elementKey],
        "Dismiss must still be the observed native share-sheet control",
      );
      const name = await attribute(control.element, "name");
      if (kind === "close") {
        assert.equal(control.type, "XCUIElementTypeButton");
        assert(
          name === "header.closeButton" ||
            ((!name || name === "Close") && control.label === "Close"),
        );
      } else {
        assert.equal(kind, "dismiss-region");
        assert(
          Number.parseInt(platformVersion, 10) >= 26,
          "Dismiss-region tap needs observed iOS 26+",
        );
        assert.equal(control.type, "XCUIElementTypeOther");
        assert(name === "PopoverDismissRegion" || control.label === "PopoverDismissRegion");
      }
      // A native modal dismiss control must already be actionable. Do not
      // scroll the sheet, choose an activity, or force a hidden target.
      assert(
        await ready(control.element),
        "Observed dismiss control must be visible/enabled/hittable",
      );
    }
    const state = await showControl(control, { hittable: true });
    const measured = await rect(control.element);
    for (const key of ["x", "y", "width", "height"])
      assert(
        Math.abs(state.rect[key] - measured[key]) <= 1,
        `Native control moved before tap: ${key}`,
      );
    const point = centre(measured);
    if (kind === "dismiss-region") {
      assert(
        !contains(await rect(sheetElement), point),
        "Dismiss-region centre overlaps the activity list",
      );
      for (const header of await xpath(headerPath))
        assert(
          !contains(await rect(header), point),
          "Dismiss-region centre overlaps the sheet header",
        );
    }
    event("native-tap", {
      kind,
      ...state,
      point,
      method: "XCTest mobile:tap at measured native centre",
    });
    await mobile("tap", point); // Exactly one tap; a missing transition fails.
  }

  async function dismissControl(sheetElement) {
    return until("one safe, observed native share-sheet dismiss control", async () => {
      unique(await xpath(headerPath), "share-sheet header");
      const close = unique(await xpath(closePath), "share-sheet Close button");
      if (Number.parseInt(platformVersion, 10) >= 26) {
        const region = unique(await xpath(regionPath), "share-sheet dismiss region");
        if (region && (await ready(region))) {
          const point = centre(await rect(region));
          const boundaries = [await rect(sheetElement)];
          for (const header of await xpath(headerPath)) boundaries.push(await rect(header));
          if (boundaries.every((boundary) => !contains(boundary, point)))
            return {
              control: await describe(region),
              kind: "dismiss-region",
              selector: regionPath,
            };
        }
      }
      if (close && (await ready(close)))
        return { control: await describe(close), kind: "close", selector: closePath };
      return null;
    });
  }

  persist();
  try {
    assert.equal(await command("GET", "/context"), "NATIVE_APP");
    assert.equal((await mobile("activeAppInfo")).bundleId, "com.apple.mobilesafari");
    for (let number = 1; number <= 2; number++) {
      const label = `${orientation.toLowerCase()}-native-share-${number}`;
      const cycle = { number, status: "running" };
      evidence.cycles.push(cycle);
      await noFallback();
      const opener = await more();
      const sentinel = `athrecs-share-cancel-${orientation}-${randomUUID()}`;
      await mobile("setPasteboard", { content: sentinel });
      assert.equal(
        await mobile("getPasteboard"),
        sentinel,
        "Simulator pasteboard sentinel was not set",
      );
      cycle.clipboardBefore = sentinel;
      event("clipboard-sentinel-set", { number, sentinel });
      await safeTap(opener, "open");
      const sheetElement = await sheet();
      cycle.sheet = { ...(await describe(sheetElement)), rect: await rect(sheetElement) };
      await saveSource(`${label}-open`);
      cycle.openScreenshot = await screenshot(`${label}-open`, orientation);
      event("native-sheet-observed", {
        number,
        artifactLabel: `${label}-open`,
        sheet: cycle.sheet,
      });
      const dismiss = await dismissControl(sheetElement);
      cycle.dismiss = { kind: dismiss.kind, selector: dismiss.selector, ...dismiss.control };
      await safeTap(dismiss.control, dismiss.kind, dismiss.selector, sheetElement);
      await until(
        "native ActivityListView disappears after cancellation",
        async () => (await xpath(sheetPath)).length === 0,
      );
      cycle.moreAfterCancel = await showControl(await more(), { hittable: true });
      await noFallback();
      cycle.clipboardAfter = await mobile("getPasteboard");
      assert.equal(
        cycle.clipboardAfter,
        sentinel,
        "Cancelling the native share sheet changed the clipboard",
      );
      assert.equal((await mobile("activeAppInfo")).bundleId, "com.apple.mobilesafari");
      await saveSource(`${label}-cancelled`);
      cycle.cancelledScreenshot = await screenshot(`${label}-cancelled`, orientation);
      cycle.status = "passed";
      event("native-sheet-cancelled", {
        number,
        artifactLabel: `${label}-cancelled`,
        clipboardUnchanged: true,
        moreSharingOptionsEnabled: true,
        manualFallbackAbsent: true,
      });
    }
    evidence.status = "passed";
    persist();
    return evidence;
  } catch (error) {
    evidence.status = "failed";
    evidence.error = error.stack || String(error);
    persist();
    throw error;
  }
}
