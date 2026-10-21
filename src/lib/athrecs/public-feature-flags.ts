import { publicTranslationUrl } from "./site-translation.ts";

export type PublicFeatureFlags = Partial<
  Record<"homepage-colour-picker" | "language-picker", boolean>
>;

type PublicFeatureFlagEnvironment = {
  VITE_FLAG_HOMEPAGE_COLOUR_PICKER?: string;
  VITE_FLAG_LANGUAGE_PICKER?: string;
};

/** Public, build-time switches only. Never put credentials or user data here. */
export function publicFeatureFlagConfig(env: PublicFeatureFlagEnvironment) {
  return {
    homepageColourPicker: env.VITE_FLAG_HOMEPAGE_COLOUR_PICKER?.trim().toLowerCase() !== "false",
    languagePicker: env.VITE_FLAG_LANGUAGE_PICKER?.trim().toLowerCase() !== "false",
  };
}

/** Return only flags evaluated for this page, using the same values to render and report. */
export function evaluatePublicFeatureFlags(
  pathname: string,
  isAthrecsSite: boolean,
  config: ReturnType<typeof publicFeatureFlagConfig>,
): PublicFeatureFlags {
  if (!isAthrecsSite || publicTranslationUrl(pathname) === null) return {};
  return {
    ...(pathname === "/" ? { "homepage-colour-picker": config.homepageColourPicker } : {}),
    "language-picker": config.languagePicker,
  };
}
