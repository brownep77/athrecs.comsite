import { Link } from "@tanstack/react-router";
import { MapPin, Users } from "lucide-react";
import type { ClubListItem } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";

export function ClubCard({ club }: { club: ClubListItem }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {club.sports.slice(0, 4).map((s) => (
          <Badge key={s} variant="accent">
            {s}
          </Badge>
        ))}
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {club.member_count}
        </Badge>
      </div>
      <Link
        to="/clubs/$slug"
        params={{ slug: club.slug }}
        className="block font-semibold text-fg no-underline hover:text-accent"
      >
        {club.name}
      </Link>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
        <MapPin className="h-3.5 w-3.5 text-subtle" />
        {club.city}, {club.county}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-subtle">
        {club.summary}
      </p>
    </article>
  );
}
