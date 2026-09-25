import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { checkRaceUpload, importCheckedRaceUpload, downloadResultsUploadTemplate } from "@/lib/staff-results-upload/api";
import type { UploadInput } from "@/lib/staff-results-upload/service.server";
import type { ImportDecision, ImportReceipt } from "@/lib/staff-results-upload/commit.server";

export const Route = createFileRoute("/admin/check-results-upload")({
  head: () => ({ meta: [{ title: "Import athletes & race results | ATHRECS Staff" }, { name: "robots", content: "noindex, nofollow, noarchive" }] }),
  component: ImportRaceResults,
});
type Review = Awaited<ReturnType<typeof checkRaceUpload>>;
const field = "h-11 min-w-0 w-full rounded-lg border border-border bg-white px-3 text-sm";
const action = "h-auto min-h-11 max-w-full whitespace-normal";
function download(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function readUploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const timer = setTimeout(() => reader.abort(), 20000);
    reader.onerror = () => { clearTimeout(timer); reject(new Error("The file could not be read. Choose it again from your device.")); };
    reader.onabort = () => { clearTimeout(timer); reject(new Error("Reading the file was interrupted. Choose it again from your device.")); };
    reader.onload = () => {
      clearTimeout(timer);
      const raw = String(reader.result ?? "");
      resolve(/\.csv$/i.test(file.name) ? raw : raw.split(",")[1] ?? "");
    };
    if (/\.csv$/i.test(file.name)) reader.readAsText(file); else reader.readAsDataURL(file);
  });
}
function ImportRaceResults() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ filename: string; content: string } | null>(null);
  const [fileError, setFileError] = useState("");
  const [details, setDetails] = useState<Omit<UploadInput,"filename"|"content">>({ eventName:"Marriott's Way 10k", date:"2026-09-20", distance:"10K", distanceKm:10, sourceUrl:"https://totalracetiming.co.uk/raceresults/706", timingBasis:"chip" });
  const [checkedInput, setCheckedInput] = useState<UploadInput | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(""), [message, setMessage] = useState("");
  const [filter, setFilter] = useState("review"), [search, setSearch] = useState("");
  const [choices, setChoices] = useState<Record<number,ImportDecision>>({});
  const [rights, setRights] = useState(false), [identities, setIdentities] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [receipt, setReceipt] = useState<ImportReceipt | null>(null);
  function reset() { setReview(null); setCheckedInput(null); setChoices({}); setRights(false); setIdentities(false); setReceipt(null); setMessage(""); }
  function edit(key: keyof typeof details, value: string | number) { reset(); setDetails(previous => ({...previous,[key]:value})); }
  function setSelection(next: Record<number,ImportDecision>) { setChoices(next); setIdentities(false); setRequestId(crypto.randomUUID()); }
  function chooseFile() { fileInput.current?.click(); }
  async function choose(f: File | undefined) {
    // Cancelling the picker must not clear a previously loaded file or review.
    if (!f || busy) return;
    reset(); setFile(null); setFileError("");
    if (!/\.(csv|xlsx)$/i.test(f.name)) { setFileError("This file type is not supported. Choose the original .csv export or a single-sheet .xlsx workbook, not JSON, PDF or .xls."); return; }
    if (f.size > 2000000) { setFileError("This file is larger than 2 MB. Choose a smaller CSV or single-sheet Excel workbook."); return; }
    if (!f.size) { setFileError("This file is empty. Choose the race-results export containing the runners and times."); return; }
    setBusy("file");
    try {
      const content = await readUploadFile(f);
      if (!content.trim()) throw new Error("This file is empty. Choose the race-results export containing the runners and times.");
      setFile({ filename:f.name, content });
      setMessage(`File ready: ${f.name}. Check the race details, then click Check source & duplicates. Nothing has been imported.`);
    } catch (error) { setFileError(error instanceof Error ? error.message : "File could not be read. Choose it again."); }
    finally { setBusy(""); }
  }
  async function template() {
    if (busy) return;
    setBusy("template");
    try { const result = await downloadResultsUploadTemplate(); download(Uint8Array.from(atob(result.base64), c => c.charCodeAt(0)), result.filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Template download failed."); }
    finally { setBusy(""); }
  }
  async function check() {
    if (busy) return;
    if (!file) { setMessage("First choose your Excel or CSV race-results file from your device. The race details alone do not contain any runners."); chooseFile(); return; }
    reset(); setBusy("check");
    try {
      const input = {...file,...details};
      const result = await checkRaceUpload({data:input});
      setReview(result); setCheckedInput(input); setRequestId(crypto.randomUUID());
      setFilter(result.summary.review || result.summary.blocked ? "review" : "new");
      setMessage("Checks complete. Select the entries in step 3, then use the import button in step 4. Nothing has been saved yet.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The check failed. Nothing was imported."); }
    finally { setBusy(""); }
  }
  function selectNew() {
    const next = {...choices};
    for (const row of review?.rows ?? []) if (row.state === "new") next[row.index] = { index:row.index, mode:"new", identityNote:"Staff-reviewed source entry with no possible identity match in the complete live directory." };
    setSelection(next); setFilter("new");
  }
  function toggleNew(index: number) {
    const next = {...choices};
    if (next[index]) delete next[index]; else next[index] = { index, mode:"new", identityNote:"Staff-reviewed source entry with no possible identity match in the complete live directory." };
    setSelection(next);
  }
  function link(index: number, value: string) {
    const next = {...choices};
    if (!value) delete next[index]; else next[index] = {index,mode:"link",athleteId:Number(value),identityNote:""};
    setSelection(next);
  }
  async function submit() {
    if (busy || receipt || !checkedInput || !review || !rights || !identities || !Object.keys(choices).length || Object.values(choices).some(c=>c.identityNote.trim().length<12)) return;
    setBusy("import"); setMessage("");
    try {
      const result = await importCheckedRaceUpload({data:{upload:checkedInput, reviewHash:review.reviewHash, requestId,
        decisions:Object.values(choices).sort((a,b)=>a.index-b.index), rightsConfirmed:true, identitiesConfirmed:true, confirmation:"IMPORT SELECTED RESULTS"}});
      setReceipt(result); setMessage("Import completed. The selected results are now stored on AthRecs.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import was not confirmed. Retry the same selection to retrieve its receipt, or check the file again before changing anything."); }
    finally { setBusy(""); }
  }
  const selected = Object.values(choices), newCount = selected.filter(c=>c.mode==='new').length;
  const invalidNotes = selected.some(c=>c.identityNote.trim().length<12);
  const visible = review?.rows.filter(row => (filter==="all" || filter==="selected" && Boolean(choices[row.index]) || filter==="review" && (row.state==="review" || row.state==="blocked") || row.state===filter) && (!search || `${row.name} ${row.bib} ${row.club}`.toLowerCase().includes(search.toLowerCase()))) ?? [];
  const readiness = busy === "import" ? "Saving your selected athletes and results. Do not submit the batch again."
    : busy === "file" ? "Reading your file. No athletes or results have been saved."
    : busy === "check" ? "Checking the source and existing profiles. No athletes or results have been saved."
    : busy ? "Finish the current action before importing."
    : !file ? "Choose your Excel or CSV file in step 1. The prefilled race details are not a results file."
    : !review || !checkedInput ? "Click Check source & duplicates in step 2 before importing."
    : !selected.length ? "Select entries in step 3. Use Select all without a match for the clear group; review possible matches separately."
    : invalidNotes ? "Add an identity-evidence note for each selected existing-profile match in step 3."
    : !rights || !identities ? "Read and tick both approval boxes below to enable the import button."
    : "Ready. Click the import button below to add only your selected athletes and race results.";
  const canImport = Boolean(file && review && checkedInput && selected.length && rights && identities && !invalidNotes && !busy && !receipt);
  return <div className="min-w-0 space-y-6">
    <header className="space-y-2"><h1 className="font-display text-3xl font-semibold">Import athletes & race results</h1>
      <p className="max-w-3xl text-sm text-muted">Choose a results file, check duplicates, select the entries together, then add them to Athletes and Results. Existing profiles are reused only when you confirm the identity.</p>
      <div className="space-y-2 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
        <p><strong>{receipt ? "Import complete." : "Next step:"}</strong> {receipt ? "Use your receipt below to open the published results." : readiness}</p>
        <p>You do not need to enter every runner separately. The import button is in step 4.</p>
        <a href={receipt ? "#import-receipt" : "#import-confirmation"} className="inline-block py-1 font-semibold underline">{receipt ? "View import receipt" : "Go to import step"}</a>
      </div>
    </header>
    <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-4 rounded-xl border border-cyan-300 bg-white p-5">
      <legend className="max-w-full px-1 text-xl font-semibold">1. Choose your results file</legend>
      <p className="text-sm">Choose the original race-results <strong>.csv</strong> or <strong>.xlsx</strong> file from your computer or phone. A file attached in ChatGPT is not automatically selected on this website.</p>
      <input ref={fileInput} aria-label="Choose Excel or CSV race results" aria-describedby="upload-file-state" type="file" accept=".csv,.xlsx" onChange={e=>{const chosen=e.target.files?.[0];e.target.value="";void choose(chosen);}} className="sr-only" />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" className={action} onClick={chooseFile}>{busy==='file' ? 'Reading your file…' : file ? 'Choose a different file' : 'Choose Excel or CSV file'}</Button>
        <p id="upload-file-state" className="break-all text-sm" aria-live="polite">{file ? `File ready: ${file.filename}` : busy==='file' ? 'Reading file…' : 'No results file selected yet.'}</p>
      </div>
      {fileError ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{fileError}</p> : null}
      <div className="flex flex-wrap items-center gap-3"><Button type="button" className={action} variant="secondary" onClick={()=>void template()}>Download blank Excel template</Button><p className="text-sm text-muted">Already have the timing provider’s export? Use that file; no template conversion is needed.</p></div>
      <p className="text-xs text-muted">One results sheet, up to 5,000 rows and 2 MB. Use values, not formulas. No JSON conversion is needed.</p>
    </fieldset>
    <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-4 rounded-xl border border-border bg-white p-5">
      <legend className="max-w-full px-1 text-xl font-semibold">2. Confirm the race and check duplicates</legend>
      <div className="grid min-w-0 gap-3 md:grid-cols-2">
        <label className="min-w-0 space-y-1 text-sm">Race name<input className={field} value={details.eventName} onChange={e=>edit('eventName',e.target.value)} /></label>
        <label className="min-w-0 space-y-1 text-sm">Race date<input type="date" className={field} value={details.date} onChange={e=>edit('date',e.target.value)} /></label>
        <label className="min-w-0 space-y-1 text-sm">Distance label<input className={field} value={details.distance} onChange={e=>edit('distance',e.target.value)} /></label>
        <label className="min-w-0 space-y-1 text-sm">Distance in kilometres<input type="number" min="0.001" step="0.0001" className={field} value={details.distanceKm} onChange={e=>edit('distanceKm',Number(e.target.value))} /></label>
        <label className="min-w-0 space-y-1 text-sm">Official race-results URL<input type="url" className={field} value={details.sourceUrl} onChange={e=>edit('sourceUrl',e.target.value)} /></label>
        <label className="min-w-0 space-y-1 text-sm">The file’s “Time” column means<select className={field} value={details.timingBasis} onChange={e=>edit('timingBasis',e.target.value)}><option value="chip">Chip time</option><option value="gun">Gun time</option><option value="unspecified">Unspecified finish time</option></select></label>
      </div>
      <Button type="button" className={action} onClick={()=>void check()} disabled={Boolean(busy)} aria-describedby="check-readiness">{busy==='check' ? "Checking source and live profiles…" : "Check source & duplicates"}</Button>
      <p id="check-readiness" className="text-sm font-medium">{busy==='file' ? 'Reading the selected file…' : !file ? 'No file selected: clicking this button opens the file chooser. Choose your results first, then click again to check.' : review ? 'Checks completed. Continue to steps 3 and 4 below.' : 'File ready. Click above to check the source and existing athletes.'}</p>
      <p className="text-xs text-muted">This check does not save anything. It compares the official race source and the live public/private directory, including account-managed profiles.</p>
    </fieldset>
    {message ? <p role="status" className="break-words rounded-lg border border-border bg-white p-4 text-sm">{message}</p> : null}
    {receipt ? <section id="import-receipt" className="min-w-0 scroll-mt-6 space-y-3 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950" aria-label="Import receipt"><h2 className="text-2xl font-semibold">Import complete</h2>
      <p>{receipt.createdProfiles} new public athlete profiles · {receipt.linkedProfiles} existing profiles reused · {receipt.importedResults} race results added.</p>
      <p className="break-words">{receipt.heldRows} unselected or already-imported rows were left unchanged. Receipt: {receipt.runId}.</p>
      <div className="flex flex-wrap gap-3"><Button asChild><a href={`https://www.athrecs.com${receipt.resultsPath}`}>View this race’s results</a></Button><Button asChild variant="secondary"><a href="https://www.athrecs.com/athletes">View Athletes</a></Button></div>
    </section> : <>
      <section id="review-entries" className="min-w-0 scroll-mt-6 space-y-4" aria-label="Select entries">
        <h2 className="text-xl font-semibold">3. Select the entries to add</h2>
        {!review ? <p className="rounded-xl border border-dashed border-border bg-white p-5 text-sm">Your runners and duplicate-check groups will appear here after step 2. Nothing has been imported.</p> : <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["No match found",review.summary.new],["Possible existing profiles",review.summary.review],["Already imported — skipped",review.summary.duplicate],["Conflicts — held",review.summary.blocked]].map(([label,count])=><div key={String(label)} className="min-w-0 rounded-xl border border-border bg-white p-4"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-3xl font-semibold">{count}</p></div>)}</div>
          <p className="text-sm text-muted">{review.summary.total} uploaded entries compared with {review.summary.identitiesChecked} live identity records. “No match” means no possible match was found, not proof of a person’s identity.</p>
          <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-3"><Button type="button" className={action} variant="secondary" onClick={selectNew} disabled={!review.summary.new}>Select all without a match ({review.summary.new})</Button><Button type="button" variant="secondary" onClick={()=>setSelection({})} disabled={!selected.length}>Clear selection</Button><strong className="self-center text-sm">{selected.length} selected</strong><a href="#import-confirmation" className="self-center py-2 text-sm font-semibold underline">Continue to import</a></div>
            <div className="flex min-w-0 flex-wrap gap-3"><label className="min-w-0 text-sm">Show <select className="ml-2 max-w-full rounded border border-border bg-white p-2" value={filter} onChange={e=>setFilter(e.target.value)}><option value="review">Possible matches & conflicts</option><option value="new">No match found</option><option value="selected">Selected entries</option><option value="duplicate">Already imported</option><option value="all">All rows</option></select></label><input className={`${field} max-w-sm`} aria-label="Search upload entries" placeholder="Search runner, bib or club" value={search} onChange={e=>setSearch(e.target.value)} /></div>
            <p className="text-xs text-muted">Showing {visible.length} entries. Scroll inside the table to review them; the import controls stay below the table.</p>
            <div role="region" aria-label="Race entries review table" tabIndex={0} className="max-h-[28rem] max-w-full overflow-auto rounded-xl border border-border bg-white"><table className="w-full min-w-[48rem] text-left text-sm"><thead className="sticky top-0 bg-white"><tr>{['Bib','Runner / race club','Chip / finish','Decision'].map(h=><th className="border-b border-border p-3" key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(row=><tr key={row.index} className="border-b border-border align-top">
              <td className="p-3">{row.bib}</td><td className="p-3"><strong>{row.name}</strong><p className="mt-1 max-w-64 text-xs text-muted">{row.club || 'Club not supplied'}</p></td><td className="whitespace-nowrap p-3 tabular-nums">{row.chipText || row.gunText || row.timeText}{row.chipText ? <span className="ml-2 text-xs">chip</span> : null}</td>
              <td className="min-w-80 p-3">{row.state==='new' ? <label className="flex items-start gap-2"><input type="checkbox" checked={Boolean(choices[row.index])} onChange={()=>toggleNew(row.index)} aria-label={`Create profile for ${row.name}`} /><span>Create a new public profile and add this result</span></label> : row.state==='review' ? <div className="space-y-2"><p className="text-xs text-muted">{row.note}</p><label className="block text-xs">Use an existing profile<select aria-label={`Match ${row.name}`} className={`${field} mt-1`} value={choices[row.index]?.athleteId ?? ''} onChange={e=>link(row.index,e.target.value)}><option value="">Hold — do not import this row yet</option>{row.candidates.map((c,i)=><option key={`${c.id}-${i}`} value={c.id ?? ''} disabled={!c.id || c.managed || c.visibility!=='public'}>{c.name} · {c.club || 'No club'} · {c.managed || c.visibility!=='public' ? 'Protected — owner review' : `Profile ${c.id}`}</option>)}</select></label>{choices[row.index]?.mode==='link' ? <label className="block text-xs">Why is this the same athlete?<input aria-label={`Identity evidence for ${row.name}`} className={`${field} mt-1`} placeholder="Record the identity evidence you checked" maxLength={1000} value={choices[row.index].identityNote} onChange={e=>setSelection({...choices,[row.index]:{...choices[row.index],identityNote:e.target.value}})} /></label> : null}</div> : <p className="text-sm">{row.state==='duplicate' ? 'Already imported — automatically skipped.' : `Held: ${row.note}`}</p>}</td>
            </tr>)}</tbody></table>{!visible.length ? <p className="p-5 text-sm">No entries in this group.</p> : null}</div>
          </fieldset>
        </>}
      </section>
      <fieldset id="import-confirmation" disabled={Boolean(busy)} className="min-w-0 scroll-mt-6 space-y-4 rounded-xl border border-cyan-300 bg-cyan-50 p-5 text-cyan-950">
        <legend className="max-w-full px-1 text-xl font-semibold">4. Import selected entries & publish</legend>
        <p id="import-readiness" role="status" className="rounded-lg border border-cyan-200 bg-white p-3 text-sm font-medium">{readiness}</p>
        {review ? <p><strong>{newCount} new public athlete profiles</strong> and <strong>{selected.length} race results</strong> will be added. {selected.length-newCount} existing public profiles will be reused without changing their profile details.</p> : <p className="text-sm">This is the import step. The button is available after the source check, entry selection and both approvals.</p>}
        <p className="text-sm">Only this selection is saved. Uncertain matches, existing results and protected profiles stay unchanged. This does not publish other race histories.</p>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" disabled={!review || !selected.length} checked={rights} onChange={e=>setRights(e.target.checked)} />I am authorised to import and publicly display these race results.</label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" disabled={!review || !selected.length} checked={identities} onChange={e=>setIdentities(e.target.checked)} />I have reviewed the selected new profiles and existing-profile matches and approve this selection.</label>
        <Button type="button" className={action} onClick={()=>void submit()} disabled={!canImport} aria-describedby="import-readiness">{busy==='import' ? 'Importing selected entries…' : `Import ${selected.length} selected & publish`}</Button>
        <p className="text-xs">The source and live matches are checked again before saving. Exact decimal times are retained; legacy numeric fields also retain their whole-second representation.</p>
      </fieldset>
    </>}
  </div>;
}
