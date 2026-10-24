import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

// Optional CI preparation, run after installing the pinned XCUITest driver.
// Downloads only that installation's exact WDA version and host architecture.
// Does not boot a Simulator, install/launch an app, or change a running test.
// https://appium.github.io/appium-xcuitest-driver/latest/guides/run-prebuilt-wda/
const artifact = "artifacts/race-actions-ios-native-wda-download.json";
const started = Date.now();
const report = {
  status: "running",
  startedAt: new Date().toISOString(),
  host: { platform: process.platform, architecture: process.arch },
  phases: [],
};
let phase = "setup";
fs.mkdirSync("artifacts", { recursive: true });
function save() {
  fs.writeFileSync(artifact, JSON.stringify(report, null, 2) + "\n");
}
function mark(next) {
  phase = next;
  report.phase = next;
  const entry = { phase, elapsedMs: Date.now() - started };
  report.phases.push(entry);
  console.log(`WDA DOWNLOAD +${entry.elapsedMs}ms: ${phase}`);
  save();
}
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function run(command, args, timeout = 15000) {
  return execFileSync(command, args, {
    encoding: "utf8",
    timeout,
    maxBuffer: 4 * 1024 * 1024,
  }).trim();
}
function readPlist(file) {
  return JSON.parse(run("/usr/bin/plutil", ["-convert", "json", "-o", "-", file]));
}

try {
  assert.equal(process.platform, "darwin", "This helper prepares a macOS iOS Simulator test");
  assert(["x64", "arm64"].includes(process.arch), "Unsupported Simulator host architecture");
  const architecture = process.arch === "arm64" ? "arm64" : "x86_64";
  const appiumRoot = process.env.APPIUM_HOME || path.join(os.homedir(), ".appium");
  const rootRequire = createRequire(path.join(appiumRoot, "package.json"));
  const driverPackage = rootRequire.resolve("appium-xcuitest-driver/package.json");
  const driverRequire = createRequire(driverPackage);
  const wdaPackage = driverRequire.resolve("appium-webdriveragent/package.json");
  const driver = readJson(driverPackage);
  const wda = readJson(wdaPackage);
  assert.equal(driver.name, "appium-xcuitest-driver");
  assert.equal(wda.name, "appium-webdriveragent");
  assert.match(wda.version, /^\d+\.\d+\.\d+$/, "Require an exact stable installed WDA release");
  report.installed = {
    driverVersion: driver.version,
    driverPackage,
    wdaVersion: wda.version,
    wdaPackage,
  };

  const [major, minor] = wda.version.split(".").map(Number);
  const monorepo = major > 16 || (major === 16 && minor >= 16);
  const repository = monorepo ? "appium/appium-ios" : "appium/WebDriverAgent";
  const tag = monorepo ? `appium-webdriveragent@${wda.version}` : `v${wda.version}`;
  const assetName = `WebDriverAgentRunner-Build-Sim-${architecture}.zip`;
  const metadataUrl = `https://api.github.com/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`;
  mark(`read official release metadata for WDA ${wda.version}`);
  const metadata = await fetch(metadataUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "AthRecs-native-Safari-QA",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  assert(metadata.ok, `Official release metadata returned HTTP ${metadata.status}`);
  const release = await metadata.json();
  assert.equal(release.tag_name, tag, "Release tag must match the installed WDA exactly");
  assert(!release.draft && !release.prerelease, "Require a published stable WDA release");
  const matches = release.assets.filter((asset) => asset.name === assetName);
  assert.equal(matches.length, 1, "Matching official Simulator asset is missing or ambiguous");
  const asset = matches[0];
  assert.match(
    asset.digest || "",
    /^sha256:[a-f0-9]{64}$/i,
    "Release asset lacks a SHA-256 digest",
  );
  assert(asset.size > 0 && asset.size <= 64 * 1024 * 1024, "Unexpected WDA archive size");
  const downloadUrl = new URL(asset.browser_download_url);
  assert.equal(downloadUrl.origin, "https://github.com");
  assert.equal(
    decodeURIComponent(downloadUrl.pathname),
    `/${repository}/releases/download/${tag}/${assetName}`,
    "Download URL must belong to the exact official release",
  );
  report.release = {
    repository,
    tag,
    metadataUrl,
    releaseUrl: release.html_url,
    publishedAt: release.published_at,
    assetId: asset.id,
    assetName,
    size: asset.size,
    expectedDigest: asset.digest.toLowerCase(),
    downloadUrl: downloadUrl.href,
  };

  const output =
    process.env.ATHRECS_WDA_PREBUILT_DIR ||
    path.join(process.env.RUNNER_TEMP || os.tmpdir(), "athrecs-wda-prebuilt");
  assert(path.isAbsolute(output), "Prebuilt WDA destination must be absolute");
  assert(!/[\r\n]/.test(output), "Prebuilt WDA destination must fit on one environment line");
  assert(
    !fs.existsSync(output),
    "Use a new prebuilt WDA directory; existing output is not overwritten",
  );
  fs.mkdirSync(output);
  const archive = path.join(output, assetName);
  const hash = createHash("sha256");
  let received = 0;
  mark("download and verify matching Simulator archive");
  const response = await fetch(downloadUrl, {
    headers: { "User-Agent": "AthRecs-native-Safari-QA" },
    signal: AbortSignal.timeout(90000),
  });
  assert(response.ok && response.body, `WDA archive returned HTTP ${response.status}`);
  await pipeline(
    Readable.fromWeb(response.body),
    new Transform({
      transform(chunk, _encoding, done) {
        received += chunk.length;
        if (received > asset.size) return done(Error("Archive exceeds its published size"));
        hash.update(chunk);
        done(null, chunk);
      },
    }),
    fs.createWriteStream(archive, { flags: "wx" }),
  );
  assert.equal(received, asset.size, "Archive size differs from official release metadata");
  const actualDigest = `sha256:${hash.digest("hex")}`;
  assert.equal(
    actualDigest,
    report.release.expectedDigest,
    "Official WDA archive checksum mismatch",
  );
  report.download = { archive, received, actualDigest, verified: true };

  mark("extract verified Simulator app without removing XCTest frameworks");
  const names = run("/usr/bin/unzip", ["-Z1", archive]).split("\n");
  const appName = "WebDriverAgentRunner-Runner.app";
  assert(names.length > 0 && names.every((name) => name.startsWith(`${appName}/`)));
  assert(names.every((name) => !name.split("/").includes("..") && !name.includes("\\")));
  const unpacked = path.join(output, "unpacked");
  fs.mkdirSync(unpacked);
  run("/usr/bin/ditto", ["-x", "-k", archive, unpacked], 45000);
  const appPath = path.join(unpacked, appName);
  const info = readPlist(path.join(appPath, "Info.plist"));
  assert(info.CFBundleSupportedPlatforms?.includes("iPhoneSimulator"), "Require a Simulator app");
  assert.match(info.CFBundleIdentifier || "", /\.xctrunner$/);
  assert.equal(path.basename(info.CFBundleExecutable), info.CFBundleExecutable);
  const architectures = run("/usr/bin/lipo", [
    "-archs",
    path.join(appPath, info.CFBundleExecutable),
  ]).split(/\s+/);
  assert(
    architectures.includes(architecture),
    "Runner binary must support the selected host architecture",
  );
  assert(fs.statSync(path.join(appPath, "PlugIns", "WebDriverAgentRunner.xctest")).isDirectory());
  report.app = {
    path: appPath,
    bundleId: info.CFBundleIdentifier,
    supportedPlatforms: info.CFBundleSupportedPlatforms,
    minimumOSVersion: info.MinimumOSVersion,
    sdkName: info.DTSDKName,
    architectures,
    frameworks: fs.readdirSync(path.join(appPath, "Frameworks")),
  };
  report.capabilities = {
    "appium:usePreinstalledWDA": true,
    "appium:prebuiltWDAPath": appPath,
  };
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `ATHRECS_WDA_PREBUILT_APP_PATH=${appPath}\n`);
  }
  report.status = "passed";
  mark("ready for native XCTest session; Simulator app has not been launched");
  console.log(`ATHRECS_WDA_PREBUILT_APP_PATH=${appPath}`);
} catch (error) {
  report.status = "failed";
  report.failure = { phase, message: error.message, stack: error.stack };
  console.error(`FAIL preparing prebuilt WDA (${phase}): ${error.stack}`);
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  report.elapsedMs = Date.now() - started;
  save();
}
