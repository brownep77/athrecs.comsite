import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  buildGeneratedAthleteBio,
  type AthleteBioResult,
} from "./athlete-bio";
import { ensureAthrecsSeeded } from "./seed.server";

export type AthleteBioMode = "automatic" | "custom" | "hidden";

export type AthleteBioData = {
  mode: AthleteBioMode;
  generatedBio: string;
  customBio: string;
  displayBio: string;
  updatedAt: string | null;
  generatedFromResultCount: number;
};

export type AthleteBioInput = {
  mode: AthleteBioMode;
  customBio?: string;
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

type BioRow = {
  mode: AthleteBioMode;
  custom_bio: string | null;
  updated_at: string;
};

type SportRow = {
  sport_code: string;
};

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function validateBioInput(value: AthleteBioInput): AthleteBioInput {
  const mode = value?.mode;
  if (mode !== "automatic" && mode !== "custom" && mode !== "hidden") {
    throw new Error("Choose Automatic, Write my own or Hide bio");
  }
  const customBio = typeof value?.customBio === "string" ? value.customBio.trim() : "";
  if (customBio.length > 1200) throw new Error("Bio must be 1,200 characters or fewer");
  if (mode === "custom" && customBio.length < 10) {
    throw new Error("Write at least 10 characters for a custom bio");
  }
  return { mode, customBio };
}

async function loadBio(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<AthleteBioData> {
  const [identityRows, preferenceRows, sportRows, resultRows] = await Promise.all([
    sql<IdentityRow>`
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
    `,
    sql<BioRow>`
      select mode, custom_bio, updated_at::text as updated_at
      from athlete_profile_bios
      where user_id = ${userId}
      limit 1
    `,
    sql<SportRow>`
      select sport_code
      from athlete_sport_profiles
      where user_id = ${userId}
      order by is_primary desc, sport_code
      limit 1
    `,
    sql<AthleteBioResult>`
      select
        result.id as "resultId",
        event.name as "eventName",
        edition.event_date::text as "eventDate",
        edition.distance_code as "distanceCode",
        result.finish_time_seconds as "finishTimeSeconds",
        result.overall_place as "overallPlace"
      from athlete_account_links account_link
      join results result on result.athlete_id = account_link.athlete_id
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      where account_link.user_id = ${userId}
        and account_link.status = 'active'
      order by edition.event_date desc, result.id desc
      limit 500
    `,
  ]);

  const identity = identityRows[0];
  if (!identity) throw new Error("Your signed-in account could not be found");
  const preference = preferenceRows[0];
  const mode = preference?.mode ?? "automatic";
  const customBio = preference?.custom_bio?.trim() ?? "";
  const displayName =
    identity.display_name?.trim() ||
    identity.full_name?.trim() ||
    identity.auth_name?.trim() ||
    "This athlete";
  const generatedBio = buildGeneratedAthleteBio({
    displayName,
    primarySport: sportRows[0]?.sport_code ?? "",
    city: identity.city ?? "",
    region: identity.region ?? "",
    country: identity.country ?? "",
    clubOrTeam: identity.club_or_team ?? "",
    results: resultRows,
  });

  return {
    mode,
    generatedBio,
    customBio,
    displayBio: mode === "hidden" ? "" : mode === "custom" ? customBio : generatedBio,
    updatedAt: preference?.updated_at ?? null,
    generatedFromResultCount: resultRows.length,
  };
}

export const getMyAthleteBio = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadBio(await ready(), context.userId));

export const saveMyAthleteBio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: AthleteBioInput) => validateBioInput(input))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    await sql`
      insert into athlete_profile_bios (user_id, mode, custom_bio, updated_at)
      values (
        ${context.userId},
        ${data.mode},
        ${data.mode === "custom" ? data.customBio || null : null},
        now()
      )
      on conflict (user_id) do update set
        mode = excluded.mode,
        custom_bio = excluded.custom_bio,
        updated_at = now()
    `;
    return loadBio(sql, context.userId);
  });
