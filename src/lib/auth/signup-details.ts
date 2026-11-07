import { countryNames } from "../athrecs/country-flags";

export type SignupDetails = {
  firstName: string;
  lastName: string;
  signupCountry: string;
  signupNationality: string;
  signupLocation: string;
  signupPostcode: string;
  signupDateOfBirth: string;
  signupClubs: string;
};

// Nullable for existing members. New-account requirements are enforced by the
// shared creation hook, including OAuth, after the identity has been verified.
// These private registration details do not belong in ordinary session payloads.
export const signupUserFields = {
  firstName: { type: "string", required: false, returned: false },
  lastName: { type: "string", required: false, returned: false },
  signupCountry: { type: "string", required: false, returned: false },
  signupNationality: { type: "string", required: false, returned: false },
  signupLocation: { type: "string", required: false, returned: false },
  signupPostcode: { type: "string", required: false, returned: false },
  signupDateOfBirth: { type: "string", required: false, returned: false },
  signupClubs: { type: "string", required: false, returned: false },
} as const;

export const SIGNUP_COUNTRIES = [
  ...new Set([...Object.values(countryNames), "England", "Scotland", "Wales", "Northern Ireland"]),
].sort((left, right) => left.localeCompare(right, "en"));

const countryByName = new Map(SIGNUP_COUNTRIES.map((country) => [country.toLowerCase(), country]));

export const SIGNUP_ERRORS = {
  SIGNUP_NAME_REQUIRED: "Enter your first and last name to create an account.",
  SIGNUP_COUNTRY_REQUIRED: "Choose your country to create an account.",
  SIGNUP_NATIONALITY_REQUIRED: "Choose your nationality to create an account.",
  SIGNUP_POSTCODE_INVALID:
    "Enter your postcode or ZIP code using letters, numbers, spaces or hyphens (up to 12 characters), or leave it blank.",
  SIGNUP_LOCATION_REQUIRED: "Enter your city or town to create an account.",
  SIGNUP_BIRTHDATE_REQUIRED: "Enter a valid date of birth to create an account.",
  SIGNUP_CLUBS_INVALID: "List up to 20 clubs using readable text (1,000 characters total).",
  SIGNUP_DETAILS_INVALID:
    "Use readable text and up to 60 characters for each name, 120 for your full name and 120 for your location.",
} as const;

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/[\s\u200B]+/gu, " ").trim() : "";
}

export function normalizeSignupDetails(input: unknown): SignupDetails {
  const value = input && typeof input === "object" ? (input as Partial<SignupDetails>) : {};
  const country = cleanText(value.signupCountry);
  const nationality = cleanText(value.signupNationality);
  return {
    firstName: cleanText(value.firstName),
    lastName: cleanText(value.lastName),
    signupCountry: countryByName.get(country.toLowerCase()) ?? country,
    signupNationality: countryByName.get(nationality.toLowerCase()) ?? nationality,
    signupLocation: cleanText(value.signupLocation),
    signupPostcode: cleanText(value.signupPostcode).toUpperCase(),
    signupDateOfBirth: cleanText(value.signupDateOfBirth),
    signupClubs: typeof value.signupClubs === "string" ? value.signupClubs.trim() : "",
  };
}

export function latestSignupBirthdate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidSignupBirthdate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01" || value > latestSignupBirthdate())
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const invisibleText = /^[\s\p{Default_Ignorable_Code_Point}]*$/u;
const invalidText = /[\p{Cc}\p{Cs}]/u;

export function signupDetailsError(input: unknown) {
  const details = normalizeSignupDetails(input);
  let code: keyof typeof SIGNUP_ERRORS | null = null;
  if (invisibleText.test(details.firstName) || invisibleText.test(details.lastName))
    code = "SIGNUP_NAME_REQUIRED";
  else if (!countryByName.has(details.signupCountry.toLowerCase()))
    code = "SIGNUP_COUNTRY_REQUIRED";
  else if (!countryByName.has(details.signupNationality.toLowerCase()))
    code = "SIGNUP_NATIONALITY_REQUIRED";
  else if (invisibleText.test(details.signupLocation)) code = "SIGNUP_LOCATION_REQUIRED";
  else if (!isValidSignupBirthdate(details.signupDateOfBirth)) code = "SIGNUP_BIRTHDATE_REQUIRED";
  else if (details.signupPostcode && !/^[A-Z0-9][A-Z0-9 -]{1,11}$/.test(details.signupPostcode))
    code = "SIGNUP_POSTCODE_INVALID";
  else if (
    invalidText.test(details.signupClubs.replace(/[\r\n\t]/g, "")) ||
    details.signupClubs.length > 1000 ||
    details.signupClubs.split(/\r\n?|\n/).filter((line) => cleanText(line)).length > 20
  )
    code = "SIGNUP_CLUBS_INVALID";
  else if (
    [details.firstName, details.lastName, details.signupLocation].some((value) =>
      invalidText.test(value),
    ) ||
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

/** Split a provider display name ("Paula Radcliffe") into first and last names. */
export function splitProviderName(
  name: string | null | undefined,
  email?: string | null,
): { firstName: string; lastName: string } {
  const cleaned = cleanText(name).slice(0, 120);
  const fallback = cleanText(email?.split("@")[0]?.replace(/[._-]+/g, " ")).slice(0, 60);
  const parts = (cleaned || fallback).split(" ").filter(Boolean);
  if (!parts.length) return { firstName: "Athlete", lastName: "" };
  const [first, ...rest] = parts;
  return { firstName: first.slice(0, 60), lastName: rest.join(" ").slice(0, 60) };
}

/** True when the private details needed to match historical results are saved. */
export function signupDetailsComplete(details: {
  signupCountry?: string | null;
  signupLocation?: string | null;
  signupDateOfBirth?: string | null;
}): boolean {
  return Boolean(
    cleanText(details.signupCountry) &&
    cleanText(details.signupLocation) &&
    cleanText(details.signupDateOfBirth),
  );
}

/**
 * The usable part of an incomplete form: each field is kept only if it would
 * pass the full check on its own, otherwise it is left empty (null) so the
 * account page asks for it. Never reads anything except the protected state.
 */
export function usableSignupDetails(input: unknown) {
  const details = normalizeSignupDetails(input);
  const valid = (patch: Partial<SignupDetails>) =>
    !signupDetailsError({ ...COMPLETE_PLACEHOLDER, ...patch });
  const names = valid({ firstName: details.firstName, lastName: details.lastName });
  return {
    firstName: names ? details.firstName : null,
    lastName: names ? details.lastName : null,
    signupCountry: valid({ signupCountry: details.signupCountry }) ? details.signupCountry : null,
    signupNationality: valid({ signupNationality: details.signupNationality })
      ? details.signupNationality
      : null,
    signupPostcode:
      details.signupPostcode && valid({ signupPostcode: details.signupPostcode })
        ? details.signupPostcode
        : null,
    signupLocation:
      details.signupLocation && valid({ signupLocation: details.signupLocation })
        ? details.signupLocation
        : null,
    signupDateOfBirth:
      details.signupDateOfBirth && valid({ signupDateOfBirth: details.signupDateOfBirth })
        ? details.signupDateOfBirth
        : null,
    signupClubs:
      details.signupClubs && valid({ signupClubs: details.signupClubs })
        ? details.signupClubs
        : null,
  };
}

const COMPLETE_PLACEHOLDER: SignupDetails = {
  firstName: "Valid",
  lastName: "Placeholder",
  signupCountry: "England",
  signupNationality: "United Kingdom",
  signupLocation: "Norwich",
  signupPostcode: "",
  signupDateOfBirth: "1990-01-01",
  signupClubs: "",
};
