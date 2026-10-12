import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import type { AthleteDirectory } from "./athlete-directory";
import { readSourceNationality } from "./source-nationality";

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
    const directory = await withNationalities(sql, await readAthleteDirectoryPage(sql, data));
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader(
      "Server-Timing",
      `athlete_directory;dur=${(performance.now() - started).toFixed(1)}`,
    );
    return directory;
  });

async function withNationalities(sql: Sql, directory: AthleteDirectory): Promise<AthleteDirectory> {
  if (!directory.athletes.length) return directory;
  // Fetch only this page's evidence, and expose only the nationality value.
  // Full source metadata and account-owned details never enter the public list.
  const observations = await sql<{ id: number; profile_details: unknown }>`
      select a.id, a.profile_details from athletes a
      where a.id=any(${directory.athletes.map((athlete) => athlete.id)}::int[])
        and a.profile_visibility='public'
        and not exists (select 1 from athlete_account_links l where l.athlete_id=a.id)
    `;
  const nationalities = new Map(
    observations.map((row) => [row.id, readSourceNationality(row.profile_details)]),
  );
  return {
    ...directory,
    athletes: directory.athletes.map((athlete) => ({
      ...athlete,
      nationality: nationalities.get(athlete.id)?.value ?? null,
    })),
  };
}
