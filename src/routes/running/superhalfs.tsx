import { createServerFn } from "@tanstack/react-start";
import { isResultDocument } from "@/lib/athrecs/result-document";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SuperHalfsPage } from "@/components/running/SuperHalfsPage";
import { superhalfsHead } from "@/lib/running/superhalfs-seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

const getSuperHalfsRaces = createServerFn({ method: "GET" }).handler(async () => {
  const { SUPERHALFS_RACES } = await import("@/data/superhalfs");
  return SUPERHALFS_RACES.map((race) => ({
    ...race,
    resultsUrl: "",
    sources: race.sources.filter(
      (source) => source.url !== race.resultsUrl && !isResultDocument(source.url, source.label),
    ),
  }));
});

export const Route = createFileRoute("/running/superhalfs")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: () => getSuperHalfsRaces(),
  head: ({ loaderData }) => superhalfsHead(loaderData ?? []),
  component: SuperHalfsRoute,
});

function SuperHalfsRoute() {
  const races = Route.useLoaderData();
  return <SuperHalfsPage races={races} />;
}
