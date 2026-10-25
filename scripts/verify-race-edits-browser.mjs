import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import * as playwright from "playwright";
const engine = process.env.ATHRECS_BROWSER_ENGINE || "chromium";
assert(["chromium", "firefox", "webkit"].includes(engine));
const root = path.resolve("artifacts/race-edits-browser-fixture");
fs.mkdirSync(root, { recursive: true });
const write = (name, content) => {
  const file = path.join(root, name);
  fs.writeFileSync(file, content);
  return file;
};
write(
  "index.html",
  '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
write(
  "style.css",
  `@import "${path.resolve("src/styles.css")}";\n@source "${path.resolve("src")}";`,
);
const auth = write(
  "auth.ts",
  `export function useCurrentUserState(){return {user:location.search.includes('signed-in')?{id:'synthetic'}:null,isPending:false};}`,
);
const signin = write(
  "signin.ts",
  `export function openAthleteAuth(options){window.signinOptions=options;}`,
);
const api = write(
  "api.ts",
  `export async function submitRaceEdit({data}){window.calls=(window.calls||[]);window.calls.push(data);await new Promise(resolve=>setTimeout(resolve,250));if(window.failSubmission)throw new Error('Please try again.');return{id:1};}`,
);
write(
  "main.tsx",
  `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{SuggestRaceEdit}from'/@fs/${path.resolve("src/components/races/SuggestRaceEdit.tsx")}';import'./style.css';const client=new QueryClient({defaultOptions:{mutations:{retry:false}}});createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main style={{maxWidth:1000,margin:'40px auto',padding:16}}><h1 style={{fontSize:28,marginBottom:24}}>Example Half Marathon</h1><SuggestRaceEdit slug="example-half" name="Example Half Marathon" pageType={new URLSearchParams(location.search).get("type") || "catalogue"}/></main></QueryClientProvider>);`,
);
const server = await createServer({
  configFile: false,
  root,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib/auth/use-current-user", replacement: auth },
      { find: "@/lib/auth/client", replacement: signin },
      { find: "@/lib/athrecs/race-edit-suggestions-api", replacement: api },
      { find: "@", replacement: path.resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 18218, strictPort: true },
});
let browser;
try {
  await server.listen();
  browser = await playwright[engine].launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:18218");
  const toggle = page.getByRole("button", { name: "Suggest an edit", exact: true });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Sign in to suggest an edit" }).click();
  assert.equal(
    await page.evaluate(() => window.signinOptions.callbackURL),
    "/races/example-half#suggest-edit",
  );
  for (const [type, prefix] of [
    ["road", "/running/races"],
    ["ultra", "/running/ultramarathons"],
  ]) {
    await page.goto(`http://127.0.0.1:18218?type=${type}`);
    await page.getByRole("button", { name: "Suggest an edit", exact: true }).click();
    await page.getByRole("button", { name: "Sign in to suggest an edit" }).click();
    assert.equal(
      await page.evaluate(() => window.signinOptions.callbackURL),
      `${prefix}/example-half#suggest-edit`,
    );
  }
  await page.goto("http://127.0.0.1:18218?signed-in#suggest-edit");
  const field = page.getByRole("textbox", { name: "What needs changing?" });
  await field.waitFor({ state: "visible" });
  const suggestion =
    "The half marathon start is beside the west entrance. Please check the race instructions.";
  await field.fill(suggestion);
  await page
    .getByRole("textbox", { name: "Supporting link (optional)" })
    .fill("https://example.test/race");
  await page.evaluate(() => {
    window.failSubmission = true;
  });
  await page.getByRole("button", { name: "Send suggestion for review" }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(await field.inputValue(), suggestion, "Preserve the visitor's text on failure");
  await page.screenshot({ path: `artifacts/race-edit-${engine}-mobile.png`, fullPage: true });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "No mobile overflow",
  );
  await page.evaluate(() => {
    window.failSubmission = false;
  });
  await page.getByRole("button", { name: "Send suggestion for review" }).click();
  assert(await page.getByRole("button", { name: "Sending suggestion…" }).isDisabled());
  await page.getByRole("status").waitFor();
  assert.match(await page.getByRole("status").innerText(), /sent to our team for review/);
  assert.equal(await page.evaluate(() => window.calls.length), 2);
  assert.deepEqual(await page.evaluate(() => window.calls[1]), {
    slug: "example-half",
    pageType: "catalogue",
    suggestion,
    evidenceUrl: "https://example.test/race",
  });
  await page.getByRole("button", { name: "Suggest another edit" }).click();
  assert.equal(await field.inputValue(), "");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: `artifacts/race-edit-${engine}-desktop.png`, fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    `PASS (${engine}): race suggestion keyboard control, sign-in return, mobile layout, retained error input, submitting state and success confirmation.`,
  );
} finally {
  await browser?.close();
  await server.close();
}
