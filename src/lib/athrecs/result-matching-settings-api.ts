import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "../auth/middleware";
import { getSql } from "../db";
import { ensureAthrecsSeeded } from "./seed.server";
import {
  claimIdentitySchema,
  matchingSettingsSchema,
  emptyMatchingSettings,
  MATCHING_NOTICE_VERSION,
  type MatchingSettings,
} from "./result-matching-settings";

export const getMyMatchingSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const [row] = await sql<{
      settings: MatchingSettings;
    }>`select settings from athlete_result_matching_settings where user_id=${context.userId}`;
    return row ? matchingSettingsSchema.parse(row.settings) : emptyMatchingSettings();
  });
export const saveMyMatchingSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: MatchingSettings) => matchingSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    await sql.transaction(async (tx) => {
      await tx`insert into athlete_result_matching_settings(user_id,settings,notice_version)
      values(${context.userId},${JSON.stringify(data)}::jsonb,${MATCHING_NOTICE_VERSION})
      on conflict(user_id) do update set settings=excluded.settings,notice_version=excluded.notice_version,updated_at=now()`;
      await tx`delete from athlete_external_match_searches where user_id=${context.userId}`;
    });
    return data;
  });
export const saveMyClaimIdentity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      fullName: string;
      dateOfBirth?: string;
      nationality?: string;
      privacyAcknowledged: boolean;
    }) => claimIdentitySchema.parse(input),
  )
  .handler(async ({ data, context }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const [user] = await sql<{
      email: string;
      verified: boolean;
    }>`select email,"emailVerified" as verified from "user" where id=${context.userId}`;
    if (!user?.email || !user.verified)
      throw new Error("Verify your email before completing your profile.");
    await sql`insert into athlete_private_profiles(user_id,verified_email,full_name,date_of_birth,nationality,privacy_notice_version,privacy_acknowledged_at)
    values(${context.userId},${user.email},${data.fullName},${data.dateOfBirth || null}::date,${data.nationality || null},${MATCHING_NOTICE_VERSION},now())
    on conflict(user_id) do update set verified_email=excluded.verified_email,full_name=excluded.full_name,date_of_birth=excluded.date_of_birth,
      nationality=excluded.nationality,privacy_notice_version=excluded.privacy_notice_version,privacy_acknowledged_at=now(),updated_at=now()`;
    return { saved: true };
  });
