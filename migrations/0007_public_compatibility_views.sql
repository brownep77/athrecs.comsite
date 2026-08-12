-- Read compatibility between the existing running catalogue and the new generic
-- multi-sport model. Existing routes may continue to use editions/results while
-- new screens query these views and see both data generations without duplication.

create or replace view public_event_catalogue_v as
select
  'multisport'::text as source_model,
  c.id as source_record_id,
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  e.event_type,
  c.sport_id,
  s.code as sport_code,
  s.name as sport_name,
  o.id as occurrence_id,
  o.slug as occurrence_slug,
  c.id as competition_id,
  c.code as competition_code,
  c.name as competition_name,
  coalesce(c.start_at, o.start_at) as start_at,
  coalesce(c.end_at, o.end_at) as end_at,
  coalesce(o.timezone, e.timezone) as timezone,
  o.status as occurrence_status,
  c.status as competition_status,
  c.entry_status,
  coalesce(c.entry_url, o.entry_url) as entry_url,
  c.participant_kind,
  c.result_model,
  c.distance_value,
  c.distance_unit,
  case lower(coalesce(c.distance_unit, ''))
    when 'm' then c.distance_value
    when 'meter' then c.distance_value
    when 'meters' then c.distance_value
    when 'metre' then c.distance_value
    when 'metres' then c.distance_value
    when 'km' then c.distance_value * 1000
    when 'kilometer' then c.distance_value * 1000
    when 'kilometers' then c.distance_value * 1000
    when 'kilometre' then c.distance_value * 1000
    when 'kilometres' then c.distance_value * 1000
    when 'mi' then c.distance_value * 1609.344
    when 'mile' then c.distance_value * 1609.344
    when 'miles' then c.distance_value * 1609.344
    when 'yd' then c.distance_value * 0.9144
    when 'yard' then c.distance_value * 0.9144
    when 'yards' then c.distance_value * 0.9144
    when 'ft' then c.distance_value * 0.3048
    when 'foot' then c.distance_value * 0.3048
    when 'feet' then c.distance_value * 0.3048
    else null
  end::numeric as distance_metres,
  d.code as discipline_code,
  d.name as discipline_name,
  sf.code as surface_code,
  sf.name as surface_name,
  coalesce(o.country_code, v.country_code) as country_code,
  coalesce(o.nation, v.nation, e.country) as nation,
  coalesce(o.region, v.region) as region,
  coalesce(o.county, v.county, e.county) as county,
  coalesce(o.district, v.district, e.area) as district,
  coalesce(o.city, v.city, e.city) as city,
  coalesce(o.postcode, v.postcode) as postcode,
  v.name as venue_name,
  e.organiser,
  e.website,
  e.summary,
  e.verification_status as event_verification_status,
  o.verification_status as occurrence_verification_status,
  c.verification_status as competition_verification_status,
  (
    select count(*)::int
    from competition_results cr
    where cr.competition_id = c.id
      and cr.record_status = 'active'
      and cr.published_at is not null
      and cr.verification_status in ('verified', 'source_matched', 'athlete_confirmed')
  ) as result_count
from event_competitions c
join event_occurrences o on o.id = c.occurrence_id
join events e on e.id = o.event_id
join sports s on s.id = c.sport_id
left join disciplines d on d.id = c.discipline_id
left join surfaces sf on sf.id = c.surface_id
left join venues v on v.id = coalesce(c.venue_id, o.venue_id)
where e.visibility = 'public'
  and o.visibility = 'public'
  and e.verification_status in ('verified', 'legacy_imported')
  and o.verification_status = 'verified'
  and c.verification_status = 'verified'

union all

select
  'legacy'::text as source_model,
  ed.id as source_record_id,
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  coalesce(e.event_type, 'race') as event_type,
  e.sport_id,
  coalesce(s.code, lower(regexp_replace(e.sport, '[^a-zA-Z0-9]+', '-', 'g'))) as sport_code,
  coalesce(s.name, e.sport) as sport_name,
  null::int as occurrence_id,
  ed.event_date::text as occurrence_slug,
  null::int as competition_id,
  lower(regexp_replace(ed.distance_code, '[^a-zA-Z0-9]+', '-', 'g')) as competition_code,
  ed.distance_code as competition_name,
  ed.event_date::timestamptz as start_at,
  null::timestamptz as end_at,
  coalesce(e.timezone, 'Europe/London') as timezone,
  case when ed.event_date < current_date then 'completed' else 'scheduled' end as occurrence_status,
  case when ed.event_date < current_date then 'completed' else 'scheduled' end as competition_status,
  case lower(ed.status)
    when 'open' then 'open'
    when 'closingsoon' then 'closing_soon'
    when 'closed' then 'closed'
    when 'finished' then 'closed'
    else 'tbc'
  end as entry_status,
  ed.entry_url,
  'individual'::text as participant_kind,
  case
    when lower(e.sport) in (
      'running', 'athletics', 'parkrun', 'trackandfield', 'cycling', 'swimming',
      'triathlon', 'duathlon', 'aquathlon', 'aquabike', 'rowing', 'ocr'
    ) then 'time'
    else 'multi_metric'
  end as result_model,
  nullif(ed.distance_km, 0)::numeric as distance_value,
  case when ed.distance_km > 0 then 'km' else null end::text as distance_unit,
  case when ed.distance_km > 0 then (ed.distance_km * 1000)::numeric else null end as distance_metres,
  null::text as discipline_code,
  null::text as discipline_name,
  lower(regexp_replace(e.surface, '[^a-zA-Z0-9]+', '-', 'g')) as surface_code,
  e.surface as surface_name,
  null::text as country_code,
  e.country as nation,
  null::text as region,
  e.county,
  e.area as district,
  e.city,
  null::text as postcode,
  null::text as venue_name,
  e.organiser,
  e.website,
  e.summary,
  coalesce(e.verification_status, 'legacy_imported') as event_verification_status,
  'legacy_imported'::text as occurrence_verification_status,
  'legacy_imported'::text as competition_verification_status,
  (select count(*)::int from results r where r.edition_id = ed.id) as result_count
from editions ed
join events e on e.id = ed.event_id
left join sports s on s.id = e.sport_id
where coalesce(e.visibility, 'public') = 'public'
  and coalesce(e.verification_status, 'legacy_imported') in ('verified', 'legacy_imported')
  and not exists (
    select 1
    from event_occurrences o
    join event_competitions c on c.occurrence_id = o.id
    where o.event_id = e.id
      and coalesce(c.start_at, o.start_at)::date = ed.event_date
      and o.visibility = 'public'
      and o.verification_status = 'verified'
      and c.verification_status = 'verified'
      and (
        lower(c.code) = lower(regexp_replace(ed.distance_code, '[^a-zA-Z0-9]+', '-', 'g'))
        or lower(c.name) = lower(ed.distance_code)
        or (
          ed.distance_km > 0
          and abs(
            case lower(coalesce(c.distance_unit, ''))
              when 'm' then c.distance_value
              when 'meter' then c.distance_value
              when 'meters' then c.distance_value
              when 'metre' then c.distance_value
              when 'metres' then c.distance_value
              when 'km' then c.distance_value * 1000
              when 'kilometer' then c.distance_value * 1000
              when 'kilometers' then c.distance_value * 1000
              when 'kilometre' then c.distance_value * 1000
              when 'kilometres' then c.distance_value * 1000
              when 'mi' then c.distance_value * 1609.344
              when 'mile' then c.distance_value * 1609.344
              when 'miles' then c.distance_value * 1609.344
              when 'yd' then c.distance_value * 0.9144
              when 'yard' then c.distance_value * 0.9144
              when 'yards' then c.distance_value * 0.9144
              when 'ft' then c.distance_value * 0.3048
              when 'foot' then c.distance_value * 0.3048
              when 'feet' then c.distance_value * 0.3048
              else null
            end - (ed.distance_km * 1000)
          ) < 1
        )
      )
  );

create or replace view athlete_result_feed_v as
select
  'multisport'::text as source_model,
  'multisport:' || cr.id::text as result_key,
  cr.id as multisport_result_id,
  null::int as legacy_result_id,
  ce.athlete_id,
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  coalesce(c.start_at, o.start_at) as event_start_at,
  c.id as competition_id,
  c.name as competition_name,
  s.code as sport_code,
  s.name as sport_name,
  d.code as discipline_code,
  d.name as discipline_name,
  sf.code as surface_code,
  sf.name as surface_name,
  c.distance_value,
  c.distance_unit,
  case lower(coalesce(c.distance_unit, ''))
    when 'm' then c.distance_value
    when 'meter' then c.distance_value
    when 'meters' then c.distance_value
    when 'metre' then c.distance_value
    when 'metres' then c.distance_value
    when 'km' then c.distance_value * 1000
    when 'kilometer' then c.distance_value * 1000
    when 'kilometers' then c.distance_value * 1000
    when 'kilometre' then c.distance_value * 1000
    when 'kilometres' then c.distance_value * 1000
    when 'mi' then c.distance_value * 1609.344
    when 'mile' then c.distance_value * 1609.344
    when 'miles' then c.distance_value * 1609.344
    when 'yd' then c.distance_value * 0.9144
    when 'yard' then c.distance_value * 0.9144
    when 'yards' then c.distance_value * 0.9144
    when 'ft' then c.distance_value * 0.3048
    when 'foot' then c.distance_value * 0.3048
    when 'feet' then c.distance_value * 0.3048
    else null
  end::numeric as distance_metres,
  coalesce(o.country_code, v.country_code) as country_code,
  coalesce(o.nation, v.nation, e.country) as nation,
  coalesce(o.region, v.region) as region,
  coalesce(o.county, v.county, e.county) as county,
  coalesce(o.district, v.district, e.area) as district,
  coalesce(o.city, v.city, e.city) as city,
  v.name as venue_name,
  ce.entry_status,
  cr.result_status,
  cr.rank_overall,
  cr.rank_category,
  cr.rank_gender,
  cr.performance_value,
  cr.performance_unit,
  cr.performance_display,
  cr.points,
  cr.score_for,
  cr.score_against,
  cr.outcome,
  cr.source_url,
  cr.verification_status,
  cr.published_at
from competition_results cr
join competition_entries ce on ce.id = cr.entry_id
join event_competitions c on c.id = cr.competition_id
join event_occurrences o on o.id = c.occurrence_id
join events e on e.id = o.event_id
join sports s on s.id = c.sport_id
left join disciplines d on d.id = c.discipline_id
left join surfaces sf on sf.id = c.surface_id
left join venues v on v.id = coalesce(c.venue_id, o.venue_id)
where ce.athlete_id is not null
  and e.visibility = 'public'
  and o.visibility = 'public'
  and e.verification_status in ('verified', 'legacy_imported')
  and o.verification_status = 'verified'
  and c.verification_status = 'verified'
  and cr.record_status = 'active'
  and cr.published_at is not null
  and cr.verification_status in ('verified', 'source_matched', 'athlete_confirmed')

union all

select
  'legacy'::text as source_model,
  'legacy:' || r.id::text as result_key,
  null::int as multisport_result_id,
  r.id as legacy_result_id,
  r.athlete_id,
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  ed.event_date::timestamptz as event_start_at,
  null::int as competition_id,
  ed.distance_code as competition_name,
  coalesce(s.code, lower(regexp_replace(e.sport, '[^a-zA-Z0-9]+', '-', 'g'))) as sport_code,
  coalesce(s.name, e.sport) as sport_name,
  null::text as discipline_code,
  null::text as discipline_name,
  lower(regexp_replace(e.surface, '[^a-zA-Z0-9]+', '-', 'g')) as surface_code,
  e.surface as surface_name,
  nullif(ed.distance_km, 0)::numeric as distance_value,
  case when ed.distance_km > 0 then 'km' else null end::text as distance_unit,
  case when ed.distance_km > 0 then (ed.distance_km * 1000)::numeric else null end as distance_metres,
  null::text as country_code,
  e.country as nation,
  null::text as region,
  e.county,
  e.area as district,
  e.city,
  null::text as venue_name,
  case lower(r.status)
    when 'dns' then 'dns'
    when 'dnf' then 'dnf'
    when 'disqualified' then 'disqualified'
    when 'withdrawn' then 'withdrawn'
    when 'started' then 'started'
    else 'finished'
  end as entry_status,
  lower(r.status) as result_status,
  r.overall_place as rank_overall,
  r.category_place as rank_category,
  r.gender_place as rank_gender,
  r.finish_time_seconds::numeric as performance_value,
  'seconds'::text as performance_unit,
  null::text as performance_display,
  null::numeric as points,
  null::numeric as score_for,
  null::numeric as score_against,
  null::text as outcome,
  r.source_url,
  'legacy_imported'::text as verification_status,
  null::timestamptz as published_at
from results r
join editions ed on ed.id = r.edition_id
join events e on e.id = ed.event_id
left join sports s on s.id = e.sport_id
where coalesce(e.visibility, 'public') = 'public'
  and coalesce(e.verification_status, 'legacy_imported') in ('verified', 'legacy_imported')
  and not exists (
    select 1
    from competition_results cr
    join competition_entries ce on ce.id = cr.entry_id
    join event_competitions c on c.id = cr.competition_id
    join event_occurrences o on o.id = c.occurrence_id
    where ce.athlete_id = r.athlete_id
      and o.event_id = e.id
      and coalesce(c.start_at, o.start_at)::date = ed.event_date
      and (
        lower(c.code) = lower(regexp_replace(ed.distance_code, '[^a-zA-Z0-9]+', '-', 'g'))
        or lower(c.name) = lower(ed.distance_code)
        or (
          ed.distance_km > 0
          and abs(
            case lower(coalesce(c.distance_unit, ''))
              when 'm' then c.distance_value
              when 'meter' then c.distance_value
              when 'meters' then c.distance_value
              when 'metre' then c.distance_value
              when 'metres' then c.distance_value
              when 'km' then c.distance_value * 1000
              when 'kilometer' then c.distance_value * 1000
              when 'kilometers' then c.distance_value * 1000
              when 'kilometre' then c.distance_value * 1000
              when 'kilometres' then c.distance_value * 1000
              when 'mi' then c.distance_value * 1609.344
              when 'mile' then c.distance_value * 1609.344
              when 'miles' then c.distance_value * 1609.344
              when 'yd' then c.distance_value * 0.9144
              when 'yard' then c.distance_value * 0.9144
              when 'yards' then c.distance_value * 0.9144
              when 'ft' then c.distance_value * 0.3048
              when 'foot' then c.distance_value * 0.3048
              when 'feet' then c.distance_value * 0.3048
              else null
            end - (ed.distance_km * 1000)
          ) < 1
        )
      )
      and e.visibility = 'public'
      and o.visibility = 'public'
      and e.verification_status in ('verified', 'legacy_imported')
      and o.verification_status = 'verified'
      and c.verification_status = 'verified'
      and cr.record_status = 'active'
      and cr.published_at is not null
      and cr.verification_status in ('verified', 'source_matched', 'athlete_confirmed')
  );

create or replace view athlete_result_breakdown_v as
select
  athlete_id,
  sport_code,
  sport_name,
  discipline_code,
  discipline_name,
  surface_code,
  surface_name,
  distance_value,
  distance_unit,
  distance_metres,
  country_code,
  nation,
  region,
  county,
  district,
  city,
  count(*)::int as result_count,
  count(*) filter (where result_status = 'finished')::int as finish_count,
  count(*) filter (where result_status = 'dns')::int as dns_count,
  count(*) filter (where result_status = 'dnf')::int as dnf_count,
  min(event_start_at) as first_result_at,
  max(event_start_at) as latest_result_at
from athlete_result_feed_v
group by
  athlete_id, sport_code, sport_name, discipline_code, discipline_name,
  surface_code, surface_name, distance_value, distance_unit, distance_metres,
  country_code, nation, region, county, district, city;

-- Private athlete analytics includes every generic entry, not only published
-- results, plus legacy results as entry proxies. Server functions must still
-- enforce athlete ownership before querying this view.
create or replace view athlete_activity_all_v as
select
  'multisport'::text as source_model,
  'multisport:' || ce.id::text as activity_key,
  ce.athlete_id,
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  c.id as competition_id,
  c.name as competition_name,
  coalesce(c.start_at, o.start_at) as event_start_at,
  s.code as sport_code,
  s.name as sport_name,
  d.code as discipline_code,
  d.name as discipline_name,
  sf.code as surface_code,
  sf.name as surface_name,
  c.distance_value,
  c.distance_unit,
  case lower(coalesce(c.distance_unit, ''))
    when 'm' then c.distance_value
    when 'meter' then c.distance_value
    when 'meters' then c.distance_value
    when 'metre' then c.distance_value
    when 'metres' then c.distance_value
    when 'km' then c.distance_value * 1000
    when 'kilometer' then c.distance_value * 1000
    when 'kilometers' then c.distance_value * 1000
    when 'kilometre' then c.distance_value * 1000
    when 'kilometres' then c.distance_value * 1000
    when 'mi' then c.distance_value * 1609.344
    when 'mile' then c.distance_value * 1609.344
    when 'miles' then c.distance_value * 1609.344
    when 'yd' then c.distance_value * 0.9144
    when 'yard' then c.distance_value * 0.9144
    when 'yards' then c.distance_value * 0.9144
    when 'ft' then c.distance_value * 0.3048
    when 'foot' then c.distance_value * 0.3048
    when 'feet' then c.distance_value * 0.3048
    else null
  end::numeric as distance_metres,
  coalesce(o.country_code, v.country_code) as country_code,
  coalesce(o.nation, v.nation, e.country) as nation,
  coalesce(o.region, v.region) as region,
  coalesce(o.county, v.county, e.county) as county,
  coalesce(o.district, v.district, e.area) as district,
  coalesce(o.city, v.city, e.city) as city,
  ce.entry_status,
  cr.result_status,
  (cr.id is not null) as has_result
from competition_entries ce
join event_competitions c on c.id = ce.competition_id
join event_occurrences o on o.id = c.occurrence_id
join events e on e.id = o.event_id
join sports s on s.id = c.sport_id
left join disciplines d on d.id = c.discipline_id
left join surfaces sf on sf.id = c.surface_id
left join venues v on v.id = coalesce(c.venue_id, o.venue_id)
left join lateral (
  select candidate.id, candidate.result_status
  from competition_results candidate
  where candidate.entry_id = ce.id
    and candidate.competition_id = c.id
    and candidate.record_status = 'active'
  order by (candidate.round_id is null) desc,
           candidate.published_at desc nulls last,
           candidate.id desc
  limit 1
) cr on true
where ce.athlete_id is not null

union all

select
  'legacy'::text as source_model,
  'legacy:' || r.id::text as activity_key,
  r.athlete_id,
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  null::int as competition_id,
  ed.distance_code as competition_name,
  ed.event_date::timestamptz as event_start_at,
  coalesce(s.code, lower(regexp_replace(e.sport, '[^a-zA-Z0-9]+', '-', 'g'))) as sport_code,
  coalesce(s.name, e.sport) as sport_name,
  null::text as discipline_code,
  null::text as discipline_name,
  lower(regexp_replace(e.surface, '[^a-zA-Z0-9]+', '-', 'g')) as surface_code,
  e.surface as surface_name,
  nullif(ed.distance_km, 0)::numeric as distance_value,
  case when ed.distance_km > 0 then 'km' else null end::text as distance_unit,
  case when ed.distance_km > 0 then (ed.distance_km * 1000)::numeric else null end as distance_metres,
  null::text as country_code,
  e.country as nation,
  null::text as region,
  e.county,
  e.area as district,
  e.city,
  case lower(r.status)
    when 'dns' then 'dns'
    when 'dnf' then 'dnf'
    when 'disqualified' then 'disqualified'
    when 'withdrawn' then 'withdrawn'
    when 'started' then 'started'
    else 'finished'
  end as entry_status,
  lower(r.status) as result_status,
  true as has_result
from results r
join editions ed on ed.id = r.edition_id
join events e on e.id = ed.event_id
left join sports s on s.id = e.sport_id
where not exists (
  select 1
  from competition_entries ce
  join event_competitions c on c.id = ce.competition_id
  join event_occurrences o on o.id = c.occurrence_id
  where ce.athlete_id = r.athlete_id
    and o.event_id = e.id
    and coalesce(c.start_at, o.start_at)::date = ed.event_date
    and (
      lower(c.code) = lower(regexp_replace(ed.distance_code, '[^a-zA-Z0-9]+', '-', 'g'))
      or lower(c.name) = lower(ed.distance_code)
      or (
        ed.distance_km > 0
        and abs(
          case lower(coalesce(c.distance_unit, ''))
            when 'm' then c.distance_value
            when 'meter' then c.distance_value
            when 'meters' then c.distance_value
            when 'metre' then c.distance_value
            when 'metres' then c.distance_value
            when 'km' then c.distance_value * 1000
            when 'kilometer' then c.distance_value * 1000
            when 'kilometers' then c.distance_value * 1000
            when 'kilometre' then c.distance_value * 1000
            when 'kilometres' then c.distance_value * 1000
            when 'mi' then c.distance_value * 1609.344
            when 'mile' then c.distance_value * 1609.344
            when 'miles' then c.distance_value * 1609.344
            when 'yd' then c.distance_value * 0.9144
            when 'yard' then c.distance_value * 0.9144
            when 'yards' then c.distance_value * 0.9144
            when 'ft' then c.distance_value * 0.3048
            when 'foot' then c.distance_value * 0.3048
            when 'feet' then c.distance_value * 0.3048
            else null
          end - (ed.distance_km * 1000)
        ) < 1
      )
    )
);

create or replace view athlete_activity_breakdown_all_v as
select
  athlete_id,
  sport_code,
  sport_name,
  discipline_code,
  discipline_name,
  surface_code,
  surface_name,
  distance_value,
  distance_unit,
  distance_metres,
  country_code,
  nation,
  region,
  county,
  district,
  city,
  count(*)::int as entry_count,
  count(*) filter (where has_result)::int as result_count,
  count(*) filter (where result_status = 'finished')::int as finish_count,
  count(*) filter (where coalesce(result_status, entry_status) = 'dns')::int as dns_count,
  count(*) filter (where coalesce(result_status, entry_status) = 'dnf')::int as dnf_count,
  min(event_start_at) as first_entry_at,
  max(event_start_at) as latest_entry_at
from athlete_activity_all_v
group by
  athlete_id, sport_code, sport_name, discipline_code, discipline_name,
  surface_code, surface_name, distance_value, distance_unit, distance_metres,
  country_code, nation, region, county, district, city;
