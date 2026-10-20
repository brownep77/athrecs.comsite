import { Link } from "@tanstack/react-router";
import type { PublicAthletePreview as Preview } from "@/lib/athrecs/public-athlete-preview";
import { CompactResultsTable } from "./CompactResultsTable";
import { ProfileSignIn } from "./ProfileSignIn";
import { AthleteId } from "./AthleteId";
import { CountryFlag } from "./CountryFlag";
import { Badge } from "@/components/ui/badge";
import { ShareProfileButton } from "./ShareProfileButton";
import { publicAthleteNarrative } from "@/lib/athrecs/public-athlete-narrative";
import { AthleteBusinessLink } from "./AthleteBusinessLink";
import { AchievementSummary } from "./AchievementSummary";
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
          {profile.nationality ? <CountryFlag country={profile.nationality} showName /> : null}
          <span className="text-xs text-muted">
            {profile.sports.length > 1 ? "Sports:" : "Sport:"}
          </span>
          {profile.sports.map((sport) => (
            <Badge key={sport} variant="outline">
              {sport}
            </Badge>
          ))}
        </div>
        {biography.length ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Biography</h2>
            {biography.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            <AthleteBusinessLink slug={profile.slug} />
          </div>
        ) : null}
        <ShareProfileButton
          path={`/athletes/${encodeURIComponent(profile.slug)}`}
          title={profile.displayName}
          compact
        />
      </section>
      <div id="profile-achievements" className="scroll-mt-24">
        <AchievementSummary summary={profile.achievements ?? buildProfileAchievementSummary([])} />
      </div>
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
          <p className="text-sm text-muted">No published results yet.</p>
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
      </section>
      <ProfileSignIn returnTo={`/athletes/${encodeURIComponent(profile.slug)}`} preview />
    </div>
  );
}
