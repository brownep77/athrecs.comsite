import type { Edition, Series } from "./types";

const CHECKED_AT = "2026-08-22";

const Z_ADVENTURES_URL = "https://www.z-adventures.org/afghanistan-challenge.html";
const SAIGA_TOURS_URL =
  "https://www.saigatours.com/tour/kabul-afghanistan-marathon-tour-april-2027-3-days";

export const afghanistanRaceSeries: Series[] = [
  {
    slug: "afghanistan-challenge-kabul-marathon",
    name: "Afghanistan Challenge — Kabul Marathon",
    sport: "Running",
    country: "Afghanistan",
    county: "Kabul Province",
    city: "Kabul",
    area: "Kabul lakeside course, with a stadium contingency",
    surface: "Road / Track",
    distances: ["Marathon", "Half", "10K", "5K"],
    summary:
      "A multi-distance running and walking challenge in Kabul with 5K, 10K, half-marathon and marathon options.",
    description:
      "Z Adventures' second Afghanistan Challenge brings international and Afghan runners and walkers together in Kabul. The organiser currently offers 5K, 10K, half-marathon and marathon distances and states that participation is restricted to men.",
    organiser: "Z Adventures",
    website: Z_ADVENTURES_URL,
    featured: false,
    source_url: Z_ADVENTURES_URL,
  },
  {
    slug: "kabul-marathon",
    name: "Kabul Marathon",
    sport: "Running",
    country: "Afghanistan",
    county: "Kabul Province",
    city: "Kabul",
    area: "Kabul — exact course withheld for security reasons",
    surface: "Road / Track",
    distances: ["Marathon", "Half", "10K", "5K"],
    summary:
      "An annual Kabul running event offering 5K, 10K, half-marathon and marathon options.",
    description:
      "The 2027 Kabul Marathon is advertised by Saiga Tours with 5K, 10K, half-marathon and marathon options. The exact course is withheld for security reasons and the organiser currently restricts participation to men.",
    organiser: "Kabul Marathon / Saiga Tours",
    website: SAIGA_TOURS_URL,
    featured: false,
    source_url: SAIGA_TOURS_URL,
  },
];

export const afghanistanRaceEditions: Edition[] = [
  {
    seriesSlug: "afghanistan-challenge-kabul-marathon",
    date: "2026-11-22",
    distance: "Marathon",
    distanceKm: 42.195,
    status: "Open",
    entryUrl: Z_ADVENTURES_URL,
    entryOptions: [
      {
        providerCode: "z-adventures",
        providerName: "Z Adventures",
        entryUrl: Z_ADVENTURES_URL,
        entryType: "tour_operator",
        status: "open",
        checkedAt: CHECKED_AT,
        sourceUrl: Z_ADVENTURES_URL,
        isVerified: true,
        isPrimary: true,
        notes: "The official event page advertises registration through its tour package.",
      },
    ],
    source: Z_ADVENTURES_URL,
    notes:
      "Race day is Sunday 22 November 2026. The programme includes 5K, 10K, half-marathon and marathon options. Participation is currently restricted to men; the planned lakeside course may move inside a stadium if conditions require.",
  },
  {
    seriesSlug: "kabul-marathon",
    date: "2027-03-31",
    distance: "Marathon",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: SAIGA_TOURS_URL,
    entryOptions: [
      {
        providerCode: "saiga-tours",
        providerName: "Saiga Tours",
        entryUrl: SAIGA_TOURS_URL,
        entryType: "tour_operator",
        status: "unknown",
        checkedAt: CHECKED_AT,
        sourceUrl: SAIGA_TOURS_URL,
        isVerified: true,
        isPrimary: true,
        notes: "The organiser is taking enquiries for its three-day Kabul Marathon package.",
      },
    ],
    source: SAIGA_TOURS_URL,
    notes:
      "Provisional calendar date: the organiser currently publishes a three-day 30 March–1 April 2027 event window but not a separate race date. 31 March is retained as TBC pending confirmation. The programme offers 5K, 10K, half-marathon and marathon options and currently restricts participation to men.",
  },
];
