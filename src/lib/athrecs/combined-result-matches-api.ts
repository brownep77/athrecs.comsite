import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { memberArchiveMatches, type MemberArchiveMatch } from "../results-archive/member.server";
import { listMyPotentialResultMatches, type PotentialResultMatch } from "./result-match-api";
import {
  resultSearchSchema,
  distanceSearchAliases,
  type ResultSearchFilters,
} from "./result-matching-settings";
import { resultIdentityEvidence, scorePotentialResultNameMatch } from "./result-match";
import { sourceHistorySport } from "./source-history-sport";
import {
  candidateMark,
  groupResultCandidates,
  type ResultCandidateIdentity,
} from "./result-candidate-groups";

export type CombinedResultMatch =
  | { kind: "profile"; key: string; match: PotentialResultMatch }
  | { kind: "archive"; key: string; match: MemberArchiveMatch };

type Candidate = { row: CombinedResultMatch; identity: ResultCandidateIdentity };
type HistoryRow = {
  athlete_id: number;
  key: string;
  provider: string;
  performance: Record<string, unknown>;
};
const MAX_HISTORY_ROWS = 10000;
const str = (value: unknown): string => (typeof value === "string" ? value : "");
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
const round = (labels: unknown) =>
  strings(labels)
    .filter((label) => /^(?:round|heat|stage|leg):/i.test(label))
    .map((label) => label.trim().toLowerCase())
    .sort()
    .join("|");
const qualification = (value: Record<string, unknown>) =>
  JSON.stringify([value.disqualification ?? null, value.wind || ""]);
const numeric = (value: unknown): number | null =>
  value != null && /^\d+$/.test(String(value)) ? Number(value) : null;
const timingText = (value: Record<string, unknown>) =>
  str((value.timing as Record<string, unknown> | undefined)?.finishText);
const hasFilter = (date: string, distance: string, filters: ResultSearchFilters) =>
  (!filters.year || date.slice(0, 4) === filters.year) &&
  (!filters.distance ||
    distanceSearchAliases(filters.distance).includes(
      distance.toLowerCase().replace(/[^a-z0-9.]/g, ""),
    ));

export const listMyCombinedResultMatches = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input?: Partial<ResultSearchFilters>) => resultSearchSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    // Discover authorised profile anchors without narrowing away their older histories.
    // The established matcher owns saved-name/source-ID, dismissal and ownership checks.
    const primary = await listMyPotentialResultMatches({
      data: { ...data, year: "", distance: "" },
    });
    const sql = await getSql();
    const anchors = new Map<number, PotentialResultMatch>();
    for (const match of primary.matches)
      if (!anchors.has(match.athleteId)) anchors.set(match.athleteId, match);
    const ids = [...anchors.keys()];
    const [histories, archive, metadata, identities] = await Promise.all([
      ids.length
        ? sql<HistoryRow>`
        select h.athlete_id, 'h:'||md5(h.provider||':'||h.external_id)||':'||md5(p::text) as key,
          h.provider,p as performance
        from athlete_source_histories h cross join lateral jsonb_array_elements(h.performances)p
        where h.athlete_id=any(${ids}::int[]) and h.published_at is not null
          and coalesce(p->>'profileExcluded','false')<>'true'
          and not exists(select 1 from source_history_claim_results s where s.athlete_id=h.athlete_id
            and s.provider=h.provider and s.external_id=h.external_id and s.source_key=p#>>'{archiveReference,sourceRow}')
        order by h.athlete_id,coalesce(p->>'date',p->>'year') desc,h.provider,h.external_id,p::text
        limit ${MAX_HISTORY_ROWS + 1}`
        : Promise.resolve([]),
      memberArchiveMatches(sql, context.userId, data),
      primary.matches.length
        ? sql<{ id: number; source_url: string | null; result_details: Record<string, unknown> }>`
        select id,source_url,result_details from athlete_claimable_results
        where id=any(${primary.matches.map((m) => m.resultId)}::int[]) and available`
        : Promise.resolve([]),
      sql<{
        city: string | null;
        region: string | null;
        country: string | null;
        club: string | null;
        dob: string | null;
        nationality: string | null;
      }>`
        select city,region,country,club_or_team as club,date_of_birth::text as dob,nationality
        from athlete_private_profiles where user_id=${context.userId}`,
    ]);
    // Evidence is used only on the server for comparison, never returned to members.
    const archiveEvidence = archive.length
      ? await sql<{ id: number; source_url: string; event_slug: string }>`
      select a.id,d.source_url,e.slug as event_slug from result_archive_entries a
      join result_archive_datasets d on d.id=a.dataset_id join editions ed on ed.id=d.edition_id
      join events e on e.id=ed.event_id
      where a.id=any(${archive.map((row) => row.id)}::bigint[])
        and a.canonical_result_id is null and a.review_state='unmatched'`
      : [];
    const archiveMeta = new Map(archiveEvidence.map((row) => [row.id, row]));
    const account = identities[0];
    const accountContext = {
      city: account?.city,
      region: account?.region,
      country: account?.country,
      clubOrTeam: account?.club,
      dateOfBirth: account?.dob,
      nationality: account?.nationality,
    };
    const meta = new Map(metadata.map((row) => [row.id, row]));
    const candidates: Candidate[] = [];
    for (const match of primary.matches) {
      if (!hasFilter(match.eventDate, match.distanceCode, data)) continue;
      const evidence = meta.get(match.resultId);
      if (!evidence) continue; // Eligibility may have changed since anchor discovery.
      const detail = evidence.result_details ?? {};
      const performance = timingText(detail) || str(detail.performance);
      if (!candidateMark(performance, match.finishTimeSeconds)) continue;
      candidates.push({
        row: {
          kind: "profile",
          key: `r:${match.resultId}`,
          match: { ...match, performanceText: performance || undefined },
        },
        identity: {
          athleteId: match.athleteId,
          name: match.athleteName,
          date: match.eventDate,
          event: match.eventName,
          eventSlug: match.eventSlug,
          distance: match.distanceCode,
          performance,
          seconds: match.finishTimeSeconds,
          bib: match.bib,
          round: round(detail.labels),
          qualification: qualification(detail),
          sources: evidence.source_url ? [evidence.source_url] : [],
        },
      });
    }
    for (const history of histories.slice(0, MAX_HISTORY_ROWS)) {
      const anchor = anchors.get(history.athlete_id);
      if (!anchor || !meta.has(anchor.resultId)) continue;
      const p = history.performance;
      const performance = str(p.performance),
        date = str(p.date) || str(p.dateLabel) || String(p.year ?? "");
      const distance = str(p.discipline),
        event = str(p.meeting);
      if (
        !candidateMark(performance) ||
        p.disqualification ||
        strings(p.labels).some((label) => /^(?:split|intermediate)(?:\b|:)/i.test(label)) ||
        !hasFilter(date, distance, data)
      )
        continue;
      const labels = strings(p.labels);
      const clubName =
        labels
          .find((label) => /^Club(?: at race)?: /i.test(label))
          ?.replace(/^Club(?: at race)?: /i, "") ?? "";
      const candidateContext = {
        city: anchor.athleteCity,
        region: anchor.athleteRegion,
        country: anchor.athleteCountry,
        clubName,
        eventDate: date,
        category: str(p.ageGroup),
      };
      const nameMatch = scorePotentialResultNameMatch(
        primary.searchedNames,
        anchor.athleteName,
        accountContext,
        candidateContext,
      );
      const sourceIdentifierMatch = anchor.reasons.includes(
        "Matches a source athlete identifier saved in your account",
      );
      if (!nameMatch && (data.name || !sourceIdentifierMatch)) continue;
      const identity = resultIdentityEvidence(accountContext, candidateContext);
      const match: PotentialResultMatch = {
        ...anchor,
        eventName: event,
        eventSlug: str(p.eventSlug),
        eventDate: date,
        distanceCode: distance,
        sport: sourceHistorySport(distance, history.provider, event) ?? "Unclassified",
        finishTimeSeconds: null,
        performanceText: performance,
        overallPlace: numeric(p.place),
        bib: p.bib == null ? null : String(p.bib),
        category: str(p.ageGroup) || null,
        ageAtRace: null,
        clubName,
        confidence: nameMatch?.confidence ?? (identity.conflict ? "possible" : "strong"),
        score: nameMatch?.score ?? 100 + identity.boost,
        reasons: nameMatch?.reasons ?? [
          "Matches a source athlete identifier saved in your account",
          ...identity.reasons,
        ],
      };
      candidates.push({
        row: { kind: "profile", key: `${anchor.athleteId}:${history.key}`, match },
        identity: {
          athleteId: anchor.athleteId,
          name: anchor.athleteName,
          date,
          event,
          eventSlug: str(p.eventSlug),
          distance,
          performance,
          bib: match.bib,
          round: round(labels),
          qualification: qualification(p),
          sources: strings(p.sourceUrls),
        },
      });
    }
    for (const match of archive) {
      const evidence = archiveMeta.get(match.id);
      if (!evidence) continue;
      if (!candidateMark("", match.seconds) || match.status.toLowerCase() !== "finished") continue;
      candidates.push({
        row: { kind: "archive", key: `a:${match.id}`, match },
        identity: {
          name: match.name,
          date: match.date,
          distance: match.distance,
          event: match.event,
          eventSlug: evidence.event_slug,
          performance: "",
          seconds: match.seconds,
          bib: match.bib,
          qualification: qualification({}),
          sources: [evidence.source_url],
        },
      });
    }
    const groups = groupResultCandidates(candidates, (candidate) => candidate.identity);
    const rows = groups
      .map((group) => {
        const row = group[0].row;
        if (row.kind === "profile") {
          const alternatePerformances = [
            ...new Set(
              group
                .slice(1)
                .map((item) => item.identity.performance)
                .filter(
                  (mark) =>
                    mark &&
                    candidateMark(mark) !==
                      candidateMark(row.match.performanceText ?? "", row.match.finishTimeSeconds),
                ),
            ),
          ];
          return { ...row, match: { ...row.match, alternatePerformances } };
        }
        return row;
      })
      .sort((a, b) => {
        const dateA = a.kind === "profile" ? a.match.eventDate : a.match.date;
        const dateB = b.kind === "profile" ? b.match.eventDate : b.match.date;
        return dateB.localeCompare(dateA) || a.key.localeCompare(b.key);
      });
    return {
      searchedNames: primary.searchedNames,
      rows,
      totalMatches: rows.length,
      duplicatesCombined: candidates.length - rows.length,
      truncated: primary.truncated || histories.length > MAX_HISTORY_ROWS || archive.length === 50,
    };
  });
