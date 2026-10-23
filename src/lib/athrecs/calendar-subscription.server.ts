import { randomBytes } from "node:crypto";
import type { Sql } from "../db";
import { buildCalendarEvent } from "./event-calendar";
import { resolveCalendarRaces } from "./calendar-races.server";
import {
  MAX_CALENDAR_RACES,
  raceCalendarFeed,
  validCalendarRaceId,
  validCalendarToken,
} from "./calendar-subscription";

export type CalendarAction = "add" | "remove" | "enable" | "reset" | "disable";
const token = () => randomBytes(32).toString("hex");
export async function loadRaceCalendar(sql: Sql, userId: string, candidateId = "") {
  const [calendars, items] = await Promise.all([
    sql<{
      subscription_token: string | null;
    }>`select subscription_token from athlete_race_calendars where user_id=${userId}`,
    sql<{
      race_id: string;
    }>`select race_id from athlete_race_calendar_items where user_id=${userId} order by created_at, race_id limit ${MAX_CALENDAR_RACES}`,
  ]);
  const races = await resolveCalendarRaces(sql, [
    ...items.map((item) => item.race_id),
    candidateId,
  ]);
  const key = calendars[0]?.subscription_token;
  return {
    feedPath: key ? `/api/race-calendar/${key}` : null,
    items: items.map((item) => ({ id: item.race_id, race: races.get(item.race_id) ?? null })),
    candidate: races.get(candidateId) ?? null,
  };
}

export async function changeRaceCalendar(
  sql: Sql,
  userId: string,
  action: CalendarAction,
  raceId = "",
) {
  if (!userId) throw new Error("Sign in to manage your calendar.");
  if (["add", "remove"].includes(action) && !validCalendarRaceId(raceId))
    throw new Error("Invalid race selection.");
  if (action === "add") {
    const race = (await resolveCalendarRaces(sql, [raceId])).get(raceId);
    if (!race || !buildCalendarEvent(race))
      throw new Error("This race does not have an available calendar date.");
  }
  await sql.transaction(async (tx) => {
    await tx`insert into athlete_race_calendars(user_id) values(${userId}) on conflict(user_id) do nothing`;
    // Serialize additions and revocation so the limit and token are safe under double clicks.
    await tx`select user_id from athlete_race_calendars where user_id=${userId} for update`;
    if (action === "add") {
      const counts = await tx<{
        count: number;
      }>`select count(*)::int as count from athlete_race_calendar_items where user_id=${userId} and race_id<>${raceId}`;
      if (counts[0].count >= MAX_CALENDAR_RACES)
        throw new Error(
          `Your calendar can hold ${MAX_CALENDAR_RACES} races. Remove one before adding another.`,
        );
      await tx`insert into athlete_race_calendar_items(user_id,race_id) values(${userId},${raceId}) on conflict do nothing`;
    }
    if (action === "remove")
      await tx`delete from athlete_race_calendar_items where user_id=${userId} and race_id=${raceId}`;
    if (action === "enable" || action === "add") {
      await tx`update athlete_race_calendars set subscription_token=coalesce(subscription_token,${token()}), updated_at=now() where user_id=${userId}`;
    } else if (action === "reset" || action === "disable") {
      await tx`update athlete_race_calendars set subscription_token=${action === "reset" ? token() : null}, updated_at=now() where user_id=${userId}`;
    }
  });
  return { saved: true };
}

const feedHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
export async function raceCalendarResponse(sql: Sql, key: string): Promise<Response> {
  const missing = () =>
    new Response("Calendar link unavailable.", { status: 404, headers: feedHeaders });
  if (!validCalendarToken(key)) return missing();
  const calendars = await sql<{
    user_id: string;
  }>`select user_id from athlete_race_calendars where subscription_token=${key}`;
  if (!calendars.length) return missing();
  const items = await sql<{
    race_id: string;
  }>`select race_id from athlete_race_calendar_items where user_id=${calendars[0].user_id} order by created_at, race_id limit ${MAX_CALENDAR_RACES}`;
  const races = await resolveCalendarRaces(
    sql,
    items.map((item) => item.race_id),
  );
  return new Response(raceCalendarFeed([...races.values()]), {
    headers: {
      ...feedHeaders,
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="athrecs-races.ics"',
    },
  });
}
