import type { Edition, Series } from "./types";

export const COMRADES_CHECKED_AT = "2026-08-20";
export const COMRADES_WEBSITE = "https://comrades.com/";

const externalResultsPolicy = {
  resultsPermission: "external-link-only",
  resultsHosting: "official-organiser",
  resultsPermissionNote:
    "Link to the official Comrades result page only. Participant rows are not reproduced while the source remains held for rights review.",
  resultsPermissionAt: COMRADES_CHECKED_AT,
  resultsPermissionBy: "Athrecs source review",
  resultsAccess: "official-link",
} as const;

export const comradesSeries: Series[] = [
  {
    slug: "comrades-marathon",
    name: "Comrades Marathon",
    sport: "Running",
    country: "South Africa",
    county: "KwaZulu-Natal",
    city: "Durban and Pietermaritzburg",
    area: "KwaZulu-Natal",
    surface: "Road",
    distances: ["Ultra"],
    summary:
      "The Comrades Marathon is an annual road ultramarathon between Durban and Pietermaritzburg.",
    description:
      "The Ultimate Human Race alternates between an Up Run from Durban to Pietermaritzburg and a Down Run in the opposite direction. The measured distance changes with each route and finish venue; check the official race site for final instructions.",
    organiser: "Comrades Marathon Association",
    website: COMRADES_WEBSITE,
    featured: true,
    source_url: COMRADES_WEBSITE,
  },
];

export const comradesEditions: Edition[] = [
  {
    seriesSlug: "comrades-marathon",
    date: "2022-08-28",
    distance: "Ultra",
    distanceKm: 89.885,
    status: "Finished",
    source: "https://www.comrades.com/blog/posts/2022-comrades-marathon-route-distance-cut-offs",
    notes: "95th edition and Down Run from Pietermaritzburg to Durban; official distance 89.885km.",
    resultsOfficialUrl: "https://comrades.com/historical-results",
    ...externalResultsPolicy,
  },
  {
    seriesSlug: "comrades-marathon",
    date: "2023-06-11",
    distance: "Ultra",
    distanceKm: 87.701,
    status: "Finished",
    source: "https://www.comrades.com/histories",
    notes: "96th edition and Down Run from Pietermaritzburg to Durban; official distance 87.701km.",
    resultsOfficialUrl: "https://comrades.com/historical-results",
    ...externalResultsPolicy,
  },
  {
    seriesSlug: "comrades-marathon",
    date: "2024-06-09",
    distance: "Ultra",
    distanceKm: 85.91,
    status: "Finished",
    source: "https://www.comrades.com/blog/posts/155",
    notes: "97th edition and Up Run from Durban to Pietermaritzburg; official distance 85.910km.",
    resultsOfficialUrl: "https://comrades.com/historical-results",
    ...externalResultsPolicy,
  },
  {
    seriesSlug: "comrades-marathon",
    date: "2025-06-08",
    distance: "Ultra",
    distanceKm: 89.98,
    status: "Finished",
    source: "https://www.comrades.com/blog/posts/287",
    notes: "98th edition and Down Run from Pietermaritzburg to Durban; official distance 89.980km.",
    resultsOfficialUrl: "https://comrades.com/historical-results",
    ...externalResultsPolicy,
  },
  {
    seriesSlug: "comrades-marathon",
    date: "2026-06-14",
    distance: "Ultra",
    distanceKm: 85.777,
    status: "Finished",
    source: "https://www.comrades.com/blog/posts/339",
    notes: "99th edition and Up Run from Durban to Pietermaritzburg; official distance 85.777km.",
    resultsOfficialUrl: "https://comrades.com/historical-results",
    ...externalResultsPolicy,
  },
  {
    seriesSlug: "comrades-marathon",
    date: "2027-06-13",
    distance: "Ultra",
    distanceKm: 0,
    status: "TBC",
    source: "https://comrades.com/blogs/2027-comrades-marathon-date-announced",
    notes:
      "The official organiser confirms the 100th edition and Down Run for 13 June 2027. The measured route distance and entry details are still TBC.",
  },
];
