// Complete staff registrations flow using synthetic data and disposable PGlite.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { chromium } from "playwright";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_CLAIMS_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.ATHRECS_STAFF_EMAILS = "staff@example.test";
process.env.BETTER_AUTH_SECRET = "registration-test-only-secret-at-least-32-chars";
const origin = "http://127.0.0.1:18239";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18239, strictPort: true } });
let database, browser;
let lastHeaders;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(origin), `No external calls in this test: ${new URL(url).origin}`);
  const response = await realFetch(input, init);
  if (url.includes("/_serverFn/")) lastHeaders = response.headers;
  return response;
};
const modules = new Map();
async function rpc(file, name, data, token, headers = {}) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file),
    start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} real RPC exists`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      context: {},
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
const read = (data = {}, token, headers = {}) =>
  rpc("athrecs/registrations-api", "listRegisteredAthletes", data, token, headers);
async function post(path, body, token) {
  const response = await fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const staff = await post("sign-up/email", {
    name: "Synthetic Staff",
    email: "staff@example.test",
    password: "Registration-test-password!",
  });
  assert.equal(staff.status, 200);
  const token = staff.body.token,
    userId = staff.body.user.id;
  await assert.rejects(
    () => read({}, token),
    /Forbidden/,
    "Allowlisted password account is not a staff Google identity",
  );
  await sql`insert into account (id,"accountId","providerId","userId","createdAt","updatedAt") values ('synthetic-google','synthetic-google','google',${userId},now(),now())`;
  await sql`update "user" set "emailVerified"=true where id=${userId}`;
  const before = await read({ q: "staff@example.test" }, token);
  assert.equal(before.total, 1);
  assert.equal(
    before.accounts[0].profileSavedAt,
    null,
    "Account without completed profile is visible",
  );
  assert.equal(before.accounts[0].signInCount, 1, "Signup session counted once");
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  assert(lastHeaders.get("vary").includes("Authorization"));
  assert.equal(before.accounts[0].signedUpAt.slice(0, 10), new Date().toISOString().slice(0, 10));
  const recorded = before.accounts[0].signInCount;
  await post("sign-in/email", { email: "staff@example.test", password: "wrong" });
  await fetch(`${origin}/api/auth/get-session`, { headers: { authorization: `Bearer ${token}` } });
  await sql`update session set "updatedAt"=now(),"expiresAt"=now()+interval '7 days' where "userId"=${userId}`;
  assert.equal(
    (await read({ q: "staff@example.test" }, token)).accounts[0].signInCount,
    recorded,
    "Failure, reads and refresh do not increment",
  );
  const second = await post("sign-in/email", {
    email: "staff@example.test",
    password: "Registration-test-password!",
  });
  assert.equal(second.status, 200);
  await post("sign-out", {}, second.body.token);
  assert.equal(
    (await read({ q: "staff@example.test" }, token)).accounts[0].signInCount,
    2,
    "Count survives logout",
  );
  await assert.rejects(
    () =>
      sql.transaction(async (tx) => {
        await tx`insert into session(id,"expiresAt",token,"updatedAt","userId") values('rolled-back',now()+interval '1 day','rolled-back',now(),${userId})`;
        throw new Error("rollback test");
      }),
    /rollback test/,
  );
  assert.equal(
    (await read({ q: "staff@example.test" }, token)).accounts[0].signInCount,
    2,
    "Rolled-back session does not count",
  );
  await assert.rejects(() => read({}), /Unauthorized/);
  assert.equal(
    lastHeaders.get("cache-control"),
    "private, no-store",
    "Denied requests are also private",
  );
  await assert.rejects(
    () => read({}, token, { origin: "https://untrusted.example", "sec-fetch-site": "cross-site" }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () => read({}, token, { "x-forwarded-host": "www.athrecs.com" }),
    /staff host required/,
  );
  await assert.rejects(() => read({ page: 0 }, token));
  const ordinary = await post("sign-up/email", {
    name: "Synthetic Ordinary",
    email: "ordinary@example.test",
    password: "Registration-test-password!",
  });
  await assert.rejects(() => read({}, ordinary.body.token), /Forbidden/);
  assert.equal((await read({ q: "' OR 1=1 --" }, token)).total, 0);
  assert.equal((await read({ q: "%" }, token)).total, 0, "Search metacharacters are literal");
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt") select 'registration-'||n,'Synthetic Athlete '||n,'athlete-'||n||'@example.test',n%2=0,'2026-01-01'::timestamptz + n*interval '1 minute' from generate_series(1,30) n`;
  await sql`insert into athlete_private_profiles(user_id,verified_email,full_name,club_or_team,privacy_notice_version,privacy_acknowledged_at) values ('registration-1','athlete-1@example.test','Synthetic Athlete One','Synthetic Club','test',now())`;
  await sql`insert into athlete_sport_profiles(user_id,sport_code) values('registration-1','Swimming')`;
  await sql`insert into events(id,slug,name,sport,surface,country) values(991201,'registration-running','Synthetic Running','Running','Road','United Kingdom'),(991202,'registration-triathlon','Synthetic Triathlon','Triathlon','Road','United Kingdom'),(991203,'registration-dns','Synthetic DNS','Cycling','Road','United Kingdom')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values(991201,991201,'2026-01-01','10K',10),(991202,991202,'2026-02-01','Sprint',20),(991203,991203,'2026-03-01','10K',10)`;
  await sql`insert into athletes(id,slug,display_name) values(991201,'registration-one','Synthetic Athlete One'),(991202,'registration-two','Synthetic Duplicate'),(991203,'registration-revoked','Synthetic Revoked')`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(991201,991201,991201,'finished'),(991202,991202,991201,'finished'),(991203,991201,991202,'finished'),(991204,991203,991201,'DNS'),(991205,991203,991203,'finished')`;
  await sql`insert into result_claims(result_id,athlete_id,claimant_user_id,claimant_email,status,verification_method,declaration_accepted) values
    (991201,991201,'registration-1','athlete-1@example.test','approved','other',true),
    (991202,991201,'registration-1','athlete-1@example.test','pending','other',true),
    (991203,991202,'registration-1','athlete-1@example.test','needs_info','other',true),
    (991204,991201,'registration-1','athlete-1@example.test','rejected','other',true),
    (991205,991203,'registration-1','athlete-1@example.test','withdrawn','other',true)`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(991201,'registration-1','athlete-1@example.test','active'),(991203,'registration-1','athlete-1@example.test','revoked')`;
  const one = (await read({ q: "Synthetic Club" }, token)).accounts[0];
  assert.equal(one.userId, "registration-1");
  assert.equal(one.signInCount, 0, "No historical login total is fabricated");
  assert.equal(one.lastSignInAt, null);
  assert.equal(
    one.racesClaimed,
    2,
    "Duplicate same-edition claims count as one race; withdrawn/rejected excluded",
  );
  assert.deepEqual(
    [one.approved, one.pending, one.needsInfo, one.rejected, one.withdrawn],
    [1, 1, 1, 1, 1],
  );
  assert.deepEqual(
    one.resultSports,
    ["Running", "Triathlon"],
    "Revoked links and DNS do not contribute sports",
  );
  assert.deepEqual(one.selectedSports, ["Swimming"]);
  assert.equal(one.linkedResults, 2);
  assert.equal(one.linkedProfiles, 1);
  assert.equal(
    (await read({ q: `ATH-${one.athleteNumber.padStart(6, "0")}` }, token)).accounts[0].userId,
    "registration-1",
  );
  assert.equal((await read({ status: "pending" }, token)).total, 1);
  assert(!(await read({ status: "unverified" }, token)).accounts.some((x) => x.emailVerified));
  assert(!(await read({ status: "unfinished" }, token)).accounts.some((x) => x.profileSavedAt));
  const page1 = await read({ q: "Synthetic Athlete", sort: "oldest" }, token);
  const page2 = await read({ q: "Synthetic Athlete", sort: "oldest", page: 2 }, token);
  assert.equal(page1.total, 30);
  assert.equal(page1.accounts.length, 25);
  assert.equal(page2.accounts.length, 5);
  assert.equal(new Set([...page1.accounts, ...page2.accounts].map((x) => x.userId)).size, 30);
  assert.equal((await read({ q: "Synthetic Athlete", page: 100000 }, token)).page, 2);
  assert.equal((await read({ sort: "logins" }, token)).accounts[0].userId, userId);
  const claims = await rpc(
    "athrecs/result-claims-api",
    "listStaffResultClaims",
    { status: "all", claimant: "registration-1" },
    token,
  );
  assert.equal(claims.length, 5);
  assert.equal(
    (
      await rpc(
        "athrecs/result-claims-api",
        "listStaffResultClaims",
        { status: "all", claimant: "registration-2" },
        token,
      )
    ).length,
    0,
  );
  // Calendar statistics use UK date boundaries, including BST and zero-signup days.
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt") values
    ('date-edge-before','Synthetic Boundary Before','boundary-before@example.test',true,'2026-09-30T22:59:59Z'),
    ('date-edge-after','Synthetic Boundary After','boundary-after@example.test',true,'2026-09-30T23:00:00Z'),
    ('date-dst-before','Synthetic DST Before','dst-before@example.test',true,'2026-03-28T23:59:59Z'),
    ('date-dst-start','Synthetic DST Start','dst-start@example.test',true,'2026-03-29T00:00:00Z'),
    ('date-dst-end','Synthetic DST End','dst-end@example.test',true,'2026-03-29T22:59:59Z'),
    ('date-dst-next','Synthetic DST Next','dst-next@example.test',true,'2026-03-29T23:00:00Z')`;
  const stats = await read({ month: "2026-01", q: "no match" }, token);
  assert.equal(stats.stats.daily.length, 31);
  assert.equal(stats.stats.daily[0].signups, 30);
  assert.equal(stats.stats.daily[1].signups, 0);
  assert.equal(stats.stats.monthly.length, 12);
  assert.equal(stats.stats.monthly[0].signups, 30);
  assert.equal(stats.stats.monthly[11].total, stats.summary.total);
  assert.equal(stats.total, 0, "Global statistics do not shrink with list search");
  assert.equal((await read({ month: "2024-02" }, token)).stats.daily.length, 29);
  assert.equal((await read({ month: "2025-02" }, token)).stats.daily.length, 28);
  assert.equal(
    (
      await read(
        { q: "Synthetic Boundary", joinedFrom: "2026-10-01", joinedTo: "2026-10-01" },
        token,
      )
    ).accounts[0].userId,
    "date-edge-after",
  );
  assert.equal(
    (
      await read(
        { q: "Synthetic Boundary", joinedFrom: "2026-09-30", joinedTo: "2026-09-30" },
        token,
      )
    ).total,
    1,
  );
  assert.equal(
    (await read({ q: "Synthetic DST", joinedFrom: "2026-03-29", joinedTo: "2026-03-29" }, token))
      .total,
    2,
    "23-hour BST change day",
  );
  const march = (await read({ month: "2026-03" }, token)).stats.daily;
  assert.equal(march.find((day) => day.date === "2026-03-29").signups, 2);
  await assert.rejects(() => read({ joinedFrom: "2026-02-30" }, token));
  await assert.rejects(() => read({ joinedFrom: "2026-10-02", joinedTo: "2026-10-01" }, token));
  await assert.rejects(() => read({ month: "2026-13" }, token));

  const saveContact = (data, auth = token, headers = {}) =>
    rpc("athrecs/athlete-contact-api", "saveStaffAthleteContact", data, auth, headers);
  const contact = {
    userId: "registration-1",
    phone: "+44 7700 900123",
    telegramUsername: "@synthetic_runner",
    socialLinks: [{ platform: "instagram", url: "https://www.instagram.com/synthetic_runner/" }],
    sourceNote: "Synthetic athlete supplied these details",
  };
  await assert.rejects(() => saveContact(contact, ""), /Unauthorized/);
  await assert.rejects(() => saveContact(contact, ordinary.body.token), /Forbidden/);
  await assert.rejects(
    () =>
      saveContact(contact, token, {
        origin: "https://untrusted.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () => saveContact(contact, token, { "x-forwarded-host": "www.athrecs.com" }),
    /staff host required/,
  );
  await assert.rejects(() => saveContact({ ...contact, phone: "+447700900123?body=bad" }));
  await assert.rejects(() => saveContact({ ...contact, telegramUsername: "bad?start=spam" }));
  await assert.rejects(() =>
    saveContact({
      ...contact,
      socialLinks: [{ platform: "instagram", url: "https://instagram.com.evil.example/user" }],
    }),
  );
  await assert.rejects(() => saveContact({ ...contact, sourceNote: "" }));
  await saveContact(contact);
  const contactRead = (await read({ q: "Synthetic Club" }, token)).accounts[0];
  assert.equal(contactRead.contact.phone, "+447700900123");
  assert.equal(contactRead.contact.telegramUsername, "synthetic_runner");
  assert.equal(contactRead.contact.socialLinks[0].sharePublicly, false);
  assert.equal(contactRead.marketingConsent, false);
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  assert.equal(
    (await sql`select updated_by from athlete_staff_contacts where user_id='registration-1'`)[0]
      .updated_by,
    userId,
  );
  assert.equal(
    (await sql`select * from athlete_profile_connections where user_id='registration-1'`).length,
    0,
    "Staff contacts do not publish social connections",
  );
  const helpers = await server.ssrLoadModule("/src/lib/athrecs/athlete-contact.ts");
  const channels = helpers.contactLinks(contactRead.email, contactRead.contact);
  assert.equal(channels.whatsapp, "https://wa.me/447700900123");
  assert.equal(channels.sms, "sms:+447700900123");
  assert.equal(channels.telegram, "https://t.me/synthetic_runner");
  assert.equal(channels.email, "mailto:athlete-1%40example.test");
  assert.equal(
    helpers.contactLinks("bad\r\nBcc:evil@example.test", contactRead.contact).email,
    null,
  );
  await saveContact({ ...contact, phone: "", telegramUsername: "", socialLinks: [] });
  assert.equal(
    (await read({ q: "Synthetic Club" }, token)).accounts[0].contact.phone,
    null,
    "Contact values can be removed",
  );
  console.log(
    "PASS: UK day/month history, leap years, BST midnight, date filters, private contacts, write authorization and safe channel links.",
  );

  // Account deletion cascades the aggregate. No data is written outside this DB.
  await sql`insert into session(id,"expiresAt",token,"updatedAt","userId") values('delete-activity',now()+interval '1 day','delete-activity',now(),'registration-30')`;
  await sql`delete from "user" where id='registration-30'`;
  assert.equal(
    (await sql`select * from athlete_login_activity where user_id='registration-30'`).length,
    0,
  );
  console.log(
    "PASS: actual signup/login, logout/refresh/failure/rollback counts, staff restrictions, private caching, all signups, stable IDs, claim/sport aggregation, filters and pagination.",
  );

  if (process.argv.includes("--browser")) {
    browser = await chromium.launch({
      executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      extraHTTPHeaders: { authorization: `Bearer ${token}` },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${origin}/admin/athlete-accounts`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page
      .getByRole("heading", { name: "Signed-up athletes", exact: true })
      .waitFor({ timeout: 120000 });
    const analytics = page.getByRole("button", { name: "No thanks", exact: true });
    if (await analytics.isVisible()) await analytics.click();
    await page.getByLabel("Find an athlete").fill("Synthetic Club");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    const card = page.getByRole("article").filter({ hasText: "Synthetic Athlete One" });
    await card.waitFor();
    assert((await card.innerText()).includes("Email unverified"));
    assert((await card.innerText()).includes("Running, Triathlon"));
    assert((await card.innerText()).includes("Swimming"));
    await page.getByLabel("Statistics month").fill("2026-01");
    await page.getByRole("button", { name: "By month", exact: true }).click();
    await page.getByRole("button", { name: "Show signups 2026-01", exact: true }).click();
    assert.equal(
      await page.getByLabel("Signed up from", { exact: true }).inputValue(),
      "2026-01-01",
    );
    assert.equal(await page.getByLabel("Signed up to", { exact: true }).inputValue(), "2026-01-31");
    await card.getByRole("button", { name: "Edit contact details", exact: true }).click();
    await card.getByLabel("Phone (international format)", { exact: true }).fill("+44 7700 900123");
    await card
      .getByLabel("Telegram username (optional)", { exact: true })
      .fill("@synthetic_runner");
    await card
      .getByLabel("Instagram profile URL", { exact: true })
      .fill("https://www.instagram.com/synthetic_runner/");
    await card
      .getByLabel("Contact details source", { exact: true })
      .fill("Synthetic athlete confirmed by test");
    await card.getByRole("button", { name: "Save private contact details", exact: true }).click();
    await card.getByRole("link", { name: "WhatsApp", exact: true }).waitFor();
    assert.equal(
      await card.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href"),
      "https://wa.me/447700900123",
    );
    assert.equal(
      await card.getByRole("link", { name: "SMS", exact: true }).getAttribute("href"),
      "sms:+447700900123",
    );
    assert.equal(
      await card.getByRole("link", { name: "Telegram", exact: true }).getAttribute("href"),
      "https://t.me/synthetic_runner",
    );
    assert(
      (await page.getByLabel("Contact sender", { exact: true }).innerText()).includes(
        "+44 7581 764764",
      ),
    );
    // Inspect destinations only: never open messaging apps or send messages.
    await mkdir("artifacts", { recursive: true });
    await page.screenshot({ path: "artifacts/registrations-desktop.png", fullPage: true });
    await card.getByRole("link", { name: "Review claims (2)" }).click();
    await page.getByText("Showing this account’s claims.", { exact: false }).waitFor();
    assert(page.url().includes("claimant=registration-1"));
    await page.getByRole("link", { name: "Back to signed-up athletes" }).click();
    await page.getByRole("button", { name: "Saved account details", exact: true }).click();
    await page.getByRole("heading", { name: "Athlete accounts", exact: true }).waitFor();
    await page.getByRole("button", { name: "All signups and activity", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel("Find an athlete").fill("Synthetic Club");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByRole("heading", { name: "Synthetic Athlete One", exact: true }).waitFor();
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "No horizontal page overflow on mobile",
    );
    await page.screenshot({ path: "artifacts/registrations-mobile.png", fullPage: true });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: actual staff page, search, claim link, saved-details switch and mobile layout with no browser errors.",
    );
  }
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
