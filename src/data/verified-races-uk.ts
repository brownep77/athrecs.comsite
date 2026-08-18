import type { Edition, Series } from "./types";

/** UK races verified directly against current organiser and live booking pages. */
export const verifiedUkSeries: Series[] = [
  {
    slug: "victoria-park-half-marathon-december",
    name: "Victoria Park Half Marathon, 10K & 5K — December",
    sport: "Running",
    country: "England",
    county: "Greater London",
    city: "London",
    area: "St Mark's Gate, Victoria Park",
    surface: "Road",
    distances: ["Half", "10K", "5K"],
    summary: "Victoria Park Half Marathon — East London.",
    description:
      "A flat, 6.5-lap half marathon on the smooth tarmac paths of Victoria Park, organised by RunThrough Events.",
    organiser: "RunThrough Events",
    website:
      "https://www.runthrough.co.uk/event/victoria-park-half-marathon-10k-5k-december-2026",
    featured: false,
    source_url:
      "https://www.runthrough.co.uk/event/victoria-park-half-marathon-10k-5k-december-2026",
  },
  {
    slug: "atw-nottingham-holme-run",
    name: "ATW Nottingham Holme Run",
    sport: "Running",
    country: "England",
    county: "Nottinghamshire",
    city: "Nottingham",
    area: "Holme Pierrepont Country Park and National Water Sports Centre",
    surface: "Road",
    distances: ["Half", "10K", "5K"],
    summary: "ATW Nottingham Holme Run — Holme Pierrepont, Nottingham.",
    description:
      "A traffic-free, pancake-flat half marathon on a certified tarmac course around the National Water Sports Centre regatta lake, organised by ATW Events.",
    organiser: "ATW Events",
    website: "https://www.atwevents.co.uk/e/atw-nottingham-holme-run-8892",
    featured: false,
    source_url: "https://www.atwevents.co.uk/e/atw-nottingham-holme-run-8892",
  },
];

export const verifiedUkEditions: Edition[] = [
  {
    seriesSlug: "victoria-park-half-marathon-december",
    date: "2026-12-12",
    distance: "Half",
    distanceKm: 21.1,
    status: "Open",
    entryUrl:
      "https://www.runthrough.co.uk/event/victoria-park-half-marathon-10k-5k-december-2026",
    startTime: "09:30",
    source:
      "https://www.runthrough.co.uk/event/victoria-park-half-marathon-10k-5k-december-2026",
  },
  {
    seriesSlug: "atw-nottingham-holme-run",
    date: "2026-12-20",
    distance: "Half",
    distanceKm: 21.1,
    status: "Open",
    entryUrl: "https://www.atwevents.co.uk/e/atw-nottingham-holme-run-8892",
    startTime: "10:30",
    source: "https://www.atwevents.co.uk/e/atw-nottingham-holme-run-8892",
  },
];
