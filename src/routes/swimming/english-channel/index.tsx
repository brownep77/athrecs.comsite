import { createFileRoute, notFound } from "@tanstack/react-router";
import { getChannelDirectory } from "@/lib/athrecs/english-channel-api";
import { ChannelDirectory } from "@/components/swimming/ChannelArchive";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { channelPath } from "@/lib/athrecs/english-channel";
export const Route = createFileRoute("/swimming/english-channel/")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: () => getChannelDirectory(),
  headers: () => ({ "Cache-Control": "private, no-store" }),
  head: ({ loaderData }) => {
    const url = SITE_URL + channelPath;
    return {
      meta: siteGraphMeta({
        title: "English Channel swimmers, biographies & crossing records | AthRecs",
        description:
          "Explore swimmer profiles, dates, elapsed times, relay rosters, recordings and the evidence for selected English Channel swims.",
        url,
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            url,
            name: "English Channel swimmers",
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: loaderData?.length ?? 0,
              itemListElement: loaderData?.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.name,
                url: url + "/" + p.slug,
              })),
            },
          }).replace(/</g, "\\u003c"),
        },
      ],
    };
  },
  component: function EnglishChannelDirectoryPage() {
    return <ChannelDirectory items={Route.useLoaderData()} />;
  },
});
