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

export type EntryOptionType = "official" | "third_party" | "charity" | "tour_operator";

export type EntryOptionStatus =
  "open" | "closing_soon" | "ballot" | "waitlist" | "sold_out" | "closed" | "unknown";

export type EditionEntryOption = {
  id: number;
  provider_code: string;
  provider_name: string;
  entry_url: string;
  entry_type: EntryOptionType;
  status: EntryOptionStatus;
  price_amount: number | string | null;
  price_currency: string | null;
  opens_at: string | null;
  closes_at: string | null;
  checked_at: string;
  source_url: string | null;
  is_verified: boolean;
  is_primary: boolean;
  notes?: string | null;
};

export type EditionResultLink = {
  id: number;
  provider_code: string;
  provider_name: string;
  results_url: string;
  source_url: string | null;
  is_verified: boolean;
  checked_at: string;
};

export type RaceGroupCode = "world-marathon-majors" | "utmb-world-series" | "utmb-index";

export type RaceGroupInfo = {
  code: RaceGroupCode;
  label: string;
  level: "major" | "final" | "event" | "index";
  source_url: string;
  checked_at: string;
  note: string;
};

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
  /** Direct booking route for the next edition when one is recorded. */
  next_entry_url?: string | null;
  upcoming_count: number;
  past_count: number;
  edition_count: number;
  groups: RaceGroupInfo[];
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
  official_source: string | null;
  summary: string;
  member_count: number;
};

export type ClubContactInfo = {
  role: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type ClubSocialInfo = {
  platform: "Facebook" | "Instagram" | "X" | "YouTube" | "LinkedIn";
  url: string;
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
