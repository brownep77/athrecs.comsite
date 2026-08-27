import { readFile, writeFile } from "node:fs/promises";

const profilePath = "src/routes/my-athlete-profile.tsx";
let profile = await readFile(profilePath, "utf8");

profile = profile.replace('  ArrowRight,\n  Award,\n', "");
profile = profile.replace(
  'import { AthleteBioCard } from "@/components/athletes/AthleteBioCard";\n',
  'import { AthleteBioCard } from "@/components/athletes/AthleteBioCard";\nimport { AthleteResultsSection } from "@/components/athletes/AthleteResultsSection";\n',
);
profile = profile.replace(
  'import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";\n',
  'import { getMyProfileResultVisibility } from "@/lib/athrecs/athlete-profile-results-api";\n',
);
profile = profile.replace(
  '\ntype ClaimedResult = AthleteAccountData["claimedResults"][number];\n',
  "\n",
);

const personalBestHook = `  const personalBests = useMemo(
    () => findPersonalBests(account.data?.claimedResults ?? []),
    [account.data?.claimedResults],
  );
`;
const visibilityHooks = `  const resultVisibility = useQuery({
    queryKey: ["my-profile-result-visibility"],
    queryFn: () => getMyProfileResultVisibility(),
    enabled: Boolean(user),
    retry: false,
  });
  const hiddenResultIdSet = useMemo(
    () => new Set(resultVisibility.data?.hiddenResultIds ?? []),
    [resultVisibility.data?.hiddenResultIds],
  );
  const profileResults = useMemo(() => {
    const allResults = account.data?.claimedResults ?? [];
    return {
      visible: allResults.filter((result) => !hiddenResultIdSet.has(result.resultId)),
      hidden: allResults.filter((result) => hiddenResultIdSet.has(result.resultId)),
    };
  }, [account.data?.claimedResults, hiddenResultIdSet]);
`;
if (!profile.includes(personalBestHook)) throw new Error("Could not find personal-best hook block");
profile = profile.replace(personalBestHook, visibilityHooks);

profile = profile.replace(
  '  if (account.isLoading) return <LoadingCard label="Building your private profile…" />;',
  '  if (account.isLoading || resultVisibility.isLoading)\n    return <LoadingCard label="Building your private profile…" />;',
);

const resultSetup = `  const profileName = data.displayName || data.fullName || data.authName || "My Athlete Profile";
  const results = data.claimedResults;
  const recentResults = results.slice(0, 12);
  const olderResults = results.slice(12);
`;
const visibleResultSetup = `  const profileName = data.displayName || data.fullName || data.authName || "My Athlete Profile";
  const results = profileResults.visible;
  const hiddenResults = profileResults.hidden;
`;
if (!profile.includes(resultSetup)) throw new Error("Could not find profile result setup");
profile = profile.replace(resultSetup, visibleResultSetup);

const resultBlockPattern = /      \{results\.length === 0 \? \([\s\S]*?      \)\}\n\n      <section className="flex flex-wrap items-center/;
if (!resultBlockPattern.test(profile)) throw new Error("Could not find legacy result-card block");
profile = profile.replace(
  resultBlockPattern,
  `      <AthleteResultsSection results={results} hiddenResults={hiddenResults} />\n\n      <section className="flex flex-wrap items-center`,
);

profile = profile.replace(
  /\nfunction ResultCard\([\s\S]*?\nfunction LoadingCard/,
  "\nfunction LoadingCard",
);
profile = profile.replace(/\nfunction findPersonalBests[\s\S]*$/, "\n");

await writeFile(profilePath, profile);

const bioPath = "src/lib/athrecs/athlete-bio-api.ts";
let bio = await readFile(bioPath, "utf8");
const bioFilterNeedle = `      where account_link.user_id = \${userId}
        and account_link.status = 'active'
      order by edition.event_date desc, result.id desc
`;
const bioFilterReplacement = `      where account_link.user_id = \${userId}
        and account_link.status = 'active'
        and not exists (
          select 1
          from athlete_profile_hidden_results hidden
          where hidden.user_id = \${userId}
            and hidden.result_id = result.id
        )
      order by edition.event_date desc, result.id desc
`;
if (!bio.includes(bioFilterNeedle)) throw new Error("Could not find automatic bio result filter");
bio = bio.replace(bioFilterNeedle, bioFilterReplacement);
await writeFile(bioPath, bio);

const componentPath = "src/components/athletes/AthleteResultsSection.tsx";
let component = await readFile(componentPath, "utf8");
component = component.replace("  Medal,\n", "");
await writeFile(componentPath, component);

const packagePath = "package.json";
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
packageJson.scripts["verify:athlete-profile-results"] =
  "node scripts/verify-athlete-profile-results.mjs";
if (!packageJson.scripts["ci:verify"].includes("verify:athlete-profile-results")) {
  const marker = "npm run verify:athlete-bio &&";
  if (!packageJson.scripts["ci:verify"].includes(marker)) {
    throw new Error("Could not find Athlete Bio quality-gate marker");
  }
  packageJson.scripts["ci:verify"] = packageJson.scripts["ci:verify"].replace(
    marker,
    `${marker} npm run verify:athlete-profile-results &&`,
  );
}
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log("Compact Athlete Profile results integrated");
