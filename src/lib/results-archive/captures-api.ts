import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
import { getSql } from "../db";
import { capturedRaceRows, listCapturedRaces } from "./captures.server";

const listing = z.object({
  q: z.string().trim().max(160).default(""),
  offset: z.number().int().min(0).max(1_000_000).default(0),
});
const rows = listing.extend({ id: z.string().regex(/^[1-9]\d{0,17}$/) });

export const getCapturedRaces = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof listing>) => listing.parse(input))
  .handler(async ({ data }) => listCapturedRaces(await getSql(), data));

export const getCapturedRaceRows = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof rows>) => rows.parse(input))
  .handler(async ({ data }) => capturedRaceRows(await getSql(), data));
