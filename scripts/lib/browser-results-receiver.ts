import { queueBrowserCapture } from "../../src/lib/results-archive/browser-handoff";

const status = document.getElementById("status")!;
const next = document.getElementById("continue")!;
const token = location.hash.slice(1);
const sender = window.opener as Window | null;
let receiving = false;
if (!sender || !/^[a-f0-9-]{36}$/i.test(token)) {
  status.textContent =
    "Open a results page and use the Save results to AthRecs bookmark. You can also upload a saved results file in AthRecs.";
  next.hidden = false;
} else {
  const ready = () => sender.postMessage({ type: "athrecs-import-ready", token }, "*");
  const timer = window.setInterval(ready, 250);
  const timeout = window.setTimeout(() => {
    clearInterval(timer);
    if (!receiving)
      status.textContent =
        "The transfer did not arrive. Return to the results page and try Send to AthRecs again, or download the file there.";
  }, 30000);
  window.addEventListener("message", async (event: MessageEvent) => {
    if (
      receiving ||
      event.source !== sender ||
      event.data?.type !== "athrecs-import-capture" ||
      event.data.token !== token ||
      typeof event.data.json !== "string"
    )
      return;
    try {
      if (event.data.json.length > 25 * 1024 * 1024) throw new Error("Capture exceeds 25 MB.");
      const source = new URL(JSON.parse(event.data.json).page.url);
      if (source.protocol !== "https:" || source.origin !== event.origin) return;
      receiving = true;
      clearInterval(timer);
      clearTimeout(timeout);
      const capture = await queueBrowserCapture(token, event.data.json, event.data.collection);
      status.textContent = `${capture.rows.toLocaleString()} rows received from ${capture.title || source.hostname}. Continue to sign in and review this import. Nothing has been added to the results database yet.`;
      if (capture.collection)
        status.textContent += ` This starts a ${capture.collection.totalPages}-page collection for ${capture.collection.filterLabel} after you confirm the race. Keep both tabs open.`;
      next.setAttribute("href", `/admin/result-archive#import=${token}`);
      next.hidden = false;
      sender.postMessage({ type: "athrecs-import-received", token }, event.origin);
      if (!capture.collection) window.opener = null;
      history.replaceState(null, "", location.pathname);
    } catch (error) {
      receiving = true;
      clearInterval(timer);
      clearTimeout(timeout);
      status.textContent =
        error instanceof Error
          ? error.message
          : "Transfer failed. Download the capture from the results page instead.";
      sender.postMessage({ type: "athrecs-import-error", token }, event.origin);
    }
  });
  ready();
}
