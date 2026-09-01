const LEGACY_STRICT_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);
const SSL_QUERY_PARAMETERS = ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert"];

function parsePostgresUrl(rawConnectionString) {
  const value = rawConnectionString.trim();
  try {
    const url = new URL(value);
    return url.protocol === "postgres:" || url.protocol === "postgresql:" ? url : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Preserve node-postgres' current strict TLS semantics explicitly.
 *
 * pg-connection-string currently treats prefer, require and verify-ca as
 * verify-full unless libpq compatibility is requested. Its next major version
 * will give those modes their weaker libpq meanings, so leaving them ambiguous
 * both emits a warning today and risks a silent security downgrade later.
 */
export function normalizePostgresConnectionString(rawConnectionString) {
  const value = rawConnectionString.trim();
  const url = parsePostgresUrl(value);
  if (!url) return value;

  const libpqCompatibility =
    url.searchParams.get("uselibpqcompat")?.trim().toLowerCase() === "true";
  const sslMode = url.searchParams.get("sslmode")?.trim().toLowerCase();
  if (!libpqCompatibility && sslMode && LEGACY_STRICT_SSL_MODES.has(sslMode)) {
    url.searchParams.set("sslmode", "verify-full");
  }

  return url.toString();
}

/** Build a Pool/Client config without exposing or modifying DATABASE_URL. */
export function postgresConnectionConfig(rawConnectionString, extras = {}) {
  const connectionString = normalizePostgresConnectionString(rawConnectionString);
  const url = parsePostgresUrl(connectionString);
  const hasSslDirective =
    url && SSL_QUERY_PARAMETERS.some((parameter) => url.searchParams.has(parameter));
  const managedTlsHost =
    url &&
    (url.hostname === "neon.tech" ||
      url.hostname.endsWith(".neon.tech") ||
      url.hostname.endsWith(".amazonaws.com"));

  return {
    ...extras,
    connectionString,
    ...(!hasSslDirective && managedTlsHost ? { ssl: true } : {}),
  };
}
