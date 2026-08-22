import { venueDetails, type VenueDetails } from "@/data/venue-details";
import { displayCountryName, resolveCountry } from "@/lib/athrecs/countries";

const REGION_LABELS = new Set([
  "scotland",
  "england",
  "wales",
  "north of england",
  "south of england",
  "midlands",
]);

export function resolveNation(input: {
  slug?: string;
  name?: string | null;
  country?: string | null;
  county?: string | null;
  city?: string | null;
  address?: string | null;
  area?: string | null;
}): string {
  const stored = input.slug ? venueDetails[input.slug] : undefined;
  const info = resolveCountry({
    slug: input.slug,
    name: input.name,
    country: input.country,
    county: input.county,
    city: input.city,
    area: input.area,
    address: input.address || stored?.address,
  });
  return displayCountryName(info);
}

export function venueForEvent(input: {
  slug: string;
  name?: string | null;
  city?: string | null;
  county?: string | null;
  country?: string | null;
  area?: string | null;
}): VenueDetails {
  const stored = venueDetails[input.slug];
  const nation = resolveNation(input);
  const rawAddress =
    stored?.address ||
    [input.area, input.city, input.county].filter(Boolean).join(", ");
  const parts = rawAddress
    .split(",")
    .map((p) => p.trim())
    .filter((p) => {
      if (!p) return false;
      const lower = p.toLowerCase();
      if (REGION_LABELS.has(lower)) return false;
      if (lower === "united kingdom" || lower === "uk") return false;
      if (nation !== "United Kingdom" && (lower === "scotland" || lower === "england" || lower === "wales")) {
        return false;
      }
      return true;
    });
  const address = parts.join(", ") || input.city || "Venue TBC";
  return {
    nation,
    address: parts.join(", ") || input.city || "Venue TBC",
    postcode: stored?.postcode ?? null,
    parking: stored?.parking ?? (input.city ? `Public parking in ${input.city} — confirm locally` : null),
    busStop:
      stored?.busStop ??
      (input.city ? `Local buses serving ${input.city} — check Traveline` : null),
    trainStation: stored?.trainStation ?? null,
    airport: stored?.airport ?? null,
  };
}

export function matchesPostcodeQuery(
  query: string | null | undefined,
  input: { slug?: string; area?: string | null; city?: string | null; address?: string | null },
): boolean {
  const raw = query?.trim();
  if (!raw) return true;
  const needle = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (needle.length < 2) return true;
  const stored = input.slug ? venueDetails[input.slug] : undefined;
  const hay = [stored?.postcode, stored?.address, input.area, input.city, input.address]
    .filter(Boolean)
    .join(" ")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return hay.includes(needle);
}
