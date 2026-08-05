import type { EntryStatus } from "./types";

export function formatRaceDateShort(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRaceWeekday(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
  });
}

export function formatStartTime(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return raw.trim();
  return `${String(Number(m[1])).padStart(2, "0")}:${m[2]}`;
}

/** Calendar date in Europe/London (Norfolk fixtures) — stable for SSR + client. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function effectiveStatus(
  eventDate: string,
  status: EntryStatus,
  from = todayIso(),
): EntryStatus {
  if (eventDate < from) return "Finished";
  if (status === "Finished") return "Closed";
  return status;
}

export function statusLabel(status: EntryStatus): string {
  switch (status) {
    case "Open":
      return "Entries open";
    case "ClosingSoon":
      return "Closing soon";
    case "Closed":
      return "Entries closed";
    case "Finished":
      return "Finished";
    case "TBC":
      return "Date TBC";
  }
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || totalSeconds < 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
