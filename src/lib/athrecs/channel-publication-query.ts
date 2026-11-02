import type { Sql } from "../db";
import type { ChannelProfile } from "./english-channel";

export async function readReviewedChannelRows(
  sql: Sql,
  profiles: ReadonlyMap<string, ChannelProfile>,
  slug?: string,
) {
  const slugs = slug ? (profiles.has(slug) ? [slug] : []) : [...profiles.keys()];
  if (!slugs.length) return [];
  const rows = await sql.query<{ slug: string; revision: string; bio: string }>(
    `
    select a.slug, a.profile_details->>'channelArchiveRevision' as revision, a.bio
    from athletes a
    where a.slug = any($1::text[]) and a.profile_visibility = 'public'
      and exists(select 1 from athlete_identifiers i where i.athlete_id=a.id)
      and not exists(select 1 from athlete_account_links l where l.athlete_id=a.id)
      and exists(select 1 from network_audit_log n where n.entity_type='athlete' and n.entity_id=a.id::text
        and n.action='athlete.profile_admin_published' and n.after_value->>'athleteId'=a.id::text
        and n.after_value->>'profile_visibility'='public'
        and n.after_value->>'channelArchiveRevision'=a.profile_details->>'channelArchiveRevision')
      and exists(select 1 from network_audit_log n where n.entity_type='athlete' and n.entity_id=a.id::text
        and n.action='athlete.biography_admin_published' and n.after_value->>'athleteId'=a.id::text
        and n.after_value->>'biography'=a.bio)
    order by a.display_name, a.slug`,
    [slugs],
  );
  return rows.flatMap((row) => {
    const p = profiles.get(row.slug);
    return p && p.revision === row.revision && p.biography.join("\n\n") === row.bio ? [p] : [];
  });
}
