import {
  EditorialAthleteOverview,
  EditorialRoadSplits,
} from "@/components/athletes/EditorialAthleteOverview";
import { UnverifiedRaceHistory } from "@/components/athletes/UnverifiedRaceHistory";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AthleteId } from "@/components/athletes/AthleteId";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { ProfileDetails } from "@/components/athletes/ProfileDetails";
import { ProfileRecordHighlights } from "@/components/athletes/ProfileAchievements";
import { CompactResults } from "@/components/athletes/CompactResultsTable";
import { SourcePerformanceHistory } from "@/components/athletes/SourcePerformanceHistory";
import { getStaffAthleteProfile } from "@/lib/athrecs/staff-athlete-directory-api";
import { publicProfileDetails } from "@/lib/athrecs/profile-details";

export const Route = createFileRoute("/admin/athletes/$athleteId")({
  head: () => ({
    meta: [
      { title: "Athlete profile — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: StaffAthleteProfile,
});

function StaffAthleteProfile() {
  const { athleteId } = Route.useParams();
  const query = useQuery({
    queryKey: ["staff-athlete-profile", athleteId],
    queryFn: () => getStaffAthleteProfile({ data: { athleteId } }),
    retry: false,
  });
  const profile = query.data;
  return (
    <div className="space-y-5">
      <Link to="/admin/athlete-directory" className="text-sm text-accent hover:underline">
        ← Athlete directory
      </Link>
      {query.isPending ? (
        <p role="status">Loading athlete profile…</p>
      ) : query.isError ? (
        <p role="alert">
          The profile could not load.{" "}
          <button className="text-accent hover:underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      ) : !profile ? (
        <h1 className="text-xl font-semibold">Athlete not found</h1>
      ) : (
        <>
          <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Athlete profile · Staff view
            </p>
            <h1 className="font-display text-3xl font-semibold">{profile.athlete.name}</h1>
            <AthleteId number={profile.athlete.athleteNumber} />
            {profile.athlete.club ? <p className="text-sm">{profile.athlete.club}</p> : null}
            <p className="flex items-center gap-2 text-sm text-muted">
              {profile.athlete.city}
              <CountryFlag country={profile.athlete.country} showName />
            </p>
            <p className="text-sm text-muted">
              {profile.athlete.sports.join(" · ")} · {profile.athlete.resultCount} stored results
            </p>
            <p className="text-xs text-muted">
              Profile visibility: {profile.athlete.visibility}. This view is available only to
              authorised staff.
            </p>
            <ProfileDetails
              details={publicProfileDetails(profile.athlete.details, profile.athlete.birthday)}
              nationality={profile.athlete.nationality}
              coaches={profile.athlete.coaches}
            />
            {profile.athlete.profilePath ? (
              <a
                href={`https://www.athrecs.com${profile.athlete.profilePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-accent hover:underline"
              >
                View public profile ↗
              </a>
            ) : null}
          </section>
          {profile.bioNotes.length ? (
            <details className="rounded-xl border border-border bg-surface p-4">
              <summary className="cursor-pointer font-semibold">
                Biography and research notes
              </summary>
              {profile.bioNotes.map((note, index) => (
                <div key={index} className="mt-3 text-sm">
                  <h2 className="font-semibold">{note.label}</h2>
                  <p className="whitespace-pre-wrap">{note.bio}</p>
                </div>
              ))}
            </details>
          ) : null}
          <ProfileRecordHighlights results={profile.results} showEvidence />
          {profile.athlete.sources.map((source) => (
            <div key={`editorial-${source.slug}`} className="space-y-3">
              <EditorialAthleteOverview slug={source.slug} showEvidence />
              <EditorialRoadSplits slug={source.slug} showEvidence />
            </div>
          ))}
          <CompactResults showEvidence key={athleteId} results={profile.results} />
          {profile.athlete.sources.map((source) => (
            <UnverifiedRaceHistory key={source.slug} slug={source.slug} showEvidence />
          ))}
          <SourcePerformanceHistory
            showEvidence
            key={`source-${athleteId}`}
            histories={profile.sourceHistories}
          />
        </>
      )}
    </div>
  );
}
