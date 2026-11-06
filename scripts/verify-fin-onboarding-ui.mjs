// Local UI-only verification: real components, synthetic APIs, no external requests.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile, symlink } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = await mkdtemp(join(tmpdir(), "athrecs-fin-ui-"));
const artifacts = resolve(repo, process.env.ATHRECS_FIN_UI_ARTIFACTS || "artifacts/fin-onboarding");
await mkdir(artifacts, { recursive: true });
const require = createRequire(`${repo}/package.json`);
const { createServer } = await import(pathToFileURL(require.resolve("vite")));
const react = (await import(pathToFileURL(require.resolve("@vitejs/plugin-react")))).default;
const tailwind = (await import(pathToFileURL(require.resolve("@tailwindcss/vite")))).default;
const { chromium } = require("playwright");
await mkdir(fixture, { recursive: true });
await symlink(`${repo}/node_modules`, `${fixture}/node_modules`).catch((e) => {
  if (e.code !== "EEXIST") throw e;
});
const files = {
  "index.html":
    '<html class="athrecs-theme"><head></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
  "router.tsx": `import React from 'react';
export const createFileRoute = () => options => { window.joinOptions=options; return {options,useSearch:()=>options.validateSearch(window.fixture.search)}; };
export function Link({to,search,hash,params,children,...rest}) { let path=to; if(params)for(const [key,value] of Object.entries(params))path=path.replace('$'+key,encodeURIComponent(String(value))); const query=new URLSearchParams(Object.entries(search||{}).filter(([,value])=>value!==undefined).map(([key,value])=>[key,String(value)])).toString(); return <a {...rest} href={path+(query?'?'+query:'')+(hash?'#'+hash:'')}>{children}</a>; }`,
  "auth.ts": `export function useCurrentUserState(){return {user:window.fixture.user,isPending:window.fixture.sessionPending||false,hasSessionError:window.fixture.sessionError||false};}
export function openAthleteAuth(options){window.authCalls.push(options);}`,
  "api.ts": `export const ATHLETE_SPORTS=['Running','Swimming'];
export async function getMyAthleteAccount(){return window.fixture.account;}
export async function saveMyAthleteAccount(){window.saveCalls++;throw new Error('No save allowed in this UI test');}
export async function saveMyProfileSetup(){window.saveCalls++;throw new Error('No save allowed in this UI test');}
export async function resumeFinOnboarding({data}){window.resumeCalls.push(data);const response=window.fixture.response;if(window.fixture.responseMode==='deferred')return await new Promise(resolve=>window.resolveResume=()=>resolve(response));if(window.fixture.responseMode==='error')throw new Error('Synthetic server detail should not render');await new Promise(resolve=>setTimeout(resolve,80));return response;}
export async function startMyFinResearch(){window.researchCalls=(window.researchCalls||[]).concat(['start']);throw new Error('Research must not start unless the athlete asks');}
export async function getMyFinResearch(){return {status:'unavailable'};}
export async function reviewMyFinResearch(){return {status:'unavailable'};}
export async function saveMyFinResearchDraft(){window.saveCalls++;throw new Error('No save allowed in this UI test');}
export async function supplyMyFinResultLink(){return {status:'unavailable'};}
export async function continueMyFinProfile(){return {status:'profile_setup_continued'};}`,
  "panels.tsx": `import React from 'react';export function PotentialResultMatchesPanel(){return <div>Existing stored-result panel</div>;}export function ProfileClaimGuide(){return <div>Existing claim guide</div>;}export function ProfileResultsSetup(){return <div>Existing profile setup</div>;}`,
  "styles.css": `@import "${repo}/src/styles.css";\n@source "${repo}/src";\n@source "./";`,
  "main.tsx": `import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {QueryClient,QueryClientProvider} from '@tanstack/react-query';import {Route} from '${repo}/src/routes/join.tsx';import './styles.css';
window.fixture={search:{},user:null,account:null};window.authCalls=[];window.resumeCalls=[];window.saveCalls=0;
const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});const Page=Route.options.component;
function App(){const [,force]=useState(0);window.setFixture=(patch)=>{Object.assign(window.fixture,patch);if(window.fixture.user&&window.fixture.account)client.setQueryData(['my-athlete-account',window.fixture.user.id],window.fixture.account);force(v=>v+1);};return <QueryClientProvider client={client}><main className="mx-auto max-w-7xl px-4 py-6"><Page/></main></QueryClientProvider>;}
createRoot(document.getElementById('root')).render(<App/>);`,
};
for (const [name, source] of Object.entries(files)) await writeFile(join(fixture, name), source);
const alias = [
  ["@tanstack/react-router", `${fixture}/router.tsx`],
  ["@/lib/auth/use-current-user", `${fixture}/auth.ts`],
  ["@/lib/auth/client", `${fixture}/auth.ts`],
  ["@/lib/athrecs/athlete-account-api", `${fixture}/api.ts`],
  ["@/lib/athrecs/profile-setup-api", `${fixture}/api.ts`],
  ["@/lib/athrecs/fin-onboarding-api", `${fixture}/api.ts`],
  ["@/lib/athrecs/fin-research-api", `${fixture}/api.ts`],
  ["@/components/athletes/PotentialResultMatchesPanel", `${fixture}/panels.tsx`],
  ["@/components/athletes/ProfileClaimGuide", `${fixture}/panels.tsx`],
  ["@/components/athletes/ProfileResultsSetup", `${fixture}/panels.tsx`],
  ["@", `${repo}/src`],
].map(([find, replacement]) => ({ find, replacement }));
const server = await createServer({
  root: fixture,
  configFile: false,
  plugins: [react(), tailwind()],
  resolve: { alias },
  server: { host: "127.0.0.1", port: 18361, strictPort: true, fs: { allow: [repo, fixture] } },
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({
    executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:18361", { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.setFixture));
  const token = "a".repeat(43);
  const change = (patch) => page.evaluate((p) => window.setFixture(p), patch);
  const user = { id: "synthetic-user-a", isDevFallback: false };
  const account = {
    userId: user.id,
    exists: false,
    emailVerified: true,
    fullName: "Registered Athlete",
    claimedProfiles: [],
    preferences: {},
    consents: {},
    profileDetails: {},
  };
  const response = {
    status: "ready",
    racingName: "Synthetic Racing Name",
    eventName: "Synthetic 10K",
    year: 2025,
    expiresAt: "2026-11-07T12:00:00Z",
    accountStatus: "verified_new_signup",
  };
  await change({
    search: { continuation: token, from: "strava" },
    user: null,
    account: null,
    response,
  });
  await page.getByRole("heading", { name: "Continue your AthRecs search" }).waitFor();
  assert.equal(await page.evaluate(() => window.resumeCalls.length), 0);
  await page.getByRole("button", { name: "Create my account with email" }).click();
  await page.getByRole("button", { name: "Already have an account? Sign in" }).click();
  const expected = `/join?step=profile&from=strava&continuation=${token}`;
  for (const call of await page.evaluate(() => window.authCalls))
    assert.equal(call.callbackURL, expected);
  assert.equal(await page.getByText("Synthetic Racing Name", { exact: true }).count(), 0);
  const privateMeta = await page.evaluate(() =>
    window.joinOptions.head({
      match: { search: window.joinOptions.validateSearch(window.fixture.search) },
    }),
  );
  assert.deepEqual(
    privateMeta.meta.find((tag) => tag.name === "robots"),
    { name: "robots", content: "noindex, nofollow, noarchive" },
  );
  assert(privateMeta.meta.some((tag) => tag.name === "referrer" && tag.content === "no-referrer"));
  assert.equal(privateMeta.links[0].href, "https://www.athrecs.com/join");
  const normalMeta = await page.evaluate(() =>
    window.joinOptions.head({ match: { search: window.joinOptions.validateSearch({}) } }),
  );
  assert(normalMeta.meta.find((tag) => tag.name === "robots").content.startsWith("index,"));
  assert(!normalMeta.meta.some((tag) => tag.name === "referrer"));
  assert.equal(
    await page.evaluate(() => window.joinOptions.headers({ match: { search: {} } })),
    undefined,
  );
  assert.equal(
    await page.evaluate(
      () => window.joinOptions.validateSearch({ continuation: "invalid" }).continuation,
    ),
    undefined,
  );
  await change({ user, account: { ...account, emailVerified: false } });
  await page.getByRole("button", { name: "Verify with an email code" }).click();
  assert.equal(await page.evaluate(() => window.authCalls.at(-1).callbackURL), expected);
  assert.equal(await page.getByRole("button", { name: "Continue my search" }).count(), 0);
  await change({ user, account });
  await page.getByRole("button", { name: "Continue my search" }).waitFor();
  assert.equal(
    await page.evaluate(() => window.resumeCalls.length),
    0,
    "No mutation on verified account mount",
  );
  await page.getByRole("button", { name: "Continue my search" }).click();
  await page.getByText("Synthetic Racing Name", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.resumeCalls), [{ continuation: token }]);
  assert.equal(
    await page.getByLabel("Your full racing name", { exact: true }).inputValue(),
    "Registered Athlete",
    "Search hint must not overwrite profile draft",
  );
  assert.equal(await page.evaluate(() => window.saveCalls), 0);
  assert.equal(
    await page.getByRole("link", { name: "Set up my private profile" }).getAttribute("href"),
    "#private-profile-setup",
  );
  assert.equal(
    await page.getByRole("link", { name: "Find matching athlete profiles" }).getAttribute("href"),
    "/athletes?q=Synthetic+Racing+Name",
  );
  await page.screenshot({ path: join(artifacts, "desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: join(artifacts, "mobile.png"), fullPage: true });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "Mobile page must not overflow",
  );
  await change({ account: { ...account, exists: true } });
  await page.getByRole("link", { name: "Review stored results" }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Review stored results" }).getAttribute("href"),
    "/athlete-account?section=potential",
  );
  await change({ search: { continuation: "b".repeat(43) }, responseMode: "error" });
  await page.getByRole("button", { name: "Continue my search" }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(await page.getByText("Synthetic server detail should not render").count(), 0);
  await page.evaluate(() => (window.fixture.responseMode = "ready"));
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByText("Synthetic Racing Name", { exact: true }).waitFor();
  await change({ search: { continuation: "c".repeat(43) }, response: { status: "unavailable" } });
  await page.getByRole("button", { name: "Continue my search" }).click();
  await page.getByText(/This saved search is no longer available/).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Find my results", exact: true }).getAttribute("href"),
    "/athlete-account?section=potential",
  );
  await change({ search: { continuation: "d".repeat(43) }, response: { status: "verify_email" } });
  await page.getByRole("button", { name: "Continue my search" }).click();
  await page.getByRole("button", { name: "Verify with an email code" }).click();
  assert.equal(
    await page.evaluate(() => window.authCalls.at(-1).callbackURL),
    `/join?step=profile&continuation=${"d".repeat(43)}`,
  );
  await change({ search: { continuation: "e".repeat(43) }, response, responseMode: "deferred" });
  await page.getByRole("button", { name: "Continue my search" }).click();
  await page.waitForFunction(() => Boolean(window.resolveResume));
  const second = { ...user, id: "synthetic-user-b" };
  await change({ user: second, account: { ...account, userId: second.id, exists: true } });
  await page.getByRole("button", { name: "Continue my search" }).waitFor();
  await page.evaluate(() => window.resolveResume());
  await page.waitForTimeout(200);
  assert.equal(
    await page.getByText("Synthetic Racing Name", { exact: true }).count(),
    0,
    "Old account response must not appear after account switch",
  );
  assert.equal(await page.evaluate(() => window.saveCalls), 0);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real join/continuation UI with mocked APIs: callback preservation, conditional metadata, no automatic binding, verified gate, explicit resume, no profile overwrite, native next actions, mobile layout, retries, expired links, stale email verification and account-switch isolation.",
  );
} finally {
  await browser?.close();
  await server.close();
  await rm(fixture, { recursive: true, force: true });
}
