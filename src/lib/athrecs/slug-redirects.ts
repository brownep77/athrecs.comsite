import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";

export type SlugEntityType = "event" | "athlete" | "club";

type ResolveSlugRedirectInput = {
  entityType: SlugEntityType;
  slug: string;
};

const ENTITY_TYPES = new Set<SlugEntityType>(["event", "athlete", "club"]);

export const resolveSlugRedirect = createServerFn({ method: "GET" })
  .validator((input: ResolveSlugRedirectInput) => {
    const entityType = input?.entityType;
    const slug = input?.slug?.trim().toLowerCase();
    if (!ENTITY_TYPES.has(entityType)) throw new Error("Unknown slug entity type");
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error("Invalid slug");
    }
    return { entityType, slug };
  })
  .handler(async ({ data }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const rows = await sql<{ current_slug: string }>`
      select current_slug
      from slug_redirects
      where entity_type = ${data.entityType}
        and old_slug = ${data.slug}
      limit 1
    `;
    return rows[0]?.current_slug ?? null;
  });
