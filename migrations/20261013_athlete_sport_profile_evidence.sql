-- Generated from profile-sport-evidence.ts; no result or visibility changes.
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
      and sport in ('Running','Athletics','Parkrun','Cycling','Swimming','Triathlon','Duathlon','Aquathlon','Aquabike','Rowing','OCR','Walking','Adventure Racing','Functional Fitness')
  ) select coalesce(array_agg(distinct sport order by sport) filter(where sport is not null),array[]::text[]) from evidence
$function$;

create index if not exists athlete_profile_sports_v1_lookup
  on athletes using gin (athlete_profile_sports_v1(profile_details))
  where profile_details ?| array['powerOf10Ranking20260917','directorySource','publishedRaceHistory','user_supplied_sports'];
