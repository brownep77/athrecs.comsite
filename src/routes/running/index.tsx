import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { RunningLanding, runningGuidesJsonLd } from "@/components/running/RunningLanding";

export const Route = createFileRoute("/running/")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    meta: siteGraphMeta({
      title: "Running Races, Calendars & Race Guides | ATHRECS",
      description:
        "Search running races and parkruns, browse race calendars, and explore marathon, half marathon and ultra guides on AthRecs.",
      url: `${SITE_URL}/running`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/running` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(runningGuidesJsonLd(`${SITE_URL}/running`)),
      },
    ],
  }),
  component: RunningLanding,
});
