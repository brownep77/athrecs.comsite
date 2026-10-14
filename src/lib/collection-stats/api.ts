import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { statsFilters } from "./core";

export const getCollectionStats = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => statsFilters.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { readCollectionStats } = await import("./service.server");
    return readCollectionStats(await getSql(), data);
  });
