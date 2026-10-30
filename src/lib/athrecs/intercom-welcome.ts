/** Non-identifying preferences for the once-only Messenger introduction. */
export const INTERCOM_WELCOME_SEEN_KEY = "athrecs.intercom.welcome.seen.v1";
export const INTERCOM_BANNER_DISMISSED_KEY = "athrecs.intercom.welcome.banner-dismissed.v1";
export const INTERCOM_WELCOME_DELAY = 5_000;

export type IntercomWelcomePreferences = Readonly<{
  hydrated: boolean;
  seen: boolean;
  bannerDismissed: boolean;
}>;

const serverPreferences: IntercomWelcomePreferences = {
  hydrated: false,
  seen: false,
  bannerDismissed: false,
};
let preferences = serverPreferences;
const listeners = new Set<() => void>();

function publish(next: IntercomWelcomePreferences): void {
  if (
    next.hydrated === preferences.hydrated &&
    next.seen === preferences.seen &&
    next.bannerDismissed === preferences.bannerDismissed
  )
    return;
  preferences = next;
  listeners.forEach((listener) => listener());
}

function syncPreferences(): void {
  if (typeof window === "undefined") return;
  let seen = preferences.seen;
  let bannerDismissed = preferences.bannerDismissed;
  try {
    seen ||= window.localStorage.getItem(INTERCOM_WELCOME_SEEN_KEY) === "true";
    bannerDismissed ||= window.localStorage.getItem(INTERCOM_BANNER_DISMISSED_KEY) === "true";
  } catch {
    // The same-document memory above still prevents repeated SPA introductions.
  }
  publish({ hydrated: true, seen: seen || bannerDismissed, bannerDismissed });
}

function storageChanged(event: StorageEvent): void {
  if (
    event.key === INTERCOM_WELCOME_SEEN_KEY ||
    event.key === INTERCOM_BANNER_DISMISSED_KEY ||
    event.key === null
  )
    syncPreferences();
}

export function subscribeIntercomWelcome(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined")
    window.addEventListener("storage", storageChanged);
  syncPreferences();
  return () => {
    listeners.delete(listener);
    if (!listeners.size && typeof window !== "undefined")
      window.removeEventListener("storage", storageChanged);
  };
}

export const getIntercomWelcomePreferences = () => preferences;
export const getIntercomServerWelcomePreferences = () => serverPreferences;

export function markIntercomWelcomeSeen(): void {
  if (typeof window === "undefined") return;
  publish({ ...preferences, hydrated: true, seen: true });
  try {
    window.localStorage.setItem(INTERCOM_WELCOME_SEEN_KEY, "true");
  } catch {
    // No account IDs, names, email addresses or tokens are stored here.
  }
}

export function dismissIntercomWelcomeBanner(): void {
  if (typeof window === "undefined") return;
  publish({ hydrated: true, seen: true, bannerDismissed: true });
  try {
    window.localStorage.setItem(INTERCOM_WELCOME_SEEN_KEY, "true");
    window.localStorage.setItem(INTERCOM_BANNER_DISMISSED_KEY, "true");
  } catch {
    // Dismissal continues to apply for the lifetime of the document.
  }
}

const PUBLIC_BROWSE_ROOTS = new Set([
  "athletes",
  "races",
  "results",
  "running",
  "clubs",
  "directory",
  "news",
  "race-reports",
  "podcasts",
  "sports",
  "parkrun",
  "triathlon",
  "cycling",
  "duathlon",
  "swimming",
  "athletics",
]);
const NON_BROWSING_SEGMENTS = new Set([
  "admin",
  "auth",
  "sign-in",
  "sign-up",
  "athlete-account",
  "my-athlete-profile",
  "claim-results",
  "privacy",
  "claim",
  "claims",
  "edit",
  "create",
  "new",
  "submit",
  "upload",
  "settings",
  "account",
  "login",
  "register",
  "invite",
  "invitations",
  "verify",
  "reset-password",
  "dashboard",
  "checkout",
  "payment",
]);
const LANGUAGES = new Set(["en", "fr", "de", "es", "it", "pt", "nl", "pl", "zh", "ja", "ar", "th"]);

/** Only browsing routes receive a proactive welcome, never account/editing flows. */
export function isIntercomWelcomePage(pathname: string): boolean {
  const segments = pathname.toLowerCase().split("/").filter(Boolean);
  if (segments.some((segment) => NON_BROWSING_SEGMENTS.has(segment))) return false;
  if (LANGUAGES.has(segments[0]) && segments.length >= 2) segments.splice(0, 2);
  return segments.length === 0 || PUBLIC_BROWSE_ROOTS.has(segments[0]);
}

/** Do not interrupt typing, modal work, hidden tabs or another focused window. */
export function canPresentIntercomWelcome(doc: Document): boolean {
  if (doc.visibilityState !== "visible" || !doc.hasFocus()) return false;
  const active = doc.activeElement;
  if (
    active?.closest(
      "input, textarea, select, iframe, [contenteditable]:not([contenteditable='false']), [role='textbox'], [role='combobox']",
    )
  )
    return false;
  return !Array.from(
    doc.querySelectorAll("dialog[open], [role='dialog'], [role='alertdialog']"),
  ).some(
    (dialog) => dialog.getClientRects().length > 0 && dialog.getAttribute("aria-hidden") !== "true",
  );
}
