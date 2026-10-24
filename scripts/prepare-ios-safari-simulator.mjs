import { execFile } from "node:child_process";
import { appendFile, mkdir, stat, writeFile } from "node:fs/promises";
import { freemem, loadavg, release, totalmem, version } from "node:os";
import { isAbsolute, join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const commandTimeout = 20_000;
const inventoryTimeout = 60_000;
const cacheTimeout = 180_000;
const bootTimeout = 180_000;
const safariLaunchTimeout = 120_000;
const udidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const artifactPrefix = "artifacts/race-actions-safari-ios-setup";
const started = Date.now();
const report = {
  startedAt: new Date(started).toISOString(),
  hostPlatform: process.platform,
  hostArchitecture: process.arch,
  hostOS: { release: release(), version: version() },
  requestedDevice: {
    runtimeVersion: process.env.ATHRECS_SAFARI_REQUIRED_RUNTIME_VERSION ?? null,
    name: process.env.ATHRECS_SAFARI_REQUIRED_DEVICE_NAME ?? null,
  },
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
  report.phases.push({
    name,
    startedAt: new Date().toISOString(),
    hostResources: {
      physicalMemoryBytes: totalmem(),
      freeMemoryBytes: freemem(),
      loadAverage: loadavg(),
    },
  });
  note(`Phase: ${name}`);
  await saveDiagnostics();
}

async function runCommand(file, args, timeout = commandTimeout, combineOutput = false) {
  const commandStarted = Date.now();
  const commandText = `${file} ${args.join(" ")}`;
  const isInventory = file === "xcrun" && args[0] === "simctl" && args[1] === "list";
  const command = {
    file,
    args,
    phase: report.phase,
    timeoutMs: timeout,
    startedAt: new Date(commandStarted).toISOString(),
    status: "running",
  };
  report.commands.push(command);
  note(`Starting ${commandText} (limit ${timeout / 1000}s)`);
  await saveDiagnostics();
  try {
    const { stdout, stderr } = await exec(file, args, {
      encoding: "utf8",
      timeout,
      killSignal: "SIGKILL",
      maxBuffer: 2 * 1024 * 1024,
    });
    command.status = "passed";
    command.code = 0;
    command.elapsedMs = Date.now() - commandStarted;
    // Retain boot progress and errors, never the full simulator inventory.
    if (!isInventory && stdout.trim()) command.stdoutTail = stdout.trim().slice(-2000);
    if (stderr?.trim()) command.stderrTail = stderr.trim().slice(-2000);
    note(`Completed ${commandText} (${command.elapsedMs}ms)`);
    return combineOutput ? `${stdout}\n${stderr ?? ""}` : stdout;
  } catch (error) {
    command.status = "failed";
    command.elapsedMs = Date.now() - commandStarted;
    command.code = error.code ?? null;
    command.signal = error.signal ?? null;
    command.timedOut = Boolean(error.killed);
    if (error.stderr?.trim()) command.stderrTail = error.stderr.trim().slice(-2000);
    if (!isInventory && error.stdout?.trim()) command.stdoutTail = error.stdout.trim().slice(-2000);
    const reason = error.killed
      ? `timed out after ${timeout / 1000}s`
      : `failed (${error.code ?? error.signal ?? "unknown status"})`;
    const detail = String(error.stderr || error.message || "")
      .trim()
      .slice(-1200);
    command.error = `${commandText} ${reason}${detail ? `: ${detail}` : ""}`;
    note(command.error);
    throw new Error(command.error);
  } finally {
    await saveDiagnostics();
  }
}

const simctl = (args, timeout = commandTimeout) =>
  runCommand("xcrun", ["simctl", ...args], timeout);

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
    { name: "macOSVersion", file: "/usr/bin/sw_vers", args: [] },
    { name: "hostMachine", file: "/usr/bin/uname", args: ["-m"] },
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
  report.toolchain.developerDirectoryOverride = process.env.DEVELOPER_DIR ?? null;
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

async function recordHostDiagnostics(label) {
  if (process.platform !== "darwin" || process.env.GITHUB_ACTIONS !== "true") return;
  const commands = [
    { file: "/bin/ps", args: ["-axo", "pid,ppid,pcpu,rss,state,comm"] },
    { file: "/usr/bin/vm_stat", args: [] },
    { file: "/usr/sbin/sysctl", args: ["vm.swapusage"] },
  ];
  const snapshot = {
    label,
    phase: report.phase,
    startedAt: new Date().toISOString(),
    commands: [],
  };
  (report.hostDiagnostics ??= []).push(snapshot);
  const results = await Promise.allSettled(
    commands.map(({ file, args }) =>
      exec(file, args, {
        encoding: "utf8",
        timeout: 10_000,
        killSignal: "SIGKILL",
        maxBuffer: 512 * 1024,
      }),
    ),
  );
  for (const [index, result] of results.entries()) {
    const command = { ...commands[index], timeoutMs: 10_000, status: result.status };
    if (result.status === "fulfilled") {
      command.stdout = result.value.stdout.trim();
      command.stderr = result.value.stderr.trim();
      command.exitCode = 0;
    } else {
      command.error = String(result.reason.message).slice(-1200);
      command.stdout = String(result.reason.stdout ?? "").trim();
      command.stderr = String(result.reason.stderr ?? "").trim();
      command.exitCode = result.reason.code ?? null;
      command.signal = result.reason.signal ?? null;
      command.timedOut = Boolean(result.reason.killed);
    }
    snapshot.commands.push(command);
  }
  snapshot.finishedAt = new Date().toISOString();
  note(`Recorded host process, memory and swap diagnostics: ${label}`);
  await saveDiagnostics();
}

async function stopOtherActiveDevices(devices, selectedUDID) {
  const active = Object.entries(devices).flatMap(([runtime, entries]) =>
    entries
      .filter((device) => ["Booted", "Booting"].includes(device.state))
      .map(({ name, udid, state }) => ({ name, udid, state, runtime })),
  );
  report.initialActiveDevices = active;
  report.otherDeviceShutdowns = [];
  for (const device of active) {
    if (device.udid === selectedUDID) continue;
    if (!udidPattern.test(device.udid)) {
      throw new Error(
        "An initially active Simulator has an invalid UDID; cannot isolate the selected device.",
      );
    }
    const shutdown = { ...device, status: "running" };
    report.otherDeviceShutdowns.push(shutdown);
    await simctl(["shutdown", device.udid], 30_000);
    shutdown.status = "completed";
  }
  // This records the initial inventory and exact shutdown commands only. A fresh
  // post-boot inventory previously hung; actual native Safari remains the gate.
  await saveDiagnostics();
}

async function prepareRuntimeCache(runtime) {
  report.runtimeCache = { runtime: runtime.identifier, status: "probing" };
  const help = await runCommand("xcrun", ["simctl", "help", "runtime"], commandTimeout, true);
  report.runtimeCache.help = help.trim();
  if (!/\bdyld_shared_cache\b/.test(help)) {
    report.runtimeCache.status = "unsupported";
    report.runtimeCache.evidence =
      "Successful simctl help runtime output did not advertise dyld_shared_cache.";
    note(
      "Selected simctl does not advertise runtime dyld_shared_cache; native Safari must still verify readiness.",
    );
    await saveDiagnostics();
    return;
  }
  report.runtimeCache.status = "updating";
  try {
    // Wait for this runtime's cache only. Do not create caches for every installed
    // Xcode/runtime or force deletion and rebuilding of an existing cache.
    await simctl(["runtime", "dyld_shared_cache", "update", runtime.identifier], cacheTimeout);
    report.runtimeCache.status = "completed";
    report.runtimeCache.exitCode = 0;
  } catch (error) {
    report.runtimeCache.status = "failed";
    report.runtimeCache.error = error.message;
    throw error;
  } finally {
    await saveDiagnostics();
  }
}

function validateRequestedDevice() {
  const { runtimeVersion, name } = report.requestedDevice;
  if (runtimeVersion !== null && !/^\d+(?:\.\d+){1,2}$/.test(runtimeVersion)) {
    throw new Error(
      "ATHRECS_SAFARI_REQUIRED_RUNTIME_VERSION must be an exact version such as 18.5.",
    );
  }
  if (name !== null && (!name.trim() || name !== name.trim() || /[\r\n\0]/.test(name))) {
    throw new Error("ATHRECS_SAFARI_REQUIRED_DEVICE_NAME must be an exact nonempty device name.");
  }
}

async function openSimulatorUI() {
  const selectedDirectory = process.env.DEVELOPER_DIR || report.toolchain.developerDirectory.output;
  if (!selectedDirectory || !isAbsolute(selectedDirectory) || /[\r\n\0]/.test(selectedDirectory)) {
    throw new Error("Cannot resolve Simulator.app from the active Xcode developer directory.");
  }
  const developerDirectory = selectedDirectory.endsWith(".app")
    ? join(selectedDirectory, "Contents", "Developer")
    : selectedDirectory;
  const application = join(developerDirectory, "Applications", "Simulator.app");
  if (!(await stat(application)).isDirectory()) {
    throw new Error(`Selected Xcode does not contain Simulator.app: ${application}`);
  }
  report.simulatorUI = { application, deviceUDID: report.selectedDevice.udid, status: "opening" };
  // Use the selected Xcode's UI and WebKit's startup flag to avoid automatic
  // host/Simulator pasteboard synchronization. Explicit clipboard tests still run.
  await runCommand(
    "/usr/bin/open",
    ["-a", application, "--args", "-PasteboardAutomaticSync", "0"],
    30_000,
  );
  report.simulatorUI.status = "open-command-completed";
  await saveDiagnostics();
}

async function captureSimulatorScreen() {
  if (!report.readiness || report.diagnosticScreenshot) return;
  const path = `${artifactPrefix}-screen.png`;
  report.diagnosticScreenshot = { path, phase: report.phase, status: "running" };
  try {
    await simctl(["io", report.selectedDevice.udid, "screenshot", path]);
    const { size } = await stat(path);
    if (!size) throw new Error("Simulator screenshot is empty.");
    report.diagnosticScreenshot.status = "captured";
    report.diagnosticScreenshot.bytes = size;
  } catch (error) {
    // A diagnostic capture is not evidence of readiness and cannot turn a setup
    // or native browser failure into a pass.
    report.diagnosticScreenshot.status = "failed";
    report.diagnosticScreenshot.error = error.message;
    note(`Simulator screenshot diagnostic failed: ${error.message}`);
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
    .filter(
      (runtime) =>
        runtime.isAvailable === true &&
        (report.requestedDevice.runtimeVersion === null ||
          runtime.version === report.requestedDevice.runtimeVersion),
    )
    .sort(
      (a, b) => compareVersions(b.version, a.version) || a.identifier.localeCompare(b.identifier),
    );
  for (const runtime of available) {
    const phones = (devices[runtime.identifier] ?? [])
      .filter(
        (device) =>
          device.isAvailable === true &&
          udidPattern.test(device.udid) &&
          (report.requestedDevice.name === null || device.name === report.requestedDevice.name) &&
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
    "No available existing iPhone Simulator matched " +
      `runtime ${report.requestedDevice.runtimeVersion ?? "any installed version"} and ` +
      `device ${report.requestedDevice.name ?? "any iPhone"}. ` +
      `Reported iOS runtimes: ${summary || "none"}. ` +
      "Use a macOS runner with Xcode and an installed iOS Simulator runtime; this setup does not download runtimes.",
  );
}

async function main() {
  await phase("runner-check");
  if (process.platform !== "darwin" || process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("This setup runs only in GitHub Actions on a macOS runner.");
  }
  validateRequestedDevice();
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
  await phase("isolate-selected-device");
  await stopOtherActiveDevices(simulatorInventory.devices, device.udid);
  await phase("runtime-cache");
  await prepareRuntimeCache(runtime);
  await phase("before-boot-diagnostics");
  await recordHostDiagnostics("before-boot");
  await phase("boot");
  if (!["Booted", "Booting"].includes(device.state)) {
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
  await phase("after-bootstatus-diagnostics");
  await recordHostDiagnostics("after-bootstatus");
  await phase("open-simulator-ui");
  await openSimulatorUI();
  // Launch the installed browser once before WebDriver's remote connection.
  // This is a bounded warm-up; only the subsequent native session can verify it.
  await phase("launch-safari");
  await simctl(["launch", device.udid, "com.apple.mobilesafari"], safariLaunchTimeout);
  await phase("capture-safari-screen");
  await captureSimulatorScreen();
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
    await recordHostDiagnostics("failure");
    await captureSimulatorScreen();
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
