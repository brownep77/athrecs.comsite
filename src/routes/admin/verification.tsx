import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import {
  getVerificationWorkbench,
  publishFixtureVerificationCandidate,
  saveFixtureCandidateEntry,
  saveFixtureCandidateResult,
  saveFixtureCandidateReview,
  stageFixtureVerificationCandidate,
} from "@/lib/athrecs/verification-workflow-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FACT_OPTIONS = [
  "pending",
  "verified",
  "not_published",
  "not_applicable",
  "conflict",
  "rejected",
] as const;
const OFFICIAL_OPTIONS = ["pending", "verified", "not_found", "conflict", "rejected"] as const;
const DUPLICATE_OPTIONS = [
  "pending",
  "new",
  "matched_existing",
  "exact_duplicate",
  "possible_duplicate",
  "needs_review",
] as const;
const OVERALL_OPTIONS = ["pending", "approved", "needs_changes", "rejected"] as const;
const RELATIONSHIP_OPTIONS = [
  "organiser_direct",
  "authorised_partner",
  "charity_place",
  "tour_operator",
  "unconfirmed",
  "rejected",
] as const;
const REVIEW_OPTIONS = ["pending", "approved", "needs_changes", "rejected"] as const;

const EMPTY_CANDIDATE = JSON.stringify(
  {
    sourceId: "manual_staff_research",
    discoveryUrl: "",
    eventName: "",
    sport: "Running",
    country: "United Kingdom",
    county: "",
    city: "",
    area: "",
    venue: "",
    surface: "Road",
    organiser: "",
    officialWebsiteCandidate: "",
    officialWebsiteEvidenceUrl: "",
    eventDate: "",
    distance: "10K",
    distanceKm: 10,
    startTime: "",
    entryStatus: "TBC",
    entryOptions: [],
    resultLinks: [],
  },
  null,
  2,
);

// The Vite build regenerates the checked-in route tree.
// @ts-expect-error This literal route is generated during the build.
export const Route = createFileRoute("/admin/verification")({
  head: () => ({
    meta: [
      { title: "Fixture verification — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: VerificationPage,
});

type Dashboard = Awaited<ReturnType<typeof getVerificationWorkbench>>;
type Selected = NonNullable<Dashboard["selected"]>;
type Candidate = Selected["candidate"];
type CandidateEntry = Selected["entries"][number];
type CandidateResult = Selected["results"][number];

type CandidateForm = {
  candidateId: string;
  eventName: string;
  sport: string;
  country: string;
  county: string;
  city: string;
  area: string;
  venue: string;
  surface: string;
  organiser: string;
  officialWebsiteCandidate: string;
  officialWebsiteEvidenceUrl: string;
  officialWebsiteStatus: string;
  eventDate: string;
  distance: string;
  distanceKm: string;
  startTime: string;
  entryStatus: string;
  eventNameCheck: string;
  organiserCheck: string;
  dateCheck: string;
  distanceCheck: string;
  locationCheck: string;
  surfaceCheck: string;
  startTimeCheck: string;
  entryStatusCheck: string;
  cancellationCheck: string;
  duplicateStatus: string;
  matchedEventId: string;
  matchedEditionId: string;
  duplicateNote: string;
  overallStatus: string;
  reviewNote: string;
};

type EntryDraft = {
  id?: string;
  providerCode: string;
  providerName: string;
  entryUrl: string;
  entryType: string;
  status: string;
  priceAmount: string;
  priceCurrency: string;
  opensAt: string;
  closesAt: string;
  sourceUrl: string;
  providerRelationship: string;
  urlCheck: string;
  eventCheck: string;
  editionCheck: string;
  availabilityCheck: string;
  duplicateStatus: string;
  isPrimary: boolean;
  reviewStatus: string;
  reviewNote: string;
};

type ResultDraft = {
  id?: string;
  providerCode: string;
  providerName: string;
  resultsUrl: string;
  sourceUrl: string;
  urlCheck: string;
  eventCheck: string;
  editionCheck: string;
  eventLevelCheck: string;
  participantScopeCheck: string;
  duplicateStatus: string;
  reviewStatus: string;
  reviewNote: string;
};

function blankEntry(): EntryDraft {
  return {
    providerCode: "",
    providerName: "",
    entryUrl: "",
    entryType: "third_party",
    status: "unknown",
    priceAmount: "",
    priceCurrency: "",
    opensAt: "",
    closesAt: "",
    sourceUrl: "",
    providerRelationship: "unconfirmed",
    urlCheck: "pending",
    eventCheck: "pending",
    editionCheck: "pending",
    availabilityCheck: "pending",
    duplicateStatus: "new",
    isPrimary: false,
    reviewStatus: "pending",
    reviewNote: "",
  };
}

function blankResult(): ResultDraft {
  return {
    providerCode: "",
    providerName: "",
    resultsUrl: "",
    sourceUrl: "",
    urlCheck: "pending",
    eventCheck: "pending",
    editionCheck: "pending",
    eventLevelCheck: "pending",
    participantScopeCheck: "pending",
    duplicateStatus: "new",
    reviewStatus: "pending",
    reviewNote: "",
  };
}

function candidateForm(candidate: Candidate): CandidateForm {
  return {
    candidateId: candidate.id,
    eventName: candidate.event_name,
    sport: candidate.sport,
    country: candidate.country,
    county: candidate.county,
    city: candidate.city,
    area: candidate.area,
    venue: candidate.venue,
    surface: candidate.surface,
    organiser: candidate.organiser,
    officialWebsiteCandidate: candidate.official_website_candidate ?? "",
    officialWebsiteEvidenceUrl: candidate.official_website_evidence_url ?? "",
    officialWebsiteStatus: candidate.official_website_status,
    eventDate: candidate.event_date,
    distance: candidate.distance_code,
    distanceKm: String(candidate.distance_km ?? 0),
    startTime: candidate.start_time ?? "",
    entryStatus: candidate.entry_status,
    eventNameCheck: candidate.event_name_check,
    organiserCheck: candidate.organiser_check,
    dateCheck: candidate.date_check,
    distanceCheck: candidate.distance_check,
    locationCheck: candidate.location_check,
    surfaceCheck: candidate.surface_check,
    startTimeCheck: candidate.start_time_check,
    entryStatusCheck: candidate.entry_status_check,
    cancellationCheck: candidate.cancellation_check,
    duplicateStatus: candidate.duplicate_status,
    matchedEventId: candidate.matched_event_id ? String(candidate.matched_event_id) : "",
    matchedEditionId: candidate.matched_edition_id ? String(candidate.matched_edition_id) : "",
    duplicateNote: candidate.duplicate_note ?? "",
    overallStatus: candidate.overall_status,
    reviewNote: candidate.review_note ?? "",
  };
}

function entryDraft(entry: CandidateEntry): EntryDraft {
  return {
    id: entry.id,
    providerCode: entry.provider_code,
    providerName: entry.provider_name,
    entryUrl: entry.entry_url,
    entryType: entry.entry_type,
    status: entry.status,
    priceAmount: entry.price_amount == null ? "" : String(entry.price_amount),
    priceCurrency: entry.price_currency ?? "",
    opensAt: entry.opens_at ?? "",
    closesAt: entry.closes_at ?? "",
    sourceUrl: entry.source_url ?? "",
    providerRelationship: entry.provider_relationship,
    urlCheck: entry.url_check,
    eventCheck: entry.event_check,
    editionCheck: entry.edition_check,
    availabilityCheck: entry.availability_check,
    duplicateStatus: entry.duplicate_status,
    isPrimary: entry.is_primary,
    reviewStatus: entry.review_status,
    reviewNote: entry.review_note ?? "",
  };
}

function resultDraft(result: CandidateResult): ResultDraft {
  return {
    id: result.id,
    providerCode: result.provider_code,
    providerName: result.provider_name,
    resultsUrl: result.results_url,
    sourceUrl: result.source_url ?? "",
    urlCheck: result.url_check,
    eventCheck: result.event_check,
    editionCheck: result.edition_check,
    eventLevelCheck: result.event_level_check,
    participantScopeCheck: result.participant_scope_check,
    duplicateStatus: result.duplicate_status,
    reviewStatus: result.review_status,
    reviewNote: result.review_note ?? "",
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function statusTone(status: string): string {
  if (status === "published" || status === "approved") {
    return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  }
  if (status === "rejected") return "border-red-500/30 bg-red-50 text-red-900";
  return "border-amber-500/30 bg-amber-50 text-amber-900";
}

function VerificationPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<
    "pending" | "approved" | "published" | "rejected" | "all"
  >("pending");
  const [candidateId, setCandidateId] = useState<string | undefined>();
  const [manualJson, setManualJson] = useState(EMPTY_CANDIDATE);
  const [form, setForm] = useState<CandidateForm | null>(null);
  const [entry, setEntry] = useState<EntryDraft>(blankEntry());
  const [result, setResult] = useState<ResultDraft>(blankResult());
  const [message, setMessage] = useState<string | null>(null);

  const dashboard = useQuery({
    queryKey: ["verification-workbench", status, candidateId],
    queryFn: () => getVerificationWorkbench({ data: { status, candidateId } }),
    refetchInterval: 15_000,
  });

  useEffect(() => {
    const firstId = dashboard.data?.candidates[0]?.id;
    if (!candidateId && firstId) setCandidateId(firstId);
  }, [candidateId, dashboard.data?.candidates]);

  useEffect(() => {
    const selected = dashboard.data?.selected?.candidate;
    setForm(selected ? candidateForm(selected) : null);
    setEntry(blankEntry());
    setResult(blankResult());
  }, [dashboard.data?.selected]);

  const stageMutation = useMutation({
    mutationFn: async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(manualJson);
      } catch {
        throw new Error("Candidate JSON is invalid");
      }
      return stageFixtureVerificationCandidate({ data: parsed as never });
    },
    onSuccess: (staged) => {
      setStatus("pending");
      setCandidateId(staged.candidateId);
      setMessage(
        staged.reused
          ? `Existing candidate opened: ${staged.candidateId}`
          : `Candidate staged with ${staged.duplicate.duplicateStatus.replaceAll("_", " ")} duplicate status.`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error("Select a candidate first");
      return saveFixtureCandidateReview({
        data: {
          candidateId: form.candidateId,
          eventName: form.eventName,
          sport: form.sport,
          country: form.country,
          county: form.county,
          city: form.city,
          area: form.area,
          venue: form.venue,
          surface: form.surface,
          organiser: form.organiser,
          officialWebsiteCandidate: form.officialWebsiteCandidate || null,
          officialWebsiteEvidenceUrl: form.officialWebsiteEvidenceUrl || null,
          officialWebsiteStatus: form.officialWebsiteStatus,
          eventDate: form.eventDate,
          distance: form.distance,
          distanceKm: Number(form.distanceKm || 0),
          startTime: form.startTime || null,
          entryStatus: form.entryStatus,
          eventNameCheck: form.eventNameCheck,
          organiserCheck: form.organiserCheck,
          dateCheck: form.dateCheck,
          distanceCheck: form.distanceCheck,
          locationCheck: form.locationCheck,
          surfaceCheck: form.surfaceCheck,
          startTimeCheck: form.startTimeCheck,
          entryStatusCheck: form.entryStatusCheck,
          cancellationCheck: form.cancellationCheck,
          duplicateStatus: form.duplicateStatus,
          matchedEventId: form.matchedEventId ? Number(form.matchedEventId) : null,
          matchedEditionId: form.matchedEditionId ? Number(form.matchedEditionId) : null,
          duplicateNote: form.duplicateNote,
          overallStatus: form.overallStatus,
          reviewNote: form.reviewNote,
        },
      });
    },
    onSuccess: (candidate) => {
      setMessage(
        candidate.overall_status === "approved"
          ? "Fixture identity approved. Review providers, then publish."
          : "Fixture review saved.",
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const entryMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error("Select a candidate first");
      return saveFixtureCandidateEntry({
        data: {
          candidateId: form.candidateId,
          option: {
            id: entry.id,
            providerCode: entry.providerCode || undefined,
            providerName: entry.providerName,
            entryUrl: entry.entryUrl,
            entryType: entry.entryType,
            status: entry.status,
            priceAmount: entry.priceAmount ? Number(entry.priceAmount) : undefined,
            priceCurrency: entry.priceCurrency || undefined,
            opensAt: entry.opensAt || undefined,
            closesAt: entry.closesAt || undefined,
            sourceUrl: entry.sourceUrl || undefined,
            providerRelationship: entry.providerRelationship,
            urlCheck: entry.urlCheck,
            eventCheck: entry.eventCheck,
            editionCheck: entry.editionCheck,
            availabilityCheck: entry.availabilityCheck,
            duplicateStatus: entry.duplicateStatus,
            isPrimary: entry.isPrimary,
            reviewStatus: entry.reviewStatus,
            reviewNote: entry.reviewNote || undefined,
          },
        },
      });
    },
    onSuccess: () => {
      setMessage("Entry-provider review saved.");
      setEntry(blankEntry());
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const resultMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error("Select a candidate first");
      return saveFixtureCandidateResult({
        data: {
          candidateId: form.candidateId,
          result: {
            id: result.id,
            providerCode: result.providerCode || undefined,
            providerName: result.providerName,
            resultsUrl: result.resultsUrl,
            sourceUrl: result.sourceUrl || undefined,
            urlCheck: result.urlCheck,
            eventCheck: result.eventCheck,
            editionCheck: result.editionCheck,
            eventLevelCheck: result.eventLevelCheck,
            participantScopeCheck: result.participantScopeCheck,
            duplicateStatus: result.duplicateStatus,
            reviewStatus: result.reviewStatus,
            reviewNote: result.reviewNote || undefined,
          },
        },
      });
    },
    onSuccess: () => {
      setMessage("Results-link review saved.");
      setResult(blankResult());
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const publishMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error("Select a candidate first");
      if (
        !window.confirm(
          "Publish this verified fixture and only its approved entry/results providers?",
        )
      ) {
        throw new Error("Publication cancelled");
      }
      return publishFixtureVerificationCandidate({ data: { candidateId: form.candidateId } });
    },
    onSuccess: (published) => {
      setStatus("published");
      setMessage(
        `Published event ${published.eventId}, edition ${published.editionId}, ${published.entryOptionsPublished} entry route(s) and ${published.resultLinksPublished} result link(s).`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => {
      const text = errorMessage(error);
      if (text !== "Publication cancelled") setMessage(text);
    },
  });

  const selected = dashboard.data?.selected?.candidate ?? null;
  const entries = dashboard.data?.selected?.entries ?? [];
  const results = dashboard.data?.selected?.results ?? [];
  const gateErrors = dashboard.data?.selected?.gateErrors ?? [];
  const counts = dashboard.data?.counts;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Manual publication gate
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
            Fixture, official-site and provider verification
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            A discovery directory never becomes the public official website automatically. Staff
            must confirm an organiser or governing-body page, essential event facts, duplicate
            resolution and each entry or results provider before publication.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to={"/admin/source-intake" as never}>Source intake</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={dashboard.isFetching}
            onClick={() => void dashboard.refetch()}
          >
            <RefreshCw className={`size-4 ${dashboard.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {counts ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Pending" value={counts.pending} tone="held" />
          <Summary label="Approved" value={counts.approved} tone="info" />
          <Summary label="Published" value={counts.published} tone="ready" />
          <Summary label="Rejected" value={counts.rejected} tone="problem" />
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent">
          {message}
        </p>
      ) : null}

      <details className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <summary className="cursor-pointer font-semibold text-fg">Stage a candidate manually</summary>
        <p className="mt-2 text-sm text-muted">
          Approved crawlers use this same private staging format. Manual research can be entered
          here without publishing directly.
        </p>
        <textarea
          value={manualJson}
          rows={15}
          spellCheck={false}
          onChange={(event) => setManualJson(event.target.value)}
          className="mt-4 w-full rounded-lg border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
        <Button className="mt-3" type="button" disabled={stageMutation.isPending} onClick={() => stageMutation.mutate()}>
          <Plus className="size-4" aria-hidden="true" />
          {stageMutation.isPending ? "Staging…" : "Stage private candidate"}
        </Button>
      </details>

      <section className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-3">
          <SelectField
            label="Queue"
            value={status}
            options={["pending", "approved", "published", "rejected", "all"]}
            onChange={(value) => {
              setStatus(value as typeof status);
              setCandidateId(undefined);
            }}
          />
          <div className="max-h-[70rem] space-y-2 overflow-y-auto pr-1">
            {(dashboard.data?.candidates ?? []).map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setCandidateId(candidate.id)}
                className={`w-full rounded-xl border p-3 text-left shadow-card ${
                  selected?.id === candidate.id
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={statusTone(candidate.workflow_status)}>
                    {candidate.workflow_status}
                  </Badge>
                  <Badge variant="outline">{candidate.duplicate_status.replaceAll("_", " ")}</Badge>
                </div>
                <p className="mt-2 font-semibold text-fg">{candidate.event_name}</p>
                <p className="mt-1 text-xs text-muted">
                  {candidate.event_date} · {candidate.distance_code}
                </p>
                <p className="mt-1 truncate text-xs text-subtle">{candidate.source_id}</p>
              </button>
            ))}
            {!dashboard.isLoading && !dashboard.data?.candidates.length ? (
              <p className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-sm text-muted">
                No candidates match this queue.
              </p>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {selected && form ? (
            <>
              <section className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold text-fg">Verify fixture identity</h2>
                      <Badge className={statusTone(selected.workflow_status)}>{selected.workflow_status}</Badge>
                    </div>
                    <a
                      href={selected.discovery_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 break-all text-xs text-accent no-underline hover:underline"
                    >
                      Open discovery evidence
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="max-w-lg rounded-lg border border-border bg-elevated px-3 py-2 text-xs text-muted">
                    {gateErrors.length
                      ? `${gateErrors.length} publication check${gateErrors.length === 1 ? "" : "s"} remain: ${gateErrors.slice(0, 3).join("; ")}`
                      : "All current publication checks pass."}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <TextField label="Event name" value={form.eventName} onChange={(value) => setForm({ ...form, eventName: value })} />
                  <TextField label="Sport" value={form.sport} onChange={(value) => setForm({ ...form, sport: value })} />
                  <TextField label="Organiser" value={form.organiser} onChange={(value) => setForm({ ...form, organiser: value })} />
                  <TextField label="Country" value={form.country} onChange={(value) => setForm({ ...form, country: value })} />
                  <TextField label="County / state" value={form.county} onChange={(value) => setForm({ ...form, county: value })} />
                  <TextField label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
                  <TextField label="Area" value={form.area} onChange={(value) => setForm({ ...form, area: value })} />
                  <TextField label="Venue" value={form.venue} onChange={(value) => setForm({ ...form, venue: value })} />
                  <TextField label="Surface" value={form.surface} onChange={(value) => setForm({ ...form, surface: value })} />
                  <TextField label="Date" type="date" value={form.eventDate} onChange={(value) => setForm({ ...form, eventDate: value })} />
                  <TextField label="Distance" value={form.distance} onChange={(value) => setForm({ ...form, distance: value })} />
                  <TextField label="Distance km" type="number" value={form.distanceKm} onChange={(value) => setForm({ ...form, distanceKm: value })} />
                  <TextField label="Start time" value={form.startTime} onChange={(value) => setForm({ ...form, startTime: value })} />
                  <SelectField label="Entry status" value={form.entryStatus} options={["Open", "ClosingSoon", "Closed", "Finished", "TBC"]} onChange={(value) => setForm({ ...form, entryStatus: value })} />
                </div>

                <div className="rounded-xl border border-border bg-elevated p-4">
                  <h3 className="font-semibold text-fg">Canonical official website</h3>
                  <p className="mt-1 text-xs text-muted">
                    Verify only an organiser-owned, event-owned or governing-body page. Do not use
                    a directory, marketplace, timer, social page or news article as “Official”.
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <TextField label="Final official URL" value={form.officialWebsiteCandidate} onChange={(value) => setForm({ ...form, officialWebsiteCandidate: value })} />
                    <TextField label="Evidence URL" value={form.officialWebsiteEvidenceUrl} onChange={(value) => setForm({ ...form, officialWebsiteEvidenceUrl: value })} />
                    <SelectField label="Official-site decision" value={form.officialWebsiteStatus} options={[...OFFICIAL_OPTIONS]} onChange={(value) => setForm({ ...form, officialWebsiteStatus: value })} />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <ReviewSelect label="Event name check" value={form.eventNameCheck} onChange={(value) => setForm({ ...form, eventNameCheck: value })} />
                  <ReviewSelect label="Organiser check" value={form.organiserCheck} onChange={(value) => setForm({ ...form, organiserCheck: value })} />
                  <ReviewSelect label="Date check" value={form.dateCheck} onChange={(value) => setForm({ ...form, dateCheck: value })} />
                  <ReviewSelect label="Distance check" value={form.distanceCheck} onChange={(value) => setForm({ ...form, distanceCheck: value })} />
                  <ReviewSelect label="Location check" value={form.locationCheck} onChange={(value) => setForm({ ...form, locationCheck: value })} />
                  <ReviewSelect label="Surface check" value={form.surfaceCheck} onChange={(value) => setForm({ ...form, surfaceCheck: value })} />
                  <ReviewSelect label="Start-time check" value={form.startTimeCheck} onChange={(value) => setForm({ ...form, startTimeCheck: value })} />
                  <ReviewSelect label="Entry-status check" value={form.entryStatusCheck} onChange={(value) => setForm({ ...form, entryStatusCheck: value })} />
                  <ReviewSelect label="Cancellation check" value={form.cancellationCheck} onChange={(value) => setForm({ ...form, cancellationCheck: value })} />
                  <SelectField label="Duplicate decision" value={form.duplicateStatus} options={[...DUPLICATE_OPTIONS]} onChange={(value) => setForm({ ...form, duplicateStatus: value })} />
                  <TextField label="Matched event ID" type="number" value={form.matchedEventId} onChange={(value) => setForm({ ...form, matchedEventId: value })} />
                  <TextField label="Matched edition ID" type="number" value={form.matchedEditionId} onChange={(value) => setForm({ ...form, matchedEditionId: value })} />
                  <SelectField label="Overall fixture decision" value={form.overallStatus} options={[...OVERALL_OPTIONS]} onChange={(value) => setForm({ ...form, overallStatus: value })} />
                </div>
                <TextArea label="Duplicate note" value={form.duplicateNote} onChange={(value) => setForm({ ...form, duplicateNote: value })} />
                <TextArea label="Review note" value={form.reviewNote} onChange={(value) => setForm({ ...form, reviewNote: value })} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>
                    <Save className="size-4" aria-hidden="true" />
                    {reviewMutation.isPending ? "Saving…" : "Save fixture review"}
                  </Button>
                  <Button
                    type="button"
                    disabled={selected.workflow_status !== "approved" || publishMutation.isPending}
                    onClick={() => publishMutation.mutate()}
                  >
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    {publishMutation.isPending ? "Publishing…" : "Publish verified fixture"}
                  </Button>
                </div>
              </section>

              <ProviderSection
                entries={entries}
                draft={entry}
                setDraft={setEntry}
                save={() => entryMutation.mutate()}
                saving={entryMutation.isPending}
              />

              <ResultsSection
                results={results}
                draft={result}
                setDraft={setResult}
                save={() => resultMutation.mutate()}
                saving={resultMutation.isPending}
              />

              {selected.workflow_status === "published" ? (
                <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 text-sm text-emerald-950">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                  This candidate has been published with its evidence and audit trail.
                  <Link
                    to="/races/$slug"
                    params={{ slug: selected.event_slug }}
                    className="ml-auto font-medium text-emerald-900 underline"
                  >
                    Open public event
                  </Link>
                </p>
              ) : null}
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
              Select a fixture candidate to start the review.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ProviderSection({
  entries,
  draft,
  setDraft,
  save,
  saving,
}: {
  entries: CandidateEntry[];
  draft: EntryDraft;
  setDraft: (draft: EntryDraft) => void;
  save: () => void;
  saving: boolean;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
      <div className="flex items-center gap-2">
        <Ticket className="size-5 text-accent" aria-hidden="true" />
        <div>
          <h2 className="font-display text-xl font-semibold text-fg">Review every entry provider</h2>
          <p className="mt-1 text-xs text-muted">
            Each public route needs its own event, edition, relationship, availability and duplicate checks.
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        {entries.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setDraft(entryDraft(option))}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-elevated p-3 text-left hover:border-accent"
          >
            <span>
              <span className="font-medium text-fg">{option.provider_name}</span>
              <span className="mt-1 block break-all text-xs text-subtle">{option.entry_url}</span>
            </span>
            <span className="flex gap-1.5">
              {option.is_primary ? <Badge variant="solid">Primary</Badge> : null}
              <Badge className={statusTone(option.review_status)}>
                {option.review_status.replaceAll("_", " ")}
              </Badge>
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-elevated p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-fg">{draft.id ? "Edit provider" : "Add provider"}</h3>
          {draft.id ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(blankEntry())}>
              New provider
            </Button>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Provider name" value={draft.providerName} onChange={(value) => setDraft({ ...draft, providerName: value })} />
          <TextField label="Provider code" value={draft.providerCode} onChange={(value) => setDraft({ ...draft, providerCode: value })} />
          <TextField label="Entry URL" value={draft.entryUrl} onChange={(value) => setDraft({ ...draft, entryUrl: value })} />
          <TextField label="Evidence URL" value={draft.sourceUrl} onChange={(value) => setDraft({ ...draft, sourceUrl: value })} />
          <SelectField label="Type" value={draft.entryType} options={["official", "third_party", "charity", "tour_operator"]} onChange={(value) => setDraft({ ...draft, entryType: value })} />
          <SelectField label="Provider relationship" value={draft.providerRelationship} options={[...RELATIONSHIP_OPTIONS]} onChange={(value) => setDraft({ ...draft, providerRelationship: value })} />
          <SelectField label="Availability" value={draft.status} options={["open", "closing_soon", "ballot", "waitlist", "sold_out", "closed", "unknown"]} onChange={(value) => setDraft({ ...draft, status: value })} />
          <TextField label="Price" type="number" value={draft.priceAmount} onChange={(value) => setDraft({ ...draft, priceAmount: value })} />
          <TextField label="Currency" value={draft.priceCurrency} onChange={(value) => setDraft({ ...draft, priceCurrency: value })} />
          <TextField label="Opens" type="date" value={draft.opensAt} onChange={(value) => setDraft({ ...draft, opensAt: value })} />
          <TextField label="Closes" type="date" value={draft.closesAt} onChange={(value) => setDraft({ ...draft, closesAt: value })} />
          <ReviewSelect label="URL works" value={draft.urlCheck} onChange={(value) => setDraft({ ...draft, urlCheck: value })} />
          <ReviewSelect label="Correct event" value={draft.eventCheck} onChange={(value) => setDraft({ ...draft, eventCheck: value })} />
          <ReviewSelect label="Correct edition" value={draft.editionCheck} onChange={(value) => setDraft({ ...draft, editionCheck: value })} />
          <ReviewSelect label="Availability checked" value={draft.availabilityCheck} onChange={(value) => setDraft({ ...draft, availabilityCheck: value })} />
          <SelectField label="Duplicate decision" value={draft.duplicateStatus} options={["pending", "new", "exact_duplicate", "possible_duplicate", "needs_review"]} onChange={(value) => setDraft({ ...draft, duplicateStatus: value })} />
          <SelectField label="Review decision" value={draft.reviewStatus} options={[...REVIEW_OPTIONS]} onChange={(value) => setDraft({ ...draft, reviewStatus: value })} />
          <label className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-3 text-sm text-fg">
            <input
              type="checkbox"
              checked={draft.isPrimary}
              onChange={(event) => setDraft({ ...draft, isPrimary: event.target.checked })}
              className="size-4 accent-accent"
            />
            Primary public entry route
          </label>
        </div>
        <TextArea label="Provider review note" value={draft.reviewNote} onChange={(value) => setDraft({ ...draft, reviewNote: value })} />
        <Button type="button" disabled={saving} onClick={save}>
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Saving…" : "Save provider review"}
        </Button>
      </div>
    </section>
  );
}

function ResultsSection({
  results,
  draft,
  setDraft,
  save,
  saving,
}: {
  results: CandidateResult[];
  draft: ResultDraft;
  setDraft: (draft: ResultDraft) => void;
  save: () => void;
  saving: boolean;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
      <div className="flex items-center gap-2">
        <Link2 className="size-5 text-accent" aria-hidden="true" />
        <div>
          <h2 className="font-display text-xl font-semibold text-fg">Review results-page links</h2>
          <p className="mt-1 text-xs text-muted">
            This approves an event-level link only. It does not approve copying participant rows.
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        {results.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => setDraft(resultDraft(link))}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-elevated p-3 text-left hover:border-accent"
          >
            <span>
              <span className="font-medium text-fg">{link.provider_name}</span>
              <span className="mt-1 block break-all text-xs text-subtle">{link.results_url}</span>
            </span>
            <Badge className={statusTone(link.review_status)}>
              {link.review_status.replaceAll("_", " ")}
            </Badge>
          </button>
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-elevated p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-fg">{draft.id ? "Edit results link" : "Add results link"}</h3>
          {draft.id ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(blankResult())}>
              New link
            </Button>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Provider name" value={draft.providerName} onChange={(value) => setDraft({ ...draft, providerName: value })} />
          <TextField label="Provider code" value={draft.providerCode} onChange={(value) => setDraft({ ...draft, providerCode: value })} />
          <TextField label="Results URL" value={draft.resultsUrl} onChange={(value) => setDraft({ ...draft, resultsUrl: value })} />
          <TextField label="Evidence URL" value={draft.sourceUrl} onChange={(value) => setDraft({ ...draft, sourceUrl: value })} />
          <ReviewSelect label="URL works" value={draft.urlCheck} onChange={(value) => setDraft({ ...draft, urlCheck: value })} />
          <ReviewSelect label="Correct event" value={draft.eventCheck} onChange={(value) => setDraft({ ...draft, eventCheck: value })} />
          <ReviewSelect label="Correct edition" value={draft.editionCheck} onChange={(value) => setDraft({ ...draft, editionCheck: value })} />
          <ReviewSelect label="Event-level page only" value={draft.eventLevelCheck} onChange={(value) => setDraft({ ...draft, eventLevelCheck: value })} />
          <ReviewSelect label="Participant rows excluded" value={draft.participantScopeCheck} onChange={(value) => setDraft({ ...draft, participantScopeCheck: value })} />
          <SelectField label="Duplicate decision" value={draft.duplicateStatus} options={["pending", "new", "exact_duplicate", "possible_duplicate", "needs_review"]} onChange={(value) => setDraft({ ...draft, duplicateStatus: value })} />
          <SelectField label="Review decision" value={draft.reviewStatus} options={[...REVIEW_OPTIONS]} onChange={(value) => setDraft({ ...draft, reviewStatus: value })} />
        </div>
        <TextArea label="Results review note" value={draft.reviewNote} onChange={(value) => setDraft({ ...draft, reviewNote: value })} />
        <Button type="button" disabled={saving} onClick={save}>
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Saving…" : "Save results-link review"}
        </Button>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
}) {
  return (
    <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
      {label}
      <textarea
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReviewSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return <SelectField label={label} value={value} options={FACT_OPTIONS} onChange={onChange} />;
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ready" | "held" | "info" | "problem";
}) {
  const className =
    tone === "ready"
      ? "border-emerald-500/30 bg-emerald-50 text-emerald-950"
      : tone === "held"
        ? "border-amber-500/30 bg-amber-50 text-amber-950"
        : tone === "info"
          ? "border-sky-500/30 bg-sky-50 text-sky-950"
          : "border-red-500/30 bg-red-50 text-red-950";
  return (
    <div className={`rounded-xl border p-4 shadow-card ${className}`}>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular">{value.toLocaleString()}</p>
    </div>
  );
}
