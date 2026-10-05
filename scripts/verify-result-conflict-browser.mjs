// Real staff React screen with synthetic claims and captured retry actions only.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const root = resolve("artifacts/result-conflict-fixture");
mkdirSync(root, { recursive: true });
function file(name, text) {
  const path = resolve(root, name);
  writeFileSync(path, text);
  return path;
}
const router = file(
  "router.tsx",
  `import React from 'react';
export const createFileRoute=()=>config=>({...config,useSearch:()=>({claimId:Number(new URL(location.href).searchParams.get('claimId'))||undefined})});
export function Link({to,search,params,children,...props}){const query=new URLSearchParams(Object.entries(search||{}).filter(([,v])=>v!==undefined));return <a href={to+(query.size?'?'+query:'')} {...props}>{children}</a>}`,
);
const claims = file(
  "claims.js",
  `const base={athleteId:1,athleteName:'Avery Test Athlete',athleteSlug:'synthetic-avery',eventName:'Synthetic Race',eventSlug:'synthetic-race',sport:'Running',eventDate:'2025-05-04',distanceCode:'10K',finishTimeSeconds:2400,overallPlace:null,bib:'42',category:null,sourceUrl:null,evidenceText:'',evidenceUrl:null,evidenceUrl2:null,evidenceUrl3:null,verificationMethod:'other',staffNote:null,submittedAt:'2026-10-05T08:00:00Z',reviewedAt:null};
const rows=[{...base,claimId:1,resultId:1,status:'approved',claimantEmail:'one@example.test',existingOwnerEmail:'one@example.test',competingClaimCount:1,conflictReason:null},{...base,claimId:2,resultId:2,status:'pending',claimantEmail:'two@example.test',existingOwnerEmail:'one@example.test',competingClaimCount:1,conflictReason:'This athlete profile is already linked to another account. Staff identity checks are required.'},{...base,claimId:3,resultId:3,athleteName:'Jordan Test Athlete',status:'pending',claimantEmail:'three@example.test',existingOwnerEmail:null,competingClaimCount:0,conflictReason:'This claim was previously reviewed by staff.'}];
export async function listStaffResultClaims({data}){return rows.filter(r=>data.status==='all'||r.status===data.status)}
export async function reviewResultClaim(){throw Error('No ownership changes in this synthetic fixture')}
export async function revokeAthleteOwnership(){throw Error('No ownership changes in this synthetic fixture')}`,
);
const alerts = file(
  "alerts.js",
  `window.retryCount=0;window.failRetry=false;
export async function getClaimAlertSummary(){return {production:!location.search.includes('paused'),persistent:true,emailConfigured:true,recipientCount:1,retriesConfigured:true,pending:window.retryCount?0:1,sent:window.retryCount?1:0,needs_review:0,awaiting_setup:0}}
export async function retryClaimAlerts(){if(window.failRetry)throw Error('Synthetic failure');window.retryCount++;return {sent:1,failed:0,paused:false}}`,
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic conflict review</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "main.tsx",
  `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{Route}from'/@fs/${resolve("src/routes/admin/result-claims.tsx")}';import'./style.css';const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const Page=Route.component;createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main style={{maxWidth:1280,margin:'auto',padding:20}}><p style={{fontSize:12,marginBottom:16}}>DESIGN PREVIEW · FICTIONAL ACCOUNTS · NO EMAILS SENT</p><Page/></main></QueryClientProvider>);`,
);
const server = await createServer({
  configFile: false,
  root,
  cacheDir: resolve(root, ".vite"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@tanstack/react-router", replacement: router },
      { find: "@/lib/athrecs/result-claims-api", replacement: claims },
      { find: "@/lib/athrecs/result-claim-alerts-api", replacement: alerts },
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 8113, strictPort: true, fs: { allow: [process.cwd()] } },
});
await server.listen();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 1100 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.goto("http://127.0.0.1:8113");
  await page.getByRole("heading", { name: "Result claim review" }).waitFor();
  await page.getByRole("heading", { name: "Jordan Test Athlete" }).waitFor();
  await page.getByLabel("Ownership conflicts only").check();
  assert.equal(await page.getByRole("heading", { name: "Jordan Test Athlete" }).count(), 0);
  await page.getByText("Existing owner: one@example.test").waitFor();
  const retry = page.getByRole("button", { name: "Retry due emails" });
  await page.evaluate(() => {
    window.failRetry = true;
  });
  await retry.click();
  await page.getByRole("alert").filter({ hasText: "retry could not complete" }).waitFor();
  await page.evaluate(() => {
    window.failRetry = false;
  });
  await retry.click();
  await page
    .getByText("1 accepted by the email service · 0 waiting · 0 awaiting recipients")
    .waitFor();
  assert.equal(await page.evaluate(() => window.retryCount), 1);
  await page.screenshot({ path: "artifacts/result-conflicts-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: "artifacts/result-conflicts-mobile.png", fullPage: true });
  await page.goto("http://127.0.0.1:8113/?claimId=2");
  await page.getByText("Existing owner: one@example.test").waitFor();
  assert.equal(await page.locator("article").count(), 1, "Email link opens the specific claim");
  await page.getByRole("link", { name: "Show all claims" }).click();
  await page.getByRole("heading", { name: "Jordan Test Athlete" }).waitFor();
  await page.goto("http://127.0.0.1:8113/?paused=1");
  await page.getByText(/Email delivery is paused/).waitFor();
  assert(await page.getByRole("button", { name: "Retry due emails" }).isDisabled());
  assert.deepEqual(errors, []);
  console.log(
    "Conflict review desktop/mobile passed: filter, deep link, delivery status, retry recovery and preview pause.",
  );
} finally {
  await browser.close();
  await server.close();
}
