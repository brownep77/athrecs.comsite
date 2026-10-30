import type { Podcast, PodcastPerson } from "../../data/podcasts";

export function podcastJsonLd(podcast: Podcast, origin: string) {
  const url = `${origin}/podcasts/${podcast.slug}`;
  const person = (p: PodcastPerson) => ({
    "@type": "Person",
    name: p.name,
    ...(p.slug ? { url: `${origin}/athletes/${p.slug}` } : {}),
  });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastSeries",
        "@id": `${url}#series`,
        name: podcast.name,
        description: podcast.description,
        url,
        sameAs: podcast.listen.map((link) => link.url),
        author: podcast.hosts.map(person),
        hasPart: podcast.episodes.map((episode) => ({
          "@type": "PodcastEpisode",
          name: episode.title,
          datePublished: episode.date,
          url: episode.url,
          description: episode.summary,
          ...(episode.guests.length ? { actor: episode.guests.map(person) } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "AthRecs", item: origin },
          { "@type": "ListItem", position: 2, name: "Podcasts", item: `${origin}/podcasts` },
          { "@type": "ListItem", position: 3, name: podcast.name, item: url },
        ],
      },
    ],
  };
}
