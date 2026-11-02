// Exact absent baselines permit only the two source-confirmed additions.
export const NOVEMBER_NIGHTMARE_PROGRAMME_REVIEW = {
  sourceKey: "athrecs:november-nightmare-programme:2026-10-26",
  sourceUrl: "https://www.codrc.co.uk/e/the-november-nightmare-12273",
  checkedAt: "2026-10-26",
  baseline: {
    "november-nightmare|2026-11-01|8mi": null,
    "november-nightmare|2026-11-01|16mi": null,
    "november-nightmare|2026-11-01|Marathon": {
      id: 71613833,
      event_id: 3060938,
      distance_km: 42.2,
      status: "Open",
      start_time: "09:00",
      source_url: "https://www.codrc.co.uk/e/the-november-nightmare-12273",
      notes: null,
    },
  },
  additions: {
    "november-nightmare|2026-11-01|8mi": {
      eventId: 3060938,
      distanceKm: 12.874752,
      status: "Open",
    },
    "november-nightmare|2026-11-01|16mi": {
      eventId: 3060938,
      distanceKm: 25.749504,
      status: "Open",
    },
  },
};
