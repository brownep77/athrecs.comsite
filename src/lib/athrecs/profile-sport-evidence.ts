import type { Sport } from "./types";
import { sourceHistorySport } from "./source-history-sport.ts";

export const profileEvidenceSportNames: readonly Sport[] = [
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
  "Walking",
  "Adventure Racing",
  "Functional Fitness",
];
// Match the partial index in catalogue-wide queries; point lookups need no guard.
export const profileSportEvidencePredicateSql = (column = "a.profile_details") =>
  `${column} ?| array['powerOf10Ranking20260917','directorySource','publishedRaceHistory','user_supplied_sports']`;
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown) => (typeof value === "string" ? value : "");
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Sport evidence is not a result, identity verification or publication approval.
 * Callers must enforce the profile's existing visibility and owner controls.
 * Return only sport names: source URLs and evidence remain staff-only.
 */
export function profileEvidenceSports(value: unknown): Sport[] {
  const details = object(value);
  const rank = object(details.powerOf10Ranking20260917);
  const directory = object(details.directorySource);
  const directoryRow = object(directory.row);
  const published = object(details.publishedRaceHistory);
  const found: (Sport | null)[] = [];
  if (
    rank.provider === "powerof10" &&
    /^https:\/\/(www\.)?(powerof10\.uk|thepowerof10\.info)\//i.test(text(rank.sourceUrl))
  )
    found.push(sourceHistorySport(text(rank.rankingTitle), "powerof10"));
  if (
    /^https:\/\/worldathletics\.org\//i.test(text(directory.url)) &&
    text(directoryRow.aaAthleteId)
  )
    for (const discipline of text(directoryRow.disciplines).split(/,\s+/))
      found.push(sourceHistorySport(discipline, "worldathletics"));
  if (published.status === "public" && published.includeInRaceResults === true)
    for (const entry of list(published.entries).map(object))
      if (entry.includeInRaceResults === true && entry.profileExcluded !== true)
        found.push(sourceHistorySport(text(entry.distance), "", text(entry.event)));
  if (details.publication_approved === true)
    for (const sport of list(details.user_supplied_sports))
      if (profileEvidenceSportNames.includes(sport as Sport)) found.push(sport as Sport);
  return [...new Set(found.filter((sport): sport is Sport => sport !== null))].sort();
}

/** Same extraction as the JS reader, generated and parity-tested in PostgreSQL. */
export function profileSportEvidenceMigration(): string {
  return `-- Generated from profile-sport-evidence.ts; no result or visibility changes.
create or replace function athlete_profile_sports_v1(details jsonb)
returns text[] language sql immutable parallel safe as $function$
  with evidence as (
    select public.athlete_source_sport_v3('powerof10',details#>>'{powerOf10Ranking20260917,rankingTitle}','') sport
    where details#>>'{powerOf10Ranking20260917,provider}'='powerof10'
      and details#>>'{powerOf10Ranking20260917,sourceUrl}' ~* '^https://(www[.])?(powerof10[.]uk|thepowerof10[.]info)/'
    union all
    select public.athlete_source_sport_v3('worldathletics',discipline,'')
    from regexp_split_to_table(coalesce(details#>>'{directorySource,row,disciplines}',''),',[[:space:]]+') discipline
    where details#>>'{directorySource,url}' ~* '^https://worldathletics[.]org/'
      and coalesce(details#>>'{directorySource,row,aaAthleteId}','')<>''
    union all
    select public.athlete_source_sport_v3('',entry->>'distance',entry->>'event')
    from jsonb_array_elements(case when jsonb_typeof(details#>'{publishedRaceHistory,entries}')='array'
      then details#>'{publishedRaceHistory,entries}' else '[]'::jsonb end) entry
    where details#>>'{publishedRaceHistory,status}'='public'
      and details#>'{publishedRaceHistory,includeInRaceResults}'='true'::jsonb
      and entry->'includeInRaceResults'='true'::jsonb
      and coalesce(entry->'profileExcluded','false'::jsonb)<>'true'::jsonb
    union all
    select sport from jsonb_array_elements_text(case when jsonb_typeof(details->'user_supplied_sports')='array'
      then details->'user_supplied_sports' else '[]'::jsonb end) sport
    where details->'publication_approved'='true'::jsonb
      and sport in (${profileEvidenceSportNames.map((s) => `'${s}'`).join(",")})
  ) select coalesce(array_agg(distinct sport order by sport) filter(where sport is not null),array[]::text[]) from evidence
$function$;

create index if not exists athlete_profile_sports_v1_lookup
  on athletes using gin (athlete_profile_sports_v1(profile_details))
  where ${profileSportEvidencePredicateSql("profile_details")};
`;
}
