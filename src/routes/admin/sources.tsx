import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Search } from "lucide-react";
import { listFixtureSources } from "@/lib/athrecs/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/sources")({
  component: AdminSourcesPage,
});

type SourceStatus = "all" | "runnable" | "held";

const ALL = "All";

function optionValues(values: string[]) {
  return [ALL, ...new Set(values.filter(Boolean))].sort((a, b) =>
    a === ALL ? -1 : b === ALL ? 1 : a.localeCompare(b),
  );
}

function AdminSourcesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SourceStatus>("held");
  const [region, setRegion] = useState(ALL);
  const [country, setCountry] = useState(ALL);

  const registry = useQuery({
    queryKey: ["admin-fixture-sources"],
    queryFn: () => listFixtureSources(),
  });

  const sources = useMemo(() => registry.data?.sources ?? [], [registry.data?.sources]);
  const regions = useMemo(
    () => optionValues(sources.map((source) => source.region_scope)),
    [sources],
  );
  const countries = useMemo(
    () =>
      optionValues(
        sources.flatMap((source) =>
          source.country_focus
            .split("|")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ),
    [sources],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sources.filter((source) => {
      if (status === "runnable" && source.queue_status !== "queued") return false;
      if (status === "held" && source.queue_status !== "blocked") return false;
      if (region !== ALL && source.region_scope !== region) return false;
      if (
        country !== ALL &&
        !source.country_focus
          .split("|")
          .map((value) => value.trim())
          .includes(country)
      ) {
        return false;
      }
      if (!needle) return true;
      return [
        source.source_name,
        source.source_id,
        source.country_focus,
        source.region_scope,
        source.source_section,
        source.rights_status,
        source.block_reason ?? "",
        source.notes,
      ].some((value) => value.toLowerCase().includes(needle));
    });
  }, [country, query, region, sources, status]);

  const summary = registry.data?.registry;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">
            Source administration
          </p>
          <h1 className="font-display text-2xl font-semibold text-fg md:text-3xl">
            Fixture and result sources
          </h1>
          <p className="max-w-3xl text-sm text-muted">
            Inspect every registered website, see why a source is held and narrow the review queue
            by country or region. Held sources cannot run or publish until their rights and
            technical checks are completed.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to admin
          </Link>
        </Button>
      </div>

      {registry.isLoading && <p className="text-sm text-muted">Loading source registry…</p>}
      {registry.isError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          The source registry could not be loaded. Refresh the page to try again.
        </p>
      )}

      {summary && (
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setStatus("all")}
            className={`rounded-xl border p-4 text-left shadow-card transition-colors ${
              status === "all"
                ? "border-accent bg-accent-soft"
                : "border-border bg-surface hover:border-border-strong"
            }`}
          >
            <span className="text-xs uppercase tracking-wide text-subtle">All registered</span>
            <span className="mt-1 block text-2xl font-semibold tabular text-fg">
              {summary.sources.toLocaleString()}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatus("runnable")}
            className={`rounded-xl border p-4 text-left shadow-card transition-colors ${
              status === "runnable"
                ? "border-emerald-500 bg-emerald-50"
                : "border-emerald-500/30 bg-surface hover:border-emerald-500"
            }`}
          >
            <span className="text-xs uppercase tracking-wide text-emerald-800">Runnable now</span>
            <span className="mt-1 block text-2xl font-semibold tabular text-emerald-950">
              {summary.runnable.toLocaleString()}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatus("held")}
            className={`rounded-xl border p-4 text-left shadow-card transition-colors ${
              status === "held"
                ? "border-amber-500 bg-amber-50"
                : "border-amber-500/30 bg-surface hover:border-amber-500"
            }`}
          >
            <span className="text-xs uppercase tracking-wide text-amber-800">Held for review</span>
            <span className="mt-1 block text-2xl font-semibold tabular text-amber-950">
              {summary.blocked.toLocaleString()}
            </span>
          </button>
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_14rem_14rem_auto]">
          <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Search sources
            <span className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, reason, country…"
                className="h-11 w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
              />
            </span>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Region
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              {regions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Country
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              {countries.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full lg:w-auto"
              onClick={() => {
                setQuery("");
                setRegion(ALL);
                setCountry(ALL);
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-medium text-fg">
            {filtered.length.toLocaleString()} source{filtered.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-subtle">
            A held source stays blocked until its registry approval is independently reviewed.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[72rem] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Country / region</th>
                <th className="px-3 py-2 font-medium">Coverage</th>
                <th className="px-3 py-2 font-medium">Review reason</th>
                <th className="px-3 py-2 font-medium">Limits</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((source) => (
                <tr key={source.source_id} className="border-t border-border align-top">
                  <td className="max-w-xs px-3 py-3">
                    <a
                      href={source.start_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-fg no-underline hover:text-accent"
                    >
                      {source.source_name}
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="mt-1 break-all text-xs text-subtle">{source.source_id}</p>
                    <p className="mt-1 text-xs text-muted">{source.source_section}</p>
                  </td>
                  <td className="px-3 py-3">
                    {source.queue_status === "queued" ? (
                      <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-900">
                        Runnable
                      </Badge>
                    ) : (
                      <Badge className="border-amber-500/30 bg-amber-50 text-amber-900">Held</Badge>
                    )}
                  </td>
                  <td className="max-w-xs px-3 py-3 text-muted">
                    <p className="text-fg">{source.country_focus}</p>
                    <p className="mt-1 text-xs">{source.region_scope}</p>
                  </td>
                  <td className="max-w-xs px-3 py-3 text-muted">
                    <p>{source.coverage_scope}</p>
                    <p className="mt-1 text-xs">
                      {source.surface_scope} · {source.timing_scope}
                    </p>
                  </td>
                  <td className="max-w-md px-3 py-3">
                    <p className="font-medium text-fg">
                      {source.block_reason ?? source.rights_status}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{source.notes}</p>
                    {source.permission_url && (
                      <a
                        href={source.permission_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent no-underline hover:underline"
                      >
                        Published crawl information
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">
                    <p>{source.max_pages.toLocaleString()} page maximum</p>
                    <p className="mt-1">{source.rate_limit_seconds}s request spacing</p>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                    No sources match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
