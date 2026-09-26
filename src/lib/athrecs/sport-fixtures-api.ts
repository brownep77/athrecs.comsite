import { createServerFn } from "@tanstack/react-start";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { getSportPage, parseSportFixtureSearch } from "./sport-pages";
import { todayIso } from "./format";

export const getSportFixtures = createServerFn({ method: "GET" })
  .validator((raw: { slug: string; q?: string; page?: number }) => {
    const sport = getSportPage(raw?.slug);
    if (!sport || IS_RUNRECS_SITE) throw new Error("Sport page not found");
    return { sport: sport.sport, ...parseSportFixtureSearch(raw) };
  })
  .handler(async ({ data }) => {
    const { ensureAthrecsSeeded } = await import("./seed.server");
    const { getSql } = await import("../db");
    const { readSportFixtures } = await import("./sport-fixtures.server");
    await ensureAthrecsSeeded();
    return readSportFixtures(await getSql(), data, todayIso());
  });
