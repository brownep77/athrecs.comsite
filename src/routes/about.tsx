import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/about")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
    throw redirect({ to: "/about-us", statusCode: 301 });
  },
});
