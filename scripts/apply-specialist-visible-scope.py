#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: str, before: str, after: str) -> None:
    file = Path(path)
    text = file.read_text()
    if after in text:
        return
    if before not in text:
        raise SystemExit(f"Anchor not found in {path}: {before[:180]!r}")
    file.write_text(text.replace(before, after, 1))


def replace_last(path: str, before: str, after: str) -> None:
    file = Path(path)
    text = file.read_text()
    if after in text:
        return
    index = text.rfind(before)
    if index < 0:
        raise SystemExit(f"Last anchor not found in {path}: {before[:180]!r}")
    file.write_text(text[:index] + after + text[index + len(before):])


# Specialist server-module aliases. These close direct public redirect and
# unlisted shared-profile paths, not just the visible catalogue routes.
replace_once(
    "vite.config.ts",
    '    ["@/lib/athrecs/seo", "src/runrecs/seo.ts"],\n',
    '    ["@/lib/athrecs/seo", "src/runrecs/seo.ts"],\n'
    '    ["@/lib/athrecs/official-entry.server", "src/runrecs/official-entry.server.ts"],\n'
    '    ["@/lib/athrecs/athlete-profile-share-api", "src/runrecs/athlete-profile-share-api.ts"],\n',
)
replace_once(
    "vite.config.ts",
    '    ["@/lib/athrecs/filters", "src/athletics/filters.ts"],\n',
    '    ["@/lib/athrecs/filters", "src/athletics/filters.ts"],\n'
    '    ["@/lib/athrecs/official-entry.server", "src/athletics/official-entry.server.ts"],\n'
    '    ["@/lib/athrecs/athlete-profile-share-api", "src/athletics/athlete-profile-share-api.ts"],\n',
)

# Carry the event sport through private account and claim payloads so every
# specialist frontend can hide records outside its visible domain without
# deleting shared SportsRecs account data.
replace_once(
    "src/lib/athrecs/athlete-account-api.ts",
    "    eventName: string;\n    eventSlug: string;\n    eventDate: string;",
    "    eventName: string;\n    eventSlug: string;\n    sport: string;\n    eventDate: string;",
)
replace_once(
    "src/lib/athrecs/athlete-account-api.ts",
    "        event_name: string;\n        event_slug: string;\n        event_date: string;",
    "        event_name: string;\n        event_slug: string;\n        event_sport: string;\n        event_date: string;",
)
replace_once(
    "src/lib/athrecs/athlete-account-api.ts",
    "          event.name as event_name,\n          event.slug as event_slug,\n          edition.event_date::text as event_date,",
    "          event.name as event_name,\n          event.slug as event_slug,\n          event.sport as event_sport,\n          edition.event_date::text as event_date,",
)
replace_once(
    "src/lib/athrecs/athlete-account-api.ts",
    "      eventName: row.event_name,\n      eventSlug: row.event_slug,\n      eventDate: row.event_date,",
    "      eventName: row.event_name,\n      eventSlug: row.event_slug,\n      sport: row.event_sport,\n      eventDate: row.event_date,",
)

replace_once(
    "src/lib/athrecs/result-match-api.ts",
    "  eventName: string;\n  eventSlug: string;\n  eventDate: string;",
    "  eventName: string;\n  eventSlug: string;\n  sport: string;\n  eventDate: string;",
)
replace_once(
    "src/lib/athrecs/result-match-api.ts",
    "  event_name: string;\n  event_slug: string;\n  event_date: string;",
    "  event_name: string;\n  event_slug: string;\n  event_sport: string;\n  event_date: string;",
)
replace_once(
    "src/lib/athrecs/result-match-api.ts",
    "        event.name as event_name,\n        event.slug as event_slug,\n        edition.event_date::text as event_date,",
    "        event.name as event_name,\n        event.slug as event_slug,\n        event.sport as event_sport,\n        edition.event_date::text as event_date,",
)
replace_once(
    "src/lib/athrecs/result-match-api.ts",
    "          eventName: row.event_name,\n          eventSlug: row.event_slug,\n          eventDate: row.event_date,",
    "          eventName: row.event_name,\n          eventSlug: row.event_slug,\n          sport: row.event_sport,\n          eventDate: row.event_date,",
)

replace_once(
    "src/lib/athrecs/result-claims-api.ts",
    "  eventName: string;\n  eventSlug: string;\n  eventDate: string;",
    "  eventName: string;\n  eventSlug: string;\n  sport: string;\n  eventDate: string;",
)
replace_once(
    "src/lib/athrecs/result-claims-api.ts",
    "  event_name: string;\n  event_slug: string;\n  event_date: string;",
    "  event_name: string;\n  event_slug: string;\n  event_sport: string;\n  event_date: string;",
)
replace_once(
    "src/lib/athrecs/result-claims-api.ts",
    "    eventName: row.event_name,\n    eventSlug: row.event_slug,\n    eventDate: row.event_date,",
    "    eventName: row.event_name,\n    eventSlug: row.event_slug,\n    sport: row.event_sport,\n    eventDate: row.event_date,",
)
replace_once(
    "src/lib/athrecs/result-claims-api.ts",
    "    event.name as event_name,\n    event.slug as event_slug,\n    edition.event_date::text as event_date,",
    "    event.name as event_name,\n    event.slug as event_slug,\n    event.sport as event_sport,\n    edition.event_date::text as event_date,",
)
replace_once(
    "src/lib/athrecs/result-claims-api.ts",
    "      event_name: string;\n      event_slug: string;\n      event_date: string;",
    "      event_name: string;\n      event_slug: string;\n      event_sport: string;\n      event_date: string;",
)
replace_once(
    "src/lib/athrecs/result-claims-api.ts",
    "        event.name as event_name,\n        event.slug as event_slug,\n        edition.event_date::text as event_date,",
    "        event.name as event_name,\n        event.slug as event_slug,\n        event.sport as event_sport,\n        edition.event_date::text as event_date,",
)
replace_once(
    "src/lib/athrecs/result-claims-api.ts",
    "      eventName: row.event_name,\n      eventSlug: row.event_slug,\n      eventDate: row.event_date,",
    "      eventName: row.event_name,\n      eventSlug: row.event_slug,\n      sport: row.event_sport,\n      eventDate: row.event_date,",
)

# Potential result suggestions are restricted in the UI. The optional broad
# external-runner search is hidden on the Athletics specialist site.
replace_once(
    "src/components/athletes/PotentialResultMatchesPanel.tsx",
    'import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";\n',
    'import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";\n'
    'import { IS_ATHRECS_SITE, sportIsInPublicSiteScope } from "@/lib/site-scope";\n',
)
replace_once(
    "src/components/athletes/PotentialResultMatchesPanel.tsx",
    "    enabled: Boolean(user) && searchPublic,",
    "    enabled: Boolean(user) && searchPublic && !IS_ATHRECS_SITE,",
)
replace_once(
    "src/components/athletes/PotentialResultMatchesPanel.tsx",
    "  const data = matches.data;\n  const visibleMatches = expanded\n    ? data.matches\n    : data.matches.slice(0, INITIAL_MATCH_COUNT);",
    "  const scopedMatches = matches.data.matches.filter((match) =>\n    sportIsInPublicSiteScope(match.sport),\n  );\n  const data = {\n    ...matches.data,\n    matches: scopedMatches,\n    totalMatches: scopedMatches.length,\n  };\n  const visibleMatches = expanded\n    ? data.matches\n    : data.matches.slice(0, INITIAL_MATCH_COUNT);",
)
replace_once(
    "src/components/athletes/PotentialResultMatchesPanel.tsx",
    '      <div className="border-t border-border bg-elevated/40 p-5">',
    '      {!IS_ATHRECS_SITE ? (\n        <div className="border-t border-border bg-elevated/40 p-5">',
)
replace_last(
    "src/components/athletes/PotentialResultMatchesPanel.tsx",
    "      </div>\n    </section>",
    "        </div>\n      ) : null}\n    </section>",
)

# Claim screens and private profile show only the active specialist site's
# results, while retaining other records in the shared account database.
replace_once(
    "src/routes/claim-results.tsx",
    'import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";\n',
    'import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";\n'
    'import { sportIsInPublicSiteScope } from "@/lib/site-scope";\n',
)
replace_once(
    "src/routes/claim-results.tsx",
    "  const currentClaim = myClaims.data?.find((claim) => claim.resultId === resultId);\n  const hasPrivateProfile = (myClaims.data ?? []).some((claim) => claim.status === \"approved\");",
    "  const siteClaims = (myClaims.data ?? []).filter((claim) =>\n    sportIsInPublicSiteScope(claim.sport),\n  );\n  const currentClaim = siteClaims.find((claim) => claim.resultId === resultId);\n  const hasPrivateProfile = siteClaims.some((claim) => claim.status === \"approved\");",
)
replace_once(
    "src/routes/claim-results.tsx",
    "      ) : result.isError || !result.data ? (",
    "      ) : result.isError || !result.data || !sportIsInPublicSiteScope(result.data.sport) ? (",
)
replace_once(
    "src/routes/claim-results.tsx",
    "          claims={myClaims.data ?? []}",
    "          claims={siteClaims}",
)

replace_once(
    "src/routes/my-athlete-profile.tsx",
    'import { getMyProfileResultVisibility } from "@/lib/athrecs/athlete-profile-results-api";\n',
    'import { getMyProfileResultVisibility } from "@/lib/athrecs/athlete-profile-results-api";\n'
    'import { sportIsInPublicSiteScope } from "@/lib/site-scope";\n',
)
replace_once(
    "src/routes/my-athlete-profile.tsx",
    "    const allResults = account.data?.claimedResults ?? [];\n    return {",
    "    const allResults = (account.data?.claimedResults ?? []).filter((result) =>\n      sportIsInPublicSiteScope(result.sport),\n    );\n    return {",
)
replace_once(
    "src/routes/my-athlete-profile.tsx",
    "  const primarySport = data.sports.find((sport) => sport.isPrimary) ?? data.sports[0];",
    "  const primarySport =\n    data.sports.find((sport) => sport.isPrimary && sportIsInPublicSiteScope(sport.sportCode)) ??\n    data.sports.find((sport) => sportIsInPublicSiteScope(sport.sportCode));",
)

# Athlete Account keeps hidden network sports intact on save, but ATHRECS only
# presents Athletics choices and Athletics-appropriate equipment.
replace_once(
    "src/routes/athlete-account.tsx",
    'import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";\n',
    'import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";\n'
    'import { IS_ATHRECS_SITE, sportIsInPublicSiteScope } from "@/lib/site-scope";\n',
)
replace_once(
    "src/routes/athlete-account.tsx",
    "const EQUIPMENT = [\n  \"Running shoes\",\n  \"Trail shoes\",\n  \"Bike\",\n  \"Helmet\",\n  \"Wetsuit\",\n  \"Goggles\",\n  \"GPS watch\",\n  \"Heart-rate monitor\",\n  \"Gym equipment\",\n  \"Other\",\n];",
    "const ACCOUNT_SPORTS: readonly AthleteSportCode[] = IS_ATHRECS_SITE\n  ? [\"Athletics\"]\n  : ATHLETE_SPORTS;\nconst ACCOUNT_SPORT_SET = new Set<string>(ACCOUNT_SPORTS);\n\nconst EQUIPMENT = IS_ATHRECS_SITE\n  ? [\n      \"Running shoes\",\n      \"Track spikes\",\n      \"Cross-country spikes\",\n      \"Field-event shoes\",\n      \"Throwing implements\",\n      \"Training equipment\",\n      \"GPS watch\",\n      \"Heart-rate monitor\",\n      \"Gym equipment\",\n      \"Other\",\n    ]\n  : [\n      \"Running shoes\",\n      \"Trail shoes\",\n      \"Bike\",\n      \"Helmet\",\n      \"Wetsuit\",\n      \"Goggles\",\n      \"GPS watch\",\n      \"Heart-rate monitor\",\n      \"Gym equipment\",\n      \"Other\",\n    ];",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "const TECHNOLOGY_DEVICES = [\n  \"GPS watch\",\n  \"Smartwatch\",\n  \"Heart-rate strap\",\n  \"Bike computer\",\n  \"Power meter\",\n  \"Foot pod\",\n  \"Smart trainer\",\n  \"Phone only\",\n];",
    "const TECHNOLOGY_DEVICES = IS_ATHRECS_SITE\n  ? [\"GPS watch\", \"Smartwatch\", \"Heart-rate strap\", \"Foot pod\", \"Phone only\"]\n  : [\n      \"GPS watch\",\n      \"Smartwatch\",\n      \"Heart-rate strap\",\n      \"Bike computer\",\n      \"Power meter\",\n      \"Foot pod\",\n      \"Smart trainer\",\n      \"Phone only\",\n    ];",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "const TECHNOLOGY_APPS = [\n  \"Strava\",\n  \"Garmin Connect\",\n  \"COROS\",\n  \"Polar Flow\",\n  \"Suunto\",\n  \"Apple Fitness\",\n  \"TrainingPeaks\",\n  \"Zwift\",\n  \"Komoot\",\n  \"Other\",\n];",
    "const TECHNOLOGY_APPS = IS_ATHRECS_SITE\n  ? [\"Strava\", \"Garmin Connect\", \"COROS\", \"Polar Flow\", \"Suunto\", \"Apple Fitness\", \"TrainingPeaks\", \"Other\"]\n  : [\n      \"Strava\",\n      \"Garmin Connect\",\n      \"COROS\",\n      \"Polar Flow\",\n      \"Suunto\",\n      \"Apple Fitness\",\n      \"TrainingPeaks\",\n      \"Zwift\",\n      \"Komoot\",\n      \"Other\",\n    ];",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "const CLOTHING = [\n  \"Tops / vests\",\n  \"Shorts\",\n  \"Tights / leggings\",\n  \"Jackets\",\n  \"Socks\",\n  \"Sports bras\",\n  \"Cycling kit\",\n  \"Swimwear\",\n  \"Compression kit\",\n];",
    "const CLOTHING = IS_ATHRECS_SITE\n  ? [\"Tops / vests\", \"Shorts\", \"Tights / leggings\", \"Jackets\", \"Socks\", \"Sports bras\", \"Competition kit\", \"Compression kit\"]\n  : [\n      \"Tops / vests\",\n      \"Shorts\",\n      \"Tights / leggings\",\n      \"Jackets\",\n      \"Socks\",\n      \"Sports bras\",\n      \"Cycling kit\",\n      \"Swimwear\",\n      \"Compression kit\",\n    ];",
)
replace_once(
    "src/routes/athlete-account.tsx",
    '        content: "Manage your private ATHRECS Entry Passport, sports, training and preferences.",',
    '        content: IS_ATHRECS_SITE\n          ? "Manage your private ATHRECS Athletics Entry Passport, training and preferences."\n          : "Manage your private ATHRECS Entry Passport, sports, training and preferences.",',
)
replace_once(
    "src/routes/athlete-account.tsx",
    "  const completion = accountCompletion(form, account.data.verifiedEmail);",
    "  const visibleSports = form.sports.filter((sport) =>\n    ACCOUNT_SPORT_SET.has(sport.sportCode),\n  );\n  const visibleClaimedResults = account.data.claimedResults.filter((result) =>\n    sportIsInPublicSiteScope(result.sport),\n  );\n  const completion = accountCompletion(form, account.data.verifiedEmail);",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "              {account.data.claimedResults.length ? (",
    "              {visibleClaimedResults.length ? (",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "                  {account.data.claimedResults.map((result) => (",
    "                  {visibleClaimedResults.map((result) => (",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "            These fields stay private. ATHRECS uses them only to suggest possible Power of 10,\n            parkrun, World Athletics or official result pages. Nothing is linked until you claim it.",
    "            These fields stay private. ATHRECS uses them only to suggest possible Power of 10,\n            World Athletics or official athletics result pages. Nothing is linked until you claim it.",
)
replace_once(
    "src/routes/athlete-account.tsx",
    '''            <TextField
              label="parkrun barcode"
              value={form.parkrunId ?? ""}
              onChange={(value) => setForm({ ...form, parkrunId: value })}
              help="The number printed on your parkrun barcode, without A."
            />''',
    '''            {!IS_ATHRECS_SITE ? (
              <TextField
                label="parkrun barcode"
                value={form.parkrunId ?? ""}
                onChange={(value) => setForm({ ...form, parkrunId: value })}
                help="The number printed on your parkrun barcode, without A."
              />
            ) : null}''',
)
replace_once(
    "src/routes/athlete-account.tsx",
    '              placeholder="London Marathon"',
    '              placeholder={IS_ATHRECS_SITE ? "British Athletics Championships" : "London Marathon"}',
)
replace_once(
    "src/routes/athlete-account.tsx",
    '              placeholder="Marathon"',
    '              placeholder={IS_ATHRECS_SITE ? "100m" : "Marathon"}',
)
replace_once(
    "src/routes/athlete-account.tsx",
    '          title="Sports and training"\n          description="Add every sport that is relevant to you, then optionally describe disciplines, distances, training and goals."',
    '          title={IS_ATHRECS_SITE ? "Athletics and training" : "Sports and training"}\n          description={\n            IS_ATHRECS_SITE\n              ? "Add Athletics, then optionally describe disciplines, distances, training and goals."\n              : "Add every sport that is relevant to you, then optionally describe disciplines, distances, training and goals."\n          }',
)
replace_once(
    "src/routes/athlete-account.tsx",
    "            choices={[...ATHLETE_SPORTS]}\n            selected={form.sports.map((sport) => sport.sportCode)}\n            onChange={(codes) =>\n              setForm({\n                ...form,\n                sports: codes.map((code, index) => {\n                  const current = form.sports.find((sport) => sport.sportCode === code);\n                  return current ?? emptySport(code as AthleteSportCode, index === 0);\n                }),\n              })\n            }",
    "            choices={[...ACCOUNT_SPORTS]}\n            selected={visibleSports.map((sport) => sport.sportCode)}\n            onChange={(codes) => {\n              const hiddenSports = IS_ATHRECS_SITE\n                ? form.sports.filter((sport) => !ACCOUNT_SPORT_SET.has(sport.sportCode))\n                : [];\n              const hasHiddenPrimary = hiddenSports.some((sport) => sport.isPrimary);\n              const nextVisibleSports = codes.map((code, index) => {\n                const current = form.sports.find((sport) => sport.sportCode === code);\n                return (\n                  current ??\n                  emptySport(code as AthleteSportCode, index === 0 && !hasHiddenPrimary)\n                );\n              });\n              setForm({ ...form, sports: [...hiddenSports, ...nextVisibleSports] });\n            }}",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "          {form.sports.length ? (\n            <div className=\"mt-5 grid gap-4\">\n              {form.sports.map((sport) => (",
    "          {visibleSports.length ? (\n            <div className=\"mt-5 grid gap-4\">\n              {visibleSports.map((sport) => (",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "              No sport selected yet. You can save the account without adding one.",
    "              {IS_ATHRECS_SITE\n                ? \"Athletics has not been added yet. You can still save the account.\"\n                : \"No sport selected yet. You can save the account without adding one.\"}",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "          description=\"What equipment do you use for your sports?\"",
    "          description={IS_ATHRECS_SITE ? \"What equipment do you use for athletics?\" : \"What equipment do you use for your sports?\"}",
)
replace_once(
    "src/routes/athlete-account.tsx",
    "          Keep your identity, claimed results, sports, training, kit and preferences together.\n          Private account data is not added to your public athlete profile automatically.",
    "          Keep your identity, claimed results, athletics training, kit and preferences together.\n          Private account data is not added to your public athlete profile automatically.",
)

print("Specialist visible-scope hardening applied.")
