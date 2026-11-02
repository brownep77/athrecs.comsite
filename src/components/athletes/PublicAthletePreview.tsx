import { ChannelNativeRecord, ChannelFlags } from "../swimming/ChannelArchive";
import { isParkrunResult, PARKRUN_TIMING_LABEL } from "@/lib/athrecs/parkrun-timing";
import { SportBadge } from "@/components/races/EventBadges";
import { Link } from "@tanstack/react-router";
import { AthleteProfileStatuses } from "./AthleteProfileStatuses";
import type { PublicAthletePreview as Preview } from "@/lib/athrecs/public-athlete-preview";
import { CompactResultsTable } from "./CompactResultsTable";
import { PublicResultLicenceCredits } from "./PublicResultLicenceCredits";
import { ProfileSignIn } from "./ProfileSignIn";
import { AthleteId } from "./AthleteId";
import { CountryFlag } from "./CountryFlag";
import { ProfileDetails } from "./ProfileDetails";
import { Badge } from "@/components/ui/badge";
import { ShareProfileButton } from "./ShareProfileButton";
import { publicAthleteNarrative } from "@/lib/athrecs/public-athlete-narrative";
import { AthleteBiography } from "./AthleteBiography";
import { AchievementSummary } from "./AchievementSummary";
import { AchievementVerification } from "./AchievementVerification";
import { AnzChampionshipMedals } from "./AnzChampionshipMedals";
import { buildProfileAchievementSummary } from "@/lib/athrecs/profile-achievement-summary";
import {
  publicAthleteResultPath,
  PUBLIC_PROFILE_RESULT_LIMIT,
} from "@/lib/athrecs/public-athlete-result-pages";

const NO_PERSONAL_BESTS = new Set<number>();

export function PublicAthletePreview({ profile }: { profile: Preview }) {
  const visibleCount = profile.entries.length + profile.reportedRecords.length;
  const biography = publicAthleteNarrative(profile);
  const page = profile.resultPage ?? 1;
  const pages = profile.resultPages ?? 1;
  const firstResult = (page - 1) * PUBLIC_PROFILE_RESULT_LIMIT + 1;
  return (
    <div className="public-athlete-profile space-y-6" data-profile-access="preview">
      <Link to="/athletes" className="inline-flex min-h-11 items-center text-sm text-accent">
        ← Athletes
      </Link>
      <section
        id="profile-overview"
        className="space-y-4 rounded-xl border border-border bg-surface p-5 sm:p-6"
      >
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{profile.displayName}</h1>
        <AthleteProfileStatuses roles={profile.profileStatuses} />
        <div className="flex flex-wrap items-center gap-3">
          <AthleteId number={profile.athleteNumber} />
          {profile.club ? (
            profile.clubSlug ? (
              <Link
                to="/clubs/$slug"
                params={{ slug: profile.clubSlug }}
                className="text-sm text-accent hover:underline"
              >
                {profile.club}
              </Link>
            ) : (
              <span className="text-sm text-muted">{profile.club}</span>
            )
          ) : null}
          {profile.channelArchive ? (
            <span className="inline-flex items-center gap-2">
              <ChannelFlags flags={profile.channelArchive.flags} />
              {profile.nationality}
            </span>
          ) : profile.nationality ? (
            <CountryFlag country={profile.nationality} showName />
          ) : null}
          <span className="text-xs text-muted">
            {profile.sports.length > 1 ? "Sports:" : "Sport:"}
          </span>
          {profile.sports.map((sport) => (
            <SportBadge key={sport} sport={sport} />
          ))}
        </div>
        {profile.details ? (
          <ProfileDetails
            details={profile.details}
            nationality={profile.nationality ?? undefined}
          />
        ) : null}
        <AthleteBiography
          slug={profile.slug}
          paragraphs={biography}
          presentation={profile.biographyPresentation}
        />
        <ShareProfileButton
          path={`/athletes/${encodeURIComponent(profile.slug)}`}
          title={profile.displayName}
          compact
        />
      </section>
      {profile.channelArchive ? <ChannelNativeRecord record={profile.channelArchive} /> : null}
      <div id="profile-achievements" className="scroll-mt-24">
        <AchievementSummary summary={profile.achievements ?? buildProfileAchievementSummary([])} />
      </div>
      {profile.championshipMedals?.length ? (
        <AnzChampionshipMedals medals={profile.championshipMedals} />
      ) : null}
      {profile.personalBests?.length ? (
        <section aria-label="PBs" className="space-y-3">
          <h2 className="font-display text-lg font-semibold">PBs & best performances</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {profile.personalBests.map((best) => (
              <div
                key={best.id}
                className="space-y-1 rounded-lg border border-border bg-surface p-3"
              >
                <p className="text-xs text-muted">
                  {best.sport} · {best.distance} · {best.surface}
                </p>
                <strong className="text-lg tabular-nums">{best.mark}</strong>
                <p className="text-xs font-semibold text-accent">{best.label}</p>
                <AchievementVerification verified={best.verified} />
                {isParkrunResult(best) ? (
                  <p className="text-xs text-muted">{PARKRUN_TIMING_LABEL}</p>
                ) : null}
                <p className="text-xs text-muted">
                  {best.event} · {best.date}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {profile.careerSummary ? (
        <section
          id="career-summary"
          className="space-y-3 rounded-xl border border-border bg-surface p-5 sm:p-6"
        >
          <h2 className="font-display text-lg font-semibold">Career highlights</h2>
          <p className="text-sm leading-relaxed text-muted">{profile.careerSummary.text}</p>
          <p className="text-xs text-muted">
            Selected events from this athlete’s recorded career. Verification is shown for each
            record.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.careerSummary.events.map((event) => (
              <li key={event.name} className="space-y-1 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">
                  {event.eventSlug ? (
                    <Link
                      to="/races/$slug"
                      params={{ slug: event.eventSlug }}
                      className="text-accent hover:underline"
                    >
                      {event.name}
                    </Link>
                  ) : (
                    event.name
                  )}
                </p>
                <p className="text-xs text-muted">
                  {event.year}
                  {event.discipline ? ` · ${event.discipline}` : ""}
                </p>
                {event.performance ? (
                  <p className="mt-1 text-sm">
                    <span className="text-muted">Performance: </span>
                    <strong className="tabular-nums">{event.performance}</strong>
                  </p>
                ) : null}
                {event.qualifications?.length ? (
                  <p className="text-xs text-muted">{event.qualifications.join(" · ")}</p>
                ) : null}
                <Badge variant="outline">{event.verification}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section
        id="results-history"
        className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5"
      >
        <h2 className="font-display text-lg font-semibold">
          {page > 1 ? "Earlier results" : "Latest results"}
        </h2>
        {visibleCount ? (
          <>
            <p className="text-sm text-muted">
              Showing{" "}
              {pages > 1 ? `${firstResult}–${firstResult + visibleCount - 1}` : visibleCount} of{" "}
              {profile.totalResults} recorded performances.
            </p>
            <CompactResultsTable
              results={[]}
              entries={profile.entries}
              hasHistory
              reportedRecords={profile.reportedRecords}
              personalBestIds={NO_PERSONAL_BESTS}
            />
          </>
        ) : (
          <p className="text-sm text-muted">
            {profile.channelArchive
              ? "Selected swimming performances appear in the English Channel record above."
              : "No published results yet."}
          </p>
        )}
        {pages > 1 ? (
          <nav
            aria-label="Athlete result pages"
            className="flex flex-wrap items-center gap-4 text-sm"
          >
            {page > 1 ? (
              <>
                <a
                  href={publicAthleteResultPath(profile.slug)}
                  className="inline-flex min-h-11 items-center text-accent hover:underline"
                >
                  Latest results
                </a>
                {page > 2 ? (
                  <a
                    rel="prev"
                    href={publicAthleteResultPath(profile.slug, page - 1)}
                    className="inline-flex min-h-11 items-center text-accent hover:underline"
                  >
                    Newer results
                  </a>
                ) : null}
              </>
            ) : null}
            <span className="text-muted">
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <a
                rel="next"
                href={publicAthleteResultPath(profile.slug, page + 1)}
                className="inline-flex min-h-11 items-center text-accent hover:underline"
              >
                Older results
              </a>
            ) : null}
          </nav>
        ) : null}
        <PublicResultLicenceCredits credits={profile.publicLicenceCredits} />
      </section>
      <ProfileSignIn returnTo={`/athletes/${encodeURIComponent(profile.slug)}`} preview />
    </div>
  );
}
