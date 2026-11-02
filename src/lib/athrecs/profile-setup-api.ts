import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { profileSetupSchema, type ProfileSetup } from "./profile-setup";
import { MATCHING_NOTICE_VERSION } from "./result-matching-settings";

export const saveMyProfileSetup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ProfileSetup) => profileSetupSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const [user] = await sql<{
      email: string;
      verified: boolean;
    }>`select email,"emailVerified" as verified from "user" where id=${context.userId}`;
    if (!user?.verified) throw new Error("Verify your email before finding your results.");
    await sql.transaction(async (tx) => {
      await tx`insert into athlete_private_profiles(user_id,verified_email,full_name,club_or_team,previous_names,profile_details,privacy_notice_version,privacy_acknowledged_at)
        values(${context.userId},${user.email},${data.fullName},${data.currentClub || null},${data.previousNames},${JSON.stringify({ previousClub: data.previousClubs[0] ?? "" })}::jsonb,${MATCHING_NOTICE_VERSION},now())
        on conflict(user_id) do update set verified_email=excluded.verified_email,full_name=excluded.full_name,club_or_team=excluded.club_or_team,previous_names=excluded.previous_names,
        profile_details=coalesce(athlete_private_profiles.profile_details,'{}'::jsonb)||excluded.profile_details,
        privacy_notice_version=excluded.privacy_notice_version,privacy_acknowledged_at=now(),updated_at=now()`;
      // Merge only discovery fields; preserve all other account settings and consents.
      await tx`insert into athlete_result_matching_settings(user_id,settings,notice_version)
        values(${context.userId},${JSON.stringify({ previousClubs: data.previousClubs, sourceUrls: data.sourceUrls })}::jsonb,${MATCHING_NOTICE_VERSION})
        on conflict(user_id) do update set settings=athlete_result_matching_settings.settings||excluded.settings,updated_at=now()`;
      await tx`delete from athlete_external_match_searches where user_id=${context.userId}`;
      const snapshot = JSON.stringify(data);
      const [request] = await tx<{
        id: number;
      }>`insert into athlete_profile_setup_requests(user_id,details,fingerprint)
        values(${context.userId},${snapshot}::jsonb,md5((${snapshot}::jsonb)::text))
        on conflict(user_id,fingerprint) do update set fingerprint=excluded.fingerprint returning id`;
      await tx`insert into athlete_profile_setup_alerts(request_id,recipient)
        select ${request.id},recipient from athrecs_notification_recipients('support',athrecs_is_test_user(${context.userId}))
        on conflict(request_id,recipient) do nothing`;
    });
    const { notifyProfileSetup } = await import("./profile-setup-alerts.server");
    await notifyProfileSetup(context.userId);
    return { saved: true };
  });

export const getMyProfileSetupStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const [row] = await sql<{
      id: number;
      completed: boolean;
    }>`select id,completed_at is not null as completed from athlete_profile_setup_requests where user_id=${context.userId} order by created_at desc,id desc limit 1`;
    return row ?? null;
  });

export const listStaffProfileSetups = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    await ensureAthrecsSeeded();
    const sql = await getSql();
    return sql<{
      id: number;
      email: string;
      details: ProfileSetup;
      created_at: string;
      alert_sent: boolean;
    }>`select r.id,u.email,r.details,r.created_at::text,
      exists(select 1 from athlete_profile_setup_alerts a where a.request_id=r.id and a.sent_at is not null) as alert_sent
      from athlete_profile_setup_requests r join "user" u on u.id=r.user_id where r.completed_at is null order by r.created_at limit 100`;
  });

export const completeStaffProfileSetup = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { id: number }) => {
    if (!Number.isSafeInteger(input.id) || input.id < 1) throw new Error("Invalid request");
    return input;
  })
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`update athlete_profile_setup_requests set completed_at=now(),completed_by=${context.userId} where id=${data.id} and completed_at is null`;
    return { saved: true };
  });
