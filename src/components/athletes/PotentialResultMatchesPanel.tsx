import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  SearchCheck,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  listMyPotentialResultMatches,
  type PotentialResultClaimStatus,
  type PotentialResultMatch,
} from "@/lib/athrecs/result-match-api";
import {
  findExternalRunnerMatches,
  type ExternalRunnerMatch,
  type ExternalRunnerMatchSource,
} from "@/lib/athrecs/grok-runner-search-api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { IS_ATHRECS_SITE, sportIsInPublicSiteScope } from "@/lib/site-scope";

const INITIAL_MATCH_COUNT = 8;

const CLAIM_STATUS_LABELS: Record<PotentialResultClaimStatus, string> = {
  pending: "Claim pending",
  needs_info: "More information needed",
  approved: "Claim approved",
  rejected: "Previous claim not approved",
  withdrawn: "Previous claim withdrawn",
};

const SOURCE_LABELS: Record<ExternalRunnerMatchSource, string> = {
  powerof10: "Power of 10",
  parkrun: "parkrun",
  worldathletics: "World Athletics",
  official: "Official results",
  other: "Public result page",
};

function confidenceLabel(match: PotentialResultMatch | ExternalRunnerMatch): string {
  if (match.confidence === "exact") return "Exact name";
  if (match.confidence === "strong") return "Strong match";
  return "Possible match";
}

function confidenceClass(match: PotentialResultMatch | ExternalRunnerMatch): string {
  if (match.confidence === "exact") {
    return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  }
  if (match.confidence === "strong") {
    return "border-sky-500/30 bg-sky-50 text-sky-900";
  }
  return "border-amber-500/30 bg-amber-50 text-amber-950";
}

function claimStatusClass(status: PotentialResultClaimStatus): string {
  if (status === "approved") {
    return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  }
  if (status === "pending") return "border-sky-500/30 bg-sky-50 text-sky-900";
  if (status === "needs_info") {
    return "border-amber-500/30 bg-amber-50 text-amber-950";
  }
  return "border-border bg-elevated text-muted";
}

function placeText(value: number | null): string {
  return value == null ? "" : `Place ${value}`;
}

function locationText(match: PotentialResultMatch): string {
  return [match.athleteCity, match.athleteRegion, match.athleteCountry]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");
}

function actionLabel(match: PotentialResultMatch): string {
  if (match.claimStatus === "pending" || match.claimStatus === "needs_info") {
    return "View claim";
  }
  if (match.claimStatus === "rejected" || match.claimStatus === "withdrawn") {
    return "Claim again";
  }
  if (match.ownedByAnotherAccount) return "Submit ownership claim";
  return "Claim this result";
}

export function PotentialResultMatchesPanel() {
  const [expanded, setExpanded] = useState(false);
  const [searchPublic, setSearchPublic] = useState(false);
  const { user, isPending: sessionPending } = useCurrentUserState();
  const matches = useQuery({
    queryKey: ["my-potential-result-matches", user?.id],
    queryFn: () => listMyPotentialResultMatches(),
    enabled: Boolean(user),
    retry: false,
    staleTime: 60_000,
  });
  const external = useQuery({
    queryKey: ["my-external-runner-matches", user?.id],
    queryFn: () => findExternalRunnerMatches(),
    enabled: Boolean(user) && searchPublic && !IS_ATHRECS_SITE,
    retry: false,
    staleTime: 5 * 60_000,
  });

  if (sessionPending || !user) return null;

  if (matches.isLoading) {
    return (
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Loader2 className="size-5 animate-spin text-accent" aria-hidden="true" />
          Checking ATHRECS results for names connected to your account…
        </div>
      </section>
    );
  }

  if (matches.isError || !matches.data) {
    return (
      <section className="rounded-xl border border-red-500/30 bg-red-50 p-5 text-sm text-red-900">
        Potential result matches could not be loaded. Your Athlete Account and existing claims are
        unaffected.
      </section>
    );
  }

  const scopedMatches = matches.data.matches.filter((match) =>
    sportIsInPublicSiteScope(match.sport),
  );
  const data = {
    ...matches.data,
    matches: scopedMatches,
    totalMatches: scopedMatches.length,
  };
  const visibleMatches = expanded
    ? data.matches
    : data.matches.slice(0, INITIAL_MATCH_COUNT);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-elevated/50 p-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <SearchCheck className="size-5 text-accent" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-fg">
              Potential results matching your name
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            These are suggestions, not confirmed ownership. Select only your own result and ATHRECS
            will keep the existing evidence and staff-review checks before linking a profile.
          </p>
          {data.searchedNames.length ? (
            <p className="mt-2 text-xs text-subtle">
              Checked: {data.searchedNames.join(" · ")}
            </p>
          ) : null}
        </div>
        <Badge className="border-accent/30 bg-accent-soft text-accent">
          {data.totalMatches} potential match{data.totalMatches === 1 ? "" : "es"}
        </Badge>
      </div>

      {!data.searchedNames.length ? (
        <div className="flex items-start gap-3 p-5 text-sm text-muted">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <p>
            Add and save your full name in the Identity section below. ATHRECS will then compare it
            with athlete names in the results database.
          </p>
        </div>
      ) : data.matches.length === 0 ? (
        <div className="flex items-start gap-3 p-5 text-sm text-muted">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p>No conservative name matches were found yet.</p>
            <p className="mt-1 text-xs text-subtle">
              Saving a club, city or region can help ATHRECS recognise initial-based or otherwise
              ambiguous matches without lowering the ownership safeguards.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleMatches.map((match) => (
            <article key={match.resultId} className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={confidenceClass(match)}>{confidenceLabel(match)}</Badge>
                    {match.claimStatus ? (
                      <Badge className={claimStatusClass(match.claimStatus)}>
                        {CLAIM_STATUS_LABELS[match.claimStatus]}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-fg">
                    {match.eventName}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    <strong className="font-semibold text-fg">{match.athleteName}</strong>{" "}
                    · {formatRaceDateShort(match.eventDate)} · {match.distanceCode}
                  </p>
                  {match.clubName || locationText(match) ? (
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
                      {match.clubName ? <span>{match.clubName}</span> : null}
                      {locationText(match) ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {locationText(match)}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>

                <div className="min-w-28 text-right">
                  <p className="font-display text-xl font-semibold tabular-nums text-fg">
                    {match.finishTimeSeconds == null
                      ? "Time unavailable"
                      : formatDuration(match.finishTimeSeconds)}
                  </p>
                  <p className="mt-1 text-xs text-subtle">
                    {[
                      placeText(match.overallPlace),
                      match.category,
                      match.bib ? `Bib ${match.bib}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-elevated px-3 py-2 text-xs leading-5 text-muted">
                <strong className="text-fg">Why this was suggested:</strong>{" "}
                {match.reasons.join("; ")}. Matched against “{match.matchedAccountName}”.
              </div>

              {match.ownedByAnotherAccount ? (
                <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  This athlete profile is already linked to another account. You may still submit a
                  claim, but staff will require stronger evidence before changing ownership.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                {match.claimStatus === "approved" ? (
                  <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-900">
                    Linked to your private Athlete Account
                  </Badge>
                ) : (
                  <Button asChild>
                    <Link to="/claim-results" search={{ resultId: match.resultId }}>
                      <Trophy className="size-4" aria-hidden="true" /> {actionLabel(match)}
                    </Link>
                  </Button>
                )}
                <Button asChild variant="secondary">
                  <Link to="/races/$slug" params={{ slug: match.eventSlug }}>
                    View event
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {data.matches.length > INITIAL_MATCH_COUNT ? (
        <div className="border-t border-border p-4 text-center">
          <Button type="button" variant="secondary" onClick={() => setExpanded((value) => !value)}>
            {expanded ? (
              <ChevronUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4" aria-hidden="true" />
            )}
            {expanded
              ? "Show fewer matches"
              : `Show all ${data.matches.length} returned matches`}
          </Button>
          {data.truncated ? (
            <p className="mt-2 text-xs text-subtle">
              The list is capped for safety and performance. Add club or location details to improve
              ranking for a common name.
            </p>
          ) : null}
        </div>
      ) : data.truncated ? (
        <p className="border-t border-border p-4 text-center text-xs text-subtle">
          The list is capped for safety and performance. Add club or location details to improve
          ranking for a common name.
        </p>
      ) : null}

      {!IS_ATHRECS_SITE ? (
        <div className="border-t border-border bg-elevated/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <Globe className="size-5 text-accent" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-fg">
                Public result sites
              </h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Optional second pass. Grok can search Power of 10, parkrun, World Athletics and
              official result pages using the identity fields you saved. These remain suggestions,
              not confirmed ownership.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={external.isFetching}
            onClick={() => setSearchPublic(true)}
          >
            {external.isFetching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <SearchCheck className="size-4" aria-hidden="true" />
            )}
            Search Power of 10 and parkrun
          </Button>
        </div>

        {!searchPublic ? (
          <p className="mt-3 text-xs text-subtle">
            Save your name first. Turn on Performance and habit insights if you want ATHRECS to ask
            Grok to look outside the ATHRECS database.
          </p>
        ) : external.isFetching ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin text-accent" aria-hidden="true" />
            Searching public result pages…
          </p>
        ) : external.isError ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-900">
            Public result search could not run. ATHRECS name matches are unaffected.
          </p>
        ) : external.data ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted">{external.data.message}</p>
            {external.data.cached ? (
              <p className="text-xs text-subtle">Showing a cached search from the last 7 days.</p>
            ) : null}
            {external.data.matches.length ? (
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                {external.data.matches.map((match) => (
                  <article key={`${match.sourceUrl}-${match.eventName}`} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-border bg-elevated text-fg">
                        {SOURCE_LABELS[match.source]}
                      </Badge>
                      <Badge className={confidenceClass(match)}>{confidenceLabel(match)}</Badge>
                    </div>
                    <div>
                      <h4 className="font-display text-base font-semibold text-fg">
                        {match.eventName || "Public result page"}
                      </h4>
                      <p className="mt-1 text-sm text-muted">
                        <strong className="font-semibold text-fg">{match.athleteName}</strong>
                        {match.eventDate ? ` · ${match.eventDate}` : ""}
                        {match.distance ? ` · ${match.distance}` : ""}
                        {match.finishTime ? ` · ${match.finishTime}` : ""}
                      </p>
                      {match.club || match.location ? (
                        <p className="mt-1 text-xs text-subtle">
                          {[match.club, match.location].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-xs leading-5 text-muted">
                      <strong className="text-fg">Why this was suggested:</strong> {match.why}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {match.resultId ? (
                        <Button asChild>
                          <Link to="/claim-results" search={{ resultId: match.resultId }}>
                            <Trophy className="size-4" aria-hidden="true" /> Claim this result
                          </Link>
                        </Button>
                      ) : null}
                      {match.eventSlug ? (
                        <Button asChild variant="secondary">
                          <Link to="/races/$slug" params={{ slug: match.eventSlug }}>
                            View event
                          </Link>
                        </Button>
                      ) : null}
                      <Button asChild variant="secondary">
                        <a href={match.sourceUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" aria-hidden="true" /> Open evidence
                        </a>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        </div>
      ) : null}
    </section>
  );
}
