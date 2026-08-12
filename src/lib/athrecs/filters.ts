export const DISTANCE_FILTERS = [
  "All",
  "5K",
  "10K",
  "5mi",
  "10mi",
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

const HALF_MARATHON = /half[\s-]*marathons?/i;

export function nameHasFullMarathon(name: string): boolean {
  const stripped = name.toLowerCase().replace(/half[\s-]*marathons?/gi, " ");
  return /\bmarathon\b/.test(stripped);
}

export function nameHasHalf(name: string): boolean {
  return HALF_MARATHON.test(name) || /\bhalf\b/i.test(name);
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

/** Drop a Marathon label when the race is only a half marathon. */
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
  return codes.includes(filter);
}
