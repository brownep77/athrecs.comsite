// Actual browser -> authenticated RPC -> disposable PGlite. Never production data or email.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const origin = "http://127.0.0.1:18246";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  ATHRECS_CLAIMS_EMAILS: "",
  VITE_SITE_BRAND: "athrecs",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "profile-claim-test-only-secret-at-least-32-chars",
});
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18246, strictPort: true } });
let browser, database;
const errors = [];
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  // Complete disposable catalogue setup before timing the account navigation.
  // This matches the other account browser fixtures and keeps seed failures
  // explicit instead of surfacing as a first-page browser timeout.
  await (await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts")).ensureAthrecsSeeded();
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const account = async (email, fullName) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const credentials = { email, password: "Synthetic-password-123!" };
    const response = await context.request.post(`${origin}/api/auth/sign-up/email`, {
      headers: { origin },
      data: { name: "Temporary Name", ...credentials },
    });
    assert.equal(response.status(), 200, await response.text());
    const { user } = await response.json();
    await sql`update "user" set name='',"emailVerified"=true where id=${user.id}`;
    await context.clearCookies();
    const signin = await context.request.post(`${origin}/api/auth/sign-in/email`, {
      headers: { origin },
      data: credentials,
    });
    assert.equal(signin.status(), 200, await signin.text());
    const signedIn = await signin.json();
    assert(signedIn.token, "Real sign-in issues a session token");
    // Production uses Secure __Host cookies. Loopback HTTP exercises the app's
    // existing preview bearer mechanism with a genuine sign-in token, without
    // fabricating a session or weakening the production cookie configuration.
    await context.setExtraHTTPHeaders({ authorization: `Bearer ${signedIn.token}` });
    await context.addInitScript((token) => {
      sessionStorage.setItem("grok-auth.bearer-token", token);
    }, signedIn.token);
    const session = await context.request.get(`${origin}/api/auth/get-session`);
    assert.equal(session.status(), 200);
    const authenticated = await session.json();
    assert.equal(authenticated.user.id, user.id);
    assert.equal(authenticated.user.emailVerified, true);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(120000);
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle" });
    const form = page.getByRole("form", { name: "Complete your profile", exact: true });
    await form.waitFor();
    const names = fullName.split(" ");
    const lastName = names.pop();
    const firstName = names.join(" ");
    await form.getByRole("checkbox", { name: "Athlete", exact: true }).check();
    await form.getByLabel("First names", { exact: true }).fill(firstName);
    await form.getByLabel("Last name", { exact: true }).fill(lastName);
    await form.getByLabel("Country of residence", { exact: true }).fill("United Kingdom");
    await form.getByLabel("Main sport", { exact: true }).selectOption("Running");
    await form.getByLabel("Nationality", { exact: true }).fill("British");
    await form.getByLabel("Date of birth", { exact: true }).fill("1984-01-01");
    await form.getByLabel("Postcode / ZIP / area (private)", { exact: true }).fill("NR1");
    await form.getByRole("checkbox", { name: /^I have read the privacy notice/ }).check();
    await form
      .getByRole("button", { name: "Save profile and find my results", exact: true })
      .click();
    await page.waitForURL(`${origin}/athlete-account`);
    await page.getByRole("heading", { name: "My Athlete Account", exact: true }).waitFor();
    assert.deepEqual(
      await sql`select first_name,last_name,roles from member_onboarding where user_id=${user.id}`,
      [{ first_name: firstName, last_name: lastName, roles: ["athlete"] }],
    );
    const [counts] = await sql`select
      (select count(*)::int from result_claims where claimant_user_id=${user.id}) as claims,
      (select count(*)::int from athlete_account_links where user_id=${user.id}) as links,
      (select count(*)::int from athlete_account_consents where user_id=${user.id} and status='granted') as consent_grants`;
    assert.deepEqual(
      counts,
      { claims: 0, links: 0, consent_grants: 0 },
      "Completing the real onboarding does not claim results, link profiles or grant optional consent",
    );
    return { context, page, user };
  };
  const plain = await account("plain-claim@example.test", "Journey Test Runner");
  await sql`insert into events (id,slug,name,sport,surface,country) values (992101,'claim-journey-test','Synthetic Claim Journey 10K','Running','Road','United Kingdom')`;
  await sql`insert into editions (id,event_id,event_date,distance_code,distance_km) values (992101,992101,'2026-09-01','10K',10)`;
  await sql`insert into athletes (id,slug,display_name,profile_visibility) values (992101,'claim-journey-runner','Journey Test Runner','private'),(992102,'claim-journey-invited','Invited Test Runner','private')`;
  await sql`insert into results (id,edition_id,athlete_id,finish_time_seconds,status) values (992102,992101,992102,2500,'finished')`;
  const sourcePerformance = {
    year: 2026,
    date: "2026-09-06",
    meeting: "Synthetic Run Norwich 2026",
    discipline: "10K",
    performance: "40:00",
    place: "25",
    ageGroup: "M40",
    labels: ["Club at race: Journey Harriers"],
    verificationStatus: "source_verified",
    places: { overall: 25, gender: 20, category: 3 },
    sourceUrls: ["https://example.test/norwich.pdf"],
    archiveReference: {
      sourceRow: "RN2026:journey",
      original: { Bib: "1234", Age: "42", "Gun Time": "40:30" },
    },
  };
  const virtualPerformance = {
    ...sourcePerformance,
    year: 2020,
    date: "",
    meeting: "Synthetic Run Norwich 2020 Virtual",
    discipline: "10K Virtual",
    verificationStatus: "unverified",
    dateLabel: "18–24 October 2020 (individual run date not supplied)",
    archiveReference: { sourceRow: "RN2020:journey", original: { Age: "36" } },
  };
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at) values(992101,'Run Norwich official results','claim-journey','https://example.test/norwich.pdf',now(),false,array[2020,2026],array[2020,2026],${JSON.stringify([sourcePerformance, virtualPerformance])}::jsonb,now())`;
  const [source] =
    await sql`select -id id from source_history_claim_results where source_key='RN2026:journey'`;
  const [virtual] =
    await sql`select -id id from source_history_claim_results where source_key='RN2020:journey'`;
  const sourceId = source.id;
  const { page } = plain;
  await page.goto(`${origin}/claim-results?resultId=${sourceId}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Confirm all results are mine", exact: true }).waitFor();
  assert.equal(await page.getByText("This match is no longer available").count(), 0);
  assert.equal(
    await page
      .getByRole("heading", { name: "Complete your details to claim your profile" })
      .count(),
    0,
    "Onboarding already supplied the identity needed to review this profile",
  );
  assert.equal(await page.getByLabel("Full name", { exact: true }).count(), 0);
  await page
    .getByRole("listitem")
    .filter({ hasText: "Synthetic Run Norwich 2026" })
    .getByText(/Recorded club: Journey Harriers/)
    .waitFor();
  await page.getByText(/Age at race: 42/).waitFor();
  await page.goto(`${origin}/athlete-account?section=potential`, { waitUntil: "networkidle" });
  await page.getByText("Synthetic Run Norwich 2026", { exact: true }).waitFor();
  await page
    .getByText("18–24 October 2020 (individual run date not supplied)", { exact: false })
    .waitFor();
  await page.goto(`${origin}/claim-results?resultId=${virtual.id}`, { waitUntil: "networkidle" });
  await page.getByText(/individual run date not supplied/).waitFor();
  assert.equal(await page.getByText("Invalid Date", { exact: false }).count(), 0);
  await page.goto(`${origin}/claim-results?resultId=${sourceId}`, { waitUntil: "networkidle" });
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Finish my profile claim", exact: true }).click();
  assert(new URL(page.url()).searchParams.get("resultId") === String(sourceId));
  // Clear, select one by checkbox, then select a filtered group without claiming unrelated rows.
  await page.getByRole("button", { name: "Clear selection", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Select Synthetic Run Norwich 2026 2026-09-06", exact: true })
    .check();
  await page.getByLabel("Search this result list").fill("Virtual");
  await page.getByRole("button", { name: "Select all 1 matching results", exact: true }).click();
  await page.getByLabel("Search this result list").fill("");
  await page.getByRole("button", { name: /Remove Synthetic Run Norwich 2020 Virtual/ }).click();
  assert.equal(
    (await sql`select * from athlete_profile_hidden_source_results where user_id=${plain.user.id}`)
      .length,
    0,
    "Removal stays in the draft until confirmation",
  );
  await page.getByRole("button", { name: "Add a missing result", exact: true }).click();
  await page.getByLabel("Race name", { exact: true }).fill("Synthetic Added 10K");
  await page.getByLabel("Race date", { exact: true }).fill("2025-05-04");
  await page.getByLabel("Distance (e.g. 10K)", { exact: true }).fill("10K");
  await page.getByLabel("Finish time (HH:MM:SS or MM:SS)", { exact: true }).fill("42:12");
  await page.getByLabel("Results page link", { exact: true }).fill("https://example.test/added");
  await page.getByLabel("Time type", { exact: true }).selectOption("chip");
  await page.getByRole("button", { name: "Add to my confirmation", exact: true }).click();
  assert.equal(
    (await sql`select * from athlete_result_proposals where submitted_by=${plain.user.id}`).length,
    0,
    "Adding stays in the draft until confirmation",
  );
  await page.getByRole("button", { name: "Confirm my 2 selected results", exact: true }).click();
  await page.getByRole("heading", { name: "Claim complete", exact: true }).waitFor();
  const [claim] =
    await sql`select status from result_claims where claimant_user_id=${plain.user.id}`;
  assert.equal(claim.status, "approved");
  assert.equal(
    (await sql`select * from athlete_account_links where user_id=${plain.user.id}`).length,
    1,
  );
  await page.getByRole("link", { name: "View my private profile", exact: true }).click();
  await page.getByRole("tab", { name: "About & sports", exact: true }).click();
  await page
    .getByText(/Their private ATHRECS record currently contains 1 claimed result/)
    .waitFor();
  await page
    .getByText(/Their latest recorded performance is at Synthetic Run Norwich 2026/)
    .waitFor();
  await page.goto(`${origin}/claim-results?resultId=${sourceId}`, { waitUntil: "networkidle" });
  await page.getByText(/Previous review saved/).waitFor();
  await page.getByRole("button", { name: /Restore Synthetic Run Norwich 2020 Virtual/ }).waitFor();
  assert.equal(
    (await sql`select * from athlete_profile_hidden_source_results where user_id=${plain.user.id}`)
      .length,
    1,
  );
  assert.equal(
    (await sql`select * from athlete_result_proposals where submitted_by=${plain.user.id}`).length,
    1,
  );
  assert.equal(
    (await sql`select * from athlete_profile_result_confirmations where user_id=${plain.user.id}`)
      .length,
    1,
  );
  assert.equal(
    await page.getByRole("button", { name: "Confirm my 1 selected results", exact: true }).count(),
    1,
  );
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("link", { name: "Continue my claim" }).count(), 0);
  assert.equal(
    await page.getByRole("link", { name: "Finish my profile claim", exact: true }).count(),
    0,
  );
  console.log(
    "PASS: Saved onboarding identity -> same selected profile -> remembered navigation -> one completed claim -> clear receipt after reload.",
  );

  const invited = await account("invited-claim@example.test", "Invited Test Runner");
  const token = "a".repeat(64);
  const hash = createHash("sha256").update(token).digest("hex");
  const claimUrl = `https://www.athrecs.com/claim-results?resultId=992102&invitation=${token}`;
  await sql`insert into athlete_claim_invitations(id,user_id,recipient_email,athlete_id,result_id,token_hash,claim_url,match_note,created_by,invitation_kind,recipient_name,recipient_key,email_payload) values('99210200-0000-4000-8000-000000000001',null,'invited-claim@example.test',992102,992102,${hash},${claimUrl},'Synthetic recipient confirmed this profile',${plain.user.id},'email','Invited Test Runner','email:invited-claim@example.test','{}'::jsonb)`;
  await invited.page.reload({ waitUntil: "networkidle" });
  const resume = invited.page.getByRole("link", {
    name: "Continue claiming Invited Test Runner",
    exact: true,
  });
  await resume.waitFor();
  assert.equal(await invited.page.getByLabel("Full racing name").count(), 0);
  await invited.page.setViewportSize({ width: 390, height: 844 });
  await mkdir("artifacts", { recursive: true });
  await invited.page.screenshot({ path: "artifacts/claim-resume-mobile.png", fullPage: true });
  assert(
    await invited.page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  );
  await resume.click();
  await invited.page
    .getByRole("button", { name: "Confirm all results are mine", exact: true })
    .waitFor();
  assert.equal(
    await invited.page
      .getByRole("heading", { name: "Complete your details to claim your profile" })
      .count(),
    0,
    "Invitation confirmation reuses the saved onboarding identity",
  );
  assert.equal(await invited.page.getByLabel("Full name", { exact: true }).count(), 0);
  assert.equal(await invited.page.getByLabel("Full racing name").count(), 0);
  await invited.page.screenshot({ path: "artifacts/claim-confirm-mobile.png", fullPage: true });
  await invited.page
    .getByRole("button", { name: "Confirm all results are mine", exact: true })
    .click();
  await invited.page.getByRole("heading", { name: "Claim complete", exact: true }).waitFor();
  await invited.page.screenshot({ path: "artifacts/claim-received-mobile.png", fullPage: true });
  assert.equal(
    (await sql`select * from result_claims where claimant_user_id=${invited.user.id}`).length,
    1,
  );
  const [bound] =
    await sql`select user_id,claim_id from athlete_claim_invitations where token_hash=${hash}`;
  const [optionalIdentity] =
    await sql`select date_of_birth,nationality from athlete_private_profiles where user_id=${invited.user.id}`;
  assert.equal(
    optionalIdentity.date_of_birth,
    "1984-01-01",
    "Invitation claiming preserves the birth date supplied during onboarding",
  );
  assert.equal(
    optionalIdentity.nationality,
    "British",
    "Invitation claiming preserves the nationality supplied during onboarding",
  );
  assert.equal(bound.user_id, invited.user.id);
  assert(bound.claim_id);
  console.log(
    "PASS: Verified onboarded account resumes its email invitation on mobile and completes exactly one self-confirmed profile claim.",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await database?.close();
  await server.close();
}
