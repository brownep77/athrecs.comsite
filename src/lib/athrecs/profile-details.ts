import { z } from "zod";

export const profileDetailsSchema = z.object({
  nationality: z.string().trim().max(100).default(""),
  birthCountry: z.string().trim().max(100).default(""),
  previousClub: z.string().trim().max(160).default(""),
  coach: z.string().trim().max(120).default(""),
  coachProfileSlug: z
    .string()
    .trim()
    .max(160)
    .regex(/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/)
    .optional(),
  manager: z.string().trim().max(120).default(""),
  runningAgeCategory: z.string().trim().max(40).default(""),
  birthdayVisibility: z.enum(["hidden", "day-month", "full"]).default("hidden"),
  acceptContact: z.boolean().default(false),
});
export type AthleteProfileDetails = z.infer<typeof profileDetailsSchema>;
export type PublicProfileDetails = AthleteProfileDetails & { birthday: string };
export function readProfileDetails(value: unknown): AthleteProfileDetails {
  // Imports may represent unknown details as JSON null. Treat those fields as
  // absent when reading, so the existing blank/private defaults apply. Keep the
  // write schema strict and never mutate the stored source object.
  const details =
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).filter(([, field]) => field !== null))
      : value;
  return profileDetailsSchema.parse(details ?? {});
}
/** Never return the underlying birthday when the athlete has chosen to hide it. */
export function publicProfileDetails(value: unknown, dob?: string | null): PublicProfileDetails {
  const details = readProfileDetails(value);
  let birthday = "";
  if (dob && details.birthdayVisibility !== "hidden" && /^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    const date = new Date(`${dob}T12:00:00Z`);
    if (!Number.isNaN(date.getTime()))
      birthday = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
        ...(details.birthdayVisibility === "full" ? ({ year: "numeric" } as const) : {}),
      });
  }
  return { ...details, birthday };
}

/** Only individually published source facts belong in an unclaimed public preview. */
export function publishedSourceProfileDetails(
  value: unknown,
  dob: string | null,
  athleteId: number,
): PublicProfileDetails | null {
  const record = (input: unknown): Record<string, unknown> =>
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const stored = record(value);
  const publication = record(stored.worldAthleticsProfileDetailsPublication);
  if (publication.athleteId !== athleteId || !publication.reviewedAt) return null;
  const approved = record(publication.filledProfileDetails);
  const current = publicProfileDetails(value, dob);
  const details = publicProfileDetails({});
  if (
    approved.birthdayVisibility === current.birthdayVisibility &&
    current.birthdayVisibility !== "hidden"
  ) {
    details.birthdayVisibility = current.birthdayVisibility;
    details.birthday = current.birthday;
  }
  for (const field of ["manager", "birthCountry"] as const) {
    if (approved[field] === current[field]) details[field] = current[field];
  }
  return details.birthday || details.manager || details.birthCountry ? details : null;
}
