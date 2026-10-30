import { Link } from "@tanstack/react-router";
import { ExternalLink, Headphones, Mic } from "lucide-react";
import type { Podcast, PodcastEpisode, PodcastPerson } from "@/data/podcasts";
import { PODCASTS } from "@/data/podcasts";

const card = "rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6";
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.16em] text-accent";

function PersonName({ person }: { person: PodcastPerson }) {
  return person.slug ? (
    <Link
      to="/athletes/$slug"
      params={{ slug: person.slug }}
      className="font-semibold text-accent underline underline-offset-2"
    >
      {person.name}
    </Link>
  ) : (
    <span className="font-semibold">{person.name}</span>
  );
}

function PeopleList({ people }: { people: PodcastPerson[] }) {
  return (
    <>
      {people.map((person, index) => (
        <span key={person.name}>
          {index ? (index === people.length - 1 ? " and " : ", ") : ""}
          <PersonName person={person} />
        </span>
      ))}
    </>
  );
}

/** Other podcasts in the section where this person is a host. */
function hostedElsewhere(person: PodcastPerson, current: Podcast) {
  if (!person.slug) return [];
  return PODCASTS.filter(
    (podcast) =>
      podcast.slug !== current.slug && podcast.hosts.some((host) => host.slug === person.slug),
  );
}

/** Episodes on other shows in the section featuring this person. */
function appearancesElsewhere(person: PodcastPerson, current: Podcast) {
  return PODCASTS.filter((podcast) => podcast.slug !== current.slug).flatMap((podcast) =>
    podcast.episodes
      .filter((episode) =>
        episode.guests.some((guest) =>
          person.slug ? guest.slug === person.slug : guest.name === person.name,
        ),
      )
      .map((episode) => ({ podcast, episode })),
  );
}

function EpisodeCard({ podcast, episode }: { podcast: Podcast; episode: PodcastEpisode }) {
  const crossLinks: { key: string; text: string; slug: string; hash?: string }[] =
    episode.guests.flatMap((guest) => [
      ...hostedElsewhere(guest, podcast).map((other) => ({
        key: `${guest.name}-host-${other.slug}`,
        text: `${guest.name} hosts ${other.name}`,
        slug: other.slug,
      })),
      ...appearancesElsewhere(guest, podcast).map(({ podcast: other, episode: appearance }) => ({
        key: `${guest.name}-guest-${other.slug}-${appearance.slug}`,
        text: `${guest.name} also appeared on ${other.name}`,
        slug: other.slug,
        hash: `episode-${appearance.slug}`,
      })),
    ]);
  return (
    <article id={`episode-${episode.slug}`} className={`${card} scroll-mt-24 space-y-4`}>
      <header className="space-y-2">
        <time dateTime={episode.date} className="text-sm font-semibold text-accent">
          {episode.displayDate}
        </time>
        <h3 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
          {episode.title}
        </h3>
        <p className="text-sm text-muted">
          {episode.guests.length ? (
            <>
              With <PeopleList people={episode.guests} />
            </>
          ) : (
            "Hosts only"
          )}
        </p>
      </header>
      {episode.guestBio ? (
        <div className="rounded-xl bg-elevated p-4 text-sm leading-6">
          <p className="mb-1 font-semibold">Who's on</p>
          <p>{episode.guestBio}</p>
        </div>
      ) : null}
      <p className="leading-7">{episode.summary}</p>
      <div>
        <p className="mb-2 font-semibold">In this episode</p>
        <ul className="list-disc space-y-1.5 pl-5 leading-7">
          {episode.takeaways.map((takeaway) => (
            <li key={takeaway}>{takeaway}</li>
          ))}
        </ul>
      </div>
      {episode.mentioned.length ? (
        <p className="text-sm leading-6">
          <span className="font-semibold">Athletes mentioned: </span>
          {episode.mentioned.map((person, index) => (
            <span key={person.name}>
              {index ? " · " : ""}
              <PersonName person={person} />
              {person.note ? <span className="text-muted"> ({person.note})</span> : null}
            </span>
          ))}
        </p>
      ) : null}
      {crossLinks.length ? (
        <ul className="space-y-1 text-sm">
          {crossLinks.map((link) => (
            <li key={link.key}>
              <Link
                to="/podcasts/$slug"
                params={{ slug: link.slug }}
                hash={link.hash}
                className="text-accent underline underline-offset-2"
              >
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <a
        href={episode.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg no-underline"
      >
        <Headphones className="size-4" aria-hidden="true" />
        Listen to the episode
        <span className="sr-only">(opens on the podcast's site)</span>
      </a>
    </article>
  );
}

export function PodcastIndex() {
  const latest = PODCASTS.flatMap((podcast) =>
    podcast.episodes
      .filter((episode) => episode.guests.length)
      .map((episode) => ({ podcast, episode })),
  )
    .sort((a, b) => b.episode.date.localeCompare(a.episode.date))
    .slice(0, 6);
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className={eyebrow}>Podcasts</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Athletes' podcasts
        </h1>
        <p className="text-lg leading-8 text-muted">
          The best running and endurance podcasts hosted by athletes, with background on the hosts,
          previews of recent episodes and links to the AthRecs profiles of everyone on the mic.
        </p>
      </header>
      <section aria-labelledby="shows-heading" className="space-y-4">
        <h2 id="shows-heading" className="font-display text-2xl font-semibold">
          The shows
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {PODCASTS.map((podcast) => (
            <li key={podcast.slug} className={`${card} flex flex-col gap-3`}>
              <Mic className="size-6 text-accent" aria-hidden="true" />
              <h3 className="font-display text-xl font-semibold leading-snug">
                <Link
                  to="/podcasts/$slug"
                  params={{ slug: podcast.slug }}
                  className="text-fg no-underline hover:text-accent"
                >
                  {podcast.name}
                </Link>
              </h3>
              <p className="text-sm text-muted">
                Hosted by <PeopleList people={podcast.hosts.filter((host) => host.slug)} />
              </p>
              <p className="flex-1 text-sm leading-6">{podcast.tagline}</p>
              <Link
                to="/podcasts/$slug"
                params={{ slug: podcast.slug }}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
              >
                Hosts and episode previews →
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="latest-heading" className="space-y-4">
        <h2 id="latest-heading" className="font-display text-2xl font-semibold">
          Latest guests
        </h2>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {latest.map(({ podcast, episode }) => (
            <li key={`${podcast.slug}-${episode.slug}`} className="space-y-1 p-4 sm:p-5">
              <p className="text-sm text-muted">
                <time dateTime={episode.date}>{episode.displayDate.split(" · ")[0]}</time> ·{" "}
                {podcast.name}
              </p>
              <p className="leading-7">
                <PeopleList people={episode.guests} />
                {" — "}
                <Link
                  to="/podcasts/$slug"
                  params={{ slug: podcast.slug }}
                  hash={`episode-${episode.slug}`}
                  className="text-accent underline underline-offset-2"
                >
                  {episode.summary}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </section>
      <aside className="space-y-3 rounded-xl border border-border bg-elevated p-6">
        <h2 className="font-display text-2xl font-semibold">Host a sports podcast?</h2>
        <p className="leading-7">
          We're adding more athlete-hosted shows. Get in touch and we'll preview your episodes and
          link your guests to their AthRecs profiles.
        </p>
        <a
          href="mailto:info@athrecs.com?subject=Podcast%20feature%20on%20AthRecs"
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2 font-semibold text-primary-fg"
        >
          Contact AthRecs
        </a>
      </aside>
    </div>
  );
}

export function PodcastPage({ podcast }: { podcast: Podcast }) {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link
        to="/podcasts"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
      >
        All podcasts
      </Link>
      <header className="space-y-3 border-b border-border pb-6">
        <p className={eyebrow}>Podcast</p>
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {podcast.name}
        </h1>
        <p className="text-lg leading-8 text-muted">{podcast.tagline}</p>
        <p className="text-sm text-muted">
          Hosted by <PeopleList people={podcast.hosts} />
        </p>
      </header>
      <nav aria-label="On this page" className="rounded-xl border border-border bg-surface p-5">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li>
            <a href="#hosts" className="text-accent underline underline-offset-2">
              {podcast.hosts.length > 1 ? "The hosts" : "The host"}
            </a>
          </li>
          <li>
            <a href="#about" className="text-accent underline underline-offset-2">
              About the show
            </a>
          </li>
          <li>
            <a href="#episodes" className="text-accent underline underline-offset-2">
              Episode previews
            </a>
          </li>
          <li>
            <a href="#listen" className="text-accent underline underline-offset-2">
              Where to listen
            </a>
          </li>
        </ul>
      </nav>
      <section id="hosts" aria-labelledby="hosts-heading" className="scroll-mt-24 space-y-4">
        <h2 id="hosts-heading" className="font-display text-2xl font-semibold">
          {podcast.hosts.length > 1 ? "The hosts" : "The host"}
        </h2>
        {podcast.hosts.map((host) => (
          <div key={host.name} className={`${card} space-y-3`}>
            <div>
              <h3 className="font-display text-xl font-semibold">{host.name}</h3>
              <p className="text-sm text-muted">{host.role}</p>
            </div>
            {host.bio.map((paragraph) => (
              <p key={paragraph} className="leading-7">
                {paragraph}
              </p>
            ))}
            {host.slug ? (
              <Link
                to="/athletes/$slug"
                params={{ slug: host.slug }}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
              >
                View {host.name}'s athlete profile →
              </Link>
            ) : null}
          </div>
        ))}
      </section>
      <section id="about" aria-labelledby="about-heading" className="scroll-mt-24 space-y-4">
        <h2 id="about-heading" className="font-display text-2xl font-semibold">
          About the show
        </h2>
        {podcast.about.map((paragraph) => (
          <p key={paragraph} className="leading-8">
            {paragraph}
          </p>
        ))}
        <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-border p-5 sm:grid-cols-2">
          {podcast.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-muted">{fact.label}</dt>
              <dd className="font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section id="episodes" aria-labelledby="episodes-heading" className="scroll-mt-24 space-y-4">
        <h2 id="episodes-heading" className="font-display text-2xl font-semibold">
          Episode previews
        </h2>
        <p className="text-sm text-muted">
          Our summaries of recent episodes, written from each episode's official description. Tap a
          name to see that athlete's AthRecs profile.
        </p>
        {podcast.episodes.map((episode) => (
          <EpisodeCard key={episode.slug} podcast={podcast} episode={episode} />
        ))}
      </section>
      <section id="listen" aria-labelledby="listen-heading" className="scroll-mt-24 space-y-3">
        <h2 id="listen-heading" className="font-display text-2xl font-semibold">
          Where to listen
        </h2>
        <ul className="flex flex-wrap gap-2">
          {podcast.listen.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-accent no-underline hover:border-accent"
              >
                {link.label}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          AthRecs is not affiliated with {podcast.name}. Episode details checked{" "}
          {new Date(`${podcast.checkedAt}T12:00:00Z`).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      </section>
      <aside className="space-y-3 rounded-xl border border-border bg-elevated p-6">
        <h2 className="font-display text-2xl font-semibold">Keep your own record</h2>
        <p className="leading-7">
          Every result, PB and medal in one athlete profile — free, and yours for life.
        </p>
        <Link
          to="/join"
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2 font-semibold text-primary-fg"
        >
          Create your athlete profile
        </Link>
      </aside>
    </article>
  );
}
