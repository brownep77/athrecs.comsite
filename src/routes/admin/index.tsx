// Results-import UI (section 4) — force Vercel rebuild 2026-08-12T05:11:23.244467Z
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBulkSourceRun,
  getCatalogueRecovery,
  getDbStatus,
  getScraperWorkbookImport,
  importFromCsv,
  importFromJson,
  importResults,
  listAdminEventCards,
  queueBulkSourceRun,
  recoverCatalogueBatch,
  uploadScraperWorkbookNow,
} from "@/lib/athrecs/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RaceCard } from "@/components/races/RaceCard";
import { listEvents } from "@/lib/athrecs/api";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "ATHRECS Staff" }, { name: "robots", content: "noindex, nofollow, noarchive" }],
  }),
  component: AdminPage,
});

const GROK_PROMPT = `You are helping update ATHRECS.com (endurance race directory, UK and Ireland first).

From the race page URL or pasted fixture text below, extract events and editions.

Return ONLY valid JSON (no markdown) in this shape:
{
  "events": [
    {
      "name": "Example 10K",
      "sport": "Running",
      "country": "England",
      "county": "Norfolk",
      "city": "Norwich",
      "area": "City centre",
      "surface": "Road",
      "summary": "One-line summary",
      "description": "Longer description",
      "organiser": "Organiser name",
      "website": "https://…",
      "distances": ["10K"]
    }
  ],
  "editions": [
    {
      "eventName": "Example 10K",
      "date": "2026-09-14",
      "distance": "10K",
      "distanceKm": 10,
      "status": "Open",
      "startTime": "09:30",
      "entryUrl": "https://…",
      "entryOptions": [
        {
          "providerCode": "official",
          "providerName": "Official race entry",
          "entryUrl": "https://…",
          "entryType": "official",
          "status": "open",
          "checkedAt": "2026-08-17T12:00:00Z",
          "sourceUrl": "https://…",
          "isVerified": true,
          "isPrimary": true
        },
        {
          "providerCode": "worlds-marathons",
          "providerName": "World's Marathons",
          "entryUrl": "https://worldsmarathons.com/marathon/…",
          "entryType": "third_party",
          "status": "open",
          "priceAmount": 35,
          "priceCurrency": "GBP",
          "checkedAt": "2026-08-17T12:00:00Z",
          "sourceUrl": "https://worldsmarathons.com/marathon/…",
          "isVerified": true,
          "isPrimary": false
        }
      ],
      "source": "https://…"
    }
  ]
}

Rules:
- sport must be one of: Running, Athletics, Parkrun, Cycling, Swimming, Triathlon, Duathlon, Aquathlon, Aquabike, Rowing, OCR
- status one of: Open, ClosingSoon, Closed, Finished, TBC
- entryType one of: official, third_party, charity, tour_operator
- entry option status one of: open, closing_soon, ballot, waitlist, sold_out, closed, unknown
- dates must be YYYY-MM-DD
- Prefer the official organiser for canonical race facts and the primary entry link
- Only mark an entry option verified after opening its exact URL
- "Notify me" is not an open entry route; use status unknown or closed
- Do not copy descriptions, photographs, reviews or maps from aggregators

Source:
`;

const SAMPLE_CSV = `name,sport,country,county,city,date,distance,distance_km,status,start_time,website,organiser,surface,entry_url,provider_name,provider_code,provider_entry_url,provider_type,provider_status,provider_price,provider_currency,provider_checked_at,provider_source_url,provider_verified,provider_primary
Example Fun Run,Running,England,Norfolk,Norwich,2026-12-01,5K,5,Open,10:00,https://example.com,Local RC,Road,https://example.com/enter,World's Marathons,worlds-marathons,https://worldsmarathons.com/marathon/example,third_party,open,35,GBP,2026-08-17T12:00:00Z,https://worldsmarathons.com/marathon/example,true,false`;

function AdminPage() {
  const qc = useQueryClient();
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [json, setJson] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resultsJson, setResultsJson] = useState("");

  const cards = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => listAdminEventCards(),
  });

  const dbStatus = useQuery({
    queryKey: ["admin-db-status"],
    queryFn: () => getDbStatus(),
    refetchInterval: 15_000,
  });

  const catalogueRecovery = useQuery({
    queryKey: ["admin-catalogue-recovery"],
    queryFn: () => getCatalogueRecovery(),
    refetchInterval: 15_000,
  });

  const bulkRun = useQuery({
    queryKey: ["admin-bulk-source-run"],
    queryFn: () => getBulkSourceRun(),
    refetchInterval: 15_000,
  });

  const workbookImport = useQuery({
    queryKey: ["admin-scraper-workbook-import"],
    queryFn: () => getScraperWorkbookImport(),
    refetchInterval: 15_000,
  });

  const preview = useQuery({
    queryKey: ["admin-preview-events"],
    queryFn: () => listEvents({ data: {} }),
  });

  const csvMut = useMutation({
    mutationFn: () => importFromCsv({ data: { csv } }),
    onSuccess: (r) => {
      setMessage(
        `CSV import: ${r.eventsUpserted} events, ${r.editionsUpserted} editions, ${r.entryOptionsUpserted} entry options` +
          (r.errors.length
            ? ` · ${r.errors.length} error(s): ${r.errors.slice(0, 3).join("; ")}`
            : ""),
      );
      void qc.invalidateQueries();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const jsonMut = useMutation({
    mutationFn: () => importFromJson({ data: { json } }),
    onSuccess: (r) => {
      setMessage(
        `Grok JSON import: ${r.eventsUpserted} events, ${r.editionsUpserted} editions, ${r.entryOptionsUpserted} entry options` +
          (r.errors.length
            ? ` · ${r.errors.length} error(s): ${r.errors.slice(0, 3).join("; ")}`
            : ""),
      );
      void qc.invalidateQueries();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const resultsMut = useMutation({
    mutationFn: () => importResults({ data: { json: resultsJson } }),
    onSuccess: (r) => {
      setMessage(
        `Results import: ${r.athletesUpserted} athletes, ${r.resultsUpserted} results` +
          (r.errors?.length
            ? ` · ${r.errors.length} error(s): ${r.errors.slice(0, 3).join("; ")}`
            : ""),
      );
      void qc.invalidateQueries();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const bulkRunMut = useMutation({
    mutationFn: () => queueBulkSourceRun(),
    onSuccess: (result) => {
      const latest = result.latestRun;
      setMessage(
        latest
          ? `${result.created ? "Bulk run created" : "Existing bulk run updated"}: ${latest.totalJobs} source jobs · ${latest.runnableSourceCount} runnable · ${latest.blockedSourceCount} held for approval`
          : "Bulk run could not be loaded",
      );
      void qc.invalidateQueries({ queryKey: ["admin-bulk-source-run"] });
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const workbookImportMut = useMutation({
    mutationFn: () => uploadScraperWorkbookNow(),
    onSuccess: (result) => {
      const published = result.publication;
      const counts = published.counts;
      setMessage(
        `Workbook upload complete: ${result.staged.counts.staged.toLocaleString()} source editions staged · ${published.publishedEvents.toLocaleString()} new events · ${published.publishedEditions.toLocaleString()} new edition distances · ${counts.duplicates.toLocaleString()} duplicates · ${counts.blocked.toLocaleString()} held for review`,
      );
      void qc.invalidateQueries();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const catalogueRecoveryMut = useMutation({
    mutationFn: async () => {
      let status = await recoverCatalogueBatch();
      qc.setQueryData(["admin-catalogue-recovery"], status);
      for (let attempt = 0; !status.complete && attempt < 160; attempt += 1) {
        status = await recoverCatalogueBatch();
        qc.setQueryData(["admin-catalogue-recovery"], status);
      }
      if (!status.complete) {
        throw new Error("Catalogue recovery paused before verification; run it again to resume");
      }
      return status;
    },
    onSuccess: (status) => {
      setMessage(
        `Catalogue restored: ${status.current.events.toLocaleString()} events · ${status.current.editions.toLocaleString()} editions · ${status.current.entryOptions.toLocaleString()} entry options`,
      );
      void qc.invalidateQueries();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const previewCards = useMemo(() => (preview.data ?? []).slice(0, 6), [preview.data]);

  async function copyPrompt() {
    await navigator.clipboard.writeText(GROK_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">Site tools</p>
        <h1 className="font-display text-2xl font-semibold text-fg md:text-3xl">
          Update ATHRECS with Grok
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Publish the site from the Grok App Builder, then keep fixtures fresh here: ask Grok to
          extract races, paste the JSON, or bulk-load a CSV. Live listings use the same Race cards
          as the public Events page.
        </p>
      </div>

      <section
        className={`space-y-3 rounded-xl border p-5 shadow-card ${
          dbStatus.data && !dbStatus.data.persistent
            ? "border-amber-500/50 bg-amber-50/80"
            : "border-border bg-surface"
        }`}
      >
        <h2 className="font-display text-lg font-semibold text-fg">Database status</h2>
        {dbStatus.isLoading && <p className="text-sm text-muted">Checking database…</p>}
        {dbStatus.data && (
          <div className="space-y-2 text-sm">
            <p>
              Backend:{" "}
              <strong className="text-fg">
                {dbStatus.data.backend === "neon"
                  ? "Neon Postgres (persistent)"
                  : "PGLite (ephemeral — data can reset on cold start)"}
              </strong>
            </p>
            <p className="text-muted">
              Counts — athletes {dbStatus.data.athletes.toLocaleString()}, results{" "}
              {dbStatus.data.results.toLocaleString()}, clubs {dbStatus.data.clubs.toLocaleString()}
              , events {dbStatus.data.events.toLocaleString()}, editions{" "}
              {dbStatus.data.editions.toLocaleString()}, entry options{" "}
              {dbStatus.data.entryOptions.toLocaleString()}, result links{" "}
              {dbStatus.data.resultLinks.toLocaleString()}
            </p>
            {dbStatus.data.seedVersion && (
              <p className="text-xs text-subtle">Seed marker: {dbStatus.data.seedVersion}</p>
            )}
            {!dbStatus.data.persistent && (
              <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-100/80 px-3 py-3 text-amber-950">
                <p>
                  <strong>Data will not stick until Neon is connected.</strong> This live site is
                  still on in-memory PGLite — every cold start can wipe imports.
                </p>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  <li>
                    Open{" "}
                    <a
                      className="font-medium underline"
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noreferrer"
                    >
                      console.neon.tech
                    </a>{" "}
                    → your project → <strong>Connect</strong>
                  </li>
                  <li>
                    Copy the <strong>pooled</strong> connection string (starts with{" "}
                    <code className="rounded bg-white/80 px-1 text-xs">postgresql://</code>)
                  </li>
                  <li>
                    In{" "}
                    <a
                      className="font-medium underline"
                      href="https://vercel.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Vercel
                    </a>{" "}
                    → project for athrecs.com → <strong>Settings → Environment Variables</strong>
                  </li>
                  <li>
                    Add <code className="rounded bg-white/80 px-1 text-xs">DATABASE_URL</code> =
                    that string · Environment: <strong>Production</strong> (and Preview if you want)
                  </li>
                  <li>
                    <strong>Redeploy</strong> (or Publish again from Grok), then refresh this page —
                    Backend should say <em>Neon Postgres (persistent)</em>
                  </li>
                </ol>
                <p className="text-sm">
                  Or paste the connection string in chat and ask me to walk you through the check —
                  I cannot set Vercel env vars from here without your Vercel access.
                </p>
              </div>
            )}
            {dbStatus.data.persistent && (
              <p className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-emerald-950">
                <strong>Neon connected.</strong> Imports will persist. Athletes:{" "}
                {dbStatus.data.athletes.toLocaleString()} · Results:{" "}
                {dbStatus.data.results.toLocaleString()}
                {dbStatus.data.results < 10000
                  ? " — reply “go” in chat to load full Run Norwich history."
                  : " — multi-year data looks loaded."}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-fg">Catalogue recovery</h2>
            <p className="max-w-2xl text-sm text-muted">
              Restore missing catalogue events to Neon in small, resumable batches. Existing events,
              results, athlete accounts and claims are preserved; completion is recorded only after
              exact catalogue verification.
            </p>
          </div>
          <Button
            type="button"
            disabled={
              dbStatus.data?.persistent !== true ||
              catalogueRecoveryMut.isPending ||
              catalogueRecovery.data?.complete === true
            }
            onClick={() => {
              const confirmed = window.confirm(
                "Append the missing production catalogue to Neon now? Existing rows will not be overwritten.",
              );
              if (confirmed) catalogueRecoveryMut.mutate();
            }}
          >
            {catalogueRecoveryMut.isPending
              ? `Recovering… ${catalogueRecovery.data?.progressPercent ?? 0}%`
              : catalogueRecovery.data?.complete
                ? "Catalogue verified"
                : "Restore missing catalogue"}
          </Button>
        </div>

        {catalogueRecovery.isLoading && (
          <p className="text-sm text-muted">Checking catalogue recovery status…</p>
        )}
        {catalogueRecovery.data && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-subtle">Live events</p>
                <p className="mt-1 text-2xl font-semibold tabular text-fg">
                  {catalogueRecovery.data.current.events.toLocaleString()}
                </p>
                <p className="text-xs text-subtle">
                  Target {catalogueRecovery.data.target.events.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-subtle">Live editions</p>
                <p className="mt-1 text-2xl font-semibold tabular text-fg">
                  {catalogueRecovery.data.current.editions.toLocaleString()}
                </p>
                <p className="text-xs text-subtle">
                  Target {catalogueRecovery.data.target.editions.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-subtle">Entry options</p>
                <p className="mt-1 text-2xl font-semibold tabular text-fg">
                  {catalogueRecovery.data.current.entryOptions.toLocaleString()}
                </p>
                <p className="text-xs text-subtle">
                  Catalogue target {catalogueRecovery.data.target.entryOptions.toLocaleString()}
                </p>
              </div>
              <div
                className={`rounded-lg border p-3 ${
                  catalogueRecovery.data.complete
                    ? "border-emerald-500/30 bg-emerald-50"
                    : "border-amber-500/30 bg-amber-50"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-subtle">Recovery</p>
                <p className="mt-1 text-2xl font-semibold tabular text-fg">
                  {catalogueRecovery.data.progressPercent.toLocaleString()}%
                </p>
                <p className="text-xs text-subtle">
                  {catalogueRecovery.data.complete
                    ? "Verified complete"
                    : `${catalogueRecovery.data.phase} · ${catalogueRecovery.data.batchesCompleted} batches`}
                </p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${catalogueRecovery.data.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-fg">
              All-source fixture bulk run
            </h2>
            <p className="max-w-2xl text-sm text-muted">
              Add every registered website to one resumable run. Approved sources enter the crawler
              queue; sources awaiting rights or technical review remain visible but cannot run or
              publish.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild type="button" variant="secondary">
              <Link to="/admin/result-links">Import results links</Link>
            </Button>
            <Button asChild type="button" variant="secondary">
              <Link to="/admin/sources">View and review sources</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={dbStatus.data?.persistent !== true || bulkRunMut.isPending}
            onClick={() => bulkRunMut.mutate()}
          >
            {bulkRunMut.isPending ? "Preparing run…" : "Add all websites to bulk run"}
          </Button>
          <p className="text-xs text-subtle">
            Review held sources before enabling them. Creating a run never bypasses rights or
            technical checks.
          </p>
        </div>

        {bulkRun.isLoading && <p className="text-sm text-muted">Loading source registry…</p>}
        {bulkRun.data && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-subtle">Registered</p>
                <p className="mt-1 text-2xl font-semibold tabular text-fg">
                  {bulkRun.data.registry.sources.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 p-3">
                <p className="text-xs uppercase tracking-wide text-emerald-800">Runnable now</p>
                <p className="mt-1 text-2xl font-semibold tabular text-emerald-950">
                  {bulkRun.data.registry.runnable.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-3">
                <p className="text-xs uppercase tracking-wide text-amber-800">Held for review</p>
                <p className="mt-1 text-2xl font-semibold tabular text-amber-950">
                  {bulkRun.data.registry.blocked.toLocaleString()}
                </p>
              </div>
            </div>

            {bulkRun.data.latestRun && (
              <div className="rounded-lg border border-border bg-bg px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-fg">Latest run</p>
                  <Badge variant="accent">{bulkRun.data.latestRun.status}</Badge>
                </div>
                <p className="mt-1 text-muted">
                  {bulkRun.data.latestRun.totalJobs.toLocaleString()} unique source jobs ·{" "}
                  {(bulkRun.data.latestRun.jobsByStatus.queued ?? 0).toLocaleString()} queued ·{" "}
                  {(bulkRun.data.latestRun.jobsByStatus.blocked ?? 0).toLocaleString()} blocked
                </p>
                <p className="mt-1 text-xs text-subtle">
                  Requested {new Date(bulkRun.data.latestRun.requestedAt).toLocaleString()}
                </p>
              </div>
            )}

            <p className="text-xs text-subtle">
              Covers {bulkRun.data.registry.countries.length.toLocaleString()} country or territory
              labels across {bulkRun.data.registry.regions.length.toLocaleString()} regional scopes.
              Duplicate source IDs are prevented by the database. Race candidates must still pass
              staging, provenance and race/edition duplicate checks before publication.
            </p>
          </div>
        )}
        {dbStatus.data && !dbStatus.data.persistent && (
          <p className="text-sm text-amber-900">
            Connect Neon before creating a bulk run so its queue survives server restarts.
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-fg">
              Collected fixture workbook
            </h2>
            <p className="max-w-2xl text-sm text-muted">
              Stage all 5,315 collected editions in one audited batch, check the live catalogue for
              duplicates, then atomically publish only candidates with approved sources, required
              fields and no open high-priority review issues.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild type="button" variant="secondary">
              <Link to="/admin/fixture-review">Review pending fixtures</Link>
            </Button>
            <Button
              type="button"
              disabled={dbStatus.data?.persistent !== true || workbookImportMut.isPending}
              onClick={() => workbookImportMut.mutate()}
            >
              {workbookImportMut.isPending
                ? "Uploading and checking…"
                : "Upload collected events now"}
            </Button>
          </div>
        </div>

        {workbookImport.isLoading && <p className="text-sm text-muted">Loading import status…</p>}
        {workbookImport.data && (
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-elevated p-3">
              <p className="text-xs uppercase tracking-wide text-subtle">Staged</p>
              <p className="mt-1 text-2xl font-semibold tabular text-fg">
                {workbookImport.data.stagedCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-800">Published events</p>
              <p className="mt-1 text-2xl font-semibold tabular text-emerald-950">
                {workbookImport.data.publishedEventCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-sky-500/30 bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-wide text-sky-800">Duplicates</p>
              <p className="mt-1 text-2xl font-semibold tabular text-sky-950">
                {workbookImport.data.duplicateCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-800">Held for review</p>
              <p className="mt-1 text-2xl font-semibold tabular text-amber-950">
                {workbookImport.data.blockedCount.toLocaleString()}
              </p>
            </div>
          </div>
        )}
        <p className="text-xs text-subtle">
          Re-running is safe: published rows are retained and exact catalogue matches are classified
          as duplicates instead of inserted again. The workbook payload is server-only and is not
          downloaded by public visitors.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-fg">1. Go live (publish)</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>
            In this Grok chat, use <strong className="text-fg">Publish</strong> so the app deploys
            to a public URL (Vercel).
          </li>
          <li>
            Optional: attach your domain (e.g. athrecs.com) in the host’s domain settings after the
            first successful publish.
          </li>
          <li>
            For lasting multi-user data, set a Postgres{" "}
            <code className="rounded bg-elevated px-1 text-xs">DATABASE_URL</code> (Neon) on the
            deployment — otherwise each serverless cold start can reset to the built-in seed + this
            session’s imports.
          </li>
        </ol>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-fg">
            2. Grok extract → paste JSON
          </h2>
          <Button type="button" variant="secondary" onClick={() => void copyPrompt()}>
            {copied ? "Copied" : "Copy Grok prompt"}
          </Button>
        </div>
        <p className="text-sm text-muted">
          Open a new Grok chat, paste the prompt, add a race URL or fixture list, then paste Grok’s
          JSON below and import.
        </p>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={10}
          placeholder='{"events":[…],"editions":[…]}'
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
        <Button
          type="button"
          disabled={!json.trim() || jsonMut.isPending}
          onClick={() => jsonMut.mutate()}
        >
          {jsonMut.isPending ? "Importing…" : "Import Grok JSON"}
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-fg">3. CSV bulk import</h2>
        <p className="text-sm text-muted">
          Header row required. One row per race-day (distance). Same event name groups into one
          series with multiple editions.
        </p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
        <Button
          type="button"
          disabled={!csv.trim() || csvMut.isPending}
          onClick={() => csvMut.mutate()}
        >
          {csvMut.isPending ? "Importing…" : "Import CSV"}
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-fg">
          4. Results import (append-only)
        </h2>
        <p className="text-sm text-muted">
          Paste {"{ results: [...] }"} JSON. Creates athletes/clubs as needed and upserts finish
          times against an existing edition. Does not wipe the seed.
        </p>
        <textarea
          value={resultsJson}
          onChange={(e) => setResultsJson(e.target.value)}
          rows={10}
          placeholder='{"results":[{"eventSlug":"run-norwich","date":"2025-09-07","distance":"10K","athleteName":"Example Runner","gender":"M","time":"49:30","place":1101}]}'
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
        <Button
          type="button"
          disabled={!resultsJson.trim() || resultsMut.isPending}
          onClick={() => resultsMut.mutate()}
        >
          {resultsMut.isPending ? "Importing results…" : "Import results JSON"}
        </Button>
      </section>

      {message && (
        <p className="rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent">
          {message}
        </p>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-fg">
            Catalogue ({cards.data?.length ?? "…"} events)
          </h2>
          <Link
            to="/races"
            className="text-sm font-medium text-accent no-underline hover:underline"
          >
            View public Events
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Sport</th>
                <th className="px-3 py-2 font-medium">City</th>
                <th className="px-3 py-2 font-medium">Editions</th>
                <th className="px-3 py-2 font-medium">Latest date</th>
              </tr>
            </thead>
            <tbody>
              {(cards.data ?? []).slice(0, 40).map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Link
                      to="/races/$slug"
                      params={{ slug: e.slug }}
                      className="font-medium text-fg no-underline hover:text-accent"
                    >
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="accent">{e.sport}</Badge>
                  </td>
                  <td className="px-3 py-2 text-muted">{e.city}</td>
                  <td className="px-3 py-2 tabular text-muted">{e.edition_count}</td>
                  <td className="px-3 py-2 tabular text-muted">{e.next_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">Public listing preview</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {previewCards.map((race) => (
            <RaceCard key={race.id} race={race} />
          ))}
        </div>
      </section>
    </div>
  );
}
