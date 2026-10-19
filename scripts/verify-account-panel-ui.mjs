// Real account route and RPCs against disposable in-memory PGlite only.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");

process.env.DATABASE_URL = "";
process.env.DATABASE_URL_UNPOOLED = "";
process.env.POSTGRES_URL_NON_POOLING = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "false";
const runrecs = process.argv.includes("--runrecs");
process.env.VITE_SITE_BRAND = runrecs ? "runrecs" : "athrecs";
const origin = "http://127.0.0.1:18227";
process.env.BETTER_AUTH_URL = origin;
const server = await createServer({ server: { host: "127.0.0.1", port: 18227, strictPort: true } });
let browser;
let database;
let page;
await mkdir("artifacts", { recursive: true });
try {
  await server.listen();
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle", timeout: 120000 });
  if (runrecs) {
    await page.getByRole("heading", { name: "Identity and Entry Passport", exact: true }).waitFor();
    assert.equal(
      await page.getByRole("navigation", { name: "Athlete profile sections" }).count(),
      0,
    );
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
    console.log("PASS: RunRecs retains its long account form and one matching panel.");
  } else {
    const nav = page.getByRole("navigation", { name: "Athlete profile sections" });
    const go = async (name) => {
      await nav.getByRole("link", { name, exact: true }).click();
    };
    await page.getByRole("heading", { name: "My races", exact: true }).waitFor({ timeout: 120000 });
    const analyticsChoice = page.getByRole("button", { name: "No thanks", exact: true });
    if (await analyticsChoice.isVisible()) await analyticsChoice.click();
    const labels = await nav.getByRole("link").allTextContents();
    assert.deepEqual(labels.slice(0, 2), ["Find and claim results", "My races"]);
    assert.equal(labels.length, 21);
    await go("Personal details");
    await page.getByLabel("Full name", { exact: false }).fill("Sidebar Test Runner");
    await page.getByLabel("Display name", { exact: false }).fill("Sidebar Test Runner");
    await page.getByLabel(/^Date of birth/).fill("1984-01-01");
    await go("Location & clubs");
    assert.equal(await page.getByLabel("Full name", { exact: false }).count(), 0);
    await page.getByLabel("City / town", { exact: false }).fill("Test City");
    await page.getByLabel("Nationality", { exact: false }).fill("British");
    await go("Equipment");
    await page.getByRole("button", { name: "GPS watch", exact: true }).click();
    await go("Personal details");
    assert.equal(
      await page.getByLabel("Full name", { exact: false }).inputValue(),
      "Sidebar Test Runner",
    );
    await page.getByRole("button", { name: "Save Athlete Account", exact: true }).click();
    await page.getByText("Your Athlete Account has been saved.", { exact: true }).waitFor();
    const saved = (
      await database.query(
        "select full_name, city from athlete_private_profiles where user_id = 'dev-user'",
      )
    ).rows[0];
    assert.deepEqual(saved, { full_name: "Sidebar Test Runner", city: "Test City" });
    await page.reload({ waitUntil: "networkidle" });
    await page.getByLabel("Full name", { exact: false }).waitFor();
    assert.equal(
      await page.getByLabel("Full name", { exact: false }).inputValue(),
      "Sidebar Test Runner",
    );
    await go("Equipment");
    assert.equal(
      await page
        .getByRole("button", { name: "GPS watch", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.goBack();
    await page.getByRole("heading", { name: "Personal details", exact: true }).waitFor();

    // A synthetic result is claimed through the real confirmation flow, never production.
    await database.exec(`
      insert into events (id, slug, name, sport, surface, country) values (990001, 'sidebar-synthetic-race', 'Sidebar Synthetic 10K', 'Running', 'Road', 'United Kingdom');
      insert into editions (id, event_id, event_date, distance_code, distance_km) values (990001, 990001, '2026-09-01', '10K', 10);
      insert into athletes (id, slug, display_name, profile_visibility) values (990001, 'sidebar-synthetic-runner', 'Sidebar Test Runner', 'private');
      insert into results (id, edition_id, athlete_id, finish_time_seconds) values (990001, 990001, 990001, 2400);
    `);
    const sql = await (await server.ssrLoadModule("/src/lib/db.ts")).getSql();
    const sourceUrl = "https://example.test/private-combined-evidence";
    await sql`update results set source_url=${sourceUrl} where id=990001`;
    const history = [
      {
        year: 2026,
        date: "2026-09-01",
        discipline: "10K",
        performance: "40:00",
        meeting: "Sidebar Synthetic 10K",
        sourceUrls: [sourceUrl],
        labels: [],
      },
      {
        year: 2025,
        date: "2025-09-01",
        discipline: "5K",
        performance: "20:00",
        meeting: "History Synthetic 5K",
        sourceUrls: [sourceUrl],
        labels: [],
      },
    ].map((row) => ({
      sourceDate: row.date,
      ageGroup: "",
      wind: "",
      place: "",
      venue: "",
      ...row,
    }));
    await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
      values(990001,'Synthetic timing','sidebar-history',${sourceUrl},now(),false,array[2025,2026],array[2025,2026],${JSON.stringify(history)}::jsonb,now())`;
    const datasetId = crypto.randomUUID();
    await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note)
      values(${datasetId}::uuid,990001,'Synthetic timer','sidebar',${sourceUrl},'Synthetic disposable test data')`;
    await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash)
      values(${datasetId}::uuid,'overlap',${JSON.stringify({ name: "Sidebar Test Runner", status: "finished", finishSeconds: 2400 })}::jsonb,repeat('a',64)),
        (${datasetId}::uuid,'unique',${JSON.stringify({ name: "Sidebar Test Runner", status: "finished", finishSeconds: 2500 })}::jsonb,repeat('b',64))`;
    // Leave an unsaved account edit while a result claim refreshes the account query.
    await page.getByLabel("Display name", { exact: false }).fill("Unsaved sidebar draft");
    await go("Find and claim results");
    await page.getByText("3 potential results", { exact: true }).waitFor();
    assert.equal(
      await page.getByRole("article").count(),
      3,
      "One combined list with overlaps removed",
    );
    assert.equal(
      await page.getByText("Other saved race results matching your name", { exact: true }).count(),
      0,
    );
    assert.equal(await page.getByText(sourceUrl, { exact: false }).count(), 0);
    await page
      .getByRole("checkbox", {
        name: "Select saved result Sidebar Synthetic 10K 2026-09-01",
        exact: true,
      })
      .check();
    await page
      .getByLabel("What helps us confirm these results are yours?")
      .fill("Synthetic bib and club details for this test.");
    await page.getByRole("button", { name: "Request review of 1 result", exact: true }).click();
    await page.getByText("1 saved result submitted for a match check.", { exact: true }).waitFor();
    assert.equal(
      (
        await sql`select count(*)::int as n from result_archive_match_requests where user_id='dev-user'`
      )[0].n,
      1,
    );
    await page.screenshot({ path: "artifacts/combined-matches-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
    );
    await page.screenshot({ path: "artifacts/combined-matches-mobile.png", fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    const match = page.getByRole("article").filter({ hasText: "Sidebar Synthetic 10K" });
    await match
      .getByRole("button", { name: "Claim profile & review all results", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText("History Synthetic 5K", { exact: true }).waitFor();
    await dialog.getByRole("button", { name: "Confirm all results are mine", exact: true }).click();
    await page.getByRole("heading", { name: "Claim complete", exact: true }).waitFor();
    assert.deepEqual(
      (await database.query("select status from result_claims where result_id=990001")).rows,
      [{ status: "approved" }],
    );
    assert.equal(
      (await database.query("select athlete_id from athlete_account_links where athlete_id=990001"))
        .rows.length,
      1,
    );
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await go("Personal details");
    assert.equal(
      await page.getByLabel("Display name", { exact: false }).inputValue(),
      "Unsaved sidebar draft",
    );
    // Use the ownership created by the real batch confirmation for downstream controls.
    await page.reload({ waitUntil: "networkidle" });
    await go("My races");
    await page.getByRole("searchbox", { name: "Search your results" }).fill("Sidebar Synthetic");
    const row = page.getByRole("row").filter({ hasText: "Sidebar Synthetic 10K" });
    await row.getByRole("button", { name: "Remove", exact: true }).click();
    assert.equal(
      (
        await database.query(
          "select count(*)::int as n from athlete_profile_hidden_results where result_id=990001",
        )
      ).rows[0].n,
      0,
    );
    await page.getByRole("button", { name: "Remove from profile", exact: true }).click();
    await page
      .getByText("Result removed from your profile. The official record is unchanged.", {
        exact: true,
      })
      .waitFor();
    assert.equal(
      (await database.query("select count(*)::int as n from results where id=990001")).rows[0].n,
      1,
    );
    assert.equal(
      (
        await database.query(
          "select count(*)::int as n from athlete_profile_hidden_results where result_id=990001",
        )
      ).rows[0].n,
      1,
    );
    await page.getByText("Removed from my profile", { exact: true }).click();
    await page.getByRole("button", { name: "Restore", exact: true }).click();
    await page.getByText("Result restored to your profile.", { exact: true }).waitFor();
    assert.equal(
      (
        await database.query(
          "select count(*)::int as n from athlete_profile_hidden_results where result_id=990001",
        )
      ).rows[0].n,
      0,
    );
    await page.screenshot({ path: "artifacts/account-sidebar-desktop.png", fullPage: true });

    // Every other sidebar destination opens a distinct section.
    for (const [label, heading] of [
      ["Upcoming races", "Upcoming events"],
      ["Progress", "Your progress"],
      ["Photos", "Photos"],
      ["Biography", "About me"],
      ["Names & result sources", "Names and result sources"],
      ["Linked profiles", "Social profiles"],
      ["Sports & training", "Sports and training"],
      ["Sports nutrition", "Sports nutrition"],
      ["Technology", "Technology"],
      ["Clothing", "Clothing"],
      ["Recovery", "Recovery"],
      ["Buying preferences", "Buying preferences"],
      ["Privacy & consent", "Privacy and consent centre"],
      ["Profile sharing", "Public or private profile"],
      ["Partnerships", "Partnerships"],
    ]) {
      await go(label);
      await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    }
    await go("PBs & achievements");
    await page.getByRole("heading", { name: "PBs", exact: true }).waitFor();
    await go("Upcoming races");
    await page.getByRole("button", { name: "Add event", exact: true }).click();
    await page.getByLabel("Event name", { exact: true }).fill("Unsaved upcoming race");
    await go("My races");
    await go("Upcoming races");
    assert.equal(
      await page.getByLabel("Event name", { exact: true }).inputValue(),
      "Unsaved upcoming race",
    );
    await page.goto(`${origin}/athlete-account#profile-visibility`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Public or private profile", exact: true }).waitFor();
    await page.goto(`${origin}/athlete-account?section=unknown`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "My races", exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await nav.isVisible(), false);
    await page.getByRole("button", { name: "Profile sections My races", exact: true }).click();
    await nav.getByRole("link", { name: "Personal details", exact: true }).click();
    await page.getByRole("heading", { name: "Personal details", exact: true }).waitFor();
    assert.equal(await nav.isVisible(), false);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
    );
    await page.screenshot({ path: "artifacts/account-sidebar-mobile.png", fullPage: true });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: all 21 account sections, deep links/history, mobile navigation, saved and unsaved drafts, actual claim/remove/restore RPCs and unchanged official result.",
    );
  }
} catch (error) {
  await page?.screenshot({
    path: `artifacts/account-sidebar-${runrecs ? "runrecs" : "athrecs"}-failure.png`,
    fullPage: true,
  });
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
}
