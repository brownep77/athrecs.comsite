import { lazy, Suspense, useState } from "react";
import { Link } from "@tanstack/react-router";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";
import { SingleAthleteLink } from "./SingleAthleteLink";

const Directory = lazy(() =>
  import("./AthleteDirectory").then((m) => ({ default: m.AthleteDirectory })),
);
const ImportResults = lazy(() =>
  import("./ImportRaceResults").then((m) => ({ default: m.ImportRaceResults })),
);
const Workspace = lazy(() =>
  import("@/components/athletes/AthleteWorkspace").then((m) => ({ default: m.AthleteWorkspace })),
);
const ClubScanner = lazy(() =>
  import("./club-athlete-scanner").then((m) => ({ default: m.ClubScanner })),
);
import type { AthleteToolSection } from "@/lib/athlete-link/navigation";
const sections: { id: AthleteToolSection; label: string; description: string }[] = [
  {
    id: "link",
    label: "Single athlete",
    description: "Check a profile link and add or match one person.",
  },
  {
    id: "directory",
    label: "Find profiles",
    description: "Search existing athletes and manage their details.",
  },
  {
    id: "upload",
    label: "Results file",
    description: "Check an Excel or CSV export and add selected results.",
  },
  {
    id: "review",
    label: "Review results",
    description: "Edit a profile, paste results and review saved proposals.",
  },
  {
    id: "clubs",
    label: "Club scans",
    description: "Run club checks and work through their review queue.",
  },
];
export function AthleteTools({
  initialSection = "link",
  initialAthleteId = null,
}: {
  initialSection?: AthleteToolSection;
  initialAthleteId?: number | null;
}) {
  const [active, setActive] = useState<AthleteToolSection>(initialSection);
  const [visited, setVisited] = useState<Set<AthleteToolSection>>(() => new Set([initialSection]));
  const [athleteId, setAthleteId] = useState(initialAthleteId);
  function open(section: AthleteToolSection) {
    setActive(section);
    setVisited((previous) => new Set([...previous, section]));
  }
  function openAthlete(id: number) {
    setAthleteId(id);
    open("review");
  }
  if (!IS_ATHRECS_SITE) return <p>Use the AthRecs staff site to add or update athletes.</p>;
  return (
    <div className="min-w-0 space-y-6">
      <header className="space-y-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-800">
          Athlete tools
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link
            to="/admin/result-archive"
            className="inline-flex min-h-11 items-center rounded-lg border border-cyan-700 px-3 text-cyan-900"
          >
            Collected results
          </Link>
          <Link
            to="/admin/result-claims"
            search={{ claimId: undefined }}
            className="inline-flex min-h-11 items-center rounded-lg border border-cyan-700 px-3 text-cyan-900"
          >
            Claim conflicts & emails
          </Link>
        </div>
        <h1 className="font-display text-3xl font-semibold">Add or update athletes</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-700">
          One place to add a person, find existing profiles, import a results file and review
          matches. Start with a link for one athlete, or a file for a whole race.
        </p>
      </header>
      <nav aria-label="Athlete tools" className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={active === s.id}
            aria-controls={`athlete-tool-${s.id}`}
            className={`min-h-12 rounded-xl border px-3 py-3 text-left text-sm font-semibold ${active === s.id ? "border-cyan-800 bg-cyan-800 text-white" : "border-border bg-white text-slate-700 hover:border-cyan-700"}`}
            onClick={() => open(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>
      <p className="text-sm text-muted">
        {sections.find((s) => s.id === active)?.description} Forms stay open when you switch tools.
      </p>
      {sections.map((s) => (
        <section
          key={s.id}
          id={`athlete-tool-${s.id}`}
          aria-label={s.label}
          hidden={s.id !== active}
        >
          {visited.has(s.id) ? (
            <Suspense fallback={<p role="status">Loading {s.label.toLowerCase()}…</p>}>
              {s.id === "link" ? <SingleAthleteLink onOpenAthlete={openAthlete} /> : null}
              {s.id === "directory" ? <Directory onEditAthlete={openAthlete} /> : null}
              {s.id === "upload" ? <ImportResults blankStart /> : null}
              {s.id === "review" ? (
                <Workspace key={athleteId ?? "all"} staff initialAthleteId={athleteId} />
              ) : null}
              {s.id === "clubs" ? <ClubScanner /> : null}
            </Suspense>
          ) : null}
        </section>
      ))}
    </div>
  );
}
