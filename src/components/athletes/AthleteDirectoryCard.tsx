import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { DirectoryAthlete } from "@/lib/athrecs/athlete-directory";
import { formatAthleteId } from "@/lib/athrecs/athlete-id";

export function AthleteDirectoryCard({ athlete }: { athlete: DirectoryAthlete }) {
  const initials = athlete.display_name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  const roles = athlete.profile_roles
    .split(/[,;|]/)
    .map((role) => role.trim())
    .filter(Boolean);
  return (
    <Link
      to="/athletes/$slug"
      params={{ slug: athlete.slug }}
      className="group flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-4 no-underline shadow-card transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-sm font-bold text-accent"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-fg">{athlete.display_name}</h3>
          <p className="mt-1 font-mono text-xs text-muted">
            <span className="sr-only">Athlete ID </span>
            {formatAthleteId(athlete.athlete_number)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            {athlete.country || "Location not listed"}
          </p>
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-subtle group-hover:text-accent"
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
        {athlete.club || roles.join(" · ") || "Athlete profile"}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs">
        {athlete.sports.slice(0, 2).map((sport) => (
          <span key={sport} className="rounded-md bg-elevated px-2 py-1 text-accent">
            {sport}
          </span>
        ))}
        <span className="text-muted">
          {athlete.result_count
            ? `${athlete.result_count.toLocaleString("en-GB")} recorded result${athlete.result_count === 1 ? "" : "s"}`
            : "View athlete profile"}
        </span>
      </div>
    </Link>
  );
}
