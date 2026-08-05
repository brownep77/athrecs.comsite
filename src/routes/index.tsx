import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, UsersRound } from "lucide-react";
import { getHomeStats, listClubs, listEvents } from "@/lib/athrecs/api";
import { RaceCard } from "@/components/races/RaceCard";
import { ClubCard } from "@/components/clubs/ClubCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [stats, events, clubs] = await Promise.all([
      getHomeStats(),
      listEvents({ data: {} }),
      listClubs({ data: {} }),
    ]);
    return {
      stats,
      featured: events.filter((e) => e.upcoming_count > 0).slice(0, 4),
      clubs: clubs.slice(0, 4),
    };
  },
  component: HomePage,
});

function HomePage() {
  const { stats, featured, clubs } = Route.useLoaderData();

  return (
    <div className="space-y-10">
      <section className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card md:p-8">
        <div className="space-y-3">
          <img
            src="/athrecs-logo.png"
            alt="ATHRECS.com"
            width={280}
            height={57}
            className="h-10 w-auto max-w-full object-contain object-left md:h-12"
            decoding="async"
          />
          <Badge variant="accent">Norfolk first</Badge>
          <h1 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            Events, athletes and clubs for Norfolk endurance sport
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Running, athletics (track & field), cycling, swimming, triathlon,
          duathlon, aquathlon, aquabike, rowing and OCR — fixtures plus the clubs
          and athletes who race them. Confirm entry details on organiser sites.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild>
            <Link to="/races">
              Browse events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/athletes">
              <Users className="h-4 w-4" />
              Athletes
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/clubs">
              <UsersRound className="h-4 w-4" />
              Clubs
            </Link>
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
          <Stat label="Events" value={String(stats.events)} />
          <Stat label="Upcoming days" value={String(stats.upcoming)} />
          <Stat label="Athletes" value={String(stats.athletes)} />
          <Stat label="Clubs" value={String(stats.clubs)} />
        </dl>
        <div className="flex flex-wrap gap-1.5">
          {stats.bySport.map((s) => (
            <Badge key={s.sport} variant="outline">
              {s.sport} · {s.n}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-fg">
            Upcoming highlights
          </h2>
          <Link
            to="/races"
            className="text-sm font-medium text-accent no-underline hover:underline"
          >
            All events
          </Link>
        </div>
        <div className="grid gap-2">
          {featured.map((r) => (
            <RaceCard key={r.id} race={r} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-fg">Clubs</h2>
          <Link
            to="/clubs"
            className="text-sm font-medium text-accent no-underline hover:underline"
          >
            All clubs
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {clubs.map((c) => (
            <ClubCard key={c.id} club={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-elevated/40 px-3 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold tabular text-fg">{value}</dd>
    </div>
  );
}
