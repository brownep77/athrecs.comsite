import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  AUTH_DIALOG_EVENT,
  safeAuthCallback,
  type AthleteAuthProviderId,
  type AuthDialogOptions,
  type BrokerSocialProviderId,
} from "./auth-methods";
import { GROK_PROVIDERS } from "./providers";

/** Same-origin Better Auth client. Preview sessions use a bearer token. */
export const authClient = createAuthClient({
  plugins: [genericOAuthClient()],
  fetchOptions: {
    onRequest(ctx) {
      const token = getBearerToken();
      if (token) ctx.headers.set("Authorization", `Bearer ${token}`);
      return ctx;
    },
  },
});

export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";
export { GROK_PROVIDERS };

const BEARER_KEY = "grok-auth.bearer-token";

export function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(BEARER_KEY);
  } catch {
    return null;
  }
}

function setBearerToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(BEARER_KEY, token);
    else window.sessionStorage.removeItem(BEARER_KEY);
  } catch {
    // Storage is unavailable. Cookie authentication still works outside preview.
  }
}

function inLivePreview(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".grok-sandbox.com")
  );
}

function isBrokerProvider(providerId: AthleteAuthProviderId): providerId is BrokerSocialProviderId {
  return providerId === "grok-google" || providerId === "grok-x";
}

export function openAthleteAuth(options: AuthDialogOptions = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AuthDialogOptions>(AUTH_DIALOG_EVENT, {
      detail: {
        ...options,
        callbackURL: safeAuthCallback(options.callbackURL),
        errorCallbackURL: safeAuthCallback(
          options.errorCallbackURL,
          safeAuthCallback(options.callbackURL),
        ),
      },
    }),
  );
}

/**
 * Backward-compatible entry point used by the existing public account and claim
 * buttons. Public Google buttons now open the full chooser; the staff microsite
 * remains deliberately Google-only and continues directly to Google.
 */
export async function signIn(
  providerId: string,
  options: AuthDialogOptions = {},
): Promise<void> {
  const callbackURL = safeAuthCallback(options.callbackURL);
  if (providerId === "grok-google" && !callbackURL.startsWith("/admin")) {
    openAthleteAuth({ ...options, callbackURL });
    // The two legacy public buttons set a local loading state before awaiting
    // this function and clear it in their catch handler. An empty error resets
    // those buttons without displaying an error, while the chooser stays open.
    throw new Error("");
  }
  await signInWithProvider(providerId as AthleteAuthProviderId, {
    ...options,
    callbackURL,
  });
}

/** Start one concrete provider after the user selects it in the chooser. */
export async function signInWithProvider(
  providerId: AthleteAuthProviderId,
  options: AuthDialogOptions = {},
): Promise<void> {
  const callbackURL = safeAuthCallback(options.callbackURL);
  const errorCallbackURL = safeAuthCallback(options.errorCallbackURL, callbackURL);
  const preview = inLivePreview();
  const popup = preview && isBrokerProvider(providerId) ? openSignInPopup(providerId) : null;

  const hadBearer = Boolean(getBearerToken());
  if (hadBearer || !preview) {
    try {
      await authClient.signOut();
    } catch {
      // A missing or stale session must not prevent a new sign-in attempt.
    }
  }
  setBearerToken(null);

  if (preview && isBrokerProvider(providerId)) {
    if (!popup) throw new Error("Pop-up blocked — allow pop-ups for sign-in");
    const token = await waitForPopupToken(popup);
    if (!token) throw new Error("Sign-in was cancelled or failed");
    setBearerToken(token);
    try {
      await authClient.getSession();
    } catch {
      // The normal session hook will retry on the destination page.
    }
    const destination = new URL(callbackURL, window.location.origin);
    if (
      destination.pathname !== window.location.pathname ||
      destination.search !== window.location.search
    ) {
      window.location.href = callbackURL;
    }
    return;
  }

  // The historical public/staff provider id maps to direct Google on deployment.
  if (providerId === "grok-google") {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL,
      disableRedirect: true,
    });
    if (error) throw new Error(error.message ?? "Google sign-in failed");
    if (data?.url) window.location.href = data.url;
    return;
  }

  if (isBrokerProvider(providerId)) {
    const { data, error } = await authClient.signIn.oauth2({
      providerId,
      callbackURL,
      errorCallbackURL,
    });
    if (error) throw new Error(error.message ?? "Sign-in failed");
    if (data?.url) window.location.href = data.url;
    return;
  }

  const { data, error } = await authClient.signIn.social({
    provider: providerId,
    callbackURL,
    errorCallbackURL,
    disableRedirect: true,
  });
  if (error) throw new Error(error.message ?? `${providerId} sign-in failed`);
  if (data?.url) window.location.href = data.url;
}

type PopupMessage = {
  source: "grok-auth-popup";
  token: string | null;
  error?: string;
};

function openSignInPopup(providerId: BrokerSocialProviderId): Window | null {
  const url = `${window.location.origin}/auth/popup?providerId=${encodeURIComponent(providerId)}`;
  return window.open(url, `grok-signin-${Date.now()}`, "popup,width=500,height=650");
}

function waitForPopupToken(popup: Window): Promise<string | null> {
  return new Promise((resolve) => {
    const origin = window.location.origin;
    let settled = false;
    let closeTimer: number | undefined;
    const settle = (token: string | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(token);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const data = event.data as PopupMessage | undefined;
      if (!data || data.source !== "grok-auth-popup") return;
      settle(data.token ?? null);
    };
    const pollTimer = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(pollTimer);
      closeTimer = window.setTimeout(() => settle(null), 400);
    }, 300);
    function cleanup() {
      window.clearInterval(pollTimer);
      if (closeTimer !== undefined) window.clearTimeout(closeTimer);
      window.removeEventListener("message", onMessage);
    }
    window.addEventListener("message", onMessage);
  });
}

export async function signOut(redirectTo = "/"): Promise<void> {
  try {
    await authClient.signOut();
  } finally {
    setBearerToken(null);
  }
  window.location.href = safeAuthCallback(redirectTo, "/");
}
