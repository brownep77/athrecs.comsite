import { Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { ShareProfileButton } from "@/components/athletes/ShareProfileButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { sharedProfilePath } from "@/lib/athrecs/athlete-profile-share";
import type { SharedAthleteProfile } from "@/lib/athrecs/athlete-profile-share-api";

export function SharedAccountProfile({ profile }: { profile: SharedAthleteProfile }) {
  const locationLabel = [profile.city, profile.region, profile.country].filter(Boolean).join(" · ");

  return (
    <div className="space-y-8">
      <Link
        to="/athletes"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Athletes
      </Link>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">
          Shared athlete profile
        </p>
        <h1 className="font-display text-2xl font-semibold text-fg">{profile.displayName}</h1>
        {profile.club ? <p className="text-sm text-muted">{profile.club}</p> : null}
        {locationLabel ? (
          <p className="flex items-center gap-1.5 text-xs text-subtle">
            <MapPin className="h-3.5 w-3.5" />
            {locationLabel}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Shared by athlete</Badge>
          {profile.primarySport ? <Badge variant="outline">{profile.primarySport}</Badge> : null}
          <Badge variant="outline">{profile.results.length} results</Badge>
        </div>
        {profile.bio ? <p className="max-w-prose whitespace-pre-line text-sm text-muted">{profile.bio}</p> : null}
        <ShareProfileButton
          path={sharedProfilePath(profile.slug)}
          title={`${profile.displayName} athlete profile`}
        />
        <p className="border-t border-border pt-3 text-xs text-subtle">
          This unlisted page is published by the athlete. Email, date of birth, postcode and
          photograph stay private.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">Results history</h2>
        <p className="text-xs text-subtle">
          Claimed finish times only — no composite ratings. Confirm on the official timer site.
        </p>
        {profile.results.length === 0 ? (
          <p className="text-sm text-muted">No shared results yet.</p>
        ) : (
          <div className="grid gap-2">
            {profile.results.map((result) => (
              <div
                key={result.resultId}
                className="rounded-xl border border-border bg-surface px-3.5 py-3 shadow-card hover:border-border-strong"
              >
                <Link
                  to="/races/$slug"
                  params={{ slug: result.eventSlug }}
                  className="flex flex-col gap-1 no-underline sm:flex-row sm:justify-between"
                >
                  <div>
                    <div className="mb-1 flex flex-wrap gap-1.5">
                      <Badge variant="outline">{result.distanceCode}</Badge>
                      {result.category ? <Badge variant="outline">{result.category}</Badge> : null}
                      {result.overallPlace != null ? (
                        <Badge variant="outline">Place {result.overallPlace}</Badge>
                      ) : null}
                    </div>
                    <p className="font-medium text-fg">{result.eventName}</p>
                    <p className="text-xs text-muted">{formatRaceDateShort(result.eventDate)}</p>
                  </div>
                  <p className="font-semibold tabular text-fg">
                    {formatDuration(result.finishTimeSeconds)}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <div>
        <Button asChild variant="secondary">
          <Link to="/claim-results" search={{ resultId: undefined }}>
            Claim my results
          </Link>
        </Button>
      </div>
    </div>
  );
}
