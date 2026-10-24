import { validCalendarDate, type CalendarRace } from "./event-calendar.ts";
import { publicCatalogueText } from "./public-catalogue-content.ts";

export type RaceShareData = { title: string; text: string; url: string };

const publicHosts = new Set(["athrecs.com", "www.athrecs.com", "runrecs.com", "www.runrecs.com"]);
const clean = (value: string | null | undefined, limit: number) =>
  Array.from(
    publicCatalogueText(value ?? "")
      // eslint-disable-next-line no-control-regex -- Sharing uses plain, single-line public text.
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/[\uD800-\uDFFF]/gu, "\uFFFD")
      .replace(/\s+/g, " ")
      .trim(),
  )
    .slice(0, limit)
    .join("");

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
      // Keep qualifications visible even when a sharing service shortens the message.
      status,
      race.provisional ? (date ? `Provisional date: ${date}` : "Date to be confirmed") : "",
      title,
      !race.provisional && date,
      clean(race.location, 200),
    ]
      .filter(Boolean)
      .join(" · "),
    url: url.href,
  };
}

export type RaceShareLink = {
  id: "whatsapp" | "facebook" | "x" | "telegram" | "email";
  label: string;
  href: string;
};

/** Plain links contact the chosen service only after the visitor selects it. */
export function buildRaceShareLinks(data: RaceShareData): RaceShareLink[] {
  const url = encodeURIComponent(data.url);
  const text = encodeURIComponent(data.text);
  const message = encodeURIComponent(`${data.text}\r\n\r\n${data.url}`);
  // Leave room for X's shortened URL, including text with double-weight characters.
  const characters = Array.from(data.text);
  const shortText = characters.length > 120 ? characters.slice(0, 119).join("") + "…" : data.text;
  return [
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${message}` },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      id: "x",
      label: "X",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shortText)}&url=${url}`,
    },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${text}` },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(data.title)}&body=${message}`,
    },
  ];
}
