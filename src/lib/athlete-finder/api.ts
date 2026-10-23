import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { getSql } from "../db";
import { getFixtureSourceRegistry } from "../athrecs/source-registry.server";
import { finderSearchSchema, type FinderSearchInput } from "./core";
import { searchStoredAthleteResults } from "./search.server";

export const searchAthleteSourceResults = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: FinderSearchInput) => finderSearchSchema.parse(input))
  .handler(async ({ data }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    return searchStoredAthleteResults(await getSql(), data, getFixtureSourceRegistry());
  });
