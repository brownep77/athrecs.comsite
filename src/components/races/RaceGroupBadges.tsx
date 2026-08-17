import { Award, Gem, Mountain } from "lucide-react";
import type { RaceGroupInfo } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";

function groupStyle(group: RaceGroupInfo): string {
  if (group.code === "world-marathon-majors") {
    return "border-amber-300/70 bg-amber-100/70 text-amber-900";
  }
  if (group.level === "final") {
    return "border-violet-300/70 bg-violet-100/70 text-violet-900";
  }
  if (group.level === "major") {
    return "border-fuchsia-300/70 bg-fuchsia-100/70 text-fuchsia-900";
  }
  if (group.code === "utmb-world-series") {
    return "border-teal-300/70 bg-teal-100/70 text-teal-900";
  }
  return "border-border-strong bg-elevated text-fg";
}

function GroupIcon({ group }: { group: RaceGroupInfo }) {
  if (group.code === "world-marathon-majors") return <Award className="h-3.5 w-3.5" />;
  if (group.code === "utmb-index") return <Mountain className="h-3.5 w-3.5" />;
  return <Gem className="h-3.5 w-3.5" />;
}

export function RaceGroupBadges({ groups }: { groups: RaceGroupInfo[] }) {
  if (!groups.length) return null;

  return (
    <>
      {groups.map((group) => (
        <Badge key={group.code} className={`gap-1 ${groupStyle(group)}`}>
          <GroupIcon group={group} />
          {group.label}
        </Badge>
      ))}
    </>
  );
}

export function RaceGroupDetails({ groups }: { groups: RaceGroupInfo[] }) {
  if (!groups.length) return null;

  return (
    <section
      aria-labelledby="series-qualification-heading"
      className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card"
    >
      <div className="space-y-1">
        <h2
          id="series-qualification-heading"
          className="font-display text-lg font-semibold text-fg"
        >
          Series &amp; qualification
        </h2>
        <p className="text-sm text-muted">
          Classification is checked against the official series source and recorded by edition
          where qualification status can change.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <article
            key={group.code}
            className="space-y-2 rounded-lg border border-border bg-elevated p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <RaceGroupBadges groups={[group]} />
              <span className="text-xs text-subtle">Checked {group.checked_at}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted">{group.note}</p>
            <a
              href={group.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center text-sm font-medium text-accent no-underline hover:underline"
            >
              Official classification source ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
