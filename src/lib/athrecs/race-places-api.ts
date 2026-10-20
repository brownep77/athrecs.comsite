import { createServerFn } from "@tanstack/react-start";
import { racePlacePage } from "./race-places";
import { IS_RUNRECS_SITE } from "../site-scope";

export const getRacePlacePage = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { key?: string; page?: number; archive?: boolean; month?: string; city?: string }) => ({
      key: typeof data.key === "string" && data.key.length <= 400 ? data.key : "",
      page: Number.isSafeInteger(data.page) && data.page! > 0 ? data.page! : 1,
      archive: data.archive === true,
      month: typeof data.month === "string" ? data.month : undefined,
      city: typeof data.city === "string" ? data.city.slice(0, 100) : undefined,
    }),
  )
  .handler(async ({ data }) => {
    if (IS_RUNRECS_SITE) return null;
    const { readRacePlaceRows } = await import("./race-places.server");
    return racePlacePage(
      await readRacePlaceRows(),
      data.key,
      new Date().toISOString(),
      data.page,
      data.archive,
      { month: data.month, city: data.city },
    );
  });
