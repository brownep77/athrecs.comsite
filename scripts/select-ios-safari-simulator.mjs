import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { release, version } from "node:os";
import { promisify } from "node:util";

// Selection/provenance only. Appium owns all subsequent Simulator startup.
const exec = promisify(execFile);
const artifactPrefix = "artifacts/race-actions-safari-ios-setup";
const udidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const started = Date.now();
const report = {
  mode: "appium-managed",
  status: "running",
  selectionOnly: true,
  finalProofRequired:
    "Appium must create native iOS Safari and pass trusted-touch and application assertions.",
  startedAt: new Date(started).toISOString(),
  hostPlatform: process.platform,
  hostArchitecture: process.arch,
  hostOS: { release: release(), version: version() },
  requestedDevice: {
    runtimeVersion: process.env.ATHRECS_SAFARI_REQUIRED_RUNTIME_VERSION ?? null,
    name: process.env.ATHRECS_SAFARI_REQUIRED_DEVICE_NAME ?? null,
  },
  phase: "runner-check",
  commands: [],
};
const log = [];
let writes = Promise.resolve();
function note(message) {
  const line = `${new Date().toISOString()} ${message}`;
  log.push(line);
  console.log(line);
}
function save() {
  writes = writes.then(async () => {
    await writeFile(`${artifactPrefix}.json`, JSON.stringify(report, null, 2) + "\n");
    await writeFile(`${artifactPrefix}.log`, log.join("\n") + "\n");
  });
  return writes;
}
async function command(file, args, timeout = 20_000) {
  const began = Date.now();
  const entry = {
    file,
    args,
    timeoutMs: timeout,
    startedAt: new Date(began).toISOString(),
    status: "running",
  };
  report.commands.push(entry);
  note(`Reading ${file} ${args.join(" ")} (limit ${timeout / 1000}s)`);
  await save();
  try {
    const result = await exec(file, args, {
      encoding: "utf8",
      timeout,
      killSignal: "SIGKILL",
      maxBuffer: 2 * 1024 * 1024,
    });
    entry.status = "passed";
    entry.exitCode = 0;
    if (result.stderr.trim()) entry.stderrTail = result.stderr.trim().slice(-2000);
    return result.stdout.trim();
  } catch (error) {
    entry.status = "failed";
    entry.exitCode = error.code ?? null;
    entry.signal = error.signal ?? null;
    entry.timedOut = Boolean(error.killed);
    entry.error = String(error.message).slice(-2000);
    if (error.stderr?.trim()) entry.stderrTail = error.stderr.trim().slice(-2000);
    throw error;
  } finally {
    entry.elapsedMs = Date.now() - began;
    await save();
  }
}

function selectDevice(inventory, requested) {
  assert(Array.isArray(inventory.runtimes), "Simulator inventory lacks its runtimes collection.");
  assert(
    inventory.devices && typeof inventory.devices === "object" && !Array.isArray(inventory.devices),
    "Simulator inventory lacks its devices collection.",
  );
  const matches = [];
  for (const runtime of inventory.runtimes) {
    if (
      !/^com\.apple\.CoreSimulator\.SimRuntime\.iOS-/.test(runtime.identifier) ||
      runtime.isAvailable !== true ||
      runtime.version !== requested.runtimeVersion
    )
      continue;
    const devices = inventory.devices[runtime.identifier] ?? [];
    assert(Array.isArray(devices), "Selected runtime's devices collection is invalid.");
    for (const device of devices) {
      if (
        device.isAvailable === true &&
        device.name === requested.name &&
        udidPattern.test(device.udid) &&
        (/^iPhone\b/.test(device.name) || /\.iPhone-/.test(device.deviceTypeIdentifier ?? ""))
      )
        matches.push({ device, runtime });
    }
  }
  assert.equal(
    matches.length,
    1,
    `Expected exactly one available ${requested.name} on iOS ${requested.runtimeVersion}; found ${matches.length}. No other version or device will be substituted.`,
  );
  return matches[0];
}

async function main() {
  assert(
    process.platform === "darwin" && process.env.GITHUB_ACTIONS === "true",
    "This selector runs only in GitHub Actions on macOS.",
  );
  assert(process.env.GITHUB_ENV, "GitHub Actions environment export path is unavailable.");
  const requested = report.requestedDevice;
  assert(
    typeof requested.runtimeVersion === "string" &&
      /^\d+(?:\.\d+){1,2}$/.test(requested.runtimeVersion),
    "ATHRECS_SAFARI_REQUIRED_RUNTIME_VERSION must specify an exact version, such as 18.5.",
  );
  assert(
    typeof requested.name === "string" &&
      requested.name.trim() &&
      requested.name === requested.name.trim() &&
      !/[\r\n\0]/.test(requested.name),
    "ATHRECS_SAFARI_REQUIRED_DEVICE_NAME must specify an exact nonempty device name.",
  );

  report.phase = "toolchain";
  const probes = [
    ["developerDirectory", "/usr/bin/xcode-select", ["-p"]],
    ["xcodeVersion", "/usr/bin/xcodebuild", ["-version"]],
    ["macOSVersion", "/usr/bin/sw_vers", []],
  ];
  const results = await Promise.allSettled(probes.map(([, file, args]) => command(file, args)));
  report.toolchain = { developerDirectoryOverride: process.env.DEVELOPER_DIR ?? null };
  for (const [index, result] of results.entries()) {
    const [name, file, args] = probes[index];
    report.toolchain[name] = {
      command: `${file} ${args.join(" ")}`,
      ...(result.status === "fulfilled"
        ? { output: result.value }
        : { error: String(result.reason.message) }),
    };
  }
  assert(
    results.every((result) => result.status === "fulfilled"),
    "Could not record the selected Xcode/macOS toolchain; see command evidence.",
  );

  report.phase = "inventory";
  // One bounded inventory request; no boot, UI, launch, screenshot or device mutation.
  const inventory = JSON.parse(await command("xcrun", ["simctl", "list", "--json"], 180_000));
  const { device, runtime } = selectDevice(inventory, requested);
  report.selectedDevice = {
    name: device.name,
    udid: device.udid,
    initialState: device.state,
    runtime: { name: runtime.name, identifier: runtime.identifier, version: runtime.version },
  };
  report.phase = "export-selection";
  const environment = {
    ATHRECS_SAFARI_DEVICE_UDID: device.udid,
    ATHRECS_SAFARI_PLATFORM: "ios",
    ATHRECS_SAFARI_DEVICE_NAME: device.name,
    ATHRECS_SAFARI_RUNTIME_VERSION: runtime.version,
  };
  for (const value of Object.values(environment))
    assert(
      typeof value === "string" && value && !/[\r\n\0]/.test(value),
      "Selected metadata cannot be exported safely.",
    );
  await appendFile(
    process.env.GITHUB_ENV,
    Object.entries(environment)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(""),
  );
  report.environmentExported = true;
  report.status = "selected";
  report.phase = "selected";
  note(
    `Selected ${device.name} | ${runtime.name} | ${device.udid}; startup and application checks have not run. Appium owns startup.`,
  );
}

async function run() {
  await mkdir("artifacts", { recursive: true });
  try {
    await main();
  } catch (error) {
    report.status = "failed";
    report.failure = { phase: report.phase, message: error.message };
    process.exitCode = 1;
    note(`Simulator selection failed: ${error.message}`);
  } finally {
    report.finishedAt = new Date().toISOString();
    report.elapsedMs = Date.now() - started;
    await save();
  }
}
run().catch((error) => {
  console.error(`Could not finish Simulator selection diagnostics: ${error.message}`);
  process.exitCode = 1;
});
