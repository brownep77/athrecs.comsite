import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Globe2,
  Pause,
  Play,
  Search,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLLECTOR_COUNTRIES, safeUrl, planScope, type Scope } from "@/lib/race-collector/core";
import {
  getCollector,
  startCollector,
  controlCollector,
  stageCollector,
  exportCollector,
} from "@/lib/race-collector/api";
export const Route = createFileRoute("/admin/race-collector")({
  head: () => ({
    meta: [
      { title: "Worldwide race collector · RunRecs" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: CollectorPage,
});
const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-emerald-500";
function CollectorPage() {
  const client = useQueryClient();
  const [scope, setScope] = useState<Scope>({
    countries: COLLECTOR_COUNTRIES.map((c) => c.code),
    dateFrom: "2027-01-01",
    dateTo: "2028-12-31",
    min: 0,
    max: 500,
    unit: "mi",
  });
  const [search, setSearch] = useState("");
  const [runId, setRunId] = useState<string>();
  const [selected, setSelected] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState("");
  const query = useQuery({
    queryKey: ["race-collector", runId],
    queryFn: () => getCollector({ data: { id: runId } }),
    refetchInterval: 15000,
  });
  const data = query.data;
  const run = data?.run;
  const active = run && ["running", "paused"].includes(run.status);
  const ready = data?.readiness;
  const configured = ready?.persistent && ready.research && ready.background;
  const plan = useMemo(() => {
    try {
      return { jobs: planScope(scope).length, error: "" };
    } catch (e) {
      return { jobs: 0, error: e instanceof Error ? e.message : "Invalid settings" };
    }
  }, [scope]);
  const refresh = () => client.invalidateQueries({ queryKey: ["race-collector"] });
  const fail = (error: unknown) =>
    setMessage(error instanceof Error ? error.message : "Something went wrong. Please retry.");
  const start = useMutation({
    mutationFn: () => startCollector({ data: scope }),
    onSuccess: (r) => {
      setRunId(r.id);
      setSelected([]);
      setReviewed(false);
      setMessage(
        r.reused
          ? "Opened the existing active scan."
          : "Scan started. Progress is saved as each window finishes.",
      );
      void refresh();
    },
    onError: fail,
  });
  const control = useMutation({
    mutationFn: (action: "pause" | "resume" | "retry" | "cancel") =>
      controlCollector({ data: { id: run!.id, action } }),
    onSuccess: () => {
      void refresh();
    },
    onError: fail,
  });
  const stage = useMutation({
    mutationFn: () => stageCollector({ data: { ids: selected, sourcesReviewed: reviewed } }),
    onSuccess: (r) => {
      setMessage(`Selected listings staged for validation. Batch ${r.batchId}`);
      setSelected([]);
      setReviewed(false);
      void refresh();
    },
    onError: fail,
  });
  const download = async () => {
    try {
      const result = await exportCollector({ data: { id: run!.id } });
      const url = URL.createObjectURL(new Blob([result], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `runrecs-scan-${run!.id}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      fail(e);
    }
  };
  const completed =
    data?.jobs.filter((j) => j.status === "complete").reduce((n, j) => n + j.count, 0) ?? 0;
  const failed =
    data?.jobs.filter((j) => j.status === "failed").reduce((n, j) => n + j.count, 0) ?? 0;
  const count = (state: string) => data?.counts.find((c) => c.status === state)?.count ?? 0;
  const countryRows = COLLECTOR_COUNTRIES.filter(
    (c) =>
      (!run || run.scope.countries.includes(c.code)) &&
      c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const gaps = data && "gaps" in data ? (data.gaps ?? []) : [];
  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted">
        <ArrowLeft size={15} /> Staff tools
      </Link>
      <header className="relative overflow-hidden rounded-2xl bg-slate-950 p-7 text-white md:p-10">
        <div
          className="absolute -right-16 -top-20 h-80 w-80 rounded-full border border-emerald-400/20"
          aria-hidden="true"
        />
        <div
          className="absolute -right-6 -top-10 h-60 w-60 rounded-full border border-emerald-400/20"
          aria-hidden="true"
        />
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.2em] text-emerald-300">
          RunRecs / Collection console
        </p>
        <h1 className="relative max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
          The world’s start lines.
          <br />
          <span className="text-emerald-300">One place to collect them.</span>
        </h1>
        <p className="relative mt-4 max-w-xl text-sm leading-6 text-slate-300">
          Search country by country, check every distance and revisit the gaps. Review sourced
          additions before they reach the calendar.
        </p>
        <div className="relative mt-7 flex flex-wrap gap-5 text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <Globe2 size={16} />
            {COLLECTOR_COUNTRIES.length} countries & territories
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} />
            Global duplicate checks
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            Saved progress
          </span>
        </div>
      </header>
      {query.isError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          {query.error.message}{" "}
          <Button variant="secondary" size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      )}
      {message && (
        <p
          role="status"
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950"
        >
          {message}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="space-y-5 rounded-2xl border border-border bg-surface p-6">
          <div>
            <h2 className="text-lg font-semibold text-fg">Start a collection</h2>
            <p className="mt-1 text-sm text-muted">Your UK and Ireland workflow, worldwide.</p>
          </div>
          <fieldset
            disabled={Boolean(active) || start.isPending}
            className="space-y-5 disabled:opacity-60"
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs font-medium text-muted">
                From
                <input
                  className={inputClass}
                  aria-label="Start date"
                  type="date"
                  value={scope.dateFrom}
                  onChange={(e) => setScope({ ...scope, dateFrom: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-muted">
                Through
                <input
                  className={inputClass}
                  aria-label="End date"
                  type="date"
                  value={scope.dateTo}
                  onChange={(e) => setScope({ ...scope, dateTo: e.target.value })}
                />
              </label>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Distance range</span>
                <select
                  aria-label="Distance unit"
                  className="rounded border border-border bg-surface p-1 text-xs"
                  value={scope.unit}
                  onChange={(e) => {
                    const unit = e.target.value as "mi" | "km";
                    const factor = unit === "km" ? 1.609344 : 1 / 1.609344;
                    setScope({
                      ...scope,
                      unit,
                      min: Number((scope.min * factor).toFixed(6)),
                      max: Number((scope.max * factor).toFixed(6)),
                    });
                  }}
                >
                  <option value="mi">Miles</option>
                  <option value="km">Kilometres</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  aria-label="Minimum distance"
                  className={inputClass}
                  type="number"
                  min="0"
                  step="any"
                  value={scope.min}
                  onChange={(e) => setScope({ ...scope, min: Number(e.target.value) })}
                />
                <input
                  aria-label="Maximum distance"
                  className={inputClass}
                  type="number"
                  min="0"
                  step="any"
                  value={scope.max}
                  onChange={(e) => setScope({ ...scope, max: Number(e.target.value) })}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                Includes miles and kilometres in every scan.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted" htmlFor="country-mode">
                Countries
              </label>
              <select
                id="country-mode"
                className={`${inputClass} mt-2`}
                value={scope.countries.length === COLLECTOR_COUNTRIES.length ? "all" : "selected"}
                onChange={(e) =>
                  setScope({
                    ...scope,
                    countries:
                      e.target.value === "all"
                        ? COLLECTOR_COUNTRIES.map((c) => c.code)
                        : ["GB", "IE"],
                  })
                }
              >
                <option value="all">Worldwide · all countries & territories</option>
                <option value="selected">Choose countries</option>
              </select>
              {scope.countries.length !== COLLECTOR_COUNTRIES.length && (
                <select
                  aria-label="Selected countries"
                  multiple
                  size={6}
                  className={`${inputClass} mt-2`}
                  value={scope.countries}
                  onChange={(e) =>
                    setScope({
                      ...scope,
                      countries: [...e.target.selectedOptions].map((o) => o.value),
                    })
                  }
                >
                  {COLLECTOR_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </fieldset>
          <div className="rounded-xl bg-muted/5 p-4 text-xs leading-5 text-muted">
            <strong className="block text-fg">{plan.jobs.toLocaleString()} research windows</strong>
            Two passes, split by calendar quarter. API usage is charged by your research provider.
            Large scans can take several days.
          </div>
          {plan.error && (
            <p className="text-xs text-red-700" role="alert">
              {plan.error}
            </p>
          )}
          <Button
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={!configured || Boolean(active) || start.isPending || Boolean(plan.error)}
            onClick={() => start.mutate()}
          >
            <Play size={16} />
            {start.isPending ? "Starting…" : active ? "Scan in progress" : "Run collector"}
          </Button>
          {ready && !configured && (
            <p className="text-xs leading-5 text-amber-700">
              Setup needed:{" "}
              {[
                !ready.persistent && "persistent database",
                !ready.research && "research connection",
                !ready.background && "background worker",
              ]
                .filter(Boolean)
                .join(", ")}
              . Starting is disabled until these are connected.
            </p>
          )}
          <p className="text-xs leading-5 text-muted">
            Northern Ireland is covered within the UK scan. Cross-border races use their start
            country. Parkrun remains separate.
          </p>
        </section>
        <section className="min-w-0 space-y-5 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Collection progress</p>
              <h2 className="mt-1 text-xl font-semibold text-fg">
                {run
                  ? run.status === "complete"
                    ? "Scan finished"
                    : run.status === "paused"
                      ? "Scan paused"
                      : run.status === "cancelled"
                        ? "Scan cancelled"
                        : "Finding the next start line"
                  : "Ready when you are"}
              </h2>
            </div>
            {run && (
              <Button variant="secondary" size="sm" onClick={() => void download()}>
                <Download size={14} />
                Report
              </Button>
            )}
          </div>
          {data && data.runs.length > 0 && (
            <select
              aria-label="Scan history"
              className={inputClass}
              value={run?.id ?? ""}
              onChange={(e) => {
                setRunId(e.target.value);
                setSelected([]);
                setReviewed(false);
              }}
            >
              {data.runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {new Date(r.created_at).toLocaleString()} · {r.scope.countries.length} countries ·{" "}
                  {r.status}
                </option>
              ))}
            </select>
          )}
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Awaiting review", count("review")],
              ["Already listed", count("duplicate")],
              ["Held / uncertain", count("held")],
            ].map(([label, n]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-semibold text-slate-950">{n}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          {run ? (
            <>
              <div className="flex justify-between text-xs text-muted">
                <span>
                  {completed.toLocaleString()} of {run.total_jobs.toLocaleString()} windows searched
                </span>
                <span>
                  {failed > 0
                    ? `${failed} failed`
                    : `${Math.floor((completed / run.total_jobs) * 100)}%`}
                </span>
              </div>
              <progress
                aria-label="Completed research windows"
                className="h-2 w-full accent-emerald-600"
                max={run.total_jobs}
                value={completed}
              />
              <p className="text-xs text-muted">
                {run.scope.dateFrom} — {run.scope.dateTo} · {run.scope.min}–{run.scope.max}{" "}
                {run.scope.unit}. Search completion does not mean every race is announced or
                verified.
              </p>
              {run.error && (
                <p role="alert" className="text-sm text-amber-700">
                  {run.error}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {active && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={control.isPending}
                    onClick={() => control.mutate(run.status === "paused" ? "resume" : "pause")}
                  >
                    {run.status === "paused" ? <Play size={14} /> : <Pause size={14} />}{" "}
                    {run.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                )}
                {failed > 0 && run.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => control.mutate("retry")}
                    disabled={control.isPending}
                  >
                    <RotateCcw size={14} />
                    Retry failed
                  </Button>
                )}
                {active && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => control.mutate("cancel")}
                    disabled={control.isPending}
                  >
                    Stop scan
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm leading-6 text-muted">
              Choose a scope and start once. The collector saves each window, works through a second
              pass, and keeps uncertain dates out of publication. You can close this page while it
              runs.
            </div>
          )}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-muted" />
            <input
              aria-label="Find a country"
              className={`${inputClass} pl-9`}
              placeholder="Find a country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-72 overflow-auto divide-y divide-border">
            {countryRows.map((c) => {
              const jobs = data?.jobs.filter((j) => j.country === c.code) ?? [];
              const total = jobs.reduce((n, j) => n + j.count, 0);
              const done = jobs.find((j) => j.status === "complete")?.count ?? 0;
              const running = jobs.some((j) => j.status === "running");
              return (
                <div key={c.code} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="w-7 text-xs font-semibold text-muted">{c.code}</span>
                    <span className="text-fg">{c.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {running ? "Searching…" : total ? `${done}/${total} windows` : "Not started"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      {run && (
        <section className="space-y-5 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg">Review the source, then stage</h2>
              <p className="mt-1 text-sm text-muted">
                Check the actual date, distance and venue on each primary programme. Showing up to
                200 rows; the report includes everything.
              </p>
            </div>
            <Link
              to="/admin/catalogue-publishing"
              className="flex items-center gap-1 text-sm font-medium text-emerald-700"
            >
              Publication review <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="p-3">Select</th>
                  <th className="p-3">Race / source</th>
                  <th className="p-3">Date · distance</th>
                  <th className="p-3">Decision</th>
                </tr>
              </thead>
              <tbody>
                {data?.candidates.map((row) => (
                  <tr key={row.id} className="border-b border-border align-top">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        aria-label={`Review ${row.candidate.name} ${row.candidate.distanceLabel}`}
                        disabled={
                          row.status !== "review" ||
                          (!selected.includes(row.id) && selected.length >= 50)
                        }
                        checked={selected.includes(row.id)}
                        onChange={(e) => {
                          setSelected(
                            e.target.checked
                              ? [...selected, row.id]
                              : selected.filter((id) => id !== row.id),
                          );
                          setReviewed(false);
                        }}
                      />
                    </td>
                    <td className="max-w-lg p-3">
                      <p className="font-medium text-fg">{row.candidate.name}</p>
                      <p className="text-xs text-muted">
                        {row.candidate.city}, {row.candidate.country}
                      </p>
                      <a
                        href={
                          safeUrl(row.candidate.sourceUrl) ? row.candidate.sourceUrl : undefined
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700"
                      >
                        Primary programme <ArrowUpRight size={12} />
                      </a>
                      <p className="mt-2 text-xs leading-5 text-muted">{row.candidate.evidence}</p>
                    </td>
                    <td className="whitespace-nowrap p-3 text-fg">
                      {row.candidate.date}
                      <p className="mt-1 text-xs text-muted">
                        {row.candidate.distanceLabel} · {row.candidate.distanceKm.toFixed(2)} km
                      </p>
                    </td>
                    <td className="max-w-xs p-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {row.status === "review" ? "Source review" : row.status}
                      </span>
                      <p className="mt-2 text-xs leading-5 text-muted">{row.reason}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.candidates.length && (
              <p className="py-8 text-center text-sm text-muted">
                Findings will appear here as research windows finish.
              </p>
            )}
          </div>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              className="mt-1"
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            I checked the linked primary programmes and confirm the selected race dates, distances
            and venues.
          </label>
          <Button
            disabled={!selected.length || !reviewed || stage.isPending}
            onClick={() => stage.mutate()}
          >
            <ShieldCheck size={16} />
            {stage.isPending ? "Staging…" : `Stage ${selected.length} reviewed listings`}
          </Button>
        </section>
      )}
      {run && (
        <details className="rounded-2xl border border-border bg-surface p-6">
          <summary className="cursor-pointer text-sm font-semibold text-fg">
            Source coverage & gaps ({gaps.length} recent window reports)
          </summary>
          <p className="mt-3 text-xs text-muted">
            Unannounced dates, inaccessible sources and capped searches stay visible here. A
            completed search is not an exhaustive country calendar.
          </p>
          <div className="mt-4 max-h-96 space-y-4 overflow-auto">
            {gaps.map((g, i) => (
              <article key={i} className="border-t border-border pt-3 text-xs text-muted">
                <strong className="text-fg">
                  {g.window.country} · {g.window.dateFrom} — {g.window.dateTo} · pass{" "}
                  {g.window.pass}
                </strong>
                {g.error && <p className="mt-2 text-amber-700">{g.error}</p>}
                {g.report?.capped && (
                  <p className="mt-2 text-amber-700">
                    Candidate limit reached; further research needed.
                  </p>
                )}
                {g.report?.gaps.map((gap, n) => (
                  <p key={n} className="mt-2">
                    {gap}
                  </p>
                ))}
                <p className="mt-2">
                  {g.report?.sources.length ?? 0} sources recorded in the downloadable report.
                </p>
              </article>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
