import { execFile } from "node:child_process";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const commandTimeout = 20_000;
const bootTimeout = 180_000;
const verificationTimeout = 60_000;
const udidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const artifactPrefix = "artifacts/race-actions-safari-ios-setup";
const started = Date.now();
const report = {
  startedAt: new Date(started).toISOString(),
  hostPlatform: process.platform,
  status: "running",
  phase: "initialising",
  phases: [],
  commands: [],
};
const log = [];
let writes = Promise.resolve();

function note(message) {
  const line = `${new Date().toISOString()} ${message}`;
  log.push(line);
  console.log(line);
}

function saveDiagnostics() {
  // Initial inventory commands run together; serialize artifact writes so their
  // progress cannot overwrite a later command's outcome with an older snapshot.
  writes = writes.then(async () => {
    await writeFile(`${artifactPrefix}.json`, JSON.stringify(report, null, 2) + "\n", "utf8");
    await writeFile(`${artifactPrefix}.log`, log.join("\n") + "\n", "utf8");
  });
  return writes;
}

async function phase(name) {
  report.phase = name;
  report.phases.push({ name, startedAt: new Date().toISOString() });
  note(`Phase: ${name}`);
  await saveDiagnostics();
}

async function simctl(args, timeout = commandTimeout) {
  const commandStarted = Date.now();
  const command = {
    args,
    phase: report.phase,
    timeoutMs: timeout,
    startedAt: new Date(commandStarted).toISOString(),
    status: "running",
  };
  report.commands.push(command);
  note(`Starting xcrun simctl ${args.join(" ")} (limit ${timeout / 1000}s)`);
  await saveDiagnostics();
  try {
    const { stdout, stderr } = await exec("xcrun", ["simctl", ...args], {
      encoding: "utf8",
      timeout,
      killSignal: "SIGKILL",
      maxBuffer: 2 * 1024 * 1024,
    });
    command.status = "passed";
    command.elapsedMs = Date.now() - commandStarted;
    // Retain boot progress and errors, never the full simulator inventory.
    if (args[0] !== "list" && stdout.trim()) command.stdoutTail = stdout.trim().slice(-2000);
    if (stderr?.trim()) command.stderrTail = stderr.trim().slice(-2000);
    note(`Completed xcrun simctl ${args.join(" ")} (${command.elapsedMs}ms)`);
    return stdout;
  } catch (error) {
    command.status = "failed";
    command.elapsedMs = Date.now() - commandStarted;
    command.code = error.code ?? null;
    command.signal = error.signal ?? null;
    command.timedOut = Boolean(error.killed);
    if (error.stderr?.trim()) command.stderrTail = error.stderr.trim().slice(-2000);
    if (args[0] !== "list" && error.stdout?.trim())
      command.stdoutTail = error.stdout.trim().slice(-2000);
    const reason = error.killed
      ? `timed out after ${timeout / 1000}s`
      : `failed (${error.code ?? error.signal ?? "unknown status"})`;
    const detail = String(error.stderr || error.message || "")
      .trim()
      .slice(-1200);
    command.error = `xcrun simctl ${args.join(" ")} ${reason}${detail ? `: ${detail}` : ""}`;
    note(command.error);
    throw new Error(command.error);
  } finally {
    await saveDiagnostics();
  }
}

async function inventory(args, timeout = commandTimeout) {
  const output = await simctl(args, timeout);
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`xcrun simctl ${args.join(" ")} returned invalid JSON.`);
  }
}

function compareVersions(a, b) {
  const left = String(a).split(".").map(Number);
  const right = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const difference = (left[i] || 0) - (right[i] || 0);
    if (difference) return difference;
  }
  return 0;
}

function phonePreference(device) {
  // Prefer an ordinary current iPhone to a Pro/Max model, without assuming
  // which devices a particular macos-15 runner image has installed.
  if (device.name === "iPhone 17") return 0;
  if (device.name === "iPhone 16") return 1;
  return /^iPhone \d+$/.test(device.name) ? 2 : 3;
}

function selectDevice(devices, runtimes) {
  const iosRuntimes = runtimes.filter((runtime) =>
    /^com\.apple\.CoreSimulator\.SimRuntime\.iOS-/.test(runtime.identifier),
  );
  const available = iosRuntimes
    .filter((runtime) => runtime.isAvailable === true)
    .sort(
      (a, b) => compareVersions(b.version, a.version) || a.identifier.localeCompare(b.identifier),
    );
  for (const runtime of available) {
    const phones = (devices[runtime.identifier] ?? [])
      .filter(
        (device) =>
          device.isAvailable === true &&
          udidPattern.test(device.udid) &&
          (/^iPhone\b/.test(device.name) || /\.iPhone-/.test(device.deviceTypeIdentifier ?? "")),
      )
      .sort(
        (a, b) =>
          phonePreference(a) - phonePreference(b) ||
          b.name.localeCompare(a.name, "en", { numeric: true }) ||
          Number(b.state === "Booted") - Number(a.state === "Booted") ||
          a.udid.localeCompare(b.udid),
      );
    if (phones.length) return { device: phones[0], runtime };
  }
  const summary = iosRuntimes
    .map((runtime) => `${runtime.name} (${runtime.isAvailable ? "available" : "unavailable"})`)
    .join(", ");
  throw new Error(
    "No available existing iPhone Simulator was found. " +
      `Reported iOS runtimes: ${summary || "none"}. ` +
      "Use a macOS runner with Xcode and an installed iOS Simulator runtime; this setup does not download runtimes.",
  );
}

async function main() {
  await phase("runner-check");
  if (process.platform !== "darwin" || process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("This setup runs only in GitHub Actions on a macOS runner.");
  }
  await phase("inventory");
  const [deviceInventory, runtimeInventory] = await Promise.all([
    inventory(["list", "devices", "available", "--json"]),
    inventory(["list", "runtimes", "--json"]),
  ]);
  if (
    !deviceInventory.devices ||
    typeof deviceInventory.devices !== "object" ||
    !Array.isArray(runtimeInventory.runtimes)
  ) {
    throw new Error("Simulator inventory is missing its devices or runtimes collection.");
  }
  const { device, runtime } = selectDevice(deviceInventory.devices, runtimeInventory.runtimes);
  report.selectedDevice = {
    name: device.name,
    udid: device.udid,
    initialState: device.state,
    runtime: { name: runtime.name, identifier: runtime.identifier, version: runtime.version },
  };
  note(`Preparing ${device.name} | ${runtime.name} | ${device.udid}`);
  await phase("boot");
  if (device.state !== "Booted") {
    await simctl(["boot", device.udid], 30_000);
  }
  await phase("bootstatus");
  await simctl(["bootstatus", device.udid, "-b"], bootTimeout);

  await phase("verify-booted");
  // A fresh iOS runtime can still be busy immediately after bootstatus returns.
  // Ask only for booted devices and give this final state check a bounded minute.
  const afterBoot = await inventory(["list", "devices", "booted", "--json"], verificationTimeout);
  const actual = afterBoot.devices?.[runtime.identifier]?.find(
    (candidate) => candidate.udid === device.udid,
  );
  report.observedDevice = {
    udid: device.udid,
    state: actual?.state ?? "missing",
    isAvailable: actual?.isAvailable ?? false,
  };
  if (actual?.state !== "Booted" || actual.isAvailable !== true) {
    throw new Error(
      `${device.name} (${device.udid}) did not remain available and Booted after bootstatus; ` +
        `observed state: ${actual?.state ?? "missing"}.`,
    );
  }
  await phase("export-environment");
  if (process.env.GITHUB_ENV) {
    await appendFile(
      process.env.GITHUB_ENV,
      `ATHRECS_SAFARI_DEVICE_UDID=${device.udid}\nATHRECS_SAFARI_PLATFORM=ios\n`,
      "utf8",
    );
  }
  report.environmentExported = Boolean(process.env.GITHUB_ENV);
  note(`Ready: ${device.name} | ${runtime.name} | ${device.udid}`);
}

async function run() {
  await mkdir("artifacts", { recursive: true });
  try {
    await main();
    report.status = "passed";
    await phase("complete");
  } catch (error) {
    report.status = "failed";
    report.failure = { phase: report.phase, message: error.message };
    note(`iOS Safari simulator setup failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    report.finishedAt = new Date().toISOString();
    report.elapsedMs = Date.now() - started;
    await saveDiagnostics();
  }
}

run().catch((error) => {
  console.error(`Could not finish iOS Simulator setup diagnostics: ${error.message}`);
  process.exitCode = 1;
});
