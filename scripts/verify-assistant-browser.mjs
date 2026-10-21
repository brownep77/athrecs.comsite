import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { createRequire } from "node:module";
import { assistantCopy } from "../src/lib/athrecs/assistant-copy.ts";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");

const root = resolve("artifacts/assistant-fixture");
mkdirSync(root, { recursive: true });
const file = (name, content) => {
  const path = resolve(root, name);
  writeFileSync(path, content);
  return path;
};
const api = file(
  "api.js",
  `
window.sent=[];let messages=[];const copy=${JSON.stringify(assistantCopy)};
export async function getAssistantStatus(){return {enabled:!location.search.includes('disabled'),whatsappUrl:null};}
export async function getAssistantHistory(){return {messages,error:null};}
export async function sendAssistantMessage({data}){window.sent.push(data);if(window.failOnce){window.failOnce=false;throw Error('Synthetic network failure');}messages.push({role:'user',content:data.message,language:data.language,status:'complete',created_at:new Date().toISOString()},{role:'assistant',content:copy[data.language].account,language:data.language,status:'complete',created_at:new Date().toISOString()});return {messages:[...messages],error:null};}
export async function getStaffAssistantChats(){return {chats:[{id:'00000000-0000-4000-8000-000000000001',language:'fr',page_path:'/athletes',created_at:'2026-10-16T12:00:00Z',updated_at:'2026-10-16T12:01:00Z',message_count:2,preview:'Synthetic visitor question'}],hasMore:false,enabled:true};}
export async function getStaffAssistantTranscript(){return {chat:{id:'00000000-0000-4000-8000-000000000001',language:'fr',page_path:'/athletes',created_at:'2026-10-16T12:00:00Z'},messages:[{role:'user',content:'Synthetic visitor question',language:'fr',status:'complete',created_at:'2026-10-16T12:00:00Z'},{role:'assistant',content:'Synthetic assistant answer',language:'fr',status:'complete',created_at:'2026-10-16T12:00:01Z'}]};}
export async function deleteStaffAssistantTranscript(){return {deleted:true};}
`,
);
const router = file("router.js", "export const createFileRoute=()=>options=>({...options,useSearch:()=>options.validateSearch(Object.fromEntries(new URLSearchParams(location.search)))});");
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Assistant test fixture</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
file(
  "main.tsx",
  `import React from'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{AssistantLauncher}from'/@fs/${resolve("src/components/assistant/AssistantLauncher.tsx")}';import{Route}from'/@fs/${resolve("src/routes/admin/assistant-chats.tsx")}';import'./style.css';const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});const Staff=Route.component;createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main style={{padding:24}}><h1>ATHRECS · Synthetic interface test</h1>{location.pathname==='/staff'?<Staff/>:<><p>No live chats or API requests.</p><AssistantLauncher pathname="/athletes"/><nav style={{height:112,position:'fixed',bottom:0,left:0,right:0,background:'#eee'}} aria-label="Mobile navigation fixture">Navigation</nav></>}</main></QueryClientProvider>);`,
);
const server = await createServer({
  configFile: false,
  root,
  cacheDir: resolve(root, ".vite"),
  plugins: [react(), tailwind()],
  resolve: {
    alias: [
      { find: "@/lib/athrecs/assistant-api", replacement: api },
      { find: /^@tanstack\/react-router$/, replacement: router },
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
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin);
  const launcher = page.getByRole("button", { name: "Ask AthRecs" });
  await launcher.waitFor();
  const box = await launcher.boundingBox();
  assert.ok(box.y + box.height < 844 - 112, "launcher overlaps mobile navigation");
  await launcher.click();
  await page.getByRole("dialog").waitFor();
  await page.getByLabel("How can we help?").fill("How do I sign up?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByRole("log").getByText(assistantCopy.en.account, { exact: true }).waitFor();
  await page.getByLabel("Chat language").selectOption("fr");
  await page.getByLabel("Comment vous aider ?").fill("Comment créer un compte ?");
  await page.evaluate(() => {
    window.failOnce = true;
  });
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(
    await page.getByLabel("Comment vous aider ?").inputValue(),
    "Comment créer un compte ?",
  );
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await page.getByRole("log").getByText(assistantCopy.fr.account, { exact: true }).waitFor();
  const sent = await page.evaluate(() => window.sent);
  assert.equal(sent[1].requestId, sent[2].requestId, "network retry must reuse its request id");
  assert.equal(sent[2].language, "fr");
  assert.equal(
    await page.getByRole("link", { name: "Créer / ouvrir mon compte" }).getAttribute("href"),
    "/athlete-account",
  );
  assert.equal(
    await page.getByRole("link", { name: "Ouvrir WhatsApp" }).count(),
    0,
    "no unconfigured WhatsApp number",
  );
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  // Exercise the actual localized controls at desktop, narrow phone and short viewport sizes.
  for (const viewport of [{ width: 1280, height: 900 }, { width: 320, height: 640 }, { width: 390, height: 500 }]) {
    await page.setViewportSize(viewport);
    for (const [language, copy] of Object.entries(assistantCopy)) {
      await page.locator('#assistant-language').selectOption(language);
      const dialog = page.getByRole('dialog');
      assert.equal(await dialog.getAttribute('lang'), language);
      await dialog.getByRole('heading', { name: copy.title, exact: true }).waitFor();
      for (const [key, href] of [['account','/athlete-account'], ['athletes','/athletes'], ['results','/results'], ['club','/clubs/register']]) {
        assert.equal(await dialog.getByRole('link', {name: copy[key], exact: true}).getAttribute('href'), href);
      }
      await page.getByLabel(copy.placeholder, {exact: true}).fill(`Synthetic ${language} question`);
      await dialog.getByRole('button', {name: copy.send, exact: true}).click();
      await page.waitForFunction(language => window.sent.at(-1)?.language === language && !document.querySelector('[aria-busy="true"]'), language);
      const log = dialog.getByRole('log');
      assert.equal(await log.locator(':scope > div').last().innerText(), copy.account);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const bounds = await dialog.boundingBox();
      assert(bounds.y >= -1 && bounds.y + bounds.height <= viewport.height + 1, `Dialog escapes ${viewport.width}x${viewport.height} in ${language}`);
      const input = await page.getByLabel(copy.placeholder, {exact: true}).boundingBox();
      assert(input.y >= 0 && input.y + input.height <= viewport.height, `Composer clipped in ${language}`);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({ path: resolve("artifacts/assistant-mobile.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.goto(`${origin}/?disabled`);
  await page.getByRole("heading", { name: "ATHRECS · Synthetic interface test" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Ask AthRecs" }).count(), 0);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${origin}/staff`);
  await page.getByRole("button", { name: /Synthetic visitor question/ }).click();
  await page.getByText("Synthetic assistant answer", { exact: true }).waitFor();
  // A notification link must select its transcript without another list click.
  await page.goto(`${origin}/staff?chat=00000000-0000-4000-8000-000000000001`);
  await page.getByText("Synthetic assistant answer", { exact: true }).waitFor();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download transcript" }).click();
  const download = await downloadPromise;
  assert.equal(
    download.suggestedFilename(),
    "athrecs-chat-00000000-0000-4000-8000-000000000001.txt",
  );
  await page.screenshot({ path: resolve("artifacts/assistant-staff.png"), fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "Assistant browser checks passed: desktop/320px/short-screen layout, all eight localized interfaces and request languages, retry identity, hidden unconfigured features, keyboard close and staff transcript download. APIs used synthetic fixtures.",
  );
} finally {
  await browser.close();
  await server.close();
  rmSync(root, { recursive: true, force: true });
}
