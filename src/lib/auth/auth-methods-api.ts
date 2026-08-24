import { createServerFn } from "@tanstack/react-start";
import type {
  AvailableAuthMethods,
  AvailableSocialProvider,
  AthleteAuthProviderId,
} from "./auth-methods";

function configured(...values: Array<string | undefined>): boolean {
  return values.every((value) => Boolean(value?.trim()));
}

export const getAvailableAuthMethods = createServerFn({ method: "GET" }).handler(
  async (): Promise<AvailableAuthMethods> => {
    const env = process.env;
    const emailPassword = configured(env.RESEND_API_KEY, env.AUTH_EMAIL_FROM);
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
      emailPassword && configured(env.MICROSOFT_CLIENT_ID, env.MICROSOFT_CLIENT_SECRET),
    );
    add(
      "facebook",
      "Facebook",
      "social",
      emailPassword && configured(env.FACEBOOK_CLIENT_ID, env.FACEBOOK_CLIENT_SECRET),
    );

    const directTwitter = configured(env.TWITTER_CLIENT_ID, env.TWITTER_CLIENT_SECRET);
    add(
      directTwitter ? "twitter" : "grok-x",
      "X",
      "social",
      emailPassword && (directTwitter || brokerConfigured),
    );
    add(
      "linkedin",
      "LinkedIn",
      "social",
      emailPassword && configured(env.LINKEDIN_CLIENT_ID, env.LINKEDIN_CLIENT_SECRET),
    );
    add(
      "github",
      "GitHub",
      "social",
      emailPassword && configured(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET),
    );

    return {
      emailPassword,
      passwordReset: emailPassword,
      providers,
    };
  },
);
