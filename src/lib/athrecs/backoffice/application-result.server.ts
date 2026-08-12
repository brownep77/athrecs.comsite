import type { Sql } from "@/lib/db";
import {
  asArray,
  asObject,
  booleanValue,
  json,
  numberValue,
  text,
  type ApprovedItem,
  type SubmissionRecord,
} from "./application-common.server";

async function syncResultContributors(
  sql: Sql,
  resultId: string,
  result: Record<string, unknown>,
): Promise<void> {
  if (!("contributors" in result)) return;
  await sql`delete from result_contributions where result_id = ${resultId}`;
  for (const rawContributor of asArray(result.contributors)) {
    const contributor = asObject(rawContributor, "result contributor");
    const athleteId = numberValue(contributor.athleteId);
    if (!athleteId) throw new Error("Result contributor is missing athleteId");
    await sql`
      insert into result_contributions (
        result_id, athlete_id, contribution_role, participation_status, stats
      ) values (
        ${resultId}, ${athleteId}, ${text(contributor.role) ?? "participant"},
        ${text(contributor.participationStatus) ?? "participated"},
        ${json(contributor.stats ?? {})}::jsonb
      )
      on conflict (result_id, athlete_id, contribution_role) do update set
        participation_status = excluded.participation_status,
        stats = excluded.stats
    `;
  }
}

export async function applyResultItem(
  sql: Sql,
  submission: SubmissionRecord,
  item: ApprovedItem,
  reviewerUserId: string,
): Promise<string> {
  const competitionId = submission.competition_id;
  if (!competitionId) throw new Error("Results submission is missing competitionId");
  const result = asObject(item.normalized_data, "normalised result");
  const participant = asObject(result.participant, "result participant");
  const sourceRecordKey = text(result.sourceRecordKey);
  const id = item.target_id ?? `result_${item.id}`;

  if (sourceRecordKey) {
    const rows = await sql<{ id: string }>`
      insert into competition_results (
        id, competition_id, round_id, athlete_id, team_id, participant_name,
        participant_external_id, bib, lane_or_position, result_status, rank,
        tied_rank, qualification_status, result_type, time_ms, distance_value,
        distance_unit, measurement_value, measurement_unit, score, points,
        result_text, outcome, attempts, splits, stats, source_record_key,
        source_url, source_submission_id, verification_status,
        verification_confidence, verified_at, verified_by_user_id, published_at,
        updated_at
      ) values (
        ${id}, ${competitionId}, ${numberValue(result.roundId)},
        ${numberValue(participant.athleteId)}, ${numberValue(participant.teamId)},
        ${text(participant.name) ?? ""}, ${text(participant.externalId)},
        ${text(result.bib)}, ${text(result.laneOrPosition)},
        ${text(result.status) ?? "finished"}, ${numberValue(result.rank)},
        ${booleanValue(result.tiedRank) ?? false}, ${text(result.qualificationStatus)},
        ${text(result.resultType) ?? "placing"}, ${numberValue(result.timeMs)},
        ${numberValue(result.distanceValue)}, ${text(result.distanceUnit)},
        ${numberValue(result.measurementValue)}, ${text(result.measurementUnit)},
        ${numberValue(result.score)}, ${numberValue(result.points)},
        ${text(result.resultText)}, ${text(result.outcome)},
        ${json(result.attempts ?? [])}::jsonb, ${json(result.splits ?? [])}::jsonb,
        ${json(result.stats ?? {})}::jsonb, ${sourceRecordKey}, ${submission.source_url},
        ${submission.id}, 'athrecs_verified', 100, now(), ${reviewerUserId}, now(), now()
      )
      on conflict (competition_id, source_record_key)
        where source_record_key is not null
      do update set
        round_id = excluded.round_id,
        athlete_id = excluded.athlete_id,
        team_id = excluded.team_id,
        participant_name = excluded.participant_name,
        participant_external_id = excluded.participant_external_id,
        bib = excluded.bib,
        lane_or_position = excluded.lane_or_position,
        result_status = excluded.result_status,
        rank = excluded.rank,
        tied_rank = excluded.tied_rank,
        qualification_status = excluded.qualification_status,
        result_type = excluded.result_type,
        time_ms = excluded.time_ms,
        distance_value = excluded.distance_value,
        distance_unit = excluded.distance_unit,
        measurement_value = excluded.measurement_value,
        measurement_unit = excluded.measurement_unit,
        score = excluded.score,
        points = excluded.points,
        result_text = excluded.result_text,
        outcome = excluded.outcome,
        attempts = excluded.attempts,
        splits = excluded.splits,
        stats = excluded.stats,
        source_url = excluded.source_url,
        source_submission_id = excluded.source_submission_id,
        verification_status = 'athrecs_verified',
        verification_confidence = 100,
        verified_at = now(),
        verified_by_user_id = excluded.verified_by_user_id,
        published_at = coalesce(competition_results.published_at, now()),
        updated_at = now()
      returning id
    `;
    if (!rows[0]?.id) throw new Error("Result could not be saved");
    await syncResultContributors(sql, rows[0].id, result);
    return rows[0].id;
  }

  await sql`
    insert into competition_results (
      id, competition_id, round_id, athlete_id, team_id, participant_name,
      participant_external_id, bib, lane_or_position, result_status, rank,
      tied_rank, qualification_status, result_type, time_ms, distance_value,
      distance_unit, measurement_value, measurement_unit, score, points,
      result_text, outcome, attempts, splits, stats, source_url,
      source_submission_id, verification_status, verification_confidence,
      verified_at, verified_by_user_id, published_at, updated_at
    ) values (
      ${id}, ${competitionId}, ${numberValue(result.roundId)},
      ${numberValue(participant.athleteId)}, ${numberValue(participant.teamId)},
      ${text(participant.name) ?? ""}, ${text(participant.externalId)},
      ${text(result.bib)}, ${text(result.laneOrPosition)},
      ${text(result.status) ?? "finished"}, ${numberValue(result.rank)},
      ${booleanValue(result.tiedRank) ?? false}, ${text(result.qualificationStatus)},
      ${text(result.resultType) ?? "placing"}, ${numberValue(result.timeMs)},
      ${numberValue(result.distanceValue)}, ${text(result.distanceUnit)},
      ${numberValue(result.measurementValue)}, ${text(result.measurementUnit)},
      ${numberValue(result.score)}, ${numberValue(result.points)},
      ${text(result.resultText)}, ${text(result.outcome)},
      ${json(result.attempts ?? [])}::jsonb, ${json(result.splits ?? [])}::jsonb,
      ${json(result.stats ?? {})}::jsonb, ${submission.source_url}, ${submission.id},
      'athrecs_verified', 100, now(), ${reviewerUserId}, now(), now()
    )
    on conflict (id) do update set
      round_id = excluded.round_id,
      athlete_id = excluded.athlete_id,
      team_id = excluded.team_id,
      participant_name = excluded.participant_name,
      participant_external_id = excluded.participant_external_id,
      bib = excluded.bib,
      lane_or_position = excluded.lane_or_position,
      result_status = excluded.result_status,
      rank = excluded.rank,
      tied_rank = excluded.tied_rank,
      qualification_status = excluded.qualification_status,
      result_type = excluded.result_type,
      time_ms = excluded.time_ms,
      distance_value = excluded.distance_value,
      distance_unit = excluded.distance_unit,
      measurement_value = excluded.measurement_value,
      measurement_unit = excluded.measurement_unit,
      score = excluded.score,
      points = excluded.points,
      result_text = excluded.result_text,
      outcome = excluded.outcome,
      attempts = excluded.attempts,
      splits = excluded.splits,
      stats = excluded.stats,
      source_url = excluded.source_url,
      source_submission_id = excluded.source_submission_id,
      verification_status = 'athrecs_verified',
      verification_confidence = 100,
      verified_at = now(),
      verified_by_user_id = excluded.verified_by_user_id,
      published_at = coalesce(competition_results.published_at, now()),
      updated_at = now()
  `;
  await syncResultContributors(sql, id, result);
  return id;
}
