/** Shared catalogue types. */

export type Sport =
  | "Running"
  | "Cycling"
  | "Swimming"
  | "Triathlon"
  | "Duathlon"
  | "Parkrun"
  | "Aquathlon"
  | "Aquabike"
  | "Rowing"
  | "OCR"
  | "Athletics"
  | "Adventure Racing"
  | "Functional Fitness"
  | "Walking";

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

export type RaceGroupCode = "world-marathon-majors" | "utmb-world-series" | "utmb-index";

export type RaceGroupLevel = "major" | "final" | "event" | "index";

export type RaceGroupMembershipSeed = {
  seriesSlug: string;
  groupCode: RaceGroupCode;
  label: string;
  level: RaceGroupLevel;
  sourceUrl: string;
  checkedAt: string;
  note: string;
};

export type RaceGroupDefinition = {
  code: RaceGroupCode;
  name: string;
  shortName: string;
  description: string;
  qualificationNote: string;
  sourceUrl: string;
};

export type EntryOptionType = "official" | "third_party" | "charity" | "tour_operator";

export type EntryOptionStatus =
  "open" | "closing_soon" | "ballot" | "waitlist" | "sold_out" | "closed" | "unknown";

export type EntryOptionSeed = {
  providerCode: string;
  providerName: string;
  entryUrl: string;
  entryType: EntryOptionType;
  status?: EntryOptionStatus;
  priceAmount?: number;
  priceCurrency?: string;
  opensAt?: string;
  closesAt?: string;
  checkedAt: string;
  sourceUrl?: string;
  isVerified?: boolean;
  isPrimary?: boolean;
  notes?: string;
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
  entryOptions?: EntryOptionSeed[];
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
  /** Keep every advertised same-day distance instead of the catalogue's legacy single-row collapse. */
  publishAllDistances?: boolean;
};

export type ClubContactSeed = {
  role: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type ClubSocialSeed = {
  platform: "Facebook" | "Instagram" | "X" | "YouTube" | "LinkedIn";
  url: string;
};

export type ClubLocationPrecision = "postcode" | "official-directory" | "area-only" | "unverified";

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
  /** Public venue or correspondence address published by an official source. */
  address?: string;
  postcode?: string;
  /** Governing-body or geographic region; deliberately separate from county/area. */
  region?: string;
  /** Official directory record used to check affiliation and location. */
  official_source?: string;
  source_url?: string;
  /** ISO date on which the public source was last checked. */
  checked_at?: string;
  location_precision?: ClubLocationPrecision;
  contact_url?: string;
  contacts?: ClubContactSeed[];
  socials?: ClubSocialSeed[];
};

export type AthleteProfileType = "Athlete" | "Public figure";

export type AthleteProfileLinkSeed = {
  label: string;
  url: string;
};

export type AthleteAchievementSeed = {
  year: number;
  title: string;
  detail: string;
  source_url: string;
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
  /** Public-facing profile classification; independent of account ownership/claim status. */
  profile_type?: AthleteProfileType;
  /** Descriptive public roles, such as Podcaster or Author. */
  profile_roles?: string[];
  /** Date on which the cited public profile sources were last checked. */
  profile_source_checked_at?: string;
  profile_links?: AthleteProfileLinkSeed[];
  notable_achievements?: AthleteAchievementSeed[];
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
