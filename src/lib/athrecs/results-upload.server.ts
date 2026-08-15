import { createHash } from "node:crypto";
import {
  resultUploadRowSchema,
  resultUploadSchema,
  type ResultUploadInput,
  type ResultUploadRowInput,
} from "./multisport.types";
import { requireCompetitionUploadPermission } from "./access.server";
import { withSqlTransaction } from "./transaction.server";
import { addEvidenceItems } from "./workflow.server";

export type StagedUploadResult = {
  batchId: number;
  duplicateOfBatchId: number | null;
  status:
    | "needs_correction"
    | "submitted"
    | "under_review"
    | "verified"
    | "rejected"
    | "publishing"
    | "published"
    | "failed";
  rowCount: number;
  validRowCount: number;
  warningCount: number;
  errorCount: number;
};

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** RFC-4180-style parser supporting quoted commas, quotes and line breaks. */
export function parseCsv(text: string): ParsedCsv {
  const matrix: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    if (row.some((value) => value.trim() !== "")) matrix.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n") {
      pushField();
      pushRow();
    } else if (char !== "\r") {
      field += char;
    }
  }
  pushField();
  pushRow();

  if (quoted) throw new Error("CSV contains an unclosed quoted field");
  if (matrix.length < 2) throw new Error("CSV needs a header and at least one result row");

  const headers = matrix[0].map(normalizeHeader);
  if (headers.some((header) => !header)) throw new Error("CSV contains a blank header");
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate headers");

  const rows = matrix.slice(1).map((values) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index]?.trim() ?? "";
    });
    return record;
  });
  return { headers, rows };
}

function numberOrUndefined(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function integerOrUndefined(value: string | undefined): number | undefined {
  const number = numberOrUndefined(value);
  return number === undefined || !Number.isInteger(number) ? undefined : number;
}

function jsonOrDefault<T>(value: string | undefined, fallback: T): T {
  if (!value?.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function splitNames(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  if (value.trim().startsWith("[")) {
    return jsonOrDefault<unknown[]>(value, [])
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Convert the standard Athrecs CSV template into generic result rows. */
export function csvToResultRows(csv: string): {
  headers: string[];
  rows: Record<string, unknown>[];
} {
  const parsed = parseCsv(csv);
  return {
    headers: parsed.headers,
    rows: parsed.rows.map((row) => ({
      externalEntryKey: row.external_entry_key || undefined,
      participantKind: row.participant_kind || "individual",
      athleteId: integerOrUndefined(row.athlete_id),
      athleteExternalId: row.athlete_external_id || undefined,
      teamId: integerOrUndefined(row.team_id),
      displayName: row.display_name || undefined,
      teamName: row.team_name || undefined,
      memberNames: splitNames(row.member_names),
      bib: row.bib || undefined,
      lane: row.lane || undefined,
      categoryCode: row.category_code || undefined,
      categoryName: row.category_name || undefined,
      clubId: integerOrUndefined(row.club_id),
      clubName: row.club_name || undefined,
      countryCode: row.country_code || undefined,
      resultStatus: row.result_status || "finished",
      rankOverall: integerOrUndefined(row.rank_overall),
      rankCategory: integerOrUndefined(row.rank_category),
      rankGender: integerOrUndefined(row.rank_gender),
      performanceValue: numberOrUndefined(row.performance_value),
      performanceUnit: row.performance_unit || undefined,
      performanceDisplay: row.performance_display || undefined,
      points: numberOrUndefined(row.points),
      scoreFor: numberOrUndefined(row.score_for),
      scoreAgainst: numberOrUndefined(row.score_against),
      outcome: row.outcome || undefined,
      sourceUrl: row.source_url || undefined,
      metrics: jsonOrDefault(row.metrics_json, []),
      segments: jsonOrDefault(row.segments_json, []),
      customData: jsonOrDefault(row.custom_data_json, {}),
    })),
  };
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }
  return value;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function resultRowFingerprint(row: ResultUploadRowInput): string {
  return sha256(
    stableStringify({
      externalEntryKey: row.externalEntryKey ?? null,
      athleteId: row.athleteId ?? null,
      athleteExternalId: row.athleteExternalId ?? null,
      teamId: row.teamId ?? null,
      displayName: row.displayName?.toLowerCase() ?? null,
      teamName: row.teamName?.toLowerCase() ?? null,
      bib: row.bib ?? null,
      resultStatus: row.resultStatus,
      rankOverall: row.rankOverall ?? null,
      performanceValue: row.performanceValue ?? null,
      performanceUnit: row.performanceUnit ?? null,
      performanceDisplay: row.performanceDisplay ?? null,
      points: row.points ?? null,
      scoreFor: row.scoreFor ?? null,
      scoreAgainst: row.scoreAgainst ?? null,
      metrics: row.metrics,
      segments: row.segments,
    }),
  );
}

function zodMessages(error: { issues: { path: PropertyKey[]; message: string }[] }): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

export async function stageResultUpload(
  userId: string,
  input: ResultUploadInput,
  rawHeaders: string[] = [],
): Promise<StagedUploadResult> {
  input = resultUploadSchema.parse(input);
  const permission = await requireCompetitionUploadPermission(
    userId,
    input.organisationId,
    input.competitionId,
  );
  return withSqlTransaction(async (sql) => {
    const contentHash = sha256(
      stableStringify({
        competitionId: input.competitionId,
        uploadFormat: input.uploadFormat,
        isFinalResults: input.isFinalResults,
        declaredOfficial: input.declaredOfficial,
        sourceUrl: input.sourceUrl ?? null,
        evidence: input.evidence,
        rows: input.rows,
      }),
    );
  
    const inserted = await sql<{ id: number }>`
      insert into result_upload_batches (
        organisation_id, competition_id, uploaded_by_user_id, original_filename,
        mime_type, byte_size, sha256, upload_format, parser_version, status,
        source_url, declared_official, is_final_results, uploader_note, raw_headers
      ) values (
        ${input.organisationId}, ${input.competitionId}, ${userId},
        ${input.originalFilename}, ${input.mimeType ?? null},
        ${Buffer.byteLength(stableStringify(input.rows), "utf8")}, ${contentHash},
        ${input.uploadFormat}, ${"athrecs-v1"}, ${"validating"},
        ${input.sourceUrl || null}, ${input.declaredOfficial}, ${input.isFinalResults},
        ${input.uploaderNote ?? null}, ${JSON.stringify(rawHeaders)}::jsonb
      )
      on conflict (organisation_id, competition_id, sha256) do nothing
      returning id
    `;
  
    if (!inserted[0]) {
      const duplicate = await sql<{ id: number; status: string }>`
        select id, status
        from result_upload_batches
        where organisation_id = ${input.organisationId}
          and competition_id = ${input.competitionId}
          and sha256 = ${contentHash}
        limit 1
      `;
      const existing = duplicate[0];
      if (!existing) throw new Error("The duplicate upload could not be resolved");
      const counts = await sql<{
        row_count: number;
        valid_row_count: number;
        warning_count: number;
        error_count: number;
      }>`
        select row_count, valid_row_count, warning_count, error_count
        from result_upload_batches where id = ${existing.id}
      `;
      const count = counts[0];
      return {
        batchId: existing.id,
        duplicateOfBatchId: existing.id,
        status: [
          "needs_correction",
          "submitted",
          "under_review",
          "verified",
          "rejected",
          "publishing",
          "published",
          "failed",
        ].includes(existing.status)
          ? (existing.status as StagedUploadResult["status"])
          : "needs_correction",
        rowCount: count?.row_count ?? 0,
        validRowCount: count?.valid_row_count ?? 0,
        warningCount: count?.warning_count ?? 0,
        errorCount: count?.error_count ?? 0,
      };
    }
  
    const batchId = inserted[0].id;
    let validRowCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let participantKindMismatchCount = 0;
    let modelWarningCount = 0;
    const seenFingerprints = new Set<string>();
    const seenExternalKeys = new Set<string>();
    const overallRanks = new Map<number, number>();
  
    for (let index = 0; index < input.rows.length; index += 1) {
      const raw = input.rows[index];
      const parsed = resultUploadRowSchema.safeParse(raw);
      const errors: string[] = [];
      const warnings: string[] = [];
      let normalized: ResultUploadRowInput | null = null;
      let fingerprint: string | null = null;
  
      if (!parsed.success) {
        errors.push(...zodMessages(parsed.error));
      } else {
        normalized = parsed.data;
        if (
          permission.participantKind !== "mixed" &&
          normalized.participantKind !== permission.participantKind
        ) {
          participantKindMismatchCount += 1;
          errors.push(
            `Participant kind ${normalized.participantKind} does not match competition kind ${permission.participantKind}`,
          );
        }
  
        const hasPrimaryPerformance =
          normalized.performanceValue !== undefined ||
          Boolean(normalized.performanceDisplay) ||
          normalized.metrics.length > 0;
        if (normalized.resultStatus === "finished") {
          if (
            ["time", "distance", "height"].includes(permission.resultModel) &&
            !hasPrimaryPerformance
          ) {
            modelWarningCount += 1;
            warnings.push(
              `A finished ${permission.resultModel} result should include a measured performance`,
            );
          } else if (
            ["score", "win_loss"].includes(permission.resultModel) &&
            normalized.scoreFor === undefined &&
            normalized.scoreAgainst === undefined &&
            normalized.points === undefined &&
            normalized.outcome === undefined &&
            normalized.metrics.length === 0
          ) {
            modelWarningCount += 1;
            warnings.push("A finished score result should include a score, outcome or metric");
          } else if (
            permission.resultModel === "points" &&
            normalized.points === undefined &&
            !hasPrimaryPerformance
          ) {
            modelWarningCount += 1;
            warnings.push("A finished points result should include points or a primary metric");
          } else if (
            permission.resultModel === "placement" &&
            normalized.rankOverall === undefined
          ) {
            modelWarningCount += 1;
            warnings.push("A finished placement result should include an overall rank");
          }
        }
  
        const baseFingerprint = resultRowFingerprint(normalized);
        if (seenFingerprints.has(baseFingerprint)) {
          errors.push("Duplicate result row in this upload");
        } else {
          seenFingerprints.add(baseFingerprint);
          fingerprint = baseFingerprint;
        }
  
        if (normalized.externalEntryKey) {
          if (seenExternalKeys.has(normalized.externalEntryKey)) {
            errors.push(`Duplicate externalEntryKey: ${normalized.externalEntryKey}`);
          } else {
            seenExternalKeys.add(normalized.externalEntryKey);
          }
        } else {
          warnings.push(
            "No externalEntryKey supplied; corrections should reuse a durable organiser entry id",
          );
        }
  
        if (normalized.rankOverall) {
          const count = overallRanks.get(normalized.rankOverall) ?? 0;
          overallRanks.set(normalized.rankOverall, count + 1);
        }
        if (!normalized.sourceUrl && !input.sourceUrl) {
          warnings.push("No row or batch source URL was supplied");
        }
        if (!normalized.athleteId && normalized.athleteExternalId) {
          warnings.push("Athlete identifier needs matching during Athrecs review");
        }
        if (!normalized.athleteId && !normalized.teamId) {
          warnings.push("Participant is name-only and needs identity matching");
        }
      }
  
      const validationStatus = errors.length
        ? "invalid"
        : warnings.length
          ? "warning"
          : "valid";
      if (errors.length) errorCount += errors.length;
      if (warnings.length) warningCount += warnings.length;
      if (!errors.length) validRowCount += 1;
  
      await sql`
        insert into result_upload_rows (
          batch_id, row_number, raw_data, normalized_data, fingerprint,
          validation_status, errors, warnings, matched_athlete_id
        ) values (
          ${batchId}, ${index + 1}, ${JSON.stringify(raw)}::jsonb,
          ${normalized ? JSON.stringify(normalized) : null}::jsonb,
          ${fingerprint}, ${validationStatus},
          ${JSON.stringify(errors)}::jsonb, ${JSON.stringify(warnings)}::jsonb,
          ${normalized?.athleteId ?? null}
        )
      `;
    }
  
    const repeatedRanks = [...overallRanks.entries()].filter(([, count]) => count > 1);
    if (repeatedRanks.length && !permission.allowsTies) {
      warningCount += repeatedRanks.length;
    }
  
    const status: StagedUploadResult["status"] = errorCount
      ? "needs_correction"
      : "submitted";
  
    await sql`
      update result_upload_batches set
        status = ${status},
        row_count = ${input.rows.length},
        valid_row_count = ${validRowCount},
        warning_count = ${warningCount},
        error_count = ${errorCount},
        submitted_at = case when ${status} = 'submitted' then now() else submitted_at end,
        automated_checked_at = now(),
        updated_at = now()
      where id = ${batchId}
    `;
  
    const checks = [
      {
        code: "organisation_permission",
        name: "Organisation is authorised for this event",
        status: "passed",
        severity: "blocking",
        details: {
          eventId: permission.eventId,
          occurrenceId: permission.occurrenceId,
          participantKind: permission.participantKind,
          resultModel: permission.resultModel,
        },
      },
      {
        code: "organisation_verification",
        name: "Organisation verification",
        status: permission.organisationStatus === "verified" ? "passed" : "warning",
        severity: "warning",
        details: { verificationStatus: permission.organisationStatus },
      },
      {
        code: "participant_kind",
        name: "Result participants match the competition format",
        status: participantKindMismatchCount ? "failed" : "passed",
        severity: "blocking",
        details: {
          competitionParticipantKind: permission.participantKind,
          mismatchCount: participantKindMismatchCount,
        },
      },
      {
        code: "result_model_completeness",
        name: "Results include data appropriate to the competition scoring model",
        status: modelWarningCount ? "warning" : "passed",
        severity: "warning",
        details: {
          resultModel: permission.resultModel,
          warningCount: modelWarningCount,
        },
      },
      {
        code: "row_schema",
        name: "Every row matches the Athrecs result schema",
        status: errorCount ? "failed" : "passed",
        severity: "blocking",
        details: { errorCount, validRowCount, rowCount: input.rows.length },
      },
      {
        code: "source_evidence",
        name: "Official source or evidence supplied",
        status: input.sourceUrl || input.evidence.length ? "passed" : "warning",
        severity: "warning",
        details: {
          sourceUrl: input.sourceUrl ?? null,
          evidenceCount: input.evidence.length,
          declaredOfficial: input.declaredOfficial,
        },
      },
      {
        code: "rank_consistency",
        name: "Overall ranks are consistent with the competition tie setting",
        status:
          repeatedRanks.length && !permission.allowsTies ? "warning" : "passed",
        severity: "warning",
        details: {
          allowsTies: permission.allowsTies,
          repeatedRanks: repeatedRanks.map(([rank, count]) => ({ rank, count })),
        },
      },
    ];
  
    for (const check of checks) {
      await sql`
        insert into result_upload_checks (
          batch_id, check_code, check_name, status, severity, details
        ) values (
          ${batchId}, ${check.code}, ${check.name}, ${check.status},
          ${check.severity}, ${JSON.stringify(check.details)}::jsonb
        )
        on conflict (batch_id, check_code) do update set
          status = excluded.status,
          severity = excluded.severity,
          details = excluded.details,
          checked_at = now()
      `;
    }
  
    if (status === "submitted") {
      const verification = await sql<{ id: number }>`
        insert into verification_cases (
          subject_type, subject_id, status, verification_level, priority,
          automated_score, risk_flags, summary, opened_by_user_id
        ) values (
          ${"result_upload"}, ${String(batchId)}, ${"open"}, ${"athrecs_review"},
          ${input.declaredOfficial ? "high" : "normal"},
          ${errorCount === 0 ? (warningCount === 0 ? 100 : 85) : 0},
          ${JSON.stringify(
            [
              ...(permission.organisationStatus === "verified" ? [] : ["organisation_unverified"]),
              ...(input.sourceUrl || input.evidence.length ? [] : ["source_evidence_missing"]),
              ...(warningCount ? ["warnings_present"] : []),
            ],
          )}::jsonb,
          ${`Result upload ${input.originalFilename}`}, ${userId}
        ) returning id
      `;
      const evidence = [...input.evidence];
      if (
        input.sourceUrl &&
        !evidence.some((item) => item.sourceUrl === input.sourceUrl)
      ) {
        evidence.push({
          evidenceType: "official_results",
          sourceUrl: input.sourceUrl,
          description: "Source URL supplied with the result upload",
          isOfficialSource: input.declaredOfficial,
        });
      }
      await addEvidenceItems(sql, {
        subjectType: "result_upload",
        subjectId: String(batchId),
        addedByUserId: userId,
        evidence,
      });
      await sql`
        insert into audit_log (
          actor_user_id, action, entity_type, entity_id, organisation_id, after_data
        ) values (
          ${userId}, ${"result_upload.submitted"}, ${"result_upload"}, ${String(batchId)},
          ${input.organisationId},
          ${JSON.stringify({ verificationCaseId: verification[0]?.id, status, isFinalResults: input.isFinalResults })}::jsonb
        )
      `;
    }
  
    return {
      batchId,
      duplicateOfBatchId: null,
      status,
      rowCount: input.rows.length,
      validRowCount,
      warningCount,
      errorCount,
    };
  });
}
