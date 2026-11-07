import { nationalityDemonym } from "./country-flags.ts";

/** Public biography uses profile facts, never import notes or unverified results. */
export function publicAthleteBio(input: {
  name: string;
  sport?: string;
  city?: string | null;
  country?: string | null;
  nationality?: string | null;
  club?: string | null;
  coach?: string | null;
}): string {
  const sport = input.sport?.trim().toLowerCase();
  const role =
    sport && ["running", "parkrun", "trail running", "ultra running"].includes(sport)
      ? "runner"
      : sport === "triathlon"
        ? "triathlete"
        : sport === "cycling"
          ? "cyclist"
          : "athlete";
  const location = [...new Set([input.city, input.country].filter(Boolean))].join(", ");
  const demonym = nationalityDemonym(input.nationality);
  const described = demonym ? `${demonym} ${role}` : role;
  const article = /^[aeiou]/i.test(described) ? "an" : "a";
  let bio = `${input.name} is ${article} ${described}${location ? ` based in ${location}` : ""}.`;
  if (input.club && input.club.toLowerCase() !== "unattached") bio += ` Club: ${input.club}.`;
  if (input.coach) bio += ` Coached by ${input.coach}.`;
  return bio;
}
