import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  continueMyFinProfile,
  getMyFinResearch,
  reviewMyFinResearch,
  saveMyFinResearchDraft,
  startMyFinResearch,
  supplyMyFinResultLink,
} from "@/lib/athrecs/fin-research-api";

type Candidate = {
  id: string;
  athleteName: string;
  eventName: string;
  eventDate: string;
  distance: string;
  chipTime: string;
  gunTime: string;
  publishedFinishTime: string;
  timingLabel: string;
  finishStatus: string;
  sourceUrl: string;
  evidenceLevel: string;
  review: string;
  note: string;
  supportingClues: string[];
  conflictingEvidence: string[];
  ownership: string;
};

type ResearchView = {
  status?: string;
  jobId?: string;
  message?: string;
  state?: string;
  candidates?: Candidate[];
  researchCode?: string;
  outcomes?: { draftSaved?: boolean; claimSubmitted?: boolean; profilePublished?: boolean };
};

const actionClass = "h-auto w-full min-w-0 whitespace-normal py-3 sm:w-auto";

function performance(candidate: Candidate): string {
  const parts = [
    candidate.chipTime ? `Chip ${candidate.chipTime}` : "",
    candidate.gunTime ? `Gun ${candidate.gunTime}` : "",
    candidate.publishedFinishTime ? `Finish ${candidate.publishedFinishTime}` : "",
    candidate.finishStatus,
  ].filter(Boolean);
  return parts.join(" · ") || "Performance not published";
}

/** Explicit athlete actions only. Nothing here runs a search on mount. */
export function FinResultResearchPanel({
  continuation,
  eventName,
  year,
  accountExists,
}: {
  continuation: string;
  eventName: string | null;
  year: number | null;
  accountExists: boolean;
}) {
  const [event, setEvent] = useState(eventName ?? "");
  const [eventYear, setEventYear] = useState(year ? String(year) : "");
  const [view, setView] = useState<ResearchView | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [link, setLink] = useState("");
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    if (!view?.jobId || (view.state !== "queued" && view.state !== "running")) return;
    const timer = window.setInterval(() => {
      void getMyFinResearch({ data: { jobId: view.jobId! } })
        .then((next) => setView((current) => ({ ...current, ...next })))
        .catch(() => setError("The search update could not be loaded. Your account is unchanged."));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [view?.jobId, view?.state]);

  async function start(refine = false) {
    setPending(true);
    setError("");
    try {
      const yearNumber = eventYear.trim() ? Number(eventYear) : undefined;
      const next = await startMyFinResearch({
        data: {
          continuation,
          eventName: event.trim() || undefined,
          year: Number.isInteger(yearNumber) ? yearNumber : undefined,
          refine: refine ? crypto.randomUUID().replace(/-/g, "").slice(0, 12) : undefined,
        },
      });
      setView(next as ResearchView);
    } catch {
      setError("The search could not be started. You can still set up your profile.");
    } finally {
      setPending(false);
    }
  }

  async function review(candidateId: string, decision: "selected" | "rejected" | "uncertain") {
    if (!view?.jobId) return;
    setPending(true);
    setError("");
    try {
      const next = await reviewMyFinResearch({ data: { jobId: view.jobId, decisions: [{ candidateId, decision }] } });
      setView((current) => ({ ...current, ...next }));
    } catch {
      setError("That choice was not saved. Nothing was published.");
    } finally {
      setPending(false);
    }
  }

  async function saveDraft() {
    if (!view?.jobId || !privacy) return;
    const candidateIds = (view.candidates ?? []).filter((item) => item.review === "selected").map((item) => item.id);
    setPending(true);
    setError("");
    try {
      const next = await saveMyFinResearchDraft({
        data: { jobId: view.jobId, fullName, candidateIds, privacyAcknowledged: true },
      });
      setView((current) => ({ ...current, ...next }));
    } catch {
      setError("The private draft was not saved. Nothing was published.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold">Look for public results</h3>
        <p className="text-sm leading-6 text-muted">
          {accountExists
            ? "You already have an AthRecs account. A deeper search can use the racing names, public links, club and general location saved on it."
            : "An account lets AthRecs look for public organiser and timing records after you allow that search. It will not find every result."}{" "}
          A matching name is not ownership, and a suggestion is not a published profile.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Event to look for
          <input
            value={event}
            onChange={(input) => setEvent(input.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold">
          Year
          <input
            inputMode="numeric"
            value={eventYear}
            onChange={(input) => setEventYear(input.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 font-normal"
          />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button type="button" className={actionClass} disabled={pending} onClick={() => void start(false)}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Search public results with my saved details
        </Button>
        <Button type="button" variant="secondary" className={actionClass} disabled={pending} onClick={() => void start(true)}>
          Update this search
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={actionClass}
          onClick={() => {
            void continueMyFinProfile({ data: { continuation } }).catch(() => undefined);
            window.location.hash = "private-profile-setup";
          }}
        >
          Continue profile setup without results
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm leading-6 text-red-700">
          {error}
        </p>
      ) : null}
      {view?.message ? <p className="text-sm leading-6 text-muted">{view.message}</p> : null}
      {view?.researchCode ? (
        <p className="break-all text-sm leading-6 text-muted">
          If you go back to the chat, you can give it this research code:{" "}
          <span className="font-semibold text-fg">{view.researchCode}</span>. It expires in two hours and only works
          for this account.
        </p>
      ) : null}
      {view?.candidates?.length ? (
        <ul className="space-y-3">
          {view.candidates.map((candidate) => (
            <li key={candidate.id} className="space-y-2 rounded-lg border border-border p-3 text-sm">
              <p className="font-semibold">
                {candidate.eventName}
                {candidate.eventDate ? ` · ${candidate.eventDate}` : ""}
              </p>
              <p className="text-muted">
                {candidate.athleteName}
                {candidate.distance ? ` · ${candidate.distance}` : ""} · {performance(candidate)}
              </p>
              <p className="text-muted">{candidate.note}</p>
              {candidate.conflictingEvidence.length ? (
                <p className="text-muted">Check this match: {candidate.conflictingEvidence.join(" ")}</p>
              ) : null}
              <p className="text-muted">Status: {candidate.review}. Ownership is not confirmed.</p>
              <a className="break-all underline" href={candidate.sourceUrl} rel="noreferrer noopener" target="_blank">
                Open the source
              </a>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" className={actionClass} disabled={pending} onClick={() => void review(candidate.id, "selected")}>
                  This may be mine
                </Button>
                <Button type="button" variant="secondary" className={actionClass} disabled={pending} onClick={() => void review(candidate.id, "rejected")}>
                  Not my result
                </Button>
                <Button type="button" variant="secondary" className={actionClass} disabled={pending} onClick={() => void review(candidate.id, "uncertain")}>
                  I am not sure
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {view?.jobId && view.state === "completed" ? (
        <form
          className="space-y-3"
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            void saveDraft();
          }}
        >
          <label className="block text-sm font-semibold">
            Name for the private draft
            <input
              value={fullName}
              onChange={(input) => setFullName(input.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold">
            Your own results link
            <input
              value={link}
              onChange={(input) => setLink(input.target.value)}
              placeholder="https://"
              className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 font-normal"
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            className={actionClass}
            disabled={pending || !link.trim()}
            onClick={() => {
              void supplyMyFinResultLink({ data: { jobId: view.jobId!, sourceUrl: link.trim() } })
                .then((next) => setView((current) => ({ ...current, ...next })))
                .catch(() => setError("That link was not saved. No result was created."));
            }}
          >
            Save my results link
          </Button>
          <label className="flex items-start gap-2 text-sm leading-6">
            <input type="checkbox" checked={privacy} onChange={(input) => setPrivacy(input.checked)} />
            I have read the privacy notice. Save a private draft only. Do not submit a claim or publish a profile.
          </label>
          <Button type="submit" className={actionClass} disabled={pending || !privacy || fullName.trim().length < 2}>
            Save private draft
          </Button>
          {view.outcomes?.draftSaved ? (
            <p className="text-sm text-muted">Draft saved. No claim was submitted and the profile was not published.</p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
