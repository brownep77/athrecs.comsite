import type { Edition, Series } from "./types";

export const TWO_OCEANS_CHECKED_AT = "2026-08-20";
export const TWO_OCEANS_WEBSITE = "https://www.twooceansmarathon.org.za/";
export const TWO_OCEANS_RESULTS = "https://admin.twooceansmarathon.org.za/ResultsOverall.aspx";
export const TWO_OCEANS_2027_SOURCE =
  "https://www.twooceansmarathon.org.za/ttom-2027-entries-open-for-night-run-friendship-run-trail-runs-and-ultra-half-marathon-ballot/";
export const TWO_OCEANS_2027_ENTRY =
  "https://enter.twooceansmarathon.org.za/two-oceans-2027/entry-windows";

const externalResultsPolicy = {
  resultsPermission: "external-link-only",
  resultsHosting: "official-organiser",
  resultsPermissionNote:
    "Link to the official Two Oceans race leaderboard only. Participant rows are not reproduced while the source remains held for rights review.",
  resultsPermissionAt: TWO_OCEANS_CHECKED_AT,
  resultsPermissionBy: "Athrecs source review",
  resultsAccess: "official-link",
} as const;

export const twoOceansSeries: Series[] = [
  {
    slug: "two-oceans-marathon",
    name: "Two Oceans Marathon",
    sport: "Running",
    country: "South Africa",
    county: "Western Cape",
    city: "Cape Town",
    area: "Cape Peninsula",
    surface: "Road",
    distances: ["Ultra", "Half"],
    summary: "Two Oceans Marathon stages a 56km road ultra and 21.1km half marathon in Cape Town.",
    description:
      "The Two Oceans weekend features the 56km Ultra Marathon around the Cape Peninsula and a 21.1km Half Marathon, with both flagship races finishing at the University of Cape Town.",
    organiser: "Two Oceans Marathon NPC",
    website: TWO_OCEANS_WEBSITE,
    featured: true,
    source_url: TWO_OCEANS_WEBSITE,
  },
];

function finishedEdition(date: string, distance: "Ultra" | "Half", distanceKm: number): Edition {
  return {
    seriesSlug: "two-oceans-marathon",
    date,
    distance,
    distanceKm,
    status: "Finished",
    source: TWO_OCEANS_RESULTS,
    notes: `${distance === "Ultra" ? "56km Ultra Marathon" : "21.1km Half Marathon"}; date verified in the official Two Oceans results archive.`,
    resultsOfficialUrl: TWO_OCEANS_RESULTS,
    ...externalResultsPolicy,
  };
}

export const twoOceansEditions: Edition[] = [
  finishedEdition("2022-04-16", "Half", 21.0975),
  finishedEdition("2022-04-17", "Ultra", 56),
  finishedEdition("2023-04-15", "Ultra", 56),
  finishedEdition("2023-04-16", "Half", 21.0975),
  finishedEdition("2024-04-13", "Ultra", 56),
  finishedEdition("2024-04-14", "Half", 21.0975),
  finishedEdition("2025-04-05", "Ultra", 56),
  finishedEdition("2025-04-06", "Half", 21.0975),
  finishedEdition("2026-04-11", "Ultra", 56),
  finishedEdition("2026-04-12", "Half", 21.0975),
  {
    seriesSlug: "two-oceans-marathon",
    date: "2027-04-03",
    distance: "Half",
    distanceKm: 21.0975,
    status: "Open",
    entryUrl: TWO_OCEANS_2027_ENTRY,
    source: TWO_OCEANS_2027_SOURCE,
    notes:
      "The official 2027 event announcement confirms the 21.1km Half Marathon for Saturday 3 April 2027.",
  },
  {
    seriesSlug: "two-oceans-marathon",
    date: "2027-04-04",
    distance: "Ultra",
    distanceKm: 56,
    status: "Open",
    entryUrl: TWO_OCEANS_2027_ENTRY,
    source: TWO_OCEANS_2027_SOURCE,
    notes:
      "The official 2027 event announcement confirms the 56km Ultra Marathon for Sunday 4 April 2027.",
  },
];
