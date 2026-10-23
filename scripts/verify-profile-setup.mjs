// Real authenticated RPCs and migrated disposable database. No external traffic.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
const origin = "http://127.0.0.1:18462";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  ATHRECS_INVITATION_RESEND_API_KEY: "",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "synthetic-profile-setup-secret-at-least-32-characters",
  TSS_SERVER_FN_BASE: `${origin}/_serverFn/`,
  VERCEL_ENV: "",
});
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(origin), `Unexpected external traffic: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const modules = new Map();
async function rpc(file, name, data, token) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file),
    start = source.indexOf(`const ${name} =`);
  assert(start >= 0, name);
  const section = source.slice(start, source.indexOf(";", start)),
    id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1],
    method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const response = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      context: {},
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
const server = await createServer({ server: { host: "127.0.0.1", port: 18462, strictPort: true } });
let database;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const signup = async (email) => {
    const response = await fetch(`${origin}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({
        name: "Synthetic Runner",
        email,
        password: "Synthetic-Password-123!",
      }),
    });
    assert.equal(response.status, 200, await response.clone().text());
    return response.json();
  };
  const a = await signup("setup-a@example.test"),
    b = await signup("setup-b@example.test");
  const data = {
    fullName: "Synthetic Runner",
    currentClub: "Synthetic Current AC",
    previousClubs: ["Synthetic Former AC", "Synthetic Old AC"],
    previousNames: ["Synthetic Former"],
    sourceUrls: [
      "https://www.thepowerof10.info/athletes/profile.aspx?athleteid=9876543",
      "https://www.parkrun.org.uk/parkrunner/9876543/",
    ],
    privacyAcknowledged: true,
  };
  const save = (input = data, token = a.token) =>
    rpc("athrecs/profile-setup-api", "saveMyProfileSetup", input, token);
  await assert.rejects(() => save(data, undefined));
  await assert.rejects(() => save(), /Verify your email/);
  await sql`update "user" set "emailVerified"=true where id=${a.user.id} or id=${b.user.id}`;
  await rpc("athrecs/athlete-account-api", "getMyAthleteAccount", undefined, a.token);
  await sql`insert into athlete_private_profiles(user_id,verified_email,full_name,date_of_birth,nationality,profile_details,privacy_notice_version,privacy_acknowledged_at)
    values(${a.user.id},${a.user.email},'Synthetic Runner','1984-09-02','IRL','{"manager":"Preserved Manager","birthdayVisibility":"hidden"}'::jsonb,'test',now())`;
  await sql`insert into athlete_result_matching_settings(user_id,settings,notice_version) values(${a.user.id},'{"externalSearchConsent":true,"maidenName":"Preserved"}'::jsonb,'test')`;
  await save();
  const [profile] = await sql`select * from athlete_private_profiles where user_id=${a.user.id}`;
  assert.equal(profile.full_name, data.fullName);
  assert.equal(profile.club_or_team, data.currentClub);
  assert.equal(profile.profile_details.manager, "Preserved Manager");
  assert.equal(profile.profile_details.previousClub, data.previousClubs[0]);
  assert.equal(profile.nationality, "IRL");
  assert(profile.date_of_birth);
  const [settings] =
    await sql`select settings from athlete_result_matching_settings where user_id=${a.user.id}`;
  assert.equal(settings.settings.externalSearchConsent, true);
  assert.equal(settings.settings.maidenName, "Preserved");
  assert.deepEqual(settings.settings.previousClubs, data.previousClubs);
  assert.deepEqual(settings.settings.sourceUrls, data.sourceUrls);
  const status = await rpc(
    "athrecs/profile-setup-api",
    "getMyProfileSetupStatus",
    undefined,
    a.token,
  );
  assert.equal(status.completed, false);
  assert.equal(
    await rpc("athrecs/profile-setup-api", "getMyProfileSetupStatus", undefined, b.token),
    null,
  );
  await assert.rejects(() =>
    rpc("athrecs/profile-setup-api", "listStaffProfileSetups", undefined, a.token),
  );
  await assert.rejects(() =>
    rpc("athrecs/profile-setup-api", "completeStaffProfileSetup", { id: status.id }, a.token),
  );
  await save();
  assert.equal(
    (
      await sql`select count(*)::int as n from athlete_profile_setup_requests where user_id=${a.user.id}`
    )[0].n,
    1,
    "Repeated save must not duplicate requests",
  );
  assert.equal((await sql`select count(*)::int as n from athlete_profile_setup_alerts`)[0].n, 2);
  for (const link of [
    "http://example.com/a",
    "https://127.0.0.1/a",
    "https://example.com/?token=secret",
    "https://user:secret@example.com/a",
  ]) {
    await assert.rejects(() => save({ ...data, sourceUrls: [link] }));
  }
  await assert.rejects(() => save({ ...data, previousClubs: Array(11).fill("Club") }));
  await assert.rejects(() => save({ ...data, privacyAcknowledged: false }));
  const service = await server.ssrLoadModule("/src/lib/athrecs/profile-setup-alerts.server.ts");
  const sent = [];
  const send = async (email, key) => {
    sent.push({ email, key });
    if (email.to[0] === "paultwbrowne@gmail.com") throw Error("Synthetic mail outage");
    return "synthetic";
  };
  assert.deepEqual(await service.deliverProfileSetupAlerts(sql, a.user.id, send), {
    sent: 1,
    failed: 1,
  });
  assert(sent.every((s) => s.email.text.includes(data.sourceUrls[0])));
  await sql`update athlete_profile_setup_alerts set next_attempt_at=now() where sent_at is null`;
  const retry = [];
  assert.deepEqual(
    await service.deliverProfileSetupAlerts(sql, a.user.id, async (email, key) => {
      retry.push({ email, key });
      return "synthetic";
    }),
    { sent: 1, failed: 0 },
  );
  assert.equal(retry.length, 1);
  assert.equal(retry[0].key, sent[1].key);
  assert.deepEqual(retry[0].email, sent[1].email, "Retries must freeze email payload");
  assert.deepEqual(await service.deliverProfileSetupAlerts(sql, a.user.id, send), {
    sent: 0,
    failed: 0,
  });
  const matching = await server.ssrLoadModule("/src/lib/athrecs/result-match.ts");
  assert.equal(
    matching.scorePotentialResultNameMatch(["Synthetic Runner"], "S Runner", {}, {}),
    null,
  );
  assert(
    matching.scorePotentialResultNameMatch(
      ["Synthetic Runner"],
      "S Runner",
      { previousClubs: data.previousClubs },
      { clubName: "Synthetic Former AC" },
    ),
  );
  assert.equal(
    matching.scorePotentialResultNameMatch(
      ["Synthetic Runner"],
      "Another Person",
      { previousClubs: data.previousClubs },
      { clubName: "Synthetic Former AC" },
    ),
    null,
    "Club alone must not match a different person",
  );
  await sql`insert into events(id,slug,name,sport,surface,country) values(992462,'synthetic-setup','Synthetic Setup 10K','Running','Road','Ireland')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values(992462,992462,'2026-09-01','10K',10)`;
  await sql`insert into clubs(id,slug,name) values(992462,'synthetic-former-ac','Synthetic Former AC')`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility,club_id) values(992462,'synthetic-setup-runner','S Runner','private',992462)`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status) values(992462,992462,992462,2400,'finished')`;
  const matches = await rpc(
    "athrecs/result-match-api",
    "listMyPotentialResultMatches",
    {},
    a.token,
  );
  assert(
    matches.matches.some(
      (m) => m.athleteId === 992462 && m.reasons.includes("Current or previous club matches"),
    ),
    "Saved former club must reach real SQL matching",
  );
  await rpc("athrecs/combined-result-matches-api", "listMyCombinedResultMatches", {}, a.token);
  if (process.argv.includes("--browser")) {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const login = await context.request.post(`${origin}/api/auth/sign-in/email`, {
        headers: { origin },
        data: { email: "setup-b@example.test", password: "Synthetic-Password-123!" },
      });
      assert.equal(login.status(), 200, await login.text());
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle" });
      await page.getByLabel("Full racing name", { exact: true }).fill("Synthetic Runner");
      await page
        .getByLabel("Current club or team (optional)", { exact: true })
        .fill("Synthetic Current AC");
      await page
        .getByLabel(/^Previous clubs or teams/)
        .fill("Synthetic Former AC\nSynthetic Old AC");
      await page
        .getByLabel(/^Your public profile or result links/)
        .fill("https://www.parkrun.org.uk/parkrunner/9876543/");
      await page.getByRole("checkbox", { name: /I acknowledge/ }).check();
      await page.screenshot({ path: "/tmp/athrecs-setup-mobile.png", fullPage: true });
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        "Mobile layout must not overflow",
      );
      await page.getByRole("button", { name: "Save and find my results" }).click();
      await page.getByText(/Your profile is in our review queue/).waitFor();
      assert(new URL(page.url()).searchParams.get("section") === "potential");
      await page.getByRole("button", { name: "Add clubs or profile links" }).click();
      assert.equal(
        await page.getByLabel(/^Previous clubs or teams/).inputValue(),
        "Synthetic Former AC\nSynthetic Old AC",
      );
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({ path: "/tmp/athrecs-setup-desktop.png", fullPage: true });
      assert.deepEqual(errors, []);
      console.log(
        "Mobile and desktop setup journey verified in Chromium, including save, immediate discovery destination and editing persisted clubs.",
      );
    } finally {
      await browser.close();
    }
  }
  console.log(
    "Profile setup verified: authenticated save, preservation, private staff queue, deduplication, link validation, mail retry and former-club matching.",
  );
} finally {
  await server.close();
  await database?.close();
}
