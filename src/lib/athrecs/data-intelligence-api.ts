import { createHash } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { COUNTRY_SITES } from "./country-sites";
import { ensureAthrecsSeeded } from "./seed.server";

const ANALYTICS_CONSENT_VERSION = "2026-08";

type AnalyticsEventName =
  | "page_view"
  | "event_view"
  | "athlete_view"
  | "entry_click"
  | "results_view"
  | "search"
  | "filter_apply";

type AnalyticsEntityType = "event" | "athlete" | "club";
type DeviceClass = "desktop" | "mobile" | "tablet" | "other";

type CountRow = { label: string; count: number };

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function asNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanHeader(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value).trim().slice(0, maxLength) || null;
  } catch {
    return value.trim().slice(0, maxLength) || null;
  }
}

function normalisePath(value: string): string | null {
  const path = value.trim().split(/[?#]/, 1)[0];
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return null;
  return path.slice(0, 300);
}

function normaliseReferrerDomain(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return (
      url.hostname
        .toLowerCase()
        .replace(/^www\./, "")
        .slice(0, 160) || null
    );
  } catch {
    return null;
  }
}

function hashSessionId(sessionId: string): string {
  const salt = process.env.ATHRECS_ANALYTICS_SALT?.trim() || "athrecs-first-party-analytics";
  return createHash("sha256").update(`${salt}:${sessionId}`).digest("hex");
}

function deriveEntity(path: string): {
  entityType: AnalyticsEntityType | null;
  entitySlug: string | null;
  eventName: AnalyticsEventName;
} {
  const parts = path.split("/").filter(Boolean);
  const athleteIndex = parts.indexOf("athletes");
  if (athleteIndex >= 0 && parts[athleteIndex + 1]) {
    return {
      entityType: "athlete",
      entitySlug: parts[athleteIndex + 1].slice(0, 160),
      eventName: "athlete_view",
    };
  }
  const eventIndex = parts.indexOf("races");
  if (eventIndex >= 0 && parts[eventIndex + 1]) {
    return {
      entityType: "event",
      entitySlug: parts[eventIndex + 1].slice(0, 160),
      eventName: "event_view",
    };
  }
  const clubIndex = parts.indexOf("clubs");
  if (clubIndex >= 0 && parts[clubIndex + 1]) {
    return {
      entityType: "club",
      entitySlug: parts[clubIndex + 1].slice(0, 160),
      eventName: "page_view",
    };
  }
  return { entityType: null, entitySlug: null, eventName: "page_view" };
}

/**
 * Anonymous, consent-gated first-party analytics. No IP address, full referrer,
 * query string or raw browser identifier is retained.
 */
export const recordSiteAnalyticsEvent = createServerFn({ method: "POST" })
  .validator(
    (input: {
      path: string;
      sessionId: string;
      consentVersion: string;
      deviceClass?: DeviceClass;
      referrerDomain?: string;
      eventName?: AnalyticsEventName;
      entityType?: AnalyticsEntityType;
      entitySlug?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    if (data.consentVersion !== ANALYTICS_CONSENT_VERSION) return { accepted: false };
    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(data.sessionId)) return { accepted: false };
    const path = normalisePath(data.path);
    if (!path) return { accepted: false };

    const derived = deriveEntity(path);
    const eventName = data.eventName ?? derived.eventName;
    const entityType = data.entityType ?? derived.entityType;
    const entitySlug = (data.entitySlug ?? derived.entitySlug)?.trim().slice(0, 160) || null;
    const deviceClass: DeviceClass = data.deviceClass ?? "other";
    const referrerDomain = normaliseReferrerDomain(data.referrerDomain);
    const request = getRequest();
    const sessionHash = hashSessionId(data.sessionId);

    const sql = await ready();
    await sql`
      insert into site_analytics_events (
        event_name, path, entity_type, entity_slug, session_hash,
        referrer_domain, device_class, country_code, region, city,
        consent_version
      ) values (
        ${eventName}, ${path}, ${entityType}, ${entitySlug}, ${sessionHash},
        ${referrerDomain}, ${deviceClass},
        ${cleanHeader(request?.headers.get("x-vercel-ip-country") ?? null, 2)},
        ${cleanHeader(request?.headers.get("x-vercel-ip-country-region") ?? null, 120)},
        ${cleanHeader(request?.headers.get("x-vercel-ip-city") ?? null, 120)},
        ${ANALYTICS_CONSENT_VERSION}
      )
    `;
    return { accepted: true };
  });

/** Remove this anonymous browser session's events when analytics consent is withdrawn. */
export const withdrawSiteAnalyticsConsent = createServerFn({ method: "POST" })
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(data.sessionId)) return { deleted: 0 };
    const sql = await ready();
    const rows = await sql<{ id: number }>`
      delete from site_analytics_events
      where session_hash = ${hashSessionId(data.sessionId)}
      returning id
    `;
    return { deleted: rows.length };
  });

export async function buildDataIntelligenceDashboard(sql: Awaited<ReturnType<typeof getSql>>) {
  const [
    overviewRows,
    qualityRows,
    qualityExamples,
    countryRows,
    regionRows,
    cityRows,
    postcodeRows,
    sportRows,
    distanceRows,
    siteDailyRows,
    topPageRows,
    athleteRows,
    athleteFrequencyRows,
    athleteDistanceRows,
    habitRows,
    habitDistanceRows,
  ] = await Promise.all([
    sql<{
      events: number;
      editions: number;
      upcoming_editions: number;
      countries: number;
      regions: number;
      cities: number;
      postcodes: number;
      athletes: number;
      results: number;
      page_views_30d: number;
      sessions_30d: number;
    }>`select
        (select count(*)::int from events) as events,
        (select count(*)::int from editions) as editions,
        (select count(*)::int from editions where event_date >= current_date) as upcoming_editions,
        (select count(distinct nullif(trim(country), ''))::int from events) as countries,
        (select count(distinct coalesce(nullif(trim(region), ''), nullif(trim(county), '')))::int from events) as regions,
        (select count(distinct nullif(trim(city), ''))::int from events) as cities,
        (select count(distinct nullif(trim(postcode), ''))::int from events) as postcodes,
        (select count(*)::int from athletes) as athletes,
        (select count(*)::int from results) as results,
        (select count(*)::int from site_analytics_events where occurred_at >= now() - interval '30 days') as page_views_30d,
        (select count(distinct session_hash)::int from site_analytics_events where occurred_at >= now() - interval '30 days') as sessions_30d`,
    sql<{
      issue_code: string;
      label: string;
      severity: "critical" | "warning" | "info";
      count: number;
    }>`with issue_counts as (
        select 'missing_source'::text as issue_code, 'Events missing a source URL'::text as label,
          'critical'::text as severity,
          count(*)::int as count
        from events where nullif(trim(coalesce(source_url, '')), '') is null
        union all
        select 'missing_city', 'Events missing a city', 'warning', count(*)::int
        from events where nullif(trim(city), '') is null
        union all
        select 'missing_region', 'Events missing a region', 'warning', count(*)::int
        from events where nullif(trim(coalesce(region, '')), '') is null
        union all
        select 'missing_postcode', 'Events missing a postcode', 'warning', count(*)::int
        from events where nullif(trim(coalesce(postcode, '')), '') is null
        union all
        select 'missing_coordinates', 'Events missing map coordinates', 'info', count(*)::int
        from events where latitude is null or longitude is null
        union all
        select 'unverified_event', 'Events never data-verified', 'warning', count(*)::int
        from events where data_verified_at is null
        union all
        select 'no_upcoming_edition', 'Events with no upcoming edition', 'info', count(*)::int
        from events e where not exists (
          select 1 from editions ed where ed.event_id = e.id and ed.event_date >= current_date
        )
        union all
        select 'missing_entry', 'Upcoming editions missing an entry route', 'critical', count(*)::int
        from editions ed
        where ed.event_date >= current_date
          and nullif(trim(coalesce(ed.entry_url, '')), '') is null
          and not exists (
            select 1 from edition_entry_options option
            where option.edition_id = ed.id and option.status in ('open', 'closing_soon', 'ballot', 'waitlist')
          )
        union all
        select 'unverified_entry', 'Upcoming entry routes not verified', 'warning', count(*)::int
        from edition_entry_options option
        join editions ed on ed.id = option.edition_id
        where ed.event_date >= current_date and option.is_verified = false
        union all
        select 'missing_results_link', 'Past editions missing a results link', 'info', count(*)::int
        from editions ed
        where ed.event_date < current_date
          and not exists (select 1 from results r where r.edition_id = ed.id)
          and not exists (
            select 1 from edition_result_links link
            where link.edition_id = ed.id and link.status = 'approved'
          )
        union all
        select 'potential_duplicate', 'Potential duplicate event records', 'critical',
          coalesce(sum(duplicate_count - 1), 0)::int
        from (
          select count(*)::int as duplicate_count
          from events
          group by lower(trim(name)), lower(trim(country)), lower(trim(city))
          having count(*) > 1
        ) duplicates
      )
      select issue_code, label, severity, count
      from issue_counts
      where count > 0
      order by case severity when 'critical' then 0 when 'warning' then 1 else 2 end, count desc`,
    sql<{
      issue_code: string;
      severity: "critical" | "warning" | "info";
      event_slug: string;
      event_name: string;
      country: string;
      city: string;
      detail: string;
    }>`with issues as (
        select 'missing_source'::text as issue_code, 'critical'::text as severity,
          slug as event_slug, name as event_name, country, city,
          'No provenance URL is recorded'::text as detail
        from events where nullif(trim(coalesce(source_url, '')), '') is null
        union all
        select 'missing_city', 'warning', slug, name, country, city, 'City is blank'
        from events where nullif(trim(city), '') is null
        union all
        select 'missing_region', 'warning', slug, name, country, city, 'Region is blank'
        from events where nullif(trim(coalesce(region, '')), '') is null
        union all
        select 'missing_postcode', 'warning', slug, name, country, city, 'Postcode is blank'
        from events where nullif(trim(coalesce(postcode, '')), '') is null
        union all
        select 'missing_coordinates', 'info', slug, name, country, city, 'Latitude or longitude is blank'
        from events where latitude is null or longitude is null
        union all
        select 'no_upcoming_edition', 'info', e.slug, e.name, e.country, e.city,
          'No future edition is recorded'
        from events e where not exists (
          select 1 from editions ed where ed.event_id = e.id and ed.event_date >= current_date
        )
      )
      select issue_code, severity, event_slug, event_name, country, city, detail
      from issues
      order by case severity when 'critical' then 0 when 'warning' then 1 else 2 end,
        event_name
      limit 50`,
    sql<{
      label: string;
      count: number;
      upcoming: number;
      missing_location: number;
      missing_entry: number;
    }>`select
        coalesce(nullif(trim(e.country), ''), 'Unknown') as label,
        count(distinct e.id)::int as count,
        count(distinct ed.id) filter (where ed.event_date >= current_date)::int as upcoming,
        count(distinct e.id) filter (
          where nullif(trim(e.city), '') is null
            or nullif(trim(coalesce(e.region, '')), '') is null
            or nullif(trim(coalesce(e.postcode, '')), '') is null
        )::int as missing_location,
        count(distinct ed.id) filter (
          where ed.event_date >= current_date
            and nullif(trim(coalesce(ed.entry_url, '')), '') is null
            and not exists (
              select 1 from edition_entry_options option
              where option.edition_id = ed.id
                and option.status in ('open', 'closing_soon', 'ballot', 'waitlist')
            )
        )::int as missing_entry
      from events e
      left join editions ed on ed.event_id = e.id
      group by coalesce(nullif(trim(e.country), ''), 'Unknown')
      order by count desc, label
      limit 100`,
    sql<CountRow>`select
        coalesce(nullif(trim(region), ''), nullif(trim(county), ''), 'Unknown') as label,
        count(*)::int as count
      from events
      group by coalesce(nullif(trim(region), ''), nullif(trim(county), ''), 'Unknown')
      order by count desc, label
      limit 100`,
    sql<CountRow>`select coalesce(nullif(trim(city), ''), 'Unknown') as label, count(*)::int as count
      from events group by coalesce(nullif(trim(city), ''), 'Unknown')
      order by count desc, label limit 100`,
    sql<CountRow>`select coalesce(nullif(trim(postcode), ''), 'Unknown') as label, count(*)::int as count
      from events group by coalesce(nullif(trim(postcode), ''), 'Unknown')
      order by count desc, label limit 100`,
    sql<CountRow>`select sport as label, count(*)::int as count
      from events group by sport order by count desc, label`,
    sql<CountRow>`select distance_code as label, count(distinct event_id)::int as count
      from event_distances group by distance_code order by count desc, label limit 30`,
    sql<{ date: string; views: number; sessions: number }>`with days as (
        select generate_series(current_date - interval '29 days', current_date, interval '1 day')::date as day
      ), totals as (
        select occurred_at::date as day, count(*)::int as views,
          count(distinct session_hash)::int as sessions
        from site_analytics_events
        where occurred_at >= current_date - interval '29 days'
        group by occurred_at::date
      )
      select days.day::text as date, coalesce(totals.views, 0)::int as views,
        coalesce(totals.sessions, 0)::int as sessions
      from days left join totals using (day) order by days.day`,
    sql<{ path: string; views: number; sessions: number }>`select path, count(*)::int as views,
        count(distinct session_hash)::int as sessions
      from site_analytics_events
      where occurred_at >= now() - interval '30 days'
      group by path order by views desc, path limit 15`,
    sql<{
      active_athletes: number;
      one_result: number;
      repeat_athletes: number;
      avg_results: number;
      profiled_athletes: number;
    }>`with athlete_result_counts as (
        select athlete_id, count(*)::int as result_count from results group by athlete_id
      )
      select
        count(*)::int as active_athletes,
        count(*) filter (where result_count = 1)::int as one_result,
        count(*) filter (where result_count > 1)::int as repeat_athletes,
        coalesce(round(avg(result_count)::numeric, 1), 0)::double precision as avg_results,
        (select count(*)::int from athletes where nullif(trim(coalesce(preferred_distance, '')), '') is not null) as profiled_athletes
      from athlete_result_counts`,
    sql<CountRow>`with athlete_result_counts as (
        select athlete_id, count(*)::int as result_count from results group by athlete_id
      )
      select case
        when result_count = 1 then '1 race'
        when result_count between 2 and 3 then '2–3 races'
        when result_count between 4 and 9 then '4–9 races'
        else '10+ races'
      end as label, count(*)::int as count
      from athlete_result_counts
      group by 1
      order by min(result_count)`,
    sql<CountRow>`select ed.distance_code as label, count(distinct r.athlete_id)::int as count
      from results r join editions ed on ed.id = r.edition_id
      group by ed.distance_code order by count desc, label limit 20`,
    sql<{
      responses: number;
      avg_training_days: number;
      avg_weekly_km: number;
      avg_races_per_year: number;
    }>`select
        count(*)::int as responses,
        coalesce(round(avg(h.training_days_per_week)::numeric, 1), 0)::double precision as avg_training_days,
        coalesce(round(avg(h.weekly_distance_km)::numeric, 1), 0)::double precision as avg_weekly_km,
        coalesce(round(avg(h.races_per_year)::numeric, 1), 0)::double precision as avg_races_per_year
      from athlete_habit_profiles h
      join athlete_data_consents consent on consent.athlete_id = h.athlete_id
        and consent.purpose = 'performance_insights'
        and consent.status = 'granted'`,
    sql<CountRow>`select preference.value as label, count(*)::int as count
      from athlete_habit_profiles h
      join athlete_data_consents consent on consent.athlete_id = h.athlete_id
        and consent.purpose = 'performance_insights'
        and consent.status = 'granted'
      cross join lateral jsonb_array_elements_text(h.preferred_distances) preference(value)
      group by preference.value order by count desc, label limit 20`,
  ]);

  const overview = overviewRows[0] ?? {
    events: 0,
    editions: 0,
    upcoming_editions: 0,
    countries: 0,
    regions: 0,
    cities: 0,
    postcodes: 0,
    athletes: 0,
    results: 0,
    page_views_30d: 0,
    sessions_30d: 0,
  };
  const severityTotals = qualityRows.reduce(
    (totals, issue) => {
      totals[issue.severity] += asNumber(issue.count);
      return totals;
    },
    { critical: 0, warning: 0, info: 0 },
  );
  const eventChecks = asNumber(overview.events) * 7;
  const editionChecks = asNumber(overview.upcoming_editions) * 2;
  const weightedIssues =
    severityTotals.critical * 1.5 + severityTotals.warning + severityTotals.info * 0.35;
  const qualityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round((1 - weightedIssues / Math.max(eventChecks + editionChecks, 1)) * 100),
    ),
  );
  const athlete = athleteRows[0];
  const habits = habitRows[0];
  const representedCountries = new Set(countryRows.map((row) => row.label.trim().toLowerCase()));
  const hasUnitedKingdom = [
    "united kingdom",
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ].some((country) => representedCountries.has(country));
  const missingCountries = COUNTRY_SITES.filter((site) => {
    if (site.country === "United Kingdom") return !hasUnitedKingdom;
    return !representedCountries.has(site.country.toLowerCase());
  }).map((site) => ({ country: site.country, flag: site.flag, iso: site.iso }));

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      events: asNumber(overview.events),
      editions: asNumber(overview.editions),
      upcomingEditions: asNumber(overview.upcoming_editions),
      countries: asNumber(overview.countries),
      regions: asNumber(overview.regions),
      cities: asNumber(overview.cities),
      postcodes: asNumber(overview.postcodes),
      athletes: asNumber(overview.athletes),
      results: asNumber(overview.results),
      pageViews30d: asNumber(overview.page_views_30d),
      sessions30d: asNumber(overview.sessions_30d),
      qualityScore,
    },
    quality: {
      totals: severityTotals,
      issues: qualityRows.map((row) => ({ ...row, count: asNumber(row.count) })),
      examples: qualityExamples,
    },
    geography: {
      countries: countryRows.map((row) => ({
        ...row,
        count: asNumber(row.count),
        upcoming: asNumber(row.upcoming),
        missingLocation: asNumber(row.missing_location),
        missingEntry: asNumber(row.missing_entry),
      })),
      regions: regionRows.map((row) => ({ ...row, count: asNumber(row.count) })),
      cities: cityRows.map((row) => ({ ...row, count: asNumber(row.count) })),
      postcodes: postcodeRows.map((row) => ({ ...row, count: asNumber(row.count) })),
      missingCountries,
    },
    catalogue: {
      sports: sportRows.map((row) => ({ ...row, count: asNumber(row.count) })),
      distances: distanceRows.map((row) => ({ ...row, count: asNumber(row.count) })),
    },
    site: {
      daily: siteDailyRows.map((row) => ({
        date: row.date,
        views: asNumber(row.views),
        sessions: asNumber(row.sessions),
      })),
      topPages: topPageRows.map((row) => ({
        path: row.path,
        views: asNumber(row.views),
        sessions: asNumber(row.sessions),
      })),
    },
    athletes: {
      activeAthletes: asNumber(athlete?.active_athletes),
      oneResult: asNumber(athlete?.one_result),
      repeatAthletes: asNumber(athlete?.repeat_athletes),
      averageResults: asNumber(athlete?.avg_results),
      profiledAthletes: asNumber(athlete?.profiled_athletes),
      frequency: athleteFrequencyRows.map((row) => ({ ...row, count: asNumber(row.count) })),
      distances: athleteDistanceRows.map((row) => ({ ...row, count: asNumber(row.count) })),
      habits: {
        responses: asNumber(habits?.responses),
        averageTrainingDays: asNumber(habits?.avg_training_days),
        averageWeeklyKm: asNumber(habits?.avg_weekly_km),
        averageRacesPerYear: asNumber(habits?.avg_races_per_year),
        preferredDistances: habitDistanceRows.map((row) => ({
          ...row,
          count: asNumber(row.count),
        })),
      },
    },
  };
}

export const getDataIntelligenceDashboard = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => buildDataIntelligenceDashboard(await ready()));

export { ANALYTICS_CONSENT_VERSION };
