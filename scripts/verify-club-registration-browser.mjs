import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { chromium } from "playwright";

const root = resolve("artifacts/club-registration-fixture");
mkdirSync(root, { recursive: true });
const file = (name, content) => {
  const path = resolve(root, name);
  writeFileSync(path, content);
  return path;
};
const clubs = Array.from({ length: 52 }, (_, i) => ({
  id: i + 1,
  slug: `synthetic-club-${i + 1}`,
  name: `Synthetic Club ${String(i + 1).padStart(2, "0")}`,
  city: i < 50 ? "Norwich" : "Dublin",
  county: "",
  country: i < 50 ? "England" : "Ireland",
  sports: [i < 50 ? "Running" : "Triathlon"],
  website: "https://example.test",
  summary: "Fictional club for interface testing only.",
  official_source: null,
  member_count: 0,
}));
const router = file(
  "router.tsx",
  `import React from 'react';
const subscribe=(notify)=>{window.addEventListener('popstate',notify);return()=>window.removeEventListener('popstate',notify)};
function useSearch(){const query=React.useSyncExternalStore(subscribe,()=>location.search);return React.useMemo(()=>Object.fromEntries(new URLSearchParams(query)),[query])}
export const createFileRoute=(path)=>(options)=>({...options,fullPath:path,useLoaderData:()=>window.fixtureClubs,useSearch});
export function useNavigate(){return ({search,replace=false})=>{const previous=Object.fromEntries(new URLSearchParams(location.search));const next=typeof search==='function'?search(previous):search;const url=new URL(location.href);url.search=new URLSearchParams(Object.entries(next||{}).filter(([,value])=>value!==undefined)).toString();history[replace?'replaceState':'pushState']({},'',url);window.dispatchEvent(new PopStateEvent('popstate'));return Promise.resolve()}}
export function Link({to,search,params,hash,children,...props}){let href=to;if(params)for(const [key,value]of Object.entries(params))href=href.replace('$'+key,value);if(search)href+='?'+new URLSearchParams(search).toString();if(hash)href+='#'+hash;return <a href={href} {...props}>{children}</a>}`,
);
const auth = file(
  "auth.js",
  `export function useCurrentUserState(){return {user:location.search.includes('signedout')?null:{id:'synthetic-officer'},isPending:false}}`,
);
const api = file(
  "registration-api.js",
  `
window.saves=[];window.reviews=[];window.privateReads=0;
const apps=()=>JSON.parse(localStorage.getItem('synthetic-club-applications')||'[]');
export async function getMyClubRegistrations(){window.privateReads++;return {email:'officer@example.test',emailVerified:!location.search.includes('unverified'),applications:apps()};}
export async function saveClubRegistration({data}){window.saves.push(data);if(window.failSave)throw Error('Synthetic connection interruption. Please retry.');const app={id:data.id||'00000000-0000-4000-8000-000000000001',club_id:data.clubId,club_name:'Synthetic Club 01',club_slug:'synthetic-club-1',details:data.details,status:data.submit?'pending':'draft',revision:(data.revision||0)+1,review_message:'',updated_at:'2026-10-13',submitted_at:data.submit?'2026-10-13':null};localStorage.setItem('synthetic-club-applications',JSON.stringify([app]));return app;}
export async function withdrawClubRegistration(){localStorage.setItem('synthetic-club-applications','[]');return {withdrawn:true};}
export async function getClubRegistrationReviewQueue(){return {total:1,applications:apps().map(a=>({...a,user_id:'synthetic-officer',submitted_email:'officer@example.test',active_representatives:0}))};}
export async function reviewClubRegistration({data}){window.reviews.push(data);return {saved:true};}
`,
);
const directory = file(
  "directory-api.js",
  `export async function listClubs({data}){return window.fixtureClubs.filter(c=>!data?.q||[c.name,c.city,c.country,...c.sports].join(' ').toLowerCase().includes(data.q.toLowerCase()));}`,
);
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic club registration</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
file(
  "main.tsx",
  `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{ClubRegistration,MyClubRegistrations}from'/@fs/${resolve("src/components/clubs/ClubRegistration.tsx")}';import{Route as Directory}from'/@fs/${resolve("src/routes/clubs/index.tsx")}';import{Route as Review}from'/@fs/${resolve("src/routes/admin/club-registrations.tsx")}';import'./style.css';window.fixtureClubs=${JSON.stringify(clubs)};const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});const Component=location.pathname.includes('/admin')?Review.component:location.pathname==='/clubs'?Directory.component:location.pathname.endsWith('/account')?MyClubRegistrations:()=> <ClubRegistration club={window.fixtureClubs[0]} missing={false}/>;createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main style={{maxWidth:1000,margin:'auto',padding:20}}><p style={{fontSize:12,marginBottom:16}}>FICTIONAL TEST DATA · NO LIVE ACCOUNTS OR EMAILS</p><Component/></main></QueryClientProvider>);`,
);
const server = await createServer({
  configFile: false,
  root,
  plugins: [react(), tailwind()],
  resolve: {
    alias: [
      { find: "@tanstack/react-router", replacement: router },
      { find: "@/lib/auth/use-current-user", replacement: auth },
      {
        find: "@/lib/auth/client",
        replacement: file(
          "auth-client.js",
          "export function openAthleteAuth(){window.signInOpened=true;}",
        ),
      },
      { find: "@/lib/clubs/registration-api", replacement: api },
      { find: "@/lib/athrecs/api", replacement: directory },
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 0, fs: { allow: [process.cwd()] } },
});
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
  const errors = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.error(`Club registration fixture page error: ${error.message}`);
  });
  await page.goto(`${origin}/clubs`);
  await page.getByRole("heading", { name: "Clubs", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Register this club", exact: true }).count(),
    48,
  );
  await page.getByRole("button", { name: "Next", exact: true }).click();
  assert.equal(
    await page.getByRole("link", { name: "Register this club", exact: true }).count(),
    4,
  );
  await page.getByLabel("Country", { exact: true }).selectOption("Ireland");
  assert.equal(
    await page.getByRole("link", { name: "Register this club", exact: true }).count(),
    2,
  );
  await page.getByLabel("Sport", { exact: true }).selectOption("Running");
  await page.getByText("No clubs match these filters.", { exact: false }).waitFor();
  assert.equal(new URL(page.url()).searchParams.get("sport"), "Running");
  await page.goto(`${origin}/clubs?sport=Triathlon`);
  await page.getByRole("heading", { name: "Clubs", exact: true }).waitFor();
  assert.equal(await page.getByLabel("Sport", { exact: true }).inputValue(), "Triathlon");
  assert.equal(
    await page.getByRole("link", { name: "Register this club", exact: true }).count(),
    2,
  );
  await page.goto(`${origin}/clubs/register?signedout=true`);
  await page.getByRole("button", { name: "Sign in or create account" }).click();
  assert.equal(await page.evaluate(() => window.signInOpened), true);
  assert.equal(
    await page.evaluate(() => window.privateReads),
    0,
    "Signed-out visitors do not request private applications",
  );
  await page.goto(`${origin}/clubs/register`);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Enter your full name and club role" }).waitFor();
  await page.getByLabel("Your full name", { exact: true }).fill("Synthetic Officer");
  await page.getByLabel("Your role in the club", { exact: true }).fill("Secretary");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: "2. Your details", exact: true }).click();
  assert.equal(
    await page.getByLabel("Your full name", { exact: true }).inputValue(),
    "Synthetic Officer",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Page showing your club role", { exact: true })
    .fill("https://example.test/committee");
  await page
    .getByLabel("Explain your authority and how we can confirm it", { exact: true })
    .fill("The committee appointed me secretary and the official committee page confirms my role.");
  await page.screenshot({
    path: resolve("artifacts/club-registration-evidence.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Submit for verification", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Confirm that you are aged 18 or over" })
    .waitFor();
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.evaluate(() => {
    window.failSave = true;
  });
  await page.getByRole("button", { name: "Submit for verification", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Synthetic connection interruption" }).waitFor();
  await page.evaluate(() => {
    window.failSave = false;
  });
  await page.getByRole("button", { name: "Submit for verification", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Application submitted" }).waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("synthetic-club-applications")).length,
    ),
    1,
    "Retries update the saved draft",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "Registration fits mobile viewport",
  );
  await page.screenshot({
    path: resolve("artifacts/club-registration-mobile.png"),
    fullPage: true,
  });
  await page.goto(`${origin}/clubs/register?unverified=true`);
  await page.getByRole("button", { name: "4. Review & submit", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: "Submit for verification", exact: true }).isDisabled(),
    true,
  );
  await page.goto(`${origin}/admin/club-registrations`);
  await page.getByRole("button", { name: "Approve representative", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Approve representative", exact: true }).isDisabled(),
    true,
  );
  await page
    .getByLabel("Message to the applicant", { exact: true })
    .fill("Your representative appointment has been approved.");
  await page
    .getByLabel("Private verification record", { exact: true })
    .fill(
      "Confirmed the club and appointment using independently sourced official contact details.",
    );
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Approve representative", exact: true }).click();
  await page.waitForFunction(() => window.reviews.length === 1);
  assert.equal((await page.evaluate(() => window.reviews[0])).authorityChecked, true);
  assert.deepEqual(errors, []);
  console.log(
    "Club browser flow passed: directory-first links, filters/pagination, sign-in gate, draft/resume, validation, failed-save retry, submission, unverified-email gate, mobile layout and reviewer checks. APIs used isolated synthetic fixtures.",
  );
} catch (error) {
  const failedPage = browser.contexts()[0]?.pages()[0];
  if (failedPage) {
    await failedPage
      .screenshot({ path: resolve("artifacts/club-registration-failure.png"), fullPage: true })
      .catch(() => {});
    writeFileSync(resolve("artifacts/club-registration-failure.html"), await failedPage.content());
  }
  throw error;
} finally {
  await browser.close();
  await server.close();
  rmSync(root, { recursive: true, force: true });
}
