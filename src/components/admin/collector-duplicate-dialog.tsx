import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getDuplicateOptions, confirmCollectorDuplicate } from "@/lib/race-collector/api";
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
    Awaited<ReturnType<typeof getDuplicateOptions>>["options"][number] | null
  >(null);
  const [confirmed, setConfirmed] = useState(false);
  const [differencesAccepted, setDifferencesAccepted] = useState(false);
  const [note, setNote] = useState("");
  const options = useQuery({
    queryKey: ["collector-duplicate-options", finding.id, search],
    queryFn: () => getDuplicateOptions({ data: { id: finding.id, search } }),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const save = useMutation({
    mutationFn: () =>
      confirmCollectorDuplicate({
        data: {
          id: finding.id,
          eventId: choice!.event.id,
          editionId: choice!.edition.id,
          token: choice!.token,
          sameRaceConfirmed: confirmed,
          differencesAccepted,
          note,
        },
      }),
    onSuccess: (result) =>
      onSaved(
        `Kept ${result.keptName} · ${result.keptDistance}. Removed the duplicate finding. Use Dismissed → Undo duplicate decision to restore it.`,
      ),
  });
  const c = finding.candidate;
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
            Choose the published fixture that is the same race. The collected copy will move to
            Dismissed with your decision saved. Published fixtures and results remain intact.
          </Dialog.Description>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <h3 className="font-semibold">Remove this collected finding</h3>
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
              <h3 className="font-semibold">Keep an existing fixture</h3>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch(input.trim());
                  setChoice(null);
                  setConfirmed(false);
                  setDifferencesAccepted(false);
                  save.reset();
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
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {options.data?.options.map((option) => (
                  <label
                    key={option.edition.id}
                    className={`block rounded-lg border bg-white p-3 ${choice?.edition.id === option.edition.id ? "border-emerald-700" : "border-slate-200"}`}
                  >
                    <span className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="kept-fixture"
                        value={option.edition.id}
                        checked={choice?.edition.id === option.edition.id}
                        disabled={save.isPending || Boolean(option.blocker)}
                        onChange={() => {
                          setChoice(option);
                          setConfirmed(false);
                          setDifferencesAccepted(false);
                          save.reset();
                        }}
                        className="mt-1"
                      />
                      <span>
                        <strong>{option.event.name}</strong>
                        <br />
                        {option.edition.date} · {option.edition.distance} ·{" "}
                        {option.edition.distanceKm.toFixed(3)} km
                        <br />
                        {option.event.city}, {option.event.country}
                      </span>
                    </span>
                    {option.blocker && (
                      <p className="mt-1 text-xs text-slate-600">{option.blocker}</p>
                    )}
                  </label>
                ))}
              </div>
              {options.data && options.data.total > options.data.options.length && (
                <p>
                  Showing {options.data.options.length} of {options.data.total}. Refine your search.
                </p>
              )}
              {choice && (
                <div className="space-y-2 border-t border-emerald-200 pt-3">
                  <a
                    className="block text-emerald-800 underline"
                    href={`https://www.runrecs.com/races/${encodeURIComponent(choice.event.slug)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open event to keep
                  </a>
                  {choice.edition.source && safeUrl(choice.edition.source) && (
                    <a
                      className="block text-emerald-800 underline"
                      href={choice.edition.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Saved source
                    </a>
                  )}
                  {choice.differences.map((difference) => (
                    <p key={difference} className="font-medium text-amber-800">
                      {difference}
                    </p>
                  ))}
                </div>
              )}
            </section>
          </div>
          {choice && (
            <div className="mt-5 space-y-3 text-sm">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={confirmed}
                  disabled={save.isPending}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I have compared the names, date, distance, locations and sources. These are the
                  same fixture, and I want to keep {choice.event.name}.
                </span>
              </label>
              {choice.differences.length > 0 && (
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
              disabled={
                !choice ||
                !confirmed ||
                Boolean(choice.blocker) ||
                Boolean(choice.differences.length && !differencesAccepted) ||
                save.isPending ||
                options.isFetching
              }
              onClick={() => save.mutate()}
            >
              {save.isPending
                ? "Saving decision…"
                : "Keep this fixture and remove duplicate finding"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
