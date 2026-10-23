import type { Sql } from "../db";
import { pruneClientLogins } from "../auth/client-login.server";
import { pruneAccessEvents } from "../auth/access-diagnostics.server";
import { clientLocation } from "./client-data";
import { diagnosticDevice, type AccessEvent, type AccessFilters } from "./access-diagnostics";

const loginRows = `select 'login-'||l.id::text as id,l.signed_in_at as at,l.user_id,null::text as attempted_email,
  'sign_in'::text as kind,'success'::text as outcome,null::text as error_code,l.request_id,l.host,l.route,
  l.sign_in_method,l.user_agent,l.country_code,l.region,l.city,l.duration_ms,l.http_status,l.release_id,
  l.device_id::text as device_number,l.captured_from='existing_session' as recovered,'server'::text as source,
  null::boolean as online,null::text as viewport,s."expiresAt" as expires_at
  from athlete_client_logins l left join session s on s.id=l.session_id`;
const eventRows = `select 'event-'||e.id::text,e.occurred_at,e.user_id,e.attempted_email,e.kind,e.outcome,e.error_code,
  e.request_id,e.host,e.route,e.sign_in_method,e.user_agent,e.country_code,e.region,e.city,e.duration_ms,e.http_status,e.release_id,
  null::text,false,e.source,e.online,e.viewport,null::timestamptz from athlete_access_events e`;
// Same broad categories as describeClientDevice, evaluated in SQL before pagination.
const deviceSql = `case when user_agent ~* 'bot|crawler|spider|headless|curl/' then 'Automated client'
  when user_agent ~* 'iPad|Tablet|Android(?!.*Mobile)' then 'Tablet'
  when user_agent ~* 'iPhone|iPod|Android.*Mobile|Windows Phone|Mobile' then 'Mobile phone'
  when user_agent ~* 'Windows NT|Macintosh|X11|CrOS|Linux' then 'Desktop / laptop' else 'Unknown' end`;
const browserSql = `case when user_agent ~* 'Edg(e|A|iOS)?/' then 'Edge' when user_agent ~* 'OPR/|Opera' then 'Opera'
  when user_agent ~* 'SamsungBrowser/' then 'Samsung Internet' when user_agent ~* 'Firefox/|FxiOS/' then 'Firefox'
  when user_agent ~* 'Chrome/|CriOS/' then 'Chrome' when user_agent ~* 'Safari/' then 'Safari' else 'Unknown' end`;

export async function loadAccessLog(sql: Sql, filters: AccessFilters) {
  await pruneClientLogins(sql);
  await pruneAccessEvents(sql);
  const sessions = filters.view === "sessions";
  const params = [
    filters.days,
    filters.outcome,
    filters.q,
    `%${filters.q.replace(/[\\%_]/g, "\\$&")}%`,
    filters.device,
    filters.browser,
  ];
  const cte = `with raw as (${loginRows}${sessions ? ' where s."expiresAt">now()' : " union all " + eventRows}),
    labelled as (select r.*,coalesce(nullif(p.full_name,''),nullif(u.name,''),'Name not supplied') as name,
      coalesce(u.email,r.attempted_email) as email,${deviceSql} as device,${browserSql} as browser
      from raw r left join "user" u on u.id=r.user_id left join athlete_private_profiles p on p.user_id=u.id),
    filtered as (select * from labelled where ${sessions ? "$1::int>0 and $2::text is not null" : "at>=now()-($1::int*interval '1 day') and ($2='all' or outcome=$2)"}
      and ($3='' or name ilike $4 or email ilike $4 or error_code ilike $4 or request_id ilike $4 or route ilike $4 or host ilike $4)
      and ($5='' or device=$5) and ($6='' or browser=$6))`;
  return sql.transaction(async (tx) => {
    await tx.query("set transaction isolation level repeatable read, read only");
    const [summary] = await tx.query<{
      total: number;
      successful: number;
      failed: number;
      errors: number;
      p95: number | null;
    }>(
      `${cte}
      select count(*)::int as total,count(*) filter(where outcome='success')::int as successful,
      count(*) filter(where outcome='failed')::int as failed,count(*) filter(where outcome='error')::int as errors,
      round((percentile_cont(0.95) within group(order by duration_ms))::numeric)::int as p95 from filtered`,
      params,
    );
    const pageSize = 25,
      page = Math.min(filters.page, Math.max(1, Math.ceil(summary.total / pageSize)));
    const rows = await tx.query<Record<string, unknown>>(
      `${cte} select id,at::text,name,email,user_id,kind,outcome,error_code,request_id,host,route,sign_in_method,user_agent,country_code,region,city,duration_ms,http_status,release_id,device_number,recovered,source,online,viewport,expires_at::text from filtered order by at desc,id desc limit $7 offset $8`,
      [...params, pageSize, (page - 1) * pageSize],
    );
    const issues = await tx.query<{
      code: string;
      route: string;
      browser: string;
      device: string;
      count: number;
    }>(
      `${cte}
      select error_code as code,route,browser,device,count(*)::int as count from filtered
      where outcome in ('failed','error') group by error_code,route,browser,device order by count(*) desc,error_code limit 8`,
      params,
    );
    const [tracking] = await tx<{
      startedAt: string;
    }>`select started_at::text as "startedAt" from athlete_access_tracking where singleton`;
    const events: AccessEvent[] = rows.map((r) => ({
      id: String(r.id),
      at: String(r.at),
      name: String(r.name),
      email: r.email as string | null,
      identity: r.user_id ? "account" : r.email ? "entered" : "anonymous",
      kind: String(r.kind),
      outcome: String(r.outcome),
      errorCode: r.error_code as string | null,
      requestId: r.request_id as string | null,
      host: r.host as string | null,
      route: r.route as string | null,
      method: r.sign_in_method as string | null,
      location: clientLocation(
        r.country_code as string | null,
        r.region as string | null,
        r.city as string | null,
      ),
      durationMs: r.duration_ms as number | null,
      httpStatus: r.http_status as number | null,
      releaseId: r.release_id as string | null,
      deviceNumber: r.device_number as string | null,
      recovered: Boolean(r.recovered),
      source: String(r.source),
      online: r.online as boolean | null,
      viewport: r.viewport as string | null,
      expiresAt: r.expires_at as string | null,
      ...diagnosticDevice(r.user_agent as string),
    }));
    return { events, summary, issues, page, pageSize, startedAt: tracking.startedAt };
  });
}
