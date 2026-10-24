import { createServerFn } from "@tanstack/react-start";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import {
  getSportPage,
  parseSportFixtureSearch,
  RUNNING_FIXTURE_SCOPE,
  type SportFixtureSearch,
} from "./sport-pages";
import { todayIso } from "./format";

export const getSportFixtures = createServerFn({ method: "GET" })
  .validator((raw: { slug: string } & SportFixtureSearch) => {
    const sport = getSportPage(raw?.slug);
    if (!sport || IS_RUNRECS_SITE) throw new Error("Sport page not found");
    return { sports: sport.sports, surfaces: sport.surfaces, ...parseSportFixtureSearch(raw) };
  })
  .handler(async ({ data }) => {
    const { ensureAthrecsSeeded } = await import("./seed.server");
    const { getSql } = await import("../db");
    const { readSportFixtures } = await import("./sport-fixtures.server");
    await ensureAthrecsSeeded();
    return readSportFixtures(await getSql(), data, todayIso());
  });

/** Broad Running homepage scope; does not alter legacy /sports/running routing. */
export const getRunningFixtures = createServerFn({ method: "GET" })
  .validator((raw: SportFixtureSearch = {}) => {
    if (IS_RUNRECS_SITE) throw new Error("Sport page not found");
    return { ...RUNNING_FIXTURE_SCOPE, ...parseSportFixtureSearch(raw) };
  })
  .handler(async ({ data }) => {
    const { ensureAthrecsSeeded } = await import("./seed.server");
    const { getSql } = await import("../db");
    const { readSportFixtures } = await import("./sport-fixtures.server");
    await ensureAthrecsSeeded();
    return readSportFixtures(await getSql(), data, todayIso());
  });
