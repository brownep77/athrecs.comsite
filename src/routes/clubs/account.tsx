import { createFileRoute, Link } from "@tanstack/react-router";
import { MyClubRegistrations } from "@/components/clubs/ClubRegistration";
export const Route = createFileRoute("/clubs/account")({
  head: () => ({
    meta: [
      { title: "My club registrations | ATHRECS" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <Link to="/clubs" className="text-accent underline">
          ← Club directory
        </Link>
        <h1 className="font-display text-3xl font-semibold">My club registrations</h1>
        <p className="text-muted">Continue a saved application or check its verification status.</p>
      </header>
      <MyClubRegistrations />
    </div>
  ),
});
