-- Remove external DUV identifiers from public athlete slugs in bounded batches.
-- RUN ONLY ONCE PER REVIEWED BATCH; repeat until the remaining count is zero.
-- Requires the existing athletes_preserve_slug trigger, which records permanent
-- redirects. Never disable that trigger or reuse a previously published slug.
-- Dry run:
--   select count(*) from athletes where slug ~ '-duv-[0-9]+$';
--   select id,slug,regexp_replace(slug,'-duv-[0-9]+$','') as desired
--   from athletes where slug ~ '-duv-[0-9]+$' order by id limit 50;
--
-- Each batch is intentionally small to protect a production catalogue with
-- hundreds of thousands of records and other concurrent imports.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '45s';

with pending as materialized (
  select a.id, a.slug as old_slug,
    regexp_replace(a.slug, '-duv-[0-9]+$', '') as base_slug
  from athletes a
  where a.slug ~ '-duv-[0-9]+$'
  order by a.id
  limit 250
),
ranked as (
  select p.*,
    row_number() over (partition by p.base_slug order by p.id) as name_rank
  from pending p
),
proposed as (
  select r.*,
    case when r.name_rank = 1
      and not exists (select 1 from athletes a where a.slug = r.base_slug)
      and not exists (
        select 1 from slug_redirects d
        where d.entity_type = 'athlete'
          and (d.old_slug = r.base_slug or d.current_slug = r.base_slug)
      )
    then r.base_slug
    else left(r.base_slug, 180) || '-athlete-' || r.id::text
    end as new_slug
  from ranked r
),
safe as (
  select p.* from proposed p
  where p.new_slug <> p.old_slug
    and p.new_slug ~ '^[a-z0-9][a-z0-9-]*$'
    and not exists (select 1 from athletes a where a.slug = p.new_slug)
    and not exists (
      select 1 from slug_redirects d
      where d.entity_type = 'athlete'
        and (d.old_slug = p.new_slug or d.current_slug = p.new_slug)
    )
),
changed as (
  update athletes a set slug = s.new_slug
  from safe s
  where a.id = s.id and a.slug = s.old_slug
  returning a.id, s.old_slug, a.slug as new_slug
)
select count(*) as migrated, count(*) filter (where new_slug like '%-athlete-%') as disambiguated
from changed;
commit;
