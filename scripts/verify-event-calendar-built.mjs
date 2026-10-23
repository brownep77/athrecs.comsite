import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import app from "../.vercel/output/functions/__server.func/index.mjs";
const staticRoot = path.resolve(".vercel/output/static");
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1:8128");
    const file = path.resolve(staticRoot, "." + decodeURIComponent(url.pathname));
    if (file.startsWith(staticRoot + "/") && fs.existsSync(file) && fs.statSync(file).isFile()) {
      const types = {
        ".js": "text/javascript",
        ".css": "text/css",
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
        ".png": "image/png",
      };
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      });
      res.end(fs.readFileSync(file));
      return;
    }
    const body = [];
    for await (const chunk of req) body.push(chunk);
    const response = await app.fetch(
      new Request(url, {
        method: req.method,
        headers: req.headers,
        ...(body.length ? { body: Buffer.concat(body) } : {}),
      }),
      {},
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    console.error(e.message);
    res.writeHead(500);
    res.end("Error");
  }
});
await new Promise((resolve) => server.listen(8128, "127.0.0.1", resolve));
const browser = await chromium.launch({
  executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE || undefined,
  headless: true,
});
try {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 390, height: 844 },
      acceptDownloads: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of ["/races/holkham-half-10k", "/running/races/great-north-run"]) {
      const response = await page.goto("http://127.0.0.1:8128" + route);
      assert.equal(response.status(), 200, route);
      const summary = page.locator('summary[aria-label$="to calendar"]').first();
      await summary.click();
      const choices = page.locator('details[open] [role="group"]');
      assert(await choices.isVisible());
      for (const name of ["Google Calendar", "Outlook.com", "Microsoft 365"])
        assert(await choices.getByRole("link", { name, exact: true }).isVisible());
      const dates = new URL(
        await choices
          .getByRole("link", { name: "Google Calendar", exact: true })
          .getAttribute("href"),
      ).searchParams.get("dates");
      const pending = page.waitForEvent("download");
      await choices.getByRole("button", { name: "Apple Calendar", exact: true }).click();
      const download = await pending;
      const text = fs.readFileSync(await download.path(), "utf8");
      assert.match(text, /BEGIN:VCALENDAR/);
      assert(
        text.includes(
          "DTSTART" + (dates.includes("T") ? ":" : ";VALUE=DATE:") + dates.split("/")[0],
        ),
      );
      assert(await choices.isVisible(), "Download leaves race choices available");
      await page.screenshot({
        path:
          "artifacts/calendar-built-" +
          (javaScriptEnabled ? "js" : "no-js") +
          "-" +
          (route.includes("/races/holkham") ? "race" : "guide") +
          ".png",
      });
      console.log(
        "PASS built route:",
        route,
        "JavaScript:",
        javaScriptEnabled,
        "dates:",
        dates,
        "download:",
        download.suggestedFilename(),
      );
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
