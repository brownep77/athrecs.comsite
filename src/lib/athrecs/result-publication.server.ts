import type { Sql } from "@/lib/db";
import {
  resultUploadRowSchema,
  type ResultUploadRowInput,
} from "./multisport.types";
import { withSqlTransaction } from "./transaction.server";
import { writeAudit } from "./workflow.server";

function valueOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function entryStatusForResult(status: ResultUploadRowInput["resultStatus"]): string {
  switch (status) {
    case "dns":
      return "dns";
    case "dnf":
      return "dnf";
    case "disqualified":
      return "disqualified";
    case "withdrawn":
    case "cancelled":
      return "withdrawn";
    case "started":
    case "provisional":
    case "no_result":
      return "started";
    case "entered":
      return "entered";
    case "finished":
    default:
      return "finished";
  }
}

function externalEntryKeyForBatchRow(
  organisationId: number,
  batchId: number,
  rowNumber: number,
  row: ResultUploadRowInput,
): string {
  const supplied = valueOrNull(row.externalEntryKey);
  if (supplied) return `organisation:${organisationId}:external:${supplied}`;
  if (row.athleteId !== undefined) {
    return `organisation:${organisationId}:athlete-id:${row.athleteId}`;
  }
  const athleteExternalId = valueOrNull(row.athleteExternalId);
  if (athleteExternalId) {
    return `organisation:${organisationId}:athlete-external:${athleteExternalId}`;
  }
  if (row.teamId !== undefined) {
    return `organisation:${organisationId}:team-id:${row.teamId}`;
  }
  const bib = valueOrNull(row.bib);
  if (bib) return `organisation:${organisationId}:bib:${bib}`;
  return `batch:${batchId}:row:${rowNumber}`;
}

function objectFromJson(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Caller receives the validation error below.
    }
  }
  throw new Error("A staged result row has no valid normalized JSON object");
}

async function resolveAthleteId(
  sql: Sql,
  row: ResultUploadRowInput,
): Promise<number | null> {
  if (row.athleteId !== undefined) {
    const athletes = await sql<{ id: number }>`
      select id from athletes where id = ${row.athleteId} limit 1
    `;
    if (!athletes[0]) throw new Error(`Athlete ${row.athleteId} does not exist`);
    return athletes[0].id;
  }
  if (!row.athleteExternalId) return null;

  const matches = await sql<{ id: number }>`
    select distinct id from (
      select a.id
      from athletes a
      where a.athrecs_id = ${row.athleteExternalId}
         or a.source_id::text = ${row.athleteExternalId}
      union
      select ai.athlete_id as id
      from athlete_identifiers ai
      where ai.identifier_value = ${row.athleteExternalId}
        and ai.status in ('pending', 'verified')
    ) matched
    limit 2
  `;
  return matches.length === 1 ? matches[0].id : null;
}

async function verifiedIdOrNull(
  sql: Sql,
  table: "teams" | "clubs",
  id: number | undefined,
): Promise<number | null> {
  if (id === undefined) return null;
  const rows =
    table === "teams"
      ? await sql<{ id: number }>`select id from teams where id = ${id} limit 1`
      : await sql<{ id: number }>`select id from clubs where id = ${id} limit 1`;
  if (!rows[0]) throw new Error(`${table.slice(0, -1)} ${id} does not exist`);
  return rows[0].id;
}

export type PublishResultInput = {
  competitionId: number;
  externalEntryKey: string;
  row: unknown;
  sourceType:
    | "athlete"
    | "organiser"
    | "timing_partner"
    | "governing_body"
    | "athrecs"
    | "public_source"
    | "import";
  sourceUrl?: string | null;
  uploadBatchId?: number | null;
  verifiedByUserId: string;
  provenanceReference?: string;
};

/**
 * Publish one already-reviewed generic result. The caller must provide a stable
 * externalEntryKey; that makes retries idempotent and prevents duplicate public
 * records when a serverless request is replayed.
 */
export async function publishVerifiedResult(
  sql: Sql,
  input: PublishResultInput,
): Promise<{ entryId: number; resultId: number; athleteId: number | null }> {
  const row = resultUploadRowSchema.parse(objectFromJson(input.row));
  const competitionRows = await sql<{
    id: number;
    occurrence_id: number;
    participant_kind: string;
  }>`
    select id, occurrence_id, participant_kind
    from event_competitions where id = ${input.competitionId} limit 1
  `;
  if (!competitionRows[0]) throw new Error("Competition not found");

  const athleteId = await resolveAthleteId(sql, row);
  const teamId = await verifiedIdOrNull(sql, "teams", row.teamId);
  const clubId = await verifiedIdOrNull(sql, "clubs", row.clubId);
  const displayName =
    valueOrNull(row.displayName) ??
    valueOrNull(row.teamName) ??
    (row.memberNames.length ? row.memberNames.join(" / ") : null);
  if (!athleteId && !teamId && !displayName) {
    throw new Error("The reviewed result has no publishable participant identity");
  }

  const entryRows = await sql<{ id: number }>`
    insert into competition_entries (
      competition_id, external_entry_key, participant_kind, athlete_id,
      team_id, display_name, bib, lane, category_code, category_name,
      country_code, club_id, entry_status, source_type, source_url,
      custom_data, verification_status, updated_at
    ) values (
      ${input.competitionId}, ${input.externalEntryKey}, ${row.participantKind},
      ${athleteId}, ${teamId}, ${displayName}, ${valueOrNull(row.bib)},
      ${valueOrNull(row.lane)}, ${valueOrNull(row.categoryCode)},
      ${valueOrNull(row.categoryName)},
      ${valueOrNull(row.countryCode)?.toUpperCase() ?? null}, ${clubId},
      ${entryStatusForResult(row.resultStatus)}, ${input.sourceType},
      ${valueOrNull(row.sourceUrl) ?? input.sourceUrl ?? null},
      ${JSON.stringify({
        ...row.customData,
        athleteExternalId: row.athleteExternalId ?? null,
        clubName: row.clubName ?? null,
        sourceParticipantName: row.displayName ?? row.teamName ?? null,
      })}::jsonb,
      ${"verified"}, now()
    )
    on conflict (competition_id, external_entry_key)
      where external_entry_key is not null
    do update set
      participant_kind = excluded.participant_kind,
      athlete_id = coalesce(excluded.athlete_id, competition_entries.athlete_id),
      team_id = coalesce(excluded.team_id, competition_entries.team_id),
      display_name = excluded.display_name,
      bib = excluded.bib,
      lane = excluded.lane,
      category_code = excluded.category_code,
      category_name = excluded.category_name,
      country_code = excluded.country_code,
      club_id = excluded.club_id,
      entry_status = excluded.entry_status,
      source_type = excluded.source_type,
      source_url = excluded.source_url,
      custom_data = competition_entries.custom_data || excluded.custom_data,
      verification_status = 'verified',
      updated_at = now()
    returning id
  `;
  if (!entryRows[0]) throw new Error("Could not publish the competition entry");
  const entryId = entryRows[0].id;

  // Team, pair, relay and crew members are replaceable source data for this entry.
  await sql`delete from competition_entry_members where entry_id = ${entryId}`;
  for (let index = 0; index < row.memberNames.length; index += 1) {
    const memberName = row.memberNames[index];
    await sql`
      insert into competition_entry_members (
        entry_id, external_member_key, display_name, sequence_no
      ) values (
        ${entryId}, ${`${input.externalEntryKey}:member:${index + 1}`},
        ${memberName}, ${index + 1}
      )
    `;
  }

  const existingResults = await sql<{ id: number; upload_batch_id: number | null }>`
    select id, upload_batch_id
    from competition_results
    where competition_id = ${input.competitionId}
      and entry_id = ${entryId}
      and round_id is null
      and record_status = 'active'
    limit 1
    for update
  `;
  const existing = existingResults[0];
  const canUpdateInPlace =
    existing !== undefined &&
    (input.uploadBatchId == null
      ? existing.upload_batch_id == null
      : existing.upload_batch_id === input.uploadBatchId);

  let resultId: number;
  if (canUpdateInPlace && existing) {
    resultId = existing.id;
    await sql`
      update competition_results set
        result_status = ${row.resultStatus},
        rank_overall = ${row.rankOverall ?? null},
        rank_category = ${row.rankCategory ?? null},
        rank_gender = ${row.rankGender ?? null},
        performance_value = ${row.performanceValue ?? null},
        performance_unit = ${valueOrNull(row.performanceUnit)},
        performance_display = ${valueOrNull(row.performanceDisplay)},
        points = ${row.points ?? null},
        score_for = ${row.scoreFor ?? null},
        score_against = ${row.scoreAgainst ?? null},
        outcome = ${row.outcome ?? null},
        source_type = ${input.sourceType},
        source_url = ${valueOrNull(row.sourceUrl) ?? input.sourceUrl ?? null},
        upload_batch_id = ${input.uploadBatchId ?? null},
        record_status = 'active',
        superseded_by_result_id = null,
        verification_status = 'verified',
        verified_at = now(),
        verified_by_user_id = ${input.verifiedByUserId},
        published_at = coalesce(published_at, now()),
        custom_data = ${JSON.stringify(row.customData)}::jsonb,
        updated_at = now()
      where id = ${resultId}
    `;
  } else {
    if (existing) {
      await sql`
        update competition_results set
          record_status = 'superseded',
          updated_at = now()
        where id = ${existing.id}
      `;
    }
    const inserted = await sql<{ id: number }>`
      insert into competition_results (
        competition_id, entry_id, result_status, rank_overall,
        rank_category, rank_gender, performance_value, performance_unit,
        performance_display, points, score_for, score_against, outcome,
        source_type, source_url, upload_batch_id, record_status,
        verification_status, verified_at, verified_by_user_id, published_at,
        custom_data
      ) values (
        ${input.competitionId}, ${entryId}, ${row.resultStatus},
        ${row.rankOverall ?? null}, ${row.rankCategory ?? null},
        ${row.rankGender ?? null}, ${row.performanceValue ?? null},
        ${valueOrNull(row.performanceUnit)}, ${valueOrNull(row.performanceDisplay)},
        ${row.points ?? null}, ${row.scoreFor ?? null}, ${row.scoreAgainst ?? null},
        ${row.outcome ?? null}, ${input.sourceType},
        ${valueOrNull(row.sourceUrl) ?? input.sourceUrl ?? null},
        ${input.uploadBatchId ?? null}, ${"active"}, ${"verified"}, now(),
        ${input.verifiedByUserId}, now(), ${JSON.stringify(row.customData)}::jsonb
      )
      returning id
    `;
    if (!inserted[0]) throw new Error("Could not publish the competition result");
    resultId = inserted[0].id;
    if (existing) {
      await sql`
        update competition_results set
          superseded_by_result_id = ${resultId},
          updated_at = now()
        where id = ${existing.id}
      `;
    }
  }

  await sql`delete from result_metrics where result_id = ${resultId}`;
  for (const metric of row.metrics) {
    await sql`
      insert into result_metrics (
        result_id, metric_code, metric_name, value_numeric, value_text, unit,
        sequence_no, is_primary, rank_for_metric, custom_data
      ) values (
        ${resultId}, ${metric.code}, ${valueOrNull(metric.name)},
        ${metric.valueNumeric ?? null}, ${valueOrNull(metric.valueText)},
        ${valueOrNull(metric.unit)}, ${metric.sequenceNo}, ${metric.isPrimary},
        ${metric.rank ?? null}, ${JSON.stringify(metric.customData)}::jsonb
      )
    `;
  }

  await sql`delete from result_segments where result_id = ${resultId}`;
  for (const segment of row.segments) {
    await sql`
      insert into result_segments (
        result_id, segment_type, segment_code, segment_name, sequence_no,
        value_numeric, value_text, unit, rank_for_segment, status, custom_data
      ) values (
        ${resultId}, ${segment.type}, ${segment.code},
        ${valueOrNull(segment.name)}, ${segment.sequenceNo},
        ${segment.valueNumeric ?? null}, ${valueOrNull(segment.valueText)},
        ${valueOrNull(segment.unit)}, ${segment.rank ?? null},
        ${valueOrNull(segment.status)}, ${JSON.stringify(segment.customData)}::jsonb
      )
    `;
  }

  await sql`
    insert into data_provenance (
      entity_type, entity_id, source_type, source_url, source_reference,
      import_batch_id, submitted_by_user_id, collected_at, verified_at,
      confidence, permitted_uses, metadata
    ) values (
      ${"competition_result"}, ${String(resultId)}, ${input.sourceType},
      ${valueOrNull(row.sourceUrl) ?? input.sourceUrl ?? null},
      ${input.provenanceReference ?? input.externalEntryKey},
      ${input.uploadBatchId ?? null}, ${input.verifiedByUserId}, now(), now(),
      ${"authoritative"}, ${JSON.stringify(["public_display", "statistics", "rankings"])}::jsonb,
      ${JSON.stringify({
        externalEntryKey: input.externalEntryKey,
        supersedesResultId:
          existing && existing.id !== resultId ? existing.id : null,
      })}::jsonb
    )
  `;

  return { entryId, resultId, athleteId };
}

export async function publishVerifiedBatch(
  reviewerUserId: string,
  batchId: number,
  decisionNote?: string,
): Promise<{ batchId: number; publishedResults: number; occurrenceId: number }> {
  return withSqlTransaction(async (sql) => {
    const batches = await sql<{
      id: number;
      organisation_id: number;
      competition_id: number;
      status: string;
      error_count: number;
      source_url: string | null;
      is_final_results: boolean;
      original_filename: string;
      occurrence_id: number;
    }>`
      select b.*, c.occurrence_id
      from result_upload_batches b
      join event_competitions c on c.id = b.competition_id
      where b.id = ${batchId}
      for update
    `;
    const batch = batches[0];
    if (!batch) throw new Error("Result upload batch not found");
    if (batch.status === "published") {
      const counts = await sql<{ count: number }>`
        select count(*)::int as count
        from competition_results where upload_batch_id = ${batchId}
      `;
      return {
        batchId,
        publishedResults: counts[0]?.count ?? 0,
        occurrenceId: batch.occurrence_id,
      };
    }
    if (!["submitted", "under_review", "verified"].includes(batch.status)) {
      throw new Error(`Batch ${batchId} cannot be published from status ${batch.status}`);
    }
    if (batch.error_count > 0) {
      throw new Error("The batch still contains blocking validation errors");
    }
    const failedChecks = await sql<{ count: number }>`
      select count(*)::int as count
      from result_upload_checks
      where batch_id = ${batchId}
        and status = 'failed'
        and severity = 'blocking'
    `;
    if ((failedChecks[0]?.count ?? 0) > 0) {
      throw new Error("A blocking automated verification check failed");
    }

    const rows = await sql<{
      id: number;
      row_number: number;
      normalized_data: unknown;
      validation_status: string;
    }>`
      select id, row_number, normalized_data, validation_status
      from result_upload_rows
      where batch_id = ${batchId}
        and validation_status in ('valid', 'warning', 'published')
      order by row_number
      for update
    `;
    if (!rows.length) throw new Error("The batch contains no publishable rows");

    await sql`
      update result_upload_batches
      set status = 'publishing', verified_at = now(),
          verified_by_user_id = ${reviewerUserId}, updated_at = now()
      where id = ${batchId}
    `;

    let publishedResults = 0;
    for (const stagedRow of rows) {
      if (stagedRow.validation_status === "published") {
        publishedResults += 1;
        continue;
      }
      const normalizedRow = resultUploadRowSchema.parse(
        objectFromJson(stagedRow.normalized_data),
      );
      const published = await publishVerifiedResult(sql, {
        competitionId: batch.competition_id,
        externalEntryKey: externalEntryKeyForBatchRow(
          batch.organisation_id,
          batchId,
          stagedRow.row_number,
          normalizedRow,
        ),
        row: normalizedRow,
        sourceType: "organiser",
        sourceUrl: batch.source_url,
        uploadBatchId: batchId,
        verifiedByUserId: reviewerUserId,
        provenanceReference: `${batch.original_filename} row ${stagedRow.row_number}`,
      });
      await sql`
        update result_upload_rows
        set validation_status = 'published',
            matched_entry_id = ${published.entryId},
            matched_athlete_id = ${published.athleteId},
            published_result_id = ${published.resultId},
            updated_at = now()
        where id = ${stagedRow.id}
      `;
      publishedResults += 1;
    }

    await sql`
      update result_upload_batches
      set status = 'published', published_at = now(), rejection_reason = null,
          updated_at = now()
      where id = ${batchId}
    `;
    await sql`
      update event_competitions
      set status = case when ${batch.is_final_results} then 'completed' else status end,
          verification_status = 'verified', verified_at = now(),
          verified_by_user_id = ${reviewerUserId}, updated_at = now()
      where id = ${batch.competition_id}
    `;
    await sql`
      update event_occurrences
      set results_status = case
            when not exists (
              select 1 from event_competitions sibling
              where sibling.occurrence_id = ${batch.occurrence_id}
                and sibling.status not in ('completed', 'cancelled')
            ) then 'complete'
            else 'partial'
          end,
          updated_at = now()
      where id = ${batch.occurrence_id}
    `;
    await sql`
      update verification_cases
      set status = 'closed', decision = 'approve',
          decision_note = coalesce(
            ${valueOrNull(decisionNote)},
            decision_note,
            'Result upload verified and published'
          ),
          reviewed_at = coalesce(reviewed_at, now()), closed_at = now(),
          updated_at = now()
      where subject_type = 'result_upload' and subject_id = ${String(batchId)}
        and status not in ('closed', 'cancelled')
    `;
    await writeAudit(sql, {
      actorUserId: reviewerUserId,
      action: "result_upload.published",
      entityType: "result_upload",
      entityId: batchId,
      organisationId: batch.organisation_id,
      afterData: { publishedResults, competitionId: batch.competition_id },
    });

    return { batchId, publishedResults, occurrenceId: batch.occurrence_id };
  });
}
