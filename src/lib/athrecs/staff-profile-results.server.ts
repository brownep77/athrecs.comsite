import type { Sql } from "../db";
import { combineProfileResults, type ProfileResult } from "./profile-records";
import { sourceHistorySchema, type SourceHistory } from "./source-performance-history";
import { readResultDetails } from "./result-details";
import { buildProfileTimeline } from "./profile-timeline";

export type StaffResultGroup = {
  results: ProfileResult[];
  sourceHistories: SourceHistory[];
  resultCount: number;
};

/** Read only the selected profiles, using the same deduplication as their timeline. */
export async function loadStaffResultGroups(
  sql: Sql,
  groups: readonly { key: string; sourceIds: number[] }[],
): Promise<Map<string, StaffResultGroup>> {
  const bySource = new Map<number, string>();
  const output = new Map<string, StaffResultGroup>();
  for (const group of groups) {
    output.set(group.key, { results: [], sourceHistories: [], resultCount: 0 });
    for (const sourceId of group.sourceIds) bySource.set(sourceId, group.key);
  }
  const sourceIds = [...bySource.keys()];
  if (!sourceIds.length) return output;
  const results = await sql<ProfileResult & { athleteId: number }>`
      select r.athlete_id as "athleteId", r.id as "resultId", r.edition_id as "editionId",
        e.name as "eventName", e.slug as "eventSlug", e.sport, e.surface, e.country, e.city,
        ed.event_date::text as "eventDate", ed.distance_code as "distanceCode",
        ed.distance_km as "distanceKm", r.status,
        r.finish_time_seconds as "finishTimeSeconds", r.chip_time_seconds as "chipTimeSeconds",
        r.gun_time_seconds as "gunTimeSeconds", r.overall_place as "overallPlace", r.category,
        r.gender_place as "genderPlace", r.category_place as "categoryPlace",
        (select gender from athletes where id=r.athlete_id) as "resultGender",
        r.result_source as "resultSource", r.result_details as details,
        array(select distinct url from (
          select r.source_url as url union all
          select ref.source_url from result_source_references ref where ref.result_id=r.id
        ) sources where url like 'https://%') as "sourceUrls"
      from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
      where r.athlete_id=any(${sourceIds}::int[])
      order by ed.event_date desc,r.id desc
    `;
  const histories = await sql`
      select athlete_id as "athleteId", provider, external_id as "externalId", source_url as "sourceUrl",
        captured_at::text as "capturedAt", complete,
        years_expected as "yearsExpected", years_captured as "yearsCaptured", performances
      from athlete_source_histories
      where athlete_id=any(${sourceIds}::int[])
      order by provider, external_id
    `;
  for (const { athleteId, ...result } of results) {
    const group = output.get(bySource.get(athleteId)!);
    if (group) group.results.push({ ...result, details: readResultDetails(result.details) });
  }
  for (const history of histories) {
    const group = output.get(bySource.get(Number(history.athleteId))!);
    if (group) group.sourceHistories.push(sourceHistorySchema.parse(history));
  }
  for (const group of output.values()) {
    group.results = combineProfileResults(group.results);
    group.resultCount = buildProfileTimeline(group.results, group.sourceHistories).count;
  }
  return output;
}
