-- Permanent URL slugs and redirects.
--
-- A slug may change deliberately, but an old public URL must never become a
-- 404 or later point at a different entity. These triggers record every change
-- in the same transaction as the entity update and prevent recycled slugs.

create table if not exists slug_redirects (
  entity_type text not null
    check (entity_type in ('event', 'athlete', 'club')),
  entity_id int not null,
  old_slug text not null,
  current_slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_type, old_slug),
  check (old_slug <> current_slug)
);

create index if not exists slug_redirects_entity_idx
  on slug_redirects (entity_type, entity_id);

create index if not exists slug_redirects_current_idx
  on slug_redirects (entity_type, current_slug);

create or replace function athrecs_preserve_entity_slug()
returns trigger
language plpgsql
as $$
declare
  kind text := tg_argv[0];
begin
  if new.slug = old.slug then
    return new;
  end if;

  if new.slug is null or new.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Invalid % slug: %', kind, coalesce(new.slug, '<null>');
  end if;

  if exists (
    select 1
    from slug_redirects redirect
    where redirect.entity_type = kind
      and redirect.old_slug = new.slug
  ) then
    raise exception 'The % slug "%" is a permanent historic URL and cannot be reused',
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
before update of slug on events
for each row
execute function athrecs_preserve_entity_slug('event');

drop trigger if exists athletes_preserve_slug on athletes;
create trigger athletes_preserve_slug
before update of slug on athletes
for each row
execute function athrecs_preserve_entity_slug('athlete');

drop trigger if exists clubs_preserve_slug on clubs;
create trigger clubs_preserve_slug
before update of slug on clubs
for each row
execute function athrecs_preserve_entity_slug('club');
