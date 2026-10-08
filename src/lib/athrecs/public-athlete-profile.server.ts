import { getSql } from "@/lib/db";
import { requireUserId } from "@/lib/auth/verify.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { ensureAthrecsSeeded } from "./seed.server";
import { parseAthleteId } from "./athlete-id";
import { publicProfileDetails } from "./profile-details";
import { parseProfileRoles } from "./athlete-profile-roles";
import { readResultDetails } from "./result-details";
import { combineProfileResults } from "./profile-records";
import { loadUpcoming } from "./athlete-upcoming-api";

/** Shared authenticated reader; retains the profile API's publication rules. */
export async function readPublishedAthleteProfile(slug: string, bearerToken?: string) {
  // Authentication remains mandatory for every caller of this shared reader.
  assertSameSiteRequest();
  await requireUserId(bearerToken);
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const athleteNumber = parseAthleteId(slug);
  const rows = await sql<{
    profile_details: unknown;
    date_of_birth: string | null;
    id: number;
    athlete_number: string;
    slug: string;
    display_name: string;
    gender: string;
    city: string | null;
    county: string;
    country: string;
    bio: string;
    profile_type: string;
    profile_roles: string;
    profile_source_checked_at: string | null;
    is_claimed: boolean;
    club: string | null;
    club_slug: string | null;
  }>`
    select
      a.id, a.slug, a.display_name, a.gender, a.city, a.county, a.country, a.bio,
      a.profile_type, a.profile_roles, a.profile_source_checked_at::text as profile_source_checked_at,
      a.profile_details, a.date_of_birth::text as date_of_birth,
      identifier.athlete_number::text as athlete_number,
      c.name as club,
      c.slug as club_slug,
      exists (
        select 1
        from athlete_account_links account_link
        where account_link.athlete_id = a.id and account_link.status = 'active'
      ) as is_claimed
    from athletes a
    join athlete_resolved_ids identifier on identifier.athlete_id = a.id
    left join clubs c on c.id = a.club_id
    where (a.slug = ${slug}
      or identifier.athlete_number::text = ${athleteNumber}
      or identifier.source_number::text = ${athleteNumber})
      and (a.profile_type = 'Public figure' or (a.profile_visibility = 'public' and not exists (
        select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
        where l.athlete_id=a.id and l.status='active' and s.enabled=false
      )))
    order by (a.slug = ${slug}) desc, a.id
    limit 1
  `;
  const athlete = rows[0];
  if (!athlete) return null;
  const results = await sql<{
    edition_id: number;
    surface: string;
    country: string;
    city: string;
    distance_km: number;
    status: string;
    result_details: unknown;
    chip_time_seconds: number | null;
    gun_time_seconds: number | null;
    id: number;
    event_name: string;
    event_slug: string;
    sport: string;
    event_date: string;
    distance_code: string;
    overall_place: number | null;
    gender_place: number | null;
    category_place: number | null;
    finish_time_seconds: number | null;
    category: string | null;
    result_source: string | null;
    source_url: string | null;
  }>`
    select
      r.id, r.edition_id, e.surface, e.country, e.city, ed.distance_km, r.status, r.result_details, r.chip_time_seconds, r.gun_time_seconds,
      e.name as event_name,
      e.slug as event_slug,
      e.sport,
      ed.event_date::text as event_date,
      ed.distance_code,
      r.overall_place, r.gender_place, r.category_place,
      r.finish_time_seconds,
      r.category,
      r.result_source,
      r.source_url
    from results r
    join editions ed on ed.id = r.edition_id
    join events e on e.id = ed.event_id
    where r.athlete_id = ${athlete.id}
      and (
        ${athlete.profile_type} = 'Public figure'
        or r.result_visibility in ('public', 'public_figure')
      )
      and not exists (select 1 from athlete_profile_hidden_results hidden join athlete_account_links l on l.user_id=hidden.user_id and l.status='active' where l.athlete_id=r.athlete_id and hidden.result_id=r.id)
      and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id where l.athlete_id=r.athlete_id and l.status='active' and s.share_results=false)
    order by ed.event_date desc
  `;
  const links = await sql<{
    user_id: string;
  }>`select l.user_id from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id and s.enabled=true where l.athlete_id=${athlete.id} and l.status='active' limit 1`;
  const { date_of_birth, profile_details, ...safeAthlete } = athlete;
  const [{ athletes: athleteCatalogue }, { publicFigureAthletes }] = await Promise.all([
    import("@/data/athletes"),
    import("@/data/public-figures"),
  ]);
  const seed = [...athleteCatalogue, ...publicFigureAthletes].find(
    (item) => item.slug === athlete.slug,
  );
  const details = publicProfileDetails(profile_details, date_of_birth);
  const { loadPublishedSourceHistories } = await import("./athlete-publication.server");
  return {
    sourceHistories: await loadPublishedSourceHistories(sql, athlete.id),
    athlete: {
      ...safeAthlete,
      details,
      aliases: seed?.aliases ?? [],
      date_of_birth:
        athlete.profile_type === "Public figure" ? (seed?.date_of_birth ?? null) : null,
      place_of_birth: seed?.place_of_birth ?? null,
      country_of_birth: details.birthCountry || seed?.country_of_birth || null,
      address: athlete.profile_type === "Public figure" ? (seed?.address ?? null) : null,
      nationality: details.nationality || seed?.nationality || null,
      notes: seed?.notes ?? null,
      profile_roles: parseProfileRoles(seed?.profile_roles, athlete.profile_roles),
      profile_links: seed?.profile_links ?? [],
      notable_achievements: seed?.notable_achievements ?? [],
    },
    results: results.map(({ result_details, ...row }) => ({
      ...row,
      details: readResultDetails(result_details),
    })),
    upcoming: await loadUpcoming(links[0]?.user_id ?? null, athlete.id, true),
    profileResults: combineProfileResults(
      results.map((r) => ({
        resultId: r.id,
        editionId: r.edition_id,
        eventName: r.event_name,
        eventSlug: r.event_slug,
        sport: r.sport,
        eventDate: r.event_date,
        distanceCode: r.distance_code,
        distanceKm: Number(r.distance_km),
        surface: r.surface,
        country: r.country,
        city: r.city,
        status: r.status,
        details: readResultDetails(r.result_details),
        finishTimeSeconds: r.finish_time_seconds,
        chipTimeSeconds: r.chip_time_seconds,
        gunTimeSeconds: r.gun_time_seconds,
        overallPlace: r.overall_place,
        genderPlace: r.gender_place,
        categoryPlace: r.category_place,
        resultGender: athlete.gender,
        category: r.category,
        resultSource: r.result_source,
        sourceUrls: r.source_url ? [r.source_url] : [],
      })),
    ),
  };
}
