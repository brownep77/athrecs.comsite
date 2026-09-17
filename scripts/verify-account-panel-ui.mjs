// Render the actual account route against disposable local storage. Never use
// deployment credentials or a real user's account for this layout regression.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "playwright";

process.env.DATABASE_URL = "";
process.env.DATABASE_URL_UNPOOLED = "";
process.env.POSTGRES_URL_NON_POOLING = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "false";
process.env.VITE_SITE_BRAND = process.argv.includes("--runrecs") ? "runrecs" : "athrecs";
const origin = "http://127.0.0.1:18227";
process.env.BETTER_AUTH_URL = origin;
const server = await createServer({ server: { host: "127.0.0.1", port: 18227, strictPort: true } });
let browser;
let database;
try {
  await server.listen();
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByRole("heading", { name: "Identity and Entry Passport", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("heading", { name: "Potential results matching your name", exact: true })
      .count(),
    1,
  );
  assert.equal(
    await page.getByRole("heading", { name: "Public result sites", exact: true }).count(),
    1,
  );
  assert.deepEqual(errors, []);
  console.log(`${process.env.VITE_SITE_BRAND}: one results-matching panel on the account page.`);
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
}
