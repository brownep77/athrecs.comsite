import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BarChart3, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ANALYTICS_CONSENT_VERSION,
  recordSiteAnalyticsEvent,
  withdrawSiteAnalyticsConsent,
} from "@/lib/athrecs/data-intelligence-api";

const CONSENT_KEY = "athrecs:analytics-consent";
const SESSION_KEY = "athrecs:analytics-session";

type ConsentChoice = "unknown" | "undecided" | "granted" | "denied";

function getOrCreateSessionId(): string {
  const current = sessionStorage.getItem(SESSION_KEY);
  if (current) return current;
  const next = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

function deviceClass(): "desktop" | "mobile" | "tablet" | "other" {
  const width = window.innerWidth;
  if (width <= 767) return "mobile";
  if (width <= 1100) return "tablet";
  return "desktop";
}

function isSportsRecsHostname(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === "sportsrecs.org" || hostname === "www.sportsrecs.org";
}

export function SiteAnalytics() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [choice, setChoice] = useState<ConsentChoice>("unknown");
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const analyticsDisabled =
    pathname.startsWith("/admin") ||
    pathname === "/sportsrecs" ||
    pathname.startsWith("/sportsrecs/") ||
    isSportsRecsHostname();

  useEffect(() => {
    if (analyticsDisabled) return;
    const stored = localStorage.getItem(CONSENT_KEY);
    setChoice(stored === "granted" || stored === "denied" ? stored : "undecided");
  }, [analyticsDisabled]);

  useEffect(() => {
    if (analyticsDisabled || choice !== "granted") return;
    void recordSiteAnalyticsEvent({
      data: {
        path: pathname,
        sessionId: getOrCreateSessionId(),
        consentVersion: ANALYTICS_CONSENT_VERSION,
        deviceClass: deviceClass(),
        referrerDomain: document.referrer,
      },
    }).catch(() => undefined);
  }, [analyticsDisabled, choice, pathname]);

  if (analyticsDisabled || choice === "unknown") return null;

  async function saveChoice(next: "granted" | "denied") {
    localStorage.setItem(CONSENT_KEY, next);
    if (next === "denied") {
      const sessionId = sessionStorage.getItem(SESSION_KEY);
      if (sessionId) {
        await withdrawSiteAnalyticsConsent({ data: { sessionId } }).catch(() => undefined);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setChoice(next);
    setPreferencesOpen(false);
  }

  if (choice !== "undecided" && !preferencesOpen) {
    return (
      <button
        type="button"
        onClick={() => setPreferencesOpen(true)}
        className="fixed bottom-20 right-3 z-[60] inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 text-xs font-medium text-muted shadow-card backdrop-blur hover:text-fg md:bottom-4 md:right-4"
        aria-label="Review analytics privacy choices"
      >
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Privacy choices
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-4 shadow-xl md:bottom-5 md:p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-accent-soft p-2.5 text-accent">
          <BarChart3 className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="font-display text-base font-semibold text-fg">Help improve ATHRECS</h2>
          <p className="text-sm leading-5 text-muted">
            Allow anonymous, first-party analytics so we can see which races and features are
            useful. We do not store your IP address, full referrer, search query or raw browser
            identifier.
          </p>
        </div>
        {choice !== "undecided" ? (
          <button
            type="button"
            onClick={() => setPreferencesOpen(false)}
            className="rounded-md p-1.5 text-subtle hover:bg-elevated hover:text-fg"
            aria-label="Close privacy choices"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => void saveChoice("denied")}>
          {choice === "denied" ? "Keep analytics off" : "No thanks"}
        </Button>
        <Button type="button" onClick={() => void saveChoice("granted")}>
          {choice === "granted" ? "Keep analytics on" : "Allow anonymous analytics"}
        </Button>
      </div>
    </div>
  );
}
