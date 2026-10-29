import { countryNames } from "../athrecs/country-flags";

export type SignupDetails = {
  firstName: string;
  lastName: string;
  signupCountry: string;
  signupLocation: string;
};

// Nullable for existing members. New-account requirements are enforced by the
// shared creation hook, including OAuth, after the identity has been verified.
// These private registration details do not belong in ordinary session payloads.
export const signupUserFields = {
  firstName: { type: "string", required: false, returned: false },
  lastName: { type: "string", required: false, returned: false },
  signupCountry: { type: "string", required: false, returned: false },
  signupLocation: { type: "string", required: false, returned: false },
} as const;

export const SIGNUP_COUNTRIES = [
  ...new Set([...Object.values(countryNames), "England", "Scotland", "Wales", "Northern Ireland"]),
].sort((left, right) => left.localeCompare(right, "en"));

const countryByName = new Map(SIGNUP_COUNTRIES.map((country) => [country.toLowerCase(), country]));

export const SIGNUP_ERRORS = {
  SIGNUP_NAME_REQUIRED: "Enter your first and last name to create an account.",
  SIGNUP_COUNTRY_REQUIRED: "Choose your country to create an account.",
  SIGNUP_LOCATION_REQUIRED: "Enter a town, city, postcode or ZIP code to create an account.",
  SIGNUP_DETAILS_INVALID:
    "Use up to 60 characters for each name, 120 for your full name and 120 for your location.",
} as const;

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/[\s\u200B]+/gu, " ").trim() : "";
}

export function normalizeSignupDetails(input: unknown): SignupDetails {
  const value = input && typeof input === "object" ? (input as Partial<SignupDetails>) : {};
  const country = cleanText(value.signupCountry);
  return {
    firstName: cleanText(value.firstName),
    lastName: cleanText(value.lastName),
    signupCountry: countryByName.get(country.toLowerCase()) ?? country,
    signupLocation: cleanText(value.signupLocation),
  };
}

export function signupDetailsError(input: unknown) {
  const details = normalizeSignupDetails(input);
  let code: keyof typeof SIGNUP_ERRORS | null = null;
  if (!details.firstName || !details.lastName) code = "SIGNUP_NAME_REQUIRED";
  else if (!countryByName.has(details.signupCountry.toLowerCase()))
    code = "SIGNUP_COUNTRY_REQUIRED";
  else if (!details.signupLocation) code = "SIGNUP_LOCATION_REQUIRED";
  else if (
    details.firstName.length > 60 ||
    details.lastName.length > 60 ||
    `${details.firstName} ${details.lastName}`.length > 120 ||
    details.signupLocation.length > 120
  )
    code = "SIGNUP_DETAILS_INVALID";
  return code ? { code, message: SIGNUP_ERRORS[code] } : null;
}

export function isSignupDetailsError(error: { code?: string; message?: string } | string): boolean {
  if (typeof error === "string") {
    return (
      Object.values(SIGNUP_ERRORS).some((message) => message === error.replaceAll("_", " ")) ||
      error in SIGNUP_ERRORS
    );
  }
  return (
    Boolean(error.code && error.code in SIGNUP_ERRORS) ||
    Object.values(SIGNUP_ERRORS).some((message) => message === error.message)
  );
}
