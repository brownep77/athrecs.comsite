import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Footprints,
  Link2,
  LockKeyhole,
  Medal,
  Search,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { AthleteDirectoryCard } from "@/components/athletes/AthleteDirectoryCard";
import { getAthleteDirectory } from "@/lib/athrecs/athlete-directory-api";
import type { AthleteDirectory } from "@/lib/athrecs/athlete-directory";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: siteGraphMeta({
      title: "ATHRECS | Your sporting life, in one profile",
      description:
        "Find athletes and bring your results, personal bests, progress and social links together. One athlete profile across every sport.",
      url: SITE_URL,
    }),
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  loader: () => getAthleteDirectory({ data: { pageSize: 6 } }),
  component: AthleteHomePage,
});

const profileSections = [
  {
    icon: Medal,
    title: "Results & personal bests",
    detail: "Your performances, with their sources",
  },
  { icon: TrendingUp, title: "Progress over time", detail: "Follow your results across seasons" },
  {
    icon: Link2,
    title: "Your sporting identity",
    detail: "Sports, previous names and social links",
  },
] as const;

function AthleteHomePage() {
  // Vite replaces the base homepage; the generated route tree retains its loader type.
  const directory = Route.useLoaderData() as unknown as AthleteDirectory;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({ to: "/athletes", search: { q: query.trim() || undefined } });
  }
  return (
    <div className="space-y-7 pb-2">
      <section className="overflow-hidden rounded-3xl border border-border bg-elevated/50">
        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-accent">
              For the athlete in you
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl">
              Your sporting life,
              <br />
              <span className="text-accent">in one profile.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
              Every athlete has a story. Bring your results, personal bests and progress together,
              across the sports you love.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/join"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-fg no-underline hover:bg-primary/90"
              >
                Build my profile <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/athlete-account"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-fg no-underline hover:border-accent"
              >
                Find my results
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <LockKeyhole className="size-3.5" aria-hidden="true" />
              Your profile starts private. You choose what to share.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Inside your athlete profile
            </p>
            <div className="mt-4 flex items-center gap-3 border-b border-border pb-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <UserRound className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">One sporting identity</p>
                <p className="text-xs text-muted">All your sports. All your seasons.</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {profileSections.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex items-center gap-3 py-3">
                  <Icon className="size-5 shrink-0 text-accent" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-xs text-muted">{detail}</p>
                  </div>
                  <Check className="size-4 text-accent" aria-hidden="true" />
                </div>
              ))}
            </div>
            <Link
              to="/"
              hash="how-it-works"
              className="mt-1 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-accent"
            >
              See how your records come together{" "}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
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
          <p className="text-xs text-muted">
            {directory.publicAthletes.toLocaleString("en-GB")} public profiles ·{" "}
            {directory.publicResults.toLocaleString("en-GB")} recorded results
          </p>
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
            { label: "All athletes", country: undefined },
            { label: "United Kingdom", country: "United Kingdom" },
            { label: "Ireland", country: "Ireland" },
          ].map(({ label, country }) => (
            <Link
              key={label}
              to="/athletes"
              search={{ country }}
              className="rounded-full border border-border px-3 py-1.5 font-medium text-fg no-underline hover:border-accent hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </div>
        {directory.athletes.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {directory.athletes.map((athlete) => (
              <AthleteDirectoryCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border p-5 text-sm text-muted">
            Public athlete profiles will appear here as they are added.
          </p>
        )}
        <Link
          to="/athletes"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent no-underline"
        >
          Explore all public profiles <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
      <section
        id="how-it-works"
        className="scroll-mt-24 rounded-2xl border border-border bg-elevated/40 p-5 sm:p-6"
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
              <p className="mt-2 text-xs leading-5 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="flex flex-col gap-4 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between"
        aria-labelledby="next-event"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Footprints className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="next-event" className="font-display text-xl font-semibold">
              Your next event starts here
            </h2>
            <p className="mt-1 text-xs text-muted">
              Find running races on RunRecs and explore event sites for other sports.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <a
            href="https://www.runrecs.com/races"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg no-underline"
          >
            RunRecs <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <Link
            to="/find-events"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold text-fg no-underline"
          >
            All event sites <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
