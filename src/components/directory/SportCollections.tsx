import { Link } from "@tanstack/react-router";
import type { DirectorySport } from "@/data/sports-organisations";
import { SPORT_PAGES } from "@/lib/athrecs/sport-pages";

export function SportCollections({ sports }: { sports?: readonly DirectorySport[] }) {
  const pages = SPORT_PAGES.filter((page) => !sports || sports.includes(page.slug));
  if (!pages.length) return null;
  const link = "inline-flex min-h-11 items-center text-sm font-semibold";
  return (
    <section aria-labelledby="sport-collections-heading" className="space-y-4">
      <h2 id="sport-collections-heading" className="font-display text-2xl font-semibold">
        Fixtures, results & athletes
      </h2>
      <p className="text-sm leading-6 text-muted">
        Explore each sport on AthRecs. Athlete directories group cycling disciplines together, and
        road and trail runners together.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <li key={page.slug} className="rounded-lg border border-border bg-surface px-4 pt-4 pb-2">
            <h3 className="font-semibold">{page.label}</h3>
            <nav aria-label={`${page.label} collections`} className="flex flex-wrap gap-x-5">
              <Link
                to="/sports/$sport"
                params={{ sport: page.slug }}
                search={{}}
                hash="fixtures"
                className={link}
              >
                Fixtures
              </Link>
              <Link to="/results" search={{ category: page.slug }} className={link}>
                Results
              </Link>
              <Link to="/athletes" search={{ sport: page.sport }} className={link}>
                Athletes
              </Link>
            </nav>
          </li>
        ))}
      </ul>
    </section>
  );
}
