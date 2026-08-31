export const DISTANCE_FILTERS = [
  "All",
  "1K",
  "1mi",
  "2K",
  "2.62K",
  "3K",
  "5K",
  "4mi",
  "6K",
  "6.5K",
  "7K",
  "7.5K",
  "8K",
  "5mi",
  "9K",
  "6mi",
  "10K",
  "Quarter",
  "11K",
  "7mi",
  "12K",
  "8mi",
  "13K",
  "13.1K",
  "14K",
  "15K",
  "15.5K",
  "16K",
  "10mi",
  "17K",
  "12mi",
  "20K",
  "12.5mi",
  "21K",
  "Half",
  "Marathon",
  "Ultra",
  "Other",
] as const;

export const TERRAIN_FILTERS = [
  "All",
  "Road",
  "Trail",
  "Mixed",
  "Fell",
  "Track",
  "XC",
] as const;

export { COUNTRY_FILTERS, COUNTRY_GROUPS, PARKRUN_COUNTRY_SHORTCUTS } from "./countries";

export const SWIM_DISTANCE_FILTERS = [
  "All",
  "1K",
  "5K",
  "10K",
  "Other",
] as const;

export const FORMAT_FILTERS = [
  "All",
  "Super Sprint",
  "Sprint",
  "Standard",
  "Middle",
  "Iron",
] as const;

export const SPORTS = [
  "All",
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
  "Adventure Racing",
  "Functional Fitness",
  "Walking",
] as const;

export const DEFAULT_SPORT = "All" as const;

export type SubfilterKey = "distance" | "surface" | "format";

export type SubfilterDef = {
  key: SubfilterKey;
  label: string;
  options: readonly string[];
};

const RUNNING_SUBFILTERS: SubfilterDef[] = [
  { key: "surface", label: "Surface", options: TERRAIN_FILTERS },
  { key: "distance", label: "Distance", options: DISTANCE_FILTERS },
];

const ATHLETICS_SUBFILTERS: SubfilterDef[] = [
  {
    key: "surface",
    label: "Surface / venue",
    options: ["All", "Track", "Road", "XC", "Trail", "Fell", "Mixed"],
  },
  { key: "distance", label: "Distance", options: DISTANCE_FILTERS },
];

const PARKRUN_SUBFILTERS: SubfilterDef[] = [
  { key: "surface", label: "Surface", options: ["All", "Road", "Trail", "Mixed"] },
  { key: "distance", label: "Distance", options: ["All", "2K", "5K"] },
];

const CYCLING_SUBFILTERS: SubfilterDef[] = [
  {
    key: "surface",
    label: "Cycling surface",
    options: ["All", "Road", "Trail", "Track", "Mixed", "XC"],
  },
];

const MULTISPORT_SUBFILTERS: SubfilterDef[] = [
  { key: "surface", label: "Terrain", options: ["All", "Road", "Trail", "Mixed"] },
  { key: "format", label: "Distance / format", options: FORMAT_FILTERS },
];

const TERRAIN_AND_DISTANCE_SUBFILTERS: SubfilterDef[] = [
  { key: "surface", label: "Surface", options: TERRAIN_FILTERS },
  { key: "distance", label: "Distance", options: DISTANCE_FILTERS },
];

/**
 * Returns only the controls that are meaningful for the selected discipline.
 * "All" deliberately has no discipline-specific controls so hidden filters
 * cannot leak from one discipline into another.
 */
export function subfiltersForSport(sport: string): SubfilterDef[] {
  if (sport === "All") return [];
  if (sport === "Running") return RUNNING_SUBFILTERS;
  if (sport === "Athletics") return ATHLETICS_SUBFILTERS;
  if (sport === "Parkrun") return PARKRUN_SUBFILTERS;
  if (sport === "Cycling") return CYCLING_SUBFILTERS;
  if (sport === "Swimming") {
    return [{ key: "distance", label: "Distance", options: SWIM_DISTANCE_FILTERS }];
  }
  if (
    sport === "Triathlon" ||
    sport === "Duathlon" ||
    sport === "Aquathlon" ||
    sport === "Aquabike"
  ) {
    return MULTISPORT_SUBFILTERS;
  }
  if (sport === "OCR" || sport === "Adventure Racing" || sport === "Walking") {
    return TERRAIN_AND_DISTANCE_SUBFILTERS;
  }
  if (sport === "Rowing" || sport === "Functional Fitness") return [];
  return [];
}

export function supportsRaceGroupFilter(sport: string): boolean {
  return sport === "Running";
}

export function subfilterKeysForSport(sport: string): Set<SubfilterKey> {
  return new Set(subfiltersForSport(sport).map((filter) => filter.key));
}

export function upcomingMonths(count = 17): { value: string; label: string }[] {
  const now = new Date();
  const items: { value: string; label: string }[] = [{ value: "", label: "Any month" }];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
    items.push({ value, label });
  }
  return items;
}

export function monthToRange(month: string): { from: string; to: string } | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}

const HALF_MARATHON = /half[\s-]*marathons?/i;
const ULTRA_MARATHON = /ultra[\s-]*marathons?/i;

export function nameHasFullMarathon(name: string): boolean {
  const stripped = name
    .toLowerCase()
    .replace(/half[\s-]*marathons?/gi, " ")
    .replace(/ultra[\s-]*marathons?/gi, " ");
  return /\bmarathon\b/.test(stripped);
}

export function nameHasHalf(name: string): boolean {
  return HALF_MARATHON.test(name) || /\bhalf\b/i.test(name);
}

export function nameHasUltra(name: string): boolean {
  return ULTRA_MARATHON.test(name) || /\bultra\b/i.test(name);
}

export function searchLooksLikeMarathon(raw?: string | null): boolean {
  const q = (raw ?? "").trim().toLowerCase();
  return q === "marathon" || q === "marathons";
}

export function splitDistanceLabels(raw?: string | null): string[] {
  if (!raw) return [];
  const parts = raw
    .split(/[·,|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

/** Drop a Marathon label when the race is only a half or ultra marathon. */
export function sanitizeDistances(name: string, distances: string[]): string[] {
  const codes = [...new Set(distances.filter(Boolean))];
  if (nameHasFullMarathon(name)) return codes;
  return codes.filter((code) => code !== "Marathon");
}

export function matchesDistanceFilter(
  name: string,
  distances: string[],
  filter?: string | null,
): boolean {
  if (!filter || filter === "All") return true;
  const codes = sanitizeDistances(name, distances);
  if (filter === "Marathon") return codes.includes("Marathon");
  if (filter === "Half") return codes.includes("Half") || nameHasHalf(name);
  if (filter === "Ultra") return codes.includes("Ultra") || nameHasUltra(name);
  return codes.includes(filter);
}

export function matchesFormatFilter(name: string, format?: string | null): boolean {
  if (!format || format === "All") return true;
  const n = name.toLowerCase();
  if (format === "Super Sprint") return /super[\s-]*sprint/.test(n);
  if (format === "Sprint") return /\bsprint\b/.test(n) && !/super[\s-]*sprint/.test(n);
  if (format === "Standard") return /\b(standard|olympic)\b/.test(n);
  if (format === "Middle") return /70\.3|middle[\s-]*distance|half[\s-]*iron/.test(n);
  if (format === "Iron") {
    return /\b(ironman|iron[\s-]*distance|full[\s-]*iron)\b/.test(n) && !/70\.3|half[\s-]*iron/.test(n);
  }
  return true;
}

export function normalizePostcode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
