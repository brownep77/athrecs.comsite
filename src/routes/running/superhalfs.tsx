import { createFileRoute, notFound } from "@tanstack/react-router";
import { SuperHalfsPage } from "@/components/running/SuperHalfsPage";
import { superhalfsHead } from "@/lib/running/superhalfs-seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/running/superhalfs")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => superhalfsHead(),
  component: SuperHalfsPage,
});
