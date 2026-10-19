import { createServerFn } from "@tanstack/react-start";
import { racePlacePage } from "./race-places";
import { IS_RUNRECS_SITE } from "../site-scope";

export const getRacePlacePage = createServerFn({ method: "GET" })
  .inputValidator((data: { key?: string; page?: number; archive?: boolean }) => ({
    key: typeof data.key === "string" && data.key.length <= 400 ? data.key : "",
    page: Number.isSafeInteger(data.page) && data.page! > 0 ? data.page! : 1,
    archive: data.archive === true,
  }))
  .handler(async ({ data }) => {
    if (IS_RUNRECS_SITE) return null;
    const { readRacePlaceRows } = await import("./race-places.server");
    return racePlacePage(
      await readRacePlaceRows(),
      data.key,
      new Date().toISOString(),
      data.page,
      data.archive,
    );
  });
