import type { Sql } from "../db";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";
import { statsFilters, type StatsReport } from "./core";

// Use stored geography only: nationality, club location and race location are
// not evidence of an athlete's residence. Preserve UK home-nation distinctions.
const known = (column: string) =>
  `case when lower(trim(coalesce(${column},''))) in ('','unknown','u','n/a','not known','unspecified') then 'Unknown' else trim(${column}) end`;

/** One read-only statement gives totals, filters and tables the same snapshot. */
export async function readCollectionStats(sql: Sql, input: unknown): Promise<StatsReport> {
  const f = statsFilters.parse(input);
  const rows = await sql.query<{ report: StatsReport }>(
    `with
    event_base as materialized (
      select id, ${known("sport")} as sport, ${known("country")} as country,
        ${known("county")} as county from events
      where not(slug=any($1::text[]))
    ),
    edition_base as materialized (
      select ed.id, ed.event_id, ${known("ed.distance_code")} as distance,
        extract(year from ed.event_date)::int as year
      from editions ed join event_base e on e.id=ed.event_id
    ),
    distances as (
      select d.event_id, ${known("d.distance_code")} as distance
      from event_distances d join event_base e on e.id=d.event_id
      union select event_id, distance from edition_base
    ),
    race_base as materialized (
      select e.id as event_id, ed.id as edition_id, e.sport, e.country, e.county,
        coalesce(d.distance,'Unknown') as distance, ed.year
      from event_base e left join distances d on d.event_id=e.id
      left join edition_base ed on ed.event_id=e.id and ed.distance=d.distance
    ),
    selected_races as materialized (
      select * from race_base where ($2='' or sport=$2) and ($3='' or distance=$3)
        and ($4='' or country=$4) and ($5='' or county=$5)
        and ($6::int is null or year=$6)
    ),
    race_groups as (
      select case when $7 in ('sport','detail') then sport end as sport,
        case when $7 in ('distance','detail') then distance end as distance,
        case when $7 in ('country','county','detail') then country end as country,
        case when $7 in ('county','detail') then county end as county,
        count(distinct event_id) as events, count(distinct edition_id) as editions
      from selected_races group by 1,2,3,4
    ),
    profile_base as materialized (
      select a.id, case
        when lower(trim(gender)) in ('m','male','man') then 'Male'
        when lower(trim(gender)) in ('f','female','woman') then 'Female'
        when lower(trim(gender)) in ('nb','non-binary','nonbinary','non binary') then 'Non-binary'
        when lower(trim(coalesce(gender,''))) in ('','u','unknown','n/a','unspecified') then 'Unknown'
        else trim(gender) end as gender,
        ${known("a.country")} as country, ${known("a.county")} as county,
        (profile_visibility='public' or profile_type='Public figure') as is_public,
        created_at >= now()-interval '7 days' as added_7d
      from athletes a where not exists(select 1 from athrecs_test_athletes t where t.athlete_id=a.id)
        and coalesce(a.profile_details->>'syntheticTest','false') <> 'true'
    ),
    selected_profiles as materialized (
      select * from profile_base where ($8='' or gender=$8)
        and ($9='' or country=$9) and ($10='' or county=$10)
    ),
    profile_groups as (
      select case when $11 in ('gender','detail') then gender end as gender,
        case when $11 in ('country','county','detail') then country end as country,
        case when $11 in ('county','detail') then county end as county,
        count(*) as profiles, count(*) filter(where is_public) as "publicProfiles",
        count(*) filter(where added_7d) as "added7d"
      from selected_profiles group by 1,2,3
    )
    select jsonb_build_object(
      'generatedAt',now(),
      'totals',jsonb_build_object('events',(select count(*) from event_base),
        'editions',(select count(*) from edition_base),'profiles',(select count(*) from profile_base),
        'publicProfiles',(select count(*) from profile_base where is_public),
        'added7d',(select count(*) from profile_base where added_7d)),
      'excluded',jsonb_build_object('eventAliases',(select count(*) from events where slug=any($1::text[])),
        'testProfiles',(select count(*) from athletes)-(select count(*) from profile_base)),
      'races',jsonb_build_object(
        'totals',(select jsonb_build_object('events',count(distinct event_id),'editions',count(distinct edition_id)) from selected_races),
        'rows',coalesce((select jsonb_agg(r order by events desc,sport,distance,country,county) from race_groups r),'[]'::jsonb),
        'gaps',(select jsonb_build_object(
          'sport',count(distinct event_id) filter(where sport='Unknown'),
          'distance',count(distinct event_id) filter(where distance='Unknown'),
          'country',count(distinct event_id) filter(where country='Unknown'),
          'county',count(distinct event_id) filter(where county='Unknown')) from selected_races)),
      'profiles',jsonb_build_object(
        'totals',(select jsonb_build_object('profiles',count(*),'publicProfiles',count(*) filter(where is_public),'added7d',count(*) filter(where added_7d)) from selected_profiles),
        'rows',coalesce((select jsonb_agg(p order by profiles desc,gender,country,county) from profile_groups p),'[]'::jsonb),
        'gaps',(select jsonb_build_object('gender',count(*) filter(where gender='Unknown'),
          'country',count(*) filter(where country='Unknown'),'county',count(*) filter(where county='Unknown')) from selected_profiles)),
      'options',jsonb_build_object(
        'sports',coalesce((select jsonb_agg(v order by v) from (select distinct sport v from event_base) x),'[]'::jsonb),
        'distances',coalesce((select jsonb_agg(v order by v) from (select distinct distance v from race_base) x),'[]'::jsonb),
        'raceCountries',coalesce((select jsonb_agg(v order by v) from (select distinct country v from event_base) x),'[]'::jsonb),
        'raceCounties',coalesce((select jsonb_agg(v order by v) from (select distinct county v from event_base where $4='' or country=$4) x),'[]'::jsonb),
        'years',coalesce((select jsonb_agg(v order by v desc) from (select distinct year v from edition_base) x),'[]'::jsonb),
        'genders',coalesce((select jsonb_agg(v order by v) from (select distinct gender v from profile_base) x),'[]'::jsonb),
        'profileCountries',coalesce((select jsonb_agg(v order by v) from (select distinct country v from profile_base) x),'[]'::jsonb),
        'profileCounties',coalesce((select jsonb_agg(v order by v) from (select distinct county v from profile_base where $9='' or country=$9) x),'[]'::jsonb)
      )
    ) as report`,
    [
      retainedFixtureAliasSlugs,
      f.sport,
      f.distance,
      f.raceCountry,
      f.raceCounty,
      f.year,
      f.raceGroup,
      f.gender,
      f.profileCountry,
      f.profileCounty,
      f.profileGroup,
    ],
  );
  if (!rows[0]?.report) throw new Error("Collection stats are unavailable");
  return rows[0].report;
}
