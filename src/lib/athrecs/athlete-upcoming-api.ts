import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { ATHLETE_SPORTS } from "./athlete-account-api";

const eventSchema = z.object({
  id: z.number().int().positive().optional(),
  sport: z.enum(ATHLETE_SPORTS),
  eventName: z.string().trim().min(1).max(200),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(`${value}T12:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Enter a valid event date"),
  distance: z.string().trim().max(60).default(""),
  city: z.string().trim().max(120).default(""),
  country: z.string().trim().max(100).default(""),
  eventUrl: z
    .union([
      z.literal(""),
      z
        .string()
        .url()
        .max(1000)
        .refine((value) => /^https?:\/\//.test(value), "Use an http or https event link"),
    ])
    .default(""),
  status: z.enum(["Planned", "Entered", "Confirmed", "Cancelled"]).default("Planned"),
});
export type UpcomingEvent = z.infer<typeof eventSchema> & { id: number };
export type UpcomingInput = z.input<typeof eventSchema>;
const idSchema = z.object({ id: z.number().int().positive() });
const athleteSchema = z.object({ athleteId: z.number().int().positive() });
async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}
const columns = `id, sport, event_name as "eventName", event_date::text as "eventDate", distance, city, country, event_url as "eventUrl", status`;

export const loadUpcoming = createServerOnlyFn(
  async (
    userId: string | null,
    athleteId: number | null,
    publicOnly = false,
  ): Promise<UpcomingEvent[]> => {
    const sql = await ready();
    return sql.query<UpcomingEvent>(
      `select ${columns} from athlete_upcoming_events where
    (user_id = $1 or athlete_id = $2) and ($3::boolean = false or (event_date >= current_date and status <> 'Cancelled'))
    order by event_date, id`,
      [userId, athleteId, publicOnly],
    );
  },
);
async function saveEvent(
  userId: string | null,
  athleteId: number | null,
  data: z.infer<typeof eventSchema>,
) {
  const sql = await ready();
  const args = [
    data.sport,
    data.eventName,
    data.eventDate,
    data.distance,
    data.city,
    data.country,
    data.eventUrl,
    data.status,
  ];
  try {
    if (data.id) {
      const rows = await sql.query(
        `update athlete_upcoming_events set sport=$1, event_name=$2, event_date=$3::date, distance=$4, city=$5, country=$6, event_url=$7, status=$8, updated_at=now()
        where id=$9 and (user_id=$10 or athlete_id=$11) returning id`,
        [...args, data.id, userId, athleteId],
      );
      if (!rows.length) throw new Error("This fixture could not be found on your profile");
    } else {
      await sql.query(
        `insert into athlete_upcoming_events (sport,event_name,event_date,distance,city,country,event_url,status,user_id,athlete_id)
        values($1,$2,$3::date,$4,$5,$6,$7,$8,$9,$10)`,
        [...args, userId, athleteId],
      );
    }
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505")
      throw new Error("This fixture is already on the profile");
    throw error;
  }
  return { saved: true };
}
async function deleteEvent(userId: string | null, athleteId: number | null, id: number) {
  const sql = await ready();
  const rows =
    await sql`delete from athlete_upcoming_events where id=${id} and (user_id=${userId} or athlete_id=${athleteId}) returning id`;
  if (!rows.length) throw new Error("This fixture could not be found on your profile");
  return { removed: true };
}
export const getMyUpcoming = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => loadUpcoming(context.userId, null));
export const saveMyUpcoming = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: UpcomingInput) => eventSchema.parse(input))
  .handler(({ data, context }) => saveEvent(context.userId, null, data));
export const deleteMyUpcoming = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => idSchema.parse(input))
  .handler(({ data, context }) => deleteEvent(context.userId, null, data.id));
export const getStaffUpcoming = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { athleteId: number }) => athleteSchema.parse(input))
  .handler(({ data }) => loadUpcoming(null, data.athleteId));
export const saveStaffUpcoming = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: UpcomingInput & { athleteId: number }) =>
    eventSchema.extend(athleteSchema.shape).parse(input),
  )
  .handler(({ data }) => saveEvent(null, data.athleteId, data));
export const deleteStaffUpcoming = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { id: number; athleteId: number }) =>
    idSchema.extend(athleteSchema.shape).parse(input),
  )
  .handler(({ data }) => deleteEvent(null, data.athleteId, data.id));
