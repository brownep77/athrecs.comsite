import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { FeaturedRoadRace } from "@/data/featured-road-races";
import {
  featuredDate,
  featuredCaption,
  featuredCardPath,
  isUpcomingFeaturedRace,
} from "@/lib/running/featured-road-races";
import { useRaceDateRefresh } from "./use-race-date-refresh";

const linkStyle =
  "inline-flex min-h-11 items-center text-base font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent";
const countries = [
  "Worldwide",
  "United Kingdom",
  "Australia",
  "USA",
  "Canada",
  "New Zealand",
  "Ireland",
  "Other countries",
];

function OfficialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkStyle}>
      {children}
    </a>
  );
}

export function FeaturedRaceCollection({
  races,
  now,
}: {
  races: readonly FeaturedRoadRace[];
  now: string;
}) {
  const [country, setCountry] = useState("Worldwide");
  useRaceDateRefresh(
    races.map((race) => race.timezone),
    now,
  );
  const selected = races
    .filter(
      (race) =>
        country === "Worldwide" ||
        (country === "Other countries"
          ? !countries.includes(race.country)
          : country === race.country),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="space-y-6 pb-8">
      <Link to="/running" className={linkStyle}>
        Running guides
      </Link>
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          AthRecs · Race previews
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Big races. Who's running?
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Major road races, the courses that make them special and the athletes confirmed for the
          start line.
        </p>
      </header>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter previews by country">
        {countries.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={country === name}
            onClick={() => setCountry(name)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${country === name ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface hover:border-accent"}`}
          >
            {name === "United Kingdom" ? "UK" : name}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        {selected.length} upcoming {selected.length === 1 ? "race" : "races"}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {selected.map((race) => (
          <article
            key={race.slug}
            className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card"
          >
            <p className="text-sm font-semibold text-accent">{featuredDate(race)}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              <Link
                to="/running/previews/$slug"
                params={{ slug: race.slug }}
                className="hover:text-accent"
              >
                {race.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted">
              {race.city} · {race.country}
            </p>
            <p className="mt-3 text-sm font-semibold">{race.distance} · Road</p>
            <p className="mt-4 flex-1 text-base leading-7">{race.summary}</p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-semibold">
                {race.athletes.length
                  ? "Confirmed athletes"
                  : "Athlete field awaiting announcement"}
              </p>
              {race.athletes.length ? (
                <p className="mt-1 text-sm leading-6 text-muted">
                  {race.athletes.map((athlete) => athlete.name).join(" · ")}
                </p>
              ) : null}
              <Link
                to="/running/previews/$slug"
                params={{ slug: race.slug }}
                className={`${linkStyle} mt-2`}
              >
                Read race preview
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!selected.length ? (
        <p className="rounded-xl bg-elevated p-6 text-base">
          No upcoming previews in this selection. Choose another country or explore the running
          guides.
        </p>
      ) : null}
    </div>
  );
}

function SharePreview({ race }: { race: FeaturedRoadRace }) {
  const [message, setMessage] = useState("");
  const caption = featuredCaption(race);
  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setMessage("Caption copied");
    } catch {
      setMessage("Select the caption below and copy it.");
    }
  }
  return (
    <details className="rounded-xl border border-border p-5 sm:p-6">
      <summary className="min-h-11 cursor-pointer text-lg font-semibold">
        Share this preview on Instagram
      </summary>
      <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <img
          src={featuredCardPath(race)}
          alt={`${race.name} race preview card`}
          width={1080}
          height={1350}
          loading="lazy"
          className="w-full rounded-lg"
        />
        <div>
          <p className="text-sm leading-6 text-muted">
            Download the portrait card and use the caption below. Put the preview URL in your bio or
            a Story link sticker so people can open it.
          </p>
          <textarea
            aria-label="Instagram caption"
            value={caption}
            readOnly
            className="mt-4 min-h-56 w-full rounded-lg border border-border bg-bg p-4 text-base leading-7"
          />
          <div className="mt-3 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => void copyCaption()}
              className="min-h-11 rounded-lg bg-primary px-5 text-base font-semibold text-primary-fg"
            >
              Copy caption
            </button>
            <a href={featuredCardPath(race)} download={`${race.slug}.png`} className={linkStyle}>
              Download Instagram card
            </a>
          </div>
          <p role="status" className="mt-2 text-sm">
            {message}
          </p>
        </div>
      </div>
    </details>
  );
}

export function FeaturedRacePreview({ race, now }: { race: FeaturedRoadRace; now: string }) {
  useRaceDateRefresh([race.timezone], now);
  const upcoming = isUpcomingFeaturedRace(race, now);
  return (
    <article className="mx-auto max-w-4xl space-y-7 pb-8">
      <Link to="/running/featured-races" className={linkStyle}>
        All featured races
      </Link>
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          AthRecs · {upcoming ? "Race preview" : "Previous race preview"}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {race.name} {race.date.slice(0, 4)}
        </h1>
        <p className="mt-4 text-lg font-semibold text-accent">{featuredDate(race)}</p>
        <p className="mt-2 text-base text-muted">
          {race.city}, {race.country} · {race.distance} · Road
        </p>
        <p className="mt-5 text-lg leading-8">{race.summary}</p>
        {!upcoming ? (
          <p className="mt-4 rounded-lg bg-elevated p-4 text-base">
            This edition has taken place. This preview records the pre-race information; follow the
            official results link below for the outcome.
          </p>
        ) : null}
      </header>
      <div className="grid gap-6 border-y border-border py-7 sm:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold">The course</h2>
          <p className="mt-3 text-base leading-7">{race.course}</p>
          {race.courseUrl ? (
            <OfficialLink href={race.courseUrl}>Official course details</OfficialLink>
          ) : null}
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold">Entry options</h2>
          <p className="mt-3 text-base leading-7">{race.entry}</p>
          <p className="mt-2 text-sm text-muted">
            Availability checked {race.checkedAt}. Confirm the edition and current status with the
            organiser.
          </p>
          <OfficialLink href={race.entryUrl}>Official entry information</OfficialLink>
        </section>
      </div>
      <section aria-labelledby="athletes-to-watch">
        <h2 id="athletes-to-watch" className="font-display text-2xl font-semibold">
          {upcoming ? "Athletes to watch" : "Athletes announced before the race"}
        </h2>
        {race.athletes.length ? (
          <>
            <p className="mt-3 text-base leading-7 text-muted">
              Named in the organiser's announcement for this edition. Start lists can change.
            </p>
            <ul className="mt-4 divide-y divide-border">
              {race.athletes.map((athlete) => (
                <li
                  key={athlete.name}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3"
                >
                  <a
                    href={athlete.profileUrl ?? athlete.announcementUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyle}
                  >
                    {athlete.name}
                  </a>
                  <div className="flex flex-wrap gap-5">
                    <OfficialLink href={athlete.announcementUrl}>Race announcement</OfficialLink>
                    {athlete.instagram ? (
                      <OfficialLink href={`https://www.instagram.com/${athlete.instagram}/`}>
                        @{athlete.instagram}
                      </OfficialLink>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-base leading-7 text-muted">
            A named athlete field has not been confirmed in the official sources checked for this
            edition.
          </p>
        )}
      </section>
      <section className="rounded-xl bg-elevated p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold">Follow the race</h2>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
          <OfficialLink href={race.officialUrl}>Official race website</OfficialLink>
          <OfficialLink href={race.resultsUrl}>Official results and archives</OfficialLink>
        </div>
      </section>
      {upcoming ? <SharePreview race={race} /> : null}
      <details className="border-t border-border pt-4">
        <summary className="min-h-11 cursor-pointer text-sm font-semibold text-muted">
          Sources · Checked {race.checkedAt}
        </summary>
        <ul className="mt-2 space-y-1">
          {race.sources.map((source) => (
            <li key={source.url}>
              <OfficialLink href={source.url}>{source.label}</OfficialLink>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}
