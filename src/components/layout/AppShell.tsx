import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  SearchCheck,
  Users,
  UserRound,
  Footprints,
  Handshake,
  Trophy,
  Building2,
} from "lucide-react";
import { AthleteAccountAccess } from "@/components/auth/AthleteAccountAccess";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { StaffMicrositeShell } from "@/components/staff/StaffMicrositeShell";
import { SPORT_PAGES } from "@/lib/athrecs/sport-pages";
import { cn } from "@/lib/utils";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";
import { SiteLanguagePicker } from "@/components/language/SiteLanguagePicker";
import {
  evaluatePublicFeatureFlags,
  publicFeatureFlagConfig,
} from "@/lib/athrecs/public-feature-flags";
import {
  HomepageAppearanceProvider,
  HomepageColourPicker,
} from "@/components/running/HomepageAppearance";

const nav = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    to: "/athletes",
    label: "Athletes",
    icon: Users,
    match: (p: string) => p.startsWith("/athletes"),
  },
  {
    to: "/directory",
    label: "Directory",
    icon: Building2,
    match: (p: string) =>
      p === "/directory" ||
      p.startsWith("/directory/") ||
      p === "/clubs" ||
      p.startsWith("/clubs/"),
  },
  {
    to: "/results",
    label: "Results",
    icon: Trophy,
    match: (p: string) => p === "/results" || p.startsWith("/results/"),
  },
  {
    to: "/my-athlete-profile",
    label: "My profile",
    icon: UserRound,
    match: (p: string) => p === "/my-athlete-profile",
  },
  {
    to: "/athlete-account",
    label: "Find my results",
    icon: SearchCheck,
    match: (p: string) => p === "/athlete-account" || p === "/claim-results",
  },
  {
    to: "/running",
    label: "Running",
    icon: Footprints,
    match: (p: string) => p === "/running" || p.startsWith("/running/"),
  },
  {
    to: "/brands",
    label: "Brands",
    icon: Handshake,
    match: (p: string) => p.startsWith("/brands") || p === "/opportunities" || p === "/sponsorship",
  },
] as const;

function BrandLink({ desktop = false }: { desktop?: boolean }) {
  return (
    <Link
      to="/"
      className="flex min-w-0 items-center gap-3 no-underline"
      aria-label="ATHRECS.com home"
    >
      <img
        src="/athrecs-logo-header.png"
        alt="ATHRECS.com"
        width={158}
        height={32}
        className={cn("w-auto object-contain object-left", desktop ? "h-9" : "h-7 max-w-[160px]")}
        decoding={desktop ? "sync" : "async"}
      />
      {desktop ? (
        <span className="hidden border-l border-border pl-3 text-[11px] leading-tight text-muted xl:block">
          Athlete profiles
          <br />
          Every sport
        </span>
      ) : null}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/sportsrecs" || pathname.startsWith("/sportsrecs/")) return <>{children}</>;
  if (pathname.startsWith("/admin")) return <StaffMicrositeShell>{children}</StaffMicrositeShell>;

  return (
    <HomepageAppearanceProvider>
      <PublicAppShell pathname={pathname}>{children}</PublicAppShell>
    </HomepageAppearanceProvider>
  );
}

function PublicAppShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const featureFlags = evaluatePublicFeatureFlags(
    pathname,
    IS_ATHRECS_SITE,
    publicFeatureFlagConfig({
      VITE_FLAG_HOMEPAGE_COLOUR_PICKER: import.meta.env.VITE_FLAG_HOMEPAGE_COLOUR_PICKER,
      VITE_FLAG_LANGUAGE_PICKER: import.meta.env.VITE_FLAG_LANGUAGE_PICKER,
    }),
  );
  const showHomepageColours = featureFlags["homepage-colour-picker"] === true;
  const showLanguagePicker = featureFlags["language-picker"] === true;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden bg-bg">
      <header className="safe-pt sticky top-0 z-40 hidden border-b border-border/80 bg-bg/90 backdrop-blur-md lg:block">
        <div className="flex h-16 items-center justify-between gap-3 px-6">
          <BrandLink desktop />
          <nav className="flex items-center gap-0.5" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={item.match(pathname) ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-md px-1.5 text-sm font-medium no-underline transition-colors xl:px-2",
                  item.match(pathname)
                    ? "bg-elevated text-fg"
                    : "text-muted hover:bg-elevated/60 hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative flex shrink-0 items-center gap-1">
              <AthleteAccountAccess compact={showHomepageColours || showLanguagePicker} />
              {showHomepageColours ? <HomepageColourPicker /> : null}
              {showLanguagePicker ? <SiteLanguagePicker pathname={pathname} /> : null}
            </div>
          </nav>
        </div>
      </header>
      <header className="safe-pt sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <BrandLink />
          <div className="relative flex shrink-0 items-center gap-2">
            <AthleteAccountAccess compact />
            {showHomepageColours ? <HomepageColourPicker /> : null}
            {showLanguagePicker ? <SiteLanguagePicker pathname={pathname} /> : null}
          </div>
        </div>
      </header>
      {pathname === "/" ||
      pathname.startsWith("/sports/") ||
      pathname.startsWith("/race-reports") ||
      pathname.startsWith("/news") ? (
        <nav
          aria-label="Browse by sport"
          className="border-b border-accent/20 bg-accent-soft px-4 md:px-6"
        >
          <ul className="flex flex-wrap items-center gap-x-1 py-1">
            {SPORT_PAGES.map((item) => (
              <li key={item.slug}>
                <Link
                  to="/sports/$sport"
                  params={{ sport: item.slug }}
                  search={{}}
                  aria-current={pathname === `/sports/${item.slug}` ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-md px-2 text-sm font-semibold no-underline transition-colors hover:bg-primary hover:text-primary-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3",
                    pathname === `/sports/${item.slug}`
                      ? "bg-primary text-primary-fg"
                      : "text-accent",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {(
              [
                { to: "/race-reports", label: "Race Reports" },
                { to: "/news", label: "News" },
              ] as const
            ).map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  search={{}}
                  aria-current={
                    pathname === item.to || pathname.startsWith(`${item.to}/`) ? "page" : undefined
                  }
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-md px-2 text-sm font-semibold no-underline hover:bg-primary hover:text-primary-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3",
                    pathname === item.to || pathname.startsWith(`${item.to}/`)
                      ? "bg-primary text-primary-fg"
                      : "text-accent",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <SiteAnalytics featureFlags={featureFlags} />
      <main className="min-w-0 flex-1 px-4 pb-8 pt-4 md:px-6 md:pt-7">{children}</main>
      <footer className="mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 pb-40 text-xs text-muted sm:pb-24 md:mx-6 lg:pb-5">
        <p>ATHRECS · One athlete. Every sport.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/directory" search={{}} className="hover:text-accent">
            Federations & governing bodies
          </Link>
          <Link to="/clubs" className="hover:text-accent">
            Clubs
          </Link>
          <Link to="/running" className="hover:text-accent">
            Running
          </Link>
          <Link to="/running/uk-marathons" className="hover:text-accent">
            UK marathons
          </Link>
          <Link to="/results" className="hover:text-accent">
            Results
          </Link>
          <Link to="/race-reports" search={{}} className="hover:text-accent">
            Race Reports
          </Link>
          <Link to="/news" search={{}} className="hover:text-accent">
            News
          </Link>
          <Link to="/brands" className="hover:text-accent">
            Brands & Partners
          </Link>
          <Link to="/opportunities" className="hover:text-accent">
            Opportunities
          </Link>
          <Link to="/find-events" className="hover:text-accent">
            Find events
          </Link>
          <Link to="/sportsrecs" className="hover:text-accent">
            SportsRecs network
          </Link>
          <Link to="/about-us" className="hover:text-accent">
            About us
          </Link>
          <Link to="/site-map" className="hover:text-accent">
            Browse AthRecs
          </Link>
          <Link to="/privacy" className="hover:text-accent">
            Privacy
          </Link>
        </div>
      </footer>
      {IS_ATHRECS_SITE ? <AssistantLauncher pathname={pathname} /> : null}
      <nav
        className="safe-pb fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-surface/95 backdrop-blur-md lg:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-4 px-1 pt-1 sm:grid-cols-8">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.to} className="min-w-0">
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-1.5 text-[10px] font-medium no-underline",
                    active ? "bg-accent-soft/50 text-accent" : "text-muted",
                  )}
                >
                  <item.icon className="size-5" strokeWidth={active ? 2 : 1.6} aria-hidden="true" />
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
