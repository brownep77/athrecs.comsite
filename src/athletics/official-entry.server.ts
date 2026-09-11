import { getRunrecsOnlyEditionIds } from "../lib/athrecs/runrecs-publication.server";
import { canonicalEventSlug } from "@/data/entry-options";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../lib/athrecs/seed.server";
import { getVerifiedOfficialEntryUrl as getBaseOfficialEntryUrl } from "../lib/athrecs/official-entry.server";

/** Entry redirects follow the same event and edition scope as the public catalogue. */
export async function getVerifiedOfficialEntryUrl(eventSlug: string): Promise<string | null> {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const excludedEditionIds = await getRunrecsOnlyEditionIds(sql);
  const canonicalSlug = canonicalEventSlug(eventSlug);
  const allowed = await sql<{ sport: string }>`
    select sport
    from events
    where slug = ${canonicalSlug}
      and (sport = 'Athletics' or (sport = 'Running'
        and country in ('United Kingdom','England','Scotland','Wales','Northern Ireland','Ireland')
        and exists (select 1 from editions where event_id = events.id
          and event_date between '2026-09-10'::date and '2027-01-31'::date
          and distance_code in ('5K','10K')
          and not (id = any(${excludedEditionIds}::int[])))))
    limit 1
  `;
  if (!allowed.length) return null;
  return getBaseOfficialEntryUrl(canonicalSlug, {
    temporaryUkIrelandShortRaces: allowed[0].sport === "Running",
  });
}
