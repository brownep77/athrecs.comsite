export const catalogueMetadata = {
  source: "https://www.athrecs.com",
  exported_at: "2026-08-12T12:00:00.000Z",
  export_method: "ATHRECS catalogue + Total Race Timing Norfolk/Suffolk upcoming fixtures",
  source_sha256: "b182a63ec45365fd2eba89c76f05c1afd4e3884641a840a7eaa9a83e8feee893",
  source_counts: {
    athletes: 254,
    race_series: 142,
    editions: 544,
    results: 1469,
    raw_club_names: 42,
  },
  merged_counts: {
    clubs: 1737,
    athletes: 1255,
    race_series: 7992,
    editions: 219707,
    results: 2506,
  },
  clubs_source:
    "England Athletics Find a Club (types=club) + Welsh Athletics All Clubs + Athletics Ireland Find a Club (pages 1–5) + Athletics Northern Ireland Find A Club + Belfast Running club directory + Special Olympics Ireland club finder + Triathlon Ireland public club directory + prior ATHRECS catalogue",
} as const;
