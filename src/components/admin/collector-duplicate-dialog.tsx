import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getDuplicateDistanceOptions,
  confirmCollectorDuplicateDistances,
} from "@/lib/race-collector/api";
import { safeUrl, type Candidate } from "@/lib/race-collector/core";

export function CollectorDuplicateDialog({
  finding,
  onClose,
  onSaved,
}: {
  finding: { id: string; candidate: Candidate };
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [choice, setChoice] = useState<
    Awaited<ReturnType<typeof getDuplicateDistanceOptions>>["events"][number] | null
  >(null);
  const [selected, setSelected] = useState<{ id: string; editionId: number; token: string }[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [differencesAccepted, setDifferencesAccepted] = useState(false);
  const [note, setNote] = useState("");
  const options = useQuery({
    queryKey: ["collector-duplicate-distance-options", finding.id, search],
    queryFn: () => getDuplicateDistanceOptions({ data: { id: finding.id, search } }),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const save = useMutation({
    mutationFn: () =>
      confirmCollectorDuplicateDistances({
        data: {
          id: finding.id,
          eventId: choice!.event.id,
          selections: selected,
          sameRaceConfirmed: confirmed,
          differencesAccepted,
          note,
        },
      }),
    onSuccess: (result) =>
      onSaved(
        `Kept ${result.keptName}. Removed ${result.count} duplicate finding${result.count === 1 ? "" : "s"}. Use Dismissed → Undo duplicate decision to restore each distance.`,
      ),
  });
  const c = finding.candidate;
  const selectedPairs =
    choice?.distances.flatMap((distance) =>
      distance.matches
        .filter((match) =>
          selected.some((s) => s.id === match.id && s.editionId === distance.edition.id),
        )
        .map((match) => ({ ...match, edition: distance.edition })),
    ) ?? [];
  const hasDifferences = selectedPairs.some((pair) => pair.differences.length > 0);
  function resetConfirmation() {
    setConfirmed(false);
    setDifferencesAccepted(false);
    save.reset();
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !save.isPending) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[min(64rem,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
          onEscapeKeyDown={(e) => {
            if (save.isPending) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (save.isPending) e.preventDefault();
          }}
        >
          <Dialog.Title className="text-lg font-semibold">Choose the one to keep</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-600">
            Choose an event, then tick the distances whose collected copies you want to remove.
            Unticked findings stay in the queue. Each saved distance has its own undo option.
          </Dialog.Description>
          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <section className="self-start space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <h3 className="font-semibold">Finding being reviewed</h3>
              <p className="font-medium">{c.name}</p>
              <p>
                {c.date} · {c.distanceLabel} · {c.distanceKm.toFixed(3)} km
              </p>
              <p>{[c.city, c.region, c.country].filter(Boolean).join(", ")}</p>
              <p>{c.evidence}</p>
              {safeUrl(c.sourceUrl) && (
                <a
                  className="block text-emerald-800 underline"
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Collected source
                </a>
              )}
              {safeUrl(c.entryUrl) && (
                <a
                  className="block text-emerald-800 underline"
                  href={c.entryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Collected entry page
                </a>
              )}
            </section>
            <section className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <h3 className="font-semibold">Keep an existing event and choose distances</h3>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch(input.trim());
                  setChoice(null);
                  setSelected([]);
                  resetConfirmation();
                }}
              >
                <input
                  aria-label="Search existing event names"
                  placeholder="Search any event name, e.g. connema"
                  maxLength={200}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={save.isPending}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2"
                />
                <Button type="submit" variant="secondary" disabled={save.isPending}>
                  Search
                </Button>
              </form>
              <p className="text-xs text-slate-600">
                {search ? "Search results" : "Suggested matches"} for {c.date}. Try part of the name
                if nothing appears.
              </p>
              {options.isFetching && <p role="status">Loading comparisons…</p>}
              {options.isError && <p role="alert">{options.error.message}</p>}
              {options.data && !options.data.total && (
                <p>No existing fixtures found. Try a shorter name or an alternate spelling.</p>
              )}
              <div className="space-y-3">
                {options.data?.events.map((result) => {
                  // Keep the reviewed snapshot (including tokens) until a deliberate new choice.
                  const group = choice?.event.id === result.event.id ? choice : result;
                  const chosen = choice?.event.id === group.event.id;
                  return (
                    <div
                      key={group.event.id}
                      className={`rounded-lg border bg-white p-3 ${chosen ? "border-emerald-700" : "border-slate-200"}`}
                    >
                      <label className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="kept-event"
                          value={group.event.id}
                          checked={chosen}
                          disabled={save.isPending}
                          onChange={() => {
                            setChoice(group);
                            setSelected([]);
                            resetConfirmation();
                          }}
                          className="mt-1"
                        />
                        <span>
                          <strong>{group.event.name}</strong>
                          <br />
                          {group.date} ·{" "}
                          {[group.event.city, group.event.country].filter(Boolean).join(", ")}
                          <br />
                          <span className="text-xs text-slate-600">
                            {group.distances.map((d) => d.edition.distance).join(" · ")}
                          </span>
                        </span>
                      </label>
                      {chosen && (
                        <fieldset
                          className="mt-3 space-y-3 border-t border-emerald-200 pt-3"
                          disabled={save.isPending}
                        >
                          <legend className="px-1 font-semibold">Choose distances to keep</legend>
                          <p className="text-xs text-slate-600">
                            Tick each duplicate to resolve. Published distances and results stay
                            saved.
                          </p>
                          <a
                            className="block text-emerald-800 underline"
                            href={`https://www.runrecs.com/races/${encodeURIComponent(group.event.slug)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open event to keep
                          </a>
                          {group.distances.map(({ edition, matches }) => (
                            <div
                              key={edition.id}
                              className="rounded-lg border border-slate-200 p-3"
                            >
                              <p className="font-semibold">
                                Keep {edition.distance} · {edition.distanceKm.toFixed(3)} km ·{" "}
                                {(edition.distanceKm / 1.609344).toFixed(2)} miles
                              </p>
                              {edition.source && safeUrl(edition.source) && (
                                <a
                                  className="text-xs text-emerald-800 underline"
                                  href={edition.source}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Saved distance source
                                </a>
                              )}
                              {matches.length === 0 && (
                                <p className="mt-1 text-xs text-slate-600">
                                  No matching collected distance to remove. This published distance
                                  stays saved.
                                </p>
                              )}
                              {matches.map((match) => (
                                <div key={match.id} className="mt-2 space-y-2 text-xs">
                                  <label className="flex items-start gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      aria-label={`Keep ${edition.distance}; remove ${match.candidate.name} (${match.candidate.distanceLabel})`}
                                      checked={selected.some(
                                        (s) => s.id === match.id && s.editionId === edition.id,
                                      )}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSelected((current) => [
                                          ...current.filter((s) => s.id !== match.id),
                                          ...(checked
                                            ? [
                                                {
                                                  id: match.id,
                                                  editionId: edition.id,
                                                  token: match.token,
                                                },
                                              ]
                                            : []),
                                        ]);
                                        resetConfirmation();
                                      }}
                                      className="mt-1"
                                    />
                                    <span>
                                      Remove collected copy: <strong>{match.candidate.name}</strong>
                                      <br />
                                      {match.candidate.date} · {match.candidate.distanceLabel} ·{" "}
                                      {match.candidate.distanceKm.toFixed(3)} km
                                      <br />
                                      {[
                                        match.candidate.city,
                                        match.candidate.region,
                                        match.candidate.country,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </span>
                                  </label>
                                  <details>
                                    <summary className="cursor-pointer text-slate-600">
                                      Collected evidence and links
                                    </summary>
                                    <p className="mt-1">{match.candidate.evidence}</p>
                                    {safeUrl(match.candidate.sourceUrl) && (
                                      <a
                                        className="mr-3 inline-block text-emerald-800 underline"
                                        href={match.candidate.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Collected source
                                      </a>
                                    )}
                                    {safeUrl(match.candidate.entryUrl) && (
                                      <a
                                        className="inline-block text-emerald-800 underline"
                                        href={match.candidate.entryUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Collected entry page
                                      </a>
                                    )}
                                  </details>
                                  {match.differences.map((difference) => (
                                    <p key={difference} className="font-medium text-amber-800">
                                      {difference}
                                    </p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ))}
                        </fieldset>
                      )}
                    </div>
                  );
                })}
              </div>
              {options.data && options.data.total > options.data.events.length && (
                <p>
                  Showing {options.data.events.length} of {options.data.total} events. Refine your
                  search.
                </p>
              )}
              {options.data && options.data.totalFindings > options.data.findings.length && (
                <p>
                  Showing {options.data.findings.length} of {options.data.totalFindings} collected
                  distances. Review the remaining findings after saving.
                </p>
              )}
              {choice && options.data && (
                <p className="text-xs text-slate-600">
                  Related findings with no equivalent published distance stay in the review queue
                  for separate review.
                </p>
              )}
            </section>
          </div>
          {choice && selected.length > 0 && (
            <div className="mt-5 space-y-3 text-sm">
              <p className="font-semibold">
                Keep {choice.event.name}: {selectedPairs.map((p) => p.edition.distance).join(", ")}.
                Remove {selected.length} selected collected{" "}
                {selected.length === 1 ? "copy" : "copies"}.
              </p>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={confirmed}
                  disabled={save.isPending}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I have compared the names, dates, distances, locations and sources for every
                  ticked copy. Each is the same race as its selected published distance.
                </span>
              </label>
              {hasDifferences && (
                <label className="flex items-start gap-2 font-medium text-amber-800">
                  <input
                    type="checkbox"
                    checked={differencesAccepted}
                    disabled={save.isPending}
                    onChange={(e) => setDifferencesAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I have checked the displayed differences and want to keep the published values.
                  </span>
                </label>
              )}
              <label className="block">
                Decision note (optional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                  disabled={save.isPending}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2"
                  placeholder="For example: alternate event name; same organiser and date."
                />
              </label>
            </div>
          )}
          {save.isError && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {save.error.message}
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <Button variant="secondary" disabled={save.isPending} onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="h-auto max-w-full whitespace-normal text-center"
              disabled={
                !choice ||
                !selected.length ||
                !confirmed ||
                (hasDifferences && !differencesAccepted) ||
                save.isPending ||
                options.isFetching
              }
              onClick={() => save.mutate()}
            >
              {save.isPending
                ? "Saving decision…"
                : `Keep selected distances and remove ${selected.length || "duplicate"} ${selected.length === 1 ? "copy" : "copies"}`}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
