import type { Sql } from "@/lib/db";

export type SignupBucket = { date: string; signups: number; total: number };

/** Calendar buckets are UK local dates, including 23/25-hour DST days. */
export async function loadRegistrationStats(sql: Sql, selectedMonth: string) {
  const [period] = await sql<{ month: string }>`select
    coalesce(nullif(${selectedMonth},''),to_char(now() at time zone 'Europe/London','YYYY-MM')) as month`;
  const monthStart = `${period.month}-01`;
  const yearStart = `${period.month.slice(0, 4)}-01-01`;
  const daily = await sql<SignupBucket>`with days as (
    select generate_series(${monthStart}::date::timestamp,
      ${monthStart}::date + interval '1 month' - interval '1 day',interval '1 day') as day
  ), counts as (
    select ("createdAt" at time zone 'Europe/London')::date as day,count(*)::int as signups
    from "user" where "createdAt">=(${monthStart}::date::timestamp at time zone 'Europe/London')
      and "createdAt"<((${monthStart}::date + interval '1 month') at time zone 'Europe/London')
    group by 1
  ) select days.day::date::text as date,coalesce(counts.signups,0)::int as signups,
    ((select count(*) from "user" where "createdAt"<(${monthStart}::date::timestamp at time zone 'Europe/London'))
      + sum(coalesce(counts.signups,0)) over(order by days.day))::int as total
    from days left join counts on counts.day=days.day order by days.day`;
  const monthly = await sql<SignupBucket>`with months as (
    select generate_series(${yearStart}::date::timestamp,
      ${yearStart}::date + interval '11 months',interval '1 month') as month
  ), counts as (
    select date_trunc('month',"createdAt" at time zone 'Europe/London') as month,count(*)::int as signups
    from "user" where "createdAt">=(${yearStart}::date::timestamp at time zone 'Europe/London')
      and "createdAt"<((${yearStart}::date + interval '1 year') at time zone 'Europe/London')
    group by 1
  ) select months.month::date::text as date,coalesce(counts.signups,0)::int as signups,
    ((select count(*) from "user" where "createdAt"<(${yearStart}::date::timestamp at time zone 'Europe/London'))
      + sum(coalesce(counts.signups,0)) over(order by months.month))::int as total
    from months left join counts on counts.month=months.month order by months.month`;
  return { month: period.month, daily, monthly, timeZone: "Europe/London" };
}
