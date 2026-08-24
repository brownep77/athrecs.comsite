/**
 * Target checks shared by the Playwright capture scripts.
 *
 * Both run Chromium with `--no-sandbox` as root and take their URL and output
 * path from argv, so unchecked they could render local files or write output
 * outside the workspace.
 */
import { resolve, sep } from "node:path";

const LOOPBACK_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

function configuredExternalHosts() {
  return new Set(
    (process.env.BROWSER_ALLOWED_HOSTS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Allow loopback HTTP(S) by default. External targets must use HTTPS and match
 * the exact comma-separated BROWSER_ALLOWED_HOSTS allowlist. The older
 * BROWSER_ALLOW_EXTERNAL_HOST=1 escape hatch remains for explicitly supervised
 * local use.
 */
export function checkedUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    fail(`not a valid URL: ${url}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    fail(`only http/https URLs are allowed, got ${parsed.protocol} in ${url}`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLoopback = LOOPBACK_HOSTNAMES.has(hostname);
  const isAllowlisted = configuredExternalHosts().has(hostname);
  const legacyOverride = process.env.BROWSER_ALLOW_EXTERNAL_HOST === "1";

  if (!isLoopback && parsed.protocol !== "https:") {
    fail(`external browser targets must use https, got ${url}`);
  }
  if (!isLoopback && !isAllowlisted && !legacyOverride) {
    fail(
      `${hostname} is not loopback or explicitly allowlisted. ` +
        `Set BROWSER_ALLOWED_HOSTS to the exact trusted hostname.`,
    );
  }
  return url;
}

/** Absolute `outPng` if it is inside `allowedDirs`, else exit 1. */
export function checkedOutputPath(outPng, allowedDirs) {
  const abs = resolve(outPng);
  const allowed = allowedDirs.some(
    (dir) => abs === dir || abs.startsWith(dir.endsWith(sep) ? dir : dir + sep),
  );
  if (!allowed) {
    fail(`screenshot path must be under ${allowedDirs.join(" or ")}, got ${abs}`);
  }
  return abs;
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
}
