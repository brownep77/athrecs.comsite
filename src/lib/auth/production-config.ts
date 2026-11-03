/** Shared build/runtime guard. Errors identify settings, never their values. */
type AuthEnvironment = Readonly<Record<string, string | undefined>>;

const present = (value: string | undefined) => Boolean(value?.trim());
const localHost = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host === "::" ||
    host === "::1" ||
    /^127\./.test(host)
  );
};

export function productionAuthConfigurationIssues(
  environment: AuthEnvironment,
  emailPasswordEnabled: boolean,
): string[] {
  if (environment.VERCEL_ENV?.trim().toLowerCase() !== "production") return [];
  const issues: string[] = [];
  if (environment.VITE_AUTH_ENABLED?.trim().toLowerCase() === "false")
    issues.push("VITE_AUTH_ENABLED must not disable production authentication");
  if ((environment.BETTER_AUTH_SECRET?.trim().length ?? 0) < 32)
    issues.push("BETTER_AUTH_SECRET must contain at least 32 characters");
  let base: URL | undefined;
  try {
    base = new URL(environment.BETTER_AUTH_URL?.trim() ?? "");
  } catch {
    /* reported below */
  }
  if (
    !base ||
    base.protocol !== "https:" ||
    localHost(base.hostname) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  )
    issues.push("BETTER_AUTH_URL must be a public HTTPS origin without credentials, path or query");
  let database: URL | undefined;
  try {
    database = new URL(environment.DATABASE_URL?.trim() ?? "");
  } catch {
    /* reported below */
  }
  if (
    !database ||
    !["postgres:", "postgresql:"].includes(database.protocol) ||
    !database.hostname ||
    localHost(database.hostname) ||
    database.pathname.length < 2
  )
    issues.push("DATABASE_URL must identify a non-local PostgreSQL database");
  if (emailPasswordEnabled && !present(environment.RESEND_API_KEY))
    issues.push("RESEND_API_KEY is required for production email verification and recovery");
  return issues;
}

export function assertProductionAuthConfiguration(
  environment: AuthEnvironment,
  emailPasswordEnabled: boolean,
): void {
  const issues = productionAuthConfigurationIssues(environment, emailPasswordEnabled);
  if (issues.length)
    throw new Error(`Production authentication configuration rejected: ${issues.join("; ")}.`);
}
