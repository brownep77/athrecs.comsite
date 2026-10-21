import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
import {
  staffAthleteNumber,
  staffProfileVerificationInput,
  staffResultVerificationInput,
  type StaffProfileVerificationInput,
  type StaffResultVerificationInput,
} from "./staff-athlete-verification";
const target = z.object({ athleteNumber: staffAthleteNumber }).strict();
const page = target.extend({ offset: z.number().int().min(0).max(1000000).default(0) });
async function database(write = false) {
  const { getSql, dbSource } = await import("../db");
  if (write && dbSource !== "neon")
    throw new Error("Use the live AthRecs staff backend to save verification.");
  return getSql();
}
export const getStaffProfileVerification = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof target>) => target.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./staff-athlete-verification.server")).staffProfileVerification(
      await database(),
      data.athleteNumber,
      { userId: context.userId, staff: true },
    ),
  );
export const getStaffVerificationResults = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof page>) => page.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./staff-athlete-verification.server")).staffVerificationResults(
      await database(),
      data.athleteNumber,
      data.offset,
      { userId: context.userId, staff: true },
    ),
  );
export const saveStaffProfileVerification = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: StaffProfileVerificationInput) => staffProfileVerificationInput.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./staff-athlete-verification.server")).saveStaffProfileVerification(
      await database(true),
      data,
      { userId: context.userId, staff: true },
    ),
  );
export const saveStaffResultVerification = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: StaffResultVerificationInput) => staffResultVerificationInput.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./staff-athlete-verification.server")).saveStaffResultVerification(
      await database(true),
      data,
      { userId: context.userId, staff: true },
    ),
  );
