import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bike,
  CheckCircle2,
  Dumbbell,
  Footprints,
  Globe2,
  Layers3,
  Medal,
  Network,
  ShieldCheck,
  Sparkles,
  Trophy,
  Waves,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

// @ts-expect-error The generated route tree is refreshed during the Vite build.
export const Route = createFileRoute("/sportsrecs")({
  head: () => ({
    meta: [
      { title: "SportsRecs — One sporting identity. Every competition." },
      {
        name: "description",
        content:
          "SportsRecs is a growing family of specialist platforms for finding competitions, exploring results and building a connected sporting record.",
      },
      { name: "theme-color", content: "#070b18" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SportsRecs" },
      {
        property: "og:title",
        content: "SportsRecs — One sporting identity. Every competition.",
      },
      {
        property: "og:description",
        content:
          "A connected network of specialist sports platforms for events, results, athletes and communities.",
      },
      { property: "og:url", content: "https://sportsrecs.org" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://sportsrecs.org" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SportsRecs",
          url: "https://sportsrecs.org",
          description:
            "A connected network of specialist sports platforms for competitions, results, athletes and communities.",
          sameAs: ["https://www.athrecs.com"],
        }),
      },
    ],
  }),
  component: SportsRecsLandingPage,
});

type NetworkSite = {
  name: string;
  domain: string;
  description: string;
  coverage: string;
  status: "live" | "coming-soon";
  href?: string;
  icon: LucideIcon;
  accent: string;
};

const networkSites: NetworkSite[] = [
  {
    name: "RunRecs",
    domain: "runrecs.com",
    description: "The dedicated home for running events, results and runners.",
    coverage: "Road · Trail · Fell · Ultra · Parkrun",
    status: "coming-soon",
    icon: Footprints,
    accent: "border-lime-300/25 bg-lime-300/10 text-lime-200",
  },
  {
    name: "ATHRECS",
    domain: "athrecs.com",
    description: "The specialist platform for athletics competitions, athletes and results.",
    coverage: "Track · Field · Cross-country · Race walking",
    status: "live",
    href: "https://www.athrecs.com",
    icon: Trophy,
    accent: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
  },
  {
    name: "CycRecs",
    domain: "cycrecs.com",
    description: "Cycling events and results across every major discipline.",
    coverage: "Road · Gravel · MTB · Cyclocross",
    status: "coming-soon",
    icon: Bike,
    accent: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  },
  {
    name: "SwimRecs",
    domain: "swimrecs.com",
    description: "A clearer way to discover swimming competitions and follow performances.",
    coverage: "Pool · Open water · Masters · Age group",
    status: "coming-soon",
    icon: Waves,
    accent: "border-blue-300/25 bg-blue-300/10 text-blue-200",
  },
  {
    name: "TriRecs",
    domain: "trirecs.com",
    description: "One specialist home for triathlon and connected multisport formats.",
    coverage: "Triathlon · Duathlon · Aquathlon · Aquabike",
    status: "coming-soon",
    icon: Activity,
    accent: "border-violet-300/25 bg-violet-300/10 text-violet-200",
  },
  {
    name: "GymRecs",
    domain: "gymrecs.com",
    description: "Competition calendars, results and athlete records for gymnastics.",
    coverage: "Artistic · Rhythmic · Trampoline · Acrobatic",
    status: "coming-soon",
    icon: Medal,
    accent: "border-pink-300/25 bg-pink-300/10 text-pink-200",
  },
  {
    name: "FitRecs",
    domain: "fitrecs.com",
    description: "The emerging home for functional fitness and fitness racing.",
    coverage: "Functional fitness · Fitness racing · Team events",
    status: "coming-soon",
    icon: Dumbbell,
    accent: "border-orange-300/25 bg-orange-300/10 text-orange-200",
  },
];

const principles = [
  {
    icon: Globe2,
    title: "Find the right competition",
    description:
      "Focused calendars for each sport, with the dates, disciplines, locations and official entry routes people actually need.",
  },
  {
    icon: ShieldCheck,
    title: "Build a trusted sporting record",
    description:
      "A privacy-first way for athletes to discover, claim and organise results from across their sporting life.",
  },
  {
    icon: Layers3,
    title: "Move across sports without starting again",
    description:
      "The network is being designed around one connected identity and shared data foundation, while every sport keeps its own specialist experience.",
  },
];

function SportsRecsLandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#070b18] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-75"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(34,211,238,0.18), transparent 30%), radial-gradient(circle at 85% 5%, rgba(163,230,53,0.13), transparent 27%), radial-gradient(circle at 70% 78%, rgba(139,92,246,0.12), transparent 30%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <header className="flex min-h-20 items-center justify-between gap-6 border-b border-white/10">
          <a href="#top" className="flex items-center gap-3 text-white no-underline">
            <span className="grid size-10 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
              <Network className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-black tracking-[-0.03em]">SPORTSRECS</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                The connected sports network
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex" aria-label="SportsRecs">
            <a className="transition hover:text-white" href="#network">
              The network
            </a>
            <a className="transition hover:text-white" href="#vision">
              Our vision
            </a>
            <a
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
              href="https://www.athrecs.com"
            >
              Visit ATHRECS
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </nav>
        </header>

        <main id="top">
          <section className="grid min-h-[650px] items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                <Sparkles className="size-3.5" aria-hidden="true" />
                A new family of specialist sports platforms
              </div>
              <h1 className="mt-7 max-w-4xl text-balance text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
                One sporting identity.
                <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-white to-lime-200 bg-clip-text text-transparent">
                  Every competition.
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl">
                SportsRecs is a growing network of focused platforms for finding events, exploring
                results and recognising athletes — from running and athletics to cycling, swimming,
                triathlon, gymnastics and functional fitness.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#network"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-slate-950 no-underline transition hover:-translate-y-0.5 hover:bg-cyan-100"
                >
                  Explore the network
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href="https://www.athrecs.com"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-white no-underline transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-300/10"
                >
                  Visit ATHRECS
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
              <div className="mt-9 flex max-w-2xl flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
                {["Specialist calendars", "Connected athlete records", "Privacy-first by design"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-cyan-300" aria-hidden="true" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-6 rounded-[2.4rem] bg-gradient-to-br from-cyan-300/15 via-transparent to-violet-400/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      SportsRecs network
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">Specialist by sport</p>
                  </div>
                  <span className="rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-xs font-semibold text-lime-200">
                    Building now
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {networkSites.slice(0, 6).map((site) => (
                    <div key={site.name} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <span className={cn("grid size-9 place-items-center rounded-xl border", site.accent)}>
                          <site.icon className="size-4" aria-hidden="true" />
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                            site.status === "live"
                              ? "bg-emerald-300/15 text-emerald-200"
                              : "bg-white/8 text-slate-400",
                          )}
                        >
                          {site.status === "live" ? "Live" : "Soon"}
                        </span>
                      </div>
                      <p className="mt-4 font-bold">{site.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{site.domain}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-sm font-semibold text-cyan-100">
                    One shared foundation, several focused experiences.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-cyan-50/70">
                    Each sport gets the language, filters and community it deserves, while athlete
                    identity and data are designed to stay connected.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="network" className="scroll-mt-24 border-t border-white/10 py-20 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">The network</p>
              <h2 className="mt-3 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                A dedicated home for every sporting community.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                ATHRECS is live today. The next platforms are being prepared carefully, and their
                links will activate as each specialist site is ready.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {networkSites.map((site) => (
                <NetworkCard key={site.name} site={site} />
              ))}
            </div>
          </section>

          <section id="vision" className="scroll-mt-24 border-t border-white/10 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-200">Our vision</p>
                <h2 className="mt-3 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                  Better recognition for every athlete.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  SportsRecs is being built to make competition information and achievement easier
                  to discover for everyone — elite, club, local, age-group and recreational athletes alike.
                </p>
              </div>

              <div className="grid gap-4">
                {principles.map((principle, index) => (
                  <article key={principle.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 sm:p-7">
                    <div className="flex gap-5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
                        <principle.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">0{index + 1}</p>
                        <h3 className="mt-1 text-xl font-bold">{principle.title}</h3>
                        <p className="mt-2 leading-7 text-slate-400">{principle.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-white/10 py-20 sm:py-24">
            <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/12 via-white/[0.045] to-lime-300/10 px-6 py-12 text-center sm:px-12 sm:py-16">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-cyan-200/30 bg-cyan-200/10 text-cyan-100">
                <Network className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                The network is only beginning.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                SportsRecs.org will become the front door to the full family of specialist sports
                platforms. For now, explore ATHRECS while the next sites are prepared.
              </p>
              <a
                href="https://www.athrecs.com"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-slate-950 no-underline transition hover:-translate-y-0.5 hover:bg-cyan-100"
              >
                Explore ATHRECS
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-5 border-t border-white/10 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-cyan-300" aria-hidden="true" />
            <span>© {new Date().getFullYear()} SportsRecs. The connected sports network.</span>
          </div>
          <a href="https://www.athrecs.com" className="transition hover:text-white">
            Visit ATHRECS
          </a>
        </footer>
      </div>
    </div>
  );
}

function NetworkCard({ site }: { site: NetworkSite }) {
  const card = (
    <>
      <div className="flex items-start justify-between gap-5">
        <span className={cn("grid size-12 place-items-center rounded-2xl border", site.accent)}>
          <site.icon className="size-5" aria-hidden="true" />
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
            site.status === "live"
              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
              : "border-white/10 bg-white/5 text-slate-400",
          )}
        >
          {site.status === "live" ? "Live now" : "Coming soon"}
        </span>
      </div>
      <h3 className="mt-6 text-2xl font-black tracking-[-0.03em]">{site.name}</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">{site.domain}</p>
      <p className="mt-4 min-h-14 leading-7 text-slate-300">{site.description}</p>
      <p className="mt-5 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
        {site.coverage}
      </p>
      <div className="mt-6 flex items-center justify-between gap-4 text-sm font-bold">
        <span className={site.status === "live" ? "text-cyan-200" : "text-slate-500"}>
          {site.status === "live" ? `Visit ${site.name}` : "Link activates at launch"}
        </span>
        {site.status === "live" ? (
          <ArrowUpRight className="size-4 text-cyan-200" aria-hidden="true" />
        ) : (
          <Sparkles className="size-4 text-slate-600" aria-hidden="true" />
        )}
      </div>
    </>
  );

  return site.href ? (
    <a
      href={site.href}
      className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 text-white no-underline transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]"
      aria-label={`Visit ${site.name}`}
    >
      {card}
    </a>
  ) : (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-white">{card}</article>
  );
}
