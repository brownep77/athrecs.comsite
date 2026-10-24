import type { Edition, Series } from "./types";

/** Source-checked historical programmes; no athlete or participant data. */
export const llanelliTriathlon2026Series: Series[] = [
  {
    slug: "british-triathlon-super-series-llanelli",
    name: "British Triathlon Super Series Llanelli",
    sport: "Triathlon",
    country: "Wales",
    county: "",
    city: "Llanelli",
    area: "North Dock / Millennium Coastal Park",
    summary: "Junior and Senior sprint triathlon at North Dock, Llanelli.",
    description:
      "The 2026 Junior and Senior individual programmes formed the British Elite Triathlon Championships. Course: 750m swim, 20km cycle and 5km run.",
    organiser: "Healthy Life Activities",
    website: "https://britishsuperseries.com/events/llanelli-2026/",
    distances: ["Junior & Senior Female", "Junior & Senior Open Tier 1"],
    surface: "",
    source_url: "https://britishsuperseries.com/events/llanelli-2026/",
    featured: false,
  },
];

export const llanelliTriathlon2026Editions: Edition[] = [
  {
    seriesSlug: "british-triathlon-super-series-llanelli",
    date: "2026-05-09",
    distance: "Junior & Senior Female",
    distanceKm: 25.75,
    status: "Finished",
    startTime: "17:25",
    source: "https://britishsuperseries.com/events/llanelli-2026/",
    notes:
      "2026 British Elite Triathlon Championships; individual sprint programme. Local start time Europe/London checked against the edition-specific federation timetable on 24 October 2026. Course: swim750m / cycle20km / run5km, confirmed by the official Olympic-pathway athlete guide: https://britishsuperseries.com/wp-content/uploads/2023/12/Llanelli-Athlete-Guide-2026-Final-Olympic-Pathway.pdf. Official results provider: Titanium Race Timing; published programme https://www.titaniumracetiming.com/results/22842?eventId=6. This retrospective edition supports individually source-compared results; no future recurrence inferred.",
    publishAllDistances: true,
  },
  {
    seriesSlug: "british-triathlon-super-series-llanelli",
    date: "2026-05-09",
    distance: "Junior & Senior Open Tier 1",
    distanceKm: 25.75,
    status: "Finished",
    startTime: "16:15",
    source: "https://britishsuperseries.com/events/llanelli-2026/",
    notes:
      "2026 British Elite Triathlon Championships; individual sprint programme. Local start time Europe/London checked against the edition-specific federation timetable on 24 October 2026. Course: swim750m / cycle20km / run5km, confirmed by the official Olympic-pathway athlete guide: https://britishsuperseries.com/wp-content/uploads/2023/12/Llanelli-Athlete-Guide-2026-Final-Olympic-Pathway.pdf. Official results provider: Titanium Race Timing; published programme https://www.titaniumracetiming.com/results/22842?eventId=5. This retrospective edition supports individually source-compared results; no future recurrence inferred.",
    publishAllDistances: true,
  },
];
