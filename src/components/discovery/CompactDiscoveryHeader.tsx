import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bike, Footprints, Medal, Search, Timer, Waves, Grid2X2, Repeat2 } from "lucide-react";
import { AthleteAccountAccess } from "@/components/auth/AthleteAccountAccess";
import { SiteLanguagePicker } from "@/components/language/SiteLanguagePicker";
import { HomepageColourPicker, useHomepageTheme } from "@/components/running/HomepageAppearance";
import { homepageThemeStyle } from "@/lib/running/homepage-themes";
import { QUICK_SPORTS, activeDiscoverySport } from "./discovery-navigation";
import { parseSportFixtureSearch, type SportFixtureSearch } from "@/lib/athrecs/sport-pages";

const icons = {
  Running: Footprints,
  Athletics: Medal,
  Triathlon: Timer,
  Cycling: Bike,
  Swimming: Waves,
  Duathlon: Repeat2,
  Parkrun: Footprints,
};
const memoryKey = "athrecs:sport-filters:v1";

export function CompactDiscoveryHeader({
  pathname,
  showHomepageColours = false,
  showLanguagePicker = false,
}: {
  pathname: string;
  showHomepageColours?: boolean;
  showLanguagePicker?: boolean;
}) {
  const theme = useHomepageTheme();
  const active = activeDiscoverySport(pathname);
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const currentSearch = parseSportFixtureSearch(Object.fromEntries(new URLSearchParams(searchStr)));
  const [memory, setMemory] = useState<Record<string, SportFixtureSearch>>({});
  // Each sport remembers its own query. A marathon filter never carries into swimming.
  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(sessionStorage.getItem(memoryKey) ?? "{}");
      const restored: Record<string, SportFixtureSearch> = {};
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        for (const item of QUICK_SPORTS) {
          const value = (raw as Record<string, unknown>)[item.path];
          if (value && typeof value === "object" && !Array.isArray(value))
            restored[item.path] = parseSportFixtureSearch(value as Record<string, unknown>);
        }
      }
      restored[pathname] = parseSportFixtureSearch(
        Object.fromEntries(new URLSearchParams(searchStr)),
      );
      sessionStorage.setItem(memoryKey, JSON.stringify(restored));
      setMemory(restored);
    } catch {
      /* Navigation still works when storage is unavailable. */
    }
  }, [pathname, searchStr]);

  return (
    <div
      className="sticky top-0 z-40 border-b border-border bg-surface text-fg shadow-sm"
      data-homepage-theme={theme}
      style={homepageThemeStyle(theme)}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3 focus:text-accent"
      >
        Skip to main content
      </a>
      <header className="safe-pt flex min-h-18 flex-wrap items-center gap-x-3 gap-y-3 px-4 py-4 sm:gap-x-6 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link to="/" search={{}} className="mr-auto shrink-0" aria-label="AthRecs home">
          <img
            src="/athrecs-logo-header.png"
            alt="ATHRECS.com"
            width={190}
            height={39}
            className={`h-auto w-36 sm:w-48 ${theme === "midnight" ? "brightness-0 invert" : ""}`}
          />
        </Link>
        <form
          key={`${pathname}${searchStr}`}
          action={pathname}
          method="get"
          role="search"
          className={`order-last flex min-w-0 w-full items-center rounded-lg border border-border px-3 lg:order-none lg:w-auto lg:flex-1 ${theme === "colourful" ? "bg-[#f7f9fa]" : "bg-elevated"}`}
        >
          <label className="sr-only" htmlFor="discovery-header-search">
            Search {active?.toLowerCase() ?? "sports"} fixtures and places
          </label>
          {(["country", "month", "distance"] as const).map((key) =>
            currentSearch[key] ? (
              <input key={key} type="hidden" name={key} value={currentSearch[key]} />
            ) : null,
          )}
          <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            id="discovery-header-search"
            type="search"
            name="q"
            defaultValue={currentSearch.q ?? ""}
            maxLength={120}
            placeholder={`Search ${active?.toLowerCase() ?? "sports"} fixtures and places…`}
            className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <button type="submit" className="min-h-10 px-2 text-xs font-semibold text-accent">
            Search
          </button>
        </form>
        <Link
          to="/brands"
          className="hidden min-h-11 items-center text-sm font-medium text-accent no-underline sm:inline-flex"
        >
          For businesses
        </Link>
        <div className="relative ml-auto flex shrink-0 items-center gap-1">
          <AthleteAccountAccess compact={showHomepageColours || showLanguagePicker} />
          {showHomepageColours ? <HomepageColourPicker /> : null}
          {showLanguagePicker ? <SiteLanguagePicker pathname={pathname} /> : null}
        </div>
      </header>
      <nav aria-label="Switch sport" className="overflow-x-auto px-2 sm:px-5 lg:px-7">
        <ul className="flex min-w-max items-stretch gap-1">
          {QUICK_SPORTS.map((item) => {
            const Icon = icons[item.sport];
            const selected = active === item.sport;
            const className = `inline-flex min-h-12 items-center gap-2 border-b-3 px-3 text-sm font-semibold no-underline transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent sm:px-4 ${selected ? "border-accent text-accent" : "border-transparent text-fg"}`;
            return (
              <li key={item.path}>
                {item.slug ? (
                  <Link
                    to="/sports/$sport"
                    params={{ sport: item.slug }}
                    search={memory[item.path] ?? {}}
                    className={className}
                    aria-current={selected ? "page" : undefined}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    to="/"
                    search={memory[item.path] ?? {}}
                    className={className}
                    aria-current={selected ? "page" : undefined}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
          <li>
            <Link
              to="/site-map"
              className="inline-flex min-h-12 items-center gap-2 border-b-3 border-transparent px-3 text-sm font-semibold no-underline hover:bg-accent-soft"
            >
              <Grid2X2 className="size-4" aria-hidden="true" />
              All sports
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
