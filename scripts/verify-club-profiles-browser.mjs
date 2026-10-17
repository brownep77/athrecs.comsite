import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { chromium } from "playwright";


// Read-only production verification for the published PR756 release.
// This temporary QA branch does not change application or research data.
mkdirSync(resolve("artifacts"), { recursive: true });
const liveBrowser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const viewport of [{width:1280,height:1000},{width:390,height:844}]) {
    const livePage = await liveBrowser.newPage({viewport});
    const mobile = viewport.width === 390;
    for (const slug of ["wakefield-triathlon-club","killamarsh-kestrels","saffron-athletics-club","bad-boy-running-club","framlingham-flyers"]) {
      const response = await livePage.goto("https://www.athrecs.com/clubs/"+slug, {waitUntil:"networkidle"});
      assert.equal(response.status(), 200);
      const decline = livePage.getByRole("button",{name:"No thanks",exact:true});
      if (await decline.isVisible()) await decline.click();
      await livePage.getByRole("heading",{name:/^About /}).waitFor();
      assert.equal(await livePage.getByRole("link",{name:"Register this club",exact:true}).getAttribute("href"),"/clubs/register?club="+slug);
      const meta = await livePage.locator('meta[name="robots"]').getAttribute("content");
      assert.ok(meta.includes("index, follow"));
      assert.equal(await livePage.locator('link[rel="canonical"]').getAttribute("href"),"https://www.athrecs.com/clubs/"+slug);
      assert.ok(await livePage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"Production club fits viewport: "+slug);
      await livePage.getByRole("heading",{name:"Club contact details",exact:true}).waitFor();
      await livePage.getByRole("heading",{name:"Location and club details",exact:true}).waitFor();
      if(slug==="bad-boy-running-club") await livePage.getByRole("img",{name:"Global club",exact:true}).waitFor();
      else await livePage.getByRole("img",{name:"England",exact:true}).waitFor();
      await livePage.screenshot({path:resolve("artifacts/club-profile-live-"+slug+"-"+(mobile?"mobile":"desktop")+".png"),fullPage:true});
      if(slug==="wakefield-triathlon-club") {
        await livePage.getByRole("link",{name:"Register this club",exact:true}).click();
        await livePage.waitForURL(/\/clubs\/register\?club=wakefield-triathlon-club/);
        assert.ok((await livePage.locator("body").innerText()).includes("Wakefield Triathlon Club"));
        await livePage.screenshot({path:resolve("artifacts/club-profile-live-registration-"+(mobile?"mobile":"desktop")+".png"),fullPage:true});
      }
    }
    await livePage.close();
  }
  console.log("Published club release: five actual production pages plus registration, desktop and mobile passed.");
} finally { await liveBrowser.close(); }

const root = resolve("artifacts/club-profiles-fixture");
mkdirSync(root, { recursive: true });
const file = (name, contents) => {
  const path = resolve(root, name);
  writeFileSync(path, contents);
  return path;
};
const data = {
  club: {
    id: 1,
    slug: "fictional-club",
    name: "Fictional Harriers",
    city: "Cardiff",
    county: "Cardiff",
    country: "Wales",
    sports: ["Athletics"],
    website: "https://club.example.test",
    summary: "A fictional Cardiff athletics club used only to test this page.",
    address: "Example Stadium, Example Road, Cardiff",
    postcode: "CF1 1AA",
    address_kind: "training",
    location_precision: "official-directory",
    official_source: null,
    source_url: null,
    checked_at: "2026-10-13",
    region: "",
    contact_url: "https://club.example.test/contact",
    contacts: [
      { role: "Membership", email: "membership@club.example.test", phone: "01234 000000" },
    ],
    socials: [{ platform: "Instagram", url: "https://instagram.com/fictional-test-club" }],
    profile: {
      biography: [
        "This is a fictional club history for interface testing. No real people or accounts are represented.",
        "The page brings its history, training venue and public contact details together.",
      ],
      founded_year: 1980,
      notable_members: [
        {
          name: "Example Runner",
          connection: "Fictional former member",
          detail: "A synthetic example for checking the layout.",
        },
      ],
      sources: [{ title: "Example club history", url: "https://club.example.test/history" }],
      reviewed_at: "2026-10-13",
    },
  },
  members: [],
  moreMembers: false,
};
const router = file(
  "router.tsx",
  `import React from 'react';export const createFileRoute=()=>options=>({...options,useLoaderData:()=>window.fixture});export const redirect=x=>x;export const notFound=()=>null;export function Link({to,params,search,children,...props}){let href=to;if(params)for(const[k,v]of Object.entries(params))href=href.replace('$'+k,v);return <a href={href} {...props}>{children}</a>}`,
);
const api = file("api.js", "export const getClubBySlug=async()=>window.fixture;");
const redirects = file("redirects.js", "export const resolveSlugRedirect=async()=>null;");
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Club profile test</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
file(
  "main.tsx",
  `import React from'react';import{createRoot}from'react-dom/client';import{Route}from'/@fs/${resolve("src/routes/clubs/$slug.tsx")}';import{ClubCard}from'/@fs/${resolve("src/components/clubs/ClubCard.tsx")}';import'./style.css';window.fixture=${JSON.stringify(data)};if(location.search.includes('postal'))window.fixture.club.address_kind='correspondence';if(location.search.includes('global'))window.fixture.club.profile.scope='global';if(location.search.includes('unknown')){window.fixture.club.country='';window.fixture.club.city='';window.fixture.club.county=''}if(location.search.includes('nohistory'))window.fixture.club.profile=null;window.head=Route.head({loaderData:window.fixture});const Page=Route.component;createRoot(document.getElementById('root')).render(<main style={{maxWidth:1100,margin:'auto',padding:20}}><p className="mb-4 text-xs">FICTIONAL TEST DATA</p>{location.pathname==='/card'?<ClubCard club={{...window.fixture.club,member_count:0,scope:window.fixture.club.profile?.scope}}/>:<Page/>}</main>);`,
);
const server = await createServer({
  configFile: false,
  root,
  plugins: [react(), tailwind()],
  resolve: {
    alias: [
      { find: "@tanstack/react-router", replacement: router },
      { find: "@/lib/athrecs/api", replacement: api },
      { find: "@/lib/athrecs/slug-redirects", replacement: redirects },
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 0, fs: { allow: [process.cwd()] } },
});
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin);
  await page.getByRole("heading", { name: "Fictional Harriers", exact: true }).waitFor();
  assert.equal(await page.getByRole("img", { name: "Wales", exact: true }).count(), 1);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("[data-country-code] img")].every((image) => image.complete),
  );
  await page.getByRole("heading", { name: "Notable members, past and present" }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "membership@club.example.test" }).getAttribute("href"),
    "mailto:membership@club.example.test",
  );
  assert.equal(
    await page.getByRole("link", { name: "01234 000000" }).getAttribute("href"),
    "tel:01234000000",
  );
  assert.equal(
    await page.getByRole("link", { name: "Instagram", exact: true }).getAttribute("href"),
    data.club.socials[0].url,
  );
  assert.equal(await page.getByRole("link", { name: "View on map" }).count(), 1);
  const schema = await page.evaluate(() => JSON.parse(window.head.scripts[0].children));
  assert.equal(schema[0]["@type"], "SportsOrganization");
  assert.equal(schema[0].address.streetAddress, data.club.address);
  await page.screenshot({ path: resolve("artifacts/club-profile-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "Profile fits mobile viewport",
  );
  await page.screenshot({ path: resolve("artifacts/club-profile-mobile.png"), fullPage: true });
  await page.goto(`${origin}/?postal`);
  await page.getByText("Correspondence address", { exact: true }).waitFor();
  assert.equal(await page.getByRole("link", { name: "View on map" }).count(), 0);
  assert.equal(
    await page.evaluate(() => JSON.parse(window.head.scripts[0].children)[0].address.streetAddress),
    undefined,
  );
  await page.goto(`${origin}/?global`);
  await page.getByRole("img", { name: "Global club", exact: true }).waitFor();
  assert.equal(await page.getByRole("img", { name: "Wales", exact: true }).count(), 0);
  await page.goto(`${origin}/?unknown&nohistory`);
  await page.getByRole("heading", { name: "Fictional Harriers", exact: true }).waitFor();
  assert.equal(await page.getByRole("img", { name: "Global club", exact: true }).count(), 0);
  assert.equal(
    await page.getByRole("heading", { name: "Notable members, past and present" }).count(),
    0,
  );
  await page.goto(`${origin}/card?global`);
  await page.getByRole("img", { name: "Global club", exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "Club browser checks passed: real route/card components, biographies, email/phone/social links, venue maps, postal address handling, search schema, flags and mobile layout. Synthetic data only.",
  );
} catch (error) {
  const page = browser?.contexts()[0]?.pages()[0];
  if (page) {
    await page
      .screenshot({ path: resolve("artifacts/club-profile-failure.png"), fullPage: true })
      .catch(() => {});
    writeFileSync(resolve("artifacts/club-profile-failure.html"), await page.content());
  }
  throw error;
} finally {
  await browser?.close();
  await server.close();
  rmSync(root, { recursive: true, force: true });
}
