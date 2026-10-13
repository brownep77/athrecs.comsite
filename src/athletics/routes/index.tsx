import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { RunningLanding, runningGuidesJsonLd } from "@/components/running/RunningLanding";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { countryCardStyle, neutralPastelCardStyle } from "@/lib/running/country-card-palette";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: siteGraphMeta({
      title: "ATHRECS | Running races, results & athlete profiles",
      description:
        "Find your next running event. Explore marathons and half marathons by country, browse race results, and bring your results and PBs into one athlete profile.",
      url: SITE_URL,
    }),
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(runningGuidesJsonLd(SITE_URL)) },
    ],
  }),
  component: AthleteHomePage,
});

function AthleteHomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({ to: "/athletes", search: { q: query.trim() || undefined } });
  }
  return (
    <div className="space-y-7 pb-2">
      <RunningLanding homepage />
      <section className="space-y-4" aria-labelledby="discover-athletes">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              People, performances, progress
            </p>
            <h2 id="discover-athletes" className="mt-1 font-display text-2xl font-semibold">
              Find an athlete
            </h2>
          </div>
          <p className="text-xs text-muted">Public profiles, race results and sporting histories</p>
        </div>
        <form onSubmit={search} role="search" className="flex gap-2">
          <label htmlFor="athlete-search" className="sr-only">
            Athlete name, club or place
          </label>
          <input
            id="athlete-search"
            type="search"
            maxLength={120}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by athlete name, club or place"
            className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Find athlete</span>
            <span className="sr-only sm:hidden">Find athlete</span>
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="mr-1 text-muted">Explore:</span>
          {[
            { label: "All athletes", country: undefined, palette: undefined },
            { label: "United Kingdom", country: "United Kingdom", palette: "uk" as const },
            { label: "Ireland", country: "Ireland", palette: "ireland" as const },
          ].map(({ label, country, palette }) => (
            <Link
              key={label}
              to="/athletes"
              search={{ country }}
              className="rounded-full border px-3 py-1.5 font-medium no-underline transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
              style={palette ? countryCardStyle(palette) : neutralPastelCardStyle}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link
          to="/athletes"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent no-underline"
        >
          Explore all public profiles <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
      <section
        id="how-it-works"
        className="scroll-mt-24 rounded-2xl border p-5 text-slate-900 sm:p-6"
        style={{ ...neutralPastelCardStyle, color: "#0f172a" }}
      >
        <h2 className="font-display text-2xl font-semibold">Your records, brought together</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Find your performances",
              text: "Add your sports, previous names and athlete identifiers so AthRecs can suggest results that may be yours.",
            },
            {
              title: "Confirm what belongs to you",
              text: "Review each match and claim your results. Your profile brings them together with links back to their sources.",
            },
            {
              title: "Make your profile your own",
              text: "Follow your progress, add your bio and social links, and choose which results to share.",
            },
          ].map((step, index) => (
            <div key={step.title}>
              <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-700">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
