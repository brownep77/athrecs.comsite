import type { ResultsHistoryEntry } from "./profile-history-results";
import { hasRecordedFinish, hasHistoryFinish } from "./profile-result-presentation.ts";

export const PUBLIC_CAREER_EVENT_LIMIT = 6;

export type PublicCareerEvent = {
  name: string;
  eventSlug: string | null;
  year: string;
  discipline: string;
  verification: "Source checked" | "Administrator confirmed" | "Unverified record";
};

export type PublicCareerSummary = { text: string; events: PublicCareerEvent[] };

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const disciplineLabel = (value: string) => (/^half$/i.test(value) ? "Half marathon" : clean(value));
const verification = (value?: string): PublicCareerEvent["verification"] =>
  value === "source_verified"
    ? "Source checked"
    : value === "verified_by_administrator"
      ? "Administrator confirmed"
      : "Unverified record";

/** A small public summary of privacy-filtered records, never the full result history.
 * Only allowlisted event facts leave this function: no times, placings, evidence or notes.
 * Publication and verification remain separate; missing verification is never inferred.
 */
export function publicAthleteCareer(
  name: string,
  entries: readonly ResultsHistoryEntry[],
): PublicCareerSummary | null {
  const facts = entries
    .flatMap((entry): Array<PublicCareerEvent & { date: string }> => {
      if (entry.kind === "recorded") {
        const row = entry.result;
        if (!hasRecordedFinish(row) || row.conflicting) return [];
        return [
          {
            name: clean(row.eventName),
            eventSlug: row.eventSlug || null,
            year: row.eventDate.slice(0, 4),
            date: row.eventDate,
            discipline: disciplineLabel(row.distanceCode),
            verification: verification(row.details?.verificationStatus),
          },
        ];
      }
      const row = entry.result.performance;
      if (!hasHistoryFinish(row) || /conflict/i.test(row.notes ?? "")) return [];
      // An uncertain year range must not acquire a made-up single year.
      const year = row.date ? row.date.slice(0, 4) : row.yearLabel || String(row.year);
      if (!/^\d{4}$/.test(year)) return [];
      return [
        {
          name: clean(row.meeting),
          eventSlug: row.eventSlug || null,
          year,
          date: row.date || year,
          discipline: disciplineLabel(row.discipline),
          verification: verification(row.verificationStatus),
        },
      ];
    })
    .filter((row) => row.name && !/^(?:unknown|tbc|n\/a|[-—])$/i.test(row.name))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
  if (!facts.length) return null;

  const selected: PublicCareerEvent[] = [];
  const seen = new Set<string>();
  const add = (row: (typeof facts)[number]) => {
    const key = row.name.toLowerCase();
    if (seen.has(key) || selected.length >= PUBLIC_CAREER_EVENT_LIMIT) return;
    seen.add(key);
    const { date, ...event } = row;
    void date;
    selected.push(event);
  };
  // Keep early and recent career context, then represent different disciplines.
  // This is deterministic selection, not a claim about prestige or personal bests.
  add(facts[0]);
  add(facts[facts.length - 1]);
  const disciplines = new Set<string>();
  for (const row of facts) {
    if (disciplines.has(row.discipline.toLowerCase())) continue;
    disciplines.add(row.discipline.toLowerCase());
    add(row);
  }
  for (const row of facts) add(row);
  const start = facts[0].year;
  const end = facts[facts.length - 1].year;
  const years = start === end ? `in ${start}` : `from ${start} to ${end}`;
  const sports = [...new Set(selected.map((row) => row.discipline).filter(Boolean))];
  return {
    text: `${name}'s published record includes performances ${years}${sports.length ? ` in ${sports.join(", ")}` : ""}.`,
    events: selected,
  };
}
