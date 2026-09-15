import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { ShareProfileButton } from "@/components/athletes/ShareProfileButton";
import { ProfileEventLink } from "./ProfileEventLink";
import { ProfileProgress } from "./ProfileProgress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { findPersonalBests, timingBasis } from "@/lib/athrecs/profile-records";
import { SOCIAL_LABELS } from "@/lib/athrecs/profile-connections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { sharedProfilePath } from "@/lib/athrecs/athlete-profile-share";
import type { SharedAthleteProfile } from "@/lib/athrecs/athlete-profile-share-api";

export function SharedAccountProfile({ profile }: { profile: SharedAthleteProfile }) {
  const [sport, setSport] = useState("All sports");
  const [year, setYear] = useState("All years");
  const [page, setPage] = useState(0);
  const sports = [
    ...new Set([...profile.sports, ...profile.results.map((result) => result.sport)]),
  ];
  const results = profile.results.filter(
    (result) => sport === "All sports" || result.sport === sport,
  );
  const bests = findPersonalBests(results);
  const years = [...new Set(results.map((result) => result.eventDate.slice(0, 4)))]
    .sort()
    .reverse();
  const filtered = results.filter(
    (result) => year === "All years" || result.eventDate.startsWith(year),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 30));
  const activePage = Math.min(page, pages - 1);
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
        {profile.bio ? (
          <p className="max-w-prose whitespace-pre-line text-sm text-muted">{profile.bio}</p>
        ) : null}
        {profile.connections.length ? (
          <div className="flex flex-wrap gap-3">
            {profile.connections.map((connection) => (
              <a
                key={connection.platform}
                href={connection.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-accent"
              >
                {SOCIAL_LABELS[connection.platform]}
                <ExternalLink className="size-4" />
              </a>
            ))}
          </div>
        ) : null}
        <ShareProfileButton
          path={sharedProfilePath(profile.slug)}
          title={`${profile.displayName} athlete profile`}
        />
        <p className="border-t border-border pt-3 text-xs text-subtle">
          This unlisted page is published by the athlete. Email, date of birth, postcode and
          photograph stay private.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="shared-profile-sport" className="text-sm font-semibold">
          Sport
        </label>
        <select
          id="shared-profile-sport"
          value={sport}
          onChange={(event) => {
            setSport(event.target.value);
            setYear("All years");
            setPage(0);
          }}
          className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
        >
          <option>All sports</option>
          {sports.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <Tabs defaultValue="results" className="space-y-5">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="results">Results history</TabsTrigger>
          <TabsTrigger value="bests">Personal bests</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="results" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">Results history</h2>
            <select
              aria-label="Results year"
              value={year}
              onChange={(event) => {
                setYear(event.target.value);
                setPage(0);
              }}
              className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
            >
              <option>All years</option>
              {years.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          {!filtered.length ? (
            <p className="rounded-xl bg-elevated p-5 text-sm text-muted">
              No shared results in this selection.
            </p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {filtered.slice(activePage * 30, (activePage + 1) * 30).map((result) => (
                <article key={result.resultId} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <ProfileEventLink result={result} className="font-semibold text-fg">
                        {result.eventName}
                      </ProfileEventLink>
                      <p className="mt-1 text-sm text-muted">
                        {formatRaceDateShort(result.eventDate)} · {result.distanceCode} ·{" "}
                        {result.surface}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatDuration(result.finishTimeSeconds)}
                      </p>
                      <p className="text-xs text-muted">
                        {timingBasis(result)}
                        {result.overallPlace != null ? ` · Place ${result.overallPlace}` : ""}
                      </p>
                    </div>
                  </div>
                  {result.conflicting ? (
                    <p className="mt-2 text-sm text-amber-800">
                      Sources differ; excluded from personal bests.
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-3">
                    {result.sourceUrls.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-accent"
                      >
                        Source{result.sourceUrls.length > 1 ? ` ${index + 1}` : ""}
                        <ExternalLink className="size-3.5" />
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
          {pages > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <Button
                variant="secondary"
                disabled={activePage === 0}
                onClick={() => setPage(activePage - 1)}
              >
                Previous
              </Button>
              <span>
                {activePage + 1} / {pages}
              </span>
              <Button
                variant="secondary"
                disabled={activePage + 1 >= pages}
                onClick={() => setPage(activePage + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="bests" className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Personal bests</h2>
          <p className="text-sm text-muted">
            One best time per sport, distance and surface. Chip, gun and recorded times are
            included, with the timing type shown for each result.
          </p>
          {bests.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bests.map((result) => (
                <article
                  key={result.resultId}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <p className="text-sm font-semibold text-accent">
                    {result.sport} · {result.distanceCode}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                    {formatDuration(result.finishTimeSeconds)}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {result.surface} · {timingBasis(result)}
                  </p>
                  <p className="mt-3 text-sm">{result.eventName}</p>
                  <p className="mt-1 text-xs text-muted">{formatRaceDateShort(result.eventDate)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-elevated p-5 text-sm text-muted">
              No eligible timed performances have been shared yet.
            </p>
          )}
        </TabsContent>
        <TabsContent value="progress">
          <ProfileProgress results={results} />
        </TabsContent>
      </Tabs>

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
