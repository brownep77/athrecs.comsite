import { Link } from "@tanstack/react-router";
import type { PublicAthletePreview as Preview } from "@/lib/athrecs/public-athlete-preview";
import { CompactResultsTable } from "./CompactResultsTable";
import { ProfileSignIn } from "./ProfileSignIn";
import { AthleteId } from "./AthleteId";
import { CountryFlag } from "./CountryFlag";
import { Badge } from "@/components/ui/badge";
import { ShareProfileButton } from "./ShareProfileButton";

const NO_PERSONAL_BESTS = new Set<number>();

export function PublicAthletePreview({ profile }: { profile: Preview }) {
  const visibleCount = profile.entries.length + profile.reportedRecords.length;
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
        {profile.biography.length ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Biography</h2>
            {profile.biography.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
        <ShareProfileButton
          path={`/athletes/${encodeURIComponent(profile.slug)}`}
          title={profile.displayName}
          compact
        />
      </section>
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
        <h2 className="font-display text-lg font-semibold">Latest results</h2>
        {visibleCount ? (
          <>
            <p className="text-sm text-muted">
              Showing {visibleCount} of {profile.totalResults} recorded performances.
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
      </section>
      <ProfileSignIn returnTo={`/athletes/${encodeURIComponent(profile.slug)}`} preview />
    </div>
  );
}
