import type { Sql } from "../db";
import { resultSlug } from "./result-slug.ts";
import {
  SHORT_RACE_COUNTRIES,
  SHORT_RACE_FROM,
  SHORT_RACE_TO,
} from "../../athletics/temporary-running.ts";

export const CONTENT_SITEMAP_PAGE_SIZE = 5000;
export type ContentSitemapKind = "races" | "clubs" | "results";

// These predicates mirror the public route loaders, not the broader staff database.
function selection(kind: ContentSitemapKind): { query: string; values: unknown[] } {
  if (kind === "races")
    return {
      query: `select e.id, e.slug from events e where e.sport = 'Athletics' or (
      e.sport = 'Running' and e.country = any($1::text[]) and exists (
        select 1 from editions ed where ed.event_id = e.id
          and ed.distance_code in ('5K', '10K') and ed.event_date between $2::date and $3::date
          and not exists (
            select 1 from catalogue_change_log change
            join catalogue_revisions revision on revision.id = change.revision_id
            join catalogue_import_batches batch on batch.id = revision.batch_id
            where change.entity_type = 'edition' and change.operation = 'insert'
              and (batch.source_key like 'runrecs:uk:0-100km:%' or batch.source_key like 'runrecs:collector:%')
              and change.after_json->'record'->>'id' = ed.id::text
          )
      ))`,
      values: [[...SHORT_RACE_COUNTRIES], SHORT_RACE_FROM, SHORT_RACE_TO],
    };
  if (kind === "clubs")
    return {
      query: `select c.id, c.slug from clubs c where lower(coalesce(c.sports, '')) like '%athletics%'
      or exists (select 1 from athletes a join results r on r.athlete_id = a.id
        join editions ed on ed.id = r.edition_id join events e on e.id = ed.event_id
        where a.club_id = c.id and e.sport = 'Athletics'
          and (a.profile_visibility = 'public' or a.profile_type = 'Public figure'))`,
      values: [],
    };
  return {
    query: `select ed.id, ed.id as edition_id, e.name as event_name,
      ed.event_date::text as event_date, ed.distance_code
      from editions ed join events e on e.id = ed.event_id
      where ed.event_date <= (now() at time zone 'Europe/London')::date and exists (
        select 1 from results r join athletes a on a.id = r.athlete_id
        where r.edition_id = ed.id
          and (r.result_visibility in ('public', 'public_figure') or a.profile_type = 'Public figure')
          and (a.profile_visibility = 'public' or a.profile_type = 'Public figure')
          and not exists (select 1 from athlete_account_links l
            join athlete_public_shares s on s.user_id = l.user_id
            where l.athlete_id = a.id and l.status = 'active'
              and (s.enabled = false or s.share_results = false))
          and not exists (select 1 from athlete_profile_hidden_results h
            join athlete_account_links l on l.user_id = h.user_id and l.status = 'active'
            where l.athlete_id = a.id and h.result_id = r.id)
      )`,
    values: [],
  };
}

export async function contentSitemapPageCount(sql: Sql, kind: ContentSitemapKind): Promise<number> {
  const { query, values } = selection(kind);
  const [row] = await sql.query<{ count: number }>(
    `select count(*)::int as count from (${query}) pages`,
    values,
  );
  return Math.ceil(row.count / CONTENT_SITEMAP_PAGE_SIZE);
}

export async function contentSitemapPaths(
  sql: Sql,
  kind: ContentSitemapKind,
  page: number,
): Promise<string[]> {
  if (!Number.isSafeInteger(page) || page < 1) return [];
  const { query, values } = selection(kind);
  const rows = await sql.query<{
    slug: string;
    edition_id: number;
    event_name: string;
    event_date: string;
    distance_code: string;
  }>(
    `${query} order by ${kind === "clubs" ? "c" : kind === "races" ? "e" : "ed"}.id limit $${values.length + 1} offset $${values.length + 2}`,
    [...values, CONTENT_SITEMAP_PAGE_SIZE, (page - 1) * CONTENT_SITEMAP_PAGE_SIZE],
  );
  return rows.map(
    (row) => `/${kind}/${encodeURIComponent(kind === "results" ? resultSlug(row) : row.slug)}`,
  );
}
