/** Exact reviewed programme; retain the original Fun Run/0 row and its dependants. */
const key = "ea-runevents-hadleigh-10-5-2-hadleigh|2026-11-22";
const original = {
  event_id: 3148026,
  status: "Open",
  start_time: "10:00",
  source_url: "https://www.englandathletics.org/runevents/search/",
  notes: "England Athletics RunEvents licensed listing checked 2026-08-26.",
};

export const HADLEIGH_PROGRAMME_REVIEW = {
  sourceKey: "athrecs:hadleigh-programme:2026-10-26",
  sourceUrl: "https://www.hadleigh-hares.co.uk/hadleigh-10-and-5-mile-races2026",
  checkedAt: "2026-10-26",
  baseline: {
    [`${key}|2K`]: null,
    [`${key}|10mi`]: { ...original, id: 74248494, distance_km: 16.0934 },
    [`${key}|5mi`]: { ...original, id: 74248495, distance_km: 8.0467 },
  },
  additions: {
    [`${key}|2K`]: { eventId: 3148026, distanceKm: 2, status: "Open" },
  },
  startCorrections: {
    [`${key}|10mi`]: { from: "10:00", to: "11:00" },
    [`${key}|5mi`]: { from: "10:00", to: "11:05" },
  },
};
