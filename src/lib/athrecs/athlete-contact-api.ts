import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { staffContactInput } from "./athlete-contact";

export const saveStaffAthleteContact = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => staffContactInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`insert into athlete_staff_contacts
      (user_id,phone,telegram_username,social_links,source_note,updated_by)
      values (${data.userId},${data.phone || null},${data.telegramUsername || null},
        ${JSON.stringify(data.socialLinks)}::jsonb,${data.sourceNote},${context.userId})
      on conflict (user_id) do update set phone=excluded.phone,
        telegram_username=excluded.telegram_username,social_links=excluded.social_links,
        source_note=excluded.source_note,updated_by=excluded.updated_by,updated_at=now()`;
    return { saved: true };
  });
