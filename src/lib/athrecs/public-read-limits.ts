import { z } from "zod";

// Fixed on the server: supplying a larger limit in an RPC request cannot turn
// a public list into a catalogue export. Full profiles remain publicly readable.
export const PUBLIC_ATHLETE_LIST_LIMIT = 48;
export const PUBLIC_EDITION_PREVIEW_LIMIT = 100;

export const publicAthleteListSchema = z.object({
  q: z.string().trim().max(120).optional(),
  offset: z.number().int().min(0).max(100_000).optional(),
});

export const publicEditionIdSchema = z.number().int().min(1).max(2_147_483_647);
