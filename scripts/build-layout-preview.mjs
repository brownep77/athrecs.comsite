#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const LAYOUT_PREVIEW_BRANCH = "preview/compact-sport-homepage";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** No database/provider work is allowed before this gate has selected the build. */
export function layoutPreviewBuildRequested(env, args = []) {
  const branch = env.VERCEL_GIT_COMMIT_REF?.trim() ?? "";
  const requested =
    args.includes("--preview") ||
    env.VITE_ATHRECS_LAYOUT_PREVIEW === "true" ||
    branch === LAYOUT_PREVIEW_BRANCH;
  if (!requested) return false;
  if (env.VERCEL_ENV === "production") {
    throw new Error("Layout preview cannot be built or deployed as production.");
  }
  if ((branch && branch !== LAYOUT_PREVIEW_BRANCH) || (env.VERCEL === "1" && !branch)) {
    throw new Error(`Layout preview is restricted to ${LAYOUT_PREVIEW_BRANCH}.`);
  }
  return true;
}

export function layoutPreviewBuildEnv(env) {
  // These values also override .env values. Runtime isolation is separately
  // compiled into db/auth; deployment environment variables cannot undo it.
  return {
    ...env,
    DATABASE_URL: "",
    DATABASE_URL_UNPOOLED: "",
    POSTGRES_URL: "",
    POSTGRES_URL_NON_POOLING: "",
    ATHRECS_ASSISTANT_ENABLED: "false",
    ATHRECS_ASSISTANT_VERIFY_PROVIDER: "false",
    VITE_ATHRECS_LAYOUT_PREVIEW: "true",
    VITE_SITE_BRAND: "athrecs",
  };
}

function run(command, args, env) {
  const child = spawnSync(command, args, { cwd: root, env, stdio: "inherit" });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Build step failed (${child.status ?? "signal"}).`);
}

export async function writeLayoutPreviewOutput(outputDir) {
  const configPath = path.join(outputDir, "config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  config.crons = [];
  config.routes = [
    {
      src: "/.*",
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "private, no-store",
        "X-AthRecs-Layout-Preview": "1",
      },
      continue: true,
    },
    ...(config.routes ?? []),
  ];
  await mkdir(path.join(outputDir, "static"), { recursive: true });
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
  await writeFile(path.join(outputDir, "static", "robots.txt"), "User-agent: *\nDisallow: /\n");
}

async function main() {
  const preview = layoutPreviewBuildRequested(process.env, process.argv.slice(2));
  if (!preview) {
    // Preserve the established production build, including its existing gates.
    run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], process.env);
    return;
  }

  const env = layoutPreviewBuildEnv(process.env);
  console.log("[layout-preview] Building an isolated, read-only PGlite preview.");
  run(process.execPath, ["node_modules/vite/bin/vite.js", "build"], env);
  run(process.execPath, ["scripts/copy-pglite-assets.mjs"], env);
  await writeLayoutPreviewOutput(path.join(root, ".vercel/output"));
  console.log(
    "[layout-preview] Ready; no migrations, provider checks or catalogue publishers ran.",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[layout-preview] ${error instanceof Error ? error.message : "Build failed"}`);
    process.exitCode = 1;
  });
}
