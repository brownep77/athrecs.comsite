import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { ensureAthrecsSeeded } from "./seed.server";
import { todayIso } from "./format";
import { normalizeResultsSearch, parseResultsEditionId } from "./public-results-search";

export type PublicResultEdition = {
  edition_id: number;
  event_name: string;
  event_date: string;
  sport: string;
  distance_code: string;
  city: string | null;
  country: string | null;
  result_count: number;
};

export type PublicRaceResult = {
  id: number;
  athlete_name: string;
  athlete_slug: string;
  profile_club: string | null;
  overall_place: number | null;
  gender_place: number | null;
  category_place: number | null;
  category: string | null;
  status: string;
  finish_time_seconds: number | null;
  chip_time_seconds: number | null;
  gun_time_seconds: number | null;
  disqualified: boolean;
};

const EDITION_PAGE_SIZE = 24;
const RESULT_PAGE_SIZE = 100;
const like = (value: string) => value ? `%${value.replace(/[\\%_]/g, "\\$&")}%` : null;

/**
 * Public READ-ONLY projection of canonical results. This never imports, creates,
 * merges, claims, verifies or changes the visibility of an athlete or result.
 * Both result and athlete publication are required; owner opt-outs win.
 * Deliberately separate from the staff-only ingestion archive and from the
 * specialist event catalogue API aliases. AthRecs athlete results span sports.
 */
export const listPublicResultEditions = createServerFn({ method: "GET" })
  .validator(normalizeResultsSearch)
  .handler(async ({ data }) => {
    if (IS_RUNRECS_SITE) return { editions: [] as PublicResultEdition[], hasMore: false };
    await ensureAthrecsSeeded();
    const sql = getSql();
    const q = like(data.q);
    const sport = data.sport || null;
    const distance = data.distance || null;
    const from = data.year ? `${data.year}-01-01` : null;
    const until = data.year ? `${Number(data.year) + 1}-01-01` : null;
    const offset = (data.page - 1) * EDITION_PAGE_SIZE;
    const rows = await sql<PublicResultEdition>`
      select ed.id as edition_id, e.name as event_name,
        ed.event_date::text as event_date, e.sport, ed.distance_code,
        e.city, e.country, count(r.id)::int as result_count
      from results r
      join athletes a on a.id = r.athlete_id
      join editions ed on ed.id = r.edition_id
      join events e on e.id = ed.event_id
      where ed.event_date <= ${todayIso()}::date
        and (r.result_visibility in ('public', 'public_figure') or a.profile_type = 'Public figure')
        and (a.profile_visibility = 'public' or a.profile_type = 'Public figure')
        and not exists (
          select 1 from athlete_account_links l
          join athlete_public_shares s on s.user_id = l.user_id
          where l.athlete_id = a.id and l.status = 'active'
            and (s.enabled = false or s.share_results = false)
        )
        and not exists (
          select 1 from athlete_profile_hidden_results h
          join athlete_account_links l on l.user_id = h.user_id and l.status = 'active'
          where l.athlete_id = a.id and h.result_id = r.id
        )
        and (${q}::text is null or e.name ilike ${q} or e.city ilike ${q} or e.country ilike ${q})
        and (${sport}::text is null or e.sport = ${sport})
        and (${distance}::text is null or ed.distance_code = ${distance})
        and (${from}::date is null or ed.event_date >= ${from}::date)
        and (${until}::date is null or ed.event_date < ${until}::date)
      group by ed.id, e.id
      order by ed.event_date desc, ed.id desc
      limit ${EDITION_PAGE_SIZE + 1} offset ${offset}
    `;
    return { editions: rows.slice(0, EDITION_PAGE_SIZE), hasMore: rows.length > EDITION_PAGE_SIZE };
  });

export const getPublicRaceResults = createServerFn({ method: "GET" })
  .validator((input: { editionId: unknown; q?: unknown; page?: unknown }) => ({
    editionId: parseResultsEditionId(input?.editionId),
    ...normalizeResultsSearch(input),
  }))
  .handler(async ({ data }) => {
    if (IS_RUNRECS_SITE) return null;
    await ensureAthrecsSeeded();
    const sql = getSql();
    const editions = await sql<PublicResultEdition>`
      select ed.id as edition_id, e.name as event_name,
        ed.event_date::text as event_date, e.sport, ed.distance_code,
        e.city, e.country, count(r.id)::int as result_count
      from results r
      join athletes a on a.id = r.athlete_id
      join editions ed on ed.id = r.edition_id
      join events e on e.id = ed.event_id
      where ed.id = ${data.editionId} and ed.event_date <= ${todayIso()}::date
        and (r.result_visibility in ('public', 'public_figure') or a.profile_type = 'Public figure')
        and (a.profile_visibility = 'public' or a.profile_type = 'Public figure')
        and not exists (
          select 1 from athlete_account_links l
          join athlete_public_shares s on s.user_id = l.user_id
          where l.athlete_id = a.id and l.status = 'active'
            and (s.enabled = false or s.share_results = false)
        )
        and not exists (
          select 1 from athlete_profile_hidden_results h
          join athlete_account_links l on l.user_id = h.user_id and l.status = 'active'
          where l.athlete_id = a.id and h.result_id = r.id
        )
      group by ed.id, e.id
    `;
    const edition = editions[0];
    if (!edition) return null;
    const q = like(data.q);
    const offset = (data.page - 1) * RESULT_PAGE_SIZE;
    const rows = await sql<PublicRaceResult>`
      select r.id, a.display_name as athlete_name, a.slug as athlete_slug,
        c.name as profile_club, r.overall_place, r.gender_place, r.category_place,
        r.category, r.status, r.finish_time_seconds, r.chip_time_seconds, r.gun_time_seconds,
        (lower(trim(r.status)) in ('dq', 'dsq', 'disqualified')
          or coalesce(r.result_details->'disqualification', 'null'::jsonb) <> 'null'::jsonb) as disqualified
      from results r
      join athletes a on a.id = r.athlete_id
      left join clubs c on c.id = a.club_id
      where r.edition_id = ${data.editionId}
        and (r.result_visibility in ('public', 'public_figure') or a.profile_type = 'Public figure')
        and (a.profile_visibility = 'public' or a.profile_type = 'Public figure')
        and not exists (
          select 1 from athlete_account_links l
          join athlete_public_shares s on s.user_id = l.user_id
          where l.athlete_id = a.id and l.status = 'active'
            and (s.enabled = false or s.share_results = false)
        )
        and not exists (
          select 1 from athlete_profile_hidden_results h
          join athlete_account_links l on l.user_id = h.user_id and l.status = 'active'
          where l.athlete_id = a.id and h.result_id = r.id
        )
        and (${q}::text is null or a.display_name ilike ${q} or c.name ilike ${q} or r.category ilike ${q})
      order by disqualified asc,
        (lower(trim(r.status)) in ('finished', 'fin')) desc,
        r.overall_place asc nulls last, r.gun_time_seconds asc nulls last,
        r.finish_time_seconds asc nulls last, r.id asc
      limit ${RESULT_PAGE_SIZE + 1} offset ${offset}
    `;
    return { edition, results: rows.slice(0, RESULT_PAGE_SIZE), hasMore: rows.length > RESULT_PAGE_SIZE };
  });
