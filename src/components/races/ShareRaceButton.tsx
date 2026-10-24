import { useEffect, useId, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarRace } from "@/lib/athrecs/event-calendar";
import { buildRaceShareData } from "@/lib/athrecs/race-sharing";

export function ShareRaceButton({ race }: { race: CalendarRace }) {
  const data = buildRaceShareData(race);
  const [feedback, setFeedback] = useState<"idle" | "copied" | "manual">("idle");
  const [busy, setBusy] = useState(false);
  const inProgress = useRef(false);
  const id = useId();

  useEffect(() => {
    if (feedback !== "copied") return;
    const timer = window.setTimeout(() => setFeedback("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function shareRace() {
    if (!data || inProgress.current) return;
    inProgress.current = true;
    setBusy(true);
    setFeedback("idle");
    try {
      if (typeof navigator.share === "function") {
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
    <div className="min-w-0 max-w-full space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="border-sky-700 bg-sky-50 text-sky-900 hover:border-sky-800 hover:bg-sky-100 focus-visible:ring-sky-700 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        disabled={busy}
        aria-label={`${copied ? "Link copied for" : "Share"} ${data.title}`}
        aria-busy={busy}
        onClick={() => void shareRace()}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? "Link copied" : "Share"}
      </Button>
      <p
        id={`${id}-status`}
        role="status"
        className={feedback === "manual" ? "max-w-sm text-sm text-muted" : "sr-only"}
      >
        {copied
          ? "Race link copied."
          : feedback === "manual"
            ? "Select and copy the race link below."
            : ""}
      </p>
      {feedback === "manual" ? (
        <div className="max-w-sm space-y-1">
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
        <p className="max-w-sm break-all text-sm text-muted">
          Copy this race link to share: <a href={data.url}>{data.url}</a>
        </p>
      </noscript>
    </div>
  );
}
