import { validCalendarDate, type CalendarRace } from "./event-calendar.ts";
import { publicCatalogueText } from "./public-catalogue-content.ts";

export type RaceShareData = { title: string; text: string; url: string };

const publicHosts = new Set(["athrecs.com", "www.athrecs.com", "runrecs.com", "www.runrecs.com"]);
const clean = (value: string | null | undefined, limit: number) =>
  publicCatalogueText(value ?? "")
    // eslint-disable-next-line no-control-regex -- Sharing uses plain, single-line public text.
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);

/** Share the supplied public race page, never the current browser or private feed URL. */
export function buildRaceShareData(race: CalendarRace): RaceShareData | null {
  if (!race.pageUrl || race.pageUrl.length > 2000 || /[\r\n\t]/.test(race.pageUrl)) return null;
  let url: URL;
  try {
    url = new URL(race.pageUrl);
  } catch {
    return null;
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    !publicHosts.has(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    !/^\/(?:races|running\/races|running\/ultramarathons)\/[^/]+\/?$/.test(url.pathname)
  ) {
    return null;
  }
  url.protocol = "https:";
  url.search = "";
  url.hash = "";

  const title = [clean(race.name, 200) || "Race", clean(race.distance, 100)]
    .filter(Boolean)
    .join(" · ");
  const date = validCalendarDate(race.date)
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${race.date}T00:00:00Z`))
    : "";
  const status = /cancelled|canceled/i.test(race.status ?? "")
    ? "Cancelled"
    : /postponed/i.test(race.status ?? "")
      ? "Postponed"
      : /finished/i.test(race.status ?? "")
        ? "Past race"
        : "";
  return {
    title,
    text: [
      title,
      date && (race.provisional ? `Provisional date: ${date}` : date),
      clean(race.location, 200),
      status,
    ]
      .filter(Boolean)
      .join(" · "),
    url: url.href,
  };
}
