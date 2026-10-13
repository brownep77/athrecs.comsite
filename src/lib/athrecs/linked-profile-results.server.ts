import type { Sql } from "../db";
import { readResultDetails } from "./result-details";
import type { ProfileResult } from "./profile-records";

/** Shared result set for the account, biography and achievement views. */
export async function loadLinkedProfileResults(sql: Sql, userId: string): Promise<ProfileResult[]> {
  const claimedResults = await sql<{
    result_id: number;
    edition_id: number;
    surface: string;
    event_country: string;
    event_city: string;
    distance_km: number;
    result_status: string;
    result_details: unknown;
    result_source: string | null;
    chip_time_seconds: number | null;
    gun_time_seconds: number | null;
    source_urls: string[];
    athlete_name: string;
    event_name: string;
    event_slug: string;
    event_sport: string;
    event_date: string;
    distance_code: string;
    finish_time_seconds: number | null;
    overall_place: number | null;
    gender_place: number | null;
    category_place: number | null;
    result_gender: string | null;
    category: string | null;
  }>`
        select
          result.id as result_id,
          result.edition_id as edition_id,
          result.surface,
          result.event_country as event_country,
          result.event_city as event_city,
          result.distance_km,
          result.status as result_status,
          result.result_details,
          result.result_source,
          result.chip_time_seconds,
          result.gun_time_seconds,
          array(select distinct link from (
            select result.source_url as link
            union all select edition.results_official_url from editions edition where edition.id = result.edition_id
            union all select reference.source_url from result_source_references reference where reference.result_id = result.id
          ) sources where link like 'https://%') as source_urls,
          athlete.display_name as athlete_name,
          result.event_name as event_name,
          result.event_slug as event_slug,
          result.event_sport as event_sport,
          result.event_date as event_date,
          result.distance_code,
          result.finish_time_seconds,
          result.overall_place, result.gender_place, result.category_place, athlete.gender as result_gender,
          result.category
        from athlete_account_links account_link
        join athletes athlete on athlete.id = account_link.athlete_id
        join athlete_claimable_results result on result.athlete_id = athlete.id
        where account_link.user_id = ${userId}
          and account_link.status = 'active' and (result.id > 0 or result.available)
        order by result.event_date desc, result.event_name, result.id desc
      `;
  return claimedResults.map((row) => ({
    resultId: row.result_id,
    editionId: row.edition_id,
    surface: row.surface,
    country: row.event_country,
    city: row.event_city,
    distanceKm: Number(row.distance_km),
    status: row.result_status,
    details: readResultDetails(row.result_details),
    resultSource: row.result_source,
    chipTimeSeconds: row.chip_time_seconds,
    gunTimeSeconds: row.gun_time_seconds,
    sourceUrls: row.source_urls ?? [],
    athleteName: row.athlete_name,
    eventName: row.event_name,
    eventSlug: row.event_slug,
    sport: row.event_sport,
    eventDate: row.event_date,
    distanceCode: row.distance_code,
    finishTimeSeconds: row.finish_time_seconds,
    overallPlace: row.overall_place,
    genderPlace: row.gender_place,
    categoryPlace: row.category_place,
    resultGender: row.result_gender,
    category: row.category,
  }));
}
