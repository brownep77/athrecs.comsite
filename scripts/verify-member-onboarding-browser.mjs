import assert from "node:assert/strict";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { chromium } from "playwright";

// Component integration coverage: use the real form, schema, QueryClient and CSS.
// The fixture replaces server/router boundaries only and never uses live users,
// credentials, email providers, databases, or result ownership.
const project = process.cwd();
const root = resolve("artifacts/member-onboarding-fixture");
const artifacts = resolve("artifacts/member-onboarding");
mkdirSync(root, { recursive: true });
mkdirSync(artifacts, { recursive: true });
function file(name, content) {
  const target = resolve(root, name);
  writeFileSync(target, content);
  return target;
}
const router = file("router.tsx", `import React from 'react';
export function Link({to,children,...props}) { return <a href={to} {...props}>{children}</a>; }
export function useNavigate() { return async (destination) => { window.fixture.navigations.push(destination); }; }
`);
const accountApi = file("account-api.js", `
export const ATHLETE_SPORTS=['Running','Athletics','Trail running','Ultra running','Parkrun','Triathlon','Duathlon','Aquathlon','Cycling','Swimming','Rowing','OCR','Gym and fitness','Walking and hiking','Yoga and mobility','Other'];
export async function saveMyAthleteAccount({data}) {
  const state=window.fixture;
  state.saves.push(structuredClone(data));
  if (state.failProfile) { state.failProfile--; throw Error('Synthetic profile save interrupted. Please retry.'); }
  if (data.expectedUpdatedAt!==state.revision) throw Error('Synthetic stale profile revision');
  const updatedAt=String(state.saves.length);
  state.revision=updatedAt;
  state.account={...state.account,...structuredClone(data),updatedAt,exists:true};
  return structuredClone(state.account);
}
`);
const onboardingApi = file("onboarding-api.js", `
export async function completeMyOnboarding({data}) {
  const state=window.fixture;
  state.completions.push(structuredClone(data));
  if (state.failCompletion) { state.failCompletion--; throw Error('Synthetic completion interrupted. Please retry.'); }
  return structuredClone(data);
}
`);
file("index.html", '<!doctype html><html class="athrecs-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic AthRecs member onboarding</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
const preferences = {
  equipmentItems: [], equipmentBrands: [], equipmentModels: [], equipmentNotes: "",
  nutritionProducts: [], nutritionBrands: [], nutritionNotes: "", technologyDevices: [],
  technologyApps: [], technologyBrands: [], technologyNotes: "", clothingItems: [],
  clothingBrands: [], clothingSize: "", clothingFit: null, clothingNotes: "",
  recoveryProducts: [], recoveryBrands: [], recoveryNotes: "", purchaseChannels: [],
  purchasePriorities: [], annualSportsSpendBand: null,
};
const consents = { performanceInsights: true, personalisation: false, productResearch: true, marketing: false };
const initialAccount = {
  exists: false, userId: "synthetic-member-only", athleteProfileId: "synthetic-profile-only",
  athleteNumber: "TEST0001", verifiedEmail: "member@example.test", emailVerified: true,
  authName: "", fullName: "", displayName: "My chosen public name", dateOfBirth: "",
  country: "", region: "", city: "", postcode: "", nationality: "", clubOrTeam: "",
  preferredLanguage: "en", previousNames: [], parkrunId: "", athleticsUrn: "", powerOf10Url: "",
  worldAthleticsUrl: "", fingerprintEvent: "", fingerprintYear: "", fingerprintDistance: "",
  fingerprintTime: "", profilePhotoUrl: "", profilePhotoUpdatedAt: null,
  profilePhotoUploadAvailable: false, authImageUrl: "", privacyAcknowledged: false,
  updatedAt: null, sports: [], preferences, consents, claimedProfiles: [], claimedResults: [], claimCount: 0,
};
file("main.tsx", `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {MemberOnboardingForm} from '/@fs/${resolve("src/components/auth/MemberOnboardingForm.tsx")}';
import './style.css';
const account=${JSON.stringify(initialAccount)};
const mismatch=location.search.includes('mismatch');
if(mismatch) { account.exists=true; account.fullName='Current Synthetic Name'; account.updatedAt='original'; }
const initial=mismatch?{firstName:'Old',lastName:'Synthetic',roles:['athlete'],organisation:''}:null;
window.fixture={account,revision:account.updatedAt,saves:[],completions:[],navigations:[],failProfile:0,failCompletion:0};
const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main className="mx-auto max-w-3xl px-4 py-8 sm:px-8"><p className="mb-6 text-xs text-muted">FICTIONAL TEST DATA · NO LIVE ACCOUNTS OR EMAILS</p><div className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-8"><MemberOnboardingForm account={account} initial={initial} returnTo="/athletes?from=onboarding"/></div></main></QueryClientProvider>);
`);

let server;
let browser;
const pageErrors = [];
const completed = [];
try {
  server = await createServer({
    configFile: false,
    root,
    plugins: [react(), tailwind()],
    resolve: { alias: [
      { find: "@tanstack/react-router", replacement: router },
      { find: "@/lib/athrecs/athlete-account-api", replacement: accountApi },
      { find: "@/lib/athrecs/member-onboarding-api", replacement: onboardingApi },
      { find: "@", replacement: resolve("src") },
    ] },
    server: { host: "127.0.0.1", port: 0, fs: { allow: [project] } },
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const defaultExecutable = "/root/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell";
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || (existsSync(defaultExecutable) ? defaultExecutable : undefined),
    args: ["--no-sandbox"],
  });
  async function newPage(width, query = "") {
    const page = await browser.newPage({ viewport: { width, height: width < 640 ? 844 : 1000 } });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`${origin}/${query}`);
    await page.getByRole("heading", { name: "Complete your profile", exact: true }).waitFor();
    return page;
  }
  async function waitFor(page, predicate, message) {
    await page.waitForFunction(predicate);
    assert.ok(await page.evaluate(predicate), message);
  }
  async function assertViewport(page) {
    const geometry = await page.evaluate(() => ({
      viewport: innerWidth, body: document.body.scrollWidth, root: document.documentElement.scrollWidth,
    }));
    assert.ok(geometry.body <= geometry.viewport + 1 && geometry.root <= geometry.viewport + 1,
      `No horizontal overflow: ${JSON.stringify(geometry)}`);
  }
  async function fillAthlete(page) {
    await page.getByLabel("First names", { exact: true }).fill("Synthetic");
    await page.getByLabel("Last name", { exact: true }).fill("Athlete");
    await page.getByLabel("Country of residence", { exact: true }).fill("United Kingdom");
    await page.getByLabel("Main sport", { exact: true }).selectOption("Running");
    await page.getByLabel("Nationality", { exact: true }).fill("British");
    await page.getByLabel("Date of birth", { exact: true }).fill("1990-01-01");
    await page.getByLabel("Postcode / ZIP / area (private)", { exact: true }).fill("TEST AREA");
    await page.getByLabel("Current club or team (optional)", { exact: true }).fill("Fictional Test Club");
    await page.getByLabel("Previous racing names (one per line)", { exact: true }).fill("Synthetic Earlier\nSynthetic Other");
    await page.getByLabel("parkrun barcode", { exact: true }).fill("A1234567");
    await page.getByLabel("Power of 10 profile link", { exact: true }).fill("https://example.test/synthetic-profile");
    await page.getByLabel("A race you completed", { exact: true }).fill("Fictional Test Race");
    await page.getByLabel("Race year", { exact: true }).fill("2025");
    await page.getByLabel("Distance", { exact: true }).fill("10 km");
    await page.getByLabel("Finish time", { exact: true }).fill("45:00");
    await page.getByText("Your kit and nutrition — optional", { exact: true }).click();
    const kit = [
      ["Trainer / equipment brands", "Synthetic Shoes,Other Synthetic"],
      ["Trainer models", "Fictional Model"], ["Sports clothing brands", "Synthetic Clothes"],
      ["Nutrition brands", "Synthetic Nutrition"], ["Nutrition products", "Fictional Gel"],
      ["Watch / devices", "Synthetic Watch"], ["Training apps", "Synthetic App"],
    ];
    for (const [label, value] of kit) await page.getByLabel(`${label} (comma separated)`, { exact: true }).fill(value);
    await page.getByRole("checkbox", { name: "I have read the", exact: false }).check();
  }
  const submitAthlete = (page) => page.getByRole("button", { name: "Save profile and find my results", exact: true }).click();

  for (const width of [1280, 390]) {
    const page = await newPage(width);
    assert.equal(await page.getByRole("checkbox").count(), 8, "Seven role choices plus privacy acknowledgement");
    await assertViewport(page);
    await page.keyboard.press("Tab");
    assert.equal(await page.getByRole("checkbox", { name: "Athlete", exact: true }).evaluate((element) => element === document.activeElement), true, "Keyboard reaches role choice");
    assert.equal(await page.getByRole("checkbox", { name: "Athlete", exact: true }).evaluate((element) => {
      const styles = getComputedStyle(element.closest("label"));
      return styles.boxShadow !== "none";
    }), true, "Keyboard focus has a visible ring on the role card");
    await submitAthlete(page);
    assert.equal(await page.evaluate(() => window.fixture.saves.length), 0, "Required inputs block an empty submission");
    assert.equal(await page.getByLabel("First names", { exact: true }).evaluate((element) => element.validity.valueMissing), true);
    await page.getByRole("checkbox", { name: "Athlete", exact: true }).uncheck();
    assert.equal(await page.getByRole("button", { name: "Save profile and continue", exact: true }).isDisabled(), true, "No roles cannot submit");
    await page.getByRole("checkbox", { name: "Athlete", exact: true }).check();
    for (const role of ["Coach", "Running / sports club representative", "Race director / organiser", "Timing / results provider", "Supporter / spectator", "AthRecs staff — request access"]) {
      await page.getByRole("checkbox", { name: role, exact: true }).check();
      assert.equal(await page.getByRole("checkbox", { name: role, exact: true }).isChecked(), true);
    }
    await page.getByText("Role choices do not grant staff or organisation access.", { exact: false }).waitFor();
    await fillAthlete(page);
    await page.getByLabel("Organisation / business (optional)", { exact: true }).fill("Synthetic Test Organisation");
    await assertViewport(page);
    await page.screenshot({ path: resolve(artifacts, `athlete-${width}.png`), fullPage: true });
    await page.evaluate(() => { window.fixture.failProfile = 1; });
    await submitAthlete(page);
    await page.getByRole("alert").filter({ hasText: "Synthetic profile save interrupted" }).waitFor();
    let state = await page.evaluate(() => window.fixture);
    assert.equal(state.saves.length, 1);
    assert.equal(state.saves[0].expectedUpdatedAt, null);
    assert.equal(state.completions.length, 0, "Failed account save never completes onboarding");
    assert.equal(state.navigations.length, 0);
    assert.equal(await page.getByLabel("First names", { exact: true }).inputValue(), "Synthetic");
    assert.equal(await page.getByLabel("Trainer models (comma separated)", { exact: true }).inputValue(), "Fictional Model");
    await page.evaluate(() => { window.fixture.failCompletion = 1; });
    await submitAthlete(page);
    await page.getByRole("alert").filter({ hasText: "Synthetic completion interrupted" }).waitFor();
    state = await page.evaluate(() => window.fixture);
    assert.equal(state.saves.length, 2);
    assert.equal(state.saves[1].expectedUpdatedAt, null, "Failed profile save did not advance the revision");
    assert.equal(state.account.updatedAt, "2");
    assert.equal(state.completions.length, 1);
    assert.equal(state.navigations.length, 0, "Failed completion does not navigate away");
    await submitAthlete(page);
    await waitFor(page, () => window.fixture.navigations.length === 1, "Retry finishes onboarding");
    state = await page.evaluate(() => window.fixture);
    assert.equal(state.saves.length, 3);
    assert.equal(state.saves[2].expectedUpdatedAt, "2", "Completion retry uses the newly saved revision rather than the stale loaded account");
    assert.equal(state.completions.length, 2);
    assert.equal(state.saves[2].fullName, "Synthetic Athlete");
    assert.equal(state.saves[2].displayName, initialAccount.displayName, "User-selected public name is preserved");
    assert.deepEqual(state.saves[2].consents, consents, "Sharing and marketing choices remain unchanged");
    assert.deepEqual(state.saves[2].preferences.equipmentBrands, ["Synthetic Shoes", "Other Synthetic"]);
    assert.deepEqual(state.saves[2].preferences.technologyApps, ["Synthetic App"]);
    assert.deepEqual(state.saves[2].previousNames, ["Synthetic Earlier", "Synthetic Other"]);
    assert.deepEqual(state.completions[1].roles, ["athlete", "coach", "club", "organiser", "timing", "supporter", "staff_request"]);
    assert.equal(state.completions[1].organisation, "Synthetic Test Organisation");
    assert.equal(state.navigations[0].href, "/athletes?from=onboarding", "Intended same-site destination survives saving");
    assert.equal(state.navigations[0].replace, true);
    assert.equal(state.saves[2].claimedResults.length, 0, "Profile saving does not manufacture result ownership");
    completed.push(`athlete ${width}px: required fields, roles, preferences, consent/display name preservation, failed account save and failed completion retries`);
    await page.close();
  }

  const supporter = await newPage(390);
  await supporter.getByRole("checkbox", { name: "Athlete", exact: true }).uncheck();
  await supporter.getByRole("checkbox", { name: "Supporter / spectator", exact: true }).check();
  assert.equal(await supporter.getByLabel("Date of birth", { exact: true }).count(), 0, "Supporters do not have to supply athlete DOB");
  assert.equal(await supporter.getByLabel("Nationality", { exact: true }).count(), 0);
  assert.equal(await supporter.getByLabel("Main sport", { exact: true }).count(), 0);
  assert.equal(await supporter.getByLabel("parkrun barcode", { exact: true }).count(), 0);
  await supporter.getByLabel("First names", { exact: true }).fill("Synthetic");
  await supporter.getByLabel("Last name", { exact: true }).fill("Supporter");
  await supporter.getByLabel("Country of residence", { exact: true }).fill("United Kingdom");
  await supporter.getByRole("checkbox", { name: "I have read the", exact: false }).check();
  await assertViewport(supporter);
  await supporter.screenshot({ path: resolve(artifacts, "supporter-390.png"), fullPage: true });
  await supporter.getByRole("button", { name: "Save profile and continue", exact: true }).click();
  await waitFor(supporter, () => window.fixture.navigations.length === 1, "Supporter completes without athlete-only fields");
  assert.deepEqual(await supporter.evaluate(() => window.fixture.completions[0].roles), ["supporter"]);
  assert.deepEqual(await supporter.evaluate(() => window.fixture.saves[0].consents), consents);
  completed.push("supporter 390px: reduced required fields, profile persistence, privacy acknowledgement, no horizontal overflow");
  await supporter.close();

  const mismatch = await newPage(1280, "?mismatch=true");
  await mismatch.getByText("Your saved name is Current Synthetic Name.", { exact: false }).waitFor();
  assert.equal(await mismatch.getByLabel("First names", { exact: true }).inputValue(), "");
  assert.equal(await mismatch.getByLabel("Last name", { exact: true }).inputValue(), "");
  await submitAthlete(mismatch);
  assert.equal(await mismatch.evaluate(() => window.fixture.saves.length), 0, "Stale onboarding names cannot silently overwrite the current saved name");
  await fillAthlete(mismatch);
  await mismatch.getByLabel("First names", { exact: true }).fill("Current Synthetic");
  await mismatch.getByLabel("Last name", { exact: true }).fill("Name");
  await submitAthlete(mismatch);
  await waitFor(mismatch, () => window.fixture.navigations.length === 1, "Reconfirmed current name saves successfully");
  const mismatchState = await mismatch.evaluate(() => window.fixture);
  assert.equal(mismatchState.saves[0].expectedUpdatedAt, "original");
  assert.equal(mismatchState.saves[0].fullName, "Current Synthetic Name");
  assert.equal(mismatchState.completions[0].firstName, "Current Synthetic");
  completed.push("existing account: stale onboarding names require explicit first/last-name confirmation and preserve the saved name");
  await mismatch.close();
  assert.deepEqual(pageErrors, [], "No uncaught browser exceptions");
  const report = { passed: true, fixture: "real form, schema, React Query and styles; mocked server/router boundaries", scenarios: completed };
  writeFileSync(resolve(artifacts, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await server?.close();
  rmSync(root, { recursive: true, force: true });
}
