import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ARCHIVE_FIELDS,
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

const inputClass = "w-full rounded-lg border border-border bg-bg p-2 text-sm";
const label = (field: string) =>
  field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
export function ArchiveRaceUpload({ onSaved }: { onSaved: () => void }) {
  const [q, setQ] = useState("");
  const [editionId, setEditionId] = useState(0);
  const [provider, setProvider] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceRaceKey, setSourceRaceKey] = useState("");
  const [permissionNote, setPermissionNote] = useState("");
  const [expected, setExpected] = useState("");
  const [table, setTable] = useState<ReturnType<typeof parseDelimited> | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [preview, setPreview] = useState<ArchiveRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
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
  const resetReview = () => {
    setPreview([]);
    progress.current = null;
    setMessage("");
  };
  const run = async () => {
    setBusy(true);
    pause.current = false;
    try {
      if (!progress.current) {
        const dataset = await createResultsDataset({
          data: {
            editionId,
            provider,
            sourceUrl,
            sourceRaceKey,
            permissionNote,
            expectedRows: expected === "" ? null : Number(expected),
          },
        });
        const chunks: { requestId: string; rows: ArchiveRow[] }[] = [];
        let rows: ArchiveRow[] = [],
          bytes = 0;
        for (const row of preview) {
          const size = new TextEncoder().encode(JSON.stringify(row)).length;
          if (rows.length && (rows.length >= 500 || bytes + size > 1_000_000)) {
            chunks.push({ requestId: crypto.randomUUID(), rows });
            rows = [];
            bytes = 0;
          }
          rows.push(row);
          bytes += size;
        }
        if (rows.length) chunks.push({ requestId: crypto.randomUUID(), rows });
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
      setMessage(
        `${p.next === p.chunks.length ? "Saved" : "Paused"}: ${p.inserted.toLocaleString()} new source rows, ${p.revised.toLocaleString()} changed, ${p.unchanged.toLocaleString()} unchanged. ${p.next}/${p.chunks.length} batches completed.`,
      );
      onSaved();
    } catch (error) {
      setMessage(
        `${error instanceof Error ? error.message : "Upload failed"}. Completed batches are saved; retry resumes safely.`,
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Save a whole race field privately, then match athletes when ready. CSV and tab-separated
        files up to 25 MB are processed in resumable batches. Export Excel as CSV first. Unknown
        times stay empty; DNS, DNF and DQ can be retained.
      </p>
      <fieldset disabled={busy || Boolean(progress.current)} className="grid gap-3 sm:grid-cols-2">
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
            onChange={(e) => {
              setEditionId(Number(e.target.value));
              resetReview();
            }}
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
        <label className="text-sm sm:col-span-2">
          Results CSV or TSV
          <input
            type="file"
            accept=".csv,.tsv,text/csv,text/tab-separated-values"
            className={inputClass}
            onChange={async (e) => {
              resetReview();
              setTable(null);
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 25 * 1024 * 1024)
                  throw new Error(
                    "Split files larger than 25 MB into smaller files using the same race source ID",
                  );
                const parsed = parseDelimited(await file.text());
                setTable(parsed);
                setMapping(suggestColumns(parsed.headers));
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not read this file");
              }
            }}
          />
        </label>
      </fieldset>
      {table && (
        <fieldset
          disabled={busy || Boolean(progress.current)}
          className="rounded-lg border border-border p-3"
        >
          <legend className="px-2 font-medium">
            Map column headings · {table.rows.length.toLocaleString()} rows
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {ARCHIVE_FIELDS.map((field) => (
              <label className="text-xs" key={field}>
                {label(field)}
                <select
                  className={inputClass}
                  value={mapping[field] ?? ""}
                  onChange={(e) => {
                    setMapping({ ...mapping, [field]: e.target.value || undefined });
                    resetReview();
                  }}
                >
                  <option value="">Not supplied</option>
                  {table.headers.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="my-3 text-xs text-muted">
            Map a unique source result ID, or a unique bib within this edition. Use a result ID for
            heats or repeated bibs. Times use HH:MM:SS or MM:SS; decimal seconds are retained.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              try {
                const rows = mapArchiveRows(table, mapping);
                setPreview(rows);
                setMessage(
                  `Checked ${rows.length.toLocaleString()} rows. Review the sample before saving.`,
                );
              } catch (error) {
                setPreview([]);
                setMessage(error instanceof Error ? error.message : "Check the mapped columns");
              }
            }}
          >
            Check all rows
          </Button>
        </fieldset>
      )}
      {preview.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="text-left text-xs text-muted">First five mapped entries</caption>
            <thead>
              <tr>
                {[
                  "Source ID",
                  "Athlete",
                  "Status",
                  "Finish seconds",
                  "Chip seconds",
                  "Gun seconds",
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
                    r.sourceKey,
                    r.name,
                    r.status,
                    r.finishSeconds ?? "—",
                    r.chipSeconds ?? "—",
                    r.gunSeconds ?? "—",
                  ].map((v, i) => (
                    <td className="p-2" key={i}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => void run()}
          disabled={
            busy ||
            !preview.length ||
            !editionId ||
            !provider ||
            !sourceUrl ||
            !sourceRaceKey ||
            permissionNote.trim().length < 12 ||
            Boolean(progress.current && progress.current.next === progress.current.chunks.length)
          }
        >
          {busy
            ? "Saving…"
            : progress.current
              ? "Resume remaining batches"
              : "Save private race field"}
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
        {!busy && progress.current && (
          <Button
            variant="secondary"
            onClick={() => {
              progress.current = null;
              setPreview([]);
              setTable(null);
              setMessage("");
            }}
          >
            Prepare another file
          </Button>
        )}
      </div>
      {message && (
        <p role="status" className="rounded-lg bg-elevated p-3 text-sm break-words">
          {message}
        </p>
      )}
    </div>
  );
}
