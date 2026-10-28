import { IS_ATHRECS_SITE } from "@/lib/site-scope";

/**
 * Intercom Messenger (US region workspace).
 *
 * Off by default. Set VITE_INTERCOM_APP_ID in the Vercel project to switch the
 * Intercom Messenger on; while it is set, the legacy "Ask AthRecs" assistant
 * launcher is hidden so visitors never see two competing chat widgets.
 * Unset it to roll back to the legacy assistant without a code change.
 */
export const INTERCOM_APP_ID = (import.meta.env.VITE_INTERCOM_APP_ID ?? "").trim();
export const INTERCOM_ENABLED = IS_ATHRECS_SITE && /^[a-z0-9]{6,12}$/.test(INTERCOM_APP_ID);

const API_BASE = "https://api-iam.intercom.io";
const MOBILE_NAV_CLEARANCE = 88; // keep the launcher above the mobile bottom navigation
const PAGE_UPDATE_INTERVAL = 3 * 60 * 1000;
export const INTERCOM_RESET_EVENT = "athrecs:intercom-session-ended";
export const INTERCOM_ACCOUNT_KEY = `athrecs.intercom.account.${INTERCOM_APP_ID}`;
export const INTERCOM_LOGOUT_KEY = `athrecs.intercom.logout.${INTERCOM_APP_ID}`;

type MessengerIdentity = { userId: string; jwt: string; expiresAt: number };
let activeUserId: string | null | undefined;
let activeIdentity: MessengerIdentity | null = null;
let sessionVersion = 0;
let lastUpdateAt = 0;

export type IntercomDisplayState = Readonly<{ ready: boolean; isOpen: boolean }>;
const HIDDEN_DISPLAY: IntercomDisplayState = Object.freeze({ ready: false, isOpen: false });
let displayState = HIDDEN_DISPLAY;
let displayGeneration = 0;
let displayCallbacksBound = false;
const displayListeners = new Set<() => void>();

/** Stable snapshots for React's useSyncExternalStore; no identity data is exposed. */
export const getIntercomDisplayState = (): IntercomDisplayState => displayState;
export const getIntercomServerDisplayState = (): IntercomDisplayState => HIDDEN_DISPLAY;
export function subscribeIntercomDisplay(listener: () => void): () => void {
  displayListeners.add(listener);
  return () => {
    displayListeners.delete(listener);
  };
}

function setDisplayState(ready: boolean, isOpen: boolean): void {
  if (displayState.ready === ready && displayState.isOpen === isOpen) return;
  displayState = ready || isOpen ? Object.freeze({ ready, isOpen }) : HIDDEN_DISPLAY;
  displayListeners.forEach((listener) => listener());
}

function invalidateDisplay(): void {
  displayGeneration += 1;
  displayCallbacksBound = false;
  setDisplayState(false, false);
}

type IntercomFn = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  c?: (args: unknown[]) => void;
};

declare global {
  interface Window {
    Intercom?: IntercomFn;
    intercomSettings?: Record<string, unknown>;
  }
}

function settings(identity: MessengerIdentity | null = null): Record<string, unknown> {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  return {
    api_base: API_BASE,
    app_id: INTERCOM_APP_ID,
    vertical_padding: mobile ? MOBILE_NAV_CLEARANCE : 20,
    ...(identity ? { intercom_user_jwt: identity.jwt, session_duration: 60 * 60 * 1000 } : {}),
  };
}

function previousAccount(): { userId: string | null; storageAvailable: boolean } {
  try {
    return { userId: window.localStorage.getItem(INTERCOM_ACCOUNT_KEY), storageAvailable: true };
  } catch {
    return { userId: null, storageAvailable: false };
  }
}

function rememberAccount(userId: string | null): void {
  try {
    // This is only a cleanup hint across reloads, never an authentication credential.
    // Tokens, names and email addresses are never persisted here.
    if (userId) window.localStorage.setItem(INTERCOM_ACCOUNT_KEY, userId);
    else window.localStorage.removeItem(INTERCOM_ACCOUNT_KEY);
  } catch {
    // With storage disabled, fresh documents reset the Messenger before booting.
  }
}

function clearIntercomCookies(): void {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => name.startsWith("intercom-"));
  const labels = window.location.hostname.split(".");
  const domains = ["", ...labels.map((_, index) => labels.slice(index).join("."))];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""}`;
    }
  }
}

/** Clear the old account even if the widget has not finished loading yet. */
export function shutdownIntercom(clearAccountMarker = true): void {
  if (!INTERCOM_ENABLED || typeof window === "undefined") return;
  sessionVersion += 1;
  // Invalidate callbacks before shutdown can synchronously emit onHide.
  invalidateDisplay();
  window.Intercom?.("shutdown");
  clearIntercomCookies();
  window.intercomSettings = settings();
  activeUserId = undefined;
  activeIdentity = null;
  lastUpdateAt = 0;
  if (clearAccountMarker) rememberAccount(null);
}

/** Called synchronously before sign-out/navigation; also invalidates pending tokens. */
export function endIntercomSession(preserveAnonymous = false): void {
  if (!INTERCOM_ENABLED || typeof window === "undefined") return;
  if (preserveAnonymous && !activeUserId && !previousAccount().userId) {
    // A first member token may still be in flight even before a marker exists.
    // Invalidate it while retaining a genuine visitor's conversation for login.
    sessionVersion += 1;
    invalidateDisplay();
    window.dispatchEvent(new Event(INTERCOM_RESET_EVENT));
    return;
  }
  shutdownIntercom();
  window.dispatchEvent(new Event(INTERCOM_RESET_EVENT));
  try {
    window.localStorage.setItem(INTERCOM_LOGOUT_KEY, `${Date.now()}:${Math.random()}`);
  } catch {
    // Same-tab cleanup still runs when browser storage is unavailable.
  }
}

export function intercomSessionVersion(): number {
  return sessionVersion;
}

/** Initial hydration must not erase a visitor conversation waiting to become a member. */
export function suspendIntercom(): void {
  if (activeUserId) shutdownIntercom(false);
  else if (displayCallbacksBound) invalidateDisplay();
}

/** Reset a different/expired account before any asynchronous identity request. */
export function prepareIntercomAccount(userId: string | null): void {
  if (!INTERCOM_ENABLED || typeof window === "undefined") return;
  const previous = previousAccount();
  if (
    (activeUserId && activeUserId !== userId) ||
    (previous.userId && previous.userId !== userId) ||
    (activeUserId === undefined && !previous.storageAvailable)
  )
    shutdownIntercom();
}

function loadIntercom(): void {
  if (window.Intercom && document.getElementById("intercom-widget-script")) return;
  const queue: IntercomFn = Object.assign(
    (...args: unknown[]) => {
      queue.c?.(args);
    },
    { q: [] as unknown[][] },
  );
  queue.c = (args) => queue.q!.push(args);
  window.Intercom = queue;
  const script = document.createElement("script");
  script.id = "intercom-widget-script";
  script.async = true;
  script.src = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;
  document.head.appendChild(script);
}

function hasLiveSession(): boolean {
  if (
    !INTERCOM_ENABLED ||
    typeof window === "undefined" ||
    !window.Intercom ||
    activeUserId === undefined
  )
    return false;
  if (activeIdentity && activeIdentity.expiresAt <= Date.now() / 1000) {
    shutdownIntercom();
    return false;
  }
  return true;
}

function bindDisplayCallbacks(): void {
  const generation = displayGeneration;
  displayCallbacksBound = true;
  const isCurrent = () => generation === displayGeneration && hasLiveSession();
  window.Intercom!("onShow", () => {
    if (isCurrent()) setDisplayState(displayState.ready, true);
  });
  window.Intercom!("onHide", () => {
    if (isCurrent()) setDisplayState(displayState.ready, false);
  });
  // Register after boot so an already-ready anonymous session cannot certify a
  // new member's boot. This callback only fires when the SDK accepts that boot.
  window.Intercom!("ready", () => {
    if (isCurrent()) setDisplayState(true, displayState.isOpen);
  });
}

/** A signed token is the only way to identify an account; null preserves visitor chat. */
export function bootIntercom(identity: MessengerIdentity | null = null): void {
  if (!INTERCOM_ENABLED || typeof window === "undefined") return;
  if (identity && (!identity.userId || !identity.jwt || identity.expiresAt <= Date.now() / 1000)) {
    shutdownIntercom();
    return;
  }
  const userId = identity?.userId ?? null;
  prepareIntercomAccount(userId);
  loadIntercom();
  const sameUser = activeUserId === userId;
  const sameToken = activeIdentity?.jwt === identity?.jwt;
  const bindDisplay = !sameUser || !displayCallbacksBound;
  if (bindDisplay) invalidateDisplay();
  window.intercomSettings = settings(identity);
  activeUserId = userId;
  activeIdentity = identity;
  if (!sameUser) window.Intercom!("boot", window.intercomSettings);
  else if (!sameToken) window.Intercom!("update", window.intercomSettings);
  if (!sameUser || !sameToken) lastUpdateAt = Date.now();
  if (bindDisplay) bindDisplayCallbacks();
  rememberAccount(userId);
}

export function updateIntercomPage(): void {
  if (
    !INTERCOM_ENABLED ||
    typeof window === "undefined" ||
    !window.Intercom ||
    activeUserId === undefined
  )
    return;
  if (activeIdentity && activeIdentity.expiresAt <= Date.now() / 1000) {
    shutdownIntercom();
    return;
  }
  if (Date.now() - lastUpdateAt < PAGE_UPDATE_INTERVAL) return;
  window.Intercom("update", {
    ...settings(activeIdentity),
    last_request_at: Math.floor(Date.now() / 1000),
  });
  lastUpdateAt = Date.now();
}

/** Opens the existing Messenger only after its current authenticated boot succeeds. */
export function openIntercom(): boolean {
  if (!hasLiveSession() || !displayState.ready) return false;
  window.Intercom!("show");
  return true;
}

/** Opens a composer with the visitor's first message pre-filled, never sent. */
export function openIntercomMessage(prefill: string): boolean {
  if (!hasLiveSession() || !displayState.ready) return false;
  window.Intercom!("showNewMessage", prefill);
  return true;
}
