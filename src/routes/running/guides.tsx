import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { RunningGuidesPage } from "@/components/running/RunningGuidesPage";
import { RUNNING_GUIDES_PATH, runningGuideDirectoryJsonLd } from "@/lib/running/guide-directory";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

const loadDirectory = createServerFn({ method: "GET" }).handler(async () => {
  const { getRunningGuideDirectory } = await import("@/lib/running/guide-directory.server");
  return {
    ...(await getRunningGuideDirectory()),
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  };
});

export const Route = createFileRoute("/running/guides")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: () => loadDirectory(),
  head: ({ loaderData }) => ({
    links: [{ rel: "canonical", href: `${SITE_URL}${RUNNING_GUIDES_PATH}` }],
    meta: [
      ...siteGraphMeta({
        title: "Running guides by country & race series | AthRecs",
        description:
          "Find marathon, half-marathon and ultra guides by country. Explore SuperHalfs, World Marathon Majors and UTMB, with courses, entry details and runner information.",
        url: `${SITE_URL}${RUNNING_GUIDES_PATH}`,
      }),
      ...(loaderData?.release ? [{ name: "athrecs-release", content: loaderData.release }] : []),
    ],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(runningGuideDirectoryJsonLd(loaderData)),
          },
        ]
      : [],
  }),
  component: Page,
});

function Page() {
  return <RunningGuidesPage directory={Route.useLoaderData()} />;
}
