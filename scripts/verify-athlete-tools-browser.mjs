// The actual React components with synthetic API responses; never contacts a live database.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const require = createRequire(import.meta.url),
  { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const root = resolve("artifacts/athlete-tools-fixture");
mkdirSync(root, { recursive: true });
const file = (name, text) => {
  const path = resolve(root, name);
  writeFileSync(path, text);
  return path;
};
const api = file(
  "link-api.js",
  `window.saves=[];window.checks=[];window.failSave=false;
export async function checkAthleteLink({data}){window.checks.push(data);if(data.url.includes('unsupported.test'))throw Error('Use an individual World Athletics, Power of 10 or UK Parkrun profile link.');let existing=data.url.endsWith('-9');return {source:{provider:'worldathletics',label:'World Athletics',externalId:existing?'9':'1',url:data.url},name:data.name,searchName:data.searchName,version:'a'.repeat(64),state:existing?'existing':data.name?'review':'needs_name',totalCandidates:existing?1:0,candidates:existing?[{key:'athlete:9',id:9,number:'123',name:'Avery Test Athlete',club:'Example Club',country:'',managed:false,visibility:'private',exact:true,conflictingSource:false}]:[]};}
export async function saveAthleteLink({data}){window.saves.push(data);if(window.failSave)throw Error('Synthetic interrupted response. Retry the same save.');return {athleteId:9,athleteNumber:'123',name:data.name,created:data.action==='create',replay:window.saves.length>1};}`,
);
const workspace = file(
  "workspace-api.js",
  `const profile={id:9,slug:'avery-test-athlete',profile_visibility:'private',display_name:'Avery Test Athlete',given_name:'',family_name:'',gender:'U',source_club_name:'',city:'',county:'',country:'',bio:''};
export async function getStaffWorkspace({data}){return {profile:data.athleteId?profile:null,profileVersion:'version',editable:true,linked:[],results:[],batches:[],email:'staff@example.test'};}
export async function searchStaffAthletes(){return [{id:9,name:'Avery Test Athlete',club:'',visibility:'private',slug:'avery-test-athlete'}];}
export async function getStaffResultBatch(){throw Error('No batch in this synthetic fixture');}
export async function editStaffAthlete(){return {saved:true};}`,
);
const upload = file(
  "upload-api.js",
  `export async function checkRaceUpload(){return {rows:[],summary:{total:0,new:0,review:0,duplicate:0,blocked:0,identitiesChecked:0},reviewHash:'a'.repeat(64)};}
export async function importCheckedRaceUpload(){throw Error('No result imports in this isolated fixture');}export async function downloadResultsUploadTemplate(){throw Error('Not used in this fixture');}`,
);
const directory = file(
  "directory-api.js",
  `export async function getStaffAthleteDirectory(){return {athletes:[{athleteNumber:'123',athrecsId:'ATH-000123',name:'Avery Test Athlete',sports:['Running'],club:'Example Club',city:'',country:'',visibility:'Private',resultCount:2,registered:false,canPublish:true,sources:[{id:9,slug:'avery-test-athlete'}],details:{}}],total:1,totalStored:1,page:1,pages:1,sports:['Running'],publishableTotal:1};}
export async function exportStaffAthleteDirectory(){throw Error('No private export in this test');}export async function selectAllStaffAthleteProfiles(){return [];}export async function publishStaffAthleteProfiles(){throw Error('No publication in this test');}`,
);
const suggestions = file(
  "suggestions-api.js",
  "export async function getProfileEdits(){return [];}export async function reviewProfileEdit(){return {saved:true};}",
);
const upcoming = file(
  "upcoming-api.js",
  "export async function getMyUpcoming(){return [];}export async function getStaffUpcoming(){return [];}export async function saveMyUpcoming(){}export async function saveStaffUpcoming(){}export async function deleteMyUpcoming(){}export async function deleteStaffUpcoming(){}",
);
const clubs = file(
  "clubs-api.js",
  "export async function getClubScans(){return {runs:[],clubs:[],candidates:[],total:0,jobs:[],problems:[],counts:[],runId:null};}export async function startClubScan(){}export async function stepClubScan(){}export async function controlClubScan(){}export async function reviewClubResults(){}export async function publishClubResults(){}export async function recheckClubResults(){}export async function findClubAthletes(){return [];}export async function getClubReviewHistory(){return [];}",
);
const router = file(
  "router.tsx",
  'import React from "react";export function Link({to,children,...props}){return <a href={to} {...props}>{children}</a>}',
);
const invitation = file(
  "invitation-api.js",
  `
window.invitationCreates=[];window.invitationEmails=[];window.directorySearches=[];window.matchSearches=[];
let contact={phone:null,telegramUsername:null,socialLinks:[],sourceNote:''};
const account=()=>({userId:'synthetic-runner',athleteNumber:'456',name:'Name not supplied',email:'runner@example.test',emailVerified:true,linkedProfiles:0,invitation:null,profileConnections:[],marketingConsent:false,contact});
export async function findDirectoryInvitationAccounts({data}){window.directorySearches.push(data);return {registered:false,athleteId:9,total:data.q==='missing@example.test'?0:1,page:1,pageSize:25,accounts:data.q==='missing@example.test'?[]:[account()]};}
export async function findStaffClaimMatches({data}){window.matchSearches.push(data);return {candidates:[{id:9,name:'Avery Test Athlete',slug:'avery-test-athlete',clubName:'Example Club',resultCount:2,reasons:['Manual search result — check identity'],blocked:null,recentResults:[{race:'Synthetic Race',date:'2026-01-01',distance:'10K'}]}],hasSavedName:false,moreMatches:false,history:[],emailAvailable:true};}
export async function createStaffClaimInvitation({data}){window.invitationCreates.push(data);return {id:'synthetic-invitation',url:'https://www.athrecs.com/claim-results?resultId=9&invitation='+ 'a'.repeat(64),reused:window.invitationCreates.length>1};}
export async function emailStaffClaimInvitation({data}){window.invitationEmails.push(data);return {status:'sent'};}
export async function revokeStaffClaimInvitation(){return {revoked:true};}
export async function saveStaffAthleteContact({data}){contact={...data};return {saved:true};}
`,
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>AthRecs athlete tools — synthetic preview</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "main.tsx",
  `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{AthleteTools}from'/@fs/${resolve("src/components/admin/AthleteTools.tsx")}';import'./style.css';const client=new QueryClient({defaultOptions:{queries:{retry:false}}});createRoot(document.getElementById('root')!).render(<QueryClientProvider client={client}><main style={{maxWidth:1280,margin:'auto',padding:20}}><p style={{fontSize:12,marginBottom:16}}>DESIGN PREVIEW · FICTIONAL ATHLETE · NO LIVE SAVES</p><AthleteTools/></main></QueryClientProvider>);`,
);
const aliases = {
  "@/lib/athlete-link/api": api,
  "@/lib/athlete-workspace/api": workspace,
  "@/lib/staff-results-upload/api": upload,
  "@/lib/athrecs/staff-athlete-directory-api": directory,
  "@/lib/athrecs/profile-edit-suggestions-api": suggestions,
  "@/lib/athrecs/athlete-upcoming-api": upcoming,
  "@/lib/athrecs/athlete-account-api": file("sports.js", "export const ATHLETE_SPORTS=[];"),
  "@/lib/athrecs/claim-invitations-api": invitation,
  "@/lib/athrecs/athlete-contact-api": invitation,
  "@/lib/club-scanner/api": clubs,
  "@tanstack/react-router": router,
};
const server = await createServer({
  configFile: false,
  root,
  cacheDir: resolve(root, ".vite"),
  plugins: [react(), tailwindcss()],
  define: { "import.meta.env.VITE_SITE_BRAND": JSON.stringify("athrecs") },
  resolve: {
    alias: [
      ...Object.entries(aliases).map(([find, replacement]) => ({ find, replacement })),
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 8112, strictPort: true, fs: { allow: [process.cwd()] } },
});
await server.listen();
if (process.env.ATHRECS_HUB_PREVIEW === "1") {
  console.log("Synthetic athlete tools preview: http://127.0.0.1:8112");
  await new Promise(() => {});
}
const browser = await chromium.launch({ headless: true });
let page;
try {
  page = await browser.newPage({ viewport: { width: 1365, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("Browser error:", e.message);
  });
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.goto("http://127.0.0.1:8112");
  await page.getByRole("heading", { name: "Add or update athletes" }).waitFor();
  const nav = page.getByRole("navigation", { name: "Athlete tools" });
  const url = page.getByLabel("Athlete profile link", { exact: true }),
    name = page.getByLabel(/Name shown on the source/),
    check = page.getByRole("button", { name: "Check link & existing profiles" });
  await url.fill("https://unsupported.test/athlete");
  await check.click();
  await page.getByRole("alert").waitFor();
  await url.fill("https://worldathletics.org/athletes/test/avery-1");
  await check.click();
  await page.getByRole("heading", { name: "Confirm the source name" }).waitFor();
  assert(await name.evaluate((e) => document.activeElement === e));
  await name.fill("Avery Test Athlete");
  await check.click();
  await page.getByRole("heading", { name: "Choose the athlete to update" }).waitFor();
  await page.getByLabel("Create a new private profile for Avery Test Athlete").check();
  const save = page.getByRole("button", { name: "Create private athlete profile" });
  assert(await save.isDisabled());
  await page
    .getByLabel("Identity evidence / review note")
    .fill("Synthetic check of the named official profile and its stable provider ID.");
  await page
    .getByLabel(
      "I opened the source, checked the athlete’s identity and name, and am authorised to save this profile or source link.",
    )
    .check();
  assert(await save.isEnabled());
  // Switching tools must preserve source inputs, review choices and an uploaded file.
  await nav.getByRole("button", { name: "Results file", exact: true }).click();
  await page.getByRole("heading", { name: "Import athletes & race results" }).waitFor();
  assert.equal(await page.getByLabel("Race name", { exact: true }).inputValue(), "");
  assert.equal(await page.getByLabel("The file’s “Time” column means").inputValue(), "unspecified");
  await page.getByLabel("Choose Excel or CSV race results").setInputFiles({
    name: "synthetic.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Name,Time\nTest,00:40:00"),
  });
  await page.getByText("File ready: synthetic.csv", { exact: true }).waitFor();
  await nav.getByRole("button", { name: "Single athlete", exact: true }).click();
  assert.equal(await name.inputValue(), "Avery Test Athlete");
  assert(await save.isEnabled());
  await page.screenshot({ path: "artifacts/athlete-tools-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: "artifacts/athlete-tools-mobile.png", fullPage: true });
  await page.evaluate(() => {
    window.failSave = true;
  });
  await save.click();
  await page.getByRole("alert").waitFor();
  assert(await save.isEnabled());
  await page.evaluate(() => {
    window.failSave = false;
  });
  await save.click();
  await page.getByRole("heading", { name: "Private athlete profile created" }).waitFor();
  const saves = await page.evaluate(() => window.saves);
  assert.equal(saves.length, 2);
  assert.deepEqual(saves[0], saves[1], "A failed response keeps the same save request");
  await page.getByRole("button", { name: "Open profile & review results" }).click();
  await page.getByRole("heading", { name: "Edit Avery Test Athlete" }).waitFor();
  await nav.getByRole("button", { name: "Results file", exact: true }).click();
  await page.getByText("File ready: synthetic.csv", { exact: true }).waitFor();
  await nav.getByRole("button", { name: "Find profiles", exact: true }).click();
  await page
    .getByRole("button", { name: "Match and invite Avery Test Athlete (ATH-000123)" })
    .click();
  await page.getByRole("heading", { name: "Match & invite · Avery Test Athlete" }).waitFor();
  await page.getByLabel("Find the athlete’s signup").fill("missing@example.test");
  await page.getByRole("button", { name: "Find signup", exact: true }).click();
  await page.getByText(/No signup found/).waitFor();
  await page.getByLabel("Find the athlete’s signup").fill("runner@example.test");
  await page.getByRole("button", { name: "Find signup", exact: true }).click();
  await page.getByRole("button", { name: "Choose recipient", exact: true }).click();
  const shareInvite = page.getByRole("button", {
    name: "Create WhatsApp / Viber / Telegram invitation",
    exact: true,
  });
  await shareInvite.waitFor();
  assert(await shareInvite.isDisabled());
  assert.equal(
    await page.getByLabel("Search existing athlete profiles").count(),
    0,
    "Directory keeps the exact source profile selected",
  );
  assert.equal((await page.evaluate(() => window.matchSearches)).at(-1).athleteId, 9);
  await page
    .getByLabel("Why this may be their profile")
    .fill("Synthetic athlete confirmed the race and club.");
  await page
    .getByLabel(
      "I checked the recipient and selected profile. This is an invitation to confirm, not an ownership approval.",
    )
    .check();
  await shareInvite.click();
  await page.getByRole("link", { name: "Open Viber invitation" }).waitFor();
  assert.equal((await page.evaluate(() => window.invitationCreates)).length, 1);
  assert.equal(
    (await page.evaluate(() => window.invitationEmails)).length,
    0,
    "Creating a social invitation does not send email",
  );
  const privateUrl = await page.getByLabel("Private claim link").inputValue();
  assert.equal(
    new URL(
      await page.getByRole("link", { name: "Open Telegram invitation" }).getAttribute("href"),
    ).searchParams.get("url"),
    privateUrl,
  );
  assert(
    new URL(
      await page.getByRole("link", { name: "Open WhatsApp invitation" }).getAttribute("href"),
    ).searchParams
      .get("text")
      .includes(privateUrl),
  );
  assert(
    new URL(
      await page.getByRole("link", { name: "Open Viber invitation" }).getAttribute("href"),
    ).searchParams
      .get("text")
      .startsWith(privateUrl),
  );
  // Contact changes refresh the selected account inside the directory, without a reload.
  await page.getByRole("button", { name: "Edit contact details" }).click();
  await page.getByLabel("Phone (international format)").fill("+447700900123");
  await page.getByLabel("Telegram username (optional)").fill("synthetic_athlete");
  await page.getByLabel("Contact details source").fill("Synthetic athlete confirmed the details.");
  await page.getByRole("button", { name: "Save private contact details" }).click();
  await page.getByText(/WhatsApp: \+447700900123/).waitFor();
  assert.equal(
    new URL(await page.getByRole("link", { name: "Open Telegram invitation" }).getAttribute("href"))
      .pathname,
    "/synthetic_athlete",
  );
  assert.equal(
    new URL(await page.getByRole("link", { name: "Open WhatsApp invitation" }).getAttribute("href"))
      .pathname,
    "/447700900123",
  );
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: "artifacts/athlete-directory-invites-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1365, height: 1000 });
  await page.screenshot({
    path: "artifacts/athlete-directory-invites-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Email claim invitation", exact: true }).click();
  await page.getByText(/Invitation sent from support@athrecs.com/).waitFor();
  assert.equal((await page.evaluate(() => window.invitationEmails)).length, 1);
  await page.getByRole("button", { name: "Show all signups" }).click();
  assert.equal(
    await page.getByLabel("Private claim link").count(),
    0,
    "Changing recipient clears the private invitation",
  );
  await nav.getByRole("button", { name: "Club scans", exact: true }).click();
  await page.getByRole("heading", { name: "Club athlete scanner" }).waitFor();
  await nav.getByRole("button", { name: "Single athlete", exact: true }).click();
  await url.fill("https://worldathletics.org/athletes/test/avery-9");
  await check.click();
  await page.getByRole("heading", { name: "This source profile is already recorded" }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Create private athlete profile" }).count(),
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: actual combined React screen, directory profile-to-signup matching, email and three social invitation links, contact refresh, private-save gates/retry, profile handoff, empty upload defaults and tab/file retention; desktop/mobile. API responses are synthetic.",
  );
} catch (e) {
  if (page) await page.screenshot({ path: "artifacts/athlete-tools-failure.png", fullPage: true });
  throw e;
} finally {
  await browser.close();
  await server.close();
  rmSync(root, { recursive: true, force: true });
}
