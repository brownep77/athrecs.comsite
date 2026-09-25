import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { checkRaceUpload } from "@/lib/staff-results-upload/api";
import type { TimingBasis } from "@/lib/staff-results-upload/core";
export const Route = createFileRoute("/admin/check-results-upload")({
  head: () => ({ meta: [{ title: "Check race upload | ATHRECS Staff" }, { name: "robots", content: "noindex, nofollow, noarchive" }] }),
  component: CheckResultsUpload,
});
type Review = Awaited<ReturnType<typeof checkRaceUpload>>;
const field = "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm";
function CheckResultsUpload() {
  const [file, setFile] = useState<{ filename: string; content: string } | null>(null);
  const [eventName, setEventName] = useState("Marriott's Way 10k");
  const [date, setDate] = useState("2026-09-20");
  const [distance, setDistance] = useState("10K");
  const [distanceKm, setDistanceKm] = useState("10");
  const [sourceUrl, setSourceUrl] = useState("https://totalracetiming.co.uk/raceresults/706");
  const [timingBasis, setTimingBasis] = useState<TimingBasis>("chip");
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const [filter, setFilter] = useState("review");
  function reset() { setReview(null); setMessage(""); }
  async function choose(f: File | undefined) {
    reset(); setFile(null); if (!f) return;
    if (f.size > 2000000 || !/\.(csv|xlsx)$/i.test(f.name)) { setMessage("Choose a CSV or single-sheet .xlsx file, up to 2 MB."); return; }
    setBusy(true);
    try {
      const content = /\.csv$/i.test(f.name) ? await f.text() : await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onerror = () => reject(new Error("The workbook could not be read."));
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.readAsDataURL(f);
      });
      setFile({ filename: f.name, content });
    } catch (e) { setMessage(e instanceof Error ? e.message : "File could not be read."); }
    finally { setBusy(false); }
  }
  async function check() {
    if (!file) return; setBusy(true); reset();
    try {
      const result = await checkRaceUpload({ data: { ...file, eventName, date, distance, distanceKm: Number(distanceKm), sourceUrl, timingBasis } });
      setReview(result); setFilter(result.summary.review || result.summary.blocked ? "review" : "all");
      setMessage("Check complete. No athletes or results were added, changed or published.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "The live check failed; nothing was imported."); }
    finally { setBusy(false); }
  }
  function saveReview() {
    if (!review) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify({ eventName, date, distance, sourceUrl, timingBasis, ...review }, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `athrecs-duplicate-review-${date}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const visible = review?.rows.filter(r => filter === "all" || (filter === "review" ? r.state === "review" || r.state === "blocked" : r.state === filter)) ?? [];
  return <div className="space-y-5">
    <header className="space-y-2"><h1 className="font-display text-3xl font-semibold">Check race upload</h1>
      <p className="max-w-3xl text-sm text-muted">Upload your original Excel or CSV results. Check the complete live athlete directory for possible duplicates in one pass, including private and account-managed profiles.</p>
      <p className="rounded-lg border border-border bg-surface p-3 text-sm"><strong>Read-only check.</strong> This screen does not import or publish. A possible match is not an instruction to merge. Source format errors and uncertain identities stay separate.</p>
    </header>
    <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">1. Choose your race file</h2>
      <input aria-label="Choose Excel or CSV race results" type="file" accept=".csv,.xlsx" disabled={busy} onChange={e => void choose(e.target.files?.[0])} className="block max-w-full text-sm" />
      <p className="text-xs text-muted">Original Total Race Timing CSV exports work here, including filter text embedded in their headings. Excel files need one results sheet, with a header row and values rather than formulas.</p>
      {file ? <p className="text-sm font-medium">Selected: {file.filename}</p> : null}
    </section>
    <fieldset disabled={busy} className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <legend className="px-1 text-xl font-semibold">2. Confirm race details</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">Race name<input className={field} value={eventName} onChange={e => {reset();setEventName(e.target.value);}} /></label>
        <label className="space-y-1 text-sm">Race date<input type="date" className={field} value={date} onChange={e => {reset();setDate(e.target.value);}} /></label>
        <label className="space-y-1 text-sm">Distance label<input className={field} value={distance} onChange={e => {reset();setDistance(e.target.value);}} /></label>
        <label className="space-y-1 text-sm">Distance in kilometres<input type="number" step="0.001" min="0.001" className={field} value={distanceKm} onChange={e => {reset();setDistanceKm(e.target.value);}} /></label>
        <label className="space-y-1 text-sm">Official race-results URL<input type="url" className={field} value={sourceUrl} onChange={e => {reset();setSourceUrl(e.target.value);}} /></label>
        <label className="space-y-1 text-sm">The file’s “Time” column means<select className={field} value={timingBasis} onChange={e => {reset();setTimingBasis(e.target.value as TimingBasis);}}><option value="chip">Chip time</option><option value="gun">Gun time</option><option value="unspecified">Unspecified finish time</option></select></label>
      </div>
      <Button onClick={() => void check()} disabled={!file || busy}>{busy ? "Checking source and live athletes…" : "Check source and duplicates"}</Button>
    </fieldset>
    {message ? <p role="status" className="rounded-lg border border-border bg-surface p-4 text-sm">{message}</p> : null}
    {review ? <section className="space-y-4">
      <h2 className="text-xl font-semibold">3. Review the exceptions together</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
        ["No existing match found",review.summary.new],["Possible existing profiles",review.summary.review],["Already imported",review.summary.duplicate],["Source or result conflicts",review.summary.blocked]
      ].map(([label,count]) => <div key={label} className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-3xl font-semibold">{count}</p></div>)}</div>
      <p className="text-sm text-muted">{review.summary.total} uploaded rows checked against {review.summary.identitiesChecked} live identity records. {review.sourceRows} rows are present in the official race table. No-match entries are proposals, not verified new identities.</p>
      <div className="flex flex-wrap items-center gap-3"><label className="text-sm">Show <select className="ml-2 rounded border border-border bg-surface p-2" value={filter} onChange={e=>setFilter(e.target.value)}><option value="review">Possible duplicates and conflicts</option><option value="new">No existing match found</option><option value="duplicate">Already imported</option><option value="all">All rows</option></select></label><Button variant="secondary" onClick={saveReview}>Download staff review</Button></div>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full min-w-[48rem] text-left text-sm"><thead><tr>{["Bib","Runner","Chip / finish","Race club or team","Review","Existing candidates"].map(h=><th className="border-b border-border p-3" key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(r=><tr key={r.index} className="border-b border-border"><td className="p-3">{r.bib}</td><td className="p-3 font-medium">{r.name}</td><td className="p-3 tabular-nums">{r.chipText || r.timeText || r.gunText}</td><td className="max-w-60 p-3">{r.club || "Not supplied"}</td><td className="max-w-64 p-3"><strong>{r.state}</strong><p>{r.note}</p></td><td className="p-3">{r.candidates.map((c,i)=><p key={`${c.id}-${i}`} className="mb-2">{c.name} · {c.club || "Club not supplied"}{c.managed ? " · Account managed" : ""} · {c.visibility}</p>)}</td></tr>)}</tbody></table>{!visible.length ? <p className="p-6 text-sm">No rows in this group.</p> : null}</div>
      <p className="text-sm text-muted">The downloaded review is staff-only and is not an import file. Decimal source times are preserved. No dates of birth, nationality or residence are inferred.</p>
    </section> : null}
  </div>;
}
