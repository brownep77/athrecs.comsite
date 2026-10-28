import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import {
  bootIntercom,
  INTERCOM_ACCOUNT_KEY,
  INTERCOM_ENABLED,
  INTERCOM_LOGOUT_KEY,
  INTERCOM_RESET_EVENT,
  intercomSessionVersion,
  openIntercomMessage,
  prepareIntercomAccount,
  shutdownIntercom,
  suspendIntercom,
  updateIntercomPage,
} from "@/lib/athrecs/intercom";
import { getIntercomIdentity } from "@/lib/athrecs/intercom-api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const REFRESH_INTERVAL = 5 * 60 * 1000;

/** Identify only the verified signed-in account, after the AthRecs session resolves. */
export function IntercomMessenger({ pathname }: { pathname: string }) {
  const { user, isPending, hasSessionError } = useCurrentUserState();
  const userId = user && !user.isDevFallback ? user.id : null;
  useEffect(() => {
    if (!INTERCOM_ENABLED) return;
    if (isPending) {
      suspendIntercom();
      return;
    }
    if (hasSessionError) {
      shutdownIntercom(false);
      return;
    }

    let cancelled = false;
    let blocked = false;
    let stoppedForLogout = false;
    let loading = false;
    let requestNumber = 0;
    let lastAttemptAt = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const pause = (logout: boolean) => {
      blocked = true;
      stoppedForLogout ||= logout;
      requestNumber += 1;
      loading = false;
      clearTimeout(refreshTimer);
    };
    const reset = () => pause(true);
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === INTERCOM_LOGOUT_KEY ||
        (event.key === INTERCOM_ACCOUNT_KEY && event.newValue !== userId)
      ) {
        pause(event.key === INTERCOM_LOGOUT_KEY);
        // Do not erase the new account marker another tab has just written.
        shutdownIntercom(false);
      }
    };
    const refresh = async () => {
      if (cancelled || blocked || loading || !userId) return;
      clearTimeout(refreshTimer);
      loading = true;
      lastAttemptAt = Date.now();
      const request = ++requestNumber;
      const version = intercomSessionVersion();
      let retryIn = REFRESH_INTERVAL;
      try {
        const identity = await getIntercomIdentity();
        if (
          cancelled ||
          blocked ||
          request !== requestNumber ||
          version !== intercomSessionVersion()
        )
          return;
        if (identity.status === "disabled") bootIntercom();
        else if (identity.userId === userId && identity.expiresAt > Date.now() / 1000 + 30) {
          bootIntercom(identity);
          retryIn = Math.min(
            REFRESH_INTERVAL,
            Math.max(1000, identity.expiresAt * 1000 - Date.now() - 60_000),
          );
        } else {
          // A changed server session must never boot a response for the old account.
          shutdownIntercom(false);
          retryIn = 30_000;
        }
      } catch {
        if (
          cancelled ||
          blocked ||
          request !== requestNumber ||
          version !== intercomSessionVersion()
        )
          return;
        // Never keep an identified Messenger after authentication cannot be checked.
        shutdownIntercom(false);
        retryIn = 30_000;
      } finally {
        if (request === requestNumber) {
          loading = false;
          if (!cancelled && !blocked) refreshTimer = setTimeout(() => void refresh(), retryIn);
        }
      }
    };
    const onFocus = () => {
      if (document.visibilityState === "hidden" || stoppedForLogout) return;
      if (blocked) {
        // A different tab changed context. Resume only after a fresh server check.
        blocked = false;
        void refresh();
        return;
      }
      if (Date.now() - lastAttemptAt >= REFRESH_INTERVAL) void refresh();
    };

    window.addEventListener(INTERCOM_RESET_EVENT, reset);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    prepareIntercomAccount(userId);
    if (userId) void refresh();
    else bootIntercom();
    return () => {
      cancelled = true;
      requestNumber += 1;
      clearTimeout(refreshTimer);
      window.removeEventListener(INTERCOM_RESET_EVENT, reset);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [userId, isPending, hasSessionError]);
  useEffect(() => () => shutdownIntercom(false), []);
  useEffect(() => {
    updateIntercomPage();
  }, [pathname]);
  return null;
}

const PROMPTS = {
  results: {
    label: "Can’t find your results? Ask Paul to research them.",
    prefill: "I can’t find my results. Can you help me find my missing results?",
  },
  race: {
    label: "Know a race we’re missing? Tell us about it.",
    prefill: "I’d like to add a race or race results that are missing from AthRecs.",
  },
} as const;

/** Contextual entry point into the Messenger. Renders nothing unless Intercom is enabled. */
export function ChatPrompt({
  kind,
  className = "",
}: {
  kind: keyof typeof PROMPTS;
  className?: string;
}) {
  if (!INTERCOM_ENABLED) return null;
  const prompt = PROMPTS[kind];
  return (
    <button
      type="button"
      onClick={() => openIntercomMessage(prompt.prefill)}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-left text-sm font-semibold text-accent shadow-card hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
      {prompt.label}
    </button>
  );
}
