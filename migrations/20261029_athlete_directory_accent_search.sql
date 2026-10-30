-- Search accents consistently in the indexed candidate selection and the final
-- permission-aware field match. Original names and profile fields are unchanged.
-- Canonical Unicode decomposition retains non-Latin scripts, punctuation and
-- spacing; only combining diacritics are removed. No optional unaccent extension
-- or mutable dictionary is required for this immutable index expression.
create or replace function athlete_directory_search_fold(value text)
returns text language sql immutable strict parallel safe as $function$
  select lower(regexp_replace(normalize(value,NFD),U&'[\0300-\036f]','','g'))
$function$;

-- Retain the existing plain-lower indexes while the preceding application
-- deployment may still be serving requests. These additional indexes support
-- the new predicates without an unindexed OR/fallback scan of the catalogue.
do $migration$
begin
  if exists (select 1 from pg_available_extensions where name='pg_trgm') then
    create extension if not exists pg_trgm;
    create index if not exists public_athlete_search_folded_trgm on athletes using gin (
      athlete_directory_search_fold(coalesce(display_name,'')||' '||coalesce(city,'')||' '||(case
        when lower(trim(country)) in ('england','scotland','wales','northern ireland','united kingdom','uk','gb','gbr','great britain') then 'United Kingdom'
        when lower(trim(country)) in ('ireland','republic of ireland','ie','irl') then 'Ireland'
        else trim(coalesce(country,'')) end)||' '||coalesce(profile_roles,'')) gin_trgm_ops)
      where profile_visibility='public' or profile_type='Public figure';
    create index if not exists club_name_search_folded_trgm on clubs using gin (
      athlete_directory_search_fold(name) gin_trgm_ops);
  end if;
end
$migration$;

analyze athletes;
analyze clubs;
