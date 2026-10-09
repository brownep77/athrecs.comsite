import { z } from "zod";

const date = z.union([z.literal(""), z.iso.date()]).default("");
export const registrationFilters = z
  .object({
    q: z.string().trim().max(120).default(""),
    status: z.enum(["all", "pending", "unverified", "unfinished"]).default("all"),
    sort: z.enum(["newest", "oldest", "logins", "recent"]).default("newest"),
    page: z.number().int().min(1).max(100000).default(1),
    month: z
      .string()
      .regex(/^(?:|20\d{2}-(?:0[1-9]|1[0-2]))$/)
      .default(""),
    joinedFrom: date,
    joinedTo: date,
  })
  .refine((value) => !value.joinedFrom || !value.joinedTo || value.joinedFrom <= value.joinedTo, {
    message: "Signup end date must be on or after the start date.",
  });
export type RegistrationFilters = z.infer<typeof registrationFilters>;
