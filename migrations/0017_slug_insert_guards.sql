-- Complete permanent-slug protection for newly inserted entities.
--
-- Migration 0015 records historic slugs during renames. This follow-up makes
-- those historic addresses (and their current redirect targets) unavailable to
-- a newly inserted event, athlete or club, so an old public URL can never be
-- recycled by a different entity after deletion or catalogue repair.

create or replace function athrecs_preserve_entity_slug()
returns trigger
language plpgsql
as $$
declare
  kind text := tg_argv[0];
begin
  if new.slug is null or new.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Invalid % slug: %', kind, coalesce(new.slug, '<null>');
  end if;

  if tg_op = 'UPDATE' and new.slug = old.slug then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if exists (
      select 1
      from slug_redirects redirect
      where redirect.entity_type = kind
        and (
          redirect.old_slug = new.slug
          or redirect.current_slug = new.slug
        )
    ) then
      raise exception 'The % slug "%" is a permanent public URL and cannot be reused',
        kind, new.slug;
    end if;
    return new;
  end if;

  if exists (
    select 1
    from slug_redirects redirect
    where redirect.entity_type = kind
      and (
        redirect.old_slug = new.slug
        or (
          redirect.current_slug = new.slug
          and redirect.entity_id <> old.id
        )
      )
  ) then
    raise exception 'The % slug "%" is a permanent public URL and cannot be reused',
      kind, new.slug;
  end if;

  update slug_redirects
  set current_slug = new.slug,
      updated_at = now()
  where entity_type = kind
    and entity_id = old.id;

  insert into slug_redirects (
    entity_type,
    entity_id,
    old_slug,
    current_slug
  ) values (
    kind,
    old.id,
    old.slug,
    new.slug
  )
  on conflict (entity_type, old_slug) do update set
    entity_id = excluded.entity_id,
    current_slug = excluded.current_slug,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists events_preserve_slug on events;
create trigger events_preserve_slug
before insert or update of slug on events
for each row
execute function athrecs_preserve_entity_slug('event');

drop trigger if exists athletes_preserve_slug on athletes;
create trigger athletes_preserve_slug
before insert or update of slug on athletes
for each row
execute function athrecs_preserve_entity_slug('athlete');

drop trigger if exists clubs_preserve_slug on clubs;
create trigger clubs_preserve_slug
before insert or update of slug on clubs
for each row
execute function athrecs_preserve_entity_slug('club');
