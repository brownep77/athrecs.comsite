import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PencilLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { openAthleteAuth } from "@/lib/auth/client";
import { submitRaceEdit } from "@/lib/athrecs/race-edit-suggestions-api";
import { raceEditPath, type RaceEditPageType } from "@/lib/athrecs/race-edit-target";

export function SuggestRaceEdit({
  slug,
  name,
  pageType = "catalogue",
}: {
  slug: string;
  name: string;
  pageType?: RaceEditPageType;
}) {
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (window.location.hash === "#suggest-edit") setOpen(true);
  }, []);
  const [suggestion, setSuggestion] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const save = useMutation({
    mutationFn: () => submitRaceEdit({ data: { slug, pageType, suggestion, evidenceUrl } }),
    onSuccess: () => {
      setSuggestion("");
      setEvidenceUrl("");
    },
  });
  return (
    <section
      id="suggest-edit"
      aria-labelledby="suggest-edit-heading"
      className="rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="suggest-edit-heading" className="font-display text-base font-semibold">
            Help keep this race up to date
          </h2>
          <p className="mt-1 text-sm text-muted">
            Spotted a change to the date, start, location or race details?
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
          {open ? "Close suggestion" : "Suggest an edit"}
        </Button>
      </div>
      <div id="race-edit-form" hidden={!open} className="mt-4 border-t border-border pt-4">
        <p className="mb-3 text-sm text-muted">
          Suggest a correction for {name}. Our team checks suggestions before updating the page.
        </p>
        {!user ? (
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
            Sign in to suggest an edit
          </Button>
        ) : save.isSuccess ? (
          <div role="status" className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              Thank you. Your suggestion has been sent to our team for review.
            </p>
            <Button type="button" variant="secondary" onClick={() => save.reset()}>
              Suggest another edit
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!save.isPending) save.mutate();
            }}
          >
            <label className="block text-sm font-medium">
              What needs changing?
              <textarea
                required
                minLength={10}
                maxLength={2000}
                disabled={save.isPending}
                className="mt-1 block min-h-28 w-full rounded-lg border border-border bg-surface p-3"
                placeholder="Tell us the correct information, including the race date and distance if relevant."
                value={suggestion}
                onChange={(event) => setSuggestion(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Supporting link (optional)
              <input
                type="url"
                maxLength={2000}
                disabled={save.isPending}
                className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface p-3"
                placeholder="https://…"
                value={evidenceUrl}
                onChange={(event) => setEvidenceUrl(event.target.value)}
              />
              <span className="mt-1 block text-xs font-normal text-muted">
                An organiser’s page or race instructions help us check the change.
              </span>
            </label>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Sending suggestion…" : "Send suggestion for review"}
            </Button>
            {save.isError ? (
              <p role="alert" className="text-sm">
                {save.error.message || "Your suggestion could not be sent. Please try again."}
              </p>
            ) : null}
          </form>
        )}
        <noscript>
          <p className="text-sm text-muted">Enable JavaScript to sign in and send a suggestion.</p>
        </noscript>
      </div>
    </section>
  );
}
