import type { Sql } from "../db";
import { pruneClientLogins } from "../auth/client-login.server";
import {
  clientLocation,
  describeClientDevice,
  providerLabel,
  type ClientDataItem,
  type ClientLogin,
} from "./client-data";

type LoginRow = {
  id: string;
  signed_in_at: string;
  device_id: string | null;
  sign_in_method: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  user_agent: string;
  captured_from: string;
};
function loginItem(row: LoginRow): ClientLogin {
  return {
    id: String(row.id),
    signedInAt: row.signed_in_at,
    deviceNumber: row.device_id ? String(row.device_id) : null,
    signInMethod: row.sign_in_method,
    location: clientLocation(row.country_code, row.region, row.city),
    existingSession: row.captured_from === "existing_session",
    ...describeClientDevice(row.user_agent),
  };
}

export async function loadClientData(
  sql: Sql,
  filters: { q: string; page: number; sort: "newest" | "recent" | "logins" },
) {
  await pruneClientLogins(sql);
  const pageSize = 25;
  const search = `%${filters.q.replace(/[\\%_]/g, "\\$&")}%`;
  const where = `where ($1='' or u.name ilike $2 or u.email ilike $2 or p.full_name ilike $2)`;
  const from = `from "user" u left join athlete_private_profiles p on p.user_id=u.id
    left join athlete_login_activity a on a.user_id=u.id`;
  const order = {
    newest: 'u."createdAt" desc,u.id',
    recent: "a.last_sign_in_at desc nulls last,u.id",
    logins: "coalesce(a.sign_in_count,0) desc,u.id",
  }[filters.sort];
  return sql.transaction(async (tx) => {
    await tx.query("set transaction isolation level repeatable read, read only");
    const [count] = await tx.query<{ total: number }>(
      `select count(*)::int as total ${from} ${where}`,
      [filters.q, search],
    );
    const page = Math.min(filters.page, Math.max(1, Math.ceil(count.total / pageSize)));
    const rows = await tx.query<
      Omit<ClientDataItem, "latestLogin" | "linkedMethods"> & {
        latest: LoginRow | null;
        providers: string[];
      }
    >(
      `
      select u.id as "userId",coalesce(nullif(p.full_name,''),nullif(u.name,''),'Name not supplied') as name,
      u.email,u."emailVerified" as "emailVerified",u."createdAt"::text as "signedUpAt",
      a.last_sign_in_at::text as "lastSignInAt",coalesce(a.sign_in_count,0)::int as "signInCount",
      (select count(*)::int from athlete_client_devices d where d.user_id=u.id and d.last_seen_at>=now()-interval '90 days') as "recognisedDevices",
      array(select distinct ac."providerId" from account ac where ac."userId"=u.id order by ac."providerId") as providers,
      (select jsonb_build_object('id',l.id::text,'signed_in_at',l.signed_in_at::text,'device_id',l.device_id::text,
        'sign_in_method',l.sign_in_method,'country_code',l.country_code,'region',l.region,'city',l.city,
        'user_agent',l.user_agent,'captured_from',l.captured_from)
        from athlete_client_logins l where l.user_id=u.id and l.signed_in_at>=now()-interval '90 days'
        order by l.signed_in_at desc,l.id desc limit 1) as latest
      ${from} ${where} order by ${order} limit $3 offset $4`,
      [filters.q, search, pageSize, (page - 1) * pageSize],
    );
    const [tracking] = await tx<{ countsSince: string; detailsSince: string }>`select
      (select started_at::text from athlete_login_tracking where singleton) as "countsSince",
      (select started_at::text from athlete_client_tracking where singleton) as "detailsSince"`;
    const clients: ClientDataItem[] = rows.map(({ latest, providers, ...row }) => ({
      ...row,
      linkedMethods: [...new Set(providers.map(providerLabel))],
      latestLogin: latest ? loginItem(latest) : null,
    }));
    return { clients, total: count.total, page, pageSize, ...tracking };
  });
}

export async function loadClientLoginHistory(sql: Sql, userId: string, requestedPage: number) {
  await pruneClientLogins(sql);
  const pageSize = 25;
  return sql.transaction(async (tx) => {
    await tx.query("set transaction isolation level repeatable read, read only");
    const [count] = await tx<{
      total: number;
    }>`select count(*)::int as total from athlete_client_logins
      where user_id=${userId} and signed_in_at>=now()-interval '90 days'`;
    const page = Math.min(requestedPage, Math.max(1, Math.ceil(count.total / pageSize)));
    const rows =
      await tx<LoginRow>`select id::text,signed_in_at::text,device_id::text,sign_in_method,
      country_code,region,city,user_agent,captured_from from athlete_client_logins
      where user_id=${userId} and signed_in_at>=now()-interval '90 days'
      order by signed_in_at desc,id desc limit ${pageSize} offset ${(page - 1) * pageSize}`;
    return { logins: rows.map(loginItem), total: count.total, page, pageSize };
  });
}
