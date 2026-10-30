import { createFileRoute, notFound } from "@tanstack/react-router";
import { PodcastIndex } from "@/components/podcasts/PodcastPages";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/podcasts/")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/podcasts` }],
    meta: siteGraphMeta({
      title: "Athletes' podcasts: hosts, guests & episode previews | ATHRECS.com",
      description:
        "Running and endurance podcasts hosted by athletes, including UNTAPPED with Spencer Matthews, Paula's Run Club and The Rich Roll Podcast, with episode previews and guest profiles.",
      url: `${SITE_URL}/podcasts`,
    }),
  }),
  component: PodcastIndex,
});
