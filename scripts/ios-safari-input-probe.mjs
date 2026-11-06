import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { setTimeout as pause } from "node:timers/promises";

const elementKey = "element-6066-11e4-a52e-4f735466cecf";
const bundleId = "com.apple.mobilesafari";
const isTrue = (value) => value === true || value === "true" || value === 1;

function fixture(token) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Native Safari input probe</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px; font: 16px system-ui, sans-serif; color: #172b36; }
  h1 { font-size: 18px; margin: 0 0 20px; }
  button, summary { min-height: 44px; }
  #probe-button { display: block; padding: 8px 16px; margin: 0 0 20px;
    border: 1px solid #0369a1; border-radius: 6px; background: #f0f9ff; color: #0c4a6e; }
  .actions { display: flex; min-width: 0; flex-wrap: wrap; align-items: flex-start; gap: 8px; height: 200px; }
  .calendar-look { display: inline-flex; width: 188px; min-height: 44px; align-items: center;
    justify-content: center; padding: 8px; border-radius: 6px; background: #7000ef; color: white; font-size: 14px; }
  details { min-width: 0; max-width: 100%; }
  summary { display: inline-flex; min-height: 44px; cursor: pointer; list-style: none;
    align-items: center; justify-content: center; gap: 8px; border-radius: 6px;
    border: 1px solid #0369a1; background: #f0f9ff; padding: 8px 16px;
    font-size: 14px; font-weight: 500; color: #0c4a6e; }
  summary::-webkit-details-marker { display: none; }
  summary svg { width: 16px; height: 16px; flex-shrink: 0; }
  details[open] .chevron { transform: rotate(180deg); }
  #probe-menu { width: 320px; max-width: 100%; margin-top: 12px; padding: 12px; border: 1px solid #b9cbd1; border-radius: 12px; }
  #readout { height: 140px; overflow: hidden; white-space: pre-wrap; font: 12px monospace;
    border: 1px solid #b9cbd1; padding: 10px; margin: 0; }
</style></head><body>
<h1>Native Safari input probe</h1>
<button id="probe-button" type="button" aria-label="Native input button ${token}">Probe button</button>
<div class="actions">
<div class="calendar-look" aria-hidden="true">Add to calendar</div>
<details id="probe-details">
  <summary id="probe-summary" aria-label="Share native input ${token}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
    </svg> Share
    <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </summary>
  <div id="probe-menu" role="group" aria-label="Probe sharing options">Probe menu is open</div>
</details>
</div>
<pre id="readout" aria-label="Native input event readout">Waiting for input</pre>
<script>
(() => {
  const token = ${JSON.stringify(token)};
  const button = document.getElementById("probe-button");
  const details = document.getElementById("probe-details");
  const summary = document.getElementById("probe-summary");
  const readout = document.getElementById("readout");
  const events = [];
  const counts = {};
  let eventOverflow = false;
  let sequence = 0;
  let buttonActivations = 0;
  function rect(element) {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }
  function publish() {
    const state = { token, sequence: ++sequence, ready: true, href: location.href,
      at: performance.now(), events: events.slice(), counts, eventOverflow, buttonActivations,
      detailsOpen: details.open, scroll: { x: scrollX, y: scrollY },
      rects: { button: rect(button), summary: rect(summary) } };
    readout.textContent = "Clicks: " + (counts.click || 0) +
      "\\nTrusted clicks: " + events.filter(e => e.type === "click" && e.isTrusted).length +
      "\\nButton activations: " + buttonActivations + "\\nDetails open: " + details.open +
      "\\nLast: " + (events.at(-1)?.type || "ready");
    fetch("/telemetry/" + token, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state), keepalive: true }).catch(() => {});
  }
  function observe(event) {
    const target = event.target instanceof Element ? event.target : null;
    const point = event.changedTouches?.[0] || event;
    counts[event.type] = (counts[event.type] || 0) + 1;
    if (events.length >= 100) eventOverflow = true;
    else events.push({ type: event.type, isTrusted: event.isTrusted,
      timeStamp: event.timeStamp, observedAt: performance.now(),
      target: { tag: target?.tagName || null, id: target?.id || null,
        controlId: target?.closest("#probe-button,#probe-summary")?.id || null },
      clientX: Number.isFinite(point.clientX) ? point.clientX : null,
      clientY: Number.isFinite(point.clientY) ? point.clientY : null,
      pointerType: event.pointerType || null, detail: event.detail ?? null,
      defaultPrevented: event.defaultPrevented, detailsOpen: details.open,
      scroll: { x: scrollX, y: scrollY }, summaryRect: rect(summary) });
    // Observe the browser's completed default action without changing it.
    setTimeout(publish, 0);
  }
  for (const type of ["pointerdown", "pointerup", "pointercancel", "touchstart", "touchend",
    "touchcancel", "mousedown", "mouseup", "click"]) {
    document.addEventListener(type, observe, { capture: true, passive: true });
  }
  details.addEventListener("toggle", observe);
  button.addEventListener("click", () => { buttonActivations++; });
  publish();
})();
</script></body></html>`;
}

async function waitFor(label, read, timeout = 15000) {
  const deadline = Date.now() + timeout;
  do {
    const value = await read();
    if (value) return value;
    await pause(200);
  } while (Date.now() < deadline);
  throw Error(`Native input probe timed out: ${label}`);
}

/**
 * All browser interaction stays in NATIVE_APP. The loopback page reports its own
 * DOM events; no web context, injected browser command, or production mutation
 * is used. Element-click failures are diagnostic. Both coordinate cases must
 * prove exactly one trusted click and their expected native default behavior.
 *
 * `phase(label)` marks progress; `record(report)` persists incremental evidence.
 * Screenshot/source helpers receive artifact labels, as in the native suite.
 */
export async function verifyNativeSafariInput({
  mobile,
  command,
  find,
  attribute,
  describe,
  showControl,
  screenshot,
  saveSource,
  record = () => {},
  phase = () => {},
}) {
  const report = {
    status: "running",
    startedAt: new Date().toISOString(),
    coverage: "Trusted DOM input delivery on a fresh loopback fixture only",
    productionDOMEventsVerified: false,
    cases: [],
  };
  const liveCases = new Map();
  const server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const match = /^\/(fixture|telemetry)\/([a-f0-9-]+)$/.exec(url.pathname);
    const current = match && liveCases.get(match[2]);
    if (!current) {
      response.writeHead(404).end();
      return;
    }
    if (match[1] === "fixture" && request.method === "GET") {
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'",
      );
      response.end(fixture(match[2]));
      return;
    }
    if (match[1] !== "telemetry" || request.method !== "POST") {
      response.writeHead(405).end();
      return;
    }
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 128000) request.destroy();
    });
    request.on("end", () => {
      try {
        const update = JSON.parse(body);
        assert.equal(update.token, match[2]);
        assert.equal(update.href, current.url);
        assert(Number.isInteger(update.sequence) && update.sequence > 0);
        assert(Array.isArray(update.events) && update.events.length <= 100);
        if (!current.latest || update.sequence > current.latest.sequence) {
          current.latest = update;
          current.receivedAt = new Date().toISOString();
        }
        response.writeHead(204).end();
      } catch {
        response.writeHead(400).end();
      }
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  report.origin = origin;

  async function capture(test, moment) {
    const label = `input-${test.method}-${test.target}-${moment}`;
    for (const [kind, action] of [
      ["screenshot", () => screenshot(label, "PORTRAIT")],
      ["accessibility XML", () => saveSource(label)],
    ]) {
      try {
        const result = await action();
        test.artifacts.push({
          kind,
          label,
          status: "fulfilled",
          ...(kind === "screenshot" ? { size: result } : {}),
        });
      } catch (error) {
        test.artifacts.push({ kind, label, status: "rejected", error: String(error) });
      }
    }
    await record(report);
  }

  try {
    await record(report);
    await command("POST", "/orientation", { orientation: "PORTRAIT" });
    assert.equal(await command("GET", "/orientation"), "PORTRAIT");
    assert.equal(await command("GET", "/context"), "NATIVE_APP");
    for (const method of ["element", "coordinate"]) {
      for (const target of ["button", "summary"]) {
        const token = randomUUID();
        const current = { url: `${origin}/fixture/${token}`, latest: null };
        liveCases.set(token, current);
        const test = { method, target, token, url: current.url, artifacts: [], passed: false };
        report.cases.push(test);
        await phase(`Native input probe: ${method} ${target}`);
        await record(report);
        try {
          await mobile("deepLink", { url: current.url, bundleId });
          await waitFor("fresh fixture telemetry", () => current.latest?.ready);
          const label =
            target === "button" ? `Native input button ${token}` : `Share native input ${token}`;
          const matches = await waitFor("unique fixture control", async () => {
            const found = await find(
              `(name == ${JSON.stringify(label)} OR label == ${JSON.stringify(label)}) AND enabled == true`,
            );
            if (!found.length) return null;
            assert.equal(found.length, 1, "Fixture control must have one exact native match");
            return found;
          });
          const control = await describe(matches[0]);
          assert.equal(control.type, "XCUIElementTypeButton");
          test.control = await showControl(control, { hittable: true });
          await capture(test, "before");
          const element = control.element[elementKey];
          assert(
            isTrue(await attribute(control.element, "hittable")),
            "Fixture target lost hittability",
          );
          const rect = await command("GET", `/element/${element}/rect`);
          assert([rect.x, rect.y, rect.width, rect.height].every(Number.isFinite));
          assert(rect.width > 0 && rect.height > 0);
          const point = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          assert(point.x >= 0 && point.y >= 0);
          test.before = structuredClone(current.latest);
          assert.equal(test.before.counts.click || 0, 0, "Fresh page already received a click");
          assert.equal(test.before.buttonActivations, 0);
          assert.equal(test.before.detailsOpen, false);
          test.action = { method, rect, point, startedAt: new Date().toISOString() };
          await record(report);
          try {
            if (method === "element") await command("POST", `/element/${element}/click`, {});
            else await mobile("tap", point);
          } catch (error) {
            test.action.error = String(error);
          }
          test.action.finishedAt = new Date().toISOString();
          try {
            await waitFor(
              "telemetry after the single action",
              () => current.latest?.events?.some((event) => event.type === "click"),
              10000,
            );
            await pause(300);
          } catch (error) {
            test.telemetryError = String(error);
          }
        } catch (error) {
          test.error = String(error);
        } finally {
          // Always retain both routes' evidence. Never retap a failed case.
          await capture(test, "after");
          test.after = current.latest ? structuredClone(current.latest) : null;
          test.telemetryReceivedAt = current.receivedAt;
          const clicks = test.after?.events?.filter((event) => event.type === "click") || [];
          test.exactSingleTrustedClick =
            !test.after?.eventOverflow &&
            test.after?.counts?.click === 1 &&
            clicks.length === 1 &&
            clicks[0].isTrusted === true &&
            clicks[0].target.controlId === `probe-${target}`;
          test.expectedState =
            target === "button"
              ? test.after?.buttonActivations === 1 && test.after?.detailsOpen === false
              : test.after?.detailsOpen === true && test.after?.buttonActivations === 0;
          test.passed =
            !test.error &&
            !test.action?.error &&
            !!test.action &&
            test.exactSingleTrustedClick &&
            test.expectedState &&
            test.artifacts.length === 4 &&
            test.artifacts.every((artifact) => artifact.status === "fulfilled");
          await record(report);
        }
      }
    }
    report.coordinateDeliveryVerified =
      report.cases.filter((test) => test.method === "coordinate").length === 2 &&
      report.cases.filter((test) => test.method === "coordinate").every((test) => test.passed);
    report.elementClickDeliveryVerified = report.cases
      .filter((test) => test.method === "element")
      .every((test) => test.passed);
    report.status = report.coordinateDeliveryVerified ? "passed" : "failed";
    report.finishedAt = new Date().toISOString();
    await record(report);
    assert(
      report.coordinateDeliveryVerified,
      "Native coordinate input probe failed; production taps are not verified",
    );
    return report;
  } catch (error) {
    report.status = "failed";
    report.failure = String(error);
    report.finishedAt = new Date().toISOString();
    await record(report);
    throw error;
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
