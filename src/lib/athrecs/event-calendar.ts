import { publicCatalogueText, hasWithheldCatalogueReference } from "./public-catalogue-content.ts";

export type CalendarRace = {
  id: string;
  name: string;
  date: string;
  distance?: string | null;
  startTime?: string | null;
  startLabel?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  timeZone?: string | null;
  location?: string | null;
  raceDayInformation?: string | null;
  pageUrl: string;
  officialUrl?: string | null;
  entryUrl?: string | null;
  status?: string | null;
  provisional?: boolean;
};
export type CalendarEvent = {
  uid: string;
  title: string;
  description: string;
  location: string;
  officialUrl: string | null;
  pageUrl: string;
  date: string;
  endDateExclusive: string;
  startUtc: string | null;
  endUtc: string | null;
  timeZone: string | null;
  notice: string;
  provisional: boolean;
};
const DAY = 86400000;
const clean = (value: string | null | undefined, limit = 500) =>
  publicCatalogueText(value ?? "")
    // eslint-disable-next-line no-control-regex -- Strip C0 controls while preserving text line breaks.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, limit);

export function validCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "9998-12-31")
    return false;
  const stamp = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value;
}
function clock(value?: string | null): string | null {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match || +match[1] > 23 || +match[2] > 59 || +(match[3] ?? 0) > 59) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}:${match[3] ?? "00"}`;
}
function safeUrl(value?: string | null): string | null {
  if (!value || value.length > 2000 || hasWithheldCatalogueReference(value) || /[\r\n]/.test(value))
    return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
/** Reject missing/ambiguous/nonexistent local times instead of letting Date silently adjust them. */
export function calendarUtc(date: string, time: string, zone: string): string | null {
  const normalized = clock(time);
  if (!validCalendarDate(date) || !normalized) return null;
  try {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const local = (stamp: number) => {
      const p = Object.fromEntries(
        format.formatToParts(stamp).map((part) => [part.type, part.value]),
      );
      return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
    };
    const target = `${date}T${normalized}`;
    const naive = Date.parse(target + "Z");
    const offsets = new Set<number>();
    for (let hours = -36; hours <= 36; hours += 6) {
      const probe = naive + hours * 3600000;
      offsets.add(Date.parse(local(probe) + "Z") - probe);
    }
    const matches = [...offsets]
      .map((offset) => naive - offset)
      .filter((stamp) => local(stamp) === target);
    return matches.length === 1 ? new Date(matches[0]).toISOString().replace(".000Z", "Z") : null;
  } catch {
    return null;
  }
}
export function calendarUnavailable(race: CalendarRace): string | null {
  if (/cancelled|canceled|postponed|finished/i.test(race.status ?? ""))
    return "This event is not available to add.";
  if (!validCalendarDate(race.date)) return "A confirmed event date is needed.";
  if (race.endDate && (!validCalendarDate(race.endDate) || race.endDate < race.date))
    return "The event dates need checking.";
  return null;
}
export function buildCalendarEvent(race: CalendarRace): CalendarEvent | null {
  if (calendarUnavailable(race)) return null;
  const time = clock(race.startTime);
  // A published start window/estimate is not an exact time.
  const startUtc =
    time && race.timeZone && !race.startLabel ? calendarUtc(race.date, time, race.timeZone) : null;
  const endDate = race.endDate || race.date;
  const endCandidate =
    startUtc && race.endTime && race.timeZone
      ? calendarUtc(endDate, race.endTime, race.timeZone)
      : null;
  const endUtc = endCandidate && endCandidate > startUtc! ? endCandidate : null;
  const title =
    clean([race.name, race.distance].filter(Boolean).join(" · "), 250) || "AthRecs event";
  const notice = startUtc
    ? endUtc
      ? "Times are shown in your calendar’s timezone."
      : "Start reminder only; finish time is not confirmed. Adjust the calendar duration if needed."
    : time || race.startLabel
      ? "Date-only reminder: check the local start time and timezone with the organiser."
      : "Date-only reminder: start time to be confirmed.";
  const pageUrl = safeUrl(race.pageUrl) ?? "https://www.athrecs.com/";
  const official = safeUrl(race.officialUrl);
  const entry = safeUrl(race.entryUrl);
  const location = clean(race.location);
  const raceDayInformation = clean(race.raceDayInformation, 2000);
  const description = [
    title,
    race.distance ? `Distance: ${clean(race.distance)}.` : "",
    race.provisional ? "PROVISIONAL DATE — confirm with the organiser before making plans." : "",
    startUtc
      ? `Local start: ${time} (${race.timeZone}).`
      : race.startLabel
        ? `Published start: ${clean(race.startLabel)}.`
        : time
          ? `Listed local start: ${time}; timezone needs confirmation.`
          : "",
    race.endDate && !endUtc ? `Listed event dates: ${race.date} to ${race.endDate}.` : "",
    location ? `Venue / race area: ${location}` : "",
    raceDayInformation ? `Race-day information:\n${raceDayInformation}` : "",
    notice,
    "Check your assigned wave, exact start point and arrival instructions with the organiser.",
    `AthRecs: ${pageUrl}`,
    location
      ? `Map of listed venue / area: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
      : "",
    official ? `Race website: ${official}` : "",
    entry ? `Official entry: ${entry}` : "",
    "This is a one-off calendar copy. Check the race page for changes or cancellations.",
  ]
    .filter(Boolean)
    .join("\n");
  return {
    uid: `${encodeURIComponent(new TextDecoder().decode(new TextEncoder().encode(race.id)))}@athrecs.com`,
    title: race.provisional ? `[Provisional] ${title}` : title,
    description,
    location,
    officialUrl: official,
    pageUrl,
    date: race.date,
    endDateExclusive: new Date(Date.parse(endDate + "T00:00:00Z") + DAY).toISOString().slice(0, 10),
    startUtc,
    endUtc,
    timeZone: startUtc ? race.timeZone! : null,
    notice,
    provisional: Boolean(race.provisional),
  };
}
const compact = (value: string) => value.replace(/[-:]/g, "");
const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
/** RFC 5545: fold by UTF-8 octets, never through a multibyte character. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  let output = "",
    bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      output += "\r\n ";
      bytes = 1;
    }
    output += char;
    bytes += size;
  }
  return output;
}
export function calendarIcs(event: CalendarEvent, now = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AthRecs//Race calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${compact(now.toISOString().replace(/\.\d{3}Z$/, "Z"))}`,
    event.startUtc
      ? `DTSTART:${compact(event.startUtc)}`
      : `DTSTART;VALUE=DATE:${compact(event.date)}`,
    ...(event.startUtc
      ? event.endUtc
        ? [`DTEND:${compact(event.endUtc)}`]
        : []
      : [`DTEND;VALUE=DATE:${compact(event.endDateExclusive)}`]),
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    `URL:${event.pageUrl}`,
    `STATUS:${event.provisional ? "TENTATIVE" : "CONFIRMED"}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
const htmlText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export function calendarLinks(event: CalendarEvent) {
  const google = new URL("https://calendar.google.com/calendar/render");
  google.search = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: event.startUtc
      ? `${compact(event.startUtc)}/${compact(event.endUtc ?? event.startUtc)}`
      : `${compact(event.date)}/${compact(event.endDateExclusive)}`,
    details: htmlText(event.description),
    location: event.location,
    ...(event.timeZone ? { ctz: event.timeZone } : {}),
  }).toString();
  const outlook = (host: string) => {
    const url = new URL(`https://${host}/calendar/0/deeplink/compose`);
    url.search = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: event.title,
      startdt: event.startUtc ?? event.date,
      enddt: event.startUtc ? (event.endUtc ?? event.startUtc) : event.endDateExclusive,
      body: htmlText(event.description),
      location: event.location,
      ...(event.startUtc ? {} : { allday: "true" }),
    }).toString();
    return url.href;
  };
  return {
    google: google.href,
    outlook: outlook("outlook.live.com"),
    office: outlook("outlook.office.com"),
  };
}
export function calendarFilename(event: CalendarEvent): string {
  const name =
    event.title
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90) || "athrecs-event";
  return `${name}-${event.date}.ics`;
}
