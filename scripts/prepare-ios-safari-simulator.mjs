import { execFile } from "node:child_process";
import { appendFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const commandTimeout = 20_000;
const bootTimeout = 180_000;
const udidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

async function simctl(args, timeout = commandTimeout) {
  try {
    const { stdout } = await exec("xcrun", ["simctl", ...args], {
      encoding: "utf8",
      timeout,
      killSignal: "SIGKILL",
      maxBuffer: 2 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    const reason = error.killed
      ? `timed out after ${timeout / 1000}s`
      : `failed (${error.code ?? error.signal ?? "unknown status"})`;
    const detail = String(error.stderr || error.message || "")
      .trim()
      .slice(-1200);
    throw new Error(`xcrun simctl ${args.join(" ")} ${reason}${detail ? `: ${detail}` : ""}`);
  }
}

async function inventory(args) {
  const output = await simctl(args);
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
  if (process.platform !== "darwin" || process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("This setup runs only in GitHub Actions on a macOS runner.");
  }
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
  console.log(`Preparing ${device.name} | ${runtime.name} | ${device.udid}`);
  if (device.state !== "Booted") {
    await simctl(["boot", device.udid], 30_000);
  }
  await simctl(["bootstatus", device.udid, "-b"], bootTimeout);

  const afterBoot = await inventory(["list", "devices", "available", "--json"]);
  const actual = afterBoot.devices?.[runtime.identifier]?.find(
    (candidate) => candidate.udid === device.udid,
  );
  if (actual?.state !== "Booted" || actual.isAvailable !== true) {
    throw new Error(
      `${device.name} (${device.udid}) did not remain available and Booted after bootstatus; ` +
        `observed state: ${actual?.state ?? "missing"}.`,
    );
  }
  if (process.env.GITHUB_ENV) {
    await appendFile(
      process.env.GITHUB_ENV,
      `ATHRECS_SAFARI_DEVICE_UDID=${device.udid}\nATHRECS_SAFARI_PLATFORM=ios\n`,
      "utf8",
    );
  }
  console.log(`Ready: ${device.name} | ${runtime.name} | ${device.udid}`);
}

main().catch((error) => {
  console.error(`iOS Safari simulator setup failed: ${error.message}`);
  process.exitCode = 1;
});
