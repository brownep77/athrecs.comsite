import { profileToneClass, type ProfileTone } from "./profile-colours";

/** Stable sport colours, shared by event filters and fixture labels. */
const sportTones: Record<string, ProfileTone> = {
  Athletics: "lilac",
  Running: "blue",
  Parkrun: "green",
  Cycling: "peach",
  Swimming: "cyan",
  Triathlon: "orchid",
  Duathlon: "rose",
  Aquathlon: "teal",
  Aquabike: "sky",
  Rowing: "periwinkle",
  OCR: "gold",
  "Adventure Racing": "sand",
  "Functional Fitness": "coral",
  Walking: "mint",
};

export function sportColourClass(sport: string): string {
  return profileToneClass(sportTones[sport] ?? "slate");
}

export function sportDisplayLabel(sport: string): string {
  return sport === "Parkrun" ? "parkrun" : sport;
}
