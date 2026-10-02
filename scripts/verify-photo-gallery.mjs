// Real HTTP uploads, authentication and browser UI against disposable PGlite only.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "BLOB_READ_WRITE_TOKEN",
  "BLOB_STORE_ID",
  "BETTER_AUTH_URL",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18228";
const endpoint = `${origin}/api/athlete-photos`;
const ownerToken = randomUUID();
const otherToken = randomUUID();
const owner = { authorization: `Bearer ${ownerToken}`, origin };
const other = { authorization: `Bearer ${otherToken}`, origin };
const server = await createServer({ server: { host: "127.0.0.1", port: 18228, strictPort: true } });
let database;
let browser;
let page;
await mkdir("artifacts", { recursive: true });
const form = (bytes, type = "image/png") => {
  const body = new FormData();
  body.append("photo", new File([bytes], "synthetic-photo.png", { type }));
  return body;
};
try {
  await server.listen();
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  await (await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts")).ensureAthrecsSeeded();
  for (const [id, token] of [
    ["gallery-owner", ownerToken],
    ["gallery-other", otherToken],
  ]) {
    await database.query(
      'insert into "user" (id,name,email,"emailVerified") values ($1,$2,$3,true)',
      [id, "Photo Test Athlete", `${id}@example.test`],
    );
    await database.query(
      'insert into session (id,token,"userId","expiresAt","updatedAt") values ($1,$2,$1,now()+interval \'1 hour\',now())',
      [id, token],
    );
  }
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(
    (token) => sessionStorage.setItem("grok-auth.bearer-token", token),
    ownerToken,
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/athlete-account?section=photo`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.getByRole("heading", { name: "Photos", exact: true }).waitFor({ timeout: 120000 });
  await page.getByText("Your photo gallery starts here", { exact: true }).waitFor();
  assert.equal(await page.locator("vite-error-overlay").count(), 0);
  const analytics = page.getByRole("button", { name: "No thanks", exact: true });
  if (await analytics.isVisible()) await analytics.click();

  // Browser-generated synthetic pixels: no real athlete data or external files.
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#155e75";
    ctx.fillRect(0, 0, 1800, 1200);
    ctx.fillStyle = "#ffffff";
    ctx.font = "90px sans-serif";
    ctx.fillText("Synthetic test photo", 180, 600);
    return canvas.toDataURL("image/png");
  });
  const png = Buffer.from(dataUrl.split(",")[1], "base64");
  for (const method of ["GET", "POST", "DELETE"]) {
    assert.equal((await fetch(endpoint, { method, headers: { origin } })).status, 401);
  }
  for (const badOrigin of ["https://example.test", origin.replace("http:", "https:")]) {
    assert.equal(
      (
        await fetch(endpoint, {
          method: "POST",
          headers: { ...owner, origin: badOrigin },
          body: form(png),
        })
      ).status,
      403,
    );
  }
  assert.equal(
    (
      await fetch(endpoint, {
        method: "POST",
        headers: { authorization: owner.authorization },
        body: form(png),
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(endpoint, {
        method: "POST",
        headers: owner,
        body: form("<svg/>", "image/svg+xml"),
      })
    ).status,
    400,
  );
  assert.equal(
    (await fetch(endpoint, { method: "POST", headers: owner, body: form("not an image") })).status,
    400,
  );
  assert.equal(
    (
      await fetch(endpoint, {
        method: "POST",
        headers: owner,
        body: form(Buffer.alloc(2 * 1024 * 1024 + 1)),
      })
    ).status,
    400,
  );

  await page.getByLabel("Choose gallery photos").setInputFiles([
    { name: "race.png", mimeType: "image/png", buffer: png },
    { name: "training.png", mimeType: "image/png", buffer: png },
  ]);
  await page.getByText("2 photos added to your gallery.", { exact: true }).waitFor();
  await page.getByRole("img", { name: "Your uploaded photo 1", exact: true }).waitFor();
  await page.getByRole("img", { name: "Your uploaded photo 2", exact: true }).waitFor();
  let response = await fetch(endpoint, { headers: owner });
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  const photos = (await response.json()).photos;
  assert.equal(photos.length, 2);
  assert.deepEqual((await (await fetch(endpoint, { headers: other })).json()).photos, []);
  const photoUrl = `${origin}${photos[0].url}`;
  for (const method of ["GET", "DELETE"]) {
    assert.equal((await fetch(photoUrl, { method, headers: other })).status, 404);
    assert.equal((await fetch(photoUrl, { method, headers: { origin } })).status, 401);
  }
  response = await fetch(photoUrl, { headers: owner });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const originalBytes = Buffer.from(await response.arrayBuffer());
  assert.equal(originalBytes.subarray(8, 12).toString(), "WEBP");
  assert.equal(
    (
      await database.query(
        "select storage_backend from athlete_gallery_photos where user_id='gallery-owner'",
      )
    ).rows.every((row) => row.storage_backend === "database"),
    true,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("img", { name: "Your uploaded photo 1", exact: true }).waitFor();
  await page.getByRole("img", { name: "Your uploaded photo 2", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("img", { name: "Your uploaded photo 1", exact: true })
      .evaluate((img) => img.naturalWidth),
    1600,
  );
  await page.screenshot({ path: "artifacts/account-photos-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    true,
  );
  await page.screenshot({ path: "artifacts/account-photos-mobile.png", fullPage: true });

  // Cancel is harmless; confirm deletes only the selected photo.
  const card = page.getByRole("article", { name: "Gallery photo 1", exact: true });
  await card.getByRole("button", { name: "Remove", exact: true }).click();
  await card.getByRole("button", { name: "Cancel", exact: true }).click();
  assert.equal((await (await fetch(endpoint, { headers: owner })).json()).photos.length, 2);
  await card.getByRole("button", { name: "Remove", exact: true }).click();
  await card.getByRole("button", { name: "Remove photo", exact: true }).click();
  await page.getByText("Photo removed.", { exact: true }).waitFor();
  assert.equal((await fetch(photoUrl, { headers: owner })).status, 404);
  assert.equal((await (await fetch(endpoint, { headers: owner })).json()).photos.length, 1);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("1 of 30 photos", { exact: true }).waitFor();

  // With two free slots, concurrent uploads cannot exceed the per-account quota.
  for (let slot = 1; slot <= 28; slot += 1) {
    await database.query(
      "insert into athlete_gallery_photos (id,user_id,slot,photo_bytes,storage_backend,content_type,byte_size) values ($1,'gallery-other',$2,$3,'database','image/png',$4)",
      [randomUUID(), slot, png, png.length],
    );
  }
  const concurrent = await Promise.all(
    Array.from({ length: 4 }, () =>
      fetch(endpoint, { method: "POST", headers: other, body: form(png) }),
    ),
  );
  assert.deepEqual(concurrent.map((item) => item.status).sort(), [201, 201, 409, 409]);
  assert.equal((await (await fetch(endpoint, { headers: other })).json()).photos.length, 30);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: multi-photo upload, resize, reload, desktop/mobile, cancel/remove, owner-only access, no-store headers, origin/file rejection and concurrent gallery limit.",
  );
} catch (error) {
  await page?.screenshot({ path: "artifacts/account-photos-failure.png", fullPage: true });
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
}
