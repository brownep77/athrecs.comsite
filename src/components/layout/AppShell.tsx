import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, List, Users, UsersRound } from "lucide-react";
import { AthleteAccountAccess } from "@/components/auth/AthleteAccountAccess";
import { StaffMicrositeShell } from "@/components/staff/StaffMicrositeShell";
import {
  COUNTRY_SITES,
  copyForLanguage,
  countryHomePath,
  countrySiteFromSlug,
  isSiteLanguage,
  type CountrySite,
  type SiteLanguage,
} from "@/lib/athrecs/country-sites";
import { cn } from "@/lib/utils";

const nav = [
  { key: "home", to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    key: "events",
    to: "/races",
    label: "Events",
    icon: List,
    match: (p: string) => p.startsWith("/races") || p.startsWith("/race-series"),
  },
  {
    key: "athletes",
    to: "/athletes",
    label: "Athletes",
    icon: Users,
    match: (p: string) => p.startsWith("/athletes"),
  },
  {
    key: "clubs",
    to: "/clubs",
    label: "Clubs",
    icon: UsersRound,
    match: (p: string) => p.startsWith("/clubs"),
  },
  {
    key: "calendar",
    to: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
    match: (p: string) => p.startsWith("/calendar"),
  },
] as const;

function BrandLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <img
      src="/athrecs-logo-header.png"
      alt="ATHRECS.com"
      width={158}
      height={32}
      className={cn("h-8 w-auto object-contain object-left", className)}
      decoding={priority ? "sync" : "async"}
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/admin")) {
    return <StaffMicrositeShell>{children}</StaffMicrositeShell>;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const pathLanguage = pathSegments[0] ?? "";
  const pathCountry = pathSegments[1] ?? "";
  const localized =
    isSiteLanguage(pathLanguage) && countrySiteFromSlug(pathCountry)
      ? {
          language: pathLanguage,
          site: countrySiteFromSlug(pathCountry)!,
        }
      : undefined;
  const copy = localized ? copyForLanguage(localized.language) : undefined;
  const localizedLabels: Partial<Record<(typeof nav)[number]["key"], string>> = copy
    ? {
        home: copy.home,
        events: copy.events,
        athletes: copy.athletes,
        clubs: copy.clubs,
        calendar: copy.calendar,
      }
    : {};

  const isActive = (item: (typeof nav)[number]) => {
    if (!localized) return item.match(pathname);
    const base = `/${localized.language}/${localized.site.slug}`;
    if (item.key === "home") return pathname === base || pathname === `${base}/`;
    if (item.key === "events") return pathname.startsWith(`${base}/races`);
    return item.match(pathname);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden bg-bg">
      <header className="safe-pt sticky top-0 z-40 hidden border-b border-border/80 bg-bg/90 backdrop-blur-md md:block">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <BrandLink localized={localized} desktop />
          <nav className="flex items-center gap-0.5">
            {nav.map((item) => {
              const active = isActive(item);
              return (
                <Fragment key={item.to}>
                  <ShellLink
                    item={item}
                    localized={localized}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium no-underline transition-colors",
                      active
                        ? "bg-elevated text-fg"
                        : "text-muted hover:bg-elevated/60 hover:text-fg",
                    )}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                    {localizedLabels[item.key] ?? item.label}
                  </ShellLink>
                  {item.key === "calendar" ? <CountrySelector localized={localized} /> : null}
                </Fragment>
              );
            })}
            <AthleteAccountAccess />
          </nav>
        </div>
      </header>

      <header className="safe-pt sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md md:hidden">
        <div className="flex h-12 items-center justify-between gap-2 px-4">
          <BrandLink localized={localized} />
          <div className="flex items-center gap-1">
            <Link
              to="/calendar"
              className="hidden h-9 items-center gap-1.5 rounded-md bg-accent-soft px-2.5 text-sm font-semibold text-fg no-underline min-[360px]:inline-flex"
              aria-label="Calendar"
            >
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
            <CountrySelector localized={localized} compact />
            <AthleteAccountAccess compact />
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-8">{children}</main>

      <nav
        className="safe-pb fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-surface/95 backdrop-blur-md md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 px-0.5 pt-1">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.to} className="min-w-0">
                <ShellLink
                  item={item}
                  localized={localized}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[10px] font-medium no-underline",
                    active ? "text-fg" : "text-subtle",
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
                  <span className="truncate">{localizedLabels[item.key] ?? item.label}</span>
                </ShellLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

type LocalizedShell = { language: SiteLanguage; site: CountrySite } | undefined;

function CountrySelector({
  localized,
  compact = false,
}: {
  localized: LocalizedShell;
  compact?: boolean;
}) {
  return (
    <select
      aria-label="Select your country"
      value={localized?.site.slug ?? ""}
      onChange={(event) => {
        const nextSite = countrySiteFromSlug(event.target.value);
        if (!nextSite) {
          window.location.assign("/");
          return;
        }
        window.location.assign(countryHomePath(nextSite));
      }}
      className={cn(
        "rounded-md border border-border bg-surface font-medium text-fg outline-none focus:ring-2 focus:ring-accent/30",
        compact ? "h-9 w-28 px-1.5 text-xs sm:w-36 sm:px-2" : "h-10 max-w-44 px-2 text-sm",
      )}
    >
      <option value="">🌍 Select your country</option>
      {COUNTRY_SITES.map((option) => (
        <option key={option.slug} value={option.slug}>
          {option.flag} {option.country}
        </option>
      ))}
    </select>
  );
}

function BrandLink({
  localized,
  desktop = false,
}: {
  localized: LocalizedShell;
  desktop?: boolean;
}) {
  const content = (
    <>
      <BrandLogo priority={desktop} className={desktop ? "h-9" : "h-7 max-w-[160px]"} />
      {desktop ? (
        <span className="hidden border-l border-border pl-3 text-[11px] leading-tight text-subtle lg:block">
          Races
          <br />
          Results · Athletes
        </span>
      ) : null}
    </>
  );
  const className = desktop
    ? "flex min-w-0 items-center gap-3 no-underline"
    : "min-w-0 no-underline";

  return localized ? (
    <Link
      to="/$language/$country"
      params={{ language: localized.language, country: localized.site.slug }}
      className={className}
      aria-label="ATHRECS.com country home"
    >
      {content}
    </Link>
  ) : (
    <Link to="/" className={className} aria-label="ATHRECS.com home">
      {content}
    </Link>
  );
}

function ShellLink({
  item,
  localized,
  className,
  children,
}: {
  item: (typeof nav)[number];
  localized: LocalizedShell;
  className: string;
  children: React.ReactNode;
}) {
  if (localized && item.key === "home") {
    return (
      <Link
        to="/$language/$country"
        params={{ language: localized.language, country: localized.site.slug }}
        className={className}
      >
        {children}
      </Link>
    );
  }
  if (localized && item.key === "events") {
    return (
      <Link
        to="/$language/$country/races"
        params={{ language: localized.language, country: localized.site.slug }}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link to={item.to} className={className}>
      {children}
    </Link>
  );
}
