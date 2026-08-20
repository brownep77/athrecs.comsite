export const DEFAULT_STAFF_HOST = "update.athrecs.com";
export const DEFAULT_STAFF_SITE_URL = `https://${DEFAULT_STAFF_HOST}`;

/** Normalize a comma/newline/semicolon-separated staff email allowlist. */
export function parseStaffEmails(value: string | undefined): string[] {
  return [
    ...new Set(
      (value ?? "")
        .split(/[,;\n\r]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

/** Return a bare, lower-case hostname from a URL, hostname or Host header. */
export function normalizeHostname(value: string | undefined): string {
  const first = (value ?? "").split(",", 1)[0]?.trim().toLowerCase() ?? "";
  if (!first) return "";

  try {
    return new URL(first.includes("://") ? first : `https://${first}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Staff tools run on their dedicated production hostname. Loopback and the two
 * first-party preview domains remain available for local and deployment QA.
 */
export function isPermittedStaffHostname(
  hostname: string | undefined,
  configuredHost = DEFAULT_STAFF_HOST,
): boolean {
  const actual = normalizeHostname(hostname);
  const expected = normalizeHostname(configuredHost) || DEFAULT_STAFF_HOST;

  return (
    actual === expected ||
    actual === "localhost" ||
    actual === "127.0.0.1" ||
    actual === "[::1]" ||
    actual === "::1" ||
    actual.endsWith(".vercel.app") ||
    actual.endsWith(".grok-sandbox.com")
  );
}
