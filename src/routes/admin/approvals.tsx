import { lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useIsMutating } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClubScanner = lazy(() =>
  import("@/components/admin/club-athlete-scanner").then((module) => ({
    default: module.ClubScanner,
  })),
);
const CollectorPage = lazy(() =>
  import("@/components/admin/race-collector").then((module) => ({ default: module.CollectorPage })),
);
const PendingFixtureReviewPage = lazy(() =>
  import("@/components/admin/fixture-review").then((module) => ({
    default: module.PendingFixtureReviewPage,
  })),
);

const queues = [
  {
    value: "athletes",
    label: "Athletes",
    description:
      "Review athlete identities and results, inspect previous decisions and publish approved records.",
    tool: "/admin/club-scanner",
    toolLabel: "Open full club scanner",
    component: ClubScanner,
  },
  {
    value: "races",
    label: "Races",
    description:
      "Review collected races, check possible duplicates and find your kept or dismissed records.",
    tool: "/admin/race-collector",
    toolLabel: "Open full race collector",
    component: CollectorPage,
  },
  {
    value: "fixtures",
    label: "Fixtures",
    description:
      "Review pending race fixtures and release selected records when their checks are complete.",
    tool: "/admin/fixture-review",
    toolLabel: "Open full fixture tools",
    component: PendingFixtureReviewPage,
  },
] as const;

type Queue = (typeof queues)[number]["value"];

export const Route = createFileRoute("/admin/approvals")({
  validateSearch: (search: Record<string, unknown>): { queue: Queue } => ({
    queue: search.queue === "races" || search.queue === "fixtures" ? search.queue : "athletes",
  }),
  head: () => ({
    meta: [
      { title: "Approvals · ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { queue } = Route.useSearch();
  const navigate = Route.useNavigate();
  const saving = useIsMutating() > 0;

  return (
    <div className="min-w-0 space-y-6">
      <header className="space-y-3 rounded-2xl border border-cyan-200 bg-white p-5 md:p-7">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-800">
          <BadgeCheck className="size-4" aria-hidden="true" /> ATHRECS Staff
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-950">Approvals</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Athlete records, collected races and pending fixtures in one place. Choose a queue to
          review records and their decisions.
        </p>
      </header>
      <Tabs
        value={queue}
        onValueChange={(value) => {
          void navigate({ search: { queue: value as Queue }, resetScroll: false });
        }}
      >
        <TabsList aria-label="Approval queues" className="grid w-full max-w-lg grid-cols-3">
          {queues.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={saving}
              className="min-h-11 px-2 text-sm"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {saving && (
          <p role="status" className="mt-3 text-sm text-muted">
            Saving your changes…
          </p>
        )}
        {queues.map(({ value, label, description, tool, toolLabel, component: Panel }) => (
          <TabsContent key={value} value={value} className="mt-5 min-w-0 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl space-y-1">
                <h2 className="text-xl font-semibold">{label} approvals</h2>
                <p className="text-sm leading-6 text-muted">{description}</p>
              </div>
              <Link
                to={tool}
                className="inline-flex min-h-10 items-center text-sm font-semibold text-cyan-900 underline underline-offset-4"
              >
                {toolLabel}
              </Link>
            </div>
            <Suspense
              fallback={
                <p role="status" className="rounded-xl border border-border p-5 text-sm">
                  Loading {label.toLowerCase()} review tools…
                </p>
              }
            >
              <Panel embedded />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
