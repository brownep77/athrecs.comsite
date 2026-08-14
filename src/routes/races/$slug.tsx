import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getEventBySlug } from "@/lib/athrecs/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/races/$slug")({
  loader: async ({ params }) => {
    const data = await getEventBySlug({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  component: RacePage,
  notFoundComponent: () => (
    <div className="space-y-4 py-10 text-center">
      <h1 className="font-display text-xl font-semibold">Event not found</h1>
      <Button asChild variant="secondary">
        <Link to="/races">Back to events</Link>
      </Button>
    </div>
  ),
});

function RacePage() {
  const { event } = Route.useLoaderData();
  return (
    <div className="space-y-4 py-8">
      <Link to="/races" className="text-sm font-medium text-muted no-underline hover:text-fg">
        ← Events
      </Link>
      <h1 className="font-display text-3xl font-semibold">{event.name}</h1>
      <p className="text-sm text-muted">
        Full event page is being restored.{" "}
        <Link to="/races" className="text-accent underline">
          Browse all events
        </Link>
      </p>
    </div>
  );
}
