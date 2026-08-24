import {
  createPublicKey,
  verify as verifySignature,
  type JsonWebKey,
} from "node:crypto";

const GITHUB_ACTIONS_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_ACTIONS_JWKS_URL = `${GITHUB_ACTIONS_ISSUER}/.well-known/jwks`;
export const ATHRECS_CATALOGUE_OIDC_AUDIENCE = "athrecs-catalogue";

const TRUSTED_REPOSITORY = "brownep77/athrecs-holding";
const TRUSTED_REPOSITORY_ID = "1123206060";
const TRUSTED_OWNER_ID = "208288942";
const TRUSTED_REF = "refs/heads/main";
const TRUSTED_WORKFLOW_REF =
  "brownep77/athrecs-holding/.github/workflows/refresh-races.yml@refs/heads/main";
const TRUSTED_WORKFLOW_NAME = "Refresh Athrecs race data";
const ALLOWED_EVENTS = new Set(["schedule", "workflow_dispatch", "push"]);

type JwtHeader = {
  alg?: unknown;
  kid?: unknown;
  typ?: unknown;
};

type GitHubActionsClaims = Record<string, unknown> & {
  iss: string;
  aud: string | string[];
  exp: number;
  nbf?: number;
  iat: number;
  jti: string;
  repository: string;
  repository_id: string;
  repository_owner_id: string;
  repository_visibility: string;
  ref: string;
  ref_type: string;
  sha: string;
  run_id: string;
  run_attempt: string;
  event_name: string;
  workflow: string;
  workflow_ref: string;
  runner_environment: string;
};

type VerificationOptions = {
  now?: number;
  jwks?: JsonWebKey[];
};

type CachedKeys = {
  expiresAt: number;
  keys: JsonWebKey[];
};

let cachedKeys: CachedKeys | null = null;

function decodeJsonSegment<T>(segment: string, label: string): T {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as T;
  } catch {
    throw new Error(`GitHub Actions OIDC ${label} is not valid JSON`);
  }
}

function requiredString(claims: Record<string, unknown>, key: string): string {
  const value = claims[key];
  if (typeof value !== "string" || !value) {
    throw new Error(`GitHub Actions OIDC claim ${key} is missing`);
  }
  return value;
}

function requiredNumber(claims: Record<string, unknown>, key: string): number {
  const value = claims[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`GitHub Actions OIDC claim ${key} is missing`);
  }
  return value;
}

function audienceMatches(raw: unknown): boolean {
  if (typeof raw === "string") return raw === ATHRECS_CATALOGUE_OIDC_AUDIENCE;
  return Array.isArray(raw) && raw.includes(ATHRECS_CATALOGUE_OIDC_AUDIENCE);
}

function cacheSeconds(response: Response): number {
  const match = response.headers.get("cache-control")?.match(/max-age=(\d+)/i);
  const seconds = match ? Number(match[1]) : 900;
  return Math.min(3_600, Math.max(300, Number.isFinite(seconds) ? seconds : 900));
}

async function loadGitHubActionsKeys(now: number): Promise<JsonWebKey[]> {
  if (cachedKeys && cachedKeys.expiresAt > now) return cachedKeys.keys;
  const response = await fetch(GITHUB_ACTIONS_JWKS_URL, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) {
    throw new Error(`GitHub Actions OIDC keys returned HTTP ${response.status}`);
  }
  const payload = (await response.json()) as { keys?: unknown };
  if (!Array.isArray(payload.keys) || !payload.keys.length) {
    throw new Error("GitHub Actions OIDC keys are unavailable");
  }
  const keys = payload.keys.filter(
    (key): key is JsonWebKey =>
      typeof key === "object" && key !== null && (key as JsonWebKey).kty === "RSA",
  );
  if (!keys.length) throw new Error("GitHub Actions OIDC did not provide an RSA key");
  cachedKeys = { expiresAt: now + cacheSeconds(response), keys };
  return keys;
}

function assertClaim(actual: string, expected: string, name: string): void {
  if (actual !== expected) {
    throw new Error(`GitHub Actions OIDC ${name} is not trusted`);
  }
}

export async function verifyGitHubActionsOidcToken(
  token: string,
  options: VerificationOptions = {},
): Promise<GitHubActionsClaims> {
  if (!token || token.length > 16_000) throw new Error("GitHub Actions OIDC token is invalid");
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error("GitHub Actions OIDC token is malformed");
  }

  const header = decodeJsonSegment<JwtHeader>(parts[0], "header");
  const rawClaims = decodeJsonSegment<Record<string, unknown>>(parts[1], "payload");
  if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid) {
    throw new Error("GitHub Actions OIDC signing algorithm is not trusted");
  }
  if (header.typ !== undefined && header.typ !== "JWT") {
    throw new Error("GitHub Actions OIDC token type is not trusted");
  }

  const now = options.now ?? Math.floor(Date.now() / 1_000);
  const keys = options.jwks ?? (await loadGitHubActionsKeys(now));
  const jwk = keys.find((candidate) => candidate.kid === header.kid && candidate.kty === "RSA");
  if (!jwk) throw new Error("GitHub Actions OIDC signing key is unknown");
  const publicKey = createPublicKey({ key: jwk, format: "jwk" });
  const verified = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`, "utf8"),
    publicKey,
    Buffer.from(parts[2], "base64url"),
  );
  if (!verified) throw new Error("GitHub Actions OIDC signature is invalid");

  assertClaim(requiredString(rawClaims, "iss"), GITHUB_ACTIONS_ISSUER, "issuer");
  if (!audienceMatches(rawClaims.aud)) throw new Error("GitHub Actions OIDC audience is not trusted");

  const exp = requiredNumber(rawClaims, "exp");
  const iat = requiredNumber(rawClaims, "iat");
  const nbf = rawClaims.nbf === undefined ? iat : requiredNumber(rawClaims, "nbf");
  if (exp <= now || exp > now + 15 * 60) throw new Error("GitHub Actions OIDC token has expired");
  if (nbf > now + 60 || iat > now + 60 || iat < now - 15 * 60) {
    throw new Error("GitHub Actions OIDC token time window is invalid");
  }

  assertClaim(requiredString(rawClaims, "repository"), TRUSTED_REPOSITORY, "repository");
  assertClaim(
    requiredString(rawClaims, "repository_id"),
    TRUSTED_REPOSITORY_ID,
    "repository ID",
  );
  assertClaim(
    requiredString(rawClaims, "repository_owner_id"),
    TRUSTED_OWNER_ID,
    "repository owner ID",
  );
  assertClaim(requiredString(rawClaims, "repository_visibility"), "private", "visibility");
  assertClaim(requiredString(rawClaims, "ref"), TRUSTED_REF, "ref");
  assertClaim(requiredString(rawClaims, "ref_type"), "branch", "ref type");
  assertClaim(requiredString(rawClaims, "workflow_ref"), TRUSTED_WORKFLOW_REF, "workflow ref");
  assertClaim(requiredString(rawClaims, "workflow"), TRUSTED_WORKFLOW_NAME, "workflow");
  assertClaim(
    requiredString(rawClaims, "runner_environment"),
    "github-hosted",
    "runner environment",
  );
  const eventName = requiredString(rawClaims, "event_name");
  if (!ALLOWED_EVENTS.has(eventName)) throw new Error("GitHub Actions OIDC event is not trusted");
  const sha = requiredString(rawClaims, "sha");
  if (!/^[a-f0-9]{40}$/i.test(sha)) throw new Error("GitHub Actions OIDC commit SHA is invalid");
  const runId = requiredString(rawClaims, "run_id");
  const runAttempt = requiredString(rawClaims, "run_attempt");
  const jti = requiredString(rawClaims, "jti");
  if (!/^\d+$/.test(runId) || !/^\d+$/.test(runAttempt)) {
    throw new Error("GitHub Actions OIDC run identity is invalid");
  }

  return {
    ...rawClaims,
    iss: GITHUB_ACTIONS_ISSUER,
    aud: rawClaims.aud as string | string[],
    exp,
    nbf,
    iat,
    jti,
    repository: TRUSTED_REPOSITORY,
    repository_id: TRUSTED_REPOSITORY_ID,
    repository_owner_id: TRUSTED_OWNER_ID,
    repository_visibility: "private",
    ref: TRUSTED_REF,
    ref_type: "branch",
    sha,
    run_id: runId,
    run_attempt: runAttempt,
    event_name: eventName,
    workflow: TRUSTED_WORKFLOW_NAME,
    workflow_ref: TRUSTED_WORKFLOW_REF,
    runner_environment: "github-hosted",
  };
}
