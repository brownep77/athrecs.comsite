// Real routes, authentication, PostgreSQL migrations and UI; disposable PGlite only.
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");

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
process.env.ATHRECS_STAFF_EMAILS = "certificate-staff@example.test";
const origin = "http://127.0.0.1:18231";
const endpoint = `${origin}/api/result-certificates?result=990101`;
const tokens = Object.fromEntries(["owner", "other", "staff"].map((role) => [role, randomUUID()]));
const headers = (role = "owner") => ({ authorization: `Bearer ${tokens[role]}`, origin });
const pdf = Buffer.from(
  "%PDF-1.4\n% Synthetic certificate fixture, no real athlete information.\n%%EOF",
);
const form = (bytes = pdf, type = "application/pdf") => {
  const body = new FormData();
  body.append("certificate", new File([bytes], "synthetic-certificate.pdf", { type }));
  return body;
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18231, strictPort: true } });
let database, browser, page;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  await (await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts")).ensureAthrecsSeeded();
  const sql = await db.getSql();
  for (const role of Object.keys(tokens)) {
    const id = `certificate-${role}`;
    await sql`insert into "user" (id,name,email,"emailVerified") values (${id},'Certificate Test Athlete',${`${id}@example.test`},true)`;
    await sql`insert into session (id,token,"userId","expiresAt","updatedAt") values (${id},${tokens[role]},${id},now()+interval '1 hour',now())`;
  }
  await sql`insert into account (id,"accountId","providerId","userId","updatedAt") values ('certificate-staff','synthetic-google-id','google','certificate-staff',now())`;
  await database.exec(`
    insert into athletes (id,slug,display_name,profile_visibility) values (990101,'certificate-test-athlete','Certificate Test Athlete','private');
    insert into events (id,slug,name,sport,country) values (990101,'certificate-test-marathon','Certificate Test Marathon','Running','United Kingdom');
    insert into editions (id,event_id,event_date,distance_code,distance_km) values (990101,990101,'2025-01-01','Marathon',42.195),(990102,990101,'2025-02-01','Marathon',42.195);
    insert into results (id,edition_id,athlete_id,status,finish_time_seconds,result_details) values (990101,990101,990101,'finished',14400,'{"verificationStatus":"unverified"}');
    insert into athlete_account_links(athlete_id,user_id,user_email,status) values(990101,'certificate-owner','certificate-owner@example.test','active');
  `);
  const revision = (await server.ssrLoadModule("/src/lib/athrecs/profile-revision.server.ts"))
    .linkedProfileRevision;
  const initialRevision = await revision(sql, "certificate-owner");
  assert.equal(await revision(sql, "certificate-owner"), initialRevision);
  const otherRevision = await revision(sql, "certificate-other");
  for (const method of ["GET", "POST", "DELETE"])
    assert.equal((await fetch(endpoint, { method })).status, 401);
  assert.equal((await fetch(endpoint, { headers: headers("other") })).status, 404);
  assert.equal((await fetch(`${endpoint}&staff=1`, { headers: headers() })).status, 403);
  assert.equal(
    (
      await fetch(endpoint, {
        method: "POST",
        headers: { ...headers(), origin: "https://example.test" },
        body: form(),
      })
    ).status,
    403,
  );
  for (const [bytes, type] of [
    ["bad PDF", "application/pdf"],
    ["<svg/>", "image/svg+xml"],
    [Buffer.alloc(2097153), "application/pdf"],
  ]) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers(),
      body: form(bytes, type),
    });
    assert.ok([400, 413].includes(response.status));
  }
  const uploaded = await fetch(endpoint, { method: "POST", headers: headers(), body: form() });
  assert.equal(uploaded.status, 201, await uploaded.clone().text());
  const { id } = await uploaded.json();
  const fileUrl = `${endpoint}&certificate=${id}`;
  const saved = await fetch(fileUrl, { headers: headers() });
  assert.deepEqual(
    Buffer.from(await saved.arrayBuffer()),
    pdf,
    "Original bytes must survive storage unchanged",
  );
  assert.match(saved.headers.get("content-disposition"), /^attachment;/);
  assert.match(saved.headers.get("cache-control"), /private.*no-store/);
  assert.equal(saved.headers.get("x-content-type-options"), "nosniff");
  for (const method of ["GET", "DELETE"])
    assert.equal((await fetch(fileUrl, { method, headers: headers("other") })).status, 404);
  const staffList = await (
    await fetch(`${endpoint}&staff=1`, { headers: headers("staff") })
  ).json();
  assert.equal(staffList.certificates[0].sha256, createHash("sha256").update(pdf).digest("hex"));
  assert.equal((await fetch(`${fileUrl}&staff=1`, { headers: headers("staff") })).status, 200);
  assert.equal(
    (await fetch(`${fileUrl}&staff=1`, { method: "DELETE", headers: headers("staff") })).status,
    403,
  );
  assert.equal(
    (await fetch(endpoint, { method: "POST", headers: headers(), body: form() })).status,
    409,
  );
  assert.equal(
    await revision(sql, "certificate-owner"),
    initialRevision,
    "Uploading a certificate must not verify or change a result",
  );
  // Concurrent uploads cannot exceed the quota.
  const concurrent = await Promise.all(
    Array.from({ length: 7 }, (_, i) =>
      fetch(endpoint, {
        method: "POST",
        headers: headers(),
        body: form(Buffer.concat([pdf, Buffer.from(String(i))])),
      }),
    ),
  );
  assert.equal(concurrent.filter((r) => r.status === 201).length, 4);
  assert.equal(concurrent.filter((r) => r.status === 409).length, 3);
  assert.equal(
    (await (await fetch(endpoint, { headers: headers() })).json()).certificates.length,
    5,
  );
  await sql`delete from athlete_result_certificates where id <> ${id}`;

  console.log(
    "PASS: API privacy, staff access, file validation, byte preservation and concurrent quota checks.",
  );
  browser = await (process.env.ATHRECS_TEST_BROWSER === "webkit" ? webkit : chromium).launch({
    headless: true,
    executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE || undefined,
    args:
      process.env.ATHRECS_TEST_BROWSER === "webkit"
        ? []
        : ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(
    (token) => sessionStorage.setItem("grok-auth.bearer-token", token),
    tokens.owner,
  );
  await page.goto(`${origin}/athlete-account?section=races`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.getByRole("button", { name: "Certificates", exact: true }).click();
  await page.getByText("synthetic-certificate.pdf", { exact: true }).waitFor();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  assert.equal((await download).suggestedFilename(), "synthetic-certificate.pdf");
  await page.getByLabel("Add certificate", { exact: true }).setInputFiles({
    name: "second-certificate.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.concat([pdf, Buffer.from("new")]),
  });
  await page.getByText("Certificate saved privately.", { exact: true }).waitFor();
  await page.getByText("second-certificate.pdf", { exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/result-certificates-mobile.png", fullPage: true });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
    false,
  );
  const secondCertificate = page
    .locator("li")
    .filter({ has: page.getByText("second-certificate.pdf", { exact: true }) });
  await secondCertificate.getByRole("button", { name: "Remove", exact: true }).click();
  await secondCertificate.getByRole("button", { name: "Confirm removal", exact: true }).click();
  await page.getByText("Certificate removed.", { exact: true }).waitFor();
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.getByRole("link", { name: "PBs & achievements", exact: true }).click();
  const marathonCount = page
    .locator("summary")
    .filter({ hasText: /Marathons/ })
    .locator("strong");
  await marathonCount.filter({ hasText: /^1$/ }).waitFor();
  await sql`insert into results (id,edition_id,athlete_id,status,finish_time_seconds,result_details)
    values (990102,990102,990101,'finished',14000,'{"verificationStatus":"unverified"}')`;
  assert.notEqual(await revision(sql, "certificate-owner"), initialRevision);
  assert.equal(
    await revision(sql, "certificate-other"),
    otherRevision,
    "Other accounts must not receive result activity",
  );
  // No navigation, click or manual refresh: the next revision poll updates the open board.
  await marathonCount.filter({ hasText: /^2$/ }).waitFor({ timeout: 75000 });
  const beforeVerification = await revision(sql, "certificate-owner");
  await sql`update results set result_details='{"verificationStatus":"source_verified"}' where id=990102`;
  assert.notEqual(await revision(sql, "certificate-owner"), beforeVerification);
  const beforeDq = await revision(sql, "certificate-owner");
  await sql`update results set status='DQ' where id=990102`;
  assert.notEqual(await revision(sql, "certificate-owner"), beforeDq);
  // Focus revalidation picks up changed eligibility without waiting for the poll.
  await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await marathonCount.filter({ hasText: /^1$/ }).waitFor({ timeout: 75000 });
  const beforeHidden = await revision(sql, "certificate-owner");
  await sql`insert into athlete_profile_hidden_results(user_id,result_id) values('certificate-owner',990101)`;
  assert.notEqual(await revision(sql, "certificate-owner"), beforeHidden);
  // Source-history results use negative IDs and must get the same private storage and refresh.
  const beforeSource = await revision(sql, "certificate-owner");
  await sql`insert into source_history_claim_results(id,athlete_id,provider,external_id,source_key,source_url,performance,available)
    values(990103,990101,'Synthetic certificate test','synthetic','row-1','https://example.test/result',
      '{"meeting":"Synthetic Source Race","date":"2024-01-01","discipline":"10K","performance":"45:00","place":"3","verificationStatus":"unverified"}',true)`;
  assert.notEqual(await revision(sql, "certificate-owner"), beforeSource);
  const sourceEndpoint = `${origin}/api/result-certificates?result=-990103`;
  const sourceUpload = await fetch(sourceEndpoint, {
    method: "POST",
    headers: headers(),
    body: form(),
  });
  assert.equal(sourceUpload.status, 201);
  const sourceCertificate = (await sourceUpload.json()).id;
  assert.equal(
    (
      await fetch(`${sourceEndpoint}&certificate=${sourceCertificate}`, {
        method: "DELETE",
        headers: headers(),
      })
    ).status,
    200,
  );
  assert.equal(
    (await fetch(`${sourceEndpoint}&certificate=${sourceCertificate}`, { headers: headers() }))
      .status,
    404,
  );
  const beforeDeletion = await revision(sql, "certificate-owner");
  await sql`delete from results where id=990102`;
  assert.notEqual(await revision(sql, "certificate-owner"), beforeDeletion);
  await sql`update athlete_account_links set status='revoked' where athlete_id=990101`;
  assert.equal((await fetch(fileUrl, { headers: headers() })).status, 404);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: certificate privacy, original bytes, staff access, quotas, upload/download UI and automatic achievement refresh.",
  );
} catch (error) {
  if (page)
    await page
      .screenshot({ path: "artifacts/result-certificates-failure.png", fullPage: true })
      .catch(() => {});
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
}
