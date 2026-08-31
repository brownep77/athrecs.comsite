#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: str, before: str, after: str) -> None:
    file = Path(path)
    text = file.read_text()
    if after in text:
        return
    if before not in text:
        raise SystemExit(f"Anchor not found in {path}: {before[:160]!r}")
    file.write_text(text.replace(before, after, 1))


replace_once(
    "src/components/races/EventSearch.tsx",
    "  const lockedSport = SPORTS.length === 1 ? SPORTS[0] : null;",
    "  const publicSports = SPORTS as readonly string[];\n  const lockedSport = publicSports.length === 1 ? publicSports[0] : null;",
)

replace_once(
    "src/athletics/routes/index.tsx",
    "  const { stats, events, updates } = Route.useLoaderData();",
    '''  // The generated route tree retains the base homepage loader type during
  // standalone type-checking; Vite swaps in this Athletics loader at build time.
  const { stats, events, updates } = Route.useLoaderData() as unknown as {
    stats: {
      events: number;
      clubs: number;
      athletes: number;
      upcoming: number;
      bySport: Array<{ sport: string; n: number; upcoming: number }>;
    };
    events: EventListItem[];
    updates: HomeSportUpdate[];
  };''',
)

replace_once(
    "src/athletics/routes/$language/$country/index.tsx",
    "  translateCountryText,\n} from \"@/lib/athrecs/country-sites\";",
    "  translateCountryText,\n  type CountrySite,\n  type SiteLanguage,\n} from \"@/lib/athrecs/country-sites\";",
)
replace_once(
    "src/athletics/routes/$language/$country/index.tsx",
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport type { EventListItem } from "@/lib/athrecs/types";',
)
replace_once(
    "src/athletics/routes/$language/$country/index.tsx",
    "  const { site, language, events } = Route.useLoaderData();",
    '''  // The generated route tree retains the base multi-sport country loader
  // type during standalone type-checking; Vite supplies this Athletics loader.
  const { site, language, events } = Route.useLoaderData() as unknown as {
    site: CountrySite;
    language: SiteLanguage;
    events: EventListItem[];
  };''',
)

replace_once(
    "src/athletics/routes/calendar.tsx",
    '''export const Route = createFileRoute("/calendar")({
  loader: () =>
    listCalendarEditions({
      data: { sport: "Athletics", upcomingOnly: true, limit: 40 },
    }),
  component: AthleticsCalendarPage,
});
''',
    '''export const Route = createFileRoute("/calendar")({
  loader: () =>
    listCalendarEditions({
      data: { sport: "Athletics", upcomingOnly: true, limit: 40 },
    }),
  component: AthleticsCalendarPage,
});

type AthleticsCalendarEdition = {
  id: number;
  event_date: string;
  status: string;
  start_time: string | null;
  event_slug: string;
  event_name: string;
  sport: string;
  city: string;
  county: string;
  country: string;
  distance_code: string;
  surface: string;
};
''',
)
replace_once(
    "src/athletics/routes/calendar.tsx",
    "  const initial = Route.useLoaderData();",
    '''  // The generated route tree retains the base calendar loader shape during
  // standalone type-checking; Vite supplies the Athletics array loader.
  const initial = Route.useLoaderData() as unknown as AthleticsCalendarEdition[];''',
)
replace_once(
    "src/athletics/routes/calendar.tsx",
    "  const { data = initial, isFetching } = useQuery({",
    "  const { data = initial, isFetching } = useQuery<AthleticsCalendarEdition[]>({",
)
replace_once(
    "src/athletics/routes/calendar.tsx",
    "    queryFn: () =>\n      listCalendarEditions({",
    "    queryFn: async () =>\n      (await listCalendarEditions({",
)
replace_once(
    "src/athletics/routes/calendar.tsx",
    '''          limit: 60,
        },
      }),
    initialData:''',
    '''          limit: 60,
        },
      })) as AthleticsCalendarEdition[],
    initialData:''',
)
replace_once(
    "src/athletics/routes/calendar.tsx",
    "function AthleticsCalendarCard({ edition }: { edition: Awaited<ReturnType<typeof listCalendarEditions>>[number] }) {\n  const status = effectiveStatus(edition.status as EntryStatus, edition.event_date);",
    "function AthleticsCalendarCard({ edition }: { edition: AthleticsCalendarEdition }) {\n  const status = effectiveStatus(edition.event_date, edition.status as EntryStatus);",
)

replace_once(
    "src/athletics/routes/race-series.tsx",
    'import { RaceCard } from "@/components/races/RaceCard";',
    'import { RaceCard } from "@/components/races/RaceCard";\nimport type { EventListItem } from "@/lib/athrecs/types";',
)
replace_once(
    "src/athletics/routes/race-series.tsx",
    "] as const;\n\nexport const Route =",
    "] as const;\n\ntype AthleticsCollection = (typeof COLLECTIONS)[number] & { events: EventListItem[] };\n\nexport const Route =",
)
replace_once(
    "src/athletics/routes/race-series.tsx",
    "  const collections = Route.useLoaderData();",
    '''  // The generated route tree retains the original running-series loader
  // type during standalone type-checking; Vite supplies Athletics collections.
  const collections = Route.useLoaderData() as unknown as AthleticsCollection[];''',
)

print("Athletics route type repairs applied.")
