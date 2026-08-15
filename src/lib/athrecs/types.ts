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
  | "Athletics";

export type EntryStatus = "Open" | "ClosingSoon" | "Closed" | "Finished" | "TBC";

export type EventListItem = {
  id: number;
  slug: string;
  name: string;
  sport: Sport;
  country: string;
  county: string;
  city: string;
  area: string;
  surface: string;
  summary: string;
  organiser: string;
  website: string;
  distances: string[];
  next_date: string | null;
  next_distance: string | null;
  next_status: EntryStatus | null;
  next_start_time: string | null;
  upcoming_count: number;
  past_count: number;
  edition_count: number;
};

export type ClubListItem = {
  id: number;
  slug: string;
  name: string;
  city: string;
  county: string;
  country: string;
  sports: string[];
  website: string | null;
  summary: string;
  member_count: number;
};

export type AthleteListItem = {
  id: number;
  slug: string;
  display_name: string;
  gender: string;
  club: string | null;
  club_slug: string | null;
  city: string | null;
  county: string;
  country: string;
  result_count: number;
};
