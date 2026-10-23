import { createServerFn } from "@tanstack/react-start";
import type { z } from "zod";
import { getFixtureSourceRegistry } from "../athrecs/source-registry.server";
import { staffMiddleware } from "../auth/staff-middleware";
import { getSql } from "../db";
import { sourceCoverageInputSchema } from "./coverage";
import { athleteFinderSourceCoverage } from "./coverage.server";

export const getAthleteFinderSourceCoverage = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof sourceCoverageInputSchema>) =>
    sourceCoverageInputSchema.parse(input),
  )
  .handler(async ({ data }) =>
    athleteFinderSourceCoverage(await getSql(), data, getFixtureSourceRegistry()),
  );
