import { execFile } from "node:child_process";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const commandTimeout = 20_000;
const inventoryTimeout = 60_000;
const bootTimeout = 180_000;
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
  // Serialize diagnostic writes so an older snapshot cannot overwrite progress.
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

async function recordToolchain() {
  const commands = [
    { name: "developerDirectory", file: "/usr/bin/xcode-select", args: ["-p"] },
    { name: "xcodeVersion", file: "/usr/bin/xcodebuild", args: ["-version"] },
  ];
  const results = await Promise.allSettled(
    commands.map(({ file, args }) =>
      exec(file, args, {
        encoding: "utf8",
        timeout: commandTimeout,
        killSignal: "SIGKILL",
        maxBuffer: 64 * 1024,
      }),
    ),
  );
  report.toolchain = {};
  for (const [index, result] of results.entries()) {
    const { name, file, args } = commands[index];
    const diagnostic = { command: `${file} ${args.join(" ")}`, timeoutMs: commandTimeout };
    if (result.status === "fulfilled") {
      diagnostic.output = result.value.stdout.trim();
      if (result.value.stderr.trim()) diagnostic.stderr = result.value.stderr.trim();
      note(`${diagnostic.command}: ${diagnostic.output}`);
    } else {
      diagnostic.error = String(result.reason.message).slice(-1200);
      diagnostic.timedOut = Boolean(result.reason.killed);
      note(`Toolchain diagnostic failed: ${diagnostic.command}: ${diagnostic.error}`);
    }
    report.toolchain[name] = diagnostic;
  }
  await saveDiagnostics();
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
  await phase("toolchain");
  await recordToolchain();
  await phase("inventory");
  // One request starts CoreSimulator once and returns both collections. Avoid
  // competing cold-start requests while the selected Xcode initializes it.
  const simulatorInventory = await inventory(["list", "--json"], inventoryTimeout);
  if (
    !simulatorInventory.devices ||
    typeof simulatorInventory.devices !== "object" ||
    !Array.isArray(simulatorInventory.runtimes)
  ) {
    throw new Error("Simulator inventory is missing its devices or runtimes collection.");
  }
  const { device, runtime } = selectDevice(simulatorInventory.devices, simulatorInventory.runtimes);
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
  // Post-boot inventory queries can hang even after bootstatus exits successfully.
  // The next step must prove readiness by creating native Safari and loading the
  // public page; this setup records only the preliminary bootstatus evidence.
  report.readiness = {
    evidence: "xcrun simctl bootstatus exited 0",
    exitCode: 0,
    deviceUDID: device.udid,
    observedAt: new Date().toISOString(),
    finalProofRequired: "Native Safari session, navigation and application checks must pass",
  };
  await phase("export-environment");
  const environment = {
    ATHRECS_SAFARI_DEVICE_UDID: device.udid,
    ATHRECS_SAFARI_PLATFORM: "ios",
    ATHRECS_SAFARI_DEVICE_NAME: device.name,
    ATHRECS_SAFARI_RUNTIME_VERSION: runtime.version,
  };
  for (const value of Object.values(environment)) {
    if (typeof value !== "string" || !value || /[\r\n\0]/.test(value)) {
      throw new Error("Selected Simulator metadata cannot be exported safely.");
    }
  }
  if (process.env.GITHUB_ENV) {
    await appendFile(
      process.env.GITHUB_ENV,
      Object.entries(environment)
        .map(([key, value]) => `${key}=${value}\n`)
        .join(""),
      "utf8",
    );
  }
  report.environmentExported = Boolean(process.env.GITHUB_ENV);
  note(
    `Bootstatus completed: ${device.name} | ${runtime.name} | ${device.udid}; native Safari must now verify readiness.`,
  );
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
