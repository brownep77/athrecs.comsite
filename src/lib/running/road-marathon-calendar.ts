import type { RoadMarathon } from "../../data/road-marathons/types";

export const ROAD_MARATHON_WINDOW_START = "2026-09-26";
export const ROAD_MARATHON_WINDOW_END = "2027-12-31";

export function raceLocalDate(timeZone: string, now: Date | string = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  const part = (type: string) => parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function upcomingRoadEditions(race: RoadMarathon, now: Date | string = new Date()) {
  const today = raceLocalDate(race.timeZone, now);
  return race.editions
    .filter(
      (edition) =>
        edition.date >= ROAD_MARATHON_WINDOW_START &&
        edition.date <= ROAD_MARATHON_WINDOW_END &&
        (edition.endDate ?? edition.date) >= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function roadMarathonDate(date: string, endDate?: string): string {
  const format = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T12:00:00Z`));
  return endDate && endDate !== date ? `${format(date)} – ${format(endDate)}` : format(date);
}

export function currentRoadDateNotes(race: RoadMarathon, now: Date | string = new Date()) {
  const today = raceLocalDate(race.timeZone, now);
  return (race.dateNotes ?? []).filter((note) => note.expiresAfter >= today);
}

/** The next date change for any displayed race, found across IANA timezones including DST. */
export function nextRaceDateChange(timeZones: string[], now = new Date()): number {
  let next = now.getTime() + 26 * 60 * 60 * 1000;
  for (const zone of new Set(timeZones)) {
    const today = raceLocalDate(zone, now);
    let low = now.getTime();
    let high = low + 26 * 60 * 60 * 1000;
    while (high - low > 500) {
      const middle = Math.floor((low + high) / 2);
      if (raceLocalDate(zone, new Date(middle)) === today) low = middle;
      else high = middle;
    }
    next = Math.min(next, high);
  }
  return next;
}
