export const athleteToolSections = [
  "link",
  "directory",
  "upload",
  "review",
  "clubs",
  "articles",
] as const;
export type AthleteToolSection = (typeof athleteToolSections)[number];
