import type { Sql } from "../db";
import { canonicalEventSlug } from "../../data/entry-options";

/** Catalogue aliases may predate a deliberate rename in the live database. */
export async function eventByPublicSlug(sql: Sql, slug: string) {
  return sql.query(
    `select e.* from events e
     where e.slug = coalesce(
       (select current_slug from slug_redirects
        where entity_type = 'event' and old_slug = $1), $1)
     limit 1`,
    [canonicalEventSlug(slug)],
  );
}
