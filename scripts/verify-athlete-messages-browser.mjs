// Isolated React interface with synthetic correspondence; no live inbox or database.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const root = resolve("artifacts/athlete-messages-fixture");
mkdirSync(root, { recursive: true });
const file = (name, text) => {
  const path = resolve(root, name);
  writeFileSync(path, text);
  return path;
};
const api = file(
  "messages-api.js",
  `
window.savedMessages=[];window.sendAttempts=[];window.failLoad=false;window.failSave=false;
window.recipientUserId='synthetic-athlete';window.recipientEmail='avery@example.test';
const rows=[{id:'sent-1',direction:'sent',channel:'email',subject:'Welcome to AthRecs',body:'Thanks for joining AthRecs. Your achievements are part of sporting history.',contact:'avery@example.test',sender:'paul@athrecs.com',status:'accepted',source:'site',occurredAt:'2026-10-12T10:30:00Z'},
{id:'received-1',direction:'received',channel:'email',subject:'My missing result',body:'<script>window.executedMessage=true</script> Please add my result.',contact:'avery@example.test',sender:'avery@example.test',status:'received',source:'inbox',occurredAt:'2026-10-12T11:00:00Z'}];
export async function getStaffAthleteMessages({data}){if(window.failLoad)throw Error('Synthetic read failure');const filtered=rows.filter(r=>data.direction==='all'||r.direction===data.direction).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt));return{recipientUserId:window.recipientUserId,recipientEmail:window.recipientEmail,messages:filtered.slice((data.page-1)*20,data.page*20),sent:rows.filter(r=>r.direction==='sent').length,received:rows.filter(r=>r.direction==='received').length,total:filtered.length,page:data.page,pageSize:20};}
export async function saveStaffAthleteMessage({data}){if(window.failSave)throw Error('Synthetic save failure');window.savedMessages.push(data);rows.push({...data,id:data.entryId,status:'recorded',source:'manual',sender:null});return{saved:true};}
export async function sendStaffAthleteEmail({data}){window.sendAttempts.push(data);throw Error('Email delivery is not part of this isolated message-history test');}
`,
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Athlete messages preview</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "main.tsx",
  `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{AthleteMessages}from'/@fs/${resolve("src/components/staff/AthleteMessages.tsx")}';import'./style.css';const client=new QueryClient({defaultOptions:{queries:{retry:false}}});createRoot(document.getElementById('root')!).render(<QueryClientProvider client={client}><main style={{maxWidth:960,margin:'auto',padding:16}}><p>FICTIONAL ATHLETE · NO LIVE MESSAGES</p><h1>Avery Test Athlete</h1><AthleteMessages target={{userId:'synthetic-athlete'}} initiallyOpen/></main></QueryClientProvider>);`,
);
const server = await createServer({
  configFile: false,
  root,
  cacheDir: resolve(root, ".vite"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib/athrecs/athlete-messages-api", replacement: api },
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 8129, strictPort: true, fs: { allow: [process.cwd()] } },
});
let browser, page;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1365, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.clipboardWrites = [];
    window.failClipboard = false;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          if (window.failClipboard) throw new Error("Synthetic clipboard denial");
          window.clipboardWrites.push(text);
        },
      },
    });
  });
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.goto("http://127.0.0.1:8129");
  await page.getByRole("button", { name: "All (2)", exact: true }).waitFor();
  await page.getByRole("button", { name: "Message in Intercom", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("heading", { name: "Message in Intercom", exact: true }).waitFor();
  const primaryLink = dialog.getByRole("link", { name: "Open athlete in Intercom", exact: true });
  const accountUrl = new URL(await primaryLink.getAttribute("href"));
  assert.equal(accountUrl.origin, "https://app.intercom.com");
  assert.equal(accountUrl.pathname, "/apps/uyeuotsk/users/show");
  assert.deepEqual([...accountUrl.searchParams], [["user_id", "synthetic-athlete"]]);
  assert.equal(await primaryLink.getAttribute("target"), "_blank");
  assert.match(await primaryLink.getAttribute("rel"), /noopener/);
  const emailUrl = new URL(
    await dialog.getByRole("link", { name: "Find by email", exact: true }).getAttribute("href"),
  );
  assert.deepEqual([...emailUrl.searchParams], [["email", "avery@example.test"]]);
  assert.equal(await dialog.getByRole("button", { name: "Copy draft", exact: true }).count(), 0);
  // Inspect the supported external destination without visiting a real Intercom workspace.
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert(
    await page
      .getByRole("button", { name: "Message in Intercom", exact: true })
      .evaluate((element) => element === document.activeElement),
    "Closing the dialog restores keyboard focus",
  );

  const subject = "Private result correction & follow-up";
  const body =
    "Hi Avery,\n\n<script>window.executedDraft=true</script>\nPlease check your result.\n\nPaul";
  const draftText = `Subject: ${subject}\n\n${body}`;
  await page.getByRole("button", { name: "Email in Intercom", exact: true }).click();
  await page.getByLabel("Intercom email subject", { exact: true }).fill(subject);
  await page.getByLabel("Intercom email draft", { exact: true }).fill(body);
  await page.getByRole("button", { name: "Continue in Intercom", exact: true }).click();
  await dialog.getByRole("heading", { name: "Email in Intercom", exact: true }).waitFor();
  assert.equal(
    await dialog.getByLabel("Draft to paste in Intercom", { exact: true }).inputValue(),
    draftText,
  );
  assert.equal(
    await primaryLink.getAttribute("href"),
    accountUrl.href,
    "Draft content stays out of URLs",
  );
  assert.equal(await page.evaluate(() => window.executedDraft), undefined);
  await page.evaluate(() => {
    window.failClipboard = true;
  });
  await dialog.getByRole("button", { name: "Copy draft", exact: true }).click();
  await dialog
    .getByText("Could not copy draft. Select and copy it from this window.", { exact: true })
    .waitFor();
  assert.equal(
    await dialog.getByLabel("Draft to paste in Intercom", { exact: true }).inputValue(),
    draftText,
  );
  assert.deepEqual(await page.evaluate(() => window.clipboardWrites), []);
  await page.evaluate(() => {
    window.failClipboard = false;
  });
  await dialog.getByRole("button", { name: "Copy draft", exact: true }).click();
  await dialog.getByText("Draft copied. Paste it in Intercom.", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.clipboardWrites), [draftText]);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert.equal(
    await page.getByLabel("Intercom email subject", { exact: true }).inputValue(),
    subject,
  );
  assert.equal(await page.getByLabel("Intercom email draft", { exact: true }).inputValue(), body);
  assert.deepEqual(
    await page.evaluate(() => window.sendAttempts),
    [],
    "Intercom handoffs never call AthRecs send",
  );
  assert.deepEqual(
    await page.evaluate(() => window.savedMessages),
    [],
    "A copied draft is not a sent-history entry",
  );
  assert(await page.getByRole("button", { name: "All (2)", exact: true }).isVisible());
  await page.getByRole("button", { name: "Close Intercom email draft", exact: true }).click();

  await page.evaluate(() => {
    window.recipientUserId = null;
    window.recipientEmail = null;
  });
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("button")].find(
        (button) => button.textContent?.trim() === "Message in Intercom",
      )?.disabled,
  );
  assert(await page.getByRole("button", { name: "Email in Intercom", exact: true }).isDisabled());
  assert(
    await page.getByRole("button", { name: "Send using AthRecs email", exact: true }).isDisabled(),
  );
  await page.evaluate(() => {
    window.recipientUserId = "synthetic-athlete";
    window.recipientEmail = "avery@example.test";
  });
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("button")].find(
        (button) => button.textContent?.trim() === "Message in Intercom",
      )?.disabled === false,
  );

  await page.getByRole("button", { name: "Received (1)", exact: true }).click();
  await page.getByText("My missing result", { exact: true }).click();
  assert(await page.getByText("Received email · Automatic record", { exact: true }).isVisible());
  assert.equal(
    await page.getByRole("link", { name: "Connect your inbox" }).getAttribute("href"),
    "/admin/email-inbox",
  );
  assert(
    await page
      .getByText("<script>window.executedMessage=true</script> Please add my result.", {
        exact: true,
      })
      .isVisible(),
  );
  assert.equal(await page.evaluate(() => window.executedMessage), undefined);
  assert.equal(await page.getByText("Welcome to AthRecs", { exact: true }).count(), 0);
  await page.getByRole("button", { name: "Record a message", exact: true }).click();
  await page.getByLabel("Channel", { exact: true }).selectOption("whatsapp");
  await page.getByLabel("Athlete email, number or contact", { exact: true }).fill("+447700900123");
  await page.getByLabel("Subject", { exact: true }).fill("Result correction");
  await page.getByLabel("Message", { exact: true }).fill("Thanks Paul, that is my result.");
  await page.evaluate(() => {
    window.failSave = true;
  });
  await page.getByRole("button", { name: "Save message", exact: true }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(
    await page.getByLabel("Message", { exact: true }).inputValue(),
    "Thanks Paul, that is my result.",
  );
  await page.evaluate(() => {
    window.failSave = false;
  });
  await page.getByRole("button", { name: "Save message", exact: true }).click();
  await page.getByText("Message saved to this athlete’s record.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "All (3)", exact: true }).waitFor();
  assert.equal((await page.evaluate(() => window.savedMessages)).length, 1);
  await page.getByText("Result correction", { exact: true }).click();
  await page.screenshot({ path: "artifacts/athlete-messages-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "No horizontal overflow on mobile",
  );
  await page.screenshot({ path: "artifacts/athlete-messages-mobile.png", fullPage: true });
  await page.evaluate(() => {
    window.failLoad = true;
  });
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page
    .getByText("Messages could not load. Use Refresh to try again.", { exact: true })
    .waitFor();
  assert.equal(
    await page.getByText("Result correction", { exact: true }).count(),
    0,
    "Failed fetch does not leave a stale private history visible",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(await page.evaluate(() => window.sendAttempts), []);
  console.log(
    "PASS: exact Intercom contact handoff, safe private draft copy, clipboard failure recovery, keyboard focus, no-send history, unavailable contacts, desktop/mobile filters, recorded reply, failed save retry and no horizontal overflow. Synthetic messages only.",
  );
} catch (error) {
  await page?.screenshot({ path: "artifacts/athlete-messages-failure.png", fullPage: true });
  console.error(await page?.locator("body").innerText());
  throw error;
} finally {
  await browser?.close();
  await server.close();
  rmSync(root, { recursive: true, force: true });
}
