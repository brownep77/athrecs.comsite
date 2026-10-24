import { profileToneClass, type ProfileTone } from "./profile-colours";

/** Stable sport colours, shared by event filters and fixture labels. */
const sportTones: Record<string, ProfileTone> = {
  Athletics: "lilac",
  Running: "blue",
  Parkrun: "green",
  Cycling: "peach",
  Swimming: "teal",
  Triathlon: "pink",
  Duathlon: "gold",
  Aquathlon: "teal",
  Aquabike: "sky",
  Rowing: "periwinkle",
  OCR: "gold",
  "Adventure Racing": "sand",
  "Functional Fitness": "coral",
  HYROX: "gold",
  DEKA: "peach",
  CrossFit: "coral",
  Swimrun: "teal",
  "Indoor Rowing": "periwinkle",
  Orienteering: "mint",
  Walking: "mint",
};

export function sportColourClass(sport: string): string {
  if (/^(?:road|trail|ultra|cross[ -]country) running$/i.test(sport.trim()))
    return profileToneClass("blue");
  if (/^track (?:&|and) field$/i.test(sport.trim())) return profileToneClass("lilac");
  const key = Object.keys(sportTones).find(
    (item) => item.toLowerCase() === sport.trim().toLowerCase(),
  );
  return profileToneClass(key ? sportTones[key] : "slate");
}

export function sportDisplayLabel(sport: string): string {
  return sport === "Parkrun" ? "parkrun" : sport;
}
