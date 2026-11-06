import assert from "node:assert/strict";
import { setTimeout as pause } from "node:timers/promises";

const elementKey = "element-6066-11e4-a52e-4f735466cecf";
const bottom = (rect) => rect.y + rect.height;
const right = (rect) => rect.x + rect.width;
const centreY = (rect) => rect.y + rect.height / 2;
const validRect = (rect) =>
  rect &&
  ["x", "y", "width", "height"].every((key) => Number.isFinite(rect[key])) &&
  rect.width > 0 &&
  rect.height > 0;

export function clearViewport(screen, navigation, chrome = []) {
  assert(validRect(screen) && validRect(navigation), "Missing native screen/navigation geometry");
  let top = screen.y + screen.height * 0.3;
  let lower = Math.min(screen.y + screen.height * 0.7, navigation.y - 12);
  for (const obstacle of chrome) {
    assert(validRect(obstacle), "Invalid observed Safari chrome rectangle");
    if (
      right(obstacle) <= screen.x ||
      obstacle.x >= right(screen) ||
      bottom(obstacle) <= screen.y ||
      obstacle.y >= bottom(screen)
    )
      continue;
    // Exclude the entire row containing a native Safari control, not merely
    // its icon: a broad toolbar background can also consume a native touch.
    if (centreY(obstacle) <= centreY(screen)) top = Math.max(top, bottom(obstacle) + 12);
    else lower = Math.min(lower, obstacle.y - 12);
  }
  assert(lower > top, "No central native content band remains clear of navigation/chrome");
  return { x: screen.x, y: top, width: screen.width, height: lower - top };
}

export function rectIsClear(rect, viewport) {
  return (
    validRect(rect) &&
    rect.x >= viewport.x &&
    right(rect) <= right(viewport) &&
    rect.y >= viewport.y &&
    bottom(rect) <= bottom(viewport)
  );
}

const obstruction = (rect, viewport) =>
  Math.max(0, viewport.y - rect.y) + Math.max(0, bottom(rect) - bottom(viewport));

export function snapshotObstacles(snapshot) {
  assert.equal(
    snapshot?.type,
    "Application",
    "Expected the native standard-snapshot application root",
  );
  assert.equal(snapshot.isVisible, "1", "Native application snapshot must be visible");
  assert(validRect(snapshot.rect), "Missing native application rectangle");
  const navigation = [];
  const safariChrome = [];
  let nodeCount = 0;
  let applicationCount = 0;
  function visit(node, insideWebView = false) {
    assert(node && typeof node.type === "string", "Malformed native snapshot node");
    nodeCount++;
    if (node.type === "Application") applicationCount++;
    const web = insideWebView || node.type === "WebView";
    // WDA serializes these flags as strings. In particular, "0" is truthy
    // in JavaScript and must never be interpreted as visible.
    if (node.isVisible === "1") {
      if (
        [node.name, node.label].some(
          (label) => label === "Primary, navigation" || label === "Primary",
        )
      ) {
        assert(validRect(node.rect), "Invalid visible Primary navigation rectangle");
        navigation.push({ ...node.rect });
      }
      if (!web && ["Button", "TextField"].includes(node.type)) {
        assert(validRect(node.rect), "Invalid visible Safari chrome rectangle");
        safariChrome.push({
          label: node.label || node.name || node.rawIdentifier || "",
          type: node.type,
          rawIdentifier: node.rawIdentifier ?? null,
          ...node.rect,
        });
      }
    }
    if (node.children !== undefined) {
      assert(Array.isArray(node.children), "Malformed native snapshot children");
      for (const child of node.children) visit(child, web);
    }
  }
  visit(snapshot);
  assert.equal(applicationCount, 1, "Expected one native application window");
  assert.equal(navigation.length, 1, "Production must expose one visible Primary navigation");
  return {
    screen: { ...snapshot.rect },
    navigation: navigation[0],
    safariChrome,
    source: {
      method: "mobile: source",
      format: "json",
      snapshot: "fb_standardSnapshot",
      shape: "Application root; unprefixed element types; isVisible/isEnabled string flags",
      visibilityRule: "isVisible === '1'",
      nodeCount,
    },
  };
}

// Production WEB controls only. The caller excludes the controlled input
// fixture and native OS share-sheet dismissal controls from this helper.
// W3C actions stay in NATIVE_APP and are proxied to XCTest touch input:
// https://github.com/appium/appium-xcuitest-driver/blob/v12.20.0/lib/commands/gesture.ts
export async function ensureNativeControlClear({ control, mobile, command, attribute, record }) {
  const evidence = {
    status: "running",
    label: control.label,
    type: control.type,
    elementId: control.element[elementKey],
    observations: [],
    scrolls: [],
  };
  const save = () => record(evidence);
  const rect = async (element) => {
    const value = await command("GET", `/element/${element[elementKey]}/rect`);
    assert(validRect(value), "Expected a finite, nonempty native rectangle");
    return value;
  };

  async function measure() {
    const label =
      (await attribute(control.element, "label")) || (await attribute(control.element, "name"));
    assert.equal(label, control.label, "Web control identity changed while clearing its viewport");
    assert.equal(await attribute(control.element, "type"), control.type);
    const requestedAt = new Date().toISOString();
    const {
      screen,
      navigation,
      safariChrome: chrome,
      source,
    } = snapshotObstacles(await mobile("source", { format: "json" }));
    source.requestedAt = requestedAt;
    source.receivedAt = new Date().toISOString();
    const target = await rect(control.element);
    const viewport = clearViewport(screen, navigation, chrome);
    assert(
      target.width <= viewport.width && target.height <= viewport.height,
      "Web control cannot fit wholly inside the clear native content band",
    );
    assert(
      target.x >= screen.x && right(target) <= right(screen),
      "Web control extends horizontally outside the native screen",
    );
    const observation = {
      at: new Date().toISOString(),
      rect: target,
      screen,
      viewport,
      obstacles: { navigation, safariChrome: chrome },
      source,
      clear: rectIsClear(target, viewport),
    };
    evidence.observations.push(observation);
    Object.assign(evidence, observation);
    save();
    return observation;
  }

  save();
  try {
    assert.equal(await command("GET", "/context"), "NATIVE_APP");
    assert.equal((await mobile("activeAppInfo")).bundleId, "com.apple.mobilesafari");
    let before = await measure();
    for (let number = 1; !before.clear && number <= 8; number++) {
      const band = before.viewport;
      const up = centreY(before.rect) > centreY(band);
      const distance = Math.min(
        band.height - 16,
        Math.max(24, Math.abs(centreY(before.rect) - centreY(band))),
      );
      assert(distance >= 24, "Clear content band is too small for a safe native scroll gesture");
      const x = Math.round(band.x + band.width / 2);
      const startY = Math.round(up ? bottom(band) - 8 : band.y + 8);
      const endY = Math.round(up ? startY - distance : startY + distance);
      for (const y of [startY, endY])
        assert(
          y > band.y && y < bottom(band),
          "Native swipe must remain entirely in clear content",
        );
      const scroll = {
        number,
        startedAt: new Date().toISOString(),
        direction: up ? "up" : "down",
        from: { x, y: startY },
        to: { x, y: endY },
        before,
        method: "Native W3C touch swipe; no tap",
        pointerUpIncluded: true,
      };
      evidence.scrolls.push(scroll);
      save();
      assert.equal(await command("GET", "/context"), "NATIVE_APP");
      await command("POST", "/actions", {
        actions: [
          {
            type: "pointer",
            id: "clear-web-control",
            parameters: { pointerType: "touch" },
            actions: [
              { type: "pointerMove", duration: 0, origin: "viewport", x, y: startY },
              { type: "pointerDown", button: 0 },
              { type: "pause", duration: 50 },
              { type: "pointerMove", duration: 450, origin: "viewport", x, y: endY },
              { type: "pointerUp", button: 0 },
            ],
          },
        ],
      });
      scroll.pointerSequenceCompleted = true;
      // Both pinned Appium drivers acknowledge native releaseActions as a
      // no-op. The completed POST's pointerUp is the actual touch release.
      await command("DELETE", "/actions");
      scroll.releaseActionsAcknowledged = true;
      scroll.releaseActionsNativeNoOp = true;
      await pause(350);
      const after = await measure();
      scroll.after = after;
      scroll.finishedAt = new Date().toISOString();
      scroll.targetMovementY = after.rect.y - before.rect.y;
      scroll.obstructionBefore = obstruction(before.rect, before.viewport);
      scroll.obstructionAfter = obstruction(after.rect, after.viewport);
      save();
      assert(
        after.clear ||
          (Math.abs(scroll.targetMovementY) >= 1 &&
            scroll.obstructionAfter < scroll.obstructionBefore - 1),
        "Native swipe made no measurable progress toward an unobstructed web control",
      );
      before = after;
    }
    assert(before.clear, "Web control remained obstructed after eight bounded native swipes");
    evidence.status = "clear";
    save();
    return evidence;
  } catch (error) {
    evidence.status = "failed";
    evidence.error = error.stack || String(error);
    save();
    throw error;
  }
}
