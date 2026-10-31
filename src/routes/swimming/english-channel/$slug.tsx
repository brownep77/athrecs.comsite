import { createFileRoute, notFound } from "@tanstack/react-router";
import { getChannelSwimmer } from "@/lib/athrecs/english-channel-api";
import { ChannelArticle } from "@/components/swimming/ChannelArchive";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { breadcrumbJsonLd } from "@/lib/athrecs/breadcrumbs";
import { channelPath } from "@/lib/athrecs/english-channel";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
export const Route = createFileRoute("/swimming/english-channel/$slug")({
  beforeLoad: ({ params }) => {
    if (IS_RUNRECS_SITE || !/^[a-z0-9-]{1,140}$/.test(params.slug)) throw notFound();
  },
  loader: async ({ params }) => {
    const page = await getChannelSwimmer({ data: params.slug });
    if (!page) throw notFound();
    return page;
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  head: ({ loaderData: p }) => {
    if (!p) return { meta: [{ name: "robots", content: "noindex" }] };
    const path = channelPath + "/" + p.slug,
      url = SITE_URL + path,
      athlete = SITE_URL + "/athletes/" + p.slug;
    const refs = [
      ...new Set(
        [...p.sources, ...p.crossings, ...p.otherEvents].flatMap((c) =>
          c.lines.flatMap((l) => (l.url ? [l.url] : [])),
        ),
      ),
    ];
    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": url + "#article",
          url,
          mainEntityOfPage: url,
          headline: p.name + "’s English Channel swims",
          dateModified: p.checkedAt,
          about: { "@id": athlete + "#athlete" },
          citation: refs,
          author: { "@type": "Organization", name: "AthRecs" },
        },
        {
          "@type": "Person",
          "@id": athlete + "#athlete",
          name: p.name,
          alternateName: p.aliases,
          url: athlete,
          nationality: p.flags.map((f) => ({ "@type": "Country", name: f.label })),
        },
      ],
    };
    return {
      meta: siteGraphMeta({
        title: p.name + " — English Channel dates, times & evidence | AthRecs",
        description: p.name + "’s English Channel swims. " + p.highlight,
        url,
        type: "article",
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        graph,
        breadcrumbJsonLd([
          { name: "English Channel swimmers", path: channelPath },
          { name: p.name, path },
        ]),
      ].map((g) => ({
        type: "application/ld+json",
        children: JSON.stringify(g).replace(/</g, "\\u003c"),
      })),
    };
  },
  component: () => <ChannelArticle p={Route.useLoaderData()} />,
});
