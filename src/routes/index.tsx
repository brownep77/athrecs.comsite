import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Flag,
  ListChecks,
  MapPin,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";
import { getHomeStats, listAthletes, listClubs, listEvents } from "@/lib/athrecs/api";
import { RaceCard } from "@/components/races/RaceCard";
import { ClubCard } from "@/components/clubs/ClubCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NationBadge, NationFlag } from "@/components/flags/NationFlag";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [stats, events, clubs, athletes] = await Promise.all([
      getHomeStats(),
      listEvents({ data: {} }),
      listClubs({ data: {} }),
      listAthletes({ data: {} }),
    ]);
    return {
      stats,
      featured: events.filter((e) => e.upcoming_count > 0).slice(0, 5),
      pastWithResults: events
        .filter((e) => e.past_count > 0)
        .slice(0, 3),
      clubs: clubs.slice(0, 4),
      athletes: athletes
        .filter((a) => a.result_count > 0)
        .sort((a, b) => b.result_count - a.result_count)
        .slice(0, 6),
    };
  },
  component: HoldingHomePage,
});

function HoldingHomePage() {
  const { stats, featured, clubs, athletes } = Route.useLoaderData();

  return (
    <div className="space-y-10 pb-4">
      {/* Holding hero */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, var(--color-primary) 0%, transparent 42%), radial-gradient(circle at 88% 0%, var(--color-primary) 0%, transparent 36%)",
          }}
          aria-hidden
        />
        <div className="relative space-y-5 p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">ATHRECS.com holding</Badge>
            <Badge variant="outline">Norfolk pilot · live</Badge>
          </div>
          <img
            src="/athrecs-logo.png"
            alt="ATHRECS.com"
            width={320}
            height={65}
            className="h-11 w-auto max-w-full object-contain object-left md:h-14"
            decoding="async"
          />
          <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl lg:text-[2.65rem] lg:leading-tight">
            A home for race fixtures, athletes, clubs and results
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            ATHRECS is being built as the place to find endurance and multi-sport
            events, follow athletes and clubs, and browse published finish times.
            This holding site is the <strong className="font-medium text-fg">live
            Norfolk pilot</strong> — real fixtures and verified Total Race Timing
            results, growing toward a wider UK and world directory.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild>
              <Link to="/calendar">
                <CalendarDays className="h-4 w-4" />
                Open calendar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/races">Explore Norfolk events</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/athletes">
                <Users className="h-4 w-4" />
                Athletes & results
              </Link>
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
            <Stat label="Events" value={String(stats.events)} />
            <Stat label="Upcoming" value={String(stats.upcoming)} />
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
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">
              Calendar flags
            </h2>
            <p className="text-sm text-muted">
              Union Jack for British races. Irish flag for Ireland.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NationBadge kind="Britain" />
            <NationBadge kind="Ireland" />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <FlagExample
            kind="Britain"
            name="AJ Bell Great North Run"
            meta="Sun 13 Sep 2026 · Starts 10:40"
            address="Newcastle Quayside, Newcastle upon Tyne"
            train="Newcastle station (0.8 km)"
          />
          <FlagExample
            kind="Ireland"
            name="Dublin Marathon"
            meta="Sun 25 Oct 2026 · Starts 09:00"
            address="Leeson Street Lower, Dublin 2"
            train="Dublin Pearse / Connolly"
          />
        </div>
        <Button asChild>
          <Link to="/calendar">
            See full calendar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* What's live on this holding site */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">
          What's live on this holding site
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={Flag}
            title="Race directory"
            body="Road, trail, track, multi-sport, swimming, rowing and more — Norfolk fixtures with terrain, start times and how to enter."
            to="/races"
            cta="Browse events"
          />
          <Feature
            icon={Users}
            title="Athletes & times"
            body="Profiles linked to published TRT finish times — place, category, club and chip/gun style results."
            to="/athletes"
            cta="View athletes"
          />
          <Feature
            icon={UsersRound}
            title="Clubs"
            body="England Athletics clubs with sports and websites — beside athletes on ATHRECS."

            to="/clubs"
            cta="View clubs"
          />
          <Feature
            icon={CalendarDays}
            title="Calendar"
            body="Date-aware list of open, closing and finished editions."
            to="/calendar"
            cta="Open calendar"
          />
          <Feature
            icon={ListChecks}
            title="Admin update tools"
            body="CSV bulk import and Grok JSON paste to keep fixtures current."
            to="/admin"
            cta="Update data"
          />
          <Feature
            icon={Shield}
            title="Results approach"
            body="Basic public finish data with source links. Rights requests and richer stats planned next."
            to="/races"
            cta="See a race"
          />
        </div>
      </section>

      {/* Roadmap holding strip */}
      <section className="rounded-xl border border-border bg-elevated/50 p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <h2 className="font-display text-lg font-semibold text-fg">
            Roadmap from this holding page
          </h2>
        </div>
        <ol className="grid gap-3 text-sm md:grid-cols-3">
          <li className="rounded-lg border border-border bg-surface p-3.5 shadow-card">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
              Now · Norfolk
            </div>
            <p className="text-muted">
              Fixtures, clubs, athletes and verified TRT results for the county pilot.
            </p>
          </li>
          <li className="rounded-lg border border-border bg-surface p-3.5 shadow-card">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              Next
            </div>
            <p className="text-muted">
              Results permissions, Suffolk / Cambridgeshire, rankings and age-grade ratings.
            </p>
          </li>
          <li className="rounded-lg border border-border bg-surface p-3.5 shadow-card">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              Later
            </div>
            <p className="text-muted">
              UK nations, Commonwealth scopes, freemium detailed stats, parkrun-style ranking hooks.
            </p>
          </li>
        </ol>
      </section>

      {/* Live data from pilot */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">
              Live on the pilot — upcoming
            </h2>
            <p className="text-xs text-subtle">
              Real Norfolk fixtures from the catalogue (confirm entry on organiser sites).
            </p>
          </div>
          <Link
            to="/races"
            className="shrink-0 text-sm font-medium text-accent no-underline hover:underline"
          >
            All events
          </Link>
        </div>
        <div className="grid gap-2">
          {featured.length === 0 ? (
            <p className="text-sm text-muted">No upcoming editions right now — check past races.</p>
          ) : (
            featured.map((r) => <RaceCard key={r.id} race={r} />)
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">
              Athletes with verified results
            </h2>
            <p className="text-xs text-subtle">
              Times from public Total Race Timing pages — confirm on the timer site.
            </p>
          </div>
          <Link
            to="/athletes"
            className="shrink-0 text-sm font-medium text-accent no-underline hover:underline"
          >
            All athletes
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {athletes.map((a) => (
            <Link
              key={a.id}
              to="/athletes/$slug"
              params={{ slug: a.slug }}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 no-underline shadow-card hover:border-border-strong"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-fg">{a.display_name}</div>
                <div className="truncate text-xs text-muted">
                  {a.club ?? "Unattached"} · {a.city ?? "Norfolk"}
                </div>
              </div>
              <Badge variant="accent">{a.result_count}</Badge>
            </Link>
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

      <section className="rounded-xl border border-dashed border-border-strong bg-surface px-5 py-6 text-center md:px-8">
        <p className="font-display text-lg font-semibold text-fg">
          ATHRECS.com — holding site
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          This is the public holding experience for the product: branding, pilot data
          and tools in one place. Point your production domain here when Vercel is
          public (Deployment Protection off).
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button asChild size="sm">
            <Link to="/races">Enter the directory</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/admin">Update fixtures</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-elevated/60 px-3 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle">
        {label}
      </dt>
      <dd className="font-display text-xl font-semibold tabular text-fg">{value}</dd>
    </div>
  );
}

function FlagExample({
  kind,
  name,
  meta,
  address,
  train,
}: {
  kind: "Britain" | "Ireland";
  name: string;
  meta: string;
  address: string;
  train: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-elevated p-3">
      <NationFlag kind={kind} className="mt-0.5 h-8 w-12" />
      <div className="min-w-0 space-y-1">
        <NationBadge kind={kind} />
        <p className="font-display font-semibold leading-snug text-fg">{name}</p>
        <p className="text-sm font-medium text-accent">{meta}</p>
        <p className="text-xs text-muted">{address}</p>
        <p className="text-xs text-muted">Train · {train}</p>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
  to,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  to: "/races" | "/athletes" | "/clubs" | "/calendar" | "/admin";
  cta: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-medium text-fg">{title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{body}</p>
      <Link
        to={to}
        className="mt-3 text-sm font-medium text-accent no-underline hover:underline"
      >
        {cta} →
      </Link>
    </div>
  );
}
