import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarRace } from "@/lib/athrecs/event-calendar";
import { buildRaceShareData, buildRaceShareLinks } from "@/lib/athrecs/race-sharing";

export function ShareRaceButton({ race }: { race: CalendarRace }) {
  const data = buildRaceShareData(race);
  const [feedback, setFeedback] = useState<"idle" | "copied" | "manual">("idle");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [deviceSharing, setDeviceSharing] = useState(false);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const inProgress = useRef(false);
  const id = useId();

  useEffect(() => {
    setReady(true);
    setDeviceSharing(typeof navigator.share === "function");
    setOpen(disclosure.current?.open ?? false);
  }, []);

  useEffect(() => {
    if (feedback !== "copied") return;
    const timer = window.setTimeout(() => setFeedback("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (
        disclosure.current &&
        event.target instanceof Node &&
        !disclosure.current.contains(event.target)
      ) {
        disclosure.current.open = false;
      }
    };
    // Close after the outside control receives its click; collapsing this in-flow
    // panel on pointerdown would move that control before pointerup and lose the click.
    document.addEventListener("click", closeOutside);
    return () => document.removeEventListener("click", closeOutside);
  }, [open]);

  async function shareRace(useDevice: boolean) {
    if (!data || inProgress.current) return;
    inProgress.current = true;
    setBusy(true);
    setFeedback("idle");
    try {
      if (useDevice && typeof navigator.share === "function") {
        try {
          // Call directly in the click handler to retain the device's user activation.
          await navigator.share(data);
          return;
        } catch (error) {
          if (error && typeof error === "object" && "name" in error && error.name === "AbortError")
            return;
        }
      }
      try {
        await navigator.clipboard.writeText(data.url);
        setFeedback("copied");
      } catch {
        setFeedback("manual");
      }
    } finally {
      inProgress.current = false;
      setBusy(false);
    }
  }

  if (!data) return null;
  const copied = feedback === "copied";
  return (
    <details
      ref={disclosure}
      className="group/share min-w-0 max-w-full"
      suppressHydrationWarning
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
        if (event.currentTarget.open) setDeviceSharing(typeof navigator.share === "function");
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && disclosure.current?.open) {
          event.preventDefault();
          event.stopPropagation();
          disclosure.current.open = false;
          disclosure.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        aria-label={`Share ${data.title}`}
        className="inline-flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-sky-700 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 transition-colors hover:border-sky-800 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 focus-visible:ring-offset-surface [&::-webkit-details-marker]:hidden"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" /> Share
        <ChevronDown
          className="h-4 w-4 transition-transform group-open/share:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div
        role="group"
        aria-label="Sharing options"
        className="mt-3 w-80 max-w-full space-y-3 rounded-xl border border-border bg-surface p-3"
      >
        <p className="font-semibold">Share this race</p>
        <p className="break-words text-sm text-muted">{data.title}</p>
        <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
          {buildRaceShareLinks(data).map(({ id: provider, label, href }) => (
            <Button key={provider} asChild variant="secondary" className="min-w-0 px-2">
              <a
                href={href}
                target={provider === "email" ? undefined : "_blank"}
                rel={provider === "email" ? undefined : "noopener noreferrer"}
                referrerPolicy="no-referrer"
              >
                {label}
                {provider === "email" ? (
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
              </a>
            </Button>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="min-w-0 px-2"
            disabled={!ready || busy}
            aria-busy={busy}
            onClick={() => void shareRace(false)}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </Button>
        </div>
        {deviceSharing ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void shareRace(true)}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" /> More sharing options
          </Button>
        ) : null}
        <p className="text-xs text-muted">Choose where to share, then select who to send it to.</p>
        <p
          id={`${id}-status`}
          role="status"
          className={feedback === "manual" ? "text-sm text-muted" : "sr-only"}
        >
          {copied
            ? "Race link copied."
            : feedback === "manual"
              ? "Select and copy the race link below."
              : ""}
        </p>
        {feedback === "manual" ? (
          <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium">
              Race link
            </label>
            <input
              id={id}
              type="url"
              readOnly
              value={data.url}
              aria-describedby={`${id}-status`}
              onFocus={(event) => event.currentTarget.select()}
              className="block min-h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
            />
          </div>
        ) : null}
        <noscript>
          <p className="break-all text-sm text-muted">
            Copy this race link to share: <a href={data.url}>{data.url}</a>
          </p>
        </noscript>
      </div>
    </details>
  );
}
