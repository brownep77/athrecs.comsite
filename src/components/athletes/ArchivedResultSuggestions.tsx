import type { ResultSearchFilters } from "@/lib/athrecs/result-matching-settings";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { getMyArchiveMatches, requestMyArchiveMatches } from "@/lib/results-archive/member-api";

export function ArchivedResultSuggestions({
  userId,
  filters,
}: {
  userId: string;
  filters?: ResultSearchFilters;
}) {
  // Preserve the selected revision across background refreshes; the server rejects stale selections.
  const [selected, setSelected] = useState<Map<number, number>>(() => new Map());
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const matches = useQuery({
    queryKey: ["my-archive-suggestions", userId, filters],
    queryFn: () => getMyArchiveMatches({ data: filters }),
    staleTime: 60000,
    refetchInterval: 60000,
  });
  const request = useMutation({
    mutationFn: () =>
      requestMyArchiveMatches({
        data: {
          entries: [...selected].map(([entryId, revision]) => ({ entryId, revision })),
          note,
        },
      }),
    onSuccess: async (result) => {
      setSelected(new Map());
      setNote("");
      setMessage(
        `${result.requested} selected ${result.requested === 1 ? "result has" : "results have"} been submitted together for review. Our team will check the matches before you can add them to your profile.`,
      );
      await matches.refetch();
    },
  });
  if (matches.isPending)
    return <p className="p-4 text-sm text-muted">Checking other saved race results…</p>;
  if (matches.isError)
    return (
      <p className="p-4 text-sm text-muted">
        Saved race results could not be checked.{" "}
        <button className="underline" onClick={() => void matches.refetch()}>
          Retry
        </button>
      </p>
    );
  if (!matches.data?.length && !message) return null;
  const available = (matches.data ?? []).filter((row) => !row.requested);
  const toggle = (id: number, revision: number) =>
    setSelected((previous) => {
      const next = new Map(previous);
      if (next.has(id)) next.delete(id);
      else if (next.size < 30) next.set(id, revision);
      return next;
    });
  return (
    <div className="space-y-4 border-b border-border p-4">
      <div>
        <h3 className="font-semibold">Other saved race results matching your name</h3>
        <p className="mt-1 text-sm text-muted">
          Select individual results or several together. These results need a match check before
          they join your profile; a matching name alone does not confirm they are yours.
        </p>
      </div>
      {message ? (
        <p role="status" className="rounded-lg bg-accent-soft p-3 text-sm">
          {message}
        </p>
      ) : null}
      <fieldset disabled={request.isPending} className="space-y-3">
        <legend className="sr-only">Select other saved results</legend>
        {available.length ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setSelected(new Map(available.slice(0, 30).map((row) => [row.id, row.revision])))
              }
            >
              {available.length > 30
                ? "Select first 30 results"
                : `Select all ${available.length} results`}
            </Button>
            <Button variant="secondary" onClick={() => setSelected(new Map())}>
              Clear selection
            </Button>
            <p role="status" className="text-sm">
              {selected.size} selected
            </p>
          </div>
        ) : null}
        {(matches.data ?? []).map((row) => (
          <article className="rounded-lg border border-border p-3" key={row.id}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(row.id)}
                disabled={row.requested || (!selected.has(row.id) && selected.size >= 30)}
                onChange={() => toggle(row.id, row.revision)}
                aria-label={`Select saved result ${row.event} ${row.date}`}
                className="mt-1 size-5 shrink-0 accent-primary"
              />
              <span>
                <strong>{row.event}</strong>
                <span className="block text-sm">
                  {row.name} · {formatRaceDateShort(row.date)} · {row.distance}
                </span>
                <span className="block text-sm">
                  {row.seconds == null
                    ? row.status
                    : `${formatDuration(row.seconds)} · ${row.status}`}
                </span>
                <span className="block text-xs text-muted">
                  {[row.club, row.bib ? `Bib ${row.bib}` : "", row.category]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {row.reasons?.length ? (
                  <span className="block text-xs text-muted">{row.reasons.join(" · ")}</span>
                ) : null}
                {row.requested ? (
                  <span className="block text-sm">Requested — awaiting staff review.</span>
                ) : null}
              </span>
            </label>
          </article>
        ))}
        {selected.size ? (
          <div className="space-y-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
            <label className="block text-sm font-medium">
              What helps us confirm these results are yours?
              <textarea
                className="mt-2 w-full rounded-lg border border-border bg-bg p-3"
                maxLength={2000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="For example, your club at the time, bib numbers or other identifying details"
              />
            </label>
            <p className="text-xs text-muted">
              One supporting note covers your selection. You can request up to 30 result reviews per
              day.
            </p>
            <Button disabled={note.trim().length < 12} onClick={() => request.mutate()}>
              {request.isPending
                ? "Submitting selection…"
                : `Request review of ${selected.size} selected ${selected.size === 1 ? "result" : "results"}`}
            </Button>
          </div>
        ) : null}
      </fieldset>
      {request.isError ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>{request.error.message}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setSelected(new Map());
              request.reset();
              void matches.refetch();
            }}
          >
            Reload suggestions
          </Button>
        </div>
      ) : null}
    </div>
  );
}
