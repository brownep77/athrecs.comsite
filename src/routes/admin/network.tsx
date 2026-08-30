import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Globe2,
  Layers3,
  Network,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSportsRecsNetworkOverview,
  type SportsRecsBrandOverview,
} from "@/lib/athrecs/sportsrecs-network-api";

export const Route = createFileRoute("/admin/network" as never)({
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

  const visibleBrands = useMemo(() => {
    const brands = overview.data?.brands ?? [];
    return scope === "all" ? brands : brands.filter((brand) => brand.code === scope);
  }, [overview.data?.brands, scope]);

  const selectedBrand =
    scope === "all" ? null : overview.data?.brands.find((brand) => brand.code === scope) ?? null;

  if (overview.isLoading) {
    return <LoadingState />;
  }

  if (overview.isError || !overview.data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-red-600" aria-hidden="true" />
          <div className="space-y-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">Network overview unavailable</h1>
              <p className="mt-1 text-sm text-slate-600">
                {overview.error instanceof Error
                  ? overview.error.message
                  : "The SportsRecs shadow model could not be read."}
              </p>
            </div>
            <Button type="button" onClick={() => void overview.refetch()}>
              <RefreshCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const { report, safeguards } = overview.data;
  const eventCoverage = percentage(report.classified_event_count, report.event_count);
  const competitionCoverage = percentage(
    report.mapped_competition_count,
    report.legacy_edition_count,
  );
  const resultCoverage = percentage(report.mapped_result_count, report.legacy_result_count);
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
            Review proposed sport and brand classifications before any specialist domain or public
            URL is activated. ATHRECS remains the protected canonical home throughout this phase.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void overview.refetch()}>
          <RefreshCcw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="grid gap-1 text-sm font-medium text-slate-800">
            Network scope
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              className="min-h-10 min-w-60 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            >
              <option value="all">All SportsRecs brands</option>
              {overview.data.brands.map((brand) => (
                <option key={brand.code} value={brand.code}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
          <div className="text-right text-xs text-slate-500">
            <p>
              Database: {overview.data.backend === "neon" ? "Neon Postgres" : "PGLite preview"}
            </p>
            <p>Updated {formatTimestamp(overview.data.generatedAt)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Globe2}
          label={selectedBrand ? `${selectedBrand.name} proposed events` : "Events assigned to a brand"}
          value={scopedEvents}
          detail={`${eventCoverage}% of all events classified`}
        />
        <MetricCard
          icon={Layers3}
          label="Shadow event editions"
          value={report.network_edition_count}
          detail={`${competitionCoverage}% legacy edition mapping`}
        />
        <MetricCard
          icon={Database}
          label="Results mapped to competitions"
          value={report.mapped_result_count}
          detail={`${resultCoverage}% of legacy results`}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Protected ATHRECS URLs"
          value={report.protected_legacy_publication_count}
          detail="No canonical URL cutover enabled"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-slate-950">Brands</h2>
          <p className="mt-1 text-sm text-slate-600">
            Proposed counts come from the shared catalogue. A provisional domain is a planning
            record, not confirmation that the domain has been registered or verified.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Brand</th>
                <th className="px-5 py-3 font-semibold">Domain</th>
                <th className="px-5 py-3 text-right font-semibold">Proposed events</th>
                <th className="px-5 py-3 text-right font-semibold">Live here now</th>
                <th className="px-5 py-3 font-semibold">Launch state</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleBrands.map((brand) => (
                <BrandRow key={brand.code} brand={brand} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-display text-xl font-semibold text-slate-950">Sports taxonomy</h2>
            <p className="mt-1 text-sm text-slate-600">
              Controlled sports and disciplines replace inconsistent free-text categories without
              removing the legacy value.
            </p>
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Sport</th>
                  <th className="px-5 py-3 text-right font-semibold">Events</th>
                  <th className="px-5 py-3 text-right font-semibold">Disciplines</th>
                  <th className="px-5 py-3 text-right font-semibold">Staff reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.data.sports.map((sport) => (
                  <tr key={sport.code}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{sport.name}</p>
                      <p className="mt-0.5 max-w-xl text-xs text-slate-500">{sport.description}</p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(sport.event_count)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(sport.discipline_count)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(sport.reviewed_event_count)}
                    </td>
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
                <h2 className="font-display text-lg font-semibold text-emerald-950">
                  Migration safeguards
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-emerald-900">
                  <li>Existing ATHRECS event IDs, editions and result links remain untouched.</li>
                  <li>Specialist-domain publication is disabled.</li>
                  <li>ATHRECS remains the live canonical publication for every current event.</li>
                  <li>New editions and competitions exist in a shadow model only.</li>
                  <li>Staff classifications are preserved when the automatic sync runs again.</li>
                </ul>
                <p className="mt-4 text-xs text-emerald-800">
                  State: {safeguards.competitionModel} competition model · public cutover{" "}
                  {safeguards.publicUrlCutoverEnabled ? "enabled" : "disabled"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-semibold text-amber-950">
                  Decisions still required
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Brand names and provisional domains still need legal, registration and trademark
                  checks. Cross-country, walking, rowing, OCR and adventure racing also need final
                  brand-placement rules before public migration.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-slate-950">
            Unclassified events requiring review
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            These records retain their original ATHRECS sport label and remain protected on the
            existing site until a staff decision is made.
          </p>
        </div>
        {overview.data.unclassified.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-600">No unclassified events are currently queued.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Legacy sport</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 text-right font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.data.unclassified.map((event) => (
                  <tr key={event.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{event.name}</td>
                    <td className="px-5 py-3 text-slate-600">{event.legacy_sport}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {[event.city, event.country].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-600">
                      {Math.round(Number(event.confidence) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function BrandRow({ brand }: { brand: SportsRecsBrandOverview }) {
  return (
    <tr>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Network className="size-4 text-cyan-700" aria-hidden="true" />
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
      <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-900">
        {formatNumber(brand.proposed_event_count)}
      </td>
      <td className="px-5 py-4 text-right tabular-nums text-slate-600">
        {formatNumber(brand.live_event_count)}
      </td>
      <td className="px-5 py-4">
        <StatusPill status={brand.launch_status} />
      </td>
    </tr>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Globe2;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">
            {formatNumber(value)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: SportsRecsBrandOverview["launch_status"] }) {
  const classes =
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "paused"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "retired"
          ? "border-slate-300 bg-slate-100 text-slate-600"
          : "border-cyan-200 bg-cyan-50 text-cyan-800";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes}`}>
      {status}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <RefreshCcw className="size-5 animate-spin text-cyan-700" aria-hidden="true" />
        Building the network migration report…
      </div>
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function percentage(value: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((value / total) * 100);
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
