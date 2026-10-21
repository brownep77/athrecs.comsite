import { Link } from "@tanstack/react-router";
import type { SportsOrganisation } from "@/data/sports-organisations";
import { SPORT_PAGES } from "@/lib/athrecs/sport-pages";
import { sportColourClass } from "@/lib/athrecs/event-colours";

export function OrganisationSports({ body }: { body: SportsOrganisation }) {
  if (body.type === "funding")
    return <p className="text-xs text-muted">Cross-sport funding and development</p>;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Relevant AthRecs sports">
      {body.sports.map((slug) => {
        const sport = SPORT_PAGES.find((page) => page.slug === slug)!;
        return (
          <li key={slug}>
            <Link
              to="/directory"
              search={{ sport: slug }}
              className={`inline-flex min-h-9 items-center rounded-full border px-2.5 text-xs font-medium no-underline hover:underline ${sportColourClass(sport.sport)}`}
            >
              {sport.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
