/** IANA time zones for race venues — start times are always local to the course. */

const COUNTRY_TZ: Record<string, string> = {
  england: "Europe/London",
  scotland: "Europe/London",
  wales: "Europe/London",
  "northern ireland": "Europe/London",
  "united kingdom": "Europe/London",
  ireland: "Europe/Dublin",
  jersey: "Europe/London",
  guernsey: "Europe/London",
  "isle of man": "Europe/Isle_of_Man",
  gibraltar: "Europe/Gibraltar",
  "falkland islands": "Atlantic/Stanley",
  "saint helena": "Atlantic/St_Helena",
  france: "Europe/Paris",
  belgium: "Europe/Brussels",
  germany: "Europe/Berlin",
  switzerland: "Europe/Zurich",
  spain: "Europe/Madrid",
  italy: "Europe/Rome",
  netherlands: "Europe/Amsterdam",
  portugal: "Europe/Lisbon",
  greece: "Europe/Athens",
  cyprus: "Asia/Nicosia",
  poland: "Europe/Warsaw",
  austria: "Europe/Vienna",
  denmark: "Europe/Copenhagen",
  finland: "Europe/Helsinki",
  norway: "Europe/Oslo",
  sweden: "Europe/Stockholm",
  lithuania: "Europe/Vilnius",
  estonia: "Europe/Tallinn",
  iceland: "Atlantic/Reykjavik",
  czechia: "Europe/Prague",
  "czech republic": "Europe/Prague",
  slovakia: "Europe/Bratislava",
  hungary: "Europe/Budapest",
  slovenia: "Europe/Ljubljana",
  albania: "Europe/Tirane",
  "united states": "America/New_York",
  canada: "America/Toronto",
  japan: "Asia/Tokyo",
  australia: "Australia/Sydney",
  "new zealand": "Pacific/Auckland",
  "south africa": "Africa/Johannesburg",
  namibia: "Africa/Windhoek",
  eswatini: "Africa/Mbabane",
  singapore: "Asia/Singapore",
  malaysia: "Asia/Kuala_Lumpur",
  moldova: "Europe/Chisinau",
  peru: "America/Lima",
  algeria: "Africa/Algiers",
  "saudi arabia": "Asia/Riyadh",
  tunisia: "Africa/Tunis",
  senegal: "Africa/Dakar",
  mozambique: "Africa/Maputo",
  tahiti: "Pacific/Tahiti",
  "french polynesia": "Pacific/Tahiti",
  turkey: "Europe/Istanbul",
  egypt: "Africa/Cairo",
  china: "Asia/Shanghai",
  chile: "America/Santiago",
  "united arab emirates": "Asia/Dubai",
  iran: "Asia/Tehran",
  jordan: "Asia/Amman",
  bermuda: "Atlantic/Bermuda",
  "costa rica": "America/Costa_Rica",
  venezuela: "America/Caracas",
  uruguay: "America/Montevideo",
  kyrgyzstan: "Asia/Bishkek",
  benin: "Africa/Porto-Novo",
  morocco: "Africa/Casablanca",
  brazil: "America/Sao_Paulo",
  argentina: "America/Argentina/Buenos_Aires",
  taiwan: "Asia/Taipei",
  "south korea": "Asia/Seoul",
  "hong kong": "Asia/Hong_Kong",
  qatar: "Asia/Qatar",
  philippines: "Asia/Manila",
  malta: "Europe/Malta",
  latvia: "Europe/Riga",
};

const REGION_TZ: Record<string, string> = {
  // Australia
  "western australia": "Australia/Perth",
  "south australia": "Australia/Adelaide",
  "northern territory": "Australia/Darwin",
  queensland: "Australia/Brisbane",
  tasmania: "Australia/Hobart",
  victoria: "Australia/Melbourne",
  "new south wales": "Australia/Sydney",
  "australian capital territory": "Australia/Sydney",
  // New Zealand
  southland: "Pacific/Auckland",
  otago: "Pacific/Auckland",
  canterbury: "Pacific/Auckland",
  // USA
  california: "America/Los_Angeles",
  oregon: "America/Los_Angeles",
  washington: "America/Los_Angeles",
  "washington dc": "America/New_York",
  nevada: "America/Los_Angeles",
  arizona: "America/Phoenix",
  colorado: "America/Denver",
  utah: "America/Denver",
  "new mexico": "America/Denver",
  montana: "America/Denver",
  wyoming: "America/Denver",
  idaho: "America/Boise",
  texas: "America/Chicago",
  illinois: "America/Chicago",
  wisconsin: "America/Chicago",
  minnesota: "America/Chicago",
  iowa: "America/Chicago",
  missouri: "America/Chicago",
  arkansas: "America/Chicago",
  louisiana: "America/Chicago",
  oklahoma: "America/Chicago",
  kansas: "America/Chicago",
  nebraska: "America/Chicago",
  "south dakota": "America/Chicago",
  "north dakota": "America/Chicago",
  alabama: "America/Chicago",
  mississippi: "America/Chicago",
  tennessee: "America/Chicago",
  kentucky: "America/New_York",
  florida: "America/New_York",
  georgia: "America/New_York",
  "north carolina": "America/New_York",
  "south carolina": "America/New_York",
  virginia: "America/New_York",
  "west virginia": "America/New_York",
  maryland: "America/New_York",
  delaware: "America/New_York",
  pennsylvania: "America/New_York",
  "new york": "America/New_York",
  "new jersey": "America/New_York",
  connecticut: "America/New_York",
  "rhode island": "America/New_York",
  massachusetts: "America/New_York",
  "new hampshire": "America/New_York",
  vermont: "America/New_York",
  maine: "America/New_York",
  ohio: "America/New_York",
  michigan: "America/Detroit",
  indiana: "America/Indiana/Indianapolis",
  alaska: "America/Anchorage",
  hawaii: "Pacific/Honolulu",
  // Canada
  "british columbia": "America/Vancouver",
  alberta: "America/Edmonton",
  saskatchewan: "America/Regina",
  manitoba: "America/Winnipeg",
  ontario: "America/Toronto",
  quebec: "America/Toronto",
  "nova scotia": "America/Halifax",
  "new brunswick": "America/Moncton",
  "prince edward island": "America/Halifax",
  "newfoundland and labrador": "America/St_Johns",
};

export type PlaceTime = {
  /** An edition-specific, verified venue zone takes precedence over country defaults. */
  timeZone?: string | null;
  country?: string | null;
  county?: string | null;
  date?: string | null;
  nation?: string | null;
};

export function timeZoneForPlace(place?: PlaceTime | null): string {
  if (place?.timeZone) return place.timeZone;
  const county = (place?.county || "").trim().toLowerCase();
  const country = (place?.country || place?.nation || "").trim().toLowerCase();
  if (county && REGION_TZ[county]) return REGION_TZ[county];
  if (country && COUNTRY_TZ[country]) return COUNTRY_TZ[country];
  return "Europe/London";
}

export function timeZoneAbbr(timeZone: string, date = "2026-08-15"): string {
  const known = fixedAbbr(timeZone, date);
  if (known) return known;

  const instant = new Date(`${date}T12:00:00.000Z`);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(instant);
  const name = parts.find((p) => p.type === "timeZoneName")?.value || "";

  if (timeZone === "Europe/London" || timeZone === "Europe/Isle_of_Man") {
    if (/BST|GMT\+1|UTC\+1|\+01/i.test(name)) return "BST";
    return "GMT";
  }
  if (timeZone === "Europe/Dublin") {
    if (/IST|GMT\+1|UTC\+1|\+01/i.test(name)) return "IST";
    return "GMT";
  }
  if (/^GMT([+-]\d)/.test(name)) return name.replace("GMT", "UTC");
  return name || "GMT";
}

/** Southern-hemisphere DST roughly first Sunday of October → first Sunday of April. */
function southernSummer(date: string): boolean {
  const m = Number(date.slice(5, 7));
  return m >= 10 || m <= 3;
}

function usSummer(date: string): boolean {
  const m = Number(date.slice(5, 7));
  return m >= 3 && m <= 10;
}

function fixedAbbr(timeZone: string, date: string): string | null {
  const table: Record<string, string> = {
    "Asia/Tokyo": "JST",
    "Asia/Singapore": "SGT",
    "Asia/Kuala_Lumpur": "MYT",
    "Asia/Nicosia": "EEST",
    "Africa/Johannesburg": "SAST",
    "Africa/Mbabane": "SAST",
    "Africa/Windhoek": "CAT",
    "Australia/Perth": "AWST",
    "Australia/Brisbane": "AEST",
    "Australia/Darwin": "ACST",
    "Atlantic/Reykjavik": "GMT",
    "Atlantic/St_Helena": "GMT",
    "Atlantic/Stanley": "FKST",
    "Pacific/Honolulu": "HST",
    "America/Phoenix": "MST",
    "America/Regina": "CST",
  };
  if (table[timeZone]) return table[timeZone];

  if (timeZone === "Australia/Sydney" || timeZone === "Australia/Melbourne" || timeZone === "Australia/Hobart") {
    return southernSummer(date) ? "AEDT" : "AEST";
  }
  if (timeZone === "Australia/Adelaide") return southernSummer(date) ? "ACDT" : "ACST";
  if (timeZone === "Pacific/Auckland") return southernSummer(date) ? "NZDT" : "NZST";

  if (timeZone === "America/New_York" || timeZone === "America/Detroit" || timeZone === "America/Indiana/Indianapolis") {
    return usSummer(date) ? "EDT" : "EST";
  }
  if (timeZone === "America/Chicago") return usSummer(date) ? "CDT" : "CST";
  if (timeZone === "America/Denver" || timeZone === "America/Boise") return usSummer(date) ? "MDT" : "MST";
  if (timeZone === "America/Los_Angeles") return usSummer(date) ? "PDT" : "PST";
  if (timeZone === "America/Anchorage") return usSummer(date) ? "AKDT" : "AKST";
  if (timeZone === "America/Toronto") return usSummer(date) ? "EDT" : "EST";
  if (timeZone === "America/Vancouver") return usSummer(date) ? "PDT" : "PST";
  if (timeZone === "America/Edmonton") return usSummer(date) ? "MDT" : "MST";
  if (timeZone === "America/Winnipeg") return usSummer(date) ? "CDT" : "CST";
  if (timeZone === "America/Halifax" || timeZone === "America/Moncton") return usSummer(date) ? "ADT" : "AST";
  if (timeZone === "America/St_Johns") return usSummer(date) ? "NDT" : "NST";

  // European clock changes depend on the exact date, not the month.
  // Let timeZoneAbbr use the IANA rules through Intl.
  return null;
}

export function formatLocalClock(
  raw: string | null | undefined,
  place?: PlaceTime | null,
): string | null {
  if (!raw) return null;
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})(?::[0-5]\d)?$/);
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  const clock = `${String(Number(m[1])).padStart(2, "0")}:${m[2]}`;
  const tz = timeZoneForPlace(place);
  const abbr = timeZoneAbbr(tz, place?.date || "2026-08-15");
  return `${clock} ${abbr}`;
}

/** Calendar exports must not use the display helper's guessed country/default zone. */
export function calendarTimeZoneForPlace(place?: PlaceTime | null): string | null {
  const country = (place?.country || place?.nation || "").trim().toLowerCase();
  const region = (place?.county || "").trim().toLowerCase();
  const singleZone = new Set([
    "england", "scotland", "wales", "northern ireland", "united kingdom", "ireland",
    "jersey", "guernsey", "isle of man", "gibraltar", "belgium", "germany", "switzerland",
    "italy", "poland", "austria", "finland", "sweden", "lithuania", "estonia", "iceland",
    "czechia", "czech republic", "slovakia", "hungary", "slovenia", "albania", "japan", "south africa",
    "namibia", "eswatini", "singapore", "malaysia", "moldova", "peru", "algeria", "saudi arabia",
    "tunisia", "senegal", "mozambique", "turkey", "egypt", "china", "united arab emirates",
    "iran", "jordan", "bermuda", "costa rica", "venezuela", "uruguay", "kyrgyzstan", "benin",
    "argentina", "taiwan", "south korea", "hong kong", "qatar", "philippines", "malta", "latvia",
  ]);
  if (singleZone.has(country)) return COUNTRY_TZ[country] ?? null;
  // Only unambiguous, country-qualified regions. Split states/provinces need an explicit zone.
  const regions: Record<string, string[]> = {
    "united states": ["california", "washington", "colorado", "utah", "new mexico", "wyoming", "illinois", "wisconsin", "minnesota", "iowa", "missouri", "arkansas", "louisiana", "oklahoma", "alabama", "mississippi", "georgia", "north carolina", "south carolina", "virginia", "west virginia", "maryland", "delaware", "pennsylvania", "new york", "new jersey", "connecticut", "rhode island", "massachusetts", "new hampshire", "vermont", "maine", "ohio", "hawaii", "washington dc"],
    canada: ["alberta", "manitoba", "nova scotia", "new brunswick", "prince edward island"],
    australia: ["south australia", "northern territory", "queensland", "tasmania", "victoria", "australian capital territory"],
  };
  return regions[country]?.includes(region) ? REGION_TZ[region] : null;
}
