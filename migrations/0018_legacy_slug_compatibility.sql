-- Preserve valid legacy public URLs while keeping slug reuse protection.
--
-- The historical catalogue contains a small number of lowercase slugs with
-- repeated internal hyphens. They are already public, indexed addresses and
-- must continue to seed and resolve. New application-generated slugs still use
-- the stricter single-hyphen `slugify` format; this database rule accepts the
-- legacy public superset but rejects uppercase, spaces, and leading/trailing
-- hyphens.

create or replace function athrecs_preserve_entity_slug()
returns trigger
language plpgsql
as $$
declare
  kind text := tg_argv[0];
begin
  if new.slug is null or new.slug !~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' then
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
