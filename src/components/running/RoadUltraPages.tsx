import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Search } from "lucide-react";
import { useRaceDateRefresh } from "./use-race-date-refresh";
import {
  ROAD_ULTRAS,
  ULTRA_CHECKED,
  ULTRA_FAQS,
  editionDate,
  formatUltraDate,
  upcomingEditions,
  type RoadUltra,
  type UltraFormat,
} from "@/lib/running/road-ultras";

const linkStyle =
  "text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const formatLabels: Record<UltraFormat, string> = {
  distance: "Fixed distance",
  timed: "Timed / multi-format",
  journey: "Long road journey",
};

function Breadcrumbs({ race }: { race?: RoadUltra }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap gap-x-2 gap-y-1">
        <li>
          <Link to="/" className={linkStyle}>
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to="/running" className={linkStyle}>
            Running guides
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          {race ? (
            <Link to="/running/uk-road-ultramarathons" className={linkStyle}>
              UK road ultras
            </Link>
          ) : (
            <span aria-current="page">UK road ultras</span>
          )}
        </li>
        {race && (
          <>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{race.name}</li>
          </>
        )}
      </ol>
    </nav>
  );
}

function RaceCard({ race, today }: { race: RoadUltra; today: string }) {
  const next = upcomingEditions(race, today)[0];
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">
        {formatLabels[race.format]}
      </p>
      <h3 className="font-display text-xl font-semibold">
        <Link
          to="/running/ultramarathons/$slug"
          params={{ slug: race.slug }}
          className="hover:text-accent hover:underline"
        >
          {race.name}
        </Link>
      </h3>
      <p className="text-sm text-muted">{race.location}</p>
      <p className="font-semibold">{race.distance}</p>
      <p className="text-sm text-muted">{race.surface}</p>
      <p className="text-sm leading-6">{race.summary}</p>
      <p className="mt-auto border-t border-border pt-3 text-sm">
        <span className="font-semibold">{next ? "Next listed date: " : "Next date: "}</span>
        {next ? editionDate(next) : "TBC"}
      </p>
      {!next && race.previousEdition && (
        <p className="text-xs text-muted">
          Previous listing: {race.previousEdition}. Future edition unconfirmed.
        </p>
      )}
      <Link
        to="/running/ultramarathons/$slug"
        params={{ slug: race.slug }}
        className={`${linkStyle} inline-flex min-h-11 items-center gap-2 text-sm font-semibold`}
      >
        Course, dates and entry <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

export function RoadUltraGuide({ today }: { today: string }) {
  useRaceDateRefresh(["Europe/London"], `${today}T12:00:00Z`);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<UltraFormat | "all">("all");
  const calendar = ROAD_ULTRAS.flatMap((race) =>
    upcomingEditions(race, today).map((edition) => ({ race, edition })),
  ).sort(
    (a, b) =>
      a.edition.date.localeCompare(b.edition.date) || a.race.name.localeCompare(b.race.name),
  );
  const datedCount = ROAD_ULTRAS.filter((race) => upcomingEditions(race, today).length).length;
  const filtered = ROAD_ULTRAS.filter(
    (race) =>
      (format === "all" || race.format === format) &&
      `${race.name} ${race.location} ${race.distance} ${race.surface}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const dated = filtered.filter((race) => upcomingEditions(race, today).length);
  const awaiting = filtered.filter((race) => !upcomingEditions(race, today).length);
  return (
    <article className="space-y-10 pb-8">
      <Breadcrumbs />
      <header className="space-y-5 border-b border-border pb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          AthRecs running guides
        </p>
        <h1 className="max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          UK road ultramarathons
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-muted">
          Beyond the marathon, with the surface under your feet in mind. Explore road ultras,
          paved-path races and timed challenges across the United Kingdom.
        </p>
        <p className="max-w-3xl leading-7">
          There is more to the calendar than a handful of famous names: country lanes, motor
          circuits, railway tunnels and some very well-used bridges. This guide covers{" "}
          {ROAD_ULTRAS.length} events and event series, grouping repeated dates and distances
          together.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-border bg-surface px-4 py-2">
            <strong>{ROAD_ULTRAS.length}</strong> event guides
          </span>
          <span className="rounded-full border border-border bg-surface px-4 py-2">
            <strong>{datedCount}</strong> with upcoming or provisional dates
          </span>
          <span className="rounded-full border border-border bg-surface px-4 py-2">
            Checked {formatUltraDate(ULTRA_CHECKED)}
          </span>
        </div>
        <nav
          aria-label="Guide sections"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold"
        >
          <a href="#dates" className={`${linkStyle} inline-flex min-h-11 items-center`}>
            Upcoming dates
          </a>
          <a href="#race-guides" className={`${linkStyle} inline-flex min-h-11 items-center`}>
            Browse race guides
          </a>
          <a href="#awaiting-dates" className={`${linkStyle} inline-flex min-h-11 items-center`}>
            Dates TBC
          </a>
          <a href="#questions" className={`${linkStyle} inline-flex min-h-11 items-center`}>
            What counts as a road ultra?
          </a>
        </nav>
      </header>

      <aside
        className="rounded-2xl border border-border bg-surface p-5 text-sm leading-6 sm:p-6"
        aria-label="How to use this guide"
      >
        <strong>Check the surface and format.</strong> Paved paths and closed circuits appear
        alongside road races. Two Tunnels has a small grass section; JOGLE, LEJOG and Lon Las are
        mostly-road journeys. A timed challenge only produces an ultra finish if you cover more than
        42.195km. Dates are sourced from organisers, and a listing does not mean entries are still
        available.
      </aside>

      <section id="dates" className="scroll-mt-24 space-y-4" aria-labelledby="dates-heading">
        <h2 id="dates-heading" className="font-display text-2xl font-semibold">
          Upcoming road-ultra dates
        </h2>
        <p className="text-sm leading-6 text-muted">
          Earliest first, including events currently in progress. Provisional dates are labelled.
          Individual guides below explain the course, format and entry requirements.
        </p>
        {calendar.length ? (
          <div
            role="region"
            aria-label="Upcoming race dates, scroll horizontally on small screens"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-accent"
          >
            <table className="w-full min-w-[680px] text-left text-sm">
              <caption className="sr-only">UK road ultras with published forthcoming dates</caption>
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="p-4">
                    Date
                  </th>
                  <th scope="col" className="p-4">
                    Event
                  </th>
                  <th scope="col" className="p-4">
                    Distance / format
                  </th>
                </tr>
              </thead>
              <tbody>
                {calendar.map(({ race, edition }) => (
                  <tr key={`${race.slug}-${edition.date}`} className="border-t border-border">
                    <td className="p-4 align-top">{editionDate(edition)}</td>
                    <td className="p-4 align-top">
                      <Link
                        to="/running/ultramarathons/$slug"
                        params={{ slug: race.slug }}
                        className={`${linkStyle} font-semibold`}
                      >
                        {race.name}
                      </Link>
                      <span className="mt-1 block text-xs text-muted">
                        {edition.label ?? race.location}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      {race.distance}
                      <span className="mt-1 block text-xs text-muted">
                        {formatLabels[race.format]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-border p-5">
            No future dates remain in the sources checked. Browse the guides and organiser links
            below for new announcements.
          </p>
        )}
      </section>

      <section id="race-guides" className="scroll-mt-24 space-y-5" aria-labelledby="guides-heading">
        <h2 id="guides-heading" className="font-display text-2xl font-semibold">
          Find your next road ultra
        </h2>
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface p-4">
          <div className="min-w-0 flex-1 basis-64">
            <label htmlFor="ultra-search" className="mb-2 block text-sm font-semibold">
              Search race, place or distance
            </label>
            <div className="relative">
              <Search size={18} aria-hidden="true" className="absolute left-3 top-3 text-muted" />
              <input
                id="ultra-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try Scotland, 50 km or Bath"
                className="min-h-11 w-full rounded-lg border border-border bg-bg py-2 pl-10 pr-3 text-base text-fg focus-visible:outline-2 focus-visible:outline-accent"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1 basis-56">
            <label htmlFor="ultra-format" className="mb-2 block text-sm font-semibold">
              Race format
            </label>
            <select
              id="ultra-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as UltraFormat | "all")}
              className="min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-base text-fg focus-visible:outline-2 focus-visible:outline-accent"
            >
              <option value="all">All formats</option>
              {Object.entries(formatLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p role="status" aria-live="polite" className="text-sm text-muted">
          Showing {filtered.length} of {ROAD_ULTRAS.length} event guides. Filters apply to the
          guides below.
        </p>
        {dated.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {dated.map((race) => (
              <RaceCard key={race.slug} race={race} today={today} />
            ))}
          </div>
        )}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-border p-5">
            No matching events. Try a broader search or choose all formats.
          </p>
        )}
        <section
          id="awaiting-dates"
          className="scroll-mt-24 space-y-4 pt-5"
          aria-labelledby="awaiting-heading"
        >
          <h2 id="awaiting-heading" className="font-display text-2xl font-semibold">
            Next dates TBC
          </h2>
          <p className="text-sm leading-6 text-muted">
            These event guides have no confirmed future date in the sources checked. Historical
            listings are retained for context and are not advertised as upcoming races.
          </p>
          {awaiting.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {awaiting.map((race) => (
                <RaceCard key={race.slug} race={race} today={today} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No events awaiting dates match your current filters.
            </p>
          )}
        </section>
      </section>

      <section
        id="questions"
        className="scroll-mt-24 space-y-6 border-t border-border pt-7"
        aria-labelledby="questions-heading"
      >
        <h2 id="questions-heading" className="font-display text-2xl font-semibold">
          Choosing a UK road ultra
        </h2>
        {ULTRA_FAQS.map(({ question, answer }) => (
          <section key={question} className="max-w-3xl space-y-2">
            <h3 className="font-display text-xl font-semibold">{question}</h3>
            <p className="text-sm leading-7 text-muted">{answer}</p>
          </section>
        ))}
        <p className="text-sm leading-6 text-muted">
          Research checked on {formatUltraDate(ULTRA_CHECKED)}. Each race guide links to the
          organiser or authorised entry page. Entry availability, routes and race instructions can
          change.
        </p>
      </section>
    </article>
  );
}

export function RoadUltraDetail({ race, today }: { race: RoadUltra; today: string }) {
  useRaceDateRefresh(["Europe/London"], `${today}T12:00:00Z`);
  const editions = upcomingEditions(race, today);
  return (
    <article className="mx-auto max-w-4xl space-y-8 pb-8">
      <Breadcrumbs race={race} />
      <header className="space-y-4 border-b border-border pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          UK road ultramarathons · {formatLabels[race.format]}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {race.name}
        </h1>
        <p className="text-base text-muted">{race.location}</p>
        <p className="text-lg leading-8">{race.summary}</p>
      </header>
      <dl className="grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6">
        {[
          ["Distance / format", race.distance],
          ["Surface", race.surface],
          [
            "Next listed date",
            editions[0] ? editionDate(editions[0]) : "TBC — future edition not confirmed",
          ],
          ["Typical field size", "Not confirmed"],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
            <dd className="mt-2 text-base font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">The course and challenge</h2>
        <p className="leading-7">{race.course}</p>
      </section>
      <section className="space-y-4" aria-labelledby="entry-heading">
        <h2 id="entry-heading" className="font-display text-2xl font-semibold">
          Dates and entry
        </h2>
        <p className="leading-7">{race.entry}</p>
        {editions.length ? (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {editions.map((edition) => (
              <li
                key={edition.date}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-semibold">{editionDate(edition)}</p>
                  {edition.label && <p className="mt-1 text-sm text-muted">{edition.label}</p>}
                </div>
                <a
                  href={edition.url}
                  className={`${linkStyle} inline-flex min-h-11 items-center gap-2 text-sm`}
                >
                  Official edition details <ExternalLink size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-border bg-surface p-4 text-sm leading-6">
            Next date: <strong>TBC.</strong>
            {race.previousEdition ? ` Previous listing: ${race.previousEdition}.` : ""} Check the
            organiser for a new announcement before making plans.
          </p>
        )}
        <p className="text-sm text-muted">
          Entry information checked {formatUltraDate(ULTRA_CHECKED)}. A published race date does not
          guarantee available places.
        </p>
      </section>
      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="font-display text-2xl font-semibold">Official information</h2>
        <ul className="space-y-2">
          {race.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                className={`${linkStyle} inline-flex min-h-11 items-center gap-2 text-sm`}
              >
                {source.label}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <Link
        to="/running/uk-road-ultramarathons"
        className={`${linkStyle} inline-flex min-h-11 items-center gap-2 font-semibold`}
      >
        Explore all UK road ultra guides <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
