import { DEV_USER_ID } from "@/lib/auth/verify.server";
import { dbSource, getSql, type Sql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../seed.server";
import type { EventCreateSubmission } from "./schemas";
import { slugify, type AutomatedCheckDraft, type SubmissionItemDraft } from "./verification";

export async function ready(): Promise<Sql> {
  await ensureAthrecsSeeded();
  return getSql();
}

export function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function previewSuperuser(userId: string): boolean {
  return dbSource === "pglite" && userId === DEV_USER_ID;
}

export function averageCheckScore(checks: readonly AutomatedCheckDraft[]): number {
  const scores = checks
    .map((check) => check.score)
    .filter((score): score is number => typeof score === "number" && Number.isFinite(score));
  if (!scores.length) return 100;
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100;
}

export function automatedVerificationStatus(
  checks: readonly AutomatedCheckDraft[],
  rejectedCount = 0,
): "automated_pass" | "automated_warning" | "automated_fail" {
  if (rejectedCount > 0 || checks.some((check) => check.status === "fail")) {
    return "automated_fail";
  }
  if (checks.some((check) => check.status === "warning")) {
    return "automated_warning";
  }
  return "automated_pass";
}

export function checkWarningCount(checks: readonly AutomatedCheckDraft[]): number {
  return checks.filter((check) => check.status === "warning").length;
}

export type SubmissionInsert = {
  id: string;
  submissionType: string;
  entityType: string;
  entityId?: string | null;
  userId: string;
  organisationId?: number | null;
  athleteId?: number | null;
  eventId?: number | null;
  editionId?: number | null;
  competitionId?: number | null;
  sourceType?: string;
  sourceUrl?: string | null;
  originalFilename?: string | null;
  contentType?: string | null;
  contentHash?: string | null;
  status?: string;
  verificationStatus: string;
  riskLevel?: string;
  rowCount: number;
  acceptedCount: number;
  warningCount: number;
  rejectedCount: number;
  automatedScore: number;
  summary: Record<string, unknown>;
};

export async function insertSubmission(sql: Sql, input: SubmissionInsert): Promise<void> {
  await sql`
    insert into data_submissions (
      id, submission_type, entity_type, entity_id, submitted_by_user_id,
      organisation_id, athlete_id, event_id, edition_id, competition_id,
      source_type, source_url, original_filename, content_type, content_hash,
      status, verification_status, risk_level, row_count, accepted_count,
      warning_count, rejected_count, automated_score, summary, submitted_at
    ) values (
      ${input.id}, ${input.submissionType}, ${input.entityType}, ${input.entityId ?? null},
      ${input.userId}, ${input.organisationId ?? null}, ${input.athleteId ?? null},
      ${input.eventId ?? null}, ${input.editionId ?? null}, ${input.competitionId ?? null},
      ${input.sourceType ?? "user_submission"}, ${input.sourceUrl ?? null},
      ${input.originalFilename ?? null}, ${input.contentType ?? null},
      ${input.contentHash ?? null}, ${input.status ?? "submitted"},
      ${input.verificationStatus}, ${input.riskLevel ?? "standard"}, ${input.rowCount},
      ${input.acceptedCount}, ${input.warningCount}, ${input.rejectedCount},
      ${input.automatedScore}, ${json(input.summary)}::jsonb, now()
    )
  `;
}

function addValue(values: unknown[], value: unknown, cast = ""): string {
  values.push(value);
  return `$${values.length}${cast}`;
}

export async function insertSubmissionItems(
  sql: Sql,
  submissionId: string,
  items: readonly SubmissionItemDraft[],
): Promise<void> {
  const chunkSize = 150;
  for (let offset = 0; offset < items.length; offset += chunkSize) {
    const chunk = items.slice(offset, offset + chunkSize);
    const values: unknown[] = [];
    const rows = chunk.map((item) => {
      const columns = [
        addValue(values, item.id),
        addValue(values, submissionId),
        addValue(values, item.rowNumber),
        addValue(values, item.entityType),
        addValue(values, item.entityKey),
        addValue(values, item.proposedAction),
        addValue(values, item.targetTable),
        addValue(values, item.targetId),
        addValue(values, json(item.rawData), "::jsonb"),
        addValue(values, item.currentData == null ? null : json(item.currentData), "::jsonb"),
        addValue(
          values,
          item.normalizedData == null ? null : json(item.normalizedData),
          "::jsonb",
        ),
        addValue(values, item.status),
        addValue(values, json(item.errors), "::jsonb"),
        addValue(values, json(item.warnings), "::jsonb"),
      ];
      return `(${columns.join(", ")})`;
    });
    await sql.query(
      `insert into submission_items (
        id, submission_id, row_number, entity_type, entity_key,
        proposed_action, target_table, target_id, raw_data, current_data,
        normalized_data, status, errors, warnings
      ) values ${rows.join(", ")}`,
      values,
    );
  }
}

export async function insertVerificationChecks(
  sql: Sql,
  submissionId: string,
  checks: readonly AutomatedCheckDraft[],
): Promise<void> {
  const chunkSize = 200;
  for (let offset = 0; offset < checks.length; offset += chunkSize) {
    const chunk = checks.slice(offset, offset + chunkSize);
    const values: unknown[] = [];
    const rows = chunk.map((check) => {
      const columns = [
        addValue(values, check.id),
        addValue(values, submissionId),
        addValue(values, check.itemId ?? null),
        addValue(values, check.checkType),
        addValue(values, check.status),
        addValue(values, check.severity),
        addValue(values, check.score ?? null),
        addValue(values, check.message),
        addValue(values, json(check.evidence ?? {}), "::jsonb"),
        addValue(values, true),
      ];
      return `(${columns.join(", ")})`;
    });
    await sql.query(
      `insert into verification_checks (
        id, submission_id, submission_item_id, check_type, status,
        severity, score, message, evidence, automated
      ) values ${rows.join(", ")}`,
      values,
    );
  }
}

export async function markSubmissionFailed(
  sql: Sql,
  submissionId: string,
  error: unknown,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  await sql`
    update data_submissions
    set status = 'failed',
        verification_status = 'failed',
        summary = summary || ${json({ failure: message })}::jsonb,
        updated_at = now()
    where id = ${submissionId}
  `;
}

export async function insertAudit(
  sql: Sql,
  input: {
    actorUserId: string;
    organisationId?: number | null;
    action: string;
    entityType: string;
    entityId: string;
    submissionId?: string | null;
    beforeData?: unknown;
    afterData?: unknown;
    reason?: string;
  },
): Promise<void> {
  await sql`
    insert into data_audit_log (
      actor_user_id, organisation_id, action, entity_type, entity_id,
      submission_id, before_data, after_data, reason
    ) values (
      ${input.actorUserId}, ${input.organisationId ?? null}, ${input.action},
      ${input.entityType}, ${input.entityId}, ${input.submissionId ?? null},
      ${input.beforeData == null ? null : json(input.beforeData)}::jsonb,
      ${input.afterData == null ? null : json(input.afterData)}::jsonb,
      ${input.reason ?? null}
    )
  `;
}

export function normaliseSportSlug(value: string): string {
  return slugify(value);
}

export function normaliseEventSubmission(input: EventCreateSubmission): Record<string, unknown> {
  const event = input.event;
  return {
    ...event,
    slug: event.slug ?? slugify(event.name),
    primarySportSlug: normaliseSportSlug(event.primarySportSlug),
    sportSlugs: [
      ...new Set(
        [event.primarySportSlug, ...event.sportSlugs]
          .map(normaliseSportSlug)
          .filter(Boolean),
      ),
    ],
    editions: event.editions.map((edition) => ({
      ...edition,
      competitions: edition.competitions.map((competition) => ({
        ...competition,
        slug: competition.slug ?? slugify(competition.name),
        sportSlug: normaliseSportSlug(competition.sportSlug),
        disciplineSlug: competition.disciplineSlug
          ? normaliseSportSlug(competition.disciplineSlug)
          : undefined,
      })),
    })),
  };
}

export async function knownSportSlugs(sql: Sql): Promise<Set<string>> {
  const sports = await sql<{ slug: string }>`select slug from sports where active = true`;
  const aliases = await sql<{ alias: string }>`select alias from sport_aliases`;
  return new Set(
    [...sports.map((row) => row.slug), ...aliases.map((row) => row.alias)].map((value) =>
      normaliseSportSlug(value),
    ),
  );
}

export async function knownDisciplineKeys(sql: Sql): Promise<Set<string>> {
  const rows = await sql<{
    sport_slug: string;
    discipline_slug: string;
    sport_alias: string | null;
  }>`
    select s.slug as sport_slug, d.slug as discipline_slug, sa.alias as sport_alias
    from disciplines d
    join sports s on s.id = d.sport_id
    left join sport_aliases sa on sa.sport_id = s.id
    where s.active = true and d.active = true
  `;
  const keys = new Set<string>();
  for (const row of rows) {
    const discipline = normaliseSportSlug(row.discipline_slug);
    keys.add(`${normaliseSportSlug(row.sport_slug)}:${discipline}`);
    if (row.sport_alias) {
      keys.add(`${normaliseSportSlug(row.sport_alias)}:${discipline}`);
    }
  }
  return keys;
}

export async function existingIds(
  sql: Sql,
  table: "athletes" | "teams",
  ids: readonly number[],
): Promise<Set<number>> {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Set();
  const params = unique.map((_, index) => `$${index + 1}`).join(", ");
  const rows = await sql.query<{ id: number }>(
    `select id from ${table} where id in (${params})`,
    unique,
  );
  return new Set(rows.map((row) => row.id));
}

export async function existingRoundIds(
  sql: Sql,
  competitionId: number,
  ids: readonly number[],
): Promise<Set<number>> {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Set();
  const values: unknown[] = [competitionId, ...unique];
  const params = unique.map((_, index) => `$${index + 2}`).join(", ");
  const rows = await sql.query<{ id: number }>(
    `select id from competition_rounds where competition_id = $1 and id in (${params})`,
    values,
  );
  return new Set(rows.map((row) => row.id));
}
