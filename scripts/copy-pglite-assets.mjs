/**
 * Nitro/Vercel bundles PGLite's JS but often omits sibling wasm/data files.
 * Copy them next to the bundled module so production cold starts work without Neon.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDirs = [
  join(root, ".vercel/output/functions/__server.func/_libs"),
  join(root, ".vercel/output/functions/__server.func"),
];

const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(srcDir)) {
  console.warn("[copy-pglite-assets] PGLite dist missing — skip");
  process.exit(0);
}

let copied = 0;
for (const dest of destDirs) {
  if (!existsSync(dirname(dest))) continue;
  mkdirSync(dest, { recursive: true });
  for (const f of files) {
    const from = join(srcDir, f);
    const to = join(dest, f);
    if (!existsSync(from)) continue;
    copyFileSync(from, to);
    copied += 1;
  }
}

// Also walk for any electric-sql__pglite.mjs parent dirs
const funcRoot = join(root, ".vercel/output/functions");
if (existsSync(funcRoot)) {
  for (const name of readdirSync(funcRoot)) {
    const libs = join(funcRoot, name, "_libs");
    if (!existsSync(libs)) continue;
    for (const f of files) {
      const from = join(srcDir, f);
      if (!existsSync(from)) continue;
      copyFileSync(from, join(libs, f));
      copied += 1;
    }
  }
}

console.log(`[copy-pglite-assets] copied ${copied} asset(s)`);
