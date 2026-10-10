import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CollectorPage } from "@/components/admin/race-collector";
import { previewFixtureFile, saveFixtureFile } from "@/lib/race-collector/fixture-upload-api";
import {
  FIXTURE_UPLOAD_BYTES,
  FIXTURE_UPLOAD_HEADERS,
  UK_FIXTURE_SCOPE,
  type FixtureUploadInput,
} from "@/lib/race-collector/fixture-upload";

const field = "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg";
export function FixtureImportPage({
  run,
  onRun,
}: {
  run?: string;
  onRun: (id: string) => void | Promise<void>;
}) {
  const [input, setInput] = useState<FixtureUploadInput>({
    content: "",
    format: "csv",
    label: "UK running fixtures 2026–2027",
    scope: UK_FIXTURE_SCOPE,
  });
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewFixtureFile>>>();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const update = (changes: Partial<FixtureUploadInput>) => {
    setInput((current) => ({ ...current, ...changes }));
    setPreview(undefined);
    setNotice("");
    setError("");
  };
  const fail = (e: unknown) =>
    setError(e instanceof Error ? e.message : "Import failed. Please retry.");
  const check = useMutation({
    mutationFn: () => previewFixtureFile({ data: input }),
    onSuccess: (result) => {
      setPreview(result);
      setError("");
    },
    onError: fail,
  });
  const save = useMutation({
    mutationFn: () => saveFixtureFile({ data: { ...input, previewHash: preview!.hash } }),
    onSuccess: async (result) => {
      setNotice(
        result.reused
          ? "Opened this file’s existing review. No duplicate import was created."
          : "Import saved for source review. Eligible fixtures can be published below.",
      );
      setError("");
      await onRun(result.id);
    },
    onError: fail,
  });
  const busy = check.isPending || save.isPending;
  const load = async (file?: File) => {
    if (!file) return;
    if (file.size > FIXTURE_UPLOAD_BYTES) {
      fail(new Error("Choose a file smaller than 2 MB."));
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv" && extension !== "json") {
      fail(new Error("Choose a .csv or .json fixture file."));
      return;
    }
    try {
      update({ content: await file.text(), format: extension, label: file.name.slice(0, 160) });
    } catch (e) {
      fail(e);
    }
  };
  const template = () => {
    const url = URL.createObjectURL(
      new Blob([FIXTURE_UPLOAD_HEADERS.join(",") + "\r\n"], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "athrecs-fixture-template.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="space-y-3">
        <Link to="/admin" className="text-sm text-muted">
          ← Staff tools
        </Link>
        <h1 className="text-3xl font-semibold text-fg">Import running fixtures</h1>
        <p className="max-w-3xl text-sm text-muted">
          Upload a CSV or JSON file, check the preview, then review and publish the ready races.
          Imports work even while automated research is paused. Up to 500 distance listings per
          file.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={template}>
            Download CSV template
          </Button>
          <Button asChild variant="secondary">
            <Link to="/admin/sources">Race and timing sources</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/admin/race-collector">Automated research</Link>
          </Button>
        </div>
      </header>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
          <label className="block space-y-1 text-sm font-medium">
            Import name
            <input
              className={field}
              value={input.label}
              maxLength={160}
              onChange={(e) => update({ label: e.target.value })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm font-medium">
              Start date
              <input
                type="date"
                className={field}
                value={input.scope.dateFrom}
                onChange={(e) => update({ scope: { ...input.scope, dateFrom: e.target.value } })}
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              End date
              <input
                type="date"
                className={field}
                value={input.scope.dateTo}
                onChange={(e) => update({ scope: { ...input.scope, dateTo: e.target.value } })}
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Start countries
              <select
                className={field}
                value={input.scope.countries.join(",")}
                onChange={(e) =>
                  update({ scope: { ...input.scope, countries: e.target.value.split(",") } })
                }
              >
                <option value="GB">United Kingdom</option>
                <option value="GB,IE">United Kingdom and Ireland</option>
                <option value="IE">Republic of Ireland</option>
              </select>
            </label>
          </div>
          <p className="text-xs text-muted">
            Northern Ireland is included in the UK. Distances from above zero through 500 miles, in
            miles or kilometres. Parkrun uses its separate verified fixture workflow.
          </p>
          <label className="block space-y-2 text-sm font-medium">
            Fixture file
            <input
              className={field}
              type="file"
              accept=".csv,.json"
              onChange={(e) => void load(e.target.files?.[0])}
            />
          </label>
          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Paste CSV or JSON instead
            </summary>
            <div className="mt-3 space-y-2">
              <select
                aria-label="Fixture format"
                className={field}
                value={input.format}
                onChange={(e) => update({ format: e.target.value as "csv" | "json" })}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <textarea
                aria-label="Fixture content"
                className={`${field} min-h-48 font-mono`}
                value={input.content}
                onChange={(e) => update({ content: e.target.value })}
              />
            </div>
          </details>
        </fieldset>
        <details className="rounded-lg bg-bg p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Required columns and source checks
          </summary>
          <div className="mt-3 space-y-2 text-muted">
            <p>
              <code>
                name, country, city, date, distance, unit, sourceUrl, sourceKind, evidence,
                checkedAt
              </code>
            </p>
            <p>
              Use a real date in YYYY-MM-DD format. Distance accepts a number with km or mi, or a
              label such as 10K, half marathon or marathon. Keep the programme name consistent
              across its distances.
            </p>
            <p>
              sourceKind must be organiser, entry, governing-body or timing-provider. Read the
              actual race or timing programme and follow its direct entry link. RunABC cannot be
              used as the primary source or entry link.
            </p>
            <p>
              evidence briefly describes where the date, distance and venue were checked. checkedAt
              is that check’s date in YYYY-MM-DD format. Unknown startTime stays blank; known times
              use HH:mm. Optional entryStatus is Open, Closed or TBC (the default).
            </p>
            <p>
              JSON accepts an array of fixture objects, or a fixtures/candidates array. CSV supports
              quoted commas and multiline evidence. The preview identifies invalid rows, existing
              races, repeated rows and uncertain matches.
            </p>
          </div>
        </details>
        <Button disabled={busy || !input.content.trim()} onClick={() => check.mutate()}>
          {check.isPending ? "Checking fixtures…" : "Preview and check duplicates"}
        </Button>
      </section>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </p>
      )}
      {preview && (
        <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">Import preview</h2>
          <p className="text-sm" role="status">
            {preview.counts.ready} ready for review · {preview.counts.duplicate} already listed ·{" "}
            {preview.counts.repeat} repeated in file · {preview.counts.held} held ·{" "}
            {preview.counts.invalid} invalid
          </p>
          <p className="text-xs text-muted">
            Correct invalid rows before saving. Existing races are kept out of publication, repeated
            file rows are skipped, and uncertain matches wait for review. Catalogue checks run again
            when publishing.
          </p>
          <div className="max-h-[32rem] overflow-auto rounded-lg border border-border">
            <table className="w-full min-w-[50rem] text-left text-sm">
              <thead className="sticky top-0 bg-elevated">
                <tr>
                  {["Row", "Fixture", "Date / distance", "Start", "Check"].map((h) => (
                    <th className="p-3" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.row} className="border-t border-border">
                    <td className="p-3">{r.row}</td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">
                      {r.date} · {r.distance}
                    </td>
                    <td className="p-3">{r.startTime || "Unknown"}</td>
                    <td className="max-w-md p-3">
                      <strong>{r.status === "review" ? "Ready for review" : r.status}</strong>
                      <p className="text-xs text-muted">{r.reason}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button disabled={busy || preview.counts.invalid > 0} onClick={() => save.mutate()}>
            {save.isPending ? "Saving review…" : "Save import for review"}
          </Button>
        </section>
      )}
      {run && <CollectorPage key={run} embedded initialRunId={run} publicationName="AthRecs" />}
    </div>
  );
}
