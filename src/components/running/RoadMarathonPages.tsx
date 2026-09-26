import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { MARATHON_COUNTRIES, countryGuide } from "@/data/road-marathons/countries";
import type { MarathonCountryGuide, RoadMarathon } from "@/data/road-marathons/types";
import { roadMarathonDate, upcomingRoadEditions } from "@/lib/running/road-marathon-calendar";
import {
  countryMarathonQuestions,
  roadRaceLocation,
  roadRaceQuestions,
} from "@/lib/running/road-marathon-seo";
import { useRaceDateRefresh } from "./use-race-date-refresh";

const linkClass =
  "inline-flex min-h-10 items-center gap-1 font-semibold text-accent underline-offset-4 hover:underline";

function CountryLink({
  country,
  children,
}: {
  country: MarathonCountryGuide;
  children: React.ReactNode;
}) {
  return country.id === "uk" ? (
    <Link to="/running/uk-marathons" className={linkClass}>
      {children}
    </Link>
  ) : (
    <Link to="/running/$guide" params={{ guide: country.guide }} className={linkClass}>
      {children}
    </Link>
  );
}

function CountryNavigation({ selected }: { selected: string }) {
  return (
    <nav
      aria-label="Marathon countries"
      className="flex flex-wrap gap-x-5 gap-y-1 border-y border-border py-3 text-sm"
    >
      {MARATHON_COUNTRIES.map((country) =>
        country.id === selected ? (
          <span
            key={country.id}
            aria-current="page"
            className="inline-flex min-h-10 items-center font-semibold text-fg"
          >
            {country.name}
          </span>
        ) : (
          <CountryLink key={country.id} country={country}>
            {country.name}
          </CountryLink>
        ),
      )}
    </nav>
  );
}

function DateNote() {
  return <span className="text-muted">TBC — awaiting confirmation</span>;
}

export function CountryMarathonPage({
  country,
  races,
  now,
}: {
  country: MarathonCountryGuide;
  races: readonly RoadMarathon[];
  now: string;
}) {
  useRaceDateRefresh(
    races.map((race) => race.timeZone),
    now,
  );
  const dated = races
    .flatMap((race) => upcomingRoadEditions(race, now).map((edition) => ({ race, edition })))
    .sort(
      (a, b) =>
        a.edition.date.localeCompare(b.edition.date) || a.race.name.localeCompare(b.race.name),
    );
  const undated = races.filter((race) => !upcomingRoadEditions(race, now).length);
  const questions = countryMarathonQuestions(country, races, now);
  return (
    <article className="space-y-8 pb-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/">AthRecs</Link>
        <span aria-hidden="true">/</span>
        <Link to="/running">Running</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{country.name} marathons</span>
      </nav>
      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {country.name} · Road running
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {country.name} road marathons
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{country.description}</p>
        <p className="mt-3 text-sm text-muted">
          {races.length} race guides · 42.195 km / 26.2 miles · Dates through 2027
        </p>
      </header>
      <CountryNavigation selected={country.id} />
      <section aria-labelledby="upcoming" className="space-y-4">
        <h2 id="upcoming" className="scroll-mt-24 font-display text-2xl font-semibold">
          Upcoming marathon dates
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted">
          Find road marathons taking place between now and the end of 2027. Compare the location and
          approximate field, then open a race guide for entry options, course maps and previous
          results. Runner numbers refer to the year shown; Unknown means a reliable estimate is not
          available.
        </p>
        {dated.length ? (
          <div
            className="overflow-x-auto rounded-xl border border-border"
            role="region"
            aria-label="Upcoming marathons; scroll horizontally on smaller screens"
            tabIndex={0}
          >
            <table className="w-full min-w-[800px] text-left text-sm">
              <caption className="sr-only">
                Upcoming road marathons in {country.name}, with locations and approximate field
                sizes.
              </caption>
              <thead className="bg-accent-soft/50">
                <tr>
                  {[
                    "Date",
                    "Marathon",
                    "City / location",
                    country.regionLabel,
                    "Approximate field",
                  ].map((title) => (
                    <th key={title} scope="col" className="px-4 py-3 font-semibold">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dated.map(({ race, edition }) => (
                  <tr key={`${race.slug}-${edition.date}`} className="even:bg-elevated/30">
                    <td className="px-4 py-3">
                      <a
                        href={edition.sourceUrl}
                        className="text-accent underline underline-offset-4"
                      >
                        <time dateTime={edition.date}>
                          {roadMarathonDate(edition.date, edition.endDate)}
                        </time>
                      </a>
                    </td>
                    <th scope="row" className="px-4 py-3">
                      <Link
                        to="/running/races/$slug"
                        params={{ slug: race.slug }}
                        className={linkClass}
                      >
                        {race.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3">{race.city}</td>
                    <td className="px-4 py-3">
                      {race.region ?? "Unknown"}
                      {race.nation ? (
                        <span className="block text-xs text-muted">{race.nation}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {race.fieldSize ? (
                        <>
                          <span className="font-semibold">{race.fieldSize.display}</span>
                          <span className="mt-1 block text-xs text-muted">
                            {race.fieldSize.basis} · {race.fieldSize.year}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted">Unknown</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-border p-5 text-muted">
            No upcoming dates are listed here. Browse the race guides below for courses, entry
            information and links to the organisers.
          </p>
        )}
        {undated.length ? (
          <details className="rounded-xl border border-border p-4 text-sm">
            <summary className="cursor-pointer font-semibold">
              Race dates TBC ({undated.length})
            </summary>
            <ul className="mt-3 space-y-2">
              {undated.map((race) => (
                <li key={race.slug}>
                  <Link
                    to="/running/races/$slug"
                    params={{ slug: race.slug }}
                    className="font-semibold text-accent hover:underline"
                  >
                    {race.name}
                  </Link>
                  <span className="text-muted"> · {roadRaceLocation(race)}</span>
                  <span className="text-muted"> — </span>
                  <DateNote />
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
      <section aria-labelledby="race-guides">
        <h2 id="race-guides" className="font-display text-2xl font-semibold">
          Explore the races
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {races.map((race) => (
            <section
              key={race.slug}
              className="flex flex-col rounded-xl border border-border bg-surface p-5 sm:p-6"
              aria-labelledby={`${race.slug}-title`}
            >
              <p className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {roadRaceLocation(race)}
              </p>
              <h3 id={`${race.slug}-title`} className="mt-3 font-display text-2xl font-semibold">
                <Link
                  to="/running/races/$slug"
                  params={{ slug: race.slug }}
                  className="hover:text-accent"
                >
                  {race.name}
                </Link>
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                {race.description
                  .split(/(?<=[.!?])\s+/)
                  .slice(0, 2)
                  .join(" ")}
              </p>
              <p className="mt-3 text-sm">
                <span className="font-semibold">Course: </span>
                {race.course.profile}
              </p>
              {race.entryMethods.length ? (
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Entry routes: </span>
                  {race.entryMethods.map((method) => method.name).join(" · ")}
                </p>
              ) : null}
              <Link
                to="/running/races/$slug"
                params={{ slug: race.slug }}
                className={`${linkClass} mt-4 self-start text-sm`}
              >
                Race guide, entry & results <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>
          ))}
        </div>
      </section>
      <section aria-labelledby="country-questions">
        <h2 id="country-questions" className="font-display text-2xl font-semibold">
          Common questions
        </h2>
        <div className="mt-2 divide-y divide-border">
          {questions.map((item) => (
            <section key={item.question} className="py-4">
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{item.answer}</p>
            </section>
          ))}
        </div>
      </section>
      <aside className="rounded-xl bg-elevated/50 p-5 text-sm leading-6 text-muted">
        <p className="font-semibold text-fg">Before you choose</p>
        <p className="mt-2">
          A road marathon can include paved paths or a track finish, so check the course map as well
          as the name. Recent runner numbers give a sense of the race’s scale. For entry
          availability, final routes and race-day arrangements, follow the organiser’s latest
          information.
        </p>
      </aside>
    </article>
  );
}

export function RoadMarathonPage({ race, now }: { race: RoadMarathon; now: string }) {
  useRaceDateRefresh([race.timeZone], now);
  const country = countryGuide(race.country)!;
  const upcoming = upcomingRoadEditions(race, now);
  const questions = roadRaceQuestions(race, now);
  return (
    <article className="space-y-8 pb-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/">AthRecs</Link>
        <span aria-hidden="true">/</span>
        <Link to="/running">Running</Link>
        <span aria-hidden="true">/</span>
        <CountryLink country={country}>{country.name}</CountryLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{race.name}</span>
      </nav>
      <header className="border-b border-border pb-7">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {country.name} · Road marathon · 42.195 km
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {race.name}
        </h1>
        <p className="mt-4 text-base text-muted">{roadRaceLocation(race, country.name)}</p>
        <p className="mt-5 max-w-3xl text-base leading-7">{race.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={race.officialUrl}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg"
          >
            Official race website <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <a href="#entry" className={linkClass}>
            How to enter
          </a>
          <a href="#results" className={linkClass}>
            Past races & results
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          AthRecs race guide · Updated{" "}
          <time dateTime={race.checkedAt}>{roadMarathonDate(race.checkedAt)}</time>
        </p>
      </header>
      <nav aria-label="Race guide sections" className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {[
          ["dates", "Dates"],
          ["entry", "Entry methods"],
          ["course", "Route & course"],
          ["results", "Past results"],
          ["media", "Media"],
          ["questions", "Questions"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className={linkClass}>
            {label}
          </a>
        ))}
      </nav>
      <div className="grid gap-5 md:grid-cols-2">
        <section
          id="dates"
          aria-labelledby="dates-title"
          className="scroll-mt-24 rounded-xl border border-border p-5"
        >
          <h2 id="dates-title" className="font-display text-2xl font-semibold">
            Upcoming dates
          </h2>
          {upcoming.length ? (
            <ul className="mt-3 space-y-3">
              {upcoming.map((edition) => (
                <li key={edition.date}>
                  <a href={edition.sourceUrl} className={linkClass}>
                    <time dateTime={edition.date}>
                      {roadMarathonDate(edition.date, edition.endDate)}
                    </time>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm">
              <DateNote />
            </p>
          )}
          <p className="mt-3 text-xs leading-5 text-muted">
            {upcoming.length
              ? "Planning your race weekend? These are the announced dates through 2027. "
              : "Waiting for the next race? "}
            Follow the organiser’s link for the latest date and race-day details. All dates and
            start times are local.
          </p>
        </section>
        <section aria-labelledby="at-a-glance" className="rounded-xl border border-border p-5">
          <h2 id="at-a-glance" className="font-display text-2xl font-semibold">
            At a glance
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">City / location</dt>
              <dd className="text-muted">{race.city}</dd>
            </div>
            <div>
              <dt className="font-semibold">{country.regionLabel}</dt>
              <dd className="text-muted">{race.region ?? "Unknown"}</dd>
            </div>
            {race.nation ? (
              <div>
                <dt className="font-semibold">Nation</dt>
                <dd className="text-muted">{race.nation}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold">Distance</dt>
              <dd className="text-muted">42.195 kilometres / 26.2 miles</dd>
            </div>
            <div>
              <dt className="font-semibold">Surface</dt>
              <dd className="text-muted">{race.course.surface}</dd>
            </div>
            <div>
              <dt className="font-semibold">Course profile</dt>
              <dd className="text-muted">{race.course.profile}</dd>
            </div>
            {race.fieldSize ? (
              <div>
                <dt className="font-semibold">Approximate field</dt>
                <dd>
                  <a
                    href={race.fieldSize.sourceUrl}
                    className="text-accent underline underline-offset-4"
                  >
                    {race.fieldSize.display}
                  </a>
                  <span className="mt-1 block text-xs text-muted">
                    {race.fieldSize.basis} · {race.fieldSize.year}
                  </span>
                  {race.fieldSize.note ? (
                    <p className="mt-2 text-xs leading-5 text-muted">{race.fieldSize.note}</p>
                  ) : null}
                </dd>
              </div>
            ) : (
              <div>
                <dt className="font-semibold">Approximate field</dt>
                <dd className="text-muted">Unknown</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
      <section id="entry" aria-labelledby="entry-title" className="scroll-mt-24">
        <h2 id="entry-title" className="font-display text-2xl font-semibold">
          How to enter {race.name}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          These are the organiser’s entry routes. Check the linked page for the edition, opening
          dates, eligibility, fees and current availability.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {race.entryMethods.map((method) => (
            <section
              key={`${method.name}-${method.url}`}
              className="rounded-xl border border-border p-5"
            >
              <h3 className="text-lg font-semibold">{method.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{method.description}</p>
              <a href={method.url} className={`${linkClass} mt-3 text-sm`}>
                Official entry information <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </section>
          ))}
        </div>
        {!race.entryMethods.length ? (
          <a href={race.officialUrl} className={`${linkClass} mt-3`}>
            Check the organiser’s entry information{" "}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        ) : null}
      </section>
      <section
        id="course"
        aria-labelledby="course-title"
        className="scroll-mt-24 border-t border-border pt-7"
      >
        <h2 id="course-title" className="font-display text-2xl font-semibold">
          Route and course
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7">{race.course.summary}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {race.course.links.map((link) => (
            <a key={link.url} href={link.url} className={`${linkClass} text-sm`}>
              {link.label}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ))}
        </div>
        {race.practical?.length ? (
          <dl className="mt-5 grid gap-4 rounded-xl bg-elevated/40 p-5 sm:grid-cols-2">
            {race.practical.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <dt className="text-sm font-semibold">{item.label}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">
                  {item.value}{" "}
                  <a href={item.sourceUrl} className="text-accent underline underline-offset-4">
                    Details
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
      <section
        id="results"
        aria-labelledby="results-title"
        className="scroll-mt-24 border-t border-border pt-7"
      >
        <h2 id="results-title" className="font-display text-2xl font-semibold">
          Past races and results
        </h2>
        <a href={race.resultsUrl} className={`${linkClass} mt-2`}>
          Official results archive <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Look back at previous editions, from the overall winners to the age-group contests. Read
          the race summaries below or open the full results to find a runner, club or category.
        </p>
        <div className="mt-5 space-y-5">
          {[...race.pastEditions]
            .sort((a, b) => b.year - a.year)
            .map((edition) => (
              <section
                key={edition.year}
                className="rounded-xl border border-border p-5 sm:p-6"
                aria-labelledby={`results-${edition.year}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3
                    id={`results-${edition.year}`}
                    className="font-display text-2xl font-semibold"
                  >
                    {edition.year} {race.name}
                  </h3>
                  <a href={edition.resultsUrl} className={`${linkClass} text-sm`}>
                    Full {edition.year} results{" "}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
                {edition.date ? (
                  <p className="mt-1 text-xs text-muted">
                    <time dateTime={edition.date}>{roadMarathonDate(edition.date)}</time>
                  </p>
                ) : null}
                <p className="mt-3 max-w-3xl text-base leading-7">{edition.summary}</p>
                {edition.categories.length ? (
                  <div className="mt-4 divide-y divide-border">
                    {edition.categories.map((category) => (
                      <section key={category.category} className="py-3">
                        <h4 className="font-semibold">{category.category}</h4>
                        <p className="mt-1 text-sm leading-6 text-muted">{category.summary}</p>
                        <a href={category.sourceUrl} className={`${linkClass} text-xs`}>
                          View result details <ArrowUpRight className="size-3" aria-hidden="true" />
                        </a>
                      </section>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
        </div>
        {!race.pastEditions.length ? (
          <p className="mt-3 text-sm leading-6 text-muted">
            Use the official archive above to find earlier editions and category results.
          </p>
        ) : null}
      </section>
      <section
        id="media"
        aria-labelledby="media-title"
        className="scroll-mt-24 border-t border-border pt-7"
      >
        <h2 id="media-title" className="font-display text-2xl font-semibold">
          Race news, photos and video
        </h2>
        {race.media.length ? (
          <ul className="mt-3 divide-y divide-border">
            {race.media.map((media) => (
              <li key={`${media.kind}-${media.url}`} className="py-3">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  {media.kind}
                </span>
                <a href={media.url} className={`${linkClass} text-sm`}>
                  {media.label}
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <a href={race.officialUrl} className={`${linkClass} mt-3`}>
            Visit the organiser for race updates{" "}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        )}
      </section>
      <section
        id="questions"
        aria-labelledby="questions-title"
        className="scroll-mt-24 border-t border-border pt-7"
      >
        <h2 id="questions-title" className="font-display text-2xl font-semibold">
          Common questions
        </h2>
        <div className="mt-2 divide-y divide-border">
          {questions.map((item) => (
            <section key={item.question} className="py-4">
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{item.answer}</p>
            </section>
          ))}
        </div>
      </section>
      <details className="rounded-xl bg-elevated/40 p-5 text-sm">
        <summary className="cursor-pointer font-semibold">Useful links</summary>
        <p className="mt-3 text-muted">
          Race information, results and reports from the organiser and other linked sources.
        </p>
        <ul className="mt-3 space-y-2">
          {race.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} className="text-accent underline underline-offset-4">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
      <CountryLink country={country}>
        More road marathons in {country.name} <ArrowRight className="size-4" aria-hidden="true" />
      </CountryLink>
    </article>
  );
}
