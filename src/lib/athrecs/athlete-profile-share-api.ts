import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { buildGeneratedAthleteBio } from "./athlete-bio";
import {
  buildShareSlug,
  isValidShareSlug,
  sharedProfilePath,
} from "./athlete-profile-share";

export type AthleteShareSettings = {
  enabled: boolean;
  slug: string;
  shareUrlPath: string;
  shareBio: boolean;
  shareResults: boolean;
  shareClub: boolean;
  shareLocation: boolean;
  acknowledgedAt: string | null;
  publishedAt: string | null;
};

export type AthleteShareInput = {
  enabled: boolean;
  shareBio?: boolean;
  shareResults?: boolean;
  shareClub?: boolean;
  shareLocation?: boolean;
  acknowledged?: boolean;
};

export type SharedProfileResult = {
  resultId: number;
  eventName: string;
  eventSlug: string;
  eventDate: string;
  distanceCode: string;
  finishTimeSeconds: number | null;
  overallPlace: number | null;
  category: string | null;
};

export type SharedAthleteProfile = {
  kind: "shared-account";
  slug: string;
  displayName: string;
  bio: string;
  club: string;
  city: string;
  region: string;
  country: string;
  primarySport: string;
  publishedAt: string | null;
  results: SharedProfileResult[];
};

type ShareRow = {
  user_id: string;
  slug: string;
  enabled: boolean;
  share_bio: boolean;
  share_results: boolean;
  share_club: boolean;
  share_location: boolean;
  acknowledged_at: string | null;
  published_at: string | null;
};

type IdentityRow = {
  auth_name: string;
  full_name: string | null;
  display_name: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  club_or_team: string | null;
};

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function mapSettings(row: ShareRow): AthleteShareSettings {
  return {
    enabled: row.enabled,
    slug: row.slug,
    shareUrlPath: sharedProfilePath(row.slug),
    shareBio: row.share_bio,
    shareResults: row.share_results,
    shareClub: row.share_club,
    shareLocation: row.share_location,
    acknowledgedAt: row.acknowledged_at,
    publishedAt: row.published_at,
  };
}

function validateShareInput(value: AthleteShareInput): AthleteShareInput {
  if (value?.enabled === true && value?.acknowledged !== true) {
    throw new Error("Confirm that you want to publish a shareable profile before turning sharing on");
  }
  return {
    enabled: value?.enabled === true,
    shareBio: value?.shareBio !== false,
    shareResults: value?.shareResults !== false,
    shareClub: value?.shareClub !== false,
    shareLocation: value?.shareLocation !== false,
    acknowledged: value?.acknowledged === true,
  };
}

async function loadIdentity(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<IdentityRow> {
  const rows = await sql<IdentityRow>`
    select
      account_user."name" as auth_name,
      profile.full_name,
      profile.display_name,
      profile.city,
      profile.region,
      profile.country,
      profile.club_or_team
    from "user" account_user
    left join athlete_private_profiles profile on profile.user_id = account_user."id"
    where account_user."id" = ${userId}
    limit 1
  `;
  const identity = rows[0];
  if (!identity) throw new Error("Your signed-in account could not be found");
  return identity;
}

function displayNameOf(identity: IdentityRow): string {
  return identity.display_name?.trim() || identity.full_name?.trim() || identity.auth_name?.trim() || "Athlete";
}

async function ensureShareRow(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<ShareRow> {
  const existing = await sql<ShareRow>`
    select
      user_id, slug, enabled, share_bio, share_results, share_club, share_location,
      acknowledged_at::text as acknowledged_at,
      published_at::text as published_at
    from athlete_public_shares
    where user_id = ${userId}
    limit 1
  `;
  if (existing[0]) return existing[0];

  const identity = await loadIdentity(sql, userId);
  const slug = buildShareSlug(displayNameOf(identity), userId);
  const inserted = await sql<ShareRow>`
    insert into athlete_public_shares (
      user_id, slug, enabled, share_bio, share_results, share_club, share_location, updated_at
    ) values (
      ${userId}, ${slug}, false, true, true, true, true, now()
    )
    on conflict (user_id) do update set updated_at = athlete_public_shares.updated_at
    returning
      user_id, slug, enabled, share_bio, share_results, share_club, share_location,
      acknowledged_at::text as acknowledged_at,
      published_at::text as published_at
  `;
  return inserted[0];
}

async function loadVisibleResults(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<SharedProfileResult[]> {
  const rows = await sql<{
    result_id: number;
    event_name: string;
    event_slug: string;
    event_date: string;
    distance_code: string;
    finish_time_seconds: number | null;
    overall_place: number | null;
    category: string | null;
  }>`
    select
      result.id as result_id,
      event.name as event_name,
      event.slug as event_slug,
      edition.event_date::text as event_date,
      edition.distance_code,
      result.finish_time_seconds,
      result.overall_place,
      result.category
    from athlete_account_links account_link
    join results result on result.athlete_id = account_link.athlete_id
    join editions edition on edition.id = result.edition_id
    join events event on event.id = edition.event_id
    where account_link.user_id = ${userId}
      and account_link.status = 'active'
      and not exists (
        select 1
        from athlete_profile_hidden_results hidden
        where hidden.user_id = ${userId}
          and hidden.result_id = result.id
      )
    order by edition.event_date desc, result.id desc
    limit 500
  `;
  return rows.map((row) => ({
    resultId: row.result_id,
    eventName: row.event_name,
    eventSlug: row.event_slug,
    eventDate: row.event_date,
    distanceCode: row.distance_code,
    finishTimeSeconds: row.finish_time_seconds,
    overallPlace: row.overall_place,
    category: row.category,
  }));
}

async function buildPublicProfile(
  sql: Awaited<ReturnType<typeof getSql>>,
  share: ShareRow,
): Promise<SharedAthleteProfile> {
  const [identity, sportRows, bioRows, results] = await Promise.all([
    loadIdentity(sql, share.user_id),
    sql<{ sport_code: string }>`
      select sport_code
      from athlete_sport_profiles
      where user_id = ${share.user_id}
      order by is_primary desc, sport_code
      limit 1
    `,
    sql<{ mode: string; custom_bio: string | null }>`
      select mode, custom_bio
      from athlete_profile_bios
      where user_id = ${share.user_id}
      limit 1
    `,
    share.share_results ? loadVisibleResults(sql, share.user_id) : Promise.resolve([]),
  ]);

  const displayName = displayNameOf(identity);
  const primarySport = sportRows[0]?.sport_code ?? "";
  const bioMode = bioRows[0]?.mode ?? "automatic";
  let bio = "";
  if (share.share_bio && bioMode !== "hidden") {
    if (bioMode === "custom") {
      bio = bioRows[0]?.custom_bio?.trim() ?? "";
    } else {
      bio = buildGeneratedAthleteBio({
        displayName,
        primarySport,
        city: share.share_location ? (identity.city ?? "") : "",
        region: share.share_location ? (identity.region ?? "") : "",
        country: share.share_location ? (identity.country ?? "") : "",
        clubOrTeam: share.share_club ? (identity.club_or_team ?? "") : "",
        results,
      }).replace(/\bprivate ATHRECS record\b/g, "ATHRECS record");
    }
  }

  return {
    kind: "shared-account",
    slug: share.slug,
    displayName,
    bio,
    club: share.share_club ? (identity.club_or_team?.trim() ?? "") : "",
    city: share.share_location ? (identity.city?.trim() ?? "") : "",
    region: share.share_location ? (identity.region?.trim() ?? "") : "",
    country: share.share_location ? (identity.country?.trim() ?? "") : "",
    primarySport,
    publishedAt: share.published_at,
    results,
  };
}

export const getMyProfileShare = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    const row = await ensureShareRow(sql, context.userId);
    return mapSettings(row);
  });

export const saveMyProfileShare = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: AthleteShareInput) => validateShareInput(input))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    const current = await ensureShareRow(sql, context.userId);
    const identity = await loadIdentity(sql, context.userId);
    const slug = current.slug || buildShareSlug(displayNameOf(identity), context.userId);
    const rows = await sql<ShareRow>`
      insert into athlete_public_shares (
        user_id, slug, enabled, share_bio, share_results, share_club, share_location,
        acknowledged_at, published_at, unpublished_at, updated_at
      ) values (
        ${context.userId},
        ${slug},
        ${data.enabled},
        ${data.shareBio === true},
        ${data.shareResults === true},
        ${data.shareClub === true},
        ${data.shareLocation === true},
        ${data.enabled ? new Date() : current.acknowledged_at},
        ${data.enabled ? new Date() : null},
        ${data.enabled ? null : new Date()},
        now()
      )
      on conflict (user_id) do update set
        enabled = excluded.enabled,
        share_bio = excluded.share_bio,
        share_results = excluded.share_results,
        share_club = excluded.share_club,
        share_location = excluded.share_location,
        acknowledged_at = case
          when excluded.enabled then coalesce(athlete_public_shares.acknowledged_at, now())
          else athlete_public_shares.acknowledged_at
        end,
        published_at = case
          when excluded.enabled then coalesce(athlete_public_shares.published_at, now())
          else athlete_public_shares.published_at
        end,
        unpublished_at = case when excluded.enabled then null else now() end,
        updated_at = now()
      returning
        user_id, slug, enabled, share_bio, share_results, share_club, share_location,
        acknowledged_at::text as acknowledged_at,
        published_at::text as published_at
    `;
    return mapSettings(rows[0]);
  });

export const getPublishedSharedProfile = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => ({
    slug: typeof input?.slug === "string" ? input.slug.trim().toLowerCase() : "",
  }))
  .handler(async ({ data }) => {
    if (!isValidShareSlug(data.slug)) return null;
    try {
      const sql = await ready();
      const rows = await sql<ShareRow>`
        select
          user_id, slug, enabled, share_bio, share_results, share_club, share_location,
          acknowledged_at::text as acknowledged_at,
          published_at::text as published_at
        from athlete_public_shares
        where slug = ${data.slug}
          and enabled = true
        limit 1
      `;
      const share = rows[0];
      if (!share) return null;
      return buildPublicProfile(sql, share);
    } catch {
      // Missing table or lookup failure must 404, never 500 a public athlete URL.
      return null;
    }
  });
