import { createHash, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";
import {
  historicalResultSource,
  type HistoricalResultSourcePolicy,
} from "./historical-result-sources";
import { verifyGitHubActionsOidcToken } from "./github-actions-oidc.server";
import {
  applyResultsImport,
  timeToSeconds,
  type ImportResultRow,
} from "./results-import.server";
import { ensureAthrecsSeeded } from "./seed.server";

const MAX_BODY_BYTES = 2_000_000;
const MAX_RESULTS = 400;
const MAX_TEXT = 240;
const EVENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BATCH_KEY_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,119}$/;

type SourceApprovalValue =
  | string
  | {
      permissionReference?: unknown;
    };

type SourceApprovals = Record<string, SourceApprovalValue>;

type NormalizedAutomationBatch = {
  sourceKey: string;
  sourceUrl: string;
  batchKey: string;
  permissionReference: string;
  results: ImportResultRow[];
};

class ResultAutomationError extends Error {
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
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) {
    throw new ResultAutomationError("A GitHub Actions OIDC bearer token is required", 401);
  }
  return match[1];
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ResultAutomationError(`${label} must be a JSON object`, 422);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string, max = MAX_TEXT): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ResultAutomationError(`${label} is required`, 422);
  if (text.length > max) {
    throw new ResultAutomationError(`${label} must be ${max} characters or fewer`, 422);
  }
  return text;
}

function optionalString(value: unknown, label: string, max = MAX_TEXT): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const text = requiredString(value, label, max);
  return text || undefined;
}

function optionalNumber(
  value: unknown,
  label: string,
  options: { integer?: boolean; min?: number; max?: number } = {},
): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new ResultAutomationError(`${label} must be a number`, 422);
  if (options.integer && !Number.isInteger(parsed)) {
    throw new ResultAutomationError(`${label} must be a whole number`, 422);
  }
  if (options.min !== undefined && parsed < options.min) {
    throw new ResultAutomationError(`${label} must be at least ${options.min}`, 422);
  }
  if (options.max !== undefined && parsed > options.max) {
    throw new ResultAutomationError(`${label} must be at most ${options.max}`, 422);
  }
  return parsed;
}

function validDate(value: unknown, label: string): string {
  const text = requiredString(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new ResultAutomationError(`${label} must use YYYY-MM-DD`, 422);
  }
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new ResultAutomationError(`${label} is not a real calendar date`, 422);
  }
  return text;
}

function officialSourceUrl(value: unknown, policy: HistoricalResultSourcePolicy): string {
  const text = requiredString(value, "sourceUrl", 500);
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new ResultAutomationError("sourceUrl must be a valid HTTPS URL", 422);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new ResultAutomationError("sourceUrl must be a credential-free HTTPS URL", 422);
  }
  if (parsed.toString() !== policy.officialArchiveUrl) {
    throw new ResultAutomationError("sourceUrl does not match the approved official archive", 422);
  }
  return parsed.toString();
}

function displayName(row: Record<string, unknown>, rowNumber: number): string {
  const direct =
    optionalString(row.displayName, `results[${rowNumber}].displayName`, 200) ??
    optionalString(row.athleteName, `results[${rowNumber}].athleteName`, 200);
  if (direct) return direct;
  const given = optionalString(row.givenName, `results[${rowNumber}].givenName`, 100) ?? "";
  const family = optionalString(row.familyName, `results[${rowNumber}].familyName`, 120) ?? "";
  const joined = `${given} ${family}`.trim();
  if (!joined) {
    throw new ResultAutomationError(
      `results[${rowNumber}] needs displayName, athleteName, or givenName/familyName`,
      422,
    );
  }
  return joined;
}

function privateAthleteSlug(
  policy: HistoricalResultSourcePolicy,
  row: Record<string, unknown>,
  eventSlug: string,
  date: string,
  distance: string,
  sourceResultId: string,
): string {
  const sourceAthleteId = optionalString(
    row.sourceAthleteId,
    "sourceAthleteId",
    MAX_TEXT,
  );
  const identity = sourceAthleteId
    ? `athlete|${sourceAthleteId}`
    : `result|${eventSlug}|${date}|${distance}|${sourceResultId}`;
  const digest = createHash("sha256")
    .update(`${policy.key}|${identity}`, "utf8")
    .digest("hex")
    .slice(0, 32);
  return `claim-${policy.key}-${digest}`;
}

function normalizeResultRow(
  value: unknown,
  rowNumber: number,
  policy: HistoricalResultSourcePolicy,
): ImportResultRow {
  const row = asRecord(value, `results[${rowNumber}]`);
  const eventSlug = requiredString(row.eventSlug, `results[${rowNumber}].eventSlug`, 160);
  if (!EVENT_SLUG_PATTERN.test(eventSlug)) {
    throw new ResultAutomationError(
      `results[${rowNumber}].eventSlug must be a lowercase URL slug`,
      422,
    );
  }
  const date = validDate(row.date, `results[${rowNumber}].date`);
  const distance = requiredString(row.distance, `results[${rowNumber}].distance`, 40);
  const sourceResultId = requiredString(
    row.sourceResultId,
    `results[${rowNumber}].sourceResultId`,
    MAX_TEXT,
  );
  const name = displayName(row, rowNumber);

  const finishTimeSeconds = optionalNumber(
    row.finishTimeSeconds,
    `results[${rowNumber}].finishTimeSeconds`,
    { integer: true, min: 1, max: 604_800 },
  );
  const chipTimeSeconds = optionalNumber(
    row.chipTimeSeconds,
    `results[${rowNumber}].chipTimeSeconds`,
    { integer: true, min: 1, max: 604_800 },
  );
  const gunTimeSeconds = optionalNumber(
    row.gunTimeSeconds,
    `results[${rowNumber}].gunTimeSeconds`,
    { integer: true, min: 1, max: 604_800 },
  );
  const time = optionalString(row.time, `results[${rowNumber}].time`, 40);
  const parsedTime = timeToSeconds(time);
  if (
    finishTimeSeconds === undefined &&
    chipTimeSeconds === undefined &&
    gunTimeSeconds === undefined &&
    (!parsedTime || parsedTime <= 0)
  ) {
    throw new ResultAutomationError(`results[${rowNumber}] needs a valid finish time`, 422);
  }

  const givenName = optionalString(row.givenName, `results[${rowNumber}].givenName`, 100);
  const familyName = optionalString(row.familyName, `results[${rowNumber}].familyName`, 120);

  return {
    eventSlug,
    eventName: optionalString(row.eventName, `results[${rowNumber}].eventName`, 200),
    sport: "Running",
    date,
    distance,
    place: optionalNumber(row.place, `results[${rowNumber}].place`, {
      integer: true,
      min: 1,
      max: 2_000_000,
    }),
    bib: optionalString(row.bib, `results[${rowNumber}].bib`, 80),
    athleteSlug: privateAthleteSlug(
      policy,
      row,
      eventSlug,
      date,
      distance,
      sourceResultId,
    ),
    givenName,
    familyName,
    displayName: name,
    gender: optionalString(row.gender, `results[${rowNumber}].gender`, 40),
    category: optionalString(row.category, `results[${rowNumber}].category`, 80),
    time,
    finishTimeSeconds,
    chipTimeSeconds,
    gunTimeSeconds,
    clubName: optionalString(row.clubName, `results[${rowNumber}].clubName`, 200),
    source: policy.officialArchiveUrl,
    resultSource: policy.displayName,
    city: optionalString(row.city, `results[${rowNumber}].city`, 120),
    county: optionalString(row.county, `results[${rowNumber}].county`, 120),
    country: optionalString(row.country, `results[${rowNumber}].country`, 120),
    distanceKm: optionalNumber(row.distanceKm, `results[${rowNumber}].distanceKm`, {
      min: 0.001,
      max: 2_000,
    }),
    status: optionalString(row.status, `results[${rowNumber}].status`, 60) ?? "finished",
    genderPlace: optionalNumber(row.genderPlace, `results[${rowNumber}].genderPlace`, {
      integer: true,
      min: 1,
      max: 2_000_000,
    }),
    categoryPlace: optionalNumber(row.categoryPlace, `results[${rowNumber}].categoryPlace`, {
      integer: true,
      min: 1,
      max: 2_000_000,
    }),
  };
}

function approvalReference(sourceKey: string): string | null {
  const raw = process.env.ATHRECS_RESULT_SOURCE_APPROVALS_JSON?.trim();
  if (!raw) return null;
  let parsed: SourceApprovals;
  try {
    parsed = JSON.parse(raw) as SourceApprovals;
  } catch {
    throw new ResultAutomationError("Result source approvals are misconfigured", 500);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ResultAutomationError("Result source approvals are misconfigured", 500);
  }
  const value = parsed[sourceKey];
  const reference =
    typeof value === "string"
      ? value.trim()
      : typeof value === "object" && value !== null
        ? typeof value.permissionReference === "string"
          ? value.permissionReference.trim()
          : ""
        : "";
  return reference || null;
}

function referencesMatch(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

function validateBatch(value: unknown): NormalizedAutomationBatch {
  const row = asRecord(value, "Historical result batch");
  const sourceKey = requiredString(row.sourceKey, "sourceKey", 80);
  const policy = historicalResultSource(sourceKey);
  if (!policy) throw new ResultAutomationError("sourceKey is not an approved source", 422);

  const sourceUrl = officialSourceUrl(row.sourceUrl, policy);
  const batchKey = requiredString(row.batchKey, "batchKey", 120);
  if (!BATCH_KEY_PATTERN.test(batchKey)) {
    throw new ResultAutomationError("batchKey contains unsupported characters", 422);
  }
  const permissionReference = requiredString(
    row.permissionReference,
    "permissionReference",
    240,
  );
  const configuredReference = approvalReference(sourceKey);
  if (!configuredReference) {
    throw new ResultAutomationError(
      "Participant-level ingestion is blocked until this source is approved",
      403,
    );
  }
  if (!referencesMatch(permissionReference, configuredReference)) {
    throw new ResultAutomationError("The source approval reference does not match", 403);
  }

  if (!Array.isArray(row.results) || !row.results.length) {
    throw new ResultAutomationError("results must be a non-empty array", 422);
  }
  if (row.results.length > MAX_RESULTS) {
    throw new ResultAutomationError(`A batch can contain at most ${MAX_RESULTS} results`, 413);
  }

  return {
    sourceKey,
    sourceUrl,
    batchKey,
    permissionReference,
    results: row.results.map((result, index) => normalizeResultRow(result, index, policy)),
  };
}

function publicError(error: unknown): string {
  return error instanceof Error ? error.message : "Historical result ingestion failed";
}

export async function handleAutomatedHistoricalResultsRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ ok: false, error: "Content-Type must be application/json" }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "Historical result batch is too large" }, 413);
  }

  let claims;
  try {
    claims = await verifyGitHubActionsOidcToken(bearerToken(request));
  } catch (error) {
    return jsonResponse({ ok: false, error: publicError(error) }, 401);
  }

  let batch: NormalizedAutomationBatch | null = null;
  try {
    const text = await request.text();
    if (!text || Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
      throw new ResultAutomationError("Historical result batch is empty or too large", 413);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ResultAutomationError("Historical result batch is not valid JSON", 400);
    }
    batch = validateBatch(parsed);

    const sourceContent = JSON.stringify({
      sourceKey: batch.sourceKey,
      batchKey: batch.batchKey,
      results: batch.results,
    });
    const fileSha256 = createHash("sha256").update(sourceContent, "utf8").digest("hex");

    await ensureAthrecsSeeded();
    const sql = await getSql();
    const previous = await sql<{
      id: string;
      rows_detected: number;
      rows_imported: number;
      rows_updated: number;
      rows_skipped: number;
      edition_count: number;
      error_count: number;
    }>`
      select
        id, rows_detected, rows_imported, rows_updated, rows_skipped,
        edition_count, error_count
      from result_ingestion_runs
      where source_name = ${historicalResultSource(batch.sourceKey)!.displayName}
        and file_sha256 = ${fileSha256}
        and status = 'completed'
      order by created_at desc
      limit 1
    `;
    if (previous[0]) {
      return jsonResponse({
        ok: true,
        reused: true,
        runId: previous[0].id,
        rowsDetected: previous[0].rows_detected,
        rowsInserted: previous[0].rows_imported,
        rowsUpdated: previous[0].rows_updated,
        rowsSkipped: previous[0].rows_skipped,
        editionsTracked: previous[0].edition_count,
        errorCount: previous[0].error_count,
        workflowRun: claims.run_id,
      });
    }

    const policy = historicalResultSource(batch.sourceKey)!;
    const approvalFingerprint = createHash("sha256")
      .update(batch.permissionReference, "utf8")
      .digest("hex")
      .slice(0, 16);
    const imported = await applyResultsImport(
      {
        results: batch.results,
        ingestion: {
          sport: "Running",
          sourceName: policy.displayName,
          sourceUrl: batch.sourceUrl,
          acquisitionMethod: "api",
          fileName: `${batch.sourceKey}-${batch.batchKey}.json`.slice(0, 240),
          notes: [
            `Approved historical result sync from ${policy.displayName}.`,
            `Permission approval fingerprint: ${approvalFingerprint}.`,
            `GitHub Actions run: ${claims.run_id}; commit: ${claims.sha}.`,
            "Participant athletes and results are staged private for authenticated matching and claim.",
          ].join(" "),
        },
      },
      { sourceContent },
    );

    return jsonResponse({
      ok: true,
      reused: false,
      runId: imported.runId,
      rowsDetected: batch.results.length,
      athletesUpserted: imported.athletesUpserted,
      resultsUpserted: imported.resultsUpserted,
      rowsInserted: imported.resultsInserted,
      rowsUpdated: imported.resultsUpdated,
      rowsSkipped: imported.skipped,
      editionsTracked: imported.editionsTracked,
      errorCount: imported.errors.length,
      workflowRun: claims.run_id,
    });
  } catch (error) {
    if (error instanceof ResultAutomationError) {
      return jsonResponse({ ok: false, error: error.message }, error.status);
    }
    console.error("[historical-result-automation] ingestion failed", {
      repository: claims.repository,
      runId: claims.run_id,
      sourceKey: batch?.sourceKey ?? null,
      batchKey: batch?.batchKey ?? null,
      error: publicError(error),
    });
    return jsonResponse({ ok: false, error: "Historical result ingestion failed" }, 500);
  }
}
