import { createFileRoute, Link } from "@tanstack/react-router";
import { listClubs } from "@/lib/athrecs/api";
import { ClubRegistration } from "@/components/clubs/ClubRegistration";

export const Route = createFileRoute("/clubs/register")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { club?: string; missing?: boolean; application?: string } => ({
    club: typeof search.club === "string" ? search.club.slice(0, 180) : undefined,
    missing: search.missing === true || search.missing === "true" || undefined,
    application:
      typeof search.application === "string" ? search.application.slice(0, 36) : undefined,
  }),
  loaderDeps: ({ search }) => ({ club: search.club }),
  loader: async ({ deps }) =>
    deps.club ? (await listClubs({ data: {} })).find((c) => c.slug === deps.club) : undefined,
  head: () => ({
    meta: [
      { title: "Register your club | ATHRECS" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClubRegistrationPage,
});
function ClubRegistrationPage() {
  const club = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <Link to="/clubs" className="text-accent underline">
          ← Club directory
        </Link>
        <h1 className="font-display text-3xl font-semibold">Register your club</h1>
        <p className="text-muted">
          Choose your club first, then identify yourself and show your authority to represent it.
          Club registration takes a few more steps than an athlete account. You can save and return
          later.
        </p>
        <Link to="/clubs/account" className="inline-block text-accent underline">
          My club registrations
        </Link>
      </header>
      {search.club && !club ? (
        <p role="alert">Club not found. Please choose it from the directory.</p>
      ) : !club && !search.missing && !search.application ? (
        <p>
          <Link to="/clubs" className="text-accent underline">
            Find your club to begin
          </Link>
          , or{" "}
          <Link to="/clubs/register" search={{ missing: true }} className="text-accent underline">
            request a missing club listing
          </Link>
          .
        </p>
      ) : (
        <ClubRegistration
          club={club}
          missing={!!search.missing}
          applicationId={search.application}
        />
      )}
    </div>
  );
}
