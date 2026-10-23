import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SUPERHALFS_PATH } from "@/data/superhalfs";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/superhalfs")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
    throw redirect({ to: SUPERHALFS_PATH, statusCode: 301 });
  },
});
