import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { openAthleteAuth } from "@/lib/auth/client";
import { submitProfileEdit } from "@/lib/athrecs/profile-edit-suggestions-api";

export function SuggestProfileEdit({ slug }: { slug: string }) {
  const { user, isPending } = useCurrentUserState();
  const [suggestion, setSuggestion] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const save = useMutation({
    mutationFn: () => submitProfileEdit({ data: { slug, suggestion, evidenceUrl } }),
    onSuccess: () => {
      setSuggestion("");
      setEvidenceUrl("");
    },
  });
  return (
    <details id="suggest-edit" className="rounded-lg border border-border bg-surface p-3">
      <summary className="cursor-pointer text-sm font-semibold text-accent">
        Suggest an edit
      </summary>
      <p className="mt-2 text-sm text-muted">
        Suggest a factual correction or an addition to this profile. Our team reviews edits before
        publication.
      </p>
      {!user ? (
        <Button
          className="mt-3"
          size="sm"
          disabled={isPending}
          onClick={() =>
            openAthleteAuth({
              mode: "signin",
              callbackURL: `/athletes/${slug}#suggest-edit`,
              errorCallbackURL: `/athletes/${slug}`,
            })
          }
        >
          Sign in to submit an edit
        </Button>
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <label className="block text-sm font-medium">
            Your suggested edit
            <textarea
              className="mt-1 block min-h-24 w-full rounded border border-border bg-surface p-2"
              required
              minLength={10}
              maxLength={2000}
              value={suggestion}
              onChange={(event) => setSuggestion(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Supporting link (optional)
            <input
              type="url"
              className="mt-1 block w-full rounded border border-border bg-surface p-2"
              maxLength={2000}
              value={evidenceUrl}
              onChange={(event) => setEvidenceUrl(event.target.value)}
            />
          </label>
          <Button type="submit" size="sm" disabled={save.isPending}>
            {save.isPending ? "Submitting…" : "Submit edit for review"}
          </Button>
          {save.isSuccess ? (
            <p role="status" className="text-sm">
              Thank you. Your edit has been submitted for review.
            </p>
          ) : null}
          {save.isError ? (
            <p role="alert" className="text-sm">
              {save.error.message}
            </p>
          ) : null}
        </form>
      )}
    </details>
  );
}
