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
import {
  COLLECTOR_COUNTRIES,
  safeUrl,
  planScope,
  selectedRegions,
  type Scope,
} from "@/lib/race-collector/core";
import { collectionRegion, collectionRegions } from "@/lib/race-collector/regions";
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
const datePresets = [
  { value: "2027-2028", label: "All of 2027 and 2028", from: "2027-01-01", to: "2028-12-31" },
  { value: "2027", label: "2027 only", from: "2027-01-01", to: "2027-12-31" },
  { value: "2028", label: "2028 only", from: "2028-01-01", to: "2028-12-31" },
];
function CollectorPage() {
  const client = useQueryClient();
  const [scope, setScope] = useState<Scope>({
    countries: COLLECTOR_COUNTRIES.map((c) => c.code),
    dateFrom: "2027-01-01",
    dateTo: "2028-12-31",
    min: 0,
    max: 500,
    unit: "mi",
    regional: true,
  });
  const [areaChoice, setAreaChoice] = useState("worldwide");
  const [dateChoice, setDateChoice] = useState("2027-2028");
  const [countrySearch, setCountrySearch] = useState("");
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
          : "Scan started. You can close this page; your progress is saved.",
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
    onSuccess: () => {
      setMessage("Selected races sent to publication review.");
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
  const progressScope = run?.scope ?? scope;
  const chooseCountries = (countries: string[]) =>
    setScope((current) => ({
      ...current,
      countries,
      regions: Object.fromEntries(
        Object.entries(current.regions ?? {}).filter(([c]) => countries.includes(c)),
      ),
    }));
  const regionalCountries = COLLECTOR_COUNTRIES.filter(
    (c) => scope.countries.includes(c.code) && collectionRegions(c.code).length,
  );
  const countryRows = COLLECTOR_COUNTRIES.filter(
    (c) =>
      progressScope.countries.includes(c.code) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        selectedRegions(progressScope, c.code).some((r) =>
          r.name.toLowerCase().includes(search.toLowerCase()),
        )),
  );
  const gaps = data && "gaps" in data ? (data.gaps ?? []) : [];
  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted">
        <ArrowLeft size={15} /> Staff tools
      </Link>
      <header className="rounded-2xl bg-slate-950 p-6 text-white md:p-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">RunRecs</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Find races</h1>
        <p className="mt-2 text-sm text-slate-300">
          Choose where and when. We’ll search, check for duplicates and save your progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <Globe2 size={15} />
            {COLLECTOR_COUNTRIES.length} countries & territories
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            Duplicate checks included
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            Miles and kilometres
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
          <h2 className="text-lg font-semibold text-fg">Start a scan</h2>
          <fieldset
            disabled={Boolean(active) || start.isPending}
            className="space-y-5 disabled:opacity-60"
          >
            <div>
              <label htmlFor="search-area" className="text-sm font-medium text-fg">
                Where?
              </label>
              <select
                id="search-area"
                className={`${inputClass} mt-2`}
                value={areaChoice}
                onChange={(e) => {
                  const choice = e.target.value;
                  setAreaChoice(choice);
                  setCountrySearch("");
                  setScope((current) => ({
                    ...current,
                    regions: {},
                    countries:
                      choice === "worldwide"
                        ? COLLECTOR_COUNTRIES.map((c) => c.code)
                        : choice === "uk-ie" || choice === "several"
                          ? ["GB", "IE"]
                          : [choice],
                  }));
                }}
              >
                <option value="worldwide">Worldwide — all countries</option>
                <option value="uk-ie">United Kingdom and Ireland</option>
                <option value="several">Choose several countries…</option>
                <optgroup label="One country or territory">
                  {COLLECTOR_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              {areaChoice === "several" && (
                <div className="mt-3 space-y-2">
                  <input
                    aria-label="Search countries to select"
                    placeholder="Search countries…"
                    className={inputClass}
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                  />
                  <p className="text-xs text-muted">
                    {scope.countries.length} selected ·{" "}
                    {scope.countries
                      .map((code) => COLLECTOR_COUNTRIES.find((c) => c.code === code)?.name)
                      .join(", ") || "Choose at least one"}
                  </p>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                    {COLLECTOR_COUNTRIES.filter((c) =>
                      c.name.toLowerCase().includes(countrySearch.toLowerCase()),
                    ).map((c) => (
                      <label key={c.code} className="flex items-center gap-2 text-sm text-fg">
                        <input
                          type="checkbox"
                          aria-label={`Select ${c.name}`}
                          checked={scope.countries.includes(c.code)}
                          onChange={(e) =>
                            chooseCountries(
                              e.target.checked
                                ? [...scope.countries, c.code]
                                : scope.countries.filter((code) => code !== c.code),
                            )
                          }
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="search-period" className="text-sm font-medium text-fg">
                When?
              </label>
              <select
                id="search-period"
                className={`${inputClass} mt-2`}
                value={dateChoice}
                onChange={(e) => {
                  setDateChoice(e.target.value);
                  const preset = datePresets.find((p) => p.value === e.target.value);
                  if (preset)
                    setScope((current) => ({
                      ...current,
                      dateFrom: preset.from,
                      dateTo: preset.to,
                    }));
                }}
              >
                {datePresets.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
                <option value="custom">Choose dates…</option>
              </select>
              {dateChoice === "custom" && (
                <div className="mt-3 grid grid-cols-2 gap-3">
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
              )}
            </div>
          </fieldset>
          <div className="space-y-1 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950">
            <p className="font-medium">
              {scope.min}–{scope.max} {scope.unit === "mi" ? "miles" : "km"} · includes kilometre
              and mile races
            </p>
            <p className="text-xs">
              {scope.regional
                ? "Large countries are searched state by state automatically."
                : "Countries are searched nationally."}
            </p>
            {Object.entries(scope.regions ?? {}).some(
              ([country, codes]) => codes.length < collectionRegions(country).length,
            ) && (
              <p className="text-xs font-medium">
                Some states/regions are selected — see More options.
              </p>
            )}
            <p className="text-xs">Duplicates checked. New findings wait for source review.</p>
          </div>
          {plan.error && (
            <p className="text-xs text-red-700" role="alert">
              {plan.error}
            </p>
          )}
          <Button
            className="w-full bg-emerald-600 py-6 text-base text-white hover:bg-emerald-700"
            disabled={!configured || Boolean(active) || start.isPending || Boolean(plan.error)}
            onClick={() => start.mutate()}
          >
            <Play size={18} />
            {start.isPending ? "Starting…" : active ? "Scan in progress" : "Start scan"}
          </Button>
          <p className="text-xs leading-5 text-muted">
            You can close this page after starting. Large scans can take several days. Research
            usage is billed by your provider.
          </p>
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
          <button
            type="button"
            className="text-sm font-medium text-emerald-700 underline underline-offset-4 disabled:opacity-50"
            disabled={Boolean(active) || start.isPending}
            onClick={() => {
              setScope({
                countries: ["IE"],
                dateFrom: "2027-01-01",
                dateTo: "2027-03-31",
                min: 0,
                max: 500,
                unit: "mi",
                regional: true,
              });
              setAreaChoice("IE");
              setDateChoice("custom");
              setCountrySearch("");
              setMessage(
                "Test settings filled in. Check where and when, then press Start scan when ready.",
              );
            }}
          >
            Use a small Ireland test
          </button>
          <details className="border-t border-border pt-4">
            <summary className="cursor-pointer text-sm font-medium text-fg">More options</summary>
            <fieldset
              disabled={Boolean(active) || start.isPending}
              className="mt-4 space-y-5 disabled:opacity-60"
            >
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
              <div className="space-y-3 border-t border-border pt-4">
                <label className="flex items-start gap-2 text-sm font-medium text-fg">
                  <input
                    type="checkbox"
                    className="mt-1 accent-emerald-600"
                    checked={scope.regional === true}
                    onChange={(e) =>
                      setScope({ ...scope, regional: e.target.checked, regions: {} })
                    }
                  />
                  Split large countries into states and regions
                </label>
                <p className="text-xs leading-5 text-muted">
                  Separate searches and progress for the USA, Canada, Australia, India, China,
                  Russia, Brazil and Mexico. Other countries use national searches.
                </p>
                {scope.regional &&
                  regionalCountries.map((c) => {
                    const regions = collectionRegions(c.code);
                    const chosen = selectedRegions(scope, c.code).map((r) => r.code);
                    return (
                      <details key={c.code} className="rounded-lg border border-border p-3">
                        <summary className="cursor-pointer text-xs font-medium text-fg">
                          {c.name} · {chosen.length}/{regions.length} regions
                        </summary>
                        <div className="my-2 flex gap-3">
                          <button
                            type="button"
                            className="text-xs text-emerald-700"
                            onClick={() =>
                              setScope((current) => ({
                                ...current,
                                regions: {
                                  ...current.regions,
                                  [c.code]: regions.map((r) => r.code),
                                },
                              }))
                            }
                          >
                            Select all {c.name} regions
                          </button>
                          <button
                            type="button"
                            className="text-xs text-muted"
                            onClick={() =>
                              setScope((current) => ({
                                ...current,
                                regions: { ...current.regions, [c.code]: [] },
                              }))
                            }
                          >
                            Clear {c.name} regions
                          </button>
                        </div>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {regions.map((r) => (
                            <label
                              key={r.code}
                              className="flex items-center gap-2 text-xs text-muted"
                            >
                              <input
                                type="checkbox"
                                checked={chosen.includes(r.code)}
                                aria-label={`${c.name}: ${r.name}`}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setScope((current) => {
                                    const codes = selectedRegions(current, c.code).map(
                                      (region) => region.code,
                                    );
                                    return {
                                      ...current,
                                      regions: {
                                        ...current.regions,
                                        [c.code]: checked
                                          ? [...codes, r.code]
                                          : codes.filter((code) => code !== r.code),
                                      },
                                    };
                                  });
                                }}
                              />
                              {r.name}
                            </label>
                          ))}
                        </div>
                      </details>
                    );
                  })}
              </div>
            </fieldset>
            <p className="mt-4 text-xs leading-5 text-muted">
              {plan.jobs.toLocaleString()} searches planned, including a second pass for missed
              races. Northern Ireland is within the UK. Cross-border races use their start location.
              Parkrun remains separate.
            </p>
          </details>
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
                        : "Searching for races"
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
                  {r.scope.regional ? "by region" : "national"} · {r.status}
                </option>
              ))}
            </select>
          )}
          {run && (
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
          )}
          {run ? (
            <>
              <div className="flex justify-between text-xs text-muted">
                <span>
                  {completed.toLocaleString()} of {run.total_jobs.toLocaleString()} searches
                  completed
                </span>
                <span>
                  {failed > 0
                    ? `${failed} failed`
                    : `${Math.floor((completed / run.total_jobs) * 100)}%`}
                </span>
              </div>
              <progress
                aria-label="Completed searches"
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
              Press Start scan to begin. We’ll search your chosen locations, check for duplicates
              and look again for missed races. New findings will appear here for source review.
            </div>
          )}
          {run && (
            <details className="border-t border-border pt-4">
              <summary className="mb-3 cursor-pointer text-sm font-medium text-fg">
                Country and state progress
              </summary>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-muted" />
                <input
                  aria-label="Find a country or region"
                  className={`${inputClass} pl-9`}
                  placeholder="Find a country or region…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="max-h-72 overflow-auto divide-y divide-border">
                {countryRows.map((c) => {
                  const jobs = data?.jobs.filter((j) => j.country === c.code) ?? [];
                  const total = jobs.reduce((n, j) => n + j.count, 0);
                  const done = jobs
                    .filter((j) => j.status === "complete")
                    .reduce((n, j) => n + j.count, 0);
                  const running = jobs.some((j) => j.status === "running");
                  const regionCodes = run
                    ? [...new Set(jobs.flatMap((j) => (j.regionCode ? [j.regionCode] : [])))]
                    : selectedRegions(scope, c.code).map((r) => r.code);
                  const summary = (
                    <span className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="flex items-center gap-3">
                        <span className="w-7 text-xs font-semibold text-muted">{c.code}</span>
                        <span className="text-fg">{c.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {running
                          ? "Searching…"
                          : total
                            ? `${done}/${total} searches`
                            : "Not started"}
                      </span>
                    </span>
                  );
                  if (!regionCodes.length) return <div key={c.code}>{summary}</div>;
                  return (
                    <details key={c.code} open={search ? true : undefined}>
                      <summary className="cursor-pointer">{summary}</summary>
                      <div className="mb-3 ml-10 space-y-2 border-l border-border pl-3">
                        {regionCodes.map((code) => {
                          const region = collectionRegion(c.code, code);
                          const rows = jobs.filter((j) => j.regionCode === code);
                          const total = rows.reduce((n, j) => n + j.count, 0);
                          const done = rows
                            .filter((j) => j.status === "complete")
                            .reduce((n, j) => n + j.count, 0);
                          const failed = rows
                            .filter((j) => j.status === "failed")
                            .reduce((n, j) => n + j.count, 0);
                          return (
                            <div
                              key={code}
                              className="flex items-center justify-between gap-3 text-xs text-muted"
                            >
                              <span>{region?.name ?? code}</span>
                              <span className="shrink-0">
                                {rows.some((j) => j.status === "running")
                                  ? "Searching…"
                                  : total
                                    ? `${done}/${total} searches${failed ? ` · ${failed} failed` : ""}`
                                    : "Not started"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          )}
        </section>
      </div>
      {run && (
        <section className="space-y-5 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg">Review new races</h2>
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
                        {[row.candidate.city, row.candidate.region, row.candidate.country]
                          .filter(Boolean)
                          .join(", ")}
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
            {stage.isPending ? "Sending…" : `Send ${selected.length} to publication review`}
          </Button>
        </section>
      )}
      {run && (
        <details className="rounded-2xl border border-border bg-surface p-6">
          <summary className="cursor-pointer text-sm font-semibold text-fg">
            Search notes and gaps ({gaps.length} recent search reports)
          </summary>
          <p className="mt-3 text-xs text-muted">
            Unannounced dates, inaccessible sources and capped searches stay visible here. A
            completed search is not an exhaustive country calendar.
          </p>
          <div className="mt-4 max-h-96 space-y-4 overflow-auto">
            {gaps.map((g, i) => (
              <article key={i} className="border-t border-border pt-3 text-xs text-muted">
                <strong className="text-fg">
                  {g.window.country}
                  {g.window.regionCode
                    ? ` / ${collectionRegion(g.window.country, g.window.regionCode)?.name ?? g.window.regionCode}`
                    : ""}{" "}
                  · {g.window.dateFrom} — {g.window.dateTo} · pass {g.window.pass}
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
