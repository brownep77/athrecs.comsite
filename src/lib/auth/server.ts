import { betterAuth } from "better-auth";
import { bearer, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { createPrivateKey, randomBytes, sign as signDigest } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { authEmailConfigured, sendAthrecsAuthEmail } from "./email.server";
import { emailAndPasswordEnabled } from "./email-password";
import { GROK_PROVIDERS } from "./providers";
import { pgliteDialect } from "./pglite-dialect";
import {
  GROK_ISSUER_DEFAULT,
  PREVIEW_ALLOWED_HOSTS,
  PREVIEW_CLIENT_ID,
  PREVIEW_CLIENT_SECRET,
} from "./preview";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};

function previewAuthSecret(): string {
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const authDisabled = env("VITE_AUTH_ENABLED") === "false";
const emailPasswordConfigured = !authDisabled && emailAndPasswordEnabled;
const emailDeliveryConfigured = emailPasswordConfigured && authEmailConfigured();

const googleClientId = env("GOOGLE_CLIENT_ID");
const googleClientSecret = env("GOOGLE_CLIENT_SECRET");
const directGoogleConfigured =
  !authDisabled && Boolean(googleClientId && googleClientSecret);

const appleClientId = env("APPLE_CLIENT_ID");
const appleTeamId = env("APPLE_TEAM_ID");
const appleKeyId = env("APPLE_KEY_ID");
const applePrivateKey = env("APPLE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
const appleAppBundleIdentifier = env("APPLE_APP_BUNDLE_IDENTIFIER");
const directAppleConfigured =
  !authDisabled &&
  Boolean(appleClientId && appleTeamId && appleKeyId && applePrivateKey);

const microsoftClientId = env("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = env("MICROSOFT_CLIENT_SECRET");
const microsoftTenantId = env("MICROSOFT_TENANT_ID") ?? "common";
const directMicrosoftConfigured =
  emailDeliveryConfigured && Boolean(microsoftClientId && microsoftClientSecret);

const facebookClientId = env("FACEBOOK_CLIENT_ID");
const facebookClientSecret = env("FACEBOOK_CLIENT_SECRET");
const directFacebookConfigured =
  emailDeliveryConfigured && Boolean(facebookClientId && facebookClientSecret);

const twitterClientId = env("TWITTER_CLIENT_ID");
const twitterClientSecret = env("TWITTER_CLIENT_SECRET");
const directTwitterConfigured =
  emailDeliveryConfigured && Boolean(twitterClientId && twitterClientSecret);

const linkedinClientId = env("LINKEDIN_CLIENT_ID");
const linkedinClientSecret = env("LINKEDIN_CLIENT_SECRET");
const directLinkedinConfigured =
  emailDeliveryConfigured && Boolean(linkedinClientId && linkedinClientSecret);

const githubClientId = env("GITHUB_CLIENT_ID");
const githubClientSecret = env("GITHUB_CLIENT_SECRET");
const directGithubConfigured =
  emailDeliveryConfigured && Boolean(githubClientId && githubClientSecret);

// BETTER_AUTH_URL is a canonical fallback. The actual approved Athrecs hostname
// is resolved per request so public and staff sessions remain host-only.
const explicitBaseURL = env("BETTER_AUTH_URL");

const grokIssuer = env("GROK_AUTH_ISSUER") ?? GROK_ISSUER_DEFAULT;
const configuredGrokClientId = env("GROK_AUTH_CLIENT_ID");
const configuredGrokClientSecret = env("GROK_AUTH_CLIENT_SECRET");
const grokClientId = configuredGrokClientId ?? PREVIEW_CLIENT_ID;
const grokClientSecret = configuredGrokClientSecret ?? PREVIEW_CLIENT_SECRET;
const brokerConfigured =
  !authDisabled &&
  ((!explicitBaseURL && Boolean(grokClientId && grokClientSecret)) ||
    Boolean(configuredGrokClientId && configuredGrokClientSecret));

/** True when at least one real authentication method is active. */
export const authConfigured =
  emailPasswordConfigured ||
  directGoogleConfigured ||
  directAppleConfigured ||
  directMicrosoftConfigured ||
  directFacebookConfigured ||
  directTwitterConfigured ||
  directLinkedinConfigured ||
  directGithubConfigured ||
  brokerConfigured;

const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];
const ATHRECS_DEPLOYED_AUTH_HOSTS: string[] = [
  "www.athrecs.com",
  "athrecs.com",
  "update.athrecs.com",
];

function parseAbsoluteURL(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function unique(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

const explicitBase = parseAbsoluteURL(explicitBaseURL);
const deployedAllowedHosts = unique([
  ...ATHRECS_DEPLOYED_AUTH_HOSTS,
  ...(explicitBase ? [explicitBase.host] : []),
]);
const deployedTrustedOrigins = unique([
  ...ATHRECS_DEPLOYED_AUTH_HOSTS.map((host) => `https://${host}`),
  ...(explicitBase ? [explicitBase.origin] : []),
  ...(directAppleConfigured ? ["https://appleid.apple.com"] : []),
]);
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];

const baseURL = explicitBaseURL
  ? {
      allowedHosts: deployedAllowedHosts,
      protocol: "auto" as const,
      fallback: explicitBase?.origin ?? explicitBaseURL,
    }
  : {
      allowedHosts: [...previewAllowedHosts, "localhost", "127.0.0.1", "[::1]"],
      protocol: "auto" as const,
      fallback: "http://localhost:8080",
    };

const trustedOrigins: string[] = explicitBaseURL
  ? deployedTrustedOrigins
  : unique([
      ...previewAllowedHosts,
      ...previewAllowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
      ...LOCAL_DEV_ORIGINS,
      ...(directAppleConfigured ? ["https://appleid.apple.com"] : []),
    ]);

const databaseUrl = env("DATABASE_URL");
const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

function base64UrlJson(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/** Generate Apple's ES256 client-secret JWT for each server boot. */
function generateAppleClientSecret(): string {
  if (!appleClientId || !appleTeamId || !appleKeyId || !applePrivateKey) {
    throw new Error("Sign in with Apple is not fully configured");
  }
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64UrlJson({ alg: "ES256", kid: appleKeyId })}.${base64UrlJson({
    iss: appleTeamId,
    iat: now,
    exp: now + 180 * 24 * 60 * 60,
    aud: "https://appleid.apple.com",
    sub: appleClientId,
  })}`;
  const signature = signDigest("sha256", Buffer.from(unsigned), {
    key: createPrivateKey(applePrivateKey),
    dsaEncoding: "ieee-p1363",
  });
  return `${unsigned}.${signature.toString("base64url")}`;
}

const issuerBase = grokIssuer.replace(/\/+$/, "");
const grokOAuthPlugin = brokerConfigured
  ? genericOAuth({
      config: GROK_PROVIDERS.map(({ providerId, idp }) => ({
        providerId,
        clientId: grokClientId as string,
        clientSecret: grokClientSecret as string,
        authorizationUrl: `${issuerBase}/api/auth/oauth2/authorize`,
        tokenUrl: `${issuerBase}/api/auth/oauth2/token`,
        userInfoUrl: `${issuerBase}/api/auth/oauth2/userinfo`,
        scopes: ["openid", "profile", "email"],
        authorizationUrlParams: { idp, prompt: "login" },
      })),
    })
  : null;

const socialProviders = {
  ...(directGoogleConfigured
    ? {
        google: {
          clientId: googleClientId as string,
          clientSecret: googleClientSecret as string,
          prompt: "select_account" as const,
          requireEmailVerification: true,
        },
      }
    : {}),
  ...(directAppleConfigured
    ? {
        apple: async () => ({
          clientId: appleClientId as string,
          clientSecret: generateAppleClientSecret(),
          ...(appleAppBundleIdentifier
            ? { appBundleIdentifier: appleAppBundleIdentifier }
            : {}),
          requireEmailVerification: true,
        }),
      }
    : {}),
  ...(directMicrosoftConfigured
    ? {
        microsoft: {
          clientId: microsoftClientId as string,
          clientSecret: microsoftClientSecret as string,
          tenantId: microsoftTenantId,
          authority: "https://login.microsoftonline.com",
          prompt: "select_account" as const,
        },
      }
    : {}),
  ...(directFacebookConfigured
    ? {
        facebook: {
          clientId: facebookClientId as string,
          clientSecret: facebookClientSecret as string,
          scope: ["email", "public_profile"],
        },
      }
    : {}),
  ...(directTwitterConfigured
    ? {
        twitter: {
          clientId: twitterClientId as string,
          clientSecret: twitterClientSecret as string,
          scope: ["tweet.read", "users.read", "user.email", "offline.access"],
        },
      }
    : {}),
  ...(directLinkedinConfigured
    ? {
        linkedin: {
          clientId: linkedinClientId as string,
          clientSecret: linkedinClientSecret as string,
          scope: ["openid", "profile", "email"],
          requireEmailVerification: true,
        },
      }
    : {}),
  ...(directGithubConfigured
    ? {
        github: {
          clientId: githubClientId as string,
          clientSecret: githubClientSecret as string,
          scope: ["read:user", "user:email"],
          requireEmailVerification: true,
        },
      }
    : {}),
};

const emailVerification = emailDeliveryConfigured
  ? {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendAthrecsAuthEmail({
          to: user.email,
          subject: "Verify your ATHRECS Athlete Account",
          heading: "Verify your email address",
          message:
            "Confirm this email to finish securing your Athlete Account and use result claims, recovery and account linking.",
          actionLabel: "Verify email",
          actionUrl: url,
        });
      },
    }
  : undefined;

const emailAndPassword = emailPasswordConfigured
  ? {
      enabled: true,
      requireEmailVerification: emailDeliveryConfigured,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      ...(emailDeliveryConfigured
        ? {
            sendResetPassword: async ({
              user,
              url,
            }: {
              user: { email: string };
              url: string;
            }) => {
              await sendAthrecsAuthEmail({
                to: user.email,
                subject: "Reset your ATHRECS password",
                heading: "Reset your password",
                message:
                  "Use this secure link to choose a new ATHRECS password. The link expires after one hour.",
                actionLabel: "Reset password",
                actionUrl: url,
              });
            },
          }
        : {}),
    }
  : undefined;

export const auth = betterAuth({
  appName: "ATHRECS.com",
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
  database,
  trustedOrigins,
  ...(Object.keys(socialProviders).length ? { socialProviders } : {}),
  ...(emailVerification ? { emailVerification } : {}),
  ...(emailAndPassword ? { emailAndPassword } : {}),
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: [
        "google",
        "apple",
        "github",
        "linkedin",
        "email-password",
        "credential",
        ...GROK_PROVIDERS.map((provider) => provider.providerId),
      ],
      requireLocalEmailVerified: true,
      allowDifferentEmails: false,
    },
  },
  session: { cookieCache: { enabled: true, maxAge: 300 } },
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },
  plugins: [
    ...(grokOAuthPlugin ? [grokOAuthPlugin] : []),
    bearer(),
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

export { GROK_PROVIDERS } from "./providers";
