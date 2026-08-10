/** Shared catalogue types. */

export type Sport =
  | "Running"
  | "Cycling"
  | "Swimming"
  | "Triathlon"
  | "Duathlon"
  | "Parkrun"
  | "TrackAndField"
  | "Aquathlon"
  | "Aquabike"
  | "Rowing"
  | "OCR"
  | "Athletics";

export type Series = {
  /** Stable ID from the fuller production catalogue, when one exists. */
  source_id?: number;
  slug: string;
  name: string;
  sport: Sport;
  country: string;
  county: string;
  city: string;
  area: string;
  surface: string;
  distances: string[];
  summary: string;
  description: string;
  organiser: string;
  website: string;
  featured?: boolean;
  defaultStartTime?: string;
  source_url?: string;
};

export type Edition = {
  /** Stable ID from the fuller production catalogue, when one exists. */
  source_id?: number;
  seriesSlug: string;
  date: string;
  distance: string;
  distanceKm: number;
  status: "Open" | "ClosingSoon" | "Closed" | "Finished" | "TBC";
  entryUrl?: string;
  startTime?: string;
  source: string;
  notes?: string;
  resultsPermission?: string;
  resultsHosting?: string;
  resultsOfficialUrl?: string;
  resultsPermissionNote?: string;
  resultsPermissionAt?: string;
  resultsPermissionBy?: string;
  resultsRightsRequestedAt?: string;
  publicResultCount?: number;
  partnerResultCount?: number;
  athleteResultCount?: number;
  resultsAccess?: string;
};

export type ClubSeed = {
  slug: string;
  name: string;
  city: string;
  county?: string;
  country?: string;
  sports: string[];
  website?: string;
  summary: string;
  /** Raw names used by the source before canonical club-name deduplication. */
  source_names?: string[];
};

export type AthleteSeed = {
  /** Stable ID from the fuller production catalogue, when one exists. */
  source_id?: number;
  slug: string;
  display_name: string;
  given_name?: string;
  family_name?: string;
  gender: "M" | "F" | "X" | "U";
  club_slug: string;
  second_club_slug?: string;
  source_club_name?: string;
  source_second_club_name?: string;
  city: string;
  county?: string;
  country?: string;
  bio: string;
  /** Other names this athlete has appeared under on result sheets. */
  aliases?: string[];
  /** ISO date YYYY-MM-DD */
  date_of_birth?: string;
  place_of_birth?: string;
  country_of_birth?: string;
  /** Current / residential address (free text). */
  address?: string;
  nationality?: string;
  /** Any other useful profile notes (coach, category, IDs, etc.). */
  notes?: string;
  nation?: string;
  continent?: string;
  commonwealth?: boolean;
  race_entry_name?: string;
  default_category?: string;
  default_bib?: string;
  preferred_distance?: string;
  ea_number?: string;
  athrecs_id?: string;
  parent_athlete_slug?: string;
  avatar_url?: string;
  source_url?: string;
};

export type ResultSeed = {
  /** Stable ID from the fuller production catalogue, when one exists. */
  source_id?: number;
  eventSlug: string;
  date: string;
  distance: string;
  athleteSlug: string;
  place: number | null;
  time: string;
  finishTimeSeconds?: number;
  chipTimeSeconds?: number;
  gunTimeSeconds?: number;
  bib?: string;
  status?: string;
  genderPlace?: number;
  category?: string | null;
  categoryPlace?: number;
  ageOnDay?: number;
  ageGradePct?: number;
  openRating?: number;
  ageGradeRating?: number;
  resultSource?: string;
  source: string;
};
