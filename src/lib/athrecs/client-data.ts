export type ClientDeviceType =
  "Mobile phone" | "Tablet" | "Desktop / laptop" | "Automated client" | "Unknown";

/** Broad browser-reported categories only; reduced UAs do not identify a model. */
export function describeClientDevice(userAgent: string | null | undefined) {
  const ua = (userAgent ?? "").slice(0, 1024);
  const deviceType: ClientDeviceType = /bot|crawler|spider|headless|curl\//i.test(ua)
    ? "Automated client"
    : /iPad|Tablet|Android(?!.*Mobile)/i.test(ua)
      ? "Tablet"
      : /iPhone|iPod|Android.*Mobile|Windows Phone|Mobile/i.test(ua)
        ? "Mobile phone"
        : /Windows NT|Macintosh|X11|CrOS|Linux/i.test(ua)
          ? "Desktop / laptop"
          : "Unknown";
  const os = /Android/i.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/i.test(ua)
      ? "iOS / iPadOS"
      : /Windows/i.test(ua)
        ? "Windows"
        : /CrOS/i.test(ua)
          ? "ChromeOS"
          : /Macintosh|Mac OS X/i.test(ua)
            ? "macOS"
            : /Linux|X11/i.test(ua)
              ? "Linux"
              : "Unknown";
  const browser = /Edg(?:e|A|iOS)?\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /SamsungBrowser\//i.test(ua)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS\//i.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS\//i.test(ua)
            ? "Chrome"
            : /Safari\//i.test(ua)
              ? "Safari"
              : "Unknown";
  return { deviceType, os, browser };
}

const providers: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
  facebook: "Facebook",
  twitter: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
  "grok-google": "Google",
  "grok-x": "X",
  credential: "Email and password",
  "email-password": "Email and password",
};
export function providerLabel(value: string): string {
  return providers[value] ?? "Other provider";
}

/** Use the successful auth endpoint, not a guess from linked account providers. */
export function clientSignInMethod(path: string | undefined): string | null {
  if (path === "/sign-in/email-otp") return "Email code";
  if (path === "/sign-in/email" || path === "/sign-up/email") return "Email and password";
  if (path === "/verify-email") return "Email verification";
  const match = path?.match(/^\/(?:oauth2\/)?callback\/([^/]+)$/);
  return match ? (providers[match[1]] ?? null) : null;
}

export function clientLocation(
  country: string | null,
  region: string | null,
  city: string | null,
): string {
  let name = country;
  if (country) {
    try {
      name = new Intl.DisplayNames(["en"], { type: "region" }).of(country) ?? country;
    } catch {
      /* keep code */
    }
  }
  return [city, region, name].filter(Boolean).join(", ") || "Not recorded";
}

export type ClientLogin = ReturnType<typeof describeClientDevice> & {
  id: string;
  signedInAt: string;
  deviceNumber: string | null;
  signInMethod: string | null;
  location: string;
  existingSession: boolean;
};
export type ClientDataItem = {
  userId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  signedUpAt: string;
  lastSignInAt: string | null;
  signInCount: number;
  recognisedDevices: number;
  linkedMethods: string[];
  latestLogin: ClientLogin | null;
};
