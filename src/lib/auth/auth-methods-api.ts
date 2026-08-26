import { createServerFn } from "@tanstack/react-start";
import type {
  AvailableAuthMethods,
  AvailableSocialProvider,
  AthleteAuthProviderId,
} from "./auth-methods";
import { emailAndPasswordEnabled } from "./email-password";

function configured(...values: Array<string | undefined>): boolean {
  return values.every((value) => Boolean(value?.trim()));
}

export const getAvailableAuthMethods = createServerFn({ method: "GET" }).handler(
  async (): Promise<AvailableAuthMethods> => {
    const env = process.env;
    const authEnabled = env.VITE_AUTH_ENABLED !== "false";
    const resendApiKeyPresent = configured(env.RESEND_API_KEY);
    const authEmailFromCustom = configured(env.AUTH_EMAIL_FROM);
    const emailPassword = authEnabled && emailAndPasswordEnabled;
    // The sender safely defaults to accounts@athrecs.com in email.server.ts.
    const emailDelivery = emailPassword && resendApiKeyPresent;

    console.info("[auth-methods]", {
      authEnabled,
      emailPasswordFeatureEnabled: emailAndPasswordEnabled,
      resendApiKeyPresent,
      authEmailFromCustom,
      authEmailFromDefaulted: !authEmailFromCustom,
      emailPassword,
      emailDelivery,
      environment: env.VERCEL_ENV ?? "unknown",
      deployment: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
    });

    if (!authEnabled) {
      return { emailPassword: false, passwordReset: false, providers: [] };
    }

    const deployed = configured(env.BETTER_AUTH_URL);
    const brokerConfigured =
      !deployed || configured(env.GROK_AUTH_CLIENT_ID, env.GROK_AUTH_CLIENT_SECRET);

    const providers: AvailableSocialProvider[] = [];
    const add = (
      providerId: AthleteAuthProviderId,
      label: string,
      category: AvailableSocialProvider["category"],
      enabled: boolean,
    ) => {
      if (enabled) providers.push({ providerId, label, category });
    };

    const directGoogle = configured(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
    add(
      directGoogle ? "google" : "grok-google",
      "Google",
      "identity",
      directGoogle || brokerConfigured,
    );

    add(
      "apple",
      "Apple",
      "identity",
      configured(
        env.APPLE_CLIENT_ID,
        env.APPLE_TEAM_ID,
        env.APPLE_KEY_ID,
        env.APPLE_PRIVATE_KEY,
      ),
    );
    add(
      "microsoft",
      "Microsoft",
      "identity",
      emailDelivery && configured(env.MICROSOFT_CLIENT_ID, env.MICROSOFT_CLIENT_SECRET),
    );
    add(
      "facebook",
      "Facebook",
      "social",
      emailDelivery && configured(env.FACEBOOK_CLIENT_ID, env.FACEBOOK_CLIENT_SECRET),
    );

    const directTwitter = configured(env.TWITTER_CLIENT_ID, env.TWITTER_CLIENT_SECRET);
    add(
      directTwitter ? "twitter" : "grok-x",
      "X",
      "social",
      emailDelivery && (directTwitter || brokerConfigured),
    );
    add(
      "linkedin",
      "LinkedIn",
      "social",
      emailDelivery && configured(env.LINKEDIN_CLIENT_ID, env.LINKEDIN_CLIENT_SECRET),
    );

    return {
      emailPassword,
      passwordReset: emailDelivery,
      providers,
    };
  },
);
