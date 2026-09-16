import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import type { AthleteDirectory } from "./athlete-directory";
import { parseAthleteId } from "./athlete-id";

const inputSchema = z.object({
  q: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  sport: z.string().trim().max(120).optional(),
  page: z.number().int().min(1).max(100000).optional(),
  pageSize: z.number().int().min(1).max(48).optional(),
});

// AthRecs discovery only. Private accounts and unlisted shared profiles are
// deliberately absent from the list, counts and filter choices.
export const getAthleteDirectory = createServerFn({ method: "GET" })
  .validator((input: z.input<typeof inputSchema> | undefined) => inputSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<AthleteDirectory> => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const q = data.q || null;
    const athleteNumber = parseAthleteId(q);
    const country = data.country || null;
    const sport = data.sport || null;
    const pageSize = data.pageSize ?? 24;
    const requestedPage = data.page ?? 1;
    const [directory] = await sql<AthleteDirectory>`
      with public_profiles as materialized (
        select a.id, a.slug, a.display_name, a.city, a.profile_roles,
          identifier.athlete_number::text as athlete_number,
          identifier.source_number::text as source_number,
          case
            when lower(trim(a.country)) in ('england', 'scotland', 'wales', 'northern ireland',
              'united kingdom', 'uk', 'gb', 'gbr', 'great britain') then 'United Kingdom'
            when lower(trim(a.country)) in ('ireland', 'republic of ireland', 'ie', 'irl') then 'Ireland'
            else trim(coalesce(a.country, ''))
          end as country,
          nullif(c.name, 'Unattached') as club,
          records.result_count, records.sports
        from athletes a
        join athlete_resolved_ids identifier on identifier.athlete_id = a.id
        left join clubs c on c.id = a.club_id
        cross join lateral (
          select count(*)::int as result_count,
            coalesce(array_agg(distinct e.sport order by e.sport)
              filter (where nullif(trim(e.sport), '') is not null), array[]::text[]) as sports
          from results r
          join editions ed on ed.id = r.edition_id
          join events e on e.id = ed.event_id
          where r.athlete_id = a.id
            and (a.profile_type = 'Public figure' or r.result_visibility in ('public', 'public_figure'))
            and not exists (select 1 from athlete_profile_hidden_results hidden join athlete_account_links l on l.user_id=hidden.user_id and l.status='active' where l.athlete_id=a.id and hidden.result_id=r.id)
            and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id where l.athlete_id=a.id and l.status='active' and s.share_results=false)
        ) records
        where a.profile_type = 'Public figure' or (a.profile_visibility = 'public' and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id where l.athlete_id=a.id and l.status='active' and s.enabled=false))
      ), filtered as materialized (
        select * from public_profiles
        where (${q}::text is null or position(lower(${q}) in
          lower(concat_ws(' ', display_name, club, city, country, profile_roles))) > 0
          or athlete_number = ${athleteNumber} or source_number = ${athleteNumber})
          and (${country}::text is null or country = ${country})
          and (${sport}::text is null or ${sport} = any(sports))
      ), totals as (
        select count(*)::int as total,
          least(${requestedPage}, greatest(1, ceil(count(*)::numeric / ${pageSize})::int)) as page
        from filtered
      ), paged as (
        select id, slug, display_name, city, profile_roles, athlete_number,
          country, club, result_count, sports
        from filtered order by lower(display_name), id
        limit ${pageSize} offset (select (page - 1) * ${pageSize} from totals)
      )
      select coalesce((select jsonb_agg(paged order by lower(display_name), id) from paged), '[]'::jsonb) as athletes,
        total, page, ${pageSize}::int as "pageSize",
        (select count(*)::int from public_profiles) as "publicAthletes",
        (select coalesce(sum(result_count), 0)::int from public_profiles) as "publicResults",
        array(select distinct country from public_profiles where country <> '' order by country) as countries,
        array(select distinct unnest(sports) as sport from public_profiles order by sport) as sports
      from totals
    `;
    return directory;
  });
