import { ATHRECS_PUBLIC_SPORTS } from "../lib/athrecs/public-sports.ts";
import { canonicalEventSlug } from "@/data/entry-options";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../lib/athrecs/seed.server";
import { getVerifiedOfficialEntryUrl as getBaseOfficialEntryUrl } from "../lib/athrecs/official-entry.server";

/** Entry redirects follow the same event and edition scope as the public catalogue. */
export async function getVerifiedOfficialEntryUrl(eventSlug: string): Promise<string | null> {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const canonicalSlug = canonicalEventSlug(eventSlug);
  const allowed = await sql<{ sport: string }>`
    select sport
    from events
    where slug = ${canonicalSlug}
      and sport = any(${[...ATHRECS_PUBLIC_SPORTS]}::text[])
    limit 1
  `;
  if (!allowed.length) return null;
  return getBaseOfficialEntryUrl(canonicalSlug);
}
