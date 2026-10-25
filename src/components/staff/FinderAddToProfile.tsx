import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  addFinderResultToProfile,
  findFinderProfileOptions,
  previewFinderProfileAddition,
} from "@/lib/athlete-finder/add-to-profile-api";
import {
  finderProfileSource,
  finderTime,
  type FinderProfilePreview,
  type FinderProfilePreviewInput,
  type FinderProfileReceipt,
} from "@/lib/athlete-finder/add-to-profile";
import type { FinderRow } from "@/lib/athlete-finder/core";
import type { ArchiveField, ColumnMapping } from "@/lib/results-archive/core";

const fieldClass =
  "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-border bg-bg px-3 py-2 text-sm";
const mappingFields: [ArchiveField, string][] = [
  ["finishTime", "Finish time"],
  ["chipTime", "Chip time"],
  ["gunTime", "Gun time"],
  ["overallPlace", "Overall place"],
  ["genderPlace", "Gender place"],
  ["categoryPlace", "Category place"],
  ["bib", "Bib"],
  ["status", "Finish status"],
  ["club", "Club at race"],
  ["category", "Age category"],
  ["gender", "Gender"],
  ["country", "Source nationality"],
  ["team", "Team"],
  ["leg", "Relay leg / heat"],
];

function Lookup({
  kind,
  initialQuery,
  onChoose,
}: {
  kind: "athlete" | "edition";
  initialQuery: string;
  onChoose: (id: number | undefined) => void;
}) {
  const [text, setText] = useState(initialQuery);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState(initialQuery.length >= 2 ? initialQuery : "");
  const options = useQuery({
    queryKey: ["finder-profile-options", kind, query],
    enabled: query.length >= 2,
    queryFn: () => findFinderProfileOptions({ data: { kind, q: query } }),
    retry: false,
  });
  return (
    <div className="min-w-0 space-y-2">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(text.trim());
          setSelected("");
          onChoose(undefined);
        }}
      >
        <label className="min-w-0 flex-1 text-sm font-medium">
          {kind === "athlete" ? "Find athlete profile" : "Find race edition"}
          <input
            className={fieldClass}
            value={text}
            minLength={2}
            maxLength={160}
            required
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <Button type="submit" variant="secondary">
          {kind === "athlete" ? "Find athlete" : "Find race"}
        </Button>
      </form>
      {options.isFetching && (
        <p role="status" className="text-sm">
          Finding {kind === "athlete" ? "profiles" : "races"}…
        </p>
      )}
      {options.isError && (
        <p role="alert" className="text-sm">
          Search could not finish.{" "}
          <button className="underline" onClick={() => options.refetch()}>
            Retry
          </button>
        </p>
      )}
      {!options.isFetching && !options.isError && options.data && (
        <label className="block text-sm">
          {kind === "athlete" ? "Choose athlete profile" : "Choose race edition"}
          <select
            className={fieldClass}
            value={selected}
            aria-label={kind === "athlete" ? "Choose athlete profile" : "Choose race edition"}
            onChange={(event) => {
              setSelected(event.target.value);
              onChoose(event.target.value ? Number(event.target.value) : undefined);
            }}
          >
            <option value="">
              Select the correct {kind === "athlete" ? "athlete" : "edition and distance"}
            </option>
            {options.data.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} · {option.detail}
              </option>
            ))}
          </select>
          {!options.data.length && (
            <span className="mt-1 block">
              No matches. Try another name or open the athlete tools to create a profile.
            </span>
          )}
        </label>
      )}
    </div>
  );
}

function ConfirmAddition({
  input,
  preview,
  onSaved,
  onBusy,
}: {
  input: FinderProfilePreviewInput;
  preview: FinderProfilePreview;
  onSaved: (receipt: FinderProfileReceipt) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);
  const [publication, setPublication] = useState(false);
  const [requestId] = useState(() => crypto.randomUUID());
  const save = useMutation({
    mutationFn: () =>
      addFinderResultToProfile({
        data: {
          ...input,
          athleteId: preview.athlete!.id,
          version: preview.version,
          requestId,
          note,
          sourceAndIdentityChecked: true,
          publicationConfirmed: true,
        },
      }),
    onMutate: () => onBusy(true),
    onSettled: () => onBusy(false),
    onSuccess: onSaved,
  });
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (checked && publication && note.trim().length >= 12 && !save.isPending) save.mutate();
      }}
    >
      <label className="block text-sm font-medium">
        Why this result belongs to this athlete
        <textarea
          className={fieldClass}
          value={note}
          minLength={12}
          maxLength={2000}
          required
          disabled={save.isPending}
          placeholder="For example: confirmed racing name, club at the time and source bib."
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={checked}
          disabled={save.isPending}
          onChange={(event) => setChecked(event.target.checked)}
        />
        <span>
          I checked the source row, athlete identity, race date, distance, finish status, times and
          supplied placings.
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={publication}
          disabled={save.isPending}
          onChange={(event) => setPublication(event.target.checked)}
        />
        <span>
          I am authorised to add this result. It will be{" "}
          {preview.visibility === "public"
            ? "visible on this public profile"
            : "kept private with this profile"}
          .
        </span>
      </label>
      {save.isError && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-900">
          {save.error.message}
        </p>
      )}
      <Button
        type="submit"
        disabled={!checked || !publication || note.trim().length < 12 || save.isPending}
      >
        {save.isPending ? "Adding result…" : "Add result to athlete profile"}
      </Button>
    </form>
  );
}

export function FinderAddToProfile({
  row,
  onClose,
  onSaved,
}: {
  row: FinderRow;
  onClose: () => void;
  onSaved: (receipt: FinderProfileReceipt) => void;
}) {
  const source = finderProfileSource(row);
  const [athleteId, setAthleteId] = useState<number>();
  const [editionId, setEditionId] = useState<number>();
  const [mapping, setMapping] = useState<ColumnMapping>();
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<FinderProfileReceipt>();
  const input: FinderProfilePreviewInput = { source: source!, athleteId, editionId, mapping };
  const preview = useQuery({
    queryKey: ["finder-profile-preview", input],
    enabled: Boolean(source) && !receipt,
    queryFn: () => previewFinderProfileAddition({ data: input }),
    retry: false,
    staleTime: 0,
  });
  const data = preview.data;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] max-w-3xl overflow-y-auto"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add result to athlete profile</DialogTitle>
        </DialogHeader>
        {receipt ? (
          <div role="status" className="space-y-3 rounded-lg border border-green-500 p-4">
            <p className="font-semibold">Result added to {receipt.name}.</p>
            <p className="text-sm">
              {receipt.visibility === "public"
                ? "Visible on the athlete profile."
                : "Saved privately with the athlete profile."}
            </p>
            <a
              className="underline"
              href={`/admin/athlete-tools?section=review&athleteId=${receipt.athleteId}`}
            >
              View athlete results
            </a>
            {receipt.visibility === "public" && (
              <a
                className="ml-4 underline"
                href={`https://www.athrecs.com/athletes/${encodeURIComponent(receipt.slug)}`}
                target="_blank"
                rel="noreferrer"
              >
                Open public profile
              </a>
            )}
            <div>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm">
              <strong>{row.name}</strong> · {row.event} · {row.date} · {row.distance}
            </p>
            <fieldset disabled={busy}>
              <Lookup kind="athlete" initialQuery={row.name} onChoose={setAthleteId} />
            </fieldset>
            {source?.kind === "capture" && (
              <fieldset disabled={busy}>
                <Lookup kind="edition" initialQuery={row.event ?? ""} onChoose={setEditionId} />
              </fieldset>
            )}
            {preview.isFetching && (
              <p role="status">Checking source, profile and existing results…</p>
            )}
            {preview.isError && (
              <p role="alert" className="text-sm">
                {preview.error.message}{" "}
                <button className="underline" onClick={() => preview.refetch()}>
                  Reload review
                </button>
              </p>
            )}
            {data && !preview.isError && (
              <>
                <div className="rounded-lg border border-border bg-bg p-3 text-sm">
                  <p>
                    <strong>Selected profile:</strong>{" "}
                    {data.athlete
                      ? `${data.athlete.name} · #${data.athlete.id} · ${data.athlete.detail}`
                      : "Choose an athlete above"}
                  </p>
                  <p>
                    <strong>Race:</strong>{" "}
                    {data.edition
                      ? `${data.edition.name} · ${data.edition.date} · ${data.edition.distance}`
                      : "Choose an edition above"}
                  </p>
                  {data.row && (
                    <>
                      <p>
                        <strong>Finish:</strong> {finderTime(data.row.finishSeconds)} ·{" "}
                        {data.row.status}
                      </p>
                      <p>
                        Chip: {finderTime(data.row.chipSeconds)} · Gun:{" "}
                        {finderTime(data.row.gunSeconds)}
                      </p>
                      <p>
                        Overall: {data.row.overallPlace ?? "Not supplied"} · Gender:{" "}
                        {data.row.genderPlace ?? "Not supplied"} · Category:{" "}
                        {data.row.categoryPlace ?? "Not supplied"}
                      </p>
                    </>
                  )}
                  <a
                    className="mt-2 inline-block underline"
                    href={data.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Inspect {data.sourceName} source
                  </a>
                </div>
                {!!data.headers.length && !busy && (
                  <details>
                    <summary className="cursor-pointer text-sm font-medium">
                      Check source-column mapping
                    </summary>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {mappingFields.map(([field, label]) => (
                        <label key={field} className="text-xs">
                          {label}
                          <select
                            className={fieldClass}
                            value={(mapping ?? data.mapping)[field] ?? ""}
                            onChange={(event) => {
                              const next = { ...(mapping ?? data.mapping) };
                              if (event.target.value) next[field] = event.target.value;
                              else delete next[field];
                              setMapping(next);
                            }}
                          >
                            <option value="">Not supplied</option>
                            {data.headers
                              .filter((h) => !["_finder_name", "_finder_source_key"].includes(h))
                              .map((h) => (
                                <option key={h} value={h}>
                                  {h.startsWith("_finder_") ? `Captured ${h.slice(8)}` : h}
                                </option>
                              ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </details>
                )}
                <details>
                  <summary className="cursor-pointer text-sm font-medium">
                    Original source values
                  </summary>
                  <dl className="mt-2 space-y-1 text-xs">
                    {Object.entries(data.original)
                      .filter(([key]) => !key.startsWith("_finder_"))
                      .map(([key, value]) => (
                        <div key={key} className="grid grid-cols-2 gap-2 break-words">
                          <dt className="font-medium">{key}</dt>
                          <dd>{value || "Not supplied"}</dd>
                        </div>
                      ))}
                  </dl>
                </details>
                {!preview.isFetching && !!data.issues.length && (
                  <div className="rounded-lg border border-amber-400 p-3 text-sm" role="status">
                    <ul className="list-disc space-y-1 pl-4">
                      {data.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                    {data.existing && (
                      <a
                        className="mt-2 inline-block underline"
                        href={`/admin/athlete-tools?section=review&athleteId=${data.existing.athleteId}`}
                      >
                        Review {data.existing.name}'s existing result
                      </a>
                    )}
                  </div>
                )}
                {!preview.isFetching && !data.issues.length && (
                  <ConfirmAddition
                    key={data.version}
                    input={input}
                    preview={data}
                    onBusy={setBusy}
                    onSaved={(value) => {
                      setReceipt(value);
                      onSaved(value);
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
