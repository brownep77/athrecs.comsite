-- Ordinary public pages use ordered index scans, not full-catalogue totals.
create index if not exists public_athlete_letter_name_lookup
  on athletes (upper(left(display_name,1)),lower(display_name),id)
  where profile_visibility='public';
create index if not exists public_athlete_club_lookup
  on athletes (club_id)
  where profile_visibility='public' or profile_type='Public figure';
create index if not exists public_athlete_country_name_lookup
  on athletes ((case
    when lower(trim(country)) in ('england','scotland','wales','northern ireland','united kingdom','uk','gb','gbr','great britain') then 'United Kingdom'
    when lower(trim(country)) in ('ireland','republic of ireland','ie','irl') then 'Ireland'
    else trim(coalesce(country,'')) end), lower(display_name),id)
  where profile_visibility='public' or profile_type='Public figure';

-- PostgreSQL/Neon supplies pg_trgm. Minimal embedded test databases can omit
-- that optional extension: the same LIKE predicate still works without it.
do $migration$
begin
  if exists (select 1 from pg_available_extensions where name='pg_trgm') then
    create extension if not exists pg_trgm;
    create index if not exists public_athlete_search_trgm on athletes using gin (
      lower(coalesce(display_name,'')||' '||coalesce(city,'')||' '||(case
        when lower(trim(country)) in ('england','scotland','wales','northern ireland','united kingdom','uk','gb','gbr','great britain') then 'United Kingdom'
        when lower(trim(country)) in ('ireland','republic of ireland','ie','irl') then 'Ireland'
        else trim(coalesce(country,'')) end)||' '||coalesce(profile_roles,'')) gin_trgm_ops)
      where profile_visibility='public' or profile_type='Public figure';
    create index if not exists club_name_search_trgm on clubs using gin (lower(name) gin_trgm_ops);
  end if;
end
$migration$;

-- Make expression-index selectivity available before the new reader is served.
analyze athletes;
analyze clubs;
