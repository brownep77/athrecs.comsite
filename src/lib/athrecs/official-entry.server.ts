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
export async function getVerifiedOfficialEntryUrl(eventSlug: string): Promise<string | null> {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const today = todayIso();
  const canonicalSlug = canonicalEventSlug(eventSlug);

  const rows = await sql<{ entry_url: string }>`
    select option.entry_url
    from events event
    join editions edition on edition.event_id = event.id
    join edition_entry_options option on option.edition_id = edition.id
    where event.slug = ${canonicalSlug}
      and edition.event_date = (
        select min(next_edition.event_date)
        from editions next_edition
        where next_edition.event_id = event.id
          and next_edition.event_date >= ${today}::date
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
