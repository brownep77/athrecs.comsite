import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
const schema = z.object({
  filename: z.string().min(1).max(240), content: z.string().min(1).max(2800000),
  eventName: z.string().trim().min(3).max(200), date: z.string().length(10),
  distance: z.string().trim().min(1).max(40), distanceKm: z.number().positive().max(1000),
  sourceUrl: z.string().url().max(300), timingBasis: z.enum(["chip", "gun", "unspecified"]),
}).strict();
/** POST transports the uploaded file, but the operation performs SELECTs only. */
export const checkRaceUpload = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof schema>) => schema.parse(input))
  .handler(async ({ data }) => (await import("./service.server")).previewUpload(data));
