import { useHomepageTheme } from "@/components/running/HomepageAppearance";
import type { SportPage } from "@/lib/athrecs/sport-pages";
import { homepageThemeStyle } from "@/lib/running/homepage-themes";
import { discoveryResultsPath } from "./discovery-navigation";

export function DiscoverySectionNav({ sport }: { sport?: SportPage }) {
  const theme = useHomepageTheme();
  const currentColours = theme === "colourful";
  const sportName = sport?.sport ?? "Running";
  const running = sportName === "Running";
  const editorialQuery = sport ? `?sport=${sport.slug}` : "";

  return (
    <nav
      aria-label={`${sportName} sections`}
      data-homepage-theme={theme}
      style={homepageThemeStyle(theme)}
      className={`px-2 sm:px-5 lg:px-7 ${currentColours ? "bg-[#075667] text-white" : "bg-primary text-primary-fg"}`}
    >
      <ul className="flex flex-wrap items-stretch gap-x-1">
        {[
          { label: "Fixtures", path: "#fixtures", active: true },
          { label: "Results", path: discoveryResultsPath(sport) },
          { label: "News", path: `/news${editorialQuery}` },
          { label: "Race Reports", path: `/race-reports${editorialQuery}` },
          { label: "Athletes", path: `/athletes?sport=${encodeURIComponent(sportName)}` },
          { label: "Clubs", path: `/clubs?sport=${encodeURIComponent(sportName)}` },
          {
            label: running ? "Guides & series" : "Sport information",
            path: running ? "/running/guides" : "#sport-information",
          },
          { label: "Offers & opportunities", path: "/opportunities" },
        ].map((item) => (
          <li key={item.label}>
            <a
              href={item.path}
              aria-current={item.active ? "page" : undefined}
              className={`inline-flex min-h-12 items-center border-b-3 px-3 text-sm font-medium no-underline hover:bg-primary-fg/10 focus-visible:outline-2 focus-visible:outline-primary-fg sm:px-4 ${item.active ? (currentColours ? "border-[#55eadb]" : "border-primary-fg") : "border-transparent"}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
