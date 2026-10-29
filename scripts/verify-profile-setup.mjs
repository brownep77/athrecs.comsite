// Real authenticated RPCs and migrated disposable database. No external traffic.
import { signupDetails } from "./fixtures/signup-details.mjs";
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
  await assert.rejects(
    () => sql`insert into staff_notification_routes(category,recipient,enabled)
      values('support','fixtures@athrecs.com',true)`,
    /check constraint/,
    "A mismatched department route is rejected before it can break signup",
  );
  // Enable the department mailbox only in this disposable test database.
  await sql`insert into staff_notification_routes(category,recipient,enabled)
    values('support','support@athrecs.com',true)
    on conflict(category,recipient) do update set enabled=excluded.enabled`;
  const recipients = (
    await sql`select recipient from athrecs_notification_recipients('support') order by recipient`
  ).map((row) => row.recipient);
  assert(recipients.includes("support@athrecs.com"), "Profile setup routes to athlete support");
  const signup = async (email) => {
    const response = await fetch(`${origin}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({
        ...signupDetails("Synthetic Runner"),
        email,
        password: "Synthetic-Password-123!",
      }),
    });
    assert.equal(response.status, 200, await response.clone().text());
    return response.json();
  };
  const a = await signup("setup-a@example.test"),
    b = await signup("setup-b@example.test");
  assert.deepEqual(
    (
      await sql`select recipient from signup_alert_deliveries where user_id=${a.user.id} order by recipient`
    ).map((row) => row.recipient),
    recipients,
    "A rejected route configuration does not prevent valid account signup and alerts",
  );
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
  assert.deepEqual(
    (
      await sql`select recipient from athlete_profile_setup_alerts where request_id=${status.id} order by recipient`
    ).map((row) => row.recipient),
    recipients,
    "Each distinct profile submission queues the configured support recipients once",
  );
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
    sent: recipients.length - 1,
    failed: 1,
  });
  assert(sent.every((s) => s.email.text.includes(data.sourceUrls[0])));
  assert(
    sent.every(
      (s) =>
        s.email.text.includes(`Request: #${status.id}`) &&
        s.email.reply_to === a.user.email &&
        s.email.text.includes("Submitted:") &&
        s.email.text.includes(data.currentClub) &&
        data.previousClubs.every((club) => s.email.text.includes(club)) &&
        data.previousNames.every((name) => s.email.text.includes(name)) &&
        !s.email.text.includes(a.token) &&
        !s.email.text.includes("Only name and email supplied"),
    ),
  );
  await sql`update athlete_profile_setup_requests set details=details||'{"currentClub":"Changed after first send"}'::jsonb where id=${status.id}`;
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
  const failed = sent.find((s) => s.email.to[0] === "paultwbrowne@gmail.com");
  assert.equal(retry[0].key, failed.key);
  assert.deepEqual(retry[0].email, failed.email, "Retries must freeze email payload");
  assert.deepEqual(await service.deliverProfileSetupAlerts(sql, a.user.id, send), {
    sent: 0,
    failed: 0,
  });
  const minimal = await signup("setup-minimal@example.test");
  await sql`update "user" set "emailVerified"=true where id=${minimal.user.id}`;
  await save({ fullName: "Synthetic <Minimal>", privacyAcknowledged: true }, minimal.token);
  const minimalEmails = [];
  assert.deepEqual(
    await service.deliverProfileSetupAlerts(sql, minimal.user.id, async (email, key) => {
      minimalEmails.push({ email, key });
      return "synthetic-minimal";
    }),
    { sent: recipients.length, failed: 0 },
  );
  assert(
    minimalEmails.every(
      ({ email }) =>
        email.text.includes(
          "Only name and email supplied; no club, previous names or profile links supplied.",
        ) &&
        email.text.includes("Current club: Not supplied") &&
        email.text.includes("Previous clubs: Not supplied") &&
        email.text.includes("Previous names: Not supplied") &&
        email.text.includes("Profile links:\nNone supplied") &&
        email.subject.includes("profile details saved") &&
        !email.html.includes("<Minimal>"),
    ),
    "Name-only setup emails must describe the actual submission and escape user text",
  );
  // Exercise the explicit full account-save RPC, not just the queue helper.
  const accountData = {
    fullName: "Synthetic Full Account",
    displayName: "Synthetic Athlete",
    dateOfBirth: "1986-03-17",
    postcode: "ZZ11 9ZZ",
    country: "England",
    city: "Synthetic First City",
    nationality: "British",
    clubOrTeam: "Synthetic First AC",
    previousNames: ["Synthetic Prior Name"],
    parkrunId: "A9876543",
    fingerprintEvent: "Synthetic Example 10K",
    fingerprintYear: "2025",
    fingerprintDistance: "10K",
    fingerprintTime: "45:00",
    privacyAcknowledged: true,
    profileDetails: { manager: "PRIVATE_MANAGER_SENTINEL" },
    sports: [
      {
        sportCode: "Running",
        isPrimary: true,
        experienceLevel: "club",
        goals: "PRIVATE_TRAINING_SENTINEL",
      },
    ],
    preferences: { equipmentNotes: "PRIVATE_PREFERENCE_SENTINEL" },
    consents: { marketing: false },
    // Unexpected client keys must not make their way into notification snapshots.
    password: "PRIVATE_AUTH_SENTINEL",
    sessionToken: minimal.token,
  };
  const saveAccount = (input = accountData) =>
    rpc("athrecs/athlete-account-api", "saveMyAthleteAccount", input, minimal.token);
  const readAccountAlerts = () => sql`select event_key,recipient,submission,attempts,sent_at
    from staff_submission_alert_deliveries
    where event_kind='private_profile_save' and actor_user_id=${minimal.user.id}
    order by id`;
  assert.equal(
    (await readAccountAlerts()).length,
    0,
    "Setup and reads do not emit full-account save notices",
  );
  const savedAccount = await saveAccount();
  assert.equal(savedAccount.city, accountData.city);
  let accountAlerts = await readAccountAlerts();
  assert.equal(accountAlerts.length, recipients.length);
  assert.deepEqual(accountAlerts.map((row) => row.recipient).sort(), recipients);
  assert(
    accountAlerts.every((row) => row.attempts === 0 && !row.sent_at),
    "Preview queues without sending",
  );
  await saveAccount();
  assert.equal(
    (await readAccountAlerts()).length,
    recipients.length,
    "An identical full-account save is deduplicated",
  );
  const changedAccount = {
    ...accountData,
    city: "Synthetic Changed City",
    clubOrTeam: "Synthetic Changed AC",
  };
  await saveAccount(changedAccount);
  accountAlerts = await readAccountAlerts();
  assert.equal(accountAlerts.length, recipients.length * 2);
  let accountKeys = [...new Set(accountAlerts.map((row) => row.event_key))];
  assert.equal(
    accountKeys.length,
    2,
    "A genuine two-field change creates a new immutable submission",
  );
  await saveAccount(accountData);
  accountAlerts = await readAccountAlerts();
  assert.equal(
    accountAlerts.length,
    recipients.length * 3,
    "Reverting A to B to A is a genuine third submitted change",
  );
  accountKeys = [...new Set(accountAlerts.map((row) => row.event_key))];
  assert.equal(accountKeys.length, 3);
  assert.notEqual(accountKeys[0], accountKeys[2], "A reverted snapshot has a new event identity");
  await saveAccount(accountData);
  assert.equal(
    (await readAccountAlerts()).length,
    recipients.length * 3,
    "Only the consecutive identical save after the revert is deduplicated",
  );
  const hiddenValues = [
    accountData.dateOfBirth,
    accountData.postcode,
    "PRIVATE_MANAGER_SENTINEL",
    "PRIVATE_TRAINING_SENTINEL",
    "PRIVATE_PREFERENCE_SENTINEL",
    "PRIVATE_AUTH_SENTINEL",
    minimal.token,
    process.env.BETTER_AUTH_SECRET,
  ];
  const snapshots = JSON.stringify(accountAlerts.map((row) => row.submission));
  assert(
    hiddenValues.every((value) => !snapshots.includes(value)),
    "Only curated support fields enter the outbox",
  );
  const generic = await server.ssrLoadModule("/src/lib/athrecs/staff-submission-alerts.server.ts");
  const accountEmails = [];
  for (const key of accountKeys) {
    assert.deepEqual(
      await generic.deliverStaffSubmissionAlerts(
        sql,
        "private_profile_save",
        key,
        async (email, idempotencyKey) => {
          accountEmails.push({ email, idempotencyKey });
          return "synthetic-account-save";
        },
      ),
      { sent: recipients.length, failed: 0 },
    );
  }
  assert.equal(accountEmails.length, recipients.length * 3);
  assert(
    accountEmails.every(
      ({ email }) =>
        email.text.includes(accountData.fullName) &&
        email.text.includes(accountData.fingerprintEvent) &&
        email.text.includes("Date of birth supplied:\nYes") &&
        email.text.includes("Postcode supplied:\nYes") &&
        email.text.includes("/admin/athlete-accounts") &&
        email.reply_to === minimal.user.email &&
        hiddenValues.every((value) => !JSON.stringify(email).includes(value)),
    ),
    "Account emails include useful saved details while keeping DOB, postcode and authentication/private fields out",
  );
  assert(
    accountEmails.some(
      ({ email }) =>
        email.text.includes(accountData.city) && email.text.includes(accountData.clubOrTeam),
    ),
  );
  assert(
    accountEmails.some(
      ({ email }) =>
        email.text.includes(changedAccount.city) && email.text.includes(changedAccount.clubOrTeam),
    ),
  );
  assert.deepEqual(
    await generic.deliverStaffSubmissionAlerts(sql, "private_profile_save", undefined, async () => {
      throw Error("Completed account notifications must not be resent");
    }),
    { sent: 0, failed: 0 },
  );
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
      await page.getByRole("link", { name: "Review available results now" }).click();
      await page.getByRole("button", { name: "Add clubs or profile links" }).click();
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
    "Profile setup verified: authenticated setup and full-account saves, preservation, private staff queue, category routing, invalid-route rejection, identical-save deduplication, genuine-change notifications, curated private-data exclusions, link validation, complete submitted details, name-only disclosure, safe HTML, immutable mail retry and former-club matching.",
  );
} finally {
  globalThis.fetch = realFetch;
  await server.close();
  await database?.close();
}
