import assert from "node:assert/strict";
import test from "node:test";
import {
  clearViewport,
  rectIsClear,
  snapshotObstacles,
  snapshotFromXml,
  ensureNativeControlClear,
} from "./ios-safari-clear-control.mjs";

const screen = { x: 0, y: 0, width: 402, height: 874 };
const navigation = { x: 0, y: 659, width: 402, height: 117 };
const button = { x: 46, y: 737, width: 294, height: 44 };
const node = (type, rect, label, children = [], isVisible = "1") => ({
  type,
  rect,
  label,
  children,
  isVisible,
});
const snapshot = () =>
  node("Application", screen, "Safari", [
    node("WebView", screen, "", [
      node("Other", navigation, "Primary, navigation"),
      node("Button", button, "More sharing options"),
    ]),
    node("Button", { x: 32, y: 793, width: 48, height: 48 }, "Back"),
    node("Button", { x: 0, y: 300, width: 48, height: 48 }, "Hidden", [], "0"),
  ]);

test("the observed failed share tap is rejected despite visible/hittable flags", () => {
  const { screen, navigation, safariChrome } = snapshotObstacles(snapshot());
  const viewport = clearViewport(screen, navigation, safariChrome);
  assert.equal(rectIsClear(button, viewport), false);
  assert.equal(rectIsClear({ ...button, y: 390 }, viewport), true);
  assert.equal(safariChrome.length, 1, "web buttons and string-zero visibility are excluded");
});

test("landscape toolbar and navigation leave a bounded safe band", () => {
  const viewport = clearViewport(
    { x: 0, y: 0, width: 874, height: 402 },
    { x: 0, y: 320, width: 874, height: 82 },
    [{ x: 0, y: 0, width: 874, height: 60 }],
  );
  assert(rectIsClear({ x: 200, y: 150, width: 300, height: 44 }, viewport));
  assert(!rectIsClear({ x: 200, y: 275, width: 300, height: 44 }, viewport));
  assert(!rectIsClear({ x: -1, y: 150, width: 300, height: 44 }, viewport));
});

test("missing/ambiguous navigation and malformed snapshots fail closed", () => {
  const missing = snapshot();
  missing.children[0].children.shift();
  assert.throws(() => snapshotObstacles(missing), /one visible Primary/);
  const duplicate = snapshot();
  duplicate.children.push(node("Other", navigation, "Primary"));
  assert.throws(() => snapshotObstacles(duplicate), /one visible Primary/);
  assert.throws(() => snapshotObstacles({ ...snapshot(), isVisible: "0" }), /visible/);
  assert.throws(() => clearViewport(screen, { ...navigation, y: 100 }), /No central/);
});

function harness({ moves = true, initialY = button.y } = {}) {
  let y = initialY;
  const calls = [],
    records = [];
  const key = "element-6066-11e4-a52e-4f735466cecf";
  const control = {
    element: { [key]: "share-button" },
    label: "More sharing options",
    type: "XCUIElementTypeButton",
  };
  return {
    calls,
    records,
    args: {
      control,
      record: (value) => records.push(structuredClone(value)),
      attribute: async (_, name) => (name === "type" ? control.type : control.label),
      mobile: async (name) => {
        if (name === "activeAppInfo") return { bundleId: "com.apple.mobilesafari" };
        throw Error("Unexpected native operation: " + name);
      },
      command: async (method, route, body) => {
        calls.push({ method, route, body });
        if (route === "/context") return "NATIVE_APP";
        if (route === "/source") return xml(snapshot());
        if (route.endsWith("/rect")) return { ...button, y };
        if (route === "/actions" && method === "POST") {
          const actions = body.actions[0].actions;
          assert.equal(actions.at(-1).type, "pointerUp");
          assert.equal(actions[3].type, "pointerMove");
          assert(actions[3].duration >= 450);
          if (moves) y -= 200;
          return null;
        }
        if (route === "/actions" && method === "DELETE") return null;
        throw Error("Unexpected command: " + method + " " + route);
      },
    },
  };
}

test("covered control is scrolled into view with a released native drag, never tapped", async () => {
  const h = harness();
  const result = await ensureNativeControlClear(h.args);
  assert.equal(result.status, "clear");
  assert.equal(result.scrolls.length, 1);
  assert(result.scrolls[0].targetMovementY < 0);
  assert.equal(result.scrolls[0].pointerSequenceCompleted, true);
  assert(h.calls.every((call) => !call.route.endsWith("/click")));
});

test("an ineffective drag fails without repeated taps or a false pass", async () => {
  const h = harness({ moves: false });
  await assert.rejects(ensureNativeControlClear(h.args), /no measurable progress/);
  assert.equal(
    h.calls.filter((call) => call.route === "/actions" && call.method === "POST").length,
    1,
  );
  assert.equal(h.records.at(-1).status, "failed");
});

test("already-clear controls require no scroll or synthetic activation", async () => {
  const h = harness({ initialY: 390 });
  assert.equal((await ensureNativeControlClear(h.args)).status, "clear");
  assert(h.calls.every((call) => call.method === "GET"));
});

function xml(root) {
  const escape = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;");
  const render = (n) =>
    `<XCUIElementType${n.type} name="${escape(n.label)}" label="${escape(n.label)}" visible="${n.isVisible === "1" ? "true" : "false"}" ${Object.entries(
      n.rect,
    )
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ")}>${n.children.map(render).join("")}</XCUIElementType${n.type}>`;
  return `<AppiumAUT>${render(root)}</AppiumAUT>`;
}

test("native XML preserves geometry, visibility and escaped labels", () => {
  const input = snapshot();
  input.children[1].label = 'Back & "more"';
  const parsed = snapshotObstacles(snapshotFromXml(xml(input)));
  assert.deepEqual(parsed.navigation, navigation);
  assert.equal(parsed.safariChrome.length, 1);
  assert.equal(parsed.safariChrome[0].label, 'Back & "more"');
  assert.throws(() => snapshotFromXml("<!DOCTYPE x><x/>"), /document type/);
});
