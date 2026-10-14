import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  archiveChunks,
  receiveBrowserCollection,
  type CollectionProgress,
} from "@/lib/results-archive/browser-collection";
import { parseBrowserCapture } from "@/lib/results-archive/browser-capture";
import {
  discardBrowserCapture,
  type PendingBrowserCapture,
} from "@/lib/results-archive/browser-handoff";
import {
  ARCHIVE_FIELDS,
  datasetSchema,
  mapArchiveRows,
  parseDelimited,
  suggestColumns,
  type ArchiveRow,
  type ColumnMapping,
} from "@/lib/results-archive/core";
import {
  createResultsDataset,
  findArchiveEditions,
  saveArchiveBatch,
} from "@/lib/results-archive/api";

const inputClass = "w-full min-w-0 rounded-lg border border-border bg-bg p-2 text-sm";
const label = (field: string) =>
  field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
const duration = (value: number | null) =>
  value === null
    ? "—"
    : `${Math.floor(value / 3600)}:${String(Math.floor(value / 60) % 60).padStart(2, "0")}:${(value % 60).toFixed(2).padStart(5, "0")}`;
export type SavedArchiveRace = {
  id: string;
  editionId: number;
  eventName: string;
  date: string;
  distance: string;
  provider: string;
  sourceUrl: string;
  sourceRaceKey: string;
  permissionNote: string;
  expected: number | null;
};
export function ArchiveRaceUpload({
  onSaved,
  onReview,
  onCaptureConsumed,
  initialCapture,
  savedRaces = [],
}: {
  onSaved: () => void;
  onReview?: (datasetId: string) => void;
  onCaptureConsumed?: (id: string) => void;
  initialCapture?: PendingBrowserCapture | null;
  savedRaces?: SavedArchiveRace[];
}) {
  const [step, setStep] = useState(1);
  const [q, setQ] = useState("");
  const [editionId, setEditionId] = useState(0);
  const [savedRace, setSavedRace] = useState("");
  const [provider, setProvider] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceRaceKey, setSourceRaceKey] = useState("");
  const [permissionNote, setPermissionNote] = useState("");
  const [expected, setExpected] = useState("");
  const [table, setTable] = useState<ReturnType<typeof parseDelimited> | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [preview, setPreview] = useState<ArchiveRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [captureNote, setCaptureNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState<CollectionProgress | null>(null);
  const collectionCapture = useRef<PendingBrowserCapture | null>(null);
  const stopCollection = useRef<(() => void) | null>(null);
  useEffect(() => () => stopCollection.current?.(), []);
  const loadedCapture = useRef("");
  const fileVersion = useRef(0);
  const captureId = useRef<string | null>(null);
  const progress = useRef<{
    datasetId: string;
    chunks: { requestId: string; rows: ArchiveRow[] }[];
    next: number;
    inserted: number;
    revised: number;
    unchanged: number;
  } | null>(null);
  const pause = useRef(false);
  const editions = useQuery({
    queryKey: ["archive-edition-search", q],
    queryFn: () => findArchiveEditions({ data: { q } }),
    enabled: q.trim().length >= 2,
  });
  const edition =
    savedRaces.find((r) => r.id === savedRace) ?? editions.data?.find((r) => r.id === editionId);
  const locked = busy || Boolean(progress.current);
  function loadContent(content: string, name: string) {
    const capture = /\.json$/i.test(name) ? parseBrowserCapture(content) : null;
    const parsed = capture?.table ?? parseDelimited(content);
    setTable(parsed);
    setMapping(capture?.mapping ?? suggestColumns(parsed.headers));
    setPreview([]);
    setConfirmed(false);
    setFileName(name);
    setMessage("");
    setCaptureNote(
      capture
        ? `Loaded ${parsed.rows.length.toLocaleString()} captured rows. Only this page is included. ${capture.warnings.join(" ")}`
        : `${parsed.rows.length.toLocaleString()} rows loaded.`,
    );
    if (!savedRace) setEditionId(0);
    if (capture && !savedRace) {
      const url = new URL(capture.sourceUrl);
      // The edition is always chosen by staff. Only the observed source host is suggested as credit.
      setProvider(url.hostname);
      setSourceUrl(capture.sourceUrl);
      setExpected("");
      if (url.hostname === "results.tcslondonmarathon.com") {
        const stable = `${url.origin}${url.pathname}?pid=list`;
        setSourceUrl(stable);
        setSourceRaceKey(stable);
        setQ("London Marathon");
      } else setSourceRaceKey(capture.sourceUrl.slice(0, 300));
    }
  }
  useEffect(() => {
    if (!initialCapture || loadedCapture.current === initialCapture.id) return;
    loadedCapture.current = initialCapture.id;
    try {
      loadContent(initialCapture.json, `${initialCapture.title || "Browser results"}.athrecs.json`);
      captureId.current = initialCapture.id;
      collectionCapture.current = initialCapture.collection ? initialCapture : null;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the received capture");
    }
    // Each selected capture mounts a fresh form. Keep the user's edits on subsequent renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCapture]);
  async function readFile(file?: File) {
    if (!file || locked) return;
    const version = ++fileVersion.current;
    setReading(true);
    setTable(null);
    setPreview([]);
    setConfirmed(false);
    setMessage("");
    captureId.current = null;
    collectionCapture.current = null;
    try {
      if (file.size > 25 * 1024 * 1024)
        throw new Error(
          "Split files larger than 25 MB into smaller files using the same race source.",
        );
      const content = await file.text();
      if (version === fileVersion.current) loadContent(content, file.name);
    } catch (error) {
      if (version === fileVersion.current)
        setMessage(error instanceof Error ? error.message : "Could not read this file");
    } finally {
      if (version === fileVersion.current) setReading(false);
    }
  }
  function checkRows() {
    if (!table) return;
    try {
      const rows = mapArchiveRows(table, mapping);
      if (!rows.length) throw new Error("This file has no result rows.");
      setPreview(rows);
      setMessage(`Checked ${rows.length.toLocaleString()} rows. Review the sample before saving.`);
      return true;
    } catch (error) {
      setPreview([]);
      setMessage(error instanceof Error ? error.message : "Check the mapped columns");
      return false;
    }
  }
  async function run() {
    if (!confirmed || !preview.length) return;
    if (collectionCapture.current && (!window.opener || window.opener.closed)) {
      setMessage(
        "The results tab connection was lost. Keep this signed-in AthRecs tab open, then reopen the browser button on page 1 and choose Collect all pages again.",
      );
      return;
    }
    setBusy(true);
    pause.current = false;
    try {
      if (!progress.current) {
        const dataset = await createResultsDataset({
          data: datasetSchema.parse({
            editionId,
            provider,
            sourceUrl,
            sourceRaceKey,
            permissionNote,
            expectedRows: expected === "" ? null : Number(expected),
          }),
        });
        const chunks = archiveChunks(preview);
        progress.current = {
          datasetId: dataset.id,
          chunks,
          next: 0,
          inserted: 0,
          revised: 0,
          unchanged: 0,
        };
      }
      const p = progress.current;
      for (; p.next < p.chunks.length && !pause.current; p.next++) {
        setMessage(`Saving batch ${p.next + 1} of ${p.chunks.length}…`);
        const receipt = await saveArchiveBatch({
          data: { datasetId: p.datasetId, ...p.chunks[p.next] },
        });
        p.inserted += receipt.inserted;
        p.revised += receipt.revised;
        p.unchanged += receipt.unchanged;
      }
      const done = p.next === p.chunks.length;
      setMessage(
        `${done ? "Saved" : "Paused"}: ${p.inserted.toLocaleString()} new source rows, ${p.revised.toLocaleString()} changed, ${p.unchanged.toLocaleString()} unchanged. ${p.next}/${p.chunks.length} batches completed.`,
      );
      onSaved();
      if (done && collectionCapture.current?.collection) {
        const capture = collectionCapture.current;
        setStep(4);
        stopCollection.current?.();
        stopCollection.current = receiveBrowserCollection({
          source: window.opener,
          token: capture.id,
          collection: capture.collection!,
          firstJson: capture.json,
          datasetId: p.datasetId,
          mapping,
          firstReceipt: { inserted: p.inserted, revised: p.revised, unchanged: p.unchanged },
          save: (data) => saveArchiveBatch({ data }),
          report: (status) => {
            setCollectionProgress(status);
            setMessage("");
            if (status.complete || status.paused) onSaved();
            if (status.complete) {
              setComplete(true);
              void discardBrowserCapture(capture.id)
                .then(() => onCaptureConsumed?.(capture.id))
                .catch(() =>
                  setMessage(
                    "Results saved. The pending browser copy could not be cleared; discard it when ready.",
                  ),
                );
            }
          },
        });
      } else if (done) {
        setComplete(true);
        setStep(4);
        if (captureId.current) {
          const id = captureId.current;
          try {
            await discardBrowserCapture(id);
            onCaptureConsumed?.(id);
          } catch {
            setMessage(
              (m) =>
                `${m} The browser copy could not be cleared; discard it from pending imports when ready.`,
            );
          }
        }
      }
    } catch (error) {
      setMessage(
        `${error instanceof Error ? error.message : "Upload failed"}. Completed batches are saved; retry resumes safely.`,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-w-0 space-y-4">
      <ol className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4" aria-label="Import progress">
        {["Choose results", "Confirm race", "Check and save", "Athlete matching"].map((text, i) => (
          <li
            key={text}
            aria-current={step === i + 1 ? "step" : undefined}
            className={`rounded-lg border p-3 ${step === i + 1 ? "border-cyan-700 bg-cyan-50 text-cyan-950" : "border-border text-muted"}`}
          >
            <span className="font-semibold">{i + 1}.</span> {text}
          </li>
        ))}
      </ol>
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Choose the results to import</h3>
          <p className="text-sm text-muted">
            Use the browser button to send a loaded results page here, or upload a saved file.
          </p>
          <div
            className="rounded-xl border-2 border-dashed border-border p-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void readFile(e.dataTransfer.files[0]);
            }}
          >
            <label className="block space-y-2 text-sm font-medium">
              Results CSV, TSV or browser capture
              <input
                type="file"
                accept=".csv,.tsv,.json,text/csv,text/tab-separated-values,application/json"
                className={inputClass}
                disabled={locked || reading}
                onChange={(e) => void readFile(e.target.files?.[0])}
              />
            </label>
            <p className="mt-2 text-xs text-muted">
              Drop a file here or choose one · up to 25 MB · export Excel as CSV first.
            </p>
          </div>
          {reading && <p role="status">Reading results…</p>}
          {table && (
            <div className="rounded-lg bg-elevated p-4">
              <strong className="break-words">{fileName}</strong>
              <p className="text-sm">{captureNote}</p>
              {collectionCapture.current?.collection && (
                <p className="mt-2 font-medium">
                  Automatic collection: {collectionCapture.current.collection.totalPages} pages ·{" "}
                  {collectionCapture.current.collection.totalRows.toLocaleString()} results ·{" "}
                  {collectionCapture.current.collection.filterLabel}. Confirm the race once, then
                  keep both tabs open while every page is saved.
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={!table || reading}
              onClick={() => {
                setMessage("");
                setStep(2);
              }}
            >
              Continue to race
            </Button>
            <a
              href="/tools/browser-results.html?v=3"
              target="_blank"
              rel="noreferrer"
              className="text-sm underline"
            >
              Install or update the browser button
            </a>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Which race do these results belong to?</h3>
          <label className="block text-sm">
            Add to a saved race
            <select
              className={inputClass}
              value={savedRace}
              onChange={(e) => {
                const value = e.target.value;
                setSavedRace(value);
                setEditionId(0);
                setConfirmed(false);
                const race = savedRaces.find((r) => r.id === value);
                if (race) {
                  setEditionId(race.editionId);
                  setProvider(race.provider);
                  setSourceUrl(race.sourceUrl);
                  setSourceRaceKey(race.sourceRaceKey);
                  setPermissionNote(race.permissionNote);
                  setExpected(race.expected === null ? "" : String(race.expected));
                } else {
                  setPermissionNote("");
                  setExpected("");
                }
              }}
            >
              <option value="">Set up a new race source</option>
              {savedRaces.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.eventName} · {r.date} · {r.distance} · {r.provider}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted">
            Adding another page? Choose the same saved race. Repeated result IDs or bibs are checked
            within that source.
          </p>
          {!savedRace && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Find race edition
                <input
                  className={inputClass}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setEditionId(0);
                  }}
                  placeholder="Search race name"
                />
              </label>
              <label className="text-sm">
                Race, date and distance
                <select
                  className={inputClass}
                  value={editionId}
                  onChange={(e) => setEditionId(Number(e.target.value))}
                >
                  <option value={0}>Select the exact edition</option>
                  {editions.data?.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} · {e.date} · {e.distance}
                    </option>
                  ))}
                </select>
              </label>
              {editions.isError && <p role="alert">Race search failed. Try again.</p>}
            </div>
          )}
          <fieldset disabled={Boolean(savedRace)} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Timing/results provider
              <input
                className={inputClass}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Provider credited on the source"
              />
            </label>
            <label className="text-sm">
              Official results URL
              <input
                type="url"
                className={inputClass}
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>
            <label className="text-sm">
              Provider’s race ID, or stable results-page URL
              <input
                className={inputClass}
                value={sourceRaceKey}
                onChange={(e) => setSourceRaceKey(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Expected entries, if the source states a total
              <input
                type="number"
                min="0"
                className={inputClass}
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="Leave blank if unknown"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Authority to retain these participant results
              <textarea
                className={inputClass}
                value={permissionNote}
                onChange={(e) => setPermissionNote(e.target.value)}
                placeholder="Record the source permission or agreement that covers this import"
              />
            </label>
          </fieldset>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setStep(1);
                setMessage("");
              }}
            >
              Back
            </Button>
            <Button
              disabled={
                !editionId ||
                !provider.trim() ||
                !sourceUrl ||
                !sourceRaceKey ||
                permissionNote.trim().length < 12
              }
              onClick={() => {
                try {
                  datasetSchema.parse({
                    editionId,
                    provider,
                    sourceUrl,
                    sourceRaceKey,
                    permissionNote,
                    expectedRows: expected === "" ? null : Number(expected),
                  });
                  setStep(3);
                  setConfirmed(false);
                  checkRows();
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Check the race details");
                }
              }}
            >
              Continue to preview
            </Button>
          </div>
        </div>
      )}
      {step === 3 && table && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Check the results before saving</h3>
          <p className="text-sm">
            <strong>
              {edition && ("eventName" in edition ? edition.eventName : edition.name)}
            </strong>{" "}
            · {edition?.date} · {edition?.distance} · {table.rows.length.toLocaleString()} rows
          </p>
          <p className="text-sm text-muted">
            Recognised headings are suggested below. Finish, chip and gun times stay separate.
            Change any incorrect mapping before saving.
          </p>
          <details open={!preview.length} className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer font-medium">
              Check or change column mappings
            </summary>
            <fieldset disabled={locked} className="mt-3 grid gap-3 sm:grid-cols-3">
              {ARCHIVE_FIELDS.map((field) => (
                <label className="text-xs" key={field}>
                  {label(field)}
                  <select
                    className={inputClass}
                    value={mapping[field] ?? ""}
                    onChange={(e) => {
                      setMapping({ ...mapping, [field]: e.target.value || undefined });
                      setPreview([]);
                      setConfirmed(false);
                    }}
                  >
                    <option value="">Not supplied</option>
                    {table.headers.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </label>
              ))}
              <Button type="button" variant="secondary" onClick={checkRows}>
                Check all rows
              </Button>
            </fieldset>
          </details>
          {preview.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <caption className="pb-2 text-left text-xs text-muted">
                  First five mapped entries · every row was checked for valid fields and repeated
                  IDs
                </caption>
                <thead>
                  <tr>
                    {[
                      "Athlete",
                      "Bib / source ID",
                      "Nationality",
                      "Finish",
                      "Chip",
                      "Gun",
                      "Overall",
                      "Gender place",
                      "Category place",
                      "Status",
                    ].map((h) => (
                      <th className="p-2" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((r) => (
                    <tr key={r.sourceKey}>
                      {[
                        r.name,
                        r.bib || r.sourceKey,
                        r.country || "—",
                        duration(r.finishSeconds),
                        duration(r.chipSeconds),
                        duration(r.gunSeconds),
                        r.overallPlace ?? "—",
                        r.genderPlace ?? "—",
                        r.categoryPlace ?? "—",
                        r.status,
                      ].map((v, i) => (
                        <td className="border-t border-border p-2" key={i}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              disabled={locked || !preview.length}
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I checked the race, date, distance and column meanings against this source.{" "}
            {collectionCapture.current
              ? `Collect and save all ${collectionCapture.current.collection?.totalPages} pages for ${collectionCapture.current.collection?.filterLabel} for athlete matching and claim review.`
              : "Save these rows for athlete matching and claim review."}
          </label>
          <p className="text-xs text-muted">
            Saving keeps the original evidence privately. It does not approve athlete identity,
            change account ownership or publish a profile.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={locked}
              onClick={() => {
                setStep(2);
                setConfirmed(false);
                setMessage("");
              }}
            >
              Back
            </Button>
            <Button
              onClick={() => void run()}
              disabled={busy || !confirmed || !preview.length || complete}
            >
              {busy
                ? "Saving…"
                : progress.current
                  ? "Resume remaining batches"
                  : collectionCapture.current
                    ? "Save and collect all pages"
                    : "Save results for athlete matching"}
            </Button>
            {busy && (
              <Button
                variant="secondary"
                onClick={() => {
                  pause.current = true;
                }}
              >
                Pause after this batch
              </Button>
            )}
          </div>
        </div>
      )}
      {step === 4 && collectionProgress && (
        <div className="space-y-3 rounded-xl border border-cyan-300 bg-cyan-50 p-5 text-cyan-950">
          <h3 className="text-xl font-semibold">
            {collectionProgress.complete
              ? "All selected pages saved"
              : collectionProgress.paused
                ? "Collection paused — saved pages are kept"
                : "Collecting and saving every page"}
          </h3>
          <p role="status">{collectionProgress.message}</p>
          <p className="text-sm">
            {collectionProgress.inserted.toLocaleString()} new ·{" "}
            {collectionProgress.revised.toLocaleString()} changed ·{" "}
            {collectionProgress.unchanged.toLocaleString()} unchanged.
          </p>
          {!collectionProgress.complete && (
            <p className="text-sm">
              Keep this tab and the London results tab open. Pause or resume using the buttons on
              the results tab. If either tab is closed, restart from page 1; saved rows are checked
              for duplicates.
            </p>
          )}
          {!collectionProgress.complete && (
            <Button
              variant="secondary"
              onClick={() => {
                window.opener?.postMessage(
                  { type: "athrecs-collection-stop", token: collectionCapture.current?.id },
                  "https://results.tcslondonmarathon.com",
                );
              }}
            >
              Pause collection
            </Button>
          )}
          <p className="text-xs">
            This covers the selected source filters. Rows are available for private claim
            suggestions as batches are saved; no automatic identity approval or public profile
            creation.
          </p>
        </div>
      )}
      {step === 4 && complete && (
        <div className="space-y-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950">
          <h3 className="text-xl font-semibold">Saved — ready for athlete matching</h3>
          <p className="text-sm">
            Unmatched entries can now appear as private suggestions for athletes whose saved names
            match. They can select their results and send a claim request from their account.
          </p>
          <p className="text-sm">
            Review an existing athlete or an incoming request to attach a result. Newly created
            profiles and results stay private until publication is separately approved.
          </p>
          <div className="flex flex-wrap gap-2">
            {onReview && (
              <Button onClick={() => onReview(progress.current!.datasetId)}>
                Review athlete matches
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                stopCollection.current?.();
                stopCollection.current = null;
                collectionCapture.current = null;
                setCollectionProgress(null);
                setSavedRace(progress.current!.datasetId);
                progress.current = null;
                captureId.current = null;
                setComplete(false);
                setTable(null);
                setPreview([]);
                setConfirmed(false);
                setMessage("");
                setStep(1);
              }}
            >
              Add another page
            </Button>
          </div>
        </div>
      )}
      {message && (
        <p role="status" className="rounded-lg bg-elevated p-3 text-sm break-words">
          {message}
        </p>
      )}
    </div>
  );
}
