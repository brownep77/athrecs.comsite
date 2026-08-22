import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bike,
  Footprints,
  Gauge,
  Route as RouteIcon,
  Timer,
  Trophy,
} from "lucide-react";
import { listEvents } from "@/lib/athrecs/api";
import {
  SITE_LANGUAGES,
  copyForLanguage,
  countrySiteFromSlug,
  displayCountryForLanguage,
  isSiteLanguage,
  languageLabel,
  translateCountryText,
} from "@/lib/athrecs/country-sites";
import { RaceCard } from "@/components/races/RaceCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$language/$country/")({
  loader: async ({ params }) => {
    const site = countrySiteFromSlug(params.country);
    if (!site || !isSiteLanguage(params.language)) throw notFound();

    const [running, triathlon, cycling] = await Promise.all([
      listEvents({
        data: { country: site.country, sport: "Running", upcomingOnly: true, limit: 8 },
      }),
      listEvents({
        data: { country: site.country, sport: "Triathlon", upcomingOnly: true, limit: 4 },
      }),
      listEvents({
        data: { country: site.country, sport: "Cycling", upcomingOnly: true, limit: 4 },
      }),
    ]);

    return { site, language: params.language, running, triathlon, cycling };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { site, language } = loaderData;
    const country = displayCountryForLanguage(site, language);
    const copy = copyForLanguage(language);
    const title = `ATHRECS ${country} — ${translateCountryText(copy.racesIn, country)}`;
    const canonical = `https://www.athrecs.com/${language}/${site.slug}`;

    return {
      meta: [
        { title },
        {
          name: "description",
          content: translateCountryText(copy.upcomingBody, country),
        },
      ],
      links: [
        { rel: "canonical", href: canonical },
        ...SITE_LANGUAGES.map((alternate) => ({
          rel: "alternate",
          hrefLang: alternate,
          href: `https://www.athrecs.com/${alternate}/${site.slug}`,
        })),
      ],
    };
  },
  component: CountryHomePage,
  notFoundComponent: CountryNotFound,
});

const distanceCards = [
  { key: "parkrun", distance: undefined, sport: "Parkrun" as const, icon: Footprints },
  { key: "5K", distance: "5K", sport: "Running" as const, icon: Timer },
  { key: "10K", distance: "10K", sport: "Running" as const, icon: Gauge },
  { key: "half", distance: "Half", sport: "Running" as const, icon: RouteIcon },
  { key: "marathon", distance: "Marathon", sport: "Running" as const, icon: Trophy },
] as const;

function CountryHomePage() {
  const { site, language, running, triathlon, cycling } = Route.useLoaderData();
  const navigate = useNavigate();
  const copy = copyForLanguage(language);
  const country = displayCountryForLanguage(site, language);

  const distanceLabel = (key: (typeof distanceCards)[number]["key"]) => {
    if (key === "parkrun") return "parkrun";
    if (key === "half") return copy.halfMarathon;
    if (key === "marathon") return copy.marathon;
    return key;
  };

  const distanceDetail = (key: (typeof distanceCards)[number]["key"]) => {
    if (key === "parkrun") return copy.parkrunDetail;
    if (key === "5K") return copy.fiveKDetail;
    if (key === "10K") return copy.tenKDetail;
    if (key === "half") return copy.halfDetail;
    return copy.marathonDetail;
  };

  return (
    <div className="space-y-12 pb-8 md:space-y-16">
      <div className="flex justify-end rounded-xl border border-border bg-surface p-3 shadow-card">
        <label className="grid min-w-44 gap-1.5 text-xs font-semibold text-muted">
          {copy.language}
          <select
            value={language}
            onChange={(event) => {
              if (!isSiteLanguage(event.target.value)) return;
              void navigate({
                to: "/$language/$country",
                params: { language: event.target.value, country: site.slug },
              });
            }}
            className="h-10 rounded-lg border border-border bg-bg px-3 text-sm font-medium text-fg outline-none focus:ring-2 focus:ring-accent/30"
          >
            {SITE_LANGUAGES.map((option) => (
              <option key={option} value={option}>
                {languageLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_24px_70px_rgba(45,52,57,0.10)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 84% 18%, rgba(12,171,149,0.20), transparent 30%), radial-gradient(circle at 62% 115%, rgba(12,171,149,0.12), transparent 38%)",
          }}
          aria-hidden
        />
        <div className="relative grid gap-9 px-6 py-9 sm:px-9 md:px-12 md:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              {copy.runningFirst} · {site.flag} {country}
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.04em] text-fg sm:text-6xl md:text-7xl">
              {translateCountryText(copy.heroTitle, country)}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              {copy.heroIntro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link
                  to="/$language/$country/races"
                  params={{ language, country: site.slug }}
                  search={{ sport: "Running" }}
                >
                  {copy.exploreRunning}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/$language/$country/races" params={{ language, country: site.slug }}>
                  {copy.raceCalendar}
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-primary/20 bg-accent-soft text-5xl shadow-card md:h-36 md:w-36 md:text-6xl">
            <span aria-hidden>{site.flag}</span>
            <span className="sr-only">{country}</span>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow={copy.runningFirst}
          title={copy.chooseDistance}
          body={copy.chooseDistanceBody}
          action={
            <Link
              to="/$language/$country/races"
              params={{ language, country: site.slug }}
              search={{ sport: "Running" }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              {copy.allRunningEvents} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {distanceCards.map((item) => (
            <Link
              key={item.key}
              to="/$language/$country/races"
              params={{ language, country: site.slug }}
              search={{ sport: item.sport, distance: item.distance }}
              className="group min-h-40 rounded-2xl border border-border bg-surface p-5 no-underline shadow-card transition hover:-translate-y-1 hover:border-border-strong"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-fg">
                {distanceLabel(item.key)}
              </h3>
              <p className="mt-1 text-sm text-muted">{distanceDetail(item.key)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SportPanel
          icon={Activity}
          title={copy.triathlon}
          body={copy.triathlonBody}
          count={triathlon.length}
          href={
            <Link
              to="/$language/$country/races"
              params={{ language, country: site.slug }}
              search={{ sport: "Triathlon" }}
            >
              {copy.explore} {copy.triathlon.toLowerCase()}
            </Link>
          }
        />
        <SportPanel
          icon={Bike}
          title={copy.cycling}
          body={copy.cyclingBody}
          count={cycling.length}
          href={
            <Link
              to="/$language/$country/races"
              params={{ language, country: site.slug }}
              search={{ sport: "Cycling" }}
            >
              {copy.explore} {copy.cycling.toLowerCase()}
            </Link>
          }
        />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow={copy.upcoming}
          title={translateCountryText(copy.upcomingBody, country)}
          body=""
          action={
            <Link
              to="/$language/$country/races"
              params={{ language, country: site.slug }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              {copy.allRaces} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-2">
          {running.length ? (
            running
              .slice(0, 6)
              .map((race) => (
                <RaceCard key={race.id} race={race} localized={{ language, country: site.slug }} />
              ))
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              {copy.noRaces}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
          {title}
        </h2>
        {body ? <p className="mt-1 max-w-2xl text-sm text-muted">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

function SportPanel({
  icon: Icon,
  title,
  body,
  count,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  count: number;
  href: React.ReactElement;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-elevated px-3 py-1 text-xs font-medium text-muted">
          {count}+
        </span>
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <Button asChild variant="secondary" className="mt-6">
        {href}
      </Button>
    </article>
  );
}

function CountryNotFound() {
  return (
    <div className="space-y-4 py-12 text-center">
      <h1 className="font-display text-2xl font-semibold text-fg">Country page not found</h1>
      <Button asChild variant="secondary">
        <Link to="/">ATHRECS home</Link>
      </Button>
    </div>
  );
}
