import { countryFlag } from "./country-flags.ts";

/** Preserve every supplied place without inferring missing administrative levels. */
export function compactFixtureLocation(place: {
  town?: string | null;
  city?: string | null;
  county?: string | null;
  state?: string | null;
  country?: string | null;
}) {
  const country = countryFlag(place.country);
  const abbreviations: Record<string, string> = {
    "GB-ENG": "ENG",
    "GB-SCT": "SCO",
    "GB-WLS": "WAL",
    GB: "UK",
    US: "USA",
  };
  const countryCode =
    country.name === "Northern Ireland"
      ? "NIR"
      : (abbreviations[country.code ?? ""] ?? country.code) || country.name;
  const seen = new Set(
    [place.country, country.name, countryCode]
      .filter((part): part is string => !!part)
      .map((part) => part.trim().toLocaleLowerCase("en")),
  );
  const parts: string[] = [];
  for (const value of [place.town, place.city, place.county, place.state]) {
    for (const part of (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)) {
      const key = part.toLocaleLowerCase("en");
      if (!seen.has(key)) {
        parts.push(part);
        seen.add(key);
      }
    }
  }
  return { text: parts.join(", "), countryCode, countryName: country.name };
}

/** Only unambiguous country defaults. Multi-zone countries require a checked venue zone. */
const COUNTRY_ZONES: Record<string, string> = {
  England: "Europe/London",
  Scotland: "Europe/London",
  Wales: "Europe/London",
  "Northern Ireland": "Europe/London",
  "United Kingdom": "Europe/London",
  Ireland: "Europe/Dublin",
  Jersey: "Europe/Jersey",
  Guernsey: "Europe/Guernsey",
  "Isle of Man": "Europe/Isle_of_Man",
  Belgium: "Europe/Brussels",
  Netherlands: "Europe/Amsterdam",
  Germany: "Europe/Berlin",
  Italy: "Europe/Rome",
  Switzerland: "Europe/Zurich",
  Austria: "Europe/Vienna",
  Poland: "Europe/Warsaw",
  Sweden: "Europe/Stockholm",
  Finland: "Europe/Helsinki",
  Greece: "Europe/Athens",
  Iceland: "Atlantic/Reykjavik",
  Czechia: "Europe/Prague",
  "Czech Republic": "Europe/Prague",
  Hungary: "Europe/Budapest",
  Slovenia: "Europe/Ljubljana",
  Slovakia: "Europe/Bratislava",
  Estonia: "Europe/Tallinn",
  Latvia: "Europe/Riga",
  Lithuania: "Europe/Vilnius",
  Malta: "Europe/Malta",
  Romania: "Europe/Bucharest",
  Bulgaria: "Europe/Sofia",
  Japan: "Asia/Tokyo",
  China: "Asia/Shanghai",
  Singapore: "Asia/Singapore",
  Malaysia: "Asia/Kuala_Lumpur",
  "Hong Kong": "Asia/Hong_Kong",
  Taiwan: "Asia/Taipei",
  "South Korea": "Asia/Seoul",
  India: "Asia/Kolkata",
  Israel: "Asia/Jerusalem",
  "South Africa": "Africa/Johannesburg",
  Mauritius: "Indian/Mauritius",
  Kenya: "Africa/Nairobi",
  Ethiopia: "Africa/Addis_Ababa",
  Guatemala: "America/Guatemala",
  Qatar: "Asia/Qatar",
  "United Arab Emirates": "Asia/Dubai",
};

export function fixtureTimeZone(country?: string | null): string | null {
  return COUNTRY_ZONES[country?.trim() ?? ""] ?? null;
}

export function fixtureSummary(summary: string | null, sport: string, city: string | null): string {
  const clean = (summary ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const text = clean || `${sport} event${city ? ` in ${city}` : ""}.`;
  return text.length <= 155 ? text : `${text.slice(0, 152).replace(/\s+\S*$/, "")}…`;
}

function offsetAt(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return (
    (Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    ) -
      instant) /
    60000
  );
}

/** Resolve wall-clock time against IANA rules on the race date, including DST boundaries. */
export function formatFixtureStart(
  time: string | null,
  date: string,
  timeZone: string | null,
): string {
  const match = time?.trim().match(/^(\d{1,2}):(\d{2})(?::00)?$/);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return "Start time TBC";
  const clock = `${match[1].padStart(2, "0")}:${match[2]}`;
  if (!timeZone) return `${clock} local · time zone TBC`;
  const wall = Date.parse(`${date}T${clock}:00Z`);
  if (!Number.isFinite(wall)) return `${clock} local · time zone TBC`;
  try {
    // Sample both sides of a clock change. Ambiguous/nonexistent local times
    // need organiser clarification rather than silently choosing an offset.
    const offsets = new Set(
      [-86400000, 0, 86400000].map((delta) => offsetAt(wall + delta, timeZone)),
    );
    const instants = [...offsets]
      .map((offset) => wall - offset * 60000)
      .filter((instant) => instant + offsetAt(instant, timeZone) * 60000 === wall);
    if (instants.length !== 1) return `${clock} local · time zone TBC`;
    const instant = instants[0];
    const offset = offsetAt(instant, timeZone);
    const offsetLabel = `UTC${offset ? `${offset > 0 ? "+" : "−"}${Math.floor(Math.abs(offset) / 60)}${Math.abs(offset) % 60 ? `:${String(Math.abs(offset) % 60).padStart(2, "0")}` : ""}` : ""}`;
    const locale = timeZone.startsWith("America/")
      ? "en-US"
      : timeZone.startsWith("Australia/")
        ? "en-AU"
        : "en-GB";
    let abbr =
      new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "short" })
        .formatToParts(instant)
        .find((part) => part.type === "timeZoneName")?.value ?? timeZone;
    if (timeZone === "Europe/Dublin") abbr = offset === 60 ? "IST" : "GMT";
    // ICU uses GMT offsets for some zones; retain an explicit, unambiguous IANA label there.
    if (/^(GMT|UTC)[+−-]/.test(abbr)) abbr = timeZone;
    return `${clock} ${abbr} (${offsetLabel})`;
  } catch {
    return `${clock} local · time zone TBC`;
  }
}
