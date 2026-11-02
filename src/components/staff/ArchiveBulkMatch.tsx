import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { bulkMatchArchive, getArchiveOverview } from "@/lib/results-archive/api";

const labels = {
  bridge: "Same edition, bib and finish time",
  name_club: "Unique name and club",
  name_country: "Unique name and explicit nationality",
};
export function ArchiveBulkMatch() {
  const client = useQueryClient();
  const overview = useQuery({
    queryKey: ["archive-workspace", "overview"],
    queryFn: () => getArchiveOverview(),
    staleTime: 30000,
  });
  const [datasetId, setDatasetId] = useState("");
  const [limit, setLimit] = useState(25);
  const [after, setAfter] = useState(0);
  const [batch, setBatch] = useState<Awaited<ReturnType<typeof bulkMatchArchive>> | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const dataset = overview.data?.datasets.find((d) => d.id === datasetId);
  function reset(cursor = 0) {
    setAfter(cursor);
    setBatch(null);
    setConfirmed(false);
    setStatus("");
  }
  async function run(apply: boolean) {
    setBusy(true);
    setStatus("");
    setConfirmed(false);
    try {
      const r = await bulkMatchArchive({
        data: {
          datasetId,
          after,
          limit,
          apply,
          previewToken: apply ? batch?.previewToken : undefined,
        },
      });
      setBatch(r);
      setStatus(
        apply
          ? `Saved ${r.linked} private archive associations.`
          : `Previewed ${r.scanned} rows. No changes saved.`,
      );
      if (apply) void client.invalidateQueries({ queryKey: ["archive-workspace"] });
    } catch (err) {
      setBatch(null);
      setStatus(err instanceof Error ? err.message : "Request failed. Preview this batch again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-card">
      <h2 className="font-display text-xl font-semibold">Bulk match to existing athletes</h2>
      <p>
        Review one batch at a time. Approved matches are visible in the staff archive under Held.
        Source verification and public display require separate review.
      </p>
      <label className="block">
        Race dataset{" "}
        <select
          value={datasetId}
          disabled={busy}
          onChange={(e) => {
            setDatasetId(e.target.value);
            reset();
          }}
        >
          <option value="">Select a dataset</option>
          {overview.data?.datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.eventName} · {d.date} · {d.distance} · {d.provider} · {d.stored} rows
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Rows to preview{" "}
        <select
          value={limit}
          disabled={busy}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            reset();
          }}
        >
          {[1, 10, 25, 100, 500].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <Button variant="secondary" disabled={busy || !dataset} onClick={() => void run(false)}>
        Preview this batch
      </Button>
      {status && <p role="status">{status}</p>}
      {batch && (
        <div className="space-y-2">
          <p>
            {batch.matches.length} proposed private links. {batch.scanned - batch.matches.length}{" "}
            rows left for review.
          </p>
          {dataset && (
            <a href={dataset.sourceUrl} target="_blank" rel="noreferrer" className="underline">
              Inspect {dataset.provider} source
            </a>
          )}
          {batch.matches.length > 0 && (
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-left text-sm">
                <caption>All proposed links in this batch</caption>
                <thead>
                  <tr>
                    {["Archive row", "Athlete", "Source bib and finish", "Matching evidence"].map(
                      (h) => (
                        <th key={h}>{h}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {batch.matches.map((m) => (
                    <tr key={m.entryId}>
                      <td>
                        {m.name} · #{m.entryId} v{m.revision}
                      </td>
                      <td>
                        {m.athleteName} · #{m.athleteId}
                      </td>
                      <td>
                        {m.bib || "—"} · {m.finishSeconds} s
                      </td>
                      <td>
                        {labels[m.tier]} · {m.evidence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <ul>
            {Object.entries(batch.skipped).map(([reason, n]) => (
              <li key={reason}>
                {reason.replaceAll("_", " ")} · {n}
              </li>
            ))}
          </ul>
          {batch.matches.length > 0 && !batch.linked && (
            <>
              <label className="block">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />{" "}
                I reviewed every proposed link in this batch.
              </label>
              <Button disabled={busy || !confirmed} onClick={() => void run(true)}>
                Approve private links
              </Button>
            </>
          )}
          {batch.next !== null && (
            <Button disabled={busy} variant="secondary" onClick={() => reset(batch.next!)}>
              Select next batch
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
