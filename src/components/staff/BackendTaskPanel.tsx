import { useState } from "react";
import { ArrowRight, Search, LayoutGrid } from "lucide-react";

const backendTasks = [
  { title: "Import athletes & race results", group: "Athletes & results", path: "/admin/check-results-upload", description: "Upload Excel or CSV, check existing athletes, select clear entries together, then confirm publication.", keywords: "upload spreadsheet chip gun duplicate duplicates matching Marriott" },
  { title: "Find and manage athletes", group: "Athletes & results", path: "/admin/athlete-directory", description: "Search public and private profiles, open an athlete, export the directory or review visibility changes.", keywords: "athlete directory profile edit public private bulk export" },
  { title: "Import history & race coverage", group: "Athletes & results", path: "/admin/result-archive", description: "See ingestion runs, race coverage and recorded import outcomes. Check what was actually saved.", keywords: "results archive receipts batches errors" },
  { title: "Import official results-page links", group: "Races & sources", path: "/admin/result-links", description: "Add official results-page URLs to existing race editions from CSV. This tool adds links, not runners or finish times; use the athlete/results importer for those.", keywords: "results links csv provider race edition source urls" },
  { title: "Review result claims", group: "Athletes & results", path: "/admin/result-claims", description: "Review submitted claims before linking results to the correct athlete.", keywords: "claims claim approval ownership" },
  { title: "Manage athlete accounts", group: "Athletes & results", path: "/admin/athlete-accounts", description: "Review athlete accounts and their profile connections without changing access from this panel.", keywords: "account user owner private verification" },
  { title: "Club athlete scans & review", group: "Athletes & results", path: "/admin/club-scanner", description: "Open club scans and their evidence-review queue; review uncertain identities separately.", keywords: "running club scan discovery hourly athletes uncertain" },
  { title: "Collect race listings", group: "Races & sources", path: "/admin/race-collector", description: "Review discovered events and use the collector's keep, dismiss and publishing controls.", keywords: "race collector events entries keep dismiss" },
  { title: "Review race fixtures", group: "Races & sources", path: "/admin/fixture-review", description: "Inspect fixture information and review proposed race-calendar updates.", keywords: "fixtures event dates distance venue review" },
  { title: "Publish reviewed catalogue changes", group: "Races & sources", path: "/admin/catalogue-publishing", description: "Open the catalogue publication tool to review and apply its approved changes.", keywords: "catalogue publish publication approve" },
  { title: "Manage source records", group: "Races & sources", path: "/admin/sources", description: "Open the source register used by the existing collection and review tools.", keywords: "sources timing provider organiser provenance" },
  { title: "Other imports & database status", group: "Maintenance & data", path: "/admin#legacy-admin-tools", description: "Use the existing dashboard below for database status, race-list imports and other legacy tools. Runner times belong in the dedicated results importer.", keywords: "database status csv json bulk scraper workbook legacy" },
  { title: "Data & analytics", group: "Maintenance & data", path: "/admin/data-intelligence", description: "Open the existing data-intelligence and analysis workspace.", keywords: "analytics reports coverage statistics data" },
  { title: "Catalogue recovery", group: "Maintenance & data", path: "/admin/catalogue-recovery-emergency", description: "Advanced recovery tools. Inspect the problem and the proposed operation before confirming any change.", keywords: "recovery restore repair advanced emergency", advanced: true },
  { title: "Sponsorship enquiries", group: "Business & network", path: "/admin/sponsorship", description: "Review sponsorship enquiries in the staff workspace.", keywords: "sponsors sponsorship enquiries brands" },
  { title: "Partnerships", group: "Business & network", path: "/admin/partnerships", description: "Open the partnership administration workspace.", keywords: "partners business collaborations" },
  { title: "Network administration", group: "Business & network", path: "/admin/network", description: "Open existing cross-site network administration tools and review their scope before making changes.", keywords: "network sites sportsrecs management" },
] as const;

export function BackendTaskPanel() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All tasks");
  const groups = ["All tasks", ...new Set(backendTasks.map(task => task.group))];
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const visible = backendTasks.filter(task => (group === "All tasks" || task.group === group)
    && terms.every(term => `${task.title} ${task.description} ${task.keywords}`.toLocaleLowerCase().includes(term)));

  return <section id="backend-tasks" aria-labelledby="backend-tasks-heading" className="mb-10 min-w-0 scroll-mt-6 space-y-5">
    <header className="rounded-2xl border border-cyan-200 bg-white p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-800"><LayoutGrid className="size-4" aria-hidden="true" />ATHRECS Staff</p>
          <h1 id="backend-tasks-heading" className="font-display text-3xl font-semibold text-slate-950">What would you like to do?</h1>
          <p className="text-sm leading-6 text-slate-600">All existing main backend tools, in one place. Choose a task below; you do not need to remember which staff section contains it.</p>
        </div>
        <a href="/admin/check-results-upload" className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-cyan-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-800">Import athletes & results<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></a>
      </div>
      <p className="mt-5 rounded-lg bg-cyan-50 p-3 text-sm leading-6 text-cyan-950"><strong>Adding runners from a race?</strong> Use the results importer. It checks duplicates, creates selected new profiles and adds their results after approval. Possible matches stay separate; this panel does not import or publish anything by itself.</p>
    </header>
    <div className="space-y-3">
      <label htmlFor="backend-task-search" className="block text-sm font-semibold text-slate-800">Find a backend task</label>
      <div className="relative max-w-2xl"><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-500" aria-hidden="true" /><input id="backend-task-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try import, athlete, duplicates, claims or sources" className="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm" /></div>
      <div aria-label="Task categories" className="flex flex-wrap gap-2">{groups.map(item => <button type="button" key={item} aria-pressed={item === group} onClick={() => setGroup(item)} className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium ${item === group ? "border-cyan-800 bg-cyan-800 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-cyan-700"}`}>{item}</button>)}</div>
      <p role="status" aria-live="polite" className="text-sm text-slate-600">Showing {visible.length} of {backendTasks.length} tools.</p>
    </div>
    <div aria-label="Backend tasks" className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(task => <article key={task.path} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold text-cyan-800">{task.group}{"advanced" in task && task.advanced ? " · Advanced" : ""}</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">{task.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{task.description}</p>
      <a href={task.path} aria-label={`Open ${task.title}`} className="mt-4 inline-flex min-h-10 items-center gap-2 self-start rounded-md py-2 pr-2 text-sm font-semibold text-cyan-900 underline underline-offset-4 hover:text-cyan-700">Open tool<ArrowRight className="size-4" aria-hidden="true" /></a>
    </article>)}</div>
    {!visible.length ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm"><p>No task matches this search.</p><button type="button" className="mt-2 min-h-10 font-semibold text-cyan-900 underline" onClick={() => { setQuery(""); setGroup("All tasks"); }}>Show all tasks</button></div> : null}
    <details className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><summary className="cursor-pointer font-semibold text-slate-700">Requested tools not available yet</summary><p className="mt-3 leading-6 text-slate-600">The structured evidence-for-and-against panel and a Power of 10 paste-and-review tool have not been implemented. They are not presented here as working import options.</p></details>
    <p className="text-xs leading-5 text-slate-500">Links open the existing staff tools. Existing authentication, ownership restrictions and confirmation steps still apply. The legacy dashboard continues below.</p>
  </section>;
}
