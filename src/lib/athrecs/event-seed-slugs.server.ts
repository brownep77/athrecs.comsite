import type { Sql } from "../db";

/** Resolve source keys without recreating a deliberately renamed event. */
export async function resolveEventSeedSlugs(sql: Sql, slugs: string[]) {
  const rows = await sql.query<{ old_slug: string; current_slug: string }>(
    `select seed.slug as old_slug,
      coalesce(original.current_slug, renamed.current_slug, migration.current_slug, seed.slug) as current_slug
     from unnest($1::text[]) seed(slug)
     left join catalogue_event_slug_migrations migration on migration.old_slug = seed.slug
     left join slug_redirects original on original.entity_type = 'event' and original.old_slug = seed.slug
     left join slug_redirects renamed on renamed.entity_type = 'event' and renamed.old_slug = migration.current_slug`,
    [[...new Set(slugs)]],
  );
  return new Map(rows.map((row) => [row.old_slug, row.current_slug]));
}

/** Fresh databases start on the readable URL and retain the published old URL. */
export async function preserveMigratedEventSeedSlugs(sql: Sql) {
  await sql.query(`insert into slug_redirects (entity_type, entity_id, old_slug, current_slug)
    select 'event', e.id, migration.old_slug, e.slug
    from catalogue_event_slug_migrations migration
    join events e on e.slug = migration.current_slug
    on conflict (entity_type, old_slug) do nothing`);
}
