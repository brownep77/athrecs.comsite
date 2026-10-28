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

function settings(): Record<string, unknown> {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  return {
    api_base: API_BASE,
    app_id: INTERCOM_APP_ID,
    vertical_padding: mobile ? MOBILE_NAV_CLEARANCE : 20,
  };
}

/** Loads Intercom's official widget script once (anonymous visitor install). */
export function bootIntercom(): void {
  if (!INTERCOM_ENABLED || typeof window === "undefined") return;
  if (window.Intercom && document.getElementById("intercom-widget-script")) {
    window.Intercom("update", settings());
    return;
  }
  window.intercomSettings = settings();
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
  window.Intercom("boot", settings());
}

export function updateIntercomPage(): void {
  if (INTERCOM_ENABLED && window.Intercom)
    window.Intercom("update", { last_request_at: Math.floor(Date.now() / 1000) });
}

/** Opens a new Messenger conversation with the visitor's first message pre-filled (not sent). */
export function openIntercomMessage(prefill: string): boolean {
  if (!INTERCOM_ENABLED || typeof window === "undefined" || !window.Intercom) return false;
  window.Intercom("showNewMessage", prefill);
  return true;
}
