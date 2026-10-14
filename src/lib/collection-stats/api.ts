import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { statsRequest } from "./core";

export const getCollectionStats = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => statsRequest.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { readCollectionStats } = await import("./service.server");
    const { refresh, ...filters } = data;
    return readCollectionStats(await getSql(), filters, refresh);
  });
