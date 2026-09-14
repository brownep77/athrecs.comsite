import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import {
  SOCIAL_PLATFORMS,
  validateProfileConnection,
  type ProfileConnection,
  type SocialPlatform,
} from "./profile-connections";

export const getMyProfileConnections = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProfileConnection[]> => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const rows = await sql<{ platform: SocialPlatform; url: string; share_publicly: boolean }>`
      select platform, url, share_publicly from athlete_profile_connections
      where user_id = ${context.userId} order by platform
    `;
    return rows.map((row) => ({
      platform: row.platform,
      url: row.url,
      sharePublicly: row.share_publicly,
    }));
  });

export const saveMyProfileConnection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(validateProfileConnection)
  .handler(async ({ context, data }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    await sql`
      insert into athlete_profile_connections (user_id, platform, url, share_publicly)
      values (${context.userId}, ${data.platform}, ${data.url}, ${data.sharePublicly})
      on conflict (user_id, platform) do update
      set url = excluded.url, share_publicly = excluded.share_publicly, updated_at = now()
    `;
    return { saved: true };
  });

export const removeMyProfileConnection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((value: { platform: SocialPlatform }) => {
    if (!SOCIAL_PLATFORMS.includes(value?.platform)) throw new Error("Unknown platform.");
    return value;
  })
  .handler(async ({ context, data }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    await sql`delete from athlete_profile_connections where user_id = ${context.userId} and platform = ${data.platform}`;
    return { removed: true };
  });

export const dismissMyAthleteMatch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((value: { athleteId: number; dismissed: boolean }) => {
    if (!Number.isSafeInteger(value?.athleteId) || value.athleteId <= 0)
      throw new Error("Invalid athlete.");
    return { athleteId: value.athleteId, dismissed: value.dismissed === true };
  })
  .handler(async ({ context, data }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    if (data.dismissed) {
      await sql`
        insert into athlete_match_dismissals (user_id, athlete_id)
        values (${context.userId}, ${data.athleteId}) on conflict do nothing
      `;
    } else {
      await sql`delete from athlete_match_dismissals where user_id = ${context.userId} and athlete_id = ${data.athleteId}`;
    }
    return { dismissed: data.dismissed };
  });

export const getMyDismissedAthletes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    return sql<{ athleteId: number; name: string }>`
      select athlete.id as "athleteId", athlete.display_name as name
      from athlete_match_dismissals dismissal
      join athletes athlete on athlete.id = dismissal.athlete_id
      where dismissal.user_id = ${context.userId}
      order by dismissal.dismissed_at desc
    `;
  });
