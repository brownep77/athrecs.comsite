import type { Sql } from "../db";
import type { GrowthDay, GrowthReport } from "./core";

// Daily counts on London days, newest first. Test and synthetic records are excluded.
export const GROWTH_SQL = `with lo as (select ((((now() at time zone 'Europe/London')::date-($1::int-1))::timestamp) at time zone 'Europe/London') t),
days as (select g::date dy from generate_series((now() at time zone 'Europe/London')::date-($1::int-1),(now() at time zone 'Europe/London')::date,'1 day') g),
f as (select (d.stats_created_at at time zone 'Europe/London')::date dy,count(*) n from editions d,lo where d.stats_created_at>=lo.t group by 1),
r as (select (x.stats_created_at at time zone 'Europe/London')::date dy,count(*) n from results x,lo where x.stats_created_at>=lo.t and coalesce(x.result_details->>'syntheticTest','false')<>'true' group by 1),
p as (select (a.created_at at time zone 'Europe/London')::date dy,count(*) n from athletes a,lo where a.created_at>=lo.t and not exists(select 1 from athrecs_test_athletes t where t.athlete_id=a.id) and coalesce(a.profile_details->>'syntheticTest','false')<>'true' group by 1),
s as (select (u."createdAt" at time zone 'Europe/London')::date dy,count(*) n from "user" u,lo where u."createdAt">=lo.t group by 1),
c as (select (x.submitted_at at time zone 'Europe/London')::date dy,count(*) n from result_claims x,lo where x.submitted_at>=lo.t group by 1),
sr as (select dy,count(*) n from (select (created_at at time zone 'Europe/London')::date dy from athlete_profile_setup_requests,lo where created_at>=lo.t
  union all select (created_at at time zone 'Europe/London')::date from result_archive_match_requests,lo where created_at>=lo.t) q group by 1),
pa as (select dy,count(*) n from (select (created_at at time zone 'Europe/London')::date dy from partner_brands,lo where created_at>=lo.t and not coalesce(synthetic_test,false)
  union all select (created_at at time zone 'Europe/London')::date from partner_applications,lo where created_at>=lo.t) q group by 1),
ir as (select (x.created_at at time zone 'Europe/London')::date dy,count(*) n from race_collector_candidates x,lo where x.created_at>=lo.t and x.status in ('held','review','duplicate') group by 1)
select dy::text as day, coalesce(f.n,0)::int fixtures, coalesce(r.n,0)::int results, coalesce(p.n,0)::int profiles,
 coalesce(s.n,0)::int signups, coalesce(c.n,0)::int claims, coalesce(sr.n,0)::int "selfReferrals",
 coalesce(pa.n,0)::int partners, coalesce(ir.n,0)::int "importRejections"
from days left join f using(dy) left join r using(dy) left join p using(dy) left join s using(dy)
 left join c using(dy) left join sr using(dy) left join pa using(dy) left join ir using(dy) order by dy desc`;

export async function readGrowth(sql: Sql, days = 30): Promise<GrowthReport> {
  const rows = (await sql.query(GROWTH_SQL, [days])) as GrowthDay[];
  return { generatedAt: new Date().toISOString(), days: rows };
}
