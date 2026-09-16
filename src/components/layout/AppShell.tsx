import { Link, useRouterState } from "@tanstack/react-router";
import { Home, SearchCheck, Users, UserRound, CalendarDays, Handshake } from "lucide-react";
import { AthleteAccountAccess } from "@/components/auth/AthleteAccountAccess";
import { PotentialResultMatchesPanel } from "@/components/athletes/PotentialResultMatchesPanel";
import { StaffMicrositeShell } from "@/components/staff/StaffMicrositeShell";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    to: "/athletes",
    label: "Athletes",
    icon: Users,
    match: (p: string) => p.startsWith("/athletes"),
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
    to: "/find-events",
    label: "Find events",
    icon: CalendarDays,
    match: (p: string) => p === "/find-events",
  },
  {
    to: "/brands",
    label: "Brands",
    icon: Handshake,
    match: (p: string) => p.startsWith("/brands") || p === "/opportunities",
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
                  "inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium no-underline transition-colors",
                  item.match(pathname)
                    ? "bg-elevated text-fg"
                    : "text-muted hover:bg-elevated/60 hover:text-fg",
                )}
              >
                <item.icon
                  className="hidden size-4 lg:block"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            ))}
            <AthleteAccountAccess />
          </nav>
        </div>
      </header>
      <header className="safe-pt sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <BrandLink />
          <AthleteAccountAccess compact />
        </div>
      </header>
      <main className="min-w-0 flex-1 px-4 pb-8 pt-4 md:px-6 md:pt-7">
        {pathname === "/athlete-account" ? (
          <div className="mb-6">
            <PotentialResultMatchesPanel />
          </div>
        ) : null}
        {children}
      </main>
      <footer className="mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 pb-24 text-xs text-muted md:mx-6 lg:pb-5">
        <p>ATHRECS · One athlete. Every sport.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/brands" className="hover:text-accent">Brands & Partners</Link>
          <Link to="/opportunities" className="hover:text-accent">Opportunities</Link>
          <Link to="/find-events" className="hover:text-accent">
            Find events
          </Link>
          <Link to="/sportsrecs" className="hover:text-accent">
            SportsRecs network
          </Link>
          <Link to="/privacy" className="hover:text-accent">
            Privacy
          </Link>
        </div>
      </footer>
      <nav
        className="safe-pb fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-surface/95 backdrop-blur-md lg:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-6 px-1 pt-1">
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
