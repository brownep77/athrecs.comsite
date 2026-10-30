import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPodcast } from "@/data/podcasts";
import { PodcastPage } from "@/components/podcasts/PodcastPages";
import { podcastJsonLd } from "@/lib/athrecs/podcast-jsonld";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/podcasts/$slug")({
  loader: ({ params }) => {
    if (IS_RUNRECS_SITE) throw notFound();
    const podcast = getPodcast(params.slug);
    if (!podcast) throw notFound();
    return { slug: podcast.slug };
  },
  head: ({ loaderData }) => {
    const podcast = loaderData ? getPodcast(loaderData.slug) : undefined;
    if (!podcast) return {};
    const url = `${SITE_URL}/podcasts/${podcast.slug}`;
    return {
      links: [{ rel: "canonical", href: url }],
      meta: siteGraphMeta({
        title: `${podcast.name}: hosts, guests & episode previews | AthRecs`,
        description: podcast.description,
        url,
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(podcastJsonLd(podcast, SITE_URL)).replace(/</g, "\\u003c"),
        },
      ],
    };
  },
  component: PodcastRoute,
});

function PodcastRoute() {
  const { slug } = Route.useLoaderData();
  const podcast = getPodcast(slug);
  if (!podcast) return null;
  return <PodcastPage podcast={podcast} />;
}
