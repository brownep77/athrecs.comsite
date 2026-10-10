import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArchiveRaceUpload } from "./ArchiveRaceUpload";
import {
  findArchiveAthletes,
  findCanonicalResults,
  getArchiveEntries,
  getArchiveEntry,
  getArchiveOverview,
  reviewArchivedResult,
} from "@/lib/results-archive/api";
import { getStaffArchiveRequests } from "@/lib/results-archive/member-api";
import type { ArchiveState } from "@/lib/results-archive/core";

const inputClass = "min-w-0 max-w-full rounded-lg border border-border bg-bg p-2 text-sm";
function time(seconds: number | null) {
  if (seconds === null) return "—";
  return `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${(seconds % 60).toFixed(2).padStart(5, "0")}`;
}
export function ResultsArchiveWorkspace() {
  const client = useQueryClient();
  const [tab, setTab] = useState("source");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [state, setState] = useState<ArchiveState>("all");
  const [pages, setPages] = useState<number[]>([0]);
  const after = pages.at(-1)!;
  const [selected, setSelected] = useState<number | null>(null);
  const overview = useQuery({
    queryKey: ["archive-workspace", "overview"],
    queryFn: () => getArchiveOverview(),
    staleTime: 30000,
  });
  const entries = useQuery({
    queryKey: ["archive-workspace", "entries", query, datasetId, state, after],
    queryFn: () =>
      getArchiveEntries({
        data: { q: query, datasetId: datasetId || undefined, state, after: after || undefined },
      }),
    enabled: tab === "source",
  });
  const editionId = overview.data?.datasets.find((d) => d.id === datasetId)?.editionId;
  const canonical = useQuery({
    queryKey: ["archive-workspace", "canonical", query, editionId, after],
    queryFn: () =>
      findCanonicalResults({ data: { q: query, editionId, after: after || undefined } }),
    enabled: tab === "canonical",
  });
  const requests = useQuery({
    queryKey: ["archive-workspace", "requests"],
    queryFn: () => getStaffArchiveRequests(),
    enabled: tab === "requests",
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["archive-workspace"] });
    void client.invalidateQueries({ queryKey: ["result-archive"] });
  };
  const next = tab === "source" ? entries.data?.next : canonical.data?.next;
  return (
    <section
      className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card"
      aria-labelledby="central-results-heading"
    >
      <div>
        <h2 id="central-results-heading" className="font-display text-2xl font-semibold">
          Central results archive
        </h2>
        <p className="text-sm text-muted">
          Retain complete race fields, review identities and feed confirmed results into athlete
          profiles.
        </p>
      </div>
      {overview.isError ? (
        <p role="alert">
          Archive totals could not be loaded.{" "}
          <button className="underline" onClick={() => void overview.refetch()}>
            Retry
          </button>
        </p>
      ) : (
        overview.data && (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            {[
              ["Canonical results", overview.data.summary.canonical],
              ["Source observations", overview.data.summary.sourceRows],
              ["Awaiting identity", overview.data.summary.unmatched],
              ["Changed since review", overview.data.summary.changed],
              ["Held for review", overview.data.summary.held],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-elevated p-3" key={label}>
                <p className="text-xs text-muted">{label}</p>
                <strong className="text-xl">{Number(value).toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )
      )}
      <p className="text-xs text-muted">
        Source observations can refer to canonical results, so these totals are not additive. Stored
        does not mean source-verified or publicly displayed.
      </p>
      <div className="flex flex-wrap gap-2" aria-label="Archive sections">
        {[
          ["source", "Source results"],
          ["canonical", "Profile results"],
          ["upload", "Import a race"],
          ["requests", "Athlete requests"],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant={tab === value ? "default" : "secondary"}
            aria-pressed={tab === value}
            onClick={() => {
              setTab(value);
              setPages([0]);
              setSelected(null);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      {tab === "upload" ? (
        <ArchiveRaceUpload onSaved={refresh} />
      ) : tab === "requests" ? (
        <div className="space-y-3">
          <p className="text-xs text-muted">
            Up to 100 pending requests, oldest first. Matching a result does not grant ownership of
            an athlete profile.
          </p>
          {requests.isError && <p role="alert">Could not load athlete requests.</p>}
          {requests.isPending && <p>Loading requests…</p>}
          {requests.data?.length === 0 && <p>No pending athlete requests.</p>}
          {requests.data?.map((r, i) => (
            <article key={`${r.entryId}-${i}`} className="rounded-lg border border-border p-3">
              <strong>
                {r.name} · {r.event}
              </strong>
              <p className="text-sm whitespace-pre-wrap">{r.note}</p>
              {r.athleteIds.length > 0 && (
                <p className="text-xs text-muted">
                  Account’s linked athlete IDs: {r.athleteIds.join(", ")}
                </p>
              )}
              <Button className="mt-2" variant="secondary" onClick={() => setSelected(r.entryId)}>
                Review entry #{r.entryId}
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(q);
              setPages([0]);
            }}
          >
            <label className="flex min-w-48 flex-1 flex-col text-xs">
              Search {tab === "source" ? "athlete, bib or club" : "athlete, race or bib"}
              <input className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <label className="flex min-w-0 basis-full flex-col text-xs sm:flex-1">
              Race source (50 most recent)
              <select
                className={inputClass}
                value={datasetId}
                onChange={(e) => {
                  setDatasetId(e.target.value);
                  setPages([0]);
                }}
              >
                <option value="">All stored races</option>
                {overview.data?.datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.eventName} · {d.date} · {d.distance} · {d.provider}
                  </option>
                ))}
              </select>
            </label>
            {tab === "source" && (
              <label className="flex flex-col text-xs">
                Review state
                <select
                  className={inputClass}
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value as ArchiveState);
                    setPages([0]);
                  }}
                >
                  {["all", "unmatched", "linked", "changed", "held"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            )}
            <Button type="submit" className="self-end">
              Search
            </Button>
          </form>
          {(tab === "source" ? entries : canonical).isPending && <p>Loading results…</p>}
          {(tab === "source" ? entries : canonical).isError && (
            <p role="alert">
              Results could not be loaded.{" "}
              <button
                className="underline"
                onClick={() =>
                  tab === "source" ? void entries.refetch() : void canonical.refetch()
                }
              >
                Retry
              </button>
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead>
                <tr>
                  {[
                    "Athlete / entry",
                    "Race edition",
                    "Performance",
                    "Source / state",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="border-b border-border p-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tab === "source"
                  ? entries.data?.rows.map((r) => (
                      <tr key={r.id} className="border-b border-border">
                        <td className="p-2">
                          <strong>{r.payload.name}</strong>
                          <p className="text-xs">
                            {r.sourceKey} · {r.payload.club}
                          </p>
                        </td>
                        <td className="p-2">
                          {r.eventName}
                          <p className="text-xs">
                            {r.eventDate} · {r.distance}
                          </p>
                        </td>
                        <td className="p-2">
                          {time(r.payload.finishSeconds)}
                          <p className="text-xs">{r.payload.status}</p>
                        </td>
                        <td className="p-2">
                          {r.provider}
                          <p className="text-xs">
                            {r.canonicalChanged ||
                            (r.appliedRevision && r.revision > r.appliedRevision)
                              ? "Changed since review"
                              : r.state}{" "}
                            · revision {r.revision}
                          </p>
                        </td>
                        <td className="p-2">
                          <Button variant="secondary" size="sm" onClick={() => setSelected(r.id)}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  : canonical.data?.rows.map((r) => (
                      <tr key={r.id} className="border-b border-border">
                        <td className="p-2">
                          <strong>{r.name}</strong>
                          <p className="text-xs">
                            Athlete #{r.athleteId} · result #{r.id}
                          </p>
                        </td>
                        <td className="p-2">
                          {r.event}
                          <p className="text-xs">
                            {r.date} · {r.distance}
                          </p>
                        </td>
                        <td className="p-2">
                          {time(r.seconds)}
                          <p className="text-xs">{r.status}</p>
                        </td>
                        <td className="p-2">
                          {r.provider || "Source not recorded"}
                          <p className="text-xs">{r.visibility}</p>
                        </td>
                        <td className="p-2">
                          <a
                            className="text-accent underline"
                            href={`/admin/athlete-workspace?athleteId=${r.athleteId}`}
                          >
                            Open athlete
                          </a>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {(tab === "source" ? entries.data?.rows : canonical.data?.rows)?.length === 0 && (
            <p className="text-sm text-muted">No results match these filters.</p>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pages.length === 1}
              onClick={() => setPages((p) => p.slice(0, -1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={!next}
              onClick={() => next && setPages((p) => [...p, next])}
            >
              Next 50
            </Button>
          </div>
        </>
      )}
      {selected !== null && (
        <ArchiveReview
          key={selected}
          entryId={selected}
          onClose={() => setSelected(null)}
          onSaved={refresh}
        />
      )}
      {overview.data && tab === "source" && (
        <details>
          <summary className="cursor-pointer text-sm font-medium">Race-field coverage</summary>
          <div className="mt-2 space-y-2">
            {overview.data.datasets.map((d) => (
              <p key={d.id} className="text-sm">
                {d.eventName} · {d.date} · {d.distance}:{" "}
                <strong>
                  {d.stored.toLocaleString()}
                  {d.expected === null
                    ? " stored (source total unknown)"
                    : ` / ${d.expected.toLocaleString()} expected`}
                </strong>{" "}
                · {d.linked.toLocaleString()} linked
                {d.expected !== null && d.stored > d.expected
                  ? " — count exceeds source total; review"
                  : ""}
              </p>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function ArchiveReview({
  entryId,
  onClose,
  onSaved,
}: {
  entryId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [athlete, setAthlete] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);
  const detail = useQuery({
    queryKey: ["archive-workspace", "detail", entryId, athlete],
    queryFn: () =>
      getArchiveEntry({ data: { entryId, athleteId: athlete ? Number(athlete) : undefined } }),
  });
  const candidates = useQuery({
    queryKey: ["archive-workspace", "candidates", entryId, q],
    queryFn: () => findArchiveAthletes({ data: { entryId, q } }),
  });
  const review = useMutation({
    mutationFn: (action: "link" | "correct" | "hold" | "reopen") =>
      reviewArchivedResult({
        data: {
          entryId,
          revision: detail.data!.entry.revision,
          action,
          athleteId: athlete ? Number(athlete) : undefined,
          identityNote: note,
          sourceChecked: checked,
          resultFingerprint: detail.data?.resultFingerprint,
        },
      }),
    onSuccess: () => {
      onSaved();
      setChecked(false);
    },
  });
  const data = detail.data;
  return (
    <div
      className="space-y-3 rounded-xl border-2 border-accent bg-bg p-4"
      aria-label="Review archived entry"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Review entry #{entryId}</h3>
        <Button variant="secondary" onClick={onClose}>
          Close review
        </Button>
      </div>
      {detail.isPending && <p>Loading source revisions…</p>}
      {detail.isError && <p role="alert">Entry could not be loaded.</p>}
      {data && (
        <>
          <p>
            <strong>{data.entry.payload.name}</strong> · {data.entry.eventName} ·{" "}
            {data.entry.eventDate} · {data.entry.distance}
          </p>
          <a
            className="text-accent underline"
            href={data.entry.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Inspect {data.entry.provider} source
          </a>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-surface p-3">
              <h4 className="font-medium">Source revision {data.entry.revision}</h4>
              <p>
                {data.entry.payload.status} · {time(data.entry.payload.finishSeconds)}
              </p>
              <p className="text-xs">
                Chip {time(data.entry.payload.chipSeconds)} · gun{" "}
                {time(data.entry.payload.gunSeconds)} · position{" "}
                {data.entry.payload.overallPlace ?? "unknown"}
              </p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <h4 className="font-medium">Existing canonical result</h4>
              {data.currentResult ? (
                <pre className="overflow-auto text-xs">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(data.currentResult).filter(([k]) =>
                        [
                          "id",
                          "athlete_id",
                          "status",
                          "finish_time_seconds",
                          "chip_time_seconds",
                          "gun_time_seconds",
                          "overall_place",
                          "gender_place",
                          "category_place",
                          "category",
                          "source_url",
                          "result_source",
                        ].includes(k),
                      ),
                    ),
                    null,
                    2,
                  )}
                </pre>
              ) : (
                <p className="text-sm">No existing result selected.</p>
              )}
            </div>
          </div>
          {!data.entry.resultId && (
            <>
              <form
                className="flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setQ(search);
                }}
              >
                <label className="flex flex-1 flex-col text-xs">
                  Find an existing athlete
                  <input
                    className={inputClass}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <Button className="self-end" type="submit" variant="secondary">
                  Find athlete
                </Button>
              </form>
              <label className="flex flex-col text-sm">
                Identity decision
                <select
                  className={inputClass}
                  value={athlete}
                  onChange={(e) => {
                    setAthlete(e.target.value);
                    setChecked(false);
                  }}
                >
                  <option value="">Create a new private athlete record after review</option>
                  {candidates.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · #{c.id} · {c.club || c.country || "No club/location"}
                      {c.managed ? " · claimed" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-muted">
                A name is a suggestion, not proof. If a candidate already exists, select the correct
                athlete. Creating a record does not create or claim a user account.
              </p>
              {candidates.isError && <p role="alert">Athlete suggestions could not be loaded.</p>}
            </>
          )}
          <label className="flex flex-col text-sm">
            Identity and source evidence checked
            <textarea
              className={inputClass}
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record why this is the correct athlete, the source row/bib and any correction reason"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>
              I inspected the source row and checked the athlete, edition, distance, status, times
              and supplied positions.
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={
                review.isPending || detail.isFetching || note.trim().length < 12 || !checked
              }
              onClick={() => review.mutate("link")}
            >
              Link reviewed result
            </Button>
            {data.currentResult && (
              <Button
                variant="secondary"
                disabled={
                  review.isPending || detail.isFetching || note.trim().length < 12 || !checked
                }
                onClick={() => review.mutate("correct")}
              >
                Apply reviewed correction
              </Button>
            )}
            <Button
              variant="secondary"
              disabled={review.isPending || note.trim().length < 12}
              onClick={() => review.mutate(data.entry.state === "held" ? "reopen" : "hold")}
            >
              {data.entry.state === "held" ? "Reopen" : "Hold for review"}
            </Button>
          </div>
          {review.isError && (
            <p role="alert" className="text-red-700">
              {review.error.message}
            </p>
          )}
          {review.isSuccess && (
            <p role="status">
              Decision saved. Existing publication and account ownership settings are retained.
            </p>
          )}
          <details>
            <summary className="cursor-pointer">
              Source revisions and decisions (latest 25 each)
            </summary>
            <details className="my-2">
              <summary>Original source cells, current revision</summary>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs">
                {JSON.stringify(data.entry.payload.original, null, 2)}
              </pre>
            </details>
            {data.revisions.map((r) => (
              <details className="my-2" key={r.revision}>
                <summary>
                  Revision {r.revision} · {r.created}
                </summary>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs">
                  {JSON.stringify(r.payload, null, 2)}
                </pre>
              </details>
            ))}
            {data.decisions.map((d, i) => (
              <p className="text-sm" key={i}>
                {d.created} · {d.action}: {d.note}
              </p>
            ))}
          </details>
        </>
      )}
    </div>
  );
}
