import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import type { AthleteDirectory } from "./athlete-directory";

export const getFeaturedAthletes = createServerFn({ method: "GET" }).handler(async () => {
  const started = performance.now();
  await ensureAthrecsSeeded();
  const { readFeaturedAthletes } = await import("./featured-athletes.server");
  const athletes = await readFeaturedAthletes(await getSql());
  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader(
    "Server-Timing",
    `athlete_discovery;dur=${(performance.now() - started).toFixed(1)}`,
  );
  return { athletes };
});

const inputSchema = z.object({
  q: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  sport: z.string().trim().max(120).optional(),
  page: z.number().int().min(1).max(100000).optional(),
  pageSize: z.number().int().min(1).max(48).optional(),
  includeFacets: z.boolean().optional(),
  letter: z
    .string()
    .regex(/^[A-Z]$/)
    .optional(),
  fastBrowse: z.boolean().optional(),
});

// AthRecs discovery only. Private accounts and unlisted shared profiles are
// deliberately absent from the list, counts and filter choices.
export const getAthleteDirectory = createServerFn({ method: "GET" })
  .validator((input: z.input<typeof inputSchema> | undefined) => inputSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<AthleteDirectory> => {
    const started = performance.now();
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const { readAthleteDirectoryPage } = await import("./athlete-directory-page.server");
    const directory = await readAthleteDirectoryPage(sql, data);
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader(
      "Server-Timing",
      `athlete_directory;dur=${(performance.now() - started).toFixed(1)}`,
    );
    return directory;
  });
