import { collectionRegion, collectionRegions } from "./regions.ts";
/** ISO 3166-1 countries and territories, plus Kosovo. Separate from public filters. */
const ISO_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW XK".split(
    " ",
  );
const names = new Intl.DisplayNames(["en"], { type: "region" });
const overrides: Record<string, string> = {
  GB: "United Kingdom",
  US: "United States",
  IE: "Ireland",
  KR: "South Korea",
  KP: "North Korea",
  CZ: "Czechia",
  TR: "Turkey",
  CD: "Democratic Republic of the Congo",
  CG: "Republic of the Congo",
  PS: "Palestine",
  XK: "Kosovo",
};
export const COLLECTOR_COUNTRIES = ISO_CODES.map((code) => ({
  code,
  name: overrides[code] ?? names.of(code) ?? code,
})).sort((a, b) => a.name.localeCompare(b.name));
export type Scope = {
  countries: string[];
  dateFrom: string;
  dateTo: string;
  min: number;
  max: number;
  unit: "km" | "mi";
  /** Missing value preserves two passes for older clients and saved runs. */
  passes?: 1 | 2;
  /** Explicit opt-in preserves saved country-only runs and older clients. */
  regional?: boolean;
  /** Missing country entry means every supported region in that country. */
  regions?: Record<string, string[]>;
};
export type Window = {
  dateFrom: string;
  dateTo: string;
  country: string;
  regionCode?: string;
  pass: 1 | 2;
};
export type Candidate = {
  name: string;
  countryCode: string;
  country: string;
  city: string;
  region: string;
  regionCode?: string;
  date: string;
  distance: number;
  unit: "km" | "mi";
  distanceLabel: string;
  distanceKm: number;
  surface: string;
  sourceUrl: string;
  entryUrl: string;
  startTime: string;
  entryStatus: "Open" | "Closed" | "TBC";
  evidence: string;
  sourceKind: "organiser" | "entry" | "governing-body";
  notes: string;
};
export type Identity = {
  id: number;
  slug: string;
  name: string;
  country: string;
  website: string | null;
};
export type Edition = {
  eventId: number;
  date: string;
  distance: string;
  distanceKm: number;
  source: string | null;
};
export function realDate(v: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(Date.parse(v)) &&
    new Date(v + "T00:00:00Z").toISOString().slice(0, 10) === v
  );
}
export function calendarMonthRange(month: string, months: 1 | 3) {
  const dateFrom = `${month}-01`;
  if (!realDate(dateFrom) || ![1, 3].includes(months)) return null;
  const end = new Date(dateFrom + "T00:00:00Z");
  end.setUTCMonth(end.getUTCMonth() + months);
  end.setUTCDate(0);
  const dateTo = end.toISOString().slice(0, 10);
  return realDate(dateTo) ? { dateFrom, dateTo } : null;
}
export function validateScope(input: Scope): Scope {
  if (
    !input ||
    !Array.isArray(input.countries) ||
    !input.countries.length ||
    input.countries.some((c) => !ISO_CODES.includes(c))
  )
    throw new Error("Choose at least one valid country.");
  if (!realDate(input.dateFrom) || !realDate(input.dateTo) || input.dateFrom > input.dateTo)
    throw new Error("Choose a valid inclusive date range.");
  if ((Date.parse(input.dateTo) - Date.parse(input.dateFrom)) / 86400000 > 1096)
    throw new Error("Choose up to three years per run.");
  if (input.passes !== undefined && input.passes !== 1 && input.passes !== 2)
    throw new Error("Choose Quick or Thorough scan.");
  if (
    !["km", "mi"].includes(input.unit) ||
    !Number.isFinite(input.min) ||
    !Number.isFinite(input.max) ||
    input.min < 0 ||
    input.max <= input.min ||
    input.max * (input.unit === "mi" ? 1.609344 : 1) > 804.6720001
  )
    throw new Error("Choose a positive range through 500 miles / 804.672 km.");
  if (input.regional !== undefined && typeof input.regional !== "boolean")
    throw new Error("Choose a valid regional collection mode.");
  if (
    input.regions !== undefined &&
    (!input.regions || typeof input.regions !== "object" || Array.isArray(input.regions))
  )
    throw new Error("Choose valid states or regions.");
  const regions: Record<string, string[]> = {};
  for (const [country, codes] of Object.entries(input.regions ?? {})) {
    if (
      !input.regional ||
      !input.countries.includes(country) ||
      !Array.isArray(codes) ||
      !codes.length ||
      codes.some((code) => !collectionRegion(country, code))
    )
      throw new Error("Choose at least one valid region within each selected country.");
    regions[country] = [...new Set(codes)].sort();
  }
  return {
    countries: [...new Set(input.countries)].sort(),
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    min: input.min,
    max: input.max,
    unit: input.unit,
    passes: input.passes ?? 2,
    regional: input.regional === true,
    regions,
  };
}
export function selectedRegions(scope: Scope, country: string) {
  if (!scope.regional) return [];
  return collectionRegions(country).filter(
    (r) => !scope.regions?.[country] || scope.regions[country].includes(r.code),
  );
}
export function planScope(input: Scope): Window[] {
  const s = validateScope(input);
  const windows: Window[] = [];
  const passes: (1 | 2)[] = s.passes === 1 ? [1] : [1, 2];
  for (const pass of passes)
    for (const country of s.countries) {
      const regions = selectedRegions(s, country);
      // A regional country has region jobs only; never a parallel country-wide duplicate.
      for (const region of regions.length ? regions : [undefined]) {
        let start = s.dateFrom;
        while (start <= s.dateTo) {
          const d = new Date(start + "T00:00:00Z");
          const next = new Date(
            Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3 + 3, 1),
          );
          const end = new Date(+next - 86400000).toISOString().slice(0, 10);
          windows.push({
            country,
            ...(region ? { regionCode: region.code } : {}),
            pass,
            dateFrom: start,
            dateTo: end < s.dateTo ? end : s.dateTo,
          });
          start = next.toISOString().slice(0, 10);
        }
      }
    }
  return windows;
}
export function safeUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/.test(u.hostname) &&
      u.hostname.includes(".")
    );
  } catch {
    return false;
  }
}
export function normalizedName(v: string) {
  return v
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
export function normalizedUrl(v: string | null) {
  try {
    const u = new URL(v ?? "");
    u.hash = "";
    for (const k of [...u.searchParams.keys()])
      if (/^(utm_|fbclid|gclid)/.test(k)) u.searchParams.delete(k);
    return u.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}
export function candidateProblems(c: Candidate, job: Window, scope: Scope): string[] {
  const issues: string[] = [];
  const km = c.distance * (c.unit === "mi" ? 1.609344 : 1);
  const factor = scope.unit === "mi" ? 1.609344 : 1;
  if (!realDate(c.date) || c.date < job.dateFrom || c.date > job.dateTo)
    issues.push("Exact date outside this window or unconfirmed");
  if (
    !["km", "mi"].includes(c.unit) ||
    !Number.isFinite(km) ||
    km <= 0 ||
    km < scope.min * factor ||
    km > scope.max * factor + 1e-7
  )
    issues.push("Distance outside scope or open-ended");
  if (c.countryCode !== job.country || !c.country || !c.city)
    issues.push("Start country or venue unresolved");
  if (
    job.regionCode &&
    (!collectionRegion(job.country, job.regionCode) ||
      c.regionCode !== job.regionCode ||
      !c.region.trim())
  )
    issues.push("Start state or region is outside this job or unresolved");
  if (
    !c.name ||
    !c.distanceLabel ||
    !safeUrl(c.sourceUrl) ||
    !["organiser", "entry", "governing-body"].includes(c.sourceKind) ||
    c.evidence.trim().length < 20
  )
    issues.push("Primary date/distance evidence missing");
  if (c.entryUrl && !safeUrl(c.entryUrl)) issues.push("Invalid entry URL");
  if (c.startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(c.startTime))
    issues.push("Invalid start time");
  if (!["Open", "Closed", "TBC"].includes(c.entryStatus)) issues.push("Invalid entry availability");
  return issues;
}
function nameHash(name: string) {
  let hash = 2166136261;
  for (const c of name) hash = Math.imul(hash ^ c.codePointAt(0)!, 16777619);
  return (hash >>> 0).toString(16);
}
export function reconcile(
  c: Candidate,
  events: Identity[],
  editions: Edition[],
  pending: { eventSlug: string; date: string }[] = [],
): {
  status: "review" | "duplicate" | "held";
  reason: string;
  eventSlug: string;
  eventId: number | null;
} {
  const source = normalizedUrl(c.sourceUrl);
  const name = normalizedName(c.name);
  const sourceEventIds = new Set(
    editions
      .filter((d) => d.date === c.date && source && normalizedUrl(d.source) === source)
      .map((d) => d.eventId),
  );
  const matches = events.filter(
    (e) =>
      normalizedName(e.name) === name ||
      (source && normalizedUrl(e.website) === source && new URL(source).pathname !== "/") ||
      sourceEventIds.has(e.id),
  );
  if (matches.length > 1)
    return {
      status: "held",
      reason: "Multiple canonical identities need review",
      eventSlug: "",
      eventId: null,
    };
  const event = matches[0];
  const slug =
    event?.slug ??
    `${
      c.name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\b20\d{2}\b/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `running-race-${nameHash(name)}`
    }-${c.countryCode.toLowerCase()}`;
  const base = { eventSlug: slug, eventId: event?.id ?? null };
  if (
    event &&
    event.country !== c.country &&
    !(
      c.countryCode === "GB" &&
      ["United Kingdom", "England", "Wales", "Scotland", "Northern Ireland"].includes(event.country)
    )
  )
    return {
      ...base,
      status: "held",
      reason: "Canonical event country differs from the verified start location",
    };
  if (events.some((e) => e.slug === slug && e.id !== event?.id))
    return { ...base, status: "held", reason: "Slug already belongs to a different event" };
  if (pending.some((p) => p.eventSlug === slug && p.date === c.date))
    return { ...base, status: "held", reason: "Overlapping pending import" };
  const same = editions.filter((d) => d.eventId === event?.id && d.date === c.date);
  if (same.some((d) => Math.abs(d.distanceKm - c.distanceKm) <= 0.025))
    return {
      ...base,
      status: "duplicate",
      reason: "Equivalent event, date and distance already exists",
    };
  if (same.some((d) => d.distance === c.distanceLabel))
    return { ...base, status: "held", reason: "Existing distance label differs numerically" };
  if (
    event &&
    editions.some(
      (d) =>
        d.eventId === event.id &&
        d.date.slice(0, 4) === c.date.slice(0, 4) &&
        d.date !== c.date &&
        Math.abs(d.distanceKm - c.distanceKm) <= 0.025,
    )
  )
    return {
      ...base,
      status: "held",
      reason: "Possible reschedule or distinct repeat date; review first",
    };
  // Similar names are deliberately held, never auto-merged, even across countries.
  if (
    !event &&
    events.some((e) => {
      const n = normalizedName(e.name);
      return n.length > 8 && name.length > 8 && (n.includes(name) || name.includes(n));
    })
  )
    return { ...base, status: "held", reason: "Possible event alias needs review" };
  return { ...base, status: "review", reason: "Check the linked primary programme before staging" };
}
