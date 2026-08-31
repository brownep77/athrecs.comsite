#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: str, before: str, after: str) -> None:
    file = Path(path)
    text = file.read_text()
    if after in text:
        return
    if before not in text:
        raise SystemExit(f"Anchor not found in {path}: {before[:140]!r}")
    file.write_text(text.replace(before, after, 1))


def insert_before_once(path: str, marker: str, addition: str, sentinel: str) -> None:
    file = Path(path)
    text = file.read_text()
    if sentinel in text:
        return
    if marker not in text:
        raise SystemExit(f"Marker not found in {path}: {marker[:140]!r}")
    file.write_text(text.replace(marker, addition + marker, 1))


ATHLETICS_PLUGIN = r'''/**
 * ATHRECS is the Athletics specialist domain. The database and staff backend
 * remain shared, while every public catalogue read is routed through an exact
 * Athletics-only facade. RunRecs builds retain their separate Running/Parkrun
 * facade and never enable this plugin.
 */
function athleticsVariantPlugin(): Plugin {
  const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim() ?? "";
  const explicitBrand = process.env.VITE_SITE_BRAND?.trim().toLowerCase();
  const projectProductionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().toLowerCase() ?? "";
  const runRecsEnabled =
    explicitBrand === "runrecs" ||
    projectProductionHost.includes("runrecs") ||
    branch === "feat/runrecs-running-site" ||
    branch === "runrecs-production";
  const enabled = !runRecsEnabled;

  const moduleAliases = new Map<string, string>([
    ["@/lib/athrecs/api", "src/athletics/api.ts"],
    ["@/lib/athrecs/filters", "src/athletics/filters.ts"],
  ]);
  const routeAliases = new Map<string, string>([
    ["./routes/index", "src/athletics/routes/index.tsx"],
    ["./routes/calendar", "src/athletics/routes/calendar.tsx"],
    ["./routes/race-series", "src/athletics/routes/race-series.tsx"],
    ["./routes/$language/$country/index", "src/athletics/routes/$language/$country/index.tsx"],
  ]);

  return {
    name: "athrecs:athletics-variant",
    enforce: "pre",
    config() {
      if (!enabled) return undefined;
      return {
        define: {
          "import.meta.env.VITE_SITE_BRAND": JSON.stringify("athrecs"),
        },
      };
    },
    resolveId(source, importer) {
      if (!enabled) return null;

      const moduleReplacement = moduleAliases.get(source);
      if (moduleReplacement) return path.resolve(process.cwd(), moduleReplacement);

      const normalizedImporter = importer?.replaceAll("\\", "/") ?? "";
      if (normalizedImporter.endsWith("/src/routeTree.gen.ts")) {
        const routeReplacement = routeAliases.get(source);
        if (routeReplacement) return path.resolve(process.cwd(), routeReplacement);
      }
      return null;
    },
    configResolved() {
      if (enabled) {
        console.log(
          `[athrecs] athletics-only public build enabled (branch=${branch || "local"}, project=${projectProductionHost || "unset"})`,
        );
      }
    },
  };
}

'''

insert_before_once(
    "vite.config.ts",
    "/**\n * Finish PGLite bootstrap during dev-server setup",
    ATHLETICS_PLUGIN,
    "function athleticsVariantPlugin(): Plugin",
)
replace_once(
    "vite.config.ts",
    "    runRecsVariantPlugin(),\n    pgliteBootstrapPlugin(),",
    "    runRecsVariantPlugin(),\n    athleticsVariantPlugin(),\n    pgliteBootstrapPlugin(),",
)

replace_once(
    "src/lib/athrecs/filters.ts",
    "] as const;\n\nexport type SubfilterKey =",
    "] as const;\n\nexport const DEFAULT_SPORT = \"All\" as const;\n\nexport type SubfilterKey =",
)

runrecs_filters = Path("src/runrecs/filters.ts")
runrecs_text = runrecs_filters.read_text()
if "export const DEFAULT_SPORT" not in runrecs_text:
    runrecs_filters.write_text(runrecs_text.rstrip() + '\n\nexport const DEFAULT_SPORT = "All" as const;\n')

replace_once(
    "src/components/races/EventSearch.tsx",
    "  COUNTRY_GROUPS,\n  SPORTS,",
    "  COUNTRY_GROUPS,\n  DEFAULT_SPORT,\n  SPORTS,",
)
replace_once(
    "src/components/races/EventSearch.tsx",
    '  sport: "All",',
    "  sport: DEFAULT_SPORT,",
)
replace_once(
    "src/components/races/EventSearch.tsx",
    "  const subs = subfiltersForSport(value.sport);\n  const showRaceGroups = supportsRaceGroupFilter(value.sport);",
    "  const subs = subfiltersForSport(value.sport);\n  const lockedSport = SPORTS.length === 1 ? SPORTS[0] : null;\n  const showRaceGroups = supportsRaceGroupFilter(value.sport);",
)
replace_once(
    "src/components/races/EventSearch.tsx",
    '''        <Field label="Choose a discipline">
          <select
            value={value.sport}
            onChange={(event) => set("sport", event.target.value)}
            className={fieldClass}
          >
            {SPORTS.map((sport) => (
              <option key={sport} value={sport}>
                {sport === "All" ? "All disciplines" : sport}
              </option>
            ))}
          </select>
        </Field>''',
    '''        {lockedSport ? (
          <div className="rounded-lg border border-border bg-elevated px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">
              Discipline
            </p>
            <p className="mt-1 text-sm font-semibold text-fg">{lockedSport}</p>
          </div>
        ) : (
          <Field label="Choose a discipline">
            <select
              value={value.sport}
              onChange={(event) => set("sport", event.target.value)}
              className={fieldClass}
            >
              {SPORTS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport === "All" ? "All disciplines" : sport}
                </option>
              ))}
            </select>
          </Field>
        )}''',
)
replace_once(
    "src/components/races/EventSearch.tsx",
    '    sport: value.sport === "All" ? undefined : value.sport,',
    '    sport:\n      value.sport === "All" || value.sport === DEFAULT_SPORT ? undefined : value.sport,',
)

replace_once(
    "src/routes/races/index.tsx",
    'import type { Sport } from "@/lib/athrecs/types";\n',
    'import type { Sport } from "@/lib/athrecs/types";\nimport { SPORTS as PUBLIC_SPORTS } from "@/lib/athrecs/filters";\n',
)
races = Path("src/routes/races/index.tsx")
races_text = races.read_text()
old_start = "const SPORT_VALUES = new Set<Sport>(["
if old_start in races_text:
    start = races_text.index(old_start)
    end = races_text.index("]);", start) + 3
    replacement = (
        "const SPORT_VALUES = new Set<Sport>(\n"
        '  PUBLIC_SPORTS.filter((sport): sport is Sport => sport !== "All"),\n'
        ");"
    )
    races.write_text(races_text[:start] + replacement + races_text[end:])
replace_once(
    "src/routes/races/index.tsx",
    '    sport: search.sport ?? "All",',
    "    sport: search.sport ?? EMPTY_SEARCH.sport,",
)
replace_once(
    "src/routes/races/index.tsx",
    '''          <p className="max-w-2xl text-sm text-muted">
            Choose a discipline first, then narrow by its relevant surface, distance or format and
            by country, region, city or town. Every selection remains shareable in the page address.
          </p>''',
    '''          <p className="max-w-2xl text-sm text-muted">
            Search athletics meetings and championships by surface, distance, country, region,
            city or date. Every selection remains shareable in the page address.
          </p>''',
)

replace_once(
    "src/routes/$language/$country/races/index.tsx",
    'import type { Sport } from "@/lib/athrecs/types";\n',
    'import type { Sport } from "@/lib/athrecs/types";\nimport { SPORTS as PUBLIC_SPORTS } from "@/lib/athrecs/filters";\n',
)
country_races = Path("src/routes/$language/$country/races/index.tsx")
country_text = country_races.read_text()
old_start = "const SPORTS = new Set<Sport>(["
if old_start in country_text:
    start = country_text.index(old_start)
    end = country_text.index("]);", start) + 3
    replacement = (
        "const SPORTS = new Set<Sport>(\n"
        '  PUBLIC_SPORTS.filter((sport): sport is Sport => sport !== "All"),\n'
        ");"
    )
    country_races.write_text(country_text[:start] + replacement + country_text[end:])
replace_once(
    "src/routes/$language/$country/races/index.tsx",
    '    sport: search.sport ?? "All",',
    "    sport: search.sport ?? EMPTY_SEARCH.sport,",
)

replace_once(
    "src/routes/__root.tsx",
    '          "running races, marathon calendar, parkrun, 5K, 10K, half marathon, triathlon, cycling events, race results, athletics clubs, ATHRECS",',
    '          "athletics events, track and field, cross country, road athletics, athletics results, athletes, athletics clubs, ATHRECS",',
)
replace_once(
    "src/routes/__root.tsx",
    '        title: `${SITE_NAME} — Find races, results and athletes`,',
    '        title: `${SITE_NAME} — Athletics events, results and athletes`,',
)

replace_once(
    "src/lib/athrecs/seo.ts",
    '  "Find running, triathlon and cycling events — parkruns, 5Ks, 10Ks, half marathons and marathons — plus athletes, clubs and results on ATHRECS.com.";',
    '  "Find track and field meetings, cross-country fixtures, road athletics and championships — plus athletics results, athletes and clubs on ATHRECS.com.";',
)
replace_once(
    "src/lib/athrecs/seo.ts",
    'const title = opts?.title ?? `${SITE_NAME} — Find races, results and athletes`;',
    'const title = opts?.title ?? `${SITE_NAME} — Athletics events, results and athletes`;',
)
replace_once(
    "src/lib/athrecs/seo.ts",
    '    sport: input.sport || "Running",',
    '    sport: input.sport || "Athletics",',
)

replace_once(
    "src/components/layout/AppShell.tsx",
    "          Races\n          <br />\n          Results · Athletes",
    "          Athletics\n          <br />\n          Events · Results",
)

replace_once(
    "package.json",
    '    "build": "node scripts/migrate.mjs && vite build && node scripts/copy-pglite-assets.mjs && node scripts/publish-uk-ireland-prominent-races.mjs && node scripts/publish-remaining-uk-ireland-race-additions.mjs && node scripts/publish-germany-belgium-catalogues.mjs && node scripts/publish-uk-ireland-five-k-release.mjs && node scripts/publish-uk-home-nation-championships.mjs",',
    '    "build": "node scripts/migrate.mjs && vite build && node scripts/write-brand-static.mjs && node scripts/copy-pglite-assets.mjs && node scripts/publish-after-build.mjs",',
)
replace_once(
    "vercel.json",
    '  "buildCommand": "node scripts/migrate.mjs && vite build && node scripts/copy-pglite-assets.mjs && node scripts/publish-after-build.mjs",',
    '  "buildCommand": "node scripts/migrate.mjs && vite build && node scripts/write-brand-static.mjs && node scripts/copy-pglite-assets.mjs && node scripts/publish-after-build.mjs",',
)

print("ATHRECS Athletics-only public wiring applied.")
