import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { previewAnzImport, saveAnzImport } from "@/lib/anz/api";
export function AnzImport({ url, athleteId }: { url: string; athleteId: number }) {
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewAnzImport>> | null>(null);
  const [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState<Awaited<ReturnType<typeof saveAnzImport>> | null>(null);
  const client = useQueryClient();
  async function check() {
    setBusy(true);
    setError("");
    setConfirmed(false);
    setPreview(null);
    setReceipt(null);
    try {
      setPreview(await previewAnzImport({ data: { url, athleteId } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ANZ preview failed.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!preview || !confirmed) return;
    setBusy(true);
    setError("");
    try {
      setReceipt(
        await saveAnzImport({
          data: { url, athleteId, version: preview.version, sourceChecked: true },
        }),
      );
      void client.invalidateQueries({ queryKey: ["athlete-workspace"] });
      void client.invalidateQueries({ queryKey: ["staff-athlete-directory"] });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Import could not be confirmed. Preview again before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="space-y-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4"
      aria-label="Import Athletics New Zealand results"
    >
      <h3 className="font-semibold">Import Athletics New Zealand results</h3>
      <p className="text-sm">
        Read every event listed on this ANZ profile, including older performances and championship
        medals. Existing sharing settings are kept.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void check()}
        className="min-h-11 rounded-lg bg-cyan-800 px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Reading ANZ — this can take a few minutes…" : "Preview ANZ results"}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {preview && !receipt ? (
        <div className="space-y-3">
          <p className="text-sm">
            <strong>{preview.capture.name}</strong> · {preview.capture.club} · Coach:{" "}
            {preview.capture.coach || "Not supplied"}
          </p>
          <p className="text-sm">
            {preview.capture.history.performances.length} performances across{" "}
            {preview.capture.eventCount} events; {preview.capture.medals.length} championship
            medals. Currently {preview.previousCount} ANZ performances on AthRecs.
          </p>
          <details>
            <summary className="cursor-pointer text-sm font-semibold">
              Review imported performances
            </summary>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="py-2">Date</th>
                    <th>Event</th>
                    <th>Time</th>
                    <th>Place</th>
                    <th>Meeting</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.capture.history.performances.map((r, i) => (
                    <tr key={i} className="border-t border-cyan-200">
                      <td className="whitespace-nowrap py-2 pr-2">{r.date}</td>
                      <td className="pr-2">{r.discipline}</td>
                      <td className="pr-2">{r.performance}</td>
                      <td className="pr-2">{r.place}</td>
                      <td>{r.meeting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <a href={url} target="_blank" rel="noreferrer" className="block text-sm underline">
            Open ANZ to compare the athlete and results
          </a>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={busy}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            I checked the athlete identity and performance rows against ANZ.
          </label>
          <button
            type="button"
            disabled={!confirmed || busy}
            onClick={() => void save()}
            className="min-h-11 rounded-lg bg-cyan-800 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save reviewed ANZ performances
          </button>
        </div>
      ) : null}
      {receipt ? (
        <p role="status" className="text-sm font-semibold">
          Saved {receipt.performances} performances and {receipt.medals} medals.{" "}
          {receipt.published
            ? "The existing public history is updated."
            : "The history is private pending publication review."}{" "}
          <a href={`/athletes/${receipt.slug}`} className="underline">
            View profile
          </a>
        </p>
      ) : null}
    </section>
  );
}
