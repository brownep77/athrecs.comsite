import { canViewAthleteProfiles } from "@/lib/auth/profile-access";
import { ProfileSignIn, ProfileViewer } from "@/components/athletes/ProfileSignIn";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { SuggestProfileEdit } from "@/components/athletes/SuggestProfileEdit";
import { publicAthleteBio } from "@/lib/athrecs/public-athlete-bio";
import { isPublicProfileSource } from "@/lib/athrecs/public-profile-sources";
import { getEditorialAthleteCareer } from "@/data/freddy-richardson";
import { AthleteCareerHighlights } from "@/components/athletes/AthleteCareerHighlights";
import { ProfileRecordHighlights } from "@/components/athletes/ProfileAchievements";
import {
  EditorialAthleteOverview,
  EditorialRoadSplits,
} from "@/components/athletes/EditorialAthleteOverview";
import { CompactResults } from "@/components/athletes/CompactResultsTable";
import { SourcePerformanceHistory } from "@/components/athletes/SourcePerformanceHistory";
import { AthleteMediaCoverage } from "@/components/athletes/AthleteMediaCoverage";
import { UpcomingTable } from "@/components/athletes/UpcomingEvents";
import { ProfileDetails } from "@/components/athletes/ProfileDetails";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, LockKeyhole, LogIn, MapPin } from "lucide-react";
import {
  getAthleteBySlug,
  getPrivateAthleteBySlug,
  getAdministratorPublishedAthlete,
} from "@/lib/athrecs/api";
import { absoluteUrl, SITE_NAME } from "@/lib/athrecs/seo";
import { Badge } from "@/components/ui/badge";
import { resolveSlugRedirect } from "@/lib/athrecs/slug-redirects";
import { Button } from "@/components/ui/button";
import { ShareProfileButton } from "@/components/athletes/ShareProfileButton";
import { SharedAccountProfile } from "@/components/athletes/SharedAccountProfile";
import { getPublishedSharedProfile } from "@/lib/athrecs/athlete-profile-share-api";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AthleteId } from "@/components/athletes/AthleteId";
import { formatAthleteId } from "@/lib/athrecs/athlete-id";
import { UnverifiedRaceHistory } from "@/components/athletes/UnverifiedRaceHistory";
import { getReportedRaceHistory } from "@/lib/athrecs/reported-race-history";

export const Route = createFileRoute("/athletes/$slug")({
  headers: () => ({
    "Cache-Control": "private, no-store",
    Vary: "Cookie, Authorization",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  }),
  loader: async ({ params }) => {
    const published = await getAdministratorPublishedAthlete({ data: params.slug });
    if (published) {
      if (published.athlete.slug !== params.slug) {
        throw redirect({
          to: "/athletes/$slug",
          params: { slug: published.athlete.slug },
          statusCode: 301,
        });
      }
      return { kind: "published-history" as const, ...published };
    }
    if (!(await canViewAthleteProfiles())) return { kind: "sign-in" as const };
    const shared = await getPublishedSharedProfile({ data: { slug: params.slug } }).catch(
      () => null,
    );
    if (shared) {
      if (shared.searchIndexable && shared.slug !== params.slug) {
        throw redirect({ to: "/athletes/$slug", params: { slug: shared.slug }, statusCode: 301 });
      }
      return { kind: "shared-account" as const, profile: shared };
    }

    const data = await getAthleteBySlug({ data: params.slug });
    if (data) {
      if (data.athlete.slug !== params.slug) {
        throw redirect({
          to: "/athletes/$slug",
          params: { slug: data.athlete.slug },
          statusCode: 301,
        });
      }
      return { kind: "catalogue" as const, ...data };
    }

    const privateAthlete = await getPrivateAthleteBySlug({ data: params.slug });
    if (privateAthlete) {
      return { kind: "private-athlete" as const, athlete: privateAthlete };
    }

    const currentSlug = await resolveSlugRedirect({
      data: { entityType: "athlete", slug: params.slug },
    });
    if (currentSlug && currentSlug !== params.slug) {
      throw redirect({
        to: "/athletes/$slug",
        params: { slug: currentSlug },
        statusCode: 301,
      });
    }
    throw notFound();
  },
  head: ({ params, loaderData }) => ({
    links: [{ rel: "canonical", href: absoluteUrl(`/athletes/${params.slug}`) }],
    meta: [
      {
        title:
          loaderData?.kind === "published-history"
            ? `${loaderData.athlete.display_name} | ${SITE_NAME}`
            : `Athlete profile | ${SITE_NAME}`,
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      {
        name: "description",
        content:
          loaderData?.kind === "published-history"
            ? `Published sporting performances for ${loaderData.athlete.display_name} on ATHRECS.`
            : "Sign in to view athlete profiles and published results on ATHRECS.",
      },
    ],
  }),
  component: AthletePage,
  notFoundComponent: () => (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Athlete not found</h1>
      <Button asChild variant="secondary">
        <Link to="/athletes">Back</Link>
      </Button>
    </div>
  ),
});

function formatDob(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function PrivateAthleteProfile({ athlete }: { athlete: { slug: string; displayName: string } }) {
  const { user, isPending } = useCurrentUserState();

  function startSignIn() {
    openAthleteAuth({
      mode: "signin",
      callbackURL: "/my-athlete-profile",
      errorCallbackURL: `/athletes/${athlete.slug}`,
    });
  }

  return (
    <div className="space-y-3">
      <Link
        to="/athletes"
        className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Athletes
      </Link>

      <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">Athlete profile</p>
        <h1 className="font-display text-2xl font-semibold text-fg">{athlete.displayName}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <LockKeyhole className="mr-1 size-3.5" aria-hidden="true" />
            Private profile
          </Badge>
        </div>
        <p className="max-w-prose text-sm leading-6 text-muted">
          This athlete profile is private. Public race results stay on the event pages. The athlete
          can sign in to view claimed results, hide performances and optionally share an unlisted
          profile link.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-7 text-center shadow-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <LockKeyhole className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-fg">
          {user ? "Open your private Athlete Profile" : "Is this you?"}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
          Ordinary athlete profiles and claimed results are not listed publicly. Sign in with the
          account that claimed these results to manage your profile.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {user ? (
            <Button asChild>
              <Link to="/my-athlete-profile">View my private profile</Link>
            </Button>
          ) : (
            <Button type="button" onClick={startSignIn} disabled={isPending}>
              <LogIn className="size-4" aria-hidden="true" />
              Sign in or create account
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link to="/claim-results" search={{ resultId: undefined }}>
              Claim my results
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function AthletePage() {
  const data = Route.useLoaderData();
  const { slug } = Route.useParams();
  if (data.kind === "published-history") return <AthleteContent />;
  return (
    <ProfileViewer
      authenticated={data.kind !== "sign-in"}
      returnTo={`/athletes/${encodeURIComponent(slug)}`}
    >
      <AthleteContent />
    </ProfileViewer>
  );
}

function AthleteContent() {
  const data = Route.useLoaderData();
  const { slug } = Route.useParams();
  if (data.kind === "sign-in")
    return <ProfileSignIn returnTo={`/athletes/${encodeURIComponent(slug)}`} />;
  if (data.kind === "shared-account") {
    return <SharedAccountProfile profile={data.profile} />;
  }
  if (data.kind === "private-athlete") {
    return <PrivateAthleteProfile athlete={data.athlete} />;
  }

  const { athlete, results, profileResults, upcoming, sourceHistories } = data;
  const historicalPerformanceCount = sourceHistories.reduce(
    (total, history) => total + history.performances.length,
    0,
  );
  const reportedHistory = getReportedRaceHistory(athlete.slug);
  const includedHistory = reportedHistory?.includeInResults ? reportedHistory : undefined;
  const performanceCount =
    results.length + (includedHistory?.records.length ?? 0) + historicalPerformanceCount;
  const aliases = athlete.aliases ?? [];
  const career = getEditorialAthleteCareer(athlete.slug);
  const profileLinks = athlete.profile_links.filter((link: { label: string; url: string }) =>
    isPublicProfileSource(link.url, link.label),
  );
  const bio = publicAthleteBio({
    name: athlete.display_name,
    sport: profileResults[0]?.sport,
    city: athlete.city,
    country: athlete.country,
    club: athlete.club,
    coach: athlete.details.coach,
  });
  const dob = formatDob(athlete.date_of_birth);

  const isPublicFigure = athlete.profile_type === "Public figure";
  const isProfessionalAthlete = athlete.profile_roles?.some(
    (role: string) => role.toLowerCase() === "professional athlete",
  );
  const locationLabel = isPublicFigure
    ? ""
    : [athlete.city, athlete.county].filter(Boolean).join(" · ");
  const locationCountry = isPublicFigure
    ? (athlete.nationality ?? athlete.country)
    : athlete.country;
  const detailRows: { label: string; value: string }[] = [];
  if (dob) detailRows.push({ label: "Date of birth", value: dob });
  if (athlete.place_of_birth)
    detailRows.push({ label: "Place of birth", value: athlete.place_of_birth });
  if (athlete.country_of_birth)
    detailRows.push({
      label: "Country of birth",
      value: athlete.country_of_birth,
    });
  if (athlete.nationality) detailRows.push({ label: "Nationality", value: athlete.nationality });
  if (athlete.address) detailRows.push({ label: "Address", value: athlete.address });
  if (athlete.notes) detailRows.push({ label: "Notes", value: athlete.notes });

  return (
    <div className="public-athlete-profile space-y-3">
      <Link
        to="/athletes"
        className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Athletes
      </Link>

      <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">
          {isProfessionalAthlete
            ? "Professional athlete profile"
            : isPublicFigure
              ? "Public figure athlete profile"
              : "Athlete profile"}
        </p>
        <h1 className="font-display text-2xl font-semibold text-fg">{athlete.display_name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <AthleteId number={athlete.athlete_number} />
          {[
            ...new Set([...profileResults.map((r) => r.sport), ...upcoming.map((r) => r.sport)]),
          ].map((sport) => (
            <Badge key={sport} variant="outline">
              {sport}
            </Badge>
          ))}
        </div>
        {athlete.club && athlete.club_slug ? (
          <p className="text-sm text-muted">
            <Link
              to="/clubs/$slug"
              params={{ slug: athlete.club_slug }}
              className="font-medium text-accent no-underline hover:underline"
            >
              {athlete.club}
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted">Unattached</p>
        )}
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-subtle">
          <MapPin className="h-3.5 w-3.5" />
          {locationLabel}
          {locationCountry ? <CountryFlag country={locationCountry} showName /> : null}
        </p>
        {!isPublicFigure ? (
          <ProfileDetails
            details={athlete.details}
            nationality={athlete.nationality ?? undefined}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          {athlete.is_claimed ? (
            <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-900">
              <BadgeCheck className="mr-1 size-3.5" aria-hidden="true" />
              Verified athlete
            </Badge>
          ) : null}
          {isProfessionalAthlete ? (
            <Badge variant="accent">Professional athlete</Badge>
          ) : isPublicFigure ? (
            <Badge variant="accent">Public figure</Badge>
          ) : null}
          <Badge variant="outline">
            {athlete.gender === "F" ? "Female" : athlete.gender === "M" ? "Male" : athlete.gender}
          </Badge>
          <Badge variant="accent">
            {performanceCount}{" "}
            {historicalPerformanceCount
              ? performanceCount === 1
                ? "performance"
                : "performances"
              : includedHistory
                ? "race and stage entries"
                : "results"}
          </Badge>
          {athlete.profile_roles
            ?.filter(
              (role: string) =>
                !isProfessionalAthlete || role.toLowerCase() !== "professional athlete",
            )
            .map((role: string) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
        </div>
        {career ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Biography</h2>
            {career.biography.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            <details className="text-xs">
              <summary className="cursor-pointer text-accent">Biography sources</summary>
              <ul className="mt-2 space-y-2">
                {career.biographySources
                  .filter((source) => isPublicProfileSource(source.url, source.label))
                  .map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline underline-offset-2"
                      >
                        {source.label} ↗
                      </a>
                    </li>
                  ))}
              </ul>
            </details>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted">{bio}</p>
        )}
        {athlete.slug === "mo-farah" && !athlete.is_claimed ? (
          <p className="text-xs text-subtle">
            Independent ATHRECS profile. Not athlete-claimed; no endorsement is implied.
          </p>
        ) : null}
        <ShareProfileButton
          path={`/athletes/${athlete.slug}`}
          title={`${athlete.display_name} athlete profile`}
          compact
        />
        {!athlete.is_claimed && athlete.athlete_number ? (
          <a
            href={`https://update.athrecs.com/admin/athletes/${formatAthleteId(athlete.athlete_number)}?invite=1`}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
          >
            Invite to claim <span className="ml-2 text-xs text-muted">Staff sign-in required</span>
          </a>
        ) : null}
        {aliases.length > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Other names raced under
            </p>
            <div className="flex flex-wrap gap-1.5">
              {aliases.map((name: string) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </section>

      <AthleteCareerHighlights slug={athlete.slug} />

      {(!career || profileResults.length > 0 || includedHistory) &&
        (!isPublicFigure ||
          profileResults.length > 0 ||
          sourceHistories.length > 0 ||
          includedHistory) && (
          <ProfileRecordHighlights
            results={profileResults}
            reportedBests={includedHistory?.personalBests}
            sourceHistories={sourceHistories}
            sourceGender={athlete.gender}
          />
        )}

      <section id="results-history" className="space-y-3">
        <CompactResults results={profileResults} reportedHistory={includedHistory} claimable />
        {sourceHistories.length ? (
          <details
            id="performance-history"
            className="rounded-lg border border-border bg-surface p-3"
            open
          >
            <summary className="cursor-pointer text-sm font-semibold">Performance history</summary>
            <div className="mt-3">
              <SourcePerformanceHistory histories={sourceHistories} />
            </div>
          </details>
        ) : null}
        <UnverifiedRaceHistory slug={athlete.slug} />
      </section>
      <details className="rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold">
          Upcoming ({upcoming.length})
        </summary>
        <div className="mt-3">
          <UpcomingTable events={upcoming} />
        </div>
      </details>
      <SuggestProfileEdit slug={athlete.slug} />
      <details className="rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold">
          More about {athlete.display_name}
        </summary>
        <div className="mt-3 space-y-3">
          <EditorialAthleteOverview slug={athlete.slug} />
          <EditorialRoadSplits slug={athlete.slug} />
          <AthleteMediaCoverage slug={athlete.slug} />
          {profileLinks.length > 0 && (
            <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-display text-lg font-semibold text-fg">
                {isProfessionalAthlete ? "Records and follow links" : "Official links"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profileLinks.map((link: { label: string; url: string }) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-medium text-accent no-underline hover:border-border-strong hover:underline"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </section>
          )}

          {athlete.notable_achievements.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold text-fg">
                Notable endurance achievements
              </h2>
              <div className="grid gap-2">
                {athlete.notable_achievements.map(
                  (achievement: {
                    year: number;
                    title: string;
                    detail: string;
                    source_url: string;
                  }) => (
                    <article
                      key={`${achievement.year}-${achievement.title}`}
                      className="rounded-xl border border-border bg-surface p-4 shadow-card"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{achievement.year}</Badge>
                        <h3 className="font-semibold text-fg">{achievement.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-muted">{achievement.detail}</p>
                    </article>
                  ),
                )}
              </div>
            </section>
          )}

          {isPublicFigure && detailRows.length > 0 && (
            <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-display text-lg font-semibold text-fg">Personal details</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                {detailRows.map((row) => (
                  <div key={row.label} className="space-y-0.5">
                    <dt className="text-xs font-medium uppercase tracking-wider text-subtle">
                      {row.label}
                    </dt>
                    <dd className="text-sm text-fg">
                      {row.label === "Nationality" || row.label === "Country of birth" ? (
                        <CountryFlag country={row.value} showName />
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </details>
    </div>
  );
}
