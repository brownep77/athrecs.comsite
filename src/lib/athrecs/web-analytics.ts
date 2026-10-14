import type { BeforeSendEvent } from "@vercel/analytics/react";

export const ANALYTICS_CHOICE_KEY = "athrecs:analytics-consent";
export const WEB_ANALYTICS_NOTICE_KEY = "athrecs:analytics-notice";
export const WEB_ANALYTICS_NOTICE_VERSION = "2026-10-vercel";

const PRIVATE_PATHS = [
  "/admin",
  "/api",
  "/auth",
  "/athlete-account",
  "/my-athlete-profile",
  "/athlete-results",
  "/claim-results",
  "/review-results",
  "/test-account",
  "/clubs/account",
  "/clubs/register",
  "/brands/manage",
  "/brands/register",
  "/sportsrecs",
];

export function isPrivateAnalyticsPath(pathname: string): boolean {
  return PRIVATE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function hasWebAnalyticsConsent(storage: Pick<Storage, "getItem">): boolean {
  try {
    return (
      storage.getItem(ANALYTICS_CHOICE_KEY) === "granted" &&
      storage.getItem(WEB_ANALYTICS_NOTICE_KEY) === WEB_ANALYTICS_NOTICE_VERSION
    );
  } catch {
    return false;
  }
}

export function sanitiseWebAnalyticsEvent(
  event: BeforeSendEvent,
  consentGranted: boolean,
): BeforeSendEvent | null {
  if (!consentGranted || event.type !== "pageview") return null;
  try {
    const url = new URL(event.url);
    if (
      url.protocol !== "https:" ||
      !["athrecs.com", "www.athrecs.com"].includes(url.hostname) ||
      isPrivateAnalyticsPath(decodeURIComponent(url.pathname))
    ) {
      return null;
    }
    // Search terms, email links and other query values must not enter analytics.
    url.search = "";
    url.hash = "";
    return { ...event, url: url.href };
  } catch {
    return null;
  }
}

export function beforeSendWebAnalytics(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    // Recheck at send time so an already-loaded script respects withdrawal.
    return sanitiseWebAnalyticsEvent(event, hasWebAnalyticsConsent(window.localStorage));
  } catch {
    return null;
  }
}
