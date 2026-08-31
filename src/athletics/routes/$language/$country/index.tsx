import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Flag, Medal, Timer, Trophy } from "lucide-react";
import { listEvents } from "@/lib/athrecs/api";
import {
  SITE_LANGUAGES,
  copyForLanguage,
  countrySiteFromSlug,
  displayCountryForLanguage,
  isSiteLanguage,
  languageLabel,
  translateCountryText,
  type CountrySite,
  type SiteLanguage,
} from "@/lib/athrecs/country-sites";
import { RaceCard } from "@/components/races/RaceCard";
import { Button } from "@/components/ui/button";
import type { EventListItem } from "@/lib/athrecs/types";

const DISCIPLINES = [
  { label: "Track & field", surface: "Track", icon: Medal },
  { label: "Cross country", surface: "XC", icon: Flag },
  { label: "Road athletics", surface: "Road", icon: Timer },
  { label: "Championships", q: "championship", icon: Trophy },
] as const;

export const Route = createFileRoute("/$language/$country/")({
  loader: async ({ params }) => {
    const site = countrySiteFromSlug(params.country);
    if (!site || !isSiteLanguage(params.language)) throw notFound();

    const events = await listEvents({
      data: {
        country: site.country,
        sport: "Athletics",
        upcomingOnly: true,
        limit: 10,
      },
    });

    return { site, language: params.language, events };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { site, language } = loaderData;
    const country = displayCountryForLanguage(site, language);
    const canonical = `https://www.athrecs.com/${language}/${site.slug}`;
    return {
      meta: [
        { title: `${country} athletics events | ATHRECS` },
        {
          name: "description",
          content: `Find athletics meetings, championships, athletes and clubs in ${country} on ATHRECS.`,
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
  component: AthleticsCountryHomePage,
  notFoundComponent: CountryNotFound,
});

function AthleticsCountryHomePage() {
  // The generated route tree retains the base multi-sport country loader
  // type during standalone type-checking; Vite supplies this Athletics loader.
  const { site, language, events } = Route.useLoaderData() as unknown as {
    site: CountrySite;
    language: SiteLanguage;
    events: EventListItem[];
  };
  const navigate = useNavigate();
  const copy = copyForLanguage(language);
  const country = displayCountryForLanguage(site, language);

  return (
    <div className="space-y-10 pb-10 md:space-y-14">
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

      <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-card">
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Athletics · {site.flag} {country}
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-fg sm:text-6xl md:text-7xl">
              {country} athletics
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              Find track and field meetings, cross-country fixtures, road athletics,
              championships, athletes and clubs in {country}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link
                  to="/$language/$country/races"
                  params={{ language, country: site.slug }}
                >
                  {translateCountryText(copy.racesIn, country)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/calendar">{copy.raceCalendar}</Link>
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Athletics disciplines
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            Browse the {country} calendar
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DISCIPLINES.map((discipline) => (
            <Link
              key={discipline.label}
              to="/$language/$country/races"
              params={{ language, country: site.slug }}
              search={{
                sport: "Athletics",
                surface: "surface" in discipline ? discipline.surface : undefined,
                q: "q" in discipline ? discipline.q : undefined,
              }}
              className="group min-h-36 rounded-2xl border border-border bg-surface p-5 no-underline shadow-card transition hover:-translate-y-1 hover:border-accent"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <discipline.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-fg">
                {discipline.label}
              </h3>
              <p className="mt-1 text-sm text-muted">Athletics fixtures in {country}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {copy.upcoming}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
              Upcoming athletics events
            </h2>
          </div>
          <Link
            to="/$language/$country/races"
            params={{ language, country: site.slug }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
          >
            {copy.allRaces} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-2">
          {events.length ? (
            events
              .slice(0, 8)
              .map((event) => (
                <RaceCard key={event.id} race={event} localized={{ language, country: site.slug }} />
              ))
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              No upcoming verified athletics events are currently listed for {country}.
            </p>
          )}
        </div>
      </section>
    </div>
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
