import { getRunrecsOnlyEditionIds } from "./runrecs-publication.server";
import { canonicalEventSlug } from "@/data/entry-options";
import { getSql } from "@/lib/db";
import { todayIso } from "@/lib/athrecs/format";
import { ensureAthrecsSeeded } from "@/lib/athrecs/seed.server";

function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the best verified official registration URL for an event's next date.
 *
 * General event websites and unverified legacy links are deliberately excluded:
 * callers must fall back to the Athrecs event page rather than presenting a
 * potentially misleading external destination as an official entry link.
 */
export async function getVerifiedOfficialEntryUrl(
  eventSlug: string,
  options: { temporaryUkIrelandShortRaces?: boolean } = {},
): Promise<string | null> {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const today = todayIso();
  const canonicalSlug = canonicalEventSlug(eventSlug);
  const shortRaces = options.temporaryUkIrelandShortRaces === true;
  const excludedEditionIds = shortRaces ? await getRunrecsOnlyEditionIds(sql) : [];

  const rows = await sql<{ entry_url: string }>`
    select option.entry_url
    from events event
    join editions edition on edition.event_id = event.id
    join edition_entry_options option on option.edition_id = edition.id
    where event.slug = ${canonicalSlug}
      and (${shortRaces}::boolean is false or (
        edition.event_date between '2026-09-10'::date and '2027-01-31'::date
        and edition.distance_code in ('5K', '10K')
        and not (edition.id = any(${excludedEditionIds}::int[]))
      ))
      and edition.event_date = (
        select min(next_edition.event_date)
        from editions next_edition
        where next_edition.event_id = event.id
          and next_edition.event_date >= ${today}::date
          and (${shortRaces}::boolean is false or (
            next_edition.event_date between '2026-09-10'::date and '2027-01-31'::date
            and next_edition.distance_code in ('5K', '10K')
            and not (next_edition.id = any(${excludedEditionIds}::int[]))
          ))
      )
      and edition.status not in ('Closed', 'Finished')
      and option.entry_type = 'official'
      and option.is_verified
      and option.status in ('open', 'closing_soon', 'ballot', 'waitlist', 'unknown')
    order by
      option.is_primary desc,
      option.checked_at desc,
      option.id asc
    limit 1
  `;

  return safeHttpsUrl(rows[0]?.entry_url);
}
