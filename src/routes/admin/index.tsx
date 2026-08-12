// Results-import UI (section 4) — force Vercel rebuild 2026-08-12T05:11:23.244467Z
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDbStatus,
  importFromCsv,
  importFromJson,
  importResults,
  listAdminEventCards,
} from "@/lib/athrecs/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RaceCard } from "@/components/races/RaceCard";
import { listEvents } from "@/lib/athrecs/api";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

const GROK_PROMPT = `You are helping update ATHRECS.com (Norfolk endurance race directory).

From the race page URL or pasted fixture text below, extract events and editions.

Return ONLY valid JSON (no markdown) in this shape:
{
  "events": [
    {
      "name": "Example 10K",
      "sport": "Running",
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
      "source": "https://…"
    }
  ]
}

Rules:
- sport must be one of: Running, Athletics, Parkrun, TrackAndField, Cycling, Swimming, Triathlon, Duathlon, Aquathlon, Aquabike, Rowing, OCR
- status one of: Open, ClosingSoon, Closed, Finished, TBC
- dates must be YYYY-MM-DD
- Norfolk UK only unless clearly a border race runners attend
- Prefer official organiser/TRT dates

Source:
`;

const SAMPLE_CSV = `name,sport,city,date,distance,distance_km,status,start_time,website,organiser,surface,entry_url
Example Fun Run,Running,Norwich,2026-12-01,5K,5,Open,10:00,https://example.com,Local RC,Road,https://example.com/enter`;

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

  const preview = useQuery({
    queryKey: ["admin-preview-events"],
    queryFn: () => listEvents({ data: {} }),
  });

  const csvMut = useMutation({
    mutationFn: () => importFromCsv({ data: { csv } }),
    onSuccess: (r) => {
      setMessage(
        `CSV import: ${r.eventsUpserted} events, ${r.editionsUpserted} editions` +
          (r.errors.length ? ` · ${r.errors.length} error(s): ${r.errors.slice(0, 3).join("; ")}` : ""),
      );
      void qc.invalidateQueries();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const jsonMut = useMutation({
    mutationFn: () => importFromJson({ data: { json } }),
    onSuccess: (r) => {
      setMessage(
        `Grok JSON import: ${r.eventsUpserted} events, ${r.editionsUpserted} editions` +
          (r.errors.length ? ` · ${r.errors.length} error(s): ${r.errors.slice(0, 3).join("; ")}` : ""),
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
          (r.errors?.length ? ` · ${r.errors.length} error(s): ${r.errors.slice(0, 3).join("; ")}` : ""),
      );
      void qc.invalidateQueries();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const previewCards = useMemo(
    () => (preview.data ?? []).slice(0, 6),
    [preview.data],
  );

  async function copyPrompt() {
    await navigator.clipboard.writeText(GROK_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">
          Site tools
        </p>
        <h1 className="font-display text-2xl font-semibold text-fg md:text-3xl">
          Update ATHRECS with Grok
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Publish the site from the Grok App Builder, then keep fixtures fresh
          here: ask Grok to extract races, paste the JSON, or bulk-load a CSV.
          Live listings use the same Race cards as the public Events page.
        </p>
      </div>

      <section
        className={`space-y-3 rounded-xl border p-5 shadow-card ${
          dbStatus.data && !dbStatus.data.persistent
            ? "border-amber-500/50 bg-amber-50/80"
            : "border-border bg-surface"
        }`}
      >
        <h2 className="font-display text-lg font-semibold text-fg">
          Database status
        </h2>
        {dbStatus.isLoading && (
          <p className="text-sm text-muted">Checking database…</p>
        )}
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
              {dbStatus.data.results.toLocaleString()}, clubs{" "}
              {dbStatus.data.clubs.toLocaleString()}, events{" "}
              {dbStatus.data.events.toLocaleString()}, editions{" "}
              {dbStatus.data.editions.toLocaleString()}
            </p>
            {dbStatus.data.seedVersion && (
              <p className="text-xs text-subtle">
                Seed marker: {dbStatus.data.seedVersion}
              </p>
            )}
            {!dbStatus.data.persistent && (
              <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-100/80 px-3 py-3 text-amber-950">
                <p>
                  <strong>Data will not stick until Neon is connected.</strong>{" "}
                  This live site is still on in-memory PGLite — every cold start
                  can wipe imports.
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
                    Copy the <strong>pooled</strong> connection string
                    (starts with <code className="rounded bg-white/80 px-1 text-xs">postgresql://</code>)
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
                    → project for athrecs.com →{" "}
                    <strong>Settings → Environment Variables</strong>
                  </li>
                  <li>
                    Add{" "}
                    <code className="rounded bg-white/80 px-1 text-xs">DATABASE_URL</code>{" "}
                    = that string · Environment: <strong>Production</strong>{" "}
                    (and Preview if you want)
                  </li>
                  <li>
                    <strong>Redeploy</strong> (or Publish again from Grok), then
                    refresh this page — Backend should say{" "}
                    <em>Neon Postgres (persistent)</em>
                  </li>
                </ol>
                <p className="text-sm">
                  Or paste the connection string in chat and ask me to walk you
                  through the check — I cannot set Vercel env vars from here
                  without your Vercel access.
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

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-fg">
          1. Go live (publish)
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>
            In this Grok chat, use <strong className="text-fg">Publish</strong>{" "}
            so the app deploys to a public URL (Vercel).
          </li>
          <li>
            Optional: attach your domain (e.g. athrecs.com) in the host’s domain
            settings after the first successful publish.
          </li>
          <li>
            For lasting multi-user data, set a Postgres{" "}
            <code className="rounded bg-elevated px-1 text-xs">DATABASE_URL</code>{" "}
            (Neon) on the deployment — otherwise each serverless cold start can
            reset to the built-in seed + this session’s imports.
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
          Open a new Grok chat, paste the prompt, add a race URL or fixture
          list, then paste Grok’s JSON below and import.
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
        <h2 className="font-display text-lg font-semibold text-fg">
          3. CSV bulk import
        </h2>
        <p className="text-sm text-muted">
          Header row required. One row per race-day (distance). Same event name
          groups into one series with multiple editions.
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
          Paste {"{ results: [...] }"} JSON. Creates athletes/clubs as needed and
          upserts finish times against an existing edition. Does not wipe the seed.
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
                  <td className="px-3 py-2 tabular text-muted">
                    {e.next_date ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">
          Public listing preview
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {previewCards.map((race) => (
            <RaceCard key={race.id} race={race} />
          ))}
        </div>
      </section>
    </div>
  );
}
