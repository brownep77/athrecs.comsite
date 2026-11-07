import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PencilLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { openAthleteAuth } from "@/lib/auth/client";
import { submitRaceEdit } from "@/lib/athrecs/race-edit-suggestions-api";
import { raceEditPath, type RaceEditPageType } from "@/lib/athrecs/race-edit-target";

/** The header link uses the same on-page form on every race-page family. */
export function RaceEditJumpLink({ className = "" }: { className?: string }) {
  return (
    <a
      href="#suggest-edit"
      onClick={() => window.dispatchEvent(new Event("athrecs:open-race-edit"))}
      className={className || "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-accent hover:bg-elevated"}
    >
      <PencilLine className="h-4 w-4" aria-hidden="true" />
      Suggest an edit
    </a>
  );
}

const EDIT_TYPES = [
  { value: "Date or start time", label: "Date or start time" },
  { value: "Distance or course", label: "Distance or course" },
  { value: "Location or race-day arrangements", label: "Location, parking or facilities" },
  { value: "Entry fees or eligibility", label: "Entry fees, entries or eligibility" },
  { value: "Results or records", label: "Results, records or athlete information" },
  { value: "Photo, credit or image rights", label: "Photo, credit or image rights" },
  { value: "Other race information", label: "Other race information" },
] as const;

const MAX_DETAILS = 1500;
function formatEditSuggestion(input: {
  name: string;
  edition: string;
  category: string;
  details: string;
}) {
  return [
    `Area: ${input.category}`,
    `Race: ${input.name}`,
    input.edition.trim() ? `Edition/date: ${input.edition.trim()}` : "Edition/date: General race information",
    "",
    input.details.trim(),
  ].join("\n");
}

export function SuggestRaceEdit({
  slug,
  name,
  pageType = "catalogue",
  editionDate,
}: {
  slug: string;
  name: string;
  pageType?: RaceEditPageType;
  /** Set to the next confirmed edition where available; users can change it for past editions. */
  editionDate?: string | null;
}) {
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [edition, setEdition] = useState(editionDate ?? "");
  const [category, setCategory] = useState<string>(EDIT_TYPES[0].value);
  const [details, setDetails] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  useEffect(() => {
    const openIfLinked = () => {
      if (window.location.hash === "#suggest-edit") setOpen(true);
    };
    const openFromHeader = () => setOpen(true);
    openIfLinked();
    window.addEventListener("hashchange", openIfLinked);
    window.addEventListener("athrecs:open-race-edit", openFromHeader);
    return () => {
      window.removeEventListener("hashchange", openIfLinked);
      window.removeEventListener("athrecs:open-race-edit", openFromHeader);
    };
  }, []);

  const save = useMutation({
    mutationFn: () =>
      submitRaceEdit({
        data: {
          slug,
          pageType,
          suggestion: formatEditSuggestion({ name, edition, category, details }),
          evidenceUrl,
        },
      }),
    onSuccess: () => {
      setDetails("");
      setEvidenceUrl("");
    },
  });

  return (
    <section
      id="suggest-edit"
      aria-labelledby="suggest-edit-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="suggest-edit-heading" className="font-display text-lg font-semibold">
            Suggest an edit to this race
          </h2>
          <p className="mt-1 text-sm text-muted">
            Know a new start time, a better course detail, a missing result or a correction?
            Help us keep this page accurate.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          aria-expanded={open}
          aria-controls="race-edit-form"
          onClick={() => setOpen((value) => !value)}
        >
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          {open ? "Close form" : "Suggest an edit"}
        </Button>
      </div>

      <div id="race-edit-form" hidden={!open} className="mt-4 space-y-4 border-t border-border pt-4">
        <p className="text-sm text-muted">
          Your suggestion will be attached to this race and reviewed by the AthRecs team
          before anything on the website changes.
        </p>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (user && !save.isPending && details.trim().length >= 10) save.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="block text-sm font-medium">Race</span>
              <p className="mt-1 min-h-11 rounded-lg border border-border bg-elevated p-3 text-sm font-semibold">
                {name}
              </p>
              <p className="mt-1 text-xs text-muted">Automatically linked to this race page.</p>
            </div>
            <label className="block text-sm font-medium">
              Edition or year (optional)
              <input
                type="text"
                maxLength={80}
                disabled={save.isPending || save.isSuccess}
                className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface p-3 font-normal"
                placeholder="e.g. 2027-01-01 or 2024"
                value={edition}
                onChange={(event) => setEdition(event.target.value)}
              />
              <span className="mt-1 block text-xs font-normal text-muted">
                Prefilled where known. Change this if you are correcting an older edition.
              </span>
            </label>
          </div>
          <label className="block text-sm font-medium">
            What would you like to amend?
            <select
              value={category}
              disabled={save.isPending || save.isSuccess}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface p-3 font-normal"
            >
              {EDIT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Your suggested change
            <textarea
              required
              minLength={10}
              maxLength={MAX_DETAILS}
              disabled={save.isPending || save.isSuccess}
              className="mt-1 block min-h-36 w-full rounded-lg border border-border bg-surface p-3 font-normal"
              placeholder="Tell us what is currently incorrect and what the correct details should be. Include dates, distances or names where relevant."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Supporting source or results link (optional)
            <input
              type="url"
              maxLength={2000}
              disabled={save.isPending || save.isSuccess}
              className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface p-3 font-normal"
              placeholder="https://"
              value={evidenceUrl}
              onChange={(event) => setEvidenceUrl(event.target.value)}
            />
            <span className="mt-1 block text-xs font-normal text-muted">
              An organiser's announcement, timing results or other source helps us verify your edit.
            </span>
          </label>

          {!user ? (
            <div className="space-y-2">
              <p className="text-sm text-muted">
                Please sign in to submit. Your draft stays visible while you are here;
                the website will ask you to sign in before sending.
              </p>
              <Button
                type="button"
                disabled={isPending}
                onClick={() =>
                  openAthleteAuth({
                    mode: "signin",
                    callbackURL: `${raceEditPath(slug, pageType)}#suggest-edit`,
                    errorCallbackURL: raceEditPath(slug, pageType),
                  })
                }
              >
                Sign in to submit an edit
              </Button>
            </div>
          ) : save.isSuccess ? (
            <div role="status" className="space-y-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                Thank you — your race edit has been sent for review.
              </p>
              <p className="text-muted">Changes are not published automatically.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  save.reset();
                  setDetails("");
                  setEvidenceUrl("");
                }}
              >
                Suggest another edit
              </Button>
            </div>
          ) : (
            <>
              <Button type="submit" disabled={save.isPending || details.trim().length < 10}>
                {save.isPending ? "Sending suggestion…" : "Send suggestion for review"}
              </Button>
              {save.isError ? (
                <p role="alert" className="text-sm">
                  {save.error.message || "Your suggestion could not be sent. Please try again."}
                </p>
              ) : null}
            </>
          )}
        </form>
        <noscript>
          <p className="text-sm text-muted">Enable JavaScript to sign in and send a suggestion.</p>
        </noscript>
      </div>
    </section>
  );
}
