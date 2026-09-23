import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  Clock3,
  MapPin,
  Medal,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  getHomeDiscovery,
  searchHomeDiscovery,
  type HomeDiscovery,
  type HomePerson,
} from "@/lib/athrecs/home-discovery-api";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { achievementColourClass, distanceColourClass } from "@/lib/athrecs/profile-colours";
import { ShareProfileButton } from "@/components/athletes/ShareProfileButton";
import { useHomeShortlist, type ShortlistItem } from "./use-home-shortlist";

const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg no-underline hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-fg no-underline hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const textLink =
  "inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-accent no-underline hover:underline";
const kinds = ["Athletes", "Events", "Results", "Clubs"] as const;
type SearchKind = (typeof kinds)[number];
const topSports = ["Running", "Athletics", "Cycling", "Swimming", "Triathlon", "Gymnastics"];
const sportLabel = (sport: string) => (sport === "Athletics" ? "Track & field" : sport);
const athleteItem = (person: HomePerson): ShortlistItem => ({
  key: `athlete:${person.slug}`,
  kind: "athlete",
  name: person.name,
  href: `/athletes/${encodeURIComponent(person.slug)}`,
});

export function AthleteDiscoveryHome({ initial }: { initial: HomeDiscovery }) {
  const [sport, setSport] = useState("");
  const [kind, setKind] = useState<SearchKind>("Athletes");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<{
    kind: SearchKind;
    q: string;
    sport?: string;
  } | null>(null);
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const shortlist = useHomeShortlist();
  const feed = useQuery({
    queryKey: ["athrecs-home", sport],
    queryFn: () => getHomeDiscovery({ data: { sport: sport || undefined } }),
    initialData: sport ? undefined : initial,
    staleTime: 60_000,
  });
  const search = useQuery({
    queryKey: ["athrecs-home-search", submitted],
    queryFn: () => searchHomeDiscovery({ data: submitted! }),
    enabled: submitted !== null,
    staleTime: 30_000,
  });
  const data = feed.data;
  const people = data?.people ?? [];
  const spotlight = people[spotlightIndex % Math.max(1, people.length)];
  const results = people
    .flatMap((person) => person.results.map((result) => ({ ...result, person })))
    .sort((a, b) => b.date.localeCompare(a.date) || a.id - b.id)
    .slice(0, 6);
  const events = (data?.events ?? [])
    .filter((event) => !country || event.country === country)
    .slice(0, 3);
  const achievements = people
    .flatMap((person) =>
      person.achievements.slice(0, 1).map((achievement) => ({ ...achievement, person })),
    )
    .slice(0, 3);
  const clubs = [
    ...new Set(people.map((person) => person.club).filter((club): club is string => Boolean(club))),
  ].slice(0, 3);
  const allSports = [...new Set([...topSports, ...initial.directory.sports])];

  function changeSport(value: string) {
    setSport(value);
    setCountry("");
    setSpotlightIndex(0);
    setSubmitted(null);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted({ kind, q: query.trim(), sport: sport || undefined });
  }
  function saveButton(item: ShortlistItem) {
    const saved = shortlist.items.some((entry) => entry.key === item.key);
    return (
      <button
        type="button"
        className={secondary}
        disabled={!shortlist.ready}
        aria-pressed={saved}
        aria-label={`${saved ? "Remove" : "Save"} ${item.name}${saved ? " from" : " to"} my shortlist`}
        onClick={() => shortlist.toggle(item)}
      >
        {saved ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Bookmark className="size-3.5" aria-hidden="true" />
        )}
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <div className="space-y-6 pb-3">
      <nav
        aria-label="Explore sports"
        className="-mx-4 flex flex-wrap items-center gap-1 border-y border-border bg-elevated px-4 py-2 md:-mx-6 md:px-6"
      >
        {["", ...topSports].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={sport === value}
            onClick={() => changeSport(value)}
            className={`min-h-10 rounded-md border px-3 text-xs font-semibold transition-colors ${sport === value ? "border-border bg-surface text-accent" : "border-transparent text-muted hover:text-accent"}`}
          >
            {value ? sportLabel(value) : "All sports"}
          </button>
        ))}
        <label className="ml-auto flex items-center text-xs text-accent">
          <span className="sr-only">Choose any sport</span>
          <select
            value={sport}
            onChange={(event) => changeSport(event.target.value)}
            className="min-h-10 max-w-40 rounded-md border border-border bg-surface px-2"
          >
            <option value="">More sports</option>
            {allSports.map((value) => (
              <option key={value} value={value}>
                {sportLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </nav>

      <section className="grid items-center gap-6 py-1 md:grid-cols-[1.5fr_1fr]">
        <div>
          <Eyebrow>People. Performances. Possibilities.</Eyebrow>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
            Your sporting life,
            <br />
            <span className="text-accent">all in one place.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Discover the athletes behind the results. Celebrate the progress. Find your next start
            line.
          </p>
        </div>
        <aside className="rounded-r-xl border-l-[3px] border-accent bg-elevated p-5">
          <h2 className="font-display text-2xl font-semibold">Your history starts with you.</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Bring your results, personal bests and achievements together in one athlete profile.
          </p>
          <Link to="/athlete-account" className={`${primary} mt-3`}>
            Find my results <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-xs text-muted">
            Your profile starts private. You choose what to share.
          </p>
        </aside>
      </section>

      <section aria-label="Search AthRecs">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-5" aria-label="Search type">
            {kinds.map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={kind === value}
                onClick={() => {
                  setKind(value);
                  setSubmitted(null);
                }}
                className={`min-h-10 border-b-2 text-sm ${kind === value ? "border-accent font-semibold text-accent" : "border-transparent text-muted"}`}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShortlistOpen(!shortlistOpen)}
            aria-expanded={shortlistOpen}
            aria-controls="home-shortlist"
            className={textLink}
          >
            <Bookmark className="size-4" aria-hidden="true" /> My shortlist (
            {shortlist.items.length})
          </button>
        </div>
        <form
          role="search"
          onSubmit={submit}
          className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface p-2"
        >
          <Search className="ml-2 hidden size-5 text-accent sm:block" aria-hidden="true" />
          <label className="sr-only" htmlFor="home-discovery-search">
            {kind === "Results"
              ? "Athlete name to find their results"
              : `Search ${kind.toLowerCase()}`}
          </label>
          <input
            id="home-discovery-search"
            type="search"
            maxLength={120}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              kind === "Events"
                ? "Event name or place…"
                : kind === "Clubs"
                  ? "Club name or place…"
                  : kind === "Results"
                    ? "Athlete name to find their results…"
                    : "Athlete name, club or place…"
            }
            className="h-10 min-w-0 flex-1 rounded-md bg-surface px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <button className={primary} type="submit">
            Search <ArrowRight className="hidden size-4 sm:block" aria-hidden="true" />
          </button>
        </form>
        {submitted ? (
          <div
            className="mt-2 rounded-xl border border-border bg-elevated p-4"
            aria-live="polite"
            aria-busy={search.isFetching}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-accent">
                {submitted.kind} {submitted.q ? `matching “${submitted.q}”` : "to explore"}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(null)}
                className="flex size-10 items-center justify-center"
                aria-label="Close search results"
              >
                <X className="size-4" />
              </button>
            </div>
            {search.isPending ? (
              <p className="text-sm text-muted">Searching…</p>
            ) : search.isError ? (
              <p role="alert" className="text-sm text-muted">
                Search could not load.{" "}
                <button type="button" className="underline" onClick={() => void search.refetch()}>
                  Try again
                </button>
              </p>
            ) : search.data?.length ? (
              <ul className="divide-y divide-border">
                {search.data.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="flex items-center justify-between gap-3 py-3 text-sm no-underline hover:text-accent"
                    >
                      <span>
                        <strong className="block">{item.label}</strong>
                        <span className="mt-1 block text-xs text-muted">{item.detail}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                No matches in the current catalogue. Try another name or choose all sports.
                {submitted.kind === "Events" ? (
                  <Link to="/find-events" className={`${textLink} ml-2`}>
                    Explore event calendars <ArrowRight className="size-3" />
                  </Link>
                ) : null}
              </p>
            )}
            {submitted.kind === "Results" ? (
              <p className="mt-2 text-xs text-muted">
                Open a profile to explore its published results.
              </p>
            ) : null}
          </div>
        ) : null}
        <div
          id="home-shortlist"
          hidden={!shortlistOpen}
          className="mt-3 rounded-xl border border-border bg-elevated p-4"
        >
          <h2 className="font-display text-xl font-semibold">Your sporting shortlist</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Saved on this device. No sign-in needed. Items do not sync across devices.
          </p>
          {shortlist.items.length ? (
            <ul className="mt-3 divide-y divide-border">
              {shortlist.items.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-3 py-2">
                  <a
                    href={item.href}
                    className="min-w-0 text-sm font-semibold text-accent no-underline hover:underline"
                  >
                    {item.name}
                    <span className="ml-2 text-xs font-normal text-muted">{item.kind}</span>
                  </a>
                  <button
                    type="button"
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-surface"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => shortlist.toggle(item)}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Save an athlete, event or club below to start your collection.
            </p>
          )}
          <Link to="/my-athlete-profile" className={`${textLink} mt-2`}>
            Open my athlete profile <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <p role="status" className="mt-2 text-xs text-accent">
          {shortlist.message}
        </p>
      </section>

      {feed.isPending ? (
        <p role="status" className="rounded-xl bg-elevated p-5 text-sm text-muted">
          Loading {sportLabel(sport)}…
        </p>
      ) : feed.isError ? (
        <p role="alert" className="rounded-xl bg-elevated p-5 text-sm">
          This sport could not load.{" "}
          <button
            type="button"
            className="text-accent underline"
            onClick={() => void feed.refetch()}
          >
            Try again
          </button>
        </p>
      ) : (
        <>
          <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section aria-labelledby="recent-performances">
              <SectionHeading
                eyebrow="From public athlete profiles"
                title="Recent performances"
                id="recent-performances"
              >
                <Link to="/athletes" className={textLink}>
                  Explore athletes <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </SectionHeading>
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between gap-3 bg-fg px-4 py-3 text-white">
                  <span className="text-sm font-semibold">
                    {sport ? sportLabel(sport) : "Across the sports"}
                  </span>
                  <span className="text-xs text-white/80">Latest recorded dates</span>
                </div>
                {results.length ? (
                  <ul className="divide-y divide-border">
                    {results.map((result) => (
                      <li key={`${result.person.id}-${result.id}`}>
                        <Link
                          to="/athletes/$slug"
                          params={{ slug: result.person.slug }}
                          className="flex items-center justify-between gap-3 px-4 py-3 no-underline hover:bg-elevated"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-fg">{result.person.name}</p>
                            <p className="mt-1 truncate text-xs text-muted">
                              {result.event} · {result.distance}
                            </p>
                            <p className="mt-1 text-[11px] text-muted">
                              {formatRaceDateShort(result.date)} · {sportLabel(result.sport)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <strong className="text-base tabular-nums text-fg">
                              {result.time === "—" ? "Finished" : result.time}
                            </strong>
                            <p className="mt-1 text-[10px] text-muted">
                              {result.time === "—" ? "View profile" : `${result.basis} time`}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty>
                    No public performances for this sport yet. Search for an athlete or explore
                    another sport.
                  </Empty>
                )}
                <p className="border-t border-border bg-elevated/60 px-4 py-2 text-[11px] leading-5 text-muted">
                  Published profile records, ordered by event date. This is a selection of
                  performances, not a complete event ranking.
                </p>
              </div>
            </section>
            <section aria-labelledby="athlete-spotlight">
              <SectionHeading
                eyebrow="The person behind the performance"
                title="Athlete spotlight"
                id="athlete-spotlight"
              >
                {people.length > 1 ? (
                  <button
                    type="button"
                    className={textLink}
                    onClick={() => setSpotlightIndex((i) => i + 1)}
                  >
                    Next athlete <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </SectionHeading>
              {spotlight ? (
                <article className="rounded-xl border border-border bg-elevated/50 p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-xl font-semibold text-accent"
                      aria-hidden="true"
                    >
                      {spotlight.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((s) => s[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to="/athletes/$slug"
                        params={{ slug: spotlight.slug }}
                        className="font-display text-2xl font-semibold text-fg no-underline hover:text-accent"
                      >
                        {spotlight.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {[spotlight.club, spotlight.country].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-accent">
                    {spotlight.sports.map(sportLabel).join(" · ")}
                  </p>
                  {spotlight.bests.length ? (
                    <>
                      <h3 className="mt-4 flex items-center gap-2 text-xs font-semibold">
                        <Trophy className="size-4 text-accent" aria-hidden="true" /> Personal bests
                        in their record
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {spotlight.bests.map((best) => (
                          <a
                            key={best.id}
                            href={`/athletes/${encodeURIComponent(spotlight.slug)}`}
                            className={`rounded-lg border p-3 no-underline ${distanceColourClass(best.distance, best.distanceKm)}`}
                          >
                            <span className="block text-xs">
                              {best.distance} · {best.surface}
                            </span>
                            <strong className="mt-1 block text-xl tabular-nums">
                              {best.value}
                            </strong>
                            <span className="mt-1 block text-[10px]">
                              {best.sport} · {best.basis}
                            </span>
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-muted">
                      Explore {spotlight.resultCount} completed{" "}
                      {spotlight.resultCount === 1 ? "performance" : "performances"} in this
                      athlete’s public record.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to="/athletes/$slug"
                      params={{ slug: spotlight.slug }}
                      className={primary}
                    >
                      View profile <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    {saveButton(athleteItem(spotlight))}
                  </div>
                </article>
              ) : (
                <div className="rounded-xl border border-border bg-elevated/50 p-5">
                  <Empty>Your sporting story could be next.</Empty>
                  <Link to="/my-athlete-profile" className={primary}>
                    Build my profile <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          <section aria-labelledby="upcoming-events">
            <SectionHeading
              eyebrow="Something to look forward to"
              title="Find your next event"
              id="upcoming-events"
            >
              <label className="text-xs text-muted">
                <span className="sr-only">Filter featured events by country</span>
                <select
                  className="min-h-10 max-w-48 rounded-lg border border-border bg-surface px-2"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                >
                  <option value="">All featured countries</option>
                  {[...new Set(data?.events.map((event) => event.country))].sort().map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            </SectionHeading>
            {events.length ? (
              <div className="grid gap-3 md:grid-cols-3">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="flex flex-col rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-accent-soft px-2 py-1 text-[11px] font-semibold text-accent">
                        {sportLabel(event.sport)}
                      </span>
                      <span className="text-[11px] font-semibold text-muted">
                        {formatRaceDateShort(event.date)}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold leading-tight">
                      <a href={event.href} className="text-fg no-underline hover:text-accent">
                        {event.name}
                      </a>
                    </h3>
                    <p className="mt-3 flex gap-1.5 text-xs text-muted">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      {event.location}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {event.distance || "See event details"}
                    </p>
                    <p className="mt-2 flex gap-1.5 text-xs text-muted">
                      <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
                      {event.time
                        ? `${event.time} · venue local time`
                        : "Start time to be confirmed"}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <a href={event.href} className={textLink}>
                        {event.destination} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </a>
                      {saveButton({
                        key: `event:${event.id}`,
                        kind: "event",
                        name: event.name,
                        href: event.href,
                      })}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-elevated/40">
                <Empty>
                  No upcoming events for this selection yet. Explore the specialist calendars below.
                </Empty>
              </div>
            )}
            <div className="mt-2 flex flex-wrap justify-between gap-2">
              <Link to="/find-events" className={textLink}>
                Explore all event calendars <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <a href="https://www.runrecs.com/races" className={textLink}>
                More running events on RunRecs{" "}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </section>

          <div className="grid gap-6 rounded-xl border border-border bg-elevated/60 p-4 sm:p-5 lg:grid-cols-[1.4fr_1fr]">
            <section aria-labelledby="home-achievements">
              <SectionHeading
                eyebrow="Every milestone has a story"
                title="Achievements worth sharing"
                id="home-achievements"
              />
              {achievements.length ? (
                <ul className="space-y-3">
                  {achievements.map((achievement) => (
                    <li
                      key={`${achievement.person.id}-${achievement.id}`}
                      className="flex gap-3 rounded-lg border border-border bg-surface p-3"
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${achievementColourClass(achievement.id)}`}
                      >
                        <Medal className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <Link
                          to="/athletes/$slug"
                          params={{ slug: achievement.person.slug }}
                          className="text-sm font-semibold text-fg no-underline hover:text-accent"
                        >
                          {achievement.person.name}
                        </Link>
                        <p className="mt-1 text-sm font-medium">{achievement.title}</p>
                        <p className="mt-1 text-[11px] leading-5 text-muted">{achievement.rule}</p>
                        <div className="mt-2">
                          <ShareProfileButton
                            compact
                            path={`/athletes/${encodeURIComponent(achievement.person.slug)}`}
                            title={achievement.person.name}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Your first event, a new personal best, years of showing up. Bring your results
                  together to see your own milestones.
                </p>
              )}
              <Link to="/my-athlete-profile" className={`${textLink} mt-2`}>
                See my sporting achievements <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </section>
            <section aria-labelledby="home-clubs">
              <SectionHeading eyebrow="Find your people" title="Better together" id="home-clubs" />
              <p className="mb-4 text-sm leading-6 text-muted">
                Discover the clubs behind the athletes and the people who share your sport.
              </p>
              {clubs.length ? (
                <ul className="divide-y divide-border">
                  {clubs.map((club) => {
                    const href = `/athletes?q=${encodeURIComponent(club)}`;
                    return (
                      <li key={club} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <a
                            href={href}
                            className="text-sm font-semibold text-fg no-underline hover:text-accent"
                          >
                            {club}
                          </a>
                          <p className="mt-1 text-xs text-muted">Explore public athlete profiles</p>
                        </div>
                        {saveButton({ key: `club:${club}`, kind: "club", name: club, href })}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex gap-3 rounded-lg border border-border bg-surface p-4">
                  <Users className="size-6 shrink-0 text-accent" aria-hidden="true" />
                  <p className="text-sm leading-6 text-muted">
                    Find a club, discover its athletes and explore their sporting records.
                  </p>
                </div>
              )}
              <Link to="/clubs" className={`${textLink} mt-3`}>
                Explore the club directory <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </section>
          </div>
        </>
      )}

      <section className="flex flex-col justify-between gap-4 border-y border-border py-5 sm:flex-row sm:items-center">
        <div>
          <Eyebrow>Every sport. Every season. One athlete.</Eyebrow>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            Make room for your whole sporting story.
          </h2>
          <p className="mt-2 text-xs text-muted">
            {initial.directory.publicAthletes.toLocaleString("en-GB")} public profiles ·{" "}
            {initial.directory.publicResults.toLocaleString("en-GB")} recorded results
          </p>
        </div>
        <Link to="/join" className={`${primary} shrink-0`}>
          Build my profile <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">{children}</p>
  );
}
function SectionHeading({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return <p className="p-4 text-sm leading-6 text-muted">{children}</p>;
}
