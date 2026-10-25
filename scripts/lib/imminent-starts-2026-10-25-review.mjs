export const IMMINENT_STARTS_REVIEW = {
  sourceKey: "athrecs:imminent-starts:2026-10-25",
  sourceUrl: "https://www.tiranamarathon.com/en",
  checkedAt: "2026-10-25",
  baseline: {
    "chengdu-marathon|2026-10-25|Marathon": {
      id: 83428474,
      event_id: 3580914,
      distance_km: 42.195,
      status: "Open",
      start_time: null,
      source_url: "https://aims-worldrunning.org/races/10315.html",
      notes: "Also half and wheelchair marathon.",
    },
    "niagara-falls-international-marathon|2026-10-25|Marathon": {
      id: 102159378,
      event_id: 4338277,
      distance_km: 42.195,
      status: "Open",
      start_time: null,
      source_url: "http://www.usamarathonlist.com/",
      notes: "Canada/US border marathon.",
    },
    "oktoberfest-half-college-station|2026-10-25|Half": {
      id: 102605761,
      event_id: 4356593,
      distance_km: 21.0975,
      status: "Open",
      start_time: "07:00",
      source_url:
        "https://raceroster.com/events/2026/115139/2026-oktoberfest-half-marathon10k-presented-by-cc-creations",
      notes:
        "Half event.\n\nStart time checked 2026-10-25: 07:00 local. Organiser's authorised event schedule explicitly starts half marathon and 10km at 07:00 CDT on 25 October 2026; previous-day expo pickup is separate. Source: https://raceroster.com/events/2026/115139/2026-oktoberfest-half-marathon10k-presented-by-cc-creations. Previous start time: TBC.",
    },
    "wa-athletics-sa-state-all-schools-championships-7245416|2026-10-25|Track & field": {
      id: 83204338,
      event_id: 3065223,
      distance_km: 0,
      status: "TBC",
      start_time: null,
      source_url: "https://worldathletics.org/competition/calendar-results/results/7245416",
      notes: "Competition day 2 · 24–25 OCT 2026\nFinal day · 24–25 OCT 2026",
    },
    "tirana-marathon|2026-11-15|10K": null,
    "tirana-marathon|2026-11-15|Half": null,
    "tirana-marathon|2026-11-15|Marathon": null,
  },
  additions: {
    "tirana-marathon|2026-11-15|10K": {
      eventId: 3059325,
      distanceKm: 10,
      status: "Open",
    },
    "tirana-marathon|2026-11-15|Half": {
      eventId: 3059325,
      distanceKm: 21.0975,
      status: "Open",
    },
    "tirana-marathon|2026-11-15|Marathon": {
      eventId: 3059325,
      distanceKm: 42.195,
      status: "Open",
    },
  },
  statusCorrections: {
    "oktoberfest-half-college-station|2026-10-25|Half": {
      from: "Open",
      to: "Closed",
    },
  },
};
