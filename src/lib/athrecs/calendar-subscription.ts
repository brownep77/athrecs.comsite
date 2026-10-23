import { buildCalendarEvent, calendarIcs, type CalendarRace } from "./event-calendar.ts";

export const MAX_CALENDAR_RACES = 200;
export const validCalendarRaceId = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 250 &&
  (/^edition-[1-9]\d{0,9}-.+$/.test(value) ||
    /^(road|ultra)-[a-z0-9-]+-\d{4}-\d{2}-\d{2}$/.test(value)) &&
  !/[\r\n]/.test(value);
export const validCalendarToken = (value: string) => /^[a-f0-9]{64}$/.test(value);

/** A subscription contains only selected public race facts, never account details. */
export function raceCalendarFeed(races: CalendarRace[], now = new Date()): string {
  const seen = new Set<string>();
  const events = races.slice(0, MAX_CALENDAR_RACES).flatMap((race) => {
    const event = buildCalendarEvent(race);
    if (!event || seen.has(event.uid)) return [];
    seen.add(event.uid);
    event.description = event.description.replace(
      "This is a one-off calendar copy. Check the race page for changes or cancellations.",
      "From your AthRecs race calendar. Updates arrive when your calendar app refreshes. Check the organiser before travelling.",
    );
    const text = calendarIcs(event, now);
    return [text.slice(text.indexOf("BEGIN:VEVENT"), text.indexOf("END:VCALENDAR"))];
  });
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AthRecs//My race calendar//EN",
      "CALSCALE:GREGORIAN",
      "NAME:My AthRecs races",
      "X-WR-CALNAME:My AthRecs races",
      "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
      "X-PUBLISHED-TTL:PT6H",
    ].join("\r\n") +
    "\r\n" +
    events.join("") +
    "END:VCALENDAR\r\n"
  );
}
