export const AUTH_DIALOG_EVENT = "athrecs:open-athlete-auth";

export type AuthDialogMode = "signin" | "signup" | "forgot" | "reset";

export type AuthDialogOptions = {
  callbackURL?: string;
  errorCallbackURL?: string;
  mode?: AuthDialogMode;
};

export type DirectSocialProviderId =
  | "google"
  | "apple"
  | "microsoft"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "github";

export type BrokerSocialProviderId = "grok-google" | "grok-x";
export type AthleteAuthProviderId = DirectSocialProviderId | BrokerSocialProviderId;

export type AvailableSocialProvider = {
  providerId: AthleteAuthProviderId;
  label: string;
  category: "identity" | "social";
};

export type AvailableAuthMethods = {
  emailPassword: boolean;
  passwordReset: boolean;
  providers: AvailableSocialProvider[];
};

export const DIRECT_SOCIAL_PROVIDER_LABELS: Record<DirectSocialProviderId, string> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
  facebook: "Facebook",
  twitter: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
};

/** Keep all return destinations on the current Athrecs origin. */
export function safeAuthCallback(value: string | undefined, fallback = "/athlete-account"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const parsed = new URL(value, "https://www.athrecs.com");
    if (parsed.origin !== "https://www.athrecs.com") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
