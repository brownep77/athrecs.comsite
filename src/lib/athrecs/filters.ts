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

export function splitDistanceLabels(raw?: string | null): string[] {
  if (!raw) return [];
  const parts = raw
    .split(/[·,|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}
