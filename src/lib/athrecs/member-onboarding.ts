import { z } from "zod";

/** Public form definitions only. These member roles never grant permissions. */
export const MEMBER_ROLES = {
  athlete: "Athlete",
  coach: "Coach",
  club: "Running / sports club representative",
  organiser: "Race director / organiser",
  timing: "Timing / results provider",
  supporter: "Supporter / spectator",
  staff_request: "AthRecs staff — request access",
} as const;

export type MemberRole = keyof typeof MEMBER_ROLES;
export const MEMBER_ONBOARDING_VERSION = "member-onboarding-2026-10-18";

export type MemberOnboardingInput = {
  firstName: string;
  lastName: string;
  roles: MemberRole[];
  organisation?: string;
};

const FORBIDDEN_TEXT = /[\p{C}<>]/u;
const NAME_CHARACTERS = /^[\p{L}\p{M}][\p{L}\p{M} '\u2019.-]*$/u;

function name(value: unknown, label: string): string {
  if (typeof value !== "string" || FORBIDDEN_TEXT.test(value)) {
    throw new Error(`${label} must contain a valid name`);
  }
  const result = value.normalize("NFC").trim().replace(/ +/g, " ");
  if (!result || !/\p{L}/u.test(result) || !NAME_CHARACTERS.test(result)) {
    throw new Error(
      `Enter your ${label.toLowerCase()} using letters, spaces, apostrophes, hyphens or periods`,
    );
  }
  if (result.length > 60) throw new Error(`${label} must be 60 characters or fewer`);
  return result;
}

export function validateMemberOnboardingInput(value: MemberOnboardingInput): MemberOnboardingInput {
  const firstName = name(value?.firstName, "First name");
  const lastName = name(value?.lastName, "Last name");
  if (`${firstName} ${lastName}`.length > 120)
    throw new Error("Your full name must be 120 characters or fewer");
  if (
    !Array.isArray(value?.roles) ||
    value.roles.length < 1 ||
    value.roles.length > Object.keys(MEMBER_ROLES).length
  ) {
    throw new Error("Choose at least one way you use AthRecs");
  }
  const validRoles = new Set<string>(Object.keys(MEMBER_ROLES));
  if (value.roles.some((role) => typeof role !== "string" || !validRoles.has(role))) {
    throw new Error("Choose a valid AthRecs role");
  }
  const roles = [...new Set(value.roles)];
  if (roles.length !== value.roles.length) throw new Error("Choose each role only once");
  if (value.organisation !== undefined && typeof value.organisation !== "string") {
    throw new Error("Organisation must be text");
  }
  const organisation = (value.organisation ?? "").normalize("NFC").trim();
  if (organisation.length > 160 || FORBIDDEN_TEXT.test(organisation)) {
    throw new Error(
      "Organisation must be 160 characters or fewer without markup or control characters",
    );
  }
  return { firstName, lastName, roles, organisation };
}

export function memberNamesMatch(firstName: string, lastName: string, fullName: string): boolean {
  const normalise = (value: string) =>
    value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
  return normalise(`${firstName} ${lastName}`) === normalise(fullName);
}

export const onboardingSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(
      z.enum(["athlete", "coach", "club", "organiser", "timing", "supporter", "staff_request"]),
    ),
    organisation: z.string().optional().default(""),
  })
  .strict()
  .transform((value, ctx) => {
    try {
      return validateMemberOnboardingInput(value) as Required<MemberOnboardingInput>;
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Invalid profile details",
      });
      return z.NEVER;
    }
  });
export type MemberOnboarding = z.infer<typeof onboardingSchema>;

/** Preserve intended same-site navigation without accepting encoded redirect tricks. */
export function safeOnboardingReturnTo(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    value.length > 1500 ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return undefined;
  let decoded = value;
  // Decode nested encoding before validation; malformed encodings cannot be safe destinations.
  try {
    for (let count = 0; count < 4; count += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    return undefined;
  }
  if (/[\p{C}\\]/u.test(decoded) || decoded.startsWith("//") || /%[0-9a-f]{2}/i.test(decoded))
    return undefined;
  try {
    const url = new URL(decoded, "https://athrecs.example");
    if (url.origin !== "https://athrecs.example") return undefined;
    const pathname = url.pathname.toLowerCase();
    if (/^\/(?:join|api)(?:\/|$)/.test(pathname)) return undefined;
    return value;
  } catch {
    return undefined;
  }
}

/** Existing claims and sensitive flows can finish without an onboarding interruption. */
export function shouldRequestOnboarding(pathname: string): boolean {
  const path = pathname.split(/[?#]/, 1)[0].toLowerCase();
  return (
    !/^\/(?:join|api|admin|claim(?:s|-results|-invitation)?|review(?:-results)?|privacy|terms|test-account)(?:\/|$)/.test(
      path,
    ) && !/^\/(?:athlete-claims|result-claims)(?:\/|$)/.test(path)
  );
}
