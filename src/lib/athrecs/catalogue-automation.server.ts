import type { CatalogueBatchInput } from "./catalogue-publishing.server";
import { verifyGitHubActionsOidcToken } from "./github-actions-oidc.server";

const MAX_BODY_BYTES = 1_250_000;
const MAX_EVENTS = 75;
const MAX_EDITIONS = 200;
const SOURCE_KEY_PREFIX = "athrecs-holding:delta:";

class AutomationRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) throw new AutomationRequestError("A GitHub Actions OIDC bearer token is required", 401);
  return match[1];
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AutomationRequestError("The catalogue batch must be a JSON object", 422);
  }
  return value as Record<string, unknown>;
}

function validateBatch(
  value: unknown,
  expectedSourceUrl: string,
): CatalogueBatchInput {
  const row = asRecord(value);
  const sourceKey = typeof row.sourceKey === "string" ? row.sourceKey.trim() : "";
  const sourceUrl = typeof row.sourceUrl === "string" ? row.sourceUrl.trim() : "";
  const events = row.events === undefined ? [] : row.events;
  const editions = row.editions === undefined ? [] : row.editions;

  if (!sourceKey.startsWith(SOURCE_KEY_PREFIX) || sourceKey.length > 160) {
    throw new AutomationRequestError("The automated sourceKey is not trusted", 422);
  }
  if (sourceUrl !== expectedSourceUrl) {
    throw new AutomationRequestError("The automated sourceUrl does not match this workflow run", 422);
  }
  if (!Array.isArray(events) || !Array.isArray(editions)) {
    throw new AutomationRequestError("events and editions must be arrays", 422);
  }
  if (!events.length && !editions.length) {
    throw new AutomationRequestError("The automated batch is empty", 422);
  }
  if (events.length > MAX_EVENTS || editions.length > MAX_EDITIONS) {
    throw new AutomationRequestError(
      `The automated batch exceeds ${MAX_EVENTS} events or ${MAX_EDITIONS} editions`,
      413,
    );
  }

  return {
    sourceKey,
    sourceUrl,
    events: events as NonNullable<CatalogueBatchInput["events"]>,
    editions: editions as NonNullable<CatalogueBatchInput["editions"]>,
  };
}

function publicError(error: unknown): string {
  return error instanceof Error ? error.message : "Catalogue staging failed";
}

export async function handleAutomatedCatalogueRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ ok: false, error: "Content-Type must be application/json" }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "Catalogue batch is too large" }, 413);
  }

  let claims;
  try {
    claims = await verifyGitHubActionsOidcToken(bearerToken(request));
  } catch (error) {
    return jsonResponse({ ok: false, error: publicError(error) }, 401);
  }

  try {
    const text = await request.text();
    if (!text || Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
      throw new AutomationRequestError("Catalogue batch is empty or too large", 413);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new AutomationRequestError("Catalogue batch is not valid JSON", 400);
    }

    const expectedSourceUrl = `https://github.com/${claims.repository}/actions/runs/${claims.run_id}`;
    const batch = validateBatch(parsed, expectedSourceUrl);
    const submittedBy = `github-actions:${claims.repository}@${claims.sha}#run-${claims.run_id}-attempt-${claims.run_attempt}`;
    const { stageCatalogueBatch, validateCatalogueBatch } = await import(
      "./catalogue-publishing.server"
    );
    const staged = await stageCatalogueBatch(batch, submittedBy);

    try {
      const validation = await validateCatalogueBatch(staged.batchId);
      return jsonResponse(
        {
          ok: true,
          batchId: staged.batchId,
          reused: staged.reused,
          status: validation.status,
          validation,
          workflowRun: claims.run_id,
        },
        202,
      );
    } catch (error) {
      const message = publicError(error);
      if (staged.reused && /published batch cannot be validated again/i.test(message)) {
        return jsonResponse({
          ok: true,
          batchId: staged.batchId,
          reused: true,
          status: "published",
          workflowRun: claims.run_id,
        });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof AutomationRequestError) {
      return jsonResponse({ ok: false, error: error.message }, error.status);
    }
    console.error("[catalogue-automation] staging failed", {
      repository: claims.repository,
      runId: claims.run_id,
      error: publicError(error),
    });
    return jsonResponse({ ok: false, error: "Catalogue staging failed" }, 500);
  }
}
