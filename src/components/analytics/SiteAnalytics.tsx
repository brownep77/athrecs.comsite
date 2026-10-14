import { useEffect, useRef, useState } from "react";
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
  const preferencesButton = useRef<HTMLButtonElement>(null);
  const preferencesPanel = useRef<HTMLElement>(null);
  const moveFocus = useRef(false);
  const analyticsDisabled =
    pathname.startsWith("/admin") ||
    pathname === "/claim-results" ||
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

  useEffect(() => {
    if (!moveFocus.current) return;
    (preferencesOpen ? preferencesPanel.current : preferencesButton.current)?.focus();
    moveFocus.current = false;
  }, [choice, preferencesOpen]);

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
    moveFocus.current = true;
    setChoice(next);
    setPreferencesOpen(false);
  }

  if (choice !== "undecided" && !preferencesOpen) {
    return (
      <button
        ref={preferencesButton}
        type="button"
        onClick={() => {
          moveFocus.current = true;
          setPreferencesOpen(true);
        }}
        className="mx-4 mt-3 inline-flex min-h-11 items-center gap-1.5 self-end rounded-full border border-border bg-surface px-3 text-xs font-medium text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:mx-6"
        aria-label="Review analytics privacy choices"
      >
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Privacy choices
      </button>
    );
  }

  return (
    <section
      ref={preferencesPanel}
      tabIndex={-1}
      aria-labelledby="analytics-choices-title"
      className="mx-4 mt-4 max-w-2xl self-center rounded-2xl border border-border bg-surface p-4 shadow-card md:mx-6 md:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-accent-soft p-2.5 text-accent">
          <BarChart3 className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id="analytics-choices-title" className="font-display text-base font-semibold text-fg">
            Help improve ATHRECS
          </h2>
          <p className="text-sm leading-5 text-muted">
            Allow anonymous, first-party analytics so we can see which races and features are
            useful. We do not store your IP address, full referrer, search query or raw browser
            identifier.
          </p>
        </div>
        {choice !== "undecided" ? (
          <button
            type="button"
            onClick={() => {
              moveFocus.current = true;
              setPreferencesOpen(false);
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-subtle hover:bg-elevated hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
    </section>
  );
}
