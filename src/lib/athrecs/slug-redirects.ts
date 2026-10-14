import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";

export type SlugEntityType = "event" | "athlete" | "club";

type ResolveSlugRedirectInput = {
  entityType: SlugEntityType;
  slug: string;
};

const ENTITY_TYPES = new Set<SlugEntityType>(["event", "athlete", "club"]);

// Some established public catalogue URLs contain repeated internal hyphens or
// a trailing hyphen from an older fixed-length truncation. New slugs are still
// normalized by slugify(), but redirects must resolve every published URL.
const PUBLIC_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export const resolveSlugRedirect = createServerFn({ method: "GET" })
  .validator((input: ResolveSlugRedirectInput) => {
    const entityType = input?.entityType;
    const slug = typeof input?.slug === "string" ? input.slug.trim().toLowerCase() : "";
    if (!ENTITY_TYPES.has(entityType)) throw new Error("Unknown slug entity type");
    // A malformed public address is a missing page, not a server failure.
    return { entityType, slug: PUBLIC_SLUG_PATTERN.test(slug) ? slug : "" };
  })
  .handler(async ({ data }) => {
    if (!data.slug) return null;
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

/** Old public links may redirect only to a currently indexable public athlete. */
export const resolvePublicAthleteSlugRedirect = createServerFn({ method: "GET" })
  .validator((input: string) => {
    const slug = typeof input === "string" ? input.trim().toLowerCase() : "";
    return slug.length <= 300 && PUBLIC_SLUG_PATTERN.test(slug) ? slug : "";
  })
  .handler(async ({ data }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    if (!data) return null;
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const { indexableApprovedAthleteSql } = await import("./athlete-search-policy.server");
    const [athlete] = await sql.query<{ slug: string }>(
      `select a.slug from slug_redirects r join athletes a on a.id=r.entity_id and a.slug=r.current_slug
       where r.entity_type='athlete' and r.old_slug=$1 and a.slug<>$1
         and ${indexableApprovedAthleteSql} limit 1`,
      [data],
    );
    return athlete?.slug ?? null;
  });
