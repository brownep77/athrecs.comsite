/** Shared catalogue types. */

export type Sport =
  | "Running"
  | "Cycling"
  | "Swimming"
  | "Triathlon"
  | "Duathlon"
  | "Aquathlon"
  | "Aquabike"
  | "Rowing"
  | "OCR"
  | "Athletics";

export type Series = {
  slug: string;
  name: string;
  sport: Sport;
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
};

export type Edition = {
  seriesSlug: string;
  date: string;
  distance: string;
  distanceKm: number;
  status: "Open" | "ClosingSoon" | "Closed" | "Finished" | "TBC";
  entryUrl?: string;
  startTime?: string;
  source: string;
};

export type ClubSeed = {
  slug: string;
  name: string;
  city: string;
  sports: string[];
  website?: string;
  summary: string;
};

export type AthleteSeed = {
  slug: string;
  display_name: string;
  gender: "M" | "F";
  club_slug: string;
  city: string;
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
};

export type ResultSeed = {
  eventSlug: string;
  date: string;
  distance: string;
  athleteSlug: string;
  place: number;
  time: string;
  category: string;
  source: string;
};
