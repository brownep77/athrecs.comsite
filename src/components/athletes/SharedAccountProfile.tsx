import { CountryFlag } from "./CountryFlag";
import { ProfileRecordHighlights } from "./ProfileAchievements";
import { CompactResults } from "./CompactResultsTable";
import { UpcomingTable } from "./UpcomingEvents";
import { ProfileDetails } from "./ProfileDetails";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ShareProfileButton } from "./ShareProfileButton";
import { ProfileProgress } from "./ProfileProgress";
import { SOCIAL_LABELS } from "@/lib/athrecs/profile-connections";
import { Badge } from "@/components/ui/badge";
import { sharedProfilePath } from "@/lib/athrecs/athlete-profile-share";
import type { SharedAthleteProfile } from "@/lib/athrecs/athlete-profile-share-api";
import { AthleteId } from "./AthleteId";
import { SuggestProfileEdit } from "./SuggestProfileEdit";
import { publicAthleteBio } from "@/lib/athrecs/public-athlete-bio";

export function SharedAccountProfile({ profile }: { profile: SharedAthleteProfile }) {
  const sports = [...new Set([...profile.sports, ...profile.results.map((r) => r.sport)])];
  const bio = profile.bio
    ? publicAthleteBio({
        name: profile.displayName,
        sport: profile.primarySport,
        city: profile.city,
        country: profile.country,
        club: profile.club,
        coach: profile.details.coach,
      })
    : "";
  return (
    <div className="public-athlete-profile space-y-3">
      <Link to="/athletes" className="inline-flex items-center gap-1.5 py-2 text-sm text-muted">
        <ArrowLeft className="size-4" />
        Athletes
      </Link>
      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">{profile.displayName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
              <AthleteId number={profile.athleteNumber} />
              {profile.club}
              <span className="inline-flex flex-wrap items-center gap-2">
                {profile.city}
                {profile.country ? <CountryFlag country={profile.country} showName /> : null}
              </span>
            </div>
          </div>
          <ShareProfileButton
            path={sharedProfilePath(profile.slug)}
            title={`${profile.displayName} athlete profile`}
            compact
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Shared by athlete</Badge>
          {sports.map((sport) => (
            <Badge key={sport} variant="outline">
              {sport}
            </Badge>
          ))}
          <Badge variant="outline">{profile.results.length} results</Badge>
        </div>
        {bio ? <p className="text-sm leading-relaxed text-muted">{bio}</p> : null}
        <ProfileDetails
          details={profile.details}
          nationality={profile.nationality}
          coaches={profile.coaches}
        />
        {profile.connections.length ? (
          <div className="flex flex-wrap gap-3">
            {profile.connections.map((connection) => (
              <a
                key={connection.platform}
                href={connection.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent underline"
              >
                {SOCIAL_LABELS[connection.platform]} ↗
              </a>
            ))}
          </div>
        ) : null}
      </section>
      <ProfileRecordHighlights results={profile.results} />
      <CompactResults results={profile.results} />
      <details className="rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold">
          Upcoming ({profile.upcoming.length})
        </summary>
        <div className="mt-3">
          <UpcomingTable events={profile.upcoming} />
        </div>
      </details>
      <details className="rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold">Progress</summary>
        <div className="mt-3">
          <ProfileProgress results={profile.results} />
        </div>
      </details>
      <SuggestProfileEdit slug={profile.slug} />
    </div>
  );
}
