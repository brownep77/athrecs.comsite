import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware";
import { getSql } from "../db";
import { ensureAthrecsSeeded } from "./seed.server";
import { validCalendarRaceId } from "./calendar-subscription";

const raceId = z
  .string()
  .max(250)
  .refine((id) => !id || validCalendarRaceId(id))
  .default("");
export const getMyRaceCalendar = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { raceId?: string }) => z.object({ raceId }).parse(input))
  .handler(async ({ context, data }) => {
    const { loadRaceCalendar } = await import("./calendar-subscription.server");
    await ensureAthrecsSeeded();
    return loadRaceCalendar(await getSql(), context.userId, data.raceId);
  });

export const updateMyRaceCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { action: "add" | "remove" | "enable" | "reset" | "disable"; raceId?: string }) =>
      z
        .object({ action: z.enum(["add", "remove", "enable", "reset", "disable"]), raceId })
        .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { changeRaceCalendar } = await import("./calendar-subscription.server");
    await ensureAthrecsSeeded();
    return changeRaceCalendar(await getSql(), context.userId, data.action, data.raceId);
  });
