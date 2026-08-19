import type { Edition, Series } from "./types";

/**
 * Small, source-tracked checkpoints from the global fixture registry.
 *
 * Discovery sources identify candidates; organiser and entry pages confirm
 * the public event facts stored here. Participant-level result rows are not
 * collected by this fixture workflow.
 */
export const verifiedGlobalSeries: Series[] = [
  {
    slug: "hardman-killarney",
    name: "Hardman Killarney",
    sport: "Triathlon",
    country: "Ireland",
    county: "Kerry",
    city: "Killarney",
    area: "Lakes of Killarney and Killarney National Park",
    surface: "Open Water / Road / Trail",
    distances: ["Full Distance"],
    summary: "Full-distance triathlon through Killarney and the Ring of Kerry.",
    description:
      "A full-distance triathlon with an open-water swim in the Lakes of Killarney, a cycle around the Ring of Kerry and a marathon run in Killarney National Park.",
    organiser: "Hardman Events",
    website: "https://hardman.ie/races/hardman-killarney/",
    featured: false,
    source_url: "https://hardman.ie/races/hardman-killarney/",
  },
  {
    slug: "run-brave-for-yourself",
    name: "Run Brave for Yourself",
    sport: "Running",
    country: "Ireland",
    county: "Dublin",
    city: "Dublin",
    area: "Bushy Park, Dublin 6",
    surface: "Park",
    distances: ["10K", "5K"],
    summary: "A 5K and 10K charity run in Bushy Park, Dublin.",
    description:
      "A public 5K and 10K charity running event supporting the Four-Leaf Clover Women's Violence Prevention Fund, with a separate children's fun run.",
    organiser: "Polish Women's Symposium in Ireland",
    website: "https://www.sympozjumpolek.com/en/run-brave-for-yourself",
    featured: false,
    source_url: "https://www.sympozjumpolek.com/en/run-brave-for-yourself",
  },
  {
    slug: "hardman-run-ballinskelligs",
    name: "Run Ballinskelligs",
    sport: "Running",
    country: "Ireland",
    county: "Kerry",
    city: "Ballinskelligs",
    area: "Skellig Coast and Ballinskelligs Beach",
    surface: "Road",
    distances: ["Marathon", "Half", "10K", "5K"],
    summary: "Marathon, half marathon, 10K and 5K racing on the Skellig Coast.",
    description:
      "Four road-race distances organised by Hardman Events on the Skellig Coast, finishing near Ballinskelligs Beach.",
    organiser: "Hardman Events",
    website: "https://hardman.ie/races/ballinskelligs/",
    featured: false,
    source_url: "https://hardman.ie/races/ballinskelligs/",
  },
];

export const verifiedGlobalEditions: Edition[] = [
  {
    seriesSlug: "hardman-killarney",
    date: "2026-08-29",
    distance: "Full Distance",
    distanceKm: 226,
    status: "Open",
    entryUrl: "https://hardmanevents.niftyentries.com/Hardman-Long-2026",
    entryOptions: [
      {
        providerCode: "hardman-niftyentries",
        providerName: "Hardman Events / niftyEntries",
        entryUrl: "https://hardmanevents.niftyentries.com/Hardman-Long-2026",
        entryType: "official",
        status: "open",
        priceAmount: 230,
        priceCurrency: "EUR",
        checkedAt: "2026-08-19",
        sourceUrl: "https://hardmanevents.niftyentries.com/Hardman-Long-2026",
        isVerified: true,
        isPrimary: true,
        notes: "Organiser-linked entry page confirms availability, date and 06:30 start.",
      },
    ],
    startTime: "06:30",
    source: "https://hardman.ie/races/hardman-killarney/",
    notes:
      "The organiser page heading, entry page and JustRuns calendar agree on 29 August 2026; a stale FAQ sentence still mentions the prior calendar date.",
  },
  {
    seriesSlug: "run-brave-for-yourself",
    date: "2026-10-17",
    distance: "10K",
    distanceKm: 10,
    status: "Open",
    entryUrl: "https://in.njuko.com/run-brave-for-yourself-5k-2026",
    entryOptions: [
      {
        providerCode: "justruns-njuko",
        providerName: "JustRuns / Njuko",
        entryUrl: "https://in.njuko.com/run-brave-for-yourself-5k-2026",
        entryType: "official",
        status: "open",
        priceAmount: 35,
        priceCurrency: "EUR",
        checkedAt: "2026-08-19",
        sourceUrl: "https://www.sympozjumpolek.com/en/run-brave-for-yourself",
        isVerified: true,
        isPrimary: true,
        notes: "The organiser page confirms the 10K price; the same event also offers a 5K.",
      },
    ],
    startTime: "11:00",
    source: "https://www.sympozjumpolek.com/en/run-brave-for-yourself",
    notes: "The event runs from 11:00 to 15:00 and includes 10K, 5K and children's races.",
  },
  {
    seriesSlug: "hardman-run-ballinskelligs",
    date: "2026-10-25",
    distance: "Marathon",
    distanceKm: 42.195,
    status: "Open",
    entryUrl:
      "https://hardmanevents.niftyentries.com/Events/Preview/4fd1cae4-bc3c-4b81-bc10-36a50487b41d",
    entryOptions: [
      {
        providerCode: "hardman-niftyentries",
        providerName: "Hardman Events / niftyEntries",
        entryUrl:
          "https://hardmanevents.niftyentries.com/Events/Preview/4fd1cae4-bc3c-4b81-bc10-36a50487b41d",
        entryType: "official",
        status: "open",
        priceAmount: 45,
        priceCurrency: "EUR",
        closesAt: "2026-10-22T23:55:00+01:00",
        checkedAt: "2026-08-19",
        sourceUrl: "https://hardman.ie/races/ballinskelligs/",
        isVerified: true,
        isPrimary: true,
        notes: "Organiser-linked entry page lists all four distances as available.",
      },
    ],
    startTime: "08:00",
    source: "https://hardman.ie/races/ballinskelligs/",
    notes: "Marathon starts 08:00; half 09:00, 10K 09:15 and 5K 09:30.",
  },
];
