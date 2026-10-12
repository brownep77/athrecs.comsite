import { useState, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Download, Search, RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getEventRegister,
  getEventRegisterDetail,
  saveEventHistory,
  addEventContact,
} from "@/lib/event-register/api";
import {
  registerFilters,
  csvCell,
  safeExternalUrl,
  type RegisterFilters,
} from "@/lib/event-register/core";
import type { RegisterRow } from "@/lib/event-register/service.server";

export const Route = createFileRoute("/admin/event-register")({
  head: () => ({
    meta: [
      { title: "Running event register — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: EventRegister,
});
const control =
  "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950";
const box = "rounded-xl border border-slate-200 bg-white p-5";
const number = (n: number) => n.toLocaleString("en-GB");
const val = (r: Record<string, unknown>, key: string) => (r[key] == null ? "" : String(r[key]));
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
function External({ url, children }: { url: string | null | undefined; children: ReactNode }) {
  const href = safeExternalUrl(url);
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-cyan-800 underline underline-offset-2"
    >
      {children}
    </a>
  ) : (
    <span className="text-slate-500">Not recorded</span>
  );
}
function exportPage(rows: RegisterRow[]) {
  const columns: (keyof RegisterRow)[] = [
    "id",
    "name",
    "sport",
    "country",
    "county",
    "city",
    "surface",
    "organiser",
    "website",
    "source_url",
    "known_years",
    "edition_count",
    "earliest_date",
    "latest_date",
    "first_year",
    "final_year",
    "lifecycle",
    "contact_count",
    "result_editions",
    "linked_results",
    "archive_editions",
    "results_link_editions",
    "publications",
    "priority",
    "next_check",
  ];
  const lines = [
    columns.map(csvCell).join(","),
    ...rows.map((row) =>
      columns
        .map((key) =>
          csvCell(Array.isArray(row[key]) ? (row[key] as number[]).join("; ") : row[key]),
        )
        .join(","),
    ),
  ];
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "athrecs-running-register-page.csv";
  a.click();
  URL.revokeObjectURL(url);
}
function EventRegister() {
  const [filters, setFilters] = useState<RegisterFilters>(registerFilters.parse({}));
  const [draft, setDraft] = useState(filters);
  const [selected, setSelected] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["event-register", filters],
    queryFn: () => getEventRegister({ data: filters }),
    staleTime: 60000,
  });
  const data = query.data;
  const apply = (e: FormEvent) => {
    e.preventDefault();
    setFilters({ ...draft, page: 0 });
  };
  const update = (key: keyof RegisterFilters, value: string | number | null) =>
    setDraft({ ...draft, [key]: value });
  return (
    <div className="space-y-6 text-slate-900">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-800">
            <Database className="size-4" />
            AthRecs catalogue
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Running event register</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Running, parkrun, obstacle running and identifiable running disciplines within
            athletics. Explore the editions we hold, what has been collected and what to find next.
            All running fixtures already in the catalogue are included automatically.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </header>
      {data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[
            ["Events", data.summary.events],
            ["Dated races", data.summary.editions],
            ["parkrun events", data.summary.parkruns],
            ["Countries", data.summary.countries],
            ["Races with linked results", data.summary.result_editions],
            ["Races with archived rows", data.summary.archive_editions],
          ].map(([label, n]) => (
            <div key={label} className={box}>
              <p className="text-xs text-slate-600">{label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{number(Number(n))}</p>
            </div>
          ))}
        </div>
      ) : null}
      <form onSubmit={apply} className={`${box} space-y-4`} aria-label="Filter running register">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Field label="Event, organiser or place">
            <input
              className={control}
              type="search"
              value={draft.q}
              onChange={(e) => update("q", e.target.value)}
              placeholder="Search the catalogue"
            />
          </Field>
          <Field label="Running category">
            <select
              className={control}
              value={draft.sport}
              onChange={(e) => update("sport", e.target.value)}
            >
              {["All", "Running", "Parkrun", "Athletics", "OCR"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Country">
            <select
              className={control}
              value={draft.country}
              onChange={(e) => update("country", e.target.value)}
            >
              <option value="">All countries</option>
              {data?.facets.countries.filter(Boolean).map((x) => (
                <option key={x} value={x}>
                  {x === "United Kingdom" ? "United Kingdom (all home nations)" : x}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Recorded surface">
            <select
              className={control}
              value={draft.surface}
              onChange={(e) => update("surface", e.target.value)}
            >
              <option value="">All surfaces</option>
              {data?.facets.surfaces.filter(Boolean).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Edition year">
            <input
              className={control}
              type="number"
              min="1800"
              max="2200"
              placeholder="All years"
              value={draft.year ?? ""}
              onChange={(e) => update("year", e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
          <Field label="Collection view">
            <select
              className={control}
              value={draft.gap}
              onChange={(e) => update("gap", e.target.value)}
            >
              {Object.entries({
                all: "All records",
                "no-editions": "No dated editions",
                "no-results": "No collected result rows",
                "results-found": "Results or links held",
                "no-contacts": "Contact details missing",
                "no-organiser": "Organiser missing",
                history: "History needs research",
              }).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">
            <Search className="size-4" />
            Apply filters
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const empty = registerFilters.parse({});
              setDraft(empty);
              setFilters(empty);
            }}
          >
            Reset
          </Button>
          <span className="text-xs text-slate-500">
            Counts reflect applied filters. Each date and distance is a separate dated race.
          </span>
        </div>
      </form>
      {query.isLoading ? (
        <p role="status">Loading the running catalogue…</p>
      ) : query.isError ? (
        <div role="alert" className={box}>
          The register could not load.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-slate-600">
              Showing {number(data.rows.length ? data.page * 50 + 1 : 0)}–
              {number(data.rows.length ? data.page * 50 + data.rows.length : 0)} of{" "}
              {number(data.summary.events)} matching events · {number(data.summary.no_contacts)}{" "}
              without contact details · {number(data.summary.history_missing)} needing history
              research
            </p>
            <Button
              variant="secondary"
              onClick={() => exportPage(data.rows)}
              disabled={!data.rows.length}
            >
              <Download className="size-4" />
              Export this page
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Running event register with edition and results coverage
              </caption>
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  {[
                    "Event / place",
                    "Type / surface",
                    "Editions held",
                    "Results coverage",
                    "Organiser / contacts",
                    "Event history",
                    "Publication record",
                  ].map((x) => (
                    <th key={x} className="px-4 py-3">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-slate-100 align-top hover:bg-cyan-50/40"
                  >
                    <td className="min-w-56 px-4 py-4">
                      <button
                        onClick={() => setSelected(r.id)}
                        className="text-left font-semibold text-cyan-900 underline underline-offset-2"
                      >
                        {r.name}
                      </button>
                      <p className="mt-1 text-xs text-slate-500">
                        {[r.city, r.county, r.country].filter(Boolean).join(", ")}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">Event {r.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      {r.sport}
                      <p className="mt-1 text-xs text-slate-500">
                        {r.surface || "Surface unknown"}
                      </p>
                    </td>
                    <td className="min-w-40 px-4 py-4">
                      <strong>{number(r.edition_count)}</strong> dated races
                      <p className="mt-1 text-xs text-slate-500">
                        {r.known_years.length ? r.known_years.join(", ") : "No years recorded"}
                      </p>
                    </td>
                    <td className="min-w-48 px-4 py-4">
                      <p>{number(r.result_editions)} races linked to athletes</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {number(r.linked_results)} linked results · {number(r.archive_editions)}{" "}
                        races with archived rows · {number(r.results_link_editions)} with source
                        links
                      </p>
                    </td>
                    <td className="min-w-44 px-4 py-4">
                      {r.organiser || "Organiser unknown"}
                      <p className="mt-1 text-xs text-slate-500">
                        {r.contact_count
                          ? `${r.contact_count} contact observations`
                          : "Contact details missing"}
                      </p>
                      <p className="mt-1 text-xs">
                        <External url={r.website}>Catalogue website</External>
                      </p>
                    </td>
                    <td className="min-w-44 px-4 py-4">
                      <span className="capitalize">{r.lifecycle}</span>
                      <p className="mt-1 text-xs text-slate-500">
                        First held: {r.first_year ?? "unknown"}
                        <br />
                        Final year: {r.final_year ?? "not confirmed"}
                      </p>
                    </td>
                    <td className="min-w-44 px-4 py-4 text-xs text-slate-600">
                      {r.publications || "Not recorded in publication register"}
                      <p className="mt-2">
                        Priority: {r.priority}
                        {r.next_check ? ` · Check ${r.next_check}` : ""}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.rows.length ? (
              <p className="p-6 text-sm text-slate-500">No events match these filters.</p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              disabled={!filters.page}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <p className="text-sm">
              Page {filters.page + 1} of {Math.max(1, Math.ceil(data.summary.events / 50))}
            </p>
            <Button
              variant="secondary"
              disabled={(filters.page + 1) * 50 >= data.summary.events}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="rounded-xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
            <strong>What these counts mean.</strong> Existing catalogue records are not newly
            verified. A results link is separate from stored rows; archived and athlete-linked rows
            can overlap. Missing future dates do not mean a race has ended. Publication records can
            be incomplete. Contacts and evidence stay in this staff workspace.
          </div>
        </>
      ) : null}
      {selected !== null ? (
        <EventDetail key={selected} eventId={selected} close={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function EventDetail({ eventId, close }: { eventId: number; close: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    sectionRef.current?.focus({ preventScroll: true });
  }, []);
  const [page, setPage] = useState(0),
    [year, setYear] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["event-register-detail", eventId, page, year],
    queryFn: () => getEventRegisterDetail({ data: { eventId, page, year } }),
  });
  const data = query.data;
  return (
    <section
      aria-label="Selected event details"
      ref={sectionRef}
      tabIndex={-1}
      className={`${box} space-y-5 border-cyan-600`}
    >
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-cyan-800">Event {eventId}</p>
          <h2 className="mt-1 text-2xl font-semibold">
            {data ? val(data.event, "name") : "Loading event…"}
          </h2>
        </div>
        <Button variant="secondary" onClick={close} aria-label="Close event details">
          <X className="size-4" />
        </Button>
      </div>
      {query.isError ? (
        <p role="alert">Event details could not load.</p>
      ) : data ? (
        <>
          <p className="text-sm leading-6 text-slate-600">
            {val(data.event, "summary") || "No event summary recorded."}
          </p>
          <div className="flex flex-wrap gap-5 text-sm">
            <External url={val(data.event, "website")}>Catalogue website</External>
            <External url={val(data.event, "source_url")}>Stored event source</External>
            <span>Website review: {val(data.event, "official_website_status") || "unknown"}</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <strong>Years represented in our catalogue: </strong>
            {data.years.map((r) => `${r.year} (${r.editions})`).join(" · ") || "None recorded"}
            <p className="mt-2 text-xs text-slate-500">
              These are known catalogue years, not proof of the first or final running of this
              event.
            </p>
          </div>
          <HistoryForm
            key={String(data.history[0]?.id ?? 0)}
            eventId={eventId}
            latest={data.history[0] ?? {}}
          />
          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer font-semibold">
              Contact details and organiser history ({data.contacts.length})
            </summary>
            <p className="my-3 text-sm text-slate-600">
              Record published organiser/business contacts with their source. Historical and future
              contacts have their own date ranges; a previous contact is never silently replaced.
            </p>
            {data.contacts.map((c) => (
              <article key={val(c, "id")} className="my-3 rounded-lg bg-slate-50 p-3 text-sm">
                <strong>{val(c, "organiser")}</strong> · {val(c, "period")} ·{" "}
                {val(c, "from_year") || "?"}–{val(c, "to_year") || "?"}
                <p>
                  {[
                    val(c, "contact_name"),
                    val(c, "email"),
                    val(c, "phone"),
                    val(c, "postal_address"),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-1">
                  <External url={val(c, "contact_url")}>Contact page</External> ·{" "}
                  <External url={val(c, "source_url")}>Source</External> · Checked{" "}
                  {val(c, "checked_on")}
                </p>
                <p className="mt-1 text-slate-600">{val(c, "note")}</p>
              </article>
            ))}
            <ContactForm eventId={eventId} organiser={val(data.event, "organiser")} />
          </details>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-lg font-semibold">Dated races and result coverage</h3>
            <Field label="Show edition year">
              <select
                className={control}
                value={year ?? ""}
                onChange={(e) => {
                  setYear(e.target.value ? Number(e.target.value) : null);
                  setPage(0);
                }}
              >
                <option value="">All years</option>
                {data.years.map((r) => (
                  <option key={r.year}>{r.year}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {[
                    "Date / distance",
                    "Fixture status",
                    "Athlete-linked results",
                    "Archive datasets",
                    "Evidence links",
                  ].map((x) => (
                    <th key={x} className="border-b p-3">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.editions.map((ed) => {
                  const datasets = ed.datasets as {
                    provider: string;
                    source_url: string;
                    expected_rows: number | null;
                    stored_rows: number;
                  }[];
                  const links = ed.result_links as {
                    provider: string;
                    url: string;
                    status: string;
                  }[];
                  return (
                    <tr key={val(ed, "id")} className="border-b align-top">
                      <td className="p-3">
                        {val(ed, "event_date")}
                        <br />
                        <strong>{val(ed, "distance_code")}</strong>
                        <p className="text-xs text-slate-500">Edition {val(ed, "id")}</p>
                      </td>
                      <td className="p-3">
                        {val(ed, "status")}
                        <p className="text-xs">{val(ed, "start_time") || "Start time unknown"}</p>
                      </td>
                      <td className="p-3">
                        {val(ed, "linked_results")} rows
                        <p className="text-xs text-slate-500">
                          Chip {val(ed, "chip_times")} · Gun {val(ed, "gun_times")} · Unspecified{" "}
                          {val(ed, "unspecified_times")}
                        </p>
                      </td>
                      <td className="p-3">
                        {datasets.length
                          ? datasets.map((d, i) => (
                              <p key={i} className="mb-2">
                                <External url={d.source_url}>{d.provider}</External>:{" "}
                                {number(d.stored_rows)} rows
                                <br />
                                <span className="text-xs text-slate-500">
                                  {d.expected_rows === null
                                    ? "Expected count unknown"
                                    : `Expected ${number(d.expected_rows)}; ${d.stored_rows === d.expected_rows ? "count matched (not independently verified)" : d.stored_rows < d.expected_rows ? "partial" : "count discrepancy"}`}
                                </span>
                              </p>
                            ))
                          : "No archive dataset"}
                      </td>
                      <td className="p-3">
                        <p>
                          <External url={val(ed, "source_url")}>Fixture source</External>
                        </p>
                        <p>
                          <External url={val(ed, "results_official_url")}>Results page</External>
                        </p>
                        {links.map((l, i) => (
                          <p key={i}>
                            <External url={l.url}>{l.provider}</External> ({l.status})
                          </p>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="secondary" disabled={!page} onClick={() => setPage(page - 1)}>
              Previous editions
            </Button>
            <span className="text-sm">
              {number(data.total)} dated races · page {page + 1}
            </span>
            <Button
              variant="secondary"
              disabled={(page + 1) * 50 >= data.total}
              onClick={() => setPage(page + 1)}
            >
              Next editions
            </Button>
          </div>
          {data.history.length > 1 ? (
            <details className="text-sm">
              <summary className="cursor-pointer">
                Previous history observations ({data.history.length - 1})
              </summary>
              {data.history.slice(1).map((h) => (
                <p className="mt-2" key={val(h, "id")}>
                  {val(h, "created_at")}: {val(h, "lifecycle")} · {val(h, "first_year") || "?"}–
                  {val(h, "final_year") || "?"} · {val(h, "note")} ·{" "}
                  <External url={val(h, "source_url")}>Source</External>
                </p>
              ))}
            </details>
          ) : null}
        </>
      ) : (
        <p role="status">Loading editions and contact history…</p>
      )}
    </section>
  );
}

function HistoryForm({ eventId, latest }: { eventId: number; latest: Record<string, unknown> }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMessage("");
    const text = (k: string) => String(f.get(k) || ""),
      year = (k: string) => (text(k) ? Number(text(k)) : null);
    try {
      await saveEventHistory({
        data: {
          eventId,
          expectedRevision: Number(latest.id ?? 0),
          firstYear: year("firstYear"),
          firstDate: text("firstDate") || null,
          finalYear: year("finalYear"),
          finalDate: text("finalDate") || null,
          lifecycle: text("lifecycle"),
          sourceUrl: text("sourceUrl"),
          checkedOn: text("checkedOn") || null,
          note: text("note"),
          priority: text("priority"),
          nextCheck: text("nextCheck") || null,
        },
      });
      setMessage("History observation saved.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["event-register"] }),
        qc.invalidateQueries({ queryKey: ["event-register-detail", eventId] }),
      ]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="rounded-lg border border-slate-200 p-4">
      <summary className="cursor-pointer font-semibold">
        Event lifespan and collection plan · {val(latest, "lifecycle") || "unknown"}
      </summary>
      <p className="my-3 text-sm text-slate-600">
        Enter first-ever and final years only when supported by evidence. Exact dates are optional.
        A final year means the event has ended, not simply that later editions are missing.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="First-ever year">
            <input
              className={control}
              name="firstYear"
              type="number"
              min="1800"
              max="2200"
              defaultValue={val(latest, "first_year")}
            />
          </Field>
          <Field label="First-ever date (if known)">
            <input
              className={control}
              name="firstDate"
              type="date"
              defaultValue={val(latest, "first_date")}
            />
          </Field>
          <Field label="Event status">
            <select
              className={control}
              name="lifecycle"
              defaultValue={val(latest, "lifecycle") || "unknown"}
            >
              {["unknown", "active", "paused", "ended"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Confirmed final year">
            <input
              className={control}
              name="finalYear"
              type="number"
              min="1800"
              max="2200"
              defaultValue={val(latest, "final_year")}
            />
          </Field>
          <Field label="Final race date (if known)">
            <input
              className={control}
              name="finalDate"
              type="date"
              defaultValue={val(latest, "final_date")}
            />
          </Field>
          <Field label="Evidence checked on">
            <input
              className={control}
              name="checkedOn"
              type="date"
              defaultValue={val(latest, "checked_on")}
            />
          </Field>
          <Field label="Evidence URL">
            <input
              className={control}
              name="sourceUrl"
              type="url"
              defaultValue={val(latest, "source_url")}
            />
          </Field>
          <Field label="Collection priority">
            <select
              className={control}
              name="priority"
              defaultValue={val(latest, "priority") || "normal"}
            >
              {["low", "normal", "high"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Next review date">
            <input
              className={control}
              name="nextCheck"
              type="date"
              defaultValue={val(latest, "next_check")}
            />
          </Field>
        </div>
        <Field label="Evidence and next action">
          <textarea
            className={control}
            name="note"
            rows={3}
            maxLength={3000}
            defaultValue={val(latest, "note")}
          />
        </Field>
        <Button disabled={busy}>{busy ? "Saving…" : "Save history / plan"}</Button>
        <p role="status" className="text-sm">
          {message}
        </p>
      </form>
    </details>
  );
}

function ContactForm({ eventId, organiser }: { eventId: number; organiser: string }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form);
    setBusy(true);
    setMessage("");
    const text = (k: string) => String(f.get(k) || "");
    try {
      await addEventContact({
        data: {
          eventId,
          organiser: text("organiser"),
          contactName: text("contactName"),
          email: text("email"),
          phone: text("phone"),
          contactUrl: text("contactUrl"),
          postalAddress: text("postalAddress"),
          period: text("period"),
          fromYear: text("fromYear") ? Number(text("fromYear")) : null,
          toYear: text("toYear") ? Number(text("toYear")) : null,
          sourceUrl: text("sourceUrl"),
          checkedOn: text("checkedOn"),
          note: text("note"),
        },
      });
      form.reset();
      setMessage("Contact observation saved.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["event-register"] }),
        qc.invalidateQueries({ queryKey: ["event-register-detail", eventId] }),
      ]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <h4 className="font-semibold">Add a sourced contact</h4>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Organiser">
          <input
            name="organiser"
            className={control}
            required
            defaultValue={organiser}
            maxLength={300}
          />
        </Field>
        <Field label="Contact name / department">
          <input name="contactName" className={control} maxLength={200} />
        </Field>
        <Field label="Contact period">
          <select className={control} name="period" defaultValue="unknown">
            {["unknown", "current", "historical", "future"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Published email">
          <input name="email" type="email" className={control} />
        </Field>
        <Field label="Published phone">
          <input name="phone" type="tel" className={control} maxLength={100} />
        </Field>
        <Field label="Contact page URL">
          <input name="contactUrl" type="url" className={control} />
        </Field>
        <Field label="Applies from year">
          <input name="fromYear" type="number" min="1800" max="2200" className={control} />
        </Field>
        <Field label="Applies through year">
          <input name="toYear" type="number" min="1800" max="2200" className={control} />
        </Field>
        <Field label="Source checked on">
          <input name="checkedOn" type="date" className={control} required />
        </Field>
        <Field label="Source URL">
          <input name="sourceUrl" type="url" className={control} required />
        </Field>
        <Field label="Published business address">
          <input name="postalAddress" className={control} maxLength={1000} />
        </Field>
        <Field label="Notes / historical context">
          <input name="note" className={control} maxLength={2000} />
        </Field>
      </div>
      <Button disabled={busy}>{busy ? "Saving…" : "Add contact observation"}</Button>
      <p role="status" className="text-sm">
        {message}
      </p>
    </form>
  );
}
