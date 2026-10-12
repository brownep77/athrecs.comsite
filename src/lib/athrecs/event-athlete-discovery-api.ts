import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { ensureAthrecsSeeded } from "./seed.server";

export const getEventAthleteLinks = createServerFn({ method: "GET" })
  .validator((slug: string) => (typeof slug === "string" ? slug.slice(0, 200) : ""))
  .handler(async ({ data }) => {
    if (IS_RUNRECS_SITE || !data) return [];
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    await ensureAthrecsSeeded();
    const { readEventAthleteLinks } = await import("./event-athlete-discovery.server");
    return readEventAthleteLinks(await getSql(), data);
  });
