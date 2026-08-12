import { venueDetails, type VenueDetails, type VenueNation } from "@/data/venue-details";

const NI_HINT =
  /\b(belfast|antrim|lisburn|derry|londonderry|newry|omagh|enniskillen|coleraine|northern ireland|\bBT\d)/i;
const IE_HINT = /\b(dublin|cork|galway|limerick|waterford|ireland)\b/i;
const SC_HINT =
  /\b(scotland|glasgow|edinburgh|aberdeen|dundee|inverness|perth|stirling|fife|highlands?)\b/i;
const WA_HINT = /\b(wales|cymru|cardiff|swansea|newport|wrexham|bangor|aberystwyth)\b/i;

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
  country?: string | null;
  county?: string | null;
  city?: string | null;
  address?: string | null;
}): VenueNation {
  const stored = input.slug ? venueDetails[input.slug] : undefined;
  if (stored?.nation) return stored.nation;
  const blob = [input.country, input.county, input.city, input.address]
    .filter(Boolean)
    .join(" ");
  if (NI_HINT.test(blob)) return "Northern Ireland";
  if (IE_HINT.test(blob) && !/northern/i.test(blob)) return "Ireland";
  if (SC_HINT.test(blob) && !/\b(newcastle|manchester|liverpool|leeds)\b/i.test(blob)) {
    return "Scotland";
  }
  if (WA_HINT.test(blob)) return "Wales";
  return "England";
}

export function venueForEvent(input: {
  slug: string;
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
  };
}
