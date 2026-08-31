import { canonicalEventSlug } from "@/data/entry-options";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../lib/athrecs/seed.server";
import { getVerifiedOfficialEntryUrl as getBaseOfficialEntryUrl } from "../lib/athrecs/official-entry.server";

/** A public RunRecs redirect must only resolve Running or Parkrun events. */
export async function getVerifiedOfficialEntryUrl(eventSlug: string): Promise<string | null> {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const canonicalSlug = canonicalEventSlug(eventSlug);
  const allowed = await sql<{ ok: number }>`
    select 1 as ok
    from events
    where slug = ${canonicalSlug}
      and sport in ('Running', 'Parkrun')
    limit 1
  `;
  if (!allowed.length) return null;
  return getBaseOfficialEntryUrl(canonicalSlug);
}
