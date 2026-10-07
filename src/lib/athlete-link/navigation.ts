export const athleteToolSections = ["link", "directory", "upload", "review", "clubs"] as const;
export type AthleteToolSection = (typeof athleteToolSections)[number];
