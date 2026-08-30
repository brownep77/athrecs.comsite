import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Network, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSportsRecsNetworkOverview } from "@/lib/athrecs/sportsrecs-network-api";

// The committed route tree is refreshed by the Vite router generator during build.
// @ts-expect-error /admin/network is new until that generated file is refreshed.
export const Route = createFileRoute("/admin/network")({
  head: () => ({
    meta: [
      { title: "SportsRecs network | ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: SportsRecsNetworkPage,
});

function SportsRecsNetworkPage() {
  const [scope, setScope] = useState("all");
  const overview = useQuery({
    queryKey: ["sportsrecs-network-overview"],
    queryFn: () => getSportsRecsNetworkOverview(),
    refetchInterval: 60_000,
  });

  if (overview.isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <RefreshCcw className="size-5 animate-spin text-cyan-700" aria-hidden="true" />
          Building the network migration report…
        </div>
      </div>
    );
  }

  if (overview.isError || !overview.data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-red-600" aria-hidden="true" />
          <div className="space-y-3">
            <h1 className="font-display text-2xl font-semibold">Network overview unavailable</h1>
            <p className="text-sm text-slate-600">
              {overview.error instanceof Error
                ? overview.error.message
                : "The SportsRecs shadow model could not be read."}
            </p>
            <Button type="button" onClick={() => void overview.refetch()}>
              <RefreshCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const { brands, report, safeguards, sports, unclassified } = overview.data;
  const selectedBrand = scope === "all" ? null : brands.find((brand) => brand.code === scope);
  const visibleBrands = selectedBrand ? [selectedBrand] : brands;
  const scopedEvents = selectedBrand?.proposed_event_count ?? report.brand_planned_event_count;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              SportsRecs control centre
            </p>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Read-only foundation
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-950">
            Network architecture and migration coverage
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review proposed classifications before any specialist domain or public URL is
            activated. ATHRECS remains the protected canonical home throughout this phase.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void overview.refetch()}>
          <RefreshCcw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </header>

      <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="grid gap-1 text-sm font-medium text-slate-800">
          Network scope
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="min-h-10 min-w-60 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          >
            <option value="all">All SportsRecs brands</option>
            {brands.map((brand) => (
              <option key={brand.code} value={brand.code}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <div className="text-right text-xs text-slate-500">
          <p>Database: {overview.data.backend === "neon" ? "Neon Postgres" : "PGLite preview"}</p>
          <p>Updated {formatTimestamp(overview.data.generatedAt)}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Proposed events in scope" value={scopedEvents} detail={`${percentage(report.classified_event_count, report.event_count)}% classified`} />
        <Metric label="Shadow event editions" value={report.network_edition_count} detail={`${percentage(report.mapped_competition_count, report.legacy_edition_count)}% competition mapping`} />
        <Metric label="Mapped results" value={report.mapped_result_count} detail={`${percentage(report.mapped_result_count, report.legacy_result_count)}% of legacy results`} />
        <Metric label="Protected ATHRECS URLs" value={report.protected_legacy_publication_count} detail="No URL cutover enabled" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-slate-950">Brands</h2>
          <p className="mt-1 text-sm text-slate-600">
            Provisional domains are planning records, not confirmation of registration or ownership.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Brand</th>
                <th className="px-5 py-3 font-semibold">Domain</th>
                <th className="px-5 py-3 text-right font-semibold">Proposed</th>
                <th className="px-5 py-3 text-right font-semibold">Live now</th>
                <th className="px-5 py-3 font-semibold">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleBrands.map((brand) => (
                <tr key={brand.code}>
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-2">
                      <Network className="mt-0.5 size-4 text-cyan-700" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-slate-900">{brand.name}</p>
                        <p className="mt-0.5 max-w-md text-xs text-slate-500">{brand.purpose}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{brand.primary_domain ?? "Not configured"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {brand.domain_status === "active" ? "Active" : "Provisional — not verified"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums">
                    {formatNumber(brand.proposed_event_count)}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-slate-600">
                    {formatNumber(brand.live_event_count)}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-700">{brand.launch_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-display text-xl font-semibold text-slate-950">Sports taxonomy</h2>
            <p className="mt-1 text-sm text-slate-600">
              Controlled sports and disciplines sit alongside the original free-text value.
            </p>
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Sport</th>
                  <th className="px-5 py-3 text-right font-semibold">Events</th>
                  <th className="px-5 py-3 text-right font-semibold">Disciplines</th>
                  <th className="px-5 py-3 text-right font-semibold">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sports.map((sport) => (
                  <tr key={sport.code}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{sport.name}</p>
                      <p className="mt-0.5 max-w-xl text-xs text-slate-500">{sport.description}</p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatNumber(sport.event_count)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatNumber(sport.discipline_count)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatNumber(sport.reviewed_event_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-700" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-semibold text-emerald-950">Migration safeguards</h2>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-emerald-900">
                  <li>Existing event, edition, athlete and result IDs remain untouched.</li>
                  <li>Specialist-domain publication is disabled.</li>
                  <li>ATHRECS remains the live canonical publication.</li>
                  <li>New editions and competitions remain shadow records.</li>
                </ul>
                <p className="mt-4 text-xs text-emerald-800">
                  Model: {safeguards.competitionModel}; public cutover: {safeguards.publicUrlCutoverEnabled ? "enabled" : "disabled"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-semibold text-amber-950">Still requires approval</h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Brand names, domain ownership, final discipline placement and every public URL
                  migration remain separate guarded decisions.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-slate-950">Unclassified events</h2>
          <p className="mt-1 text-sm text-slate-600">
            These remain on ATHRECS with their original sport label until reviewed.
          </p>
        </div>
        {unclassified.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-600">No unclassified events are currently queued.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {unclassified.map((event) => (
              <div key={event.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[1fr_180px_220px_80px] sm:items-center">
                <p className="font-medium text-slate-900">{event.name}</p>
                <p className="text-sm text-slate-600">{event.legacy_sport}</p>
                <p className="text-sm text-slate-600">{[event.city, event.country].filter(Boolean).join(", ")}</p>
                <p className="text-sm tabular-nums text-slate-600">{Math.round(Number(event.confidence) * 100)}%</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{formatNumber(value)}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function percentage(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 100;
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
