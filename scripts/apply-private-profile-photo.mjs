import { readFile, writeFile } from "node:fs/promises";

function replaceOnce(source, before, after, label) {
  const index = source.indexOf(before);
  if (index === -1) throw new Error(`Could not find ${label}`);
  if (source.indexOf(before, index + before.length) !== -1) {
    throw new Error(`Expected one occurrence of ${label}`);
  }
  return `${source.slice(0, index)}${after}${source.slice(index + before.length)}`;
}

const accountPath = "src/lib/athrecs/athlete-account-api.ts";
let account = await readFile(accountPath, "utf8");

account = replaceOnce(
  account,
  `  preferredLanguage: string;
  privacyAcknowledged: boolean;`,
  `  preferredLanguage: string;
  profilePhotoUrl: string;
  profilePhotoUpdatedAt: string | null;
  profilePhotoUploadAvailable: boolean;
  authImageUrl: string;
  privacyAcknowledged: boolean;`,
  "AthleteAccountData photo fields",
);

account = replaceOnce(
  account,
  `type UserRow = {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
};`,
  `type UserRow = {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image: string | null;
};`,
  "UserRow image field",
);

account = replaceOnce(
  account,
  `  updated_at: string;
};

type SportRow = {`,
  `  updated_at: string;
};

type ProfilePhotoRow = {
  updated_at: string;
};

type SportRow = {`,
  "profile photo row type",
);

account = replaceOnce(
  account,
  `function mapConsents(rows: Array<{ purpose: string; status: string }>): AthleteAccountConsents {
  const granted = new Set(rows.filter((row) => row.status === "granted").map((row) => row.purpose));
  return {
    performanceInsights: granted.has("performance_insights"),
    personalisation: granted.has("personalisation"),
    productResearch: granted.has("product_research"),
    marketing: granted.has("marketing"),
  };
}

async function loadAccount`,
  `function mapConsents(rows: Array<{ purpose: string; status: string }>): AthleteAccountConsents {
  const granted = new Set(rows.filter((row) => row.status === "granted").map((row) => row.purpose));
  return {
    performanceInsights: granted.has("performance_insights"),
    personalisation: granted.has("personalisation"),
    productResearch: granted.has("product_research"),
    marketing: granted.has("marketing"),
  };
}

function safeImageUrl(value: string | null): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

async function loadAccount`,
  "safe authentication image URL helper",
);

account = replaceOnce(
  account,
  `      "name" as name,
      lower("email") as email,
      "emailVerified" as email_verified`,
  `      "name" as name,
      lower("email") as email,
      "emailVerified" as email_verified,
      "image" as image`,
  "user image query",
);

account = replaceOnce(
  account,
  `  const [profiles, sports, preferences, consentRows, claimedProfiles, claimedResults, claimCounts] =
    await Promise.all([`,
  `  const [
    profiles,
    photos,
    sports,
    preferences,
    consentRows,
    claimedProfiles,
    claimedResults,
    claimCounts,
  ] = await Promise.all([`,
  "loadAccount Promise.all destructure",
);

account = replaceOnce(
  account,
  `      sql<SportRow>\`
        select *
        from athlete_sport_profiles`,
  `      sql<ProfilePhotoRow>\`
        select updated_at::text as updated_at
        from athlete_profile_photos
        where user_id = \${userId}
        limit 1
      \`,
      sql<SportRow>\`
        select *
        from athlete_sport_profiles`,
  "profile photo metadata query",
);

account = replaceOnce(
  account,
  `  const profile = profiles[0];
  return {`,
  `  const profile = profiles[0];
  const photo = photos[0];
  const profilePhotoUploadAvailable = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  return {`,
  "profile photo return setup",
);

account = replaceOnce(
  account,
  `    preferredLanguage: profile?.preferred_language ?? "",
    privacyAcknowledged: Boolean(profile?.privacy_acknowledged_at),`,
  `    preferredLanguage: profile?.preferred_language ?? "",
    profilePhotoUrl:
      photo && profilePhotoUploadAvailable
        ? \`/api/athlete-profile-photo?v=\${encodeURIComponent(photo.updated_at)}\`
        : "",
    profilePhotoUpdatedAt: photo?.updated_at ?? null,
    profilePhotoUploadAvailable,
    authImageUrl: safeImageUrl(user.image),
    privacyAcknowledged: Boolean(profile?.privacy_acknowledged_at),`,
  "profile photo account response",
);

await writeFile(accountPath, account);

const profilePath = "src/routes/my-athlete-profile.tsx";
let profile = await readFile(profilePath, "utf8");
profile = replaceOnce(
  profile,
  `import { useQuery } from "@tanstack/react-query";`,
  `import { useQuery, useQueryClient } from "@tanstack/react-query";`,
  "query client import",
);
profile = replaceOnce(
  profile,
  `import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";`,
  `import { ProfilePhotoUploader } from "@/components/athletes/ProfilePhotoUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";`,
  "profile photo uploader import",
);
profile = replaceOnce(
  profile,
  `function MyAthleteProfilePage() {
  const { user, isPending: sessionPending } = useCurrentUserState();`,
  `function MyAthleteProfilePage() {
  const { user, isPending: sessionPending } = useCurrentUserState();
  const queryClient = useQueryClient();`,
  "profile query client",
);
profile = replaceOnce(
  profile,
  `  const distanceCount = new Set(results.map((result) => result.distanceCode)).size;

  return (`,
  `  const distanceCount = new Set(results.map((result) => result.distanceCode)).size;
  const primarySport = data.sports.find((sport) => sport.isPrimary) ?? data.sports[0];
  const location = [data.city, data.region, data.country].filter(Boolean).join(", ");

  return (`,
  "profile summary fields",
);

const oldHero = `      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-7 text-white md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                  <LockKeyhole className="mr-1 size-3.5" aria-hidden="true" />
                  Private profile
                </Badge>
                {data.claimedProfiles.length ? (
                  <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                    <CheckCircle2 className="mr-1 size-3.5" aria-hidden="true" />
                    Results claimed
                  </Badge>
                ) : null}
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
                {profileName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Your claimed identities, results and personal bests in one clean private view.
                Ordinary athlete profiles are not visible to the public.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to="/claim-results" search={{ resultId: undefined }}>
                  Claim another result
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/athlete-account">
                  <UserRound className="size-4" aria-hidden="true" />
                  Edit Athlete Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>`;

const newHero = `      <section className="relative overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-card">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-7 text-white md:px-8 md:py-9">
          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            <ProfilePhotoUploader
              displayName={profileName}
              photoUrl={data.profilePhotoUrl}
              fallbackImageUrl={data.authImageUrl}
              uploadAvailable={data.profilePhotoUploadAvailable}
              onChanged={() => {
                void queryClient.invalidateQueries({ queryKey: ["my-athlete-account"] });
              }}
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                  <LockKeyhole className="mr-1 size-3.5" aria-hidden="true" />
                  Private profile
                </Badge>
                {data.claimedProfiles.length ? (
                  <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                    <CheckCircle2 className="mr-1 size-3.5" aria-hidden="true" />
                    Results claimed
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-3 truncate font-display text-3xl font-semibold md:text-5xl">
                {profileName}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
                {primarySport ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    {primarySport.sportCode}
                  </span>
                ) : null}
                {data.clubOrTeam ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    {data.clubOrTeam}
                  </span>
                ) : null}
                {location ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    {location}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                A private record of your claimed identities, performances and personal bests. Your
                photograph and ordinary athlete profile are not published publicly.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link to="/claim-results" search={{ resultId: undefined }}>
                    Claim another result
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/athlete-account">
                    <UserRound className="size-4" aria-hidden="true" />
                    Edit Athlete Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>`;
profile = replaceOnce(profile, oldHero, newHero, "private profile hero");
profile = replaceOnce(
  profile,
  `      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">`,
  `      <section className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:-mt-10 md:px-6">`,
  "profile stat card layout",
);
await writeFile(profilePath, profile);

const vercelPath = "vercel.json";
const vercelConfig = JSON.parse(await readFile(vercelPath, "utf8"));
if (!vercelConfig.headers.some((entry) => entry.source === "/api/athlete-profile-photo")) {
  vercelConfig.headers.push({
    source: "/api/athlete-profile-photo",
    headers: [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      {
        key: "Cache-Control",
        value: "private, no-store, no-cache, max-age=0, must-revalidate",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ],
  });
}
await writeFile(vercelPath, `${JSON.stringify(vercelConfig, null, 2)}\n`);

const envPath = ".env.example";
let envExample = await readFile(envPath, "utf8");
if (!envExample.includes("BLOB_READ_WRITE_TOKEN=")) {
  envExample += `\n# Private Athlete Profile photographs (connect a private Vercel Blob store)\nBLOB_READ_WRITE_TOKEN=\n`;
}
await writeFile(envPath, envExample);

const packagePath = "package.json";
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
packageJson.scripts["verify:profile-photo"] = "node scripts/verify-profile-photo.mjs";
packageJson.scripts["ci:verify"] = packageJson.scripts["ci:verify"].replace(
  "npm run verify:claim-experience &&",
  "npm run verify:claim-experience && npm run verify:profile-photo &&",
);
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log("Private profile photo feature applied");
