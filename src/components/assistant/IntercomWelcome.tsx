import { useEffect, useState, useSyncExternalStore, type MouseEvent } from "react";
import { ArrowUpRight, Flag, MessageCircle, Search, Trophy, UserRound, X } from "lucide-react";
import {
  getIntercomDisplayState,
  getIntercomServerDisplayState,
  INTERCOM_ENABLED,
  openIntercom,
  openIntercomMessage,
  subscribeIntercomDisplay,
} from "@/lib/athrecs/intercom";
import {
  canPresentIntercomWelcome,
  dismissIntercomWelcomeBanner,
  getIntercomServerWelcomePreferences,
  getIntercomWelcomePreferences,
  INTERCOM_BANNER_DISMISSED_KEY,
  INTERCOM_WELCOME_DELAY,
  INTERCOM_WELCOME_SEEN_KEY,
  isIntercomWelcomePage,
  markIntercomWelcomeSeen,
  subscribeIntercomWelcome,
} from "@/lib/athrecs/intercom-welcome";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const choices = [
  {
    key: "profile",
    label: "Find my athlete profile",
    prefill: "Can you help me find my athlete profile on AthRecs?",
    href: "/athletes",
    icon: UserRound,
  },
  {
    key: "results",
    label: "Report missing results",
    prefill:
      "Some of my results are missing from AthRecs. Can you help me report them for research?",
    href: "mailto:support@athrecs.com?subject=Missing%20AthRecs%20results",
    icon: Trophy,
  },
  {
    key: "race",
    label: "Find a race",
    prefill: "Can you help me find a race on AthRecs?",
    href: "/races",
    icon: Search,
  },
  {
    key: "correction",
    label: "Suggest a correction",
    prefill:
      "I would like to suggest a correction to an athlete profile, race or result on AthRecs.",
    href: "mailto:support@athrecs.com?subject=AthRecs%20correction",
    icon: Flag,
  },
] as const;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** A real email fallback remains usable when the Messenger is blocked or unavailable. */
export function IntercomAskButton({ className = "" }: { className?: string }) {
  const display = useSyncExternalStore(
    subscribeIntercomDisplay,
    getIntercomDisplayState,
    getIntercomServerDisplayState,
  );
  if (!INTERCOM_ENABLED) return null;
  return (
    <a
      href="mailto:support@athrecs.com"
      aria-label={display.ready ? "Ask AthRecs in chat" : "Ask AthRecs by email"}
      title={display.ready ? "Open AthRecs chat" : "Chat is unavailable. Email AthRecs support."}
      onClick={(event) => {
        if (!isPlainClick(event)) return;
        markIntercomWelcomeSeen();
        if (openIntercom()) event.preventDefault();
      }}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white no-underline shadow-sm hover:opacity-90",
        focusRing,
        className,
      )}
      data-intercom-ask=""
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      Ask AthRecs
    </a>
  );
}

function WelcomeChoices({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-4")}>
      {choices.map(({ key, label, prefill, href, icon: Icon }) => (
        <a
          key={key}
          href={href}
          data-intercom-choice={key}
          onClick={(event) => {
            if (!isPlainClick(event)) return;
            markIntercomWelcomeSeen();
            if (openIntercomMessage(prefill)) event.preventDefault();
          }}
          className={cn(
            "inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-accent/15 bg-surface px-3 py-2 text-sm font-semibold text-fg no-underline hover:border-accent/50 hover:bg-primary/20",
            focusRing,
          )}
        >
          <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="min-w-0 flex-1">{label}</span>
          <ArrowUpRight className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

/** Site-owned welcome displays reuse the existing, authenticated Messenger session. */
export function IntercomWelcome({ pathname }: { pathname: string }) {
  const { user, isPending, hasSessionError } = useCurrentUserState();
  const display = useSyncExternalStore(
    subscribeIntercomDisplay,
    getIntercomDisplayState,
    getIntercomServerDisplayState,
  );
  const preferences = useSyncExternalStore(
    subscribeIntercomWelcome,
    getIntercomWelcomePreferences,
    getIntercomServerWelcomePreferences,
  );
  const [mobilePrompt, setMobilePrompt] = useState(false);
  const allowedPage = isIntercomWelcomePage(pathname);
  const authReady = !isPending && !hasSessionError;
  const signedIn = Boolean(user && !user.isDevFallback);
  const canIntroduce =
    INTERCOM_ENABLED &&
    allowedPage &&
    authReady &&
    !user &&
    preferences.hydrated &&
    !preferences.seen &&
    !preferences.bannerDismissed &&
    display.ready &&
    !display.isOpen;

  // Subscribe directly as well as rendering the snapshot: even an open/close
  // between React renders counts as engagement and cancels a pending welcome.
  useEffect(() => {
    if (!INTERCOM_ENABLED) return;
    const onDisplay = () => {
      if (!getIntercomDisplayState().isOpen) return;
      markIntercomWelcomeSeen();
      setMobilePrompt(false);
    };
    onDisplay();
    return subscribeIntercomDisplay(onDisplay);
  }, []);

  useEffect(() => {
    if (!canIntroduce) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const cancel = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    const eligible = () => {
      const latest = getIntercomWelcomePreferences();
      const messenger = getIntercomDisplayState();
      return (
        !cancelled &&
        !latest.seen &&
        !latest.bannerDismissed &&
        messenger.ready &&
        !messenger.isOpen &&
        canPresentIntercomWelcome(document)
      );
    };
    const check = () => {
      if (cancelled) return;
      if (!eligible()) {
        cancel();
        return;
      }
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        if (!eligible()) return;
        if (window.matchMedia("(max-width: 1023px)").matches) {
          setMobilePrompt(true);
          markIntercomWelcomeSeen();
        } else if (openIntercom()) {
          markIntercomWelcomeSeen();
        }
      }, INTERCOM_WELCOME_DELAY);
    };
    const afterInteraction = () => queueMicrotask(check);
    document.addEventListener("visibilitychange", check);
    document.addEventListener("focusin", check);
    document.addEventListener("focusout", afterInteraction);
    window.addEventListener("focus", check);
    window.addEventListener("blur", check);
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "open",
        "aria-modal",
        "aria-hidden",
        "hidden",
        "data-state",
        "class",
        "style",
      ],
    });
    check();
    return () => {
      cancelled = true;
      cancel();
      observer.disconnect();
      document.removeEventListener("visibilitychange", check);
      document.removeEventListener("focusin", check);
      document.removeEventListener("focusout", afterInteraction);
      window.removeEventListener("focus", check);
      window.removeEventListener("blur", check);
    };
  }, [canIntroduce, pathname]);

  useEffect(() => {
    const dismissFromAnotherTab = (event: StorageEvent) => {
      if (
        event.newValue === "true" &&
        (event.key === INTERCOM_WELCOME_SEEN_KEY || event.key === INTERCOM_BANNER_DISMISSED_KEY)
      )
        setMobilePrompt(false);
    };
    window.addEventListener("storage", dismissFromAnotherTab);
    return () => window.removeEventListener("storage", dismissFromAnotherTab);
  }, []);

  useEffect(() => {
    if (!allowedPage || !authReady || user || !display.ready || display.isOpen)
      setMobilePrompt(false);
  }, [allowedPage, authReady, user, display.ready, display.isOpen]);

  if (!INTERCOM_ENABLED || !allowedPage || !authReady || !preferences.hydrated) return null;

  const dismissPrompt = () => {
    markIntercomWelcomeSeen();
    setMobilePrompt(false);
  };

  return (
    <>
      {preferences.bannerDismissed ? (
        <div
          className="mx-4 mt-3 flex items-center justify-end gap-3 sm:mx-6 lg:mx-8"
          data-intercom-welcome="compact"
        >
          <span className="text-xs text-muted sm:text-sm">Need a hand?</span>
          <IntercomAskButton />
        </div>
      ) : (
        <section
          aria-label="Help with AthRecs profiles, results and races"
          className="relative mx-4 mt-4 rounded-2xl border border-accent/20 bg-primary/15 p-4 pr-14 shadow-card sm:mx-6 sm:p-5 sm:pr-16 lg:mx-8"
          data-intercom-welcome="banner"
        >
          <button
            type="button"
            aria-label="Dismiss the AthRecs welcome banner"
            onClick={() => {
              dismissIntercomWelcomeBanner();
              setMobilePrompt(false);
            }}
            className={cn(
              "absolute right-1.5 top-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-fg",
              focusRing,
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1 basis-52">
              <p className="text-sm font-bold leading-snug text-fg sm:text-base">
                {signedIn
                  ? "Need help with your profile or results?"
                  : "Find your athlete profile. Bring your results together."}
              </p>
              <p className="mt-1 hidden text-sm leading-relaxed text-muted sm:block">
                Get help finding a profile, reporting missing results or choosing your next race.
              </p>
            </div>
            <IntercomAskButton />
          </div>
          <div className="mt-4 hidden lg:block">
            <WelcomeChoices />
          </div>
        </section>
      )}
      {mobilePrompt && !display.isOpen && !preferences.bannerDismissed ? (
        <aside
          aria-label="AthRecs welcome"
          className="fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] right-3 z-40 flex max-h-[calc(100dvh-12rem)] w-[min(21rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-accent/25 bg-surface p-4 shadow-xl lg:hidden"
          data-intercom-welcome="mobile"
          onKeyDown={(event) => {
            if (event.key === "Escape") dismissPrompt();
          }}
        >
          <button
            type="button"
            aria-label="Dismiss the AthRecs welcome message"
            onClick={dismissPrompt}
            className={cn(
              "absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg",
              focusRing,
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <p className="shrink-0 pr-9 text-sm font-bold leading-snug text-fg">
            Looking for your athlete profile or missing a result?
          </p>
          <p className="mb-3 mt-2 shrink-0 pr-2 text-xs leading-relaxed text-muted">
            Ask AthRecs for a hand.
          </p>
          <div className="min-h-0 overflow-y-auto">
            <WelcomeChoices compact />
          </div>
        </aside>
      ) : null}
    </>
  );
}
