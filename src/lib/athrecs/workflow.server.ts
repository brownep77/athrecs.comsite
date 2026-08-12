import type { Sql } from "@/lib/db";

export type EvidenceInput = {
  evidenceType: string;
  sourceUrl?: string;
  description?: string;
  isOfficialSource?: boolean;
};

export async function createVerificationCase(
  sql: Sql,
  input: {
    subjectType: string;
    subjectId: string;
    openedByUserId: string;
    summary: string;
    priority?: "low" | "normal" | "high" | "urgent";
    verificationLevel?: string;
    automatedScore?: number | null;
    riskFlags?: unknown[];
  },
): Promise<number> {
  const rows = await sql<{ id: number }>`
    insert into verification_cases (
      subject_type, subject_id, status, verification_level, priority,
      automated_score, risk_flags, summary, opened_by_user_id
    ) values (
      ${input.subjectType}, ${input.subjectId}, ${"open"},
      ${input.verificationLevel ?? "athrecs_review"},
      ${input.priority ?? "normal"}, ${input.automatedScore ?? null},
      ${JSON.stringify(input.riskFlags ?? [])}::jsonb,
      ${input.summary}, ${input.openedByUserId}
    )
    returning id
  `;
  if (!rows[0]) throw new Error("Could not create a verification case");
  return rows[0].id;
}

export async function createDataSubmission(
  sql: Sql,
  input: {
    submissionType: string;
    targetType: string;
    targetId?: string | null;
    organisationId?: number | null;
    athleteId?: number | null;
    submittedByUserId: string;
    payload: unknown;
    currentSnapshot?: unknown;
    sourceUrl?: string | null;
    status?: string;
  },
): Promise<number> {
  const status = input.status ?? "submitted";
  const rows = await sql<{ id: number }>`
    insert into data_submissions (
      submission_type, target_type, target_id, organisation_id, athlete_id,
      submitted_by_user_id, payload, current_snapshot, source_url, status,
      submitted_at
    ) values (
      ${input.submissionType}, ${input.targetType}, ${input.targetId ?? null},
      ${input.organisationId ?? null}, ${input.athleteId ?? null},
      ${input.submittedByUserId}, ${JSON.stringify(input.payload)}::jsonb,
      ${input.currentSnapshot === undefined
        ? null
        : JSON.stringify(input.currentSnapshot)}::jsonb,
      ${input.sourceUrl || null}, ${status},
      ${status === "submitted" ? new Date().toISOString() : null}::timestamptz
    )
    returning id
  `;
  if (!rows[0]) throw new Error("Could not create a data submission");
  return rows[0].id;
}

export async function attachCaseToSubmission(
  sql: Sql,
  submissionId: number,
  verificationCaseId: number,
): Promise<void> {
  await sql`
    update data_submissions
    set verification_case_id = ${verificationCaseId}, updated_at = now()
    where id = ${submissionId}
  `;
}

export async function addEvidenceItems(
  sql: Sql,
  input: {
    subjectType: string;
    subjectId: string;
    addedByUserId: string;
    evidence: EvidenceInput[];
  },
): Promise<void> {
  for (const item of input.evidence) {
    await sql`
      insert into evidence_items (
        subject_type, subject_id, evidence_type, source_url, description,
        is_official_source, added_by_user_id
      ) values (
        ${input.subjectType}, ${input.subjectId}, ${item.evidenceType},
        ${item.sourceUrl || null}, ${item.description ?? null},
        ${Boolean(item.isOfficialSource)}, ${input.addedByUserId}
      )
    `;
  }
}

export async function writeAudit(
  sql: Sql,
  input: {
    actorUserId?: string | null;
    actorType?: "user" | "system" | "import" | "api";
    action: string;
    entityType: string;
    entityId?: string | number | null;
    organisationId?: number | null;
    beforeData?: unknown;
    afterData?: unknown;
  },
): Promise<void> {
  await sql`
    insert into audit_log (
      actor_user_id, actor_type, action, entity_type, entity_id,
      organisation_id, before_data, after_data
    ) values (
      ${input.actorUserId ?? null}, ${input.actorType ?? "user"},
      ${input.action}, ${input.entityType},
      ${input.entityId === undefined || input.entityId === null
        ? null
        : String(input.entityId)},
      ${input.organisationId ?? null},
      ${input.beforeData === undefined ? null : JSON.stringify(input.beforeData)}::jsonb,
      ${input.afterData === undefined ? null : JSON.stringify(input.afterData)}::jsonb
    )
  `;
}
