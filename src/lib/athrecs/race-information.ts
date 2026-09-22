import { effectiveStatus, todayIso } from "./format";
import type { EditionEntryOption, EntryStatus } from "./types";

/** Public links only. Never render imported javascript/data URLs as race actions. */
export function raceLink(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function raceLocation(parts: Array<string | null | undefined>): string {
  const seen = new Set<string>();
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => {
      if (!part || /^(tbc|unknown|other)$/i.test(part)) return false;
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" · ");
}

/** Entry deadlines are stored as dates; keep entries available through that day. */
export function entryDeadlinePassed(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(deadline)
    ? deadline < todayIso()
    : Date.parse(deadline) < Date.now();
}

export function editionEntry(edition: {
  event_date: string;
  status: string;
  entry_url?: string | null;
  entry_options: EditionEntryOption[];
}) {
  const status = effectiveStatus(edition.event_date, edition.status as EntryStatus);
  if (status === "Finished" || status === "Closed") return null;
  const available = edition.entry_options.filter(
    (option) =>
      !["closed", "sold_out"].includes(option.status) &&
      raceLink(option.entry_url) &&
      !entryDeadlinePassed(option.closes_at),
  );
  const option =
    available.find((item) => item.is_verified && item.entry_type === "official") ??
    available.find((item) => item.is_verified && item.is_primary) ??
    available.find((item) => item.is_verified) ??
    available[0];
  if (option) {
    return {
      url: raceLink(option.entry_url)!,
      label:
        option.status === "ballot"
          ? "View ballot"
          : option.status === "waitlist"
            ? "Waiting list"
            : option.is_verified && option.entry_type === "official"
              ? "Official entry"
              : "Entry details",
      verified: option.is_verified,
    };
  }
  // A closed provider must not be reopened by its legacy entry_url pointer.
  if (edition.entry_options.length) return null;
  const url = raceLink(edition.entry_url);
  return url ? { url, label: "Entry details", verified: false } : null;
}
