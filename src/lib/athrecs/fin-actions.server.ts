import { createHash, timingSafeEqual } from "node:crypto";
import type { Sql } from "../db";
import type { FinProfileSearchResult, FinSignupInput, FinSignupLink } from "./fin-onboarding";

export type FinEnvironment = {
  ATHRECS_FIN_ENABLED?: string;
  ATHRECS_FIN_CONNECTOR_SECRET?: string;
  INTERCOM_SECRET_KEY?: string;
  VITE_SITE_BRAND?: string;
  DATABASE_URL?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  /** Existing Vite project/branch selectors also identify specialist builds. */
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_GIT_COMMIT_REF?: string;
};

export type FinActionDependencies = {
  env?: FinEnvironment;
  getSql?: () => Promise<Sql>;
  findPublicProfiles?: (sql: Sql, racingName: string) => Promise<FinProfileSearchResult>;
  createSignupLink?: (sql: Sql, input: FinSignupInput, secret: string) => Promise<FinSignupLink>;
};

export const FIN_ACTIONS_PER_MINUTE = 120;
export const FIN_ACTION_BODY_LIMIT_BYTES = 8 * 1024;

const responseHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
};

/** Match the repository's existing explicit, project and branch brand selectors. */
export function finIsAthrecsEnvironment(env: FinEnvironment = process.env): boolean {
  const branch = env.VERCEL_GIT_COMMIT_REF?.trim();
  return (
    env.VITE_SITE_BRAND?.trim().toLowerCase() !== "runrecs" &&
    !env.VERCEL_PROJECT_PRODUCTION_URL?.trim().toLowerCase().includes("runrecs") &&
    branch !== "feat/runrecs-running-site" &&
    branch !== "runrecs-production"
  );
}

/** The connector secret is separate from the Messenger identity signing key. */
export function finConnectorConfigured(env: FinEnvironment = process.env): boolean {
  const secret = env.ATHRECS_FIN_CONNECTOR_SECRET?.trim() ?? "";
  const deployed = env.NODE_ENV === "production" || Boolean(env.VERCEL_ENV?.trim());
  return (
    env.ATHRECS_FIN_ENABLED === "true" &&
    secret.length >= 32 &&
    secret !== env.INTERCOM_SECRET_KEY?.trim() &&
    finIsAthrecsEnvironment(env) &&
    // Explicitly enabled local tests may use disposable PGlite. Deployed
    // previews and production require durable storage for links and quotas.
    (!deployed || Boolean(env.DATABASE_URL?.trim()))
  );
}

function authorized(request: Request, secret: string): boolean {
  // Both digests have the same size, even when the supplied header is malformed.
  const actual = createHash("sha256")
    .update(request.headers.get("authorization") ?? "")
    .digest();
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(actual, expected);
}

function respond(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...responseHeaders, ...extraHeaders } });
}

class InvalidBodyError extends Error {
  readonly status: 400 | 413;

  constructor(status: 400 | 413) {
    super("Invalid action body");
    this.status = status;
  }
}

async function readBody(request: Request): Promise<unknown> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    if (!/^\d+$/.test(declaredLength)) throw new InvalidBodyError(400);
    if (Number(declaredLength) > FIN_ACTION_BODY_LIMIT_BYTES) throw new InvalidBodyError(413);
  }
  if (!request.body) throw new InvalidBodyError(400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > FIN_ACTION_BODY_LIMIT_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new InvalidBodyError(413);
      }
      chunks.push(value);
    }
    // A Content-Length check alone would miss chunked or misleading requests.
    const raw = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, length));
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof InvalidBodyError) throw error;
    throw new InvalidBodyError(400);
  } finally {
    reader.releaseLock();
  }
}

/** Shared by all application instances; no process-local counter or supplied identity. */
async function reserveAction(sql: Sql): Promise<{ allowed: boolean; retryAfter: number }> {
  return sql.transaction(async (tx) => {
    await tx.query("select set_config('statement_timeout', '8000', true)");
    await tx`delete from fin_connector_usage where expires_at <= now()`;
    const [quota] = await tx<{ allowed: boolean; retry_after: number }>`
      with minute_window as (
        select floor(extract(epoch from now()) / 60)::bigint as minute
      ), reserved as (
        insert into fin_connector_usage (bucket, requests, expires_at)
        select 'actions:' || minute::text, 1, to_timestamp((minute + 1) * 60)
        from minute_window
        on conflict (bucket) do update set requests = fin_connector_usage.requests + 1
          where fin_connector_usage.requests < ${FIN_ACTIONS_PER_MINUTE}
        returning requests
      )
      select exists(select 1 from reserved) as allowed,
        greatest(1, ceil(extract(epoch from (
          date_trunc('minute', now()) + interval '1 minute' - now()
        )))::int) as retry_after
    `;
    return {
      allowed: quota?.allowed === true,
      retryAfter: Math.min(60, Math.max(1, Number(quota?.retry_after) || 60)),
    };
  });
}

/** Public directory projection only; no private account, claim or source evidence. */
export async function findFinPublicProfiles(
  sql: Sql,
  racingName: string,
): Promise<FinProfileSearchResult> {
  const { finProfileSearchSchema } = await import("./fin-onboarding.ts");
  const input = finProfileSearchSchema.parse({ action: "find_public_profiles", racingName });
  const { readAthleteDirectoryPage } = await import("./athlete-directory-page.server.ts");
  const directory = await sql.transaction(async (tx) => {
    await tx.query("select set_config('statement_timeout', '8000', true)");
    return readAthleteDirectoryPage(tx, {
      q: input.racingName,
      page: 1,
      pageSize: 5,
      includeFacets: false,
    });
  });
  const profiles = directory.athletes.map((athlete) => ({
    displayName: athlete.display_name,
    athleteNumber: athlete.athlete_number,
    profileUrl: `https://www.athrecs.com/athletes/${encodeURIComponent(athlete.slug)}`,
    city: athlete.city || null,
    country: athlete.country || null,
    club: athlete.club || null,
    sports: athlete.sports,
    publicResultCount: athlete.result_count,
  }));
  return {
    status: profiles.length ? "possible_profiles" : "no_public_profiles",
    profiles,
    hasMore: directory.hasMore === true,
    scope: "public_directory_search",
    message: profiles.length
      ? "These are possible public profiles returned for this search. A displayed name or other public profile information may match; this does not confirm ownership or a particular race. Review the profile before continuing."
      : "No public profiles matched this search. This does not mean the athlete has no results. An account can still help them find stored results and build their sporting history.",
  };
}

/** Intercom service-to-service actions. This endpoint has no private-user write authority. */
export async function handleFinActionRequest(
  request: Request,
  dependencies: FinActionDependencies = {},
): Promise<Response> {
  const env = dependencies.env ?? process.env;
  if (!finConnectorConfigured(env)) {
    return respond(
      { status: "unavailable", message: "AthRecs assistant actions are not available." },
      503,
    );
  }
  if (request.method !== "POST") {
    return respond({ status: "method_not_allowed", message: "Use POST." }, 405, { Allow: "POST" });
  }
  const secret = env.ATHRECS_FIN_CONNECTOR_SECRET!.trim();
  if (!authorized(request, secret)) {
    return respond({ status: "unauthorized", message: "Authentication required." }, 401);
  }
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
  ) {
    return respond({ status: "unsupported_media_type", message: "Use application/json." }, 415);
  }

  let input: unknown;
  try {
    input = await readBody(request);
  } catch (error) {
    const status = error instanceof InvalidBodyError ? error.status : 400;
    return respond(
      {
        status: status === 413 ? "request_too_large" : "invalid_request",
        message: status === 413 ? "Request is too large." : "Check the action and required fields.",
      },
      status,
    );
  }
  // Runtime application imports occur only after connector authentication.
  const { finActionSchema } = await import("./fin-onboarding.ts");
  const { finResearchActionSchema } = await import("./fin-research.ts");
  const parsed = finActionSchema.safeParse(input);
  const research = parsed.success ? null : finResearchActionSchema.safeParse(input);
  if (!parsed.success && !research?.success) {
    return respond(
      { status: "invalid_request", message: "Check the action and required fields." },
      400,
    );
  }

  try {
    const sql = dependencies.getSql
      ? await dependencies.getSql()
      : await (await import("../db")).getSql();
    const quota = await reserveAction(sql);
    if (!quota.allowed) {
      return respond(
        { status: "rate_limited", message: "Too many requests. Please try again shortly." },
        429,
        { "Retry-After": String(quota.retryAfter) },
      );
    }
    if (parsed.success && parsed.data.action === "find_public_profiles") {
      const findProfiles = dependencies.findPublicProfiles ?? findFinPublicProfiles;
      return respond(await findProfiles(sql, parsed.data.racingName));
    }
    if (research?.success) {
      const { fetchPublicSourcePage, handleFinResearchAction, FinResearchError } = await import(
        "./fin-research.server.ts"
      );
      try {
        const outcome = await handleFinResearchAction(sql, research.data, fetchPublicSourcePage);
        return respond(outcome.body, outcome.httpStatus);
      } catch (error) {
        if (error instanceof FinResearchError) {
          return respond({ status: error.code, message: error.message }, error.status);
        }
        throw error;
      }
    }
    if (!parsed.success || parsed.data.action !== "create_signup_link") {
      return respond(
        { status: "invalid_request", message: "Check the action and required fields." },
        400,
      );
    }
    const { createFinSignupLink, FinOnboardingError } = await import("./fin-onboarding.server.ts");
    const createSignupLink = dependencies.createSignupLink ?? createFinSignupLink;
    try {
      return respond(await createSignupLink(sql, parsed.data, secret));
    } catch (error) {
      if (error instanceof FinOnboardingError) {
        return respond(
          {
            status: error.code,
            message: "This signup-link request is no longer available. Start a new request.",
          },
          error.status,
        );
      }
      throw error;
    }
  } catch {
    // Provider errors, SQL details, secrets and athlete inputs never enter this response.
    return respond(
      { status: "unavailable", message: "This action could not be completed. Please try again." },
      503,
    );
  }
}
