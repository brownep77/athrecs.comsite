import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { RunningSeriesGuidePage } from "@/components/running/RunningSeriesGuidePage";
import { runningSeriesGuideHead } from "@/lib/running/series-guides";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

const loadGuide = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => {
    if (typeof data?.slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(data.slug))
      throw new Error("Invalid running-series guide");
    return data;
  })
  .handler(async ({ data }) => {
    const { getRunningSeriesGuide } = await import("@/lib/running/series-guides.server");
    return getRunningSeriesGuide(data.slug);
  });

export const Route = createFileRoute("/running/series/$series")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: async ({ params }) => {
    if (!/^[a-z0-9-]{1,100}$/.test(params.series)) throw notFound();
    const data = await loadGuide({ data: { slug: params.series } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => (loaderData ? runningSeriesGuideHead(loaderData.guide) : {}),
  component: SeriesGuideRoute,
});

function SeriesGuideRoute() {
  return <RunningSeriesGuidePage {...Route.useLoaderData()} />;
}
