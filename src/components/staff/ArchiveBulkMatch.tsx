import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { bulkMatchArchive, getArchiveOverview } from "@/lib/results-archive/api";

type Tier = "bridge" | "name_club" | "name_country";
type Totals = {
  scanned: number;
  linked: Record<Tier, number>;
  wouldLink: Record<Tier, number>;
  skipped: Record<string, number>;
};
const TIER_LABEL: Record<Tier, string> = {
  bridge: "Same bib already on the profile",
  name_club: "Unique name + same club",
  name_country: "Unique name + same nationality",
};
const SKIP_LABEL: Record<string, string> = {
  no_candidate: "No profile with this name",
  several_candidates: "Several profiles share the name",
  several_bridges: "Several profiles hold this result",
  name_repeated_in_race: "Name appears more than once in the race",
  no_club_or_country_agreement: "No club or nationality agreement",
  managed_account: "Athlete-managed account (claims workflow)",
  existing_result: "Profile already has a result for this race",
  gender_conflict: "Recorded gender differs",
  athlete_matched_twice: "Same profile matched twice",
  not_linkable: "No finish time",
};
const empty = (): Totals => ({
  scanned: 0,
  linked: { bridge: 0, name_club: 0, name_country: 0 },
  wouldLink: { bridge: 0, name_club: 0, name_country: 0 },
  skipped: {},
});

/** Staff bulk matcher: links archived rows to existing athletes only (owner instruction, 1 Nov 2026). */
export function ArchiveBulkMatch() {
  const client = useQueryClient();
  const overview = useQuery({
    queryKey: ["archive-workspace", "overview"],
    queryFn: () => getArchiveOverview(),
    staleTime: 30000,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [totals, setTotals] = useState<Record<string, Totals>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const stop = useRef(false);
  const datasets = overview.data?.datasets ?? [];

  async function run(apply: boolean) {
    setBusy(true);
    stop.current = false;
    try {
      for (const id of selected) {
        const d = datasets.find((x) => x.id === id);
        const label = d ? `${d.eventName} ${d.date}` : id;
        const t = empty();
        let after = 0;
        for (;;) {
          if (stop.current)
            throw new Error("Stopped. Already-linked rows stay linked; run again to continue.");
          const r = await bulkMatchArchive({ data: { datasetId: id, after, limit: 500, apply } });
          t.scanned += r.scanned;
          for (const k of Object.keys(t.linked) as Tier[]) {
            t.linked[k] += r.linked[k];
            t.wouldLink[k] += r.wouldLink[k];
          }
          for (const [k, v] of Object.entries(r.skipped))
            t.skipped[k] = (t.skipped[k] ?? 0) + (v ?? 0);
          setTotals((prev) => ({ ...prev, [id]: { ...t } }));
          setStatus(
            `${apply ? "Linking" : "Previewing"} ${label}: ${t.scanned.toLocaleString()} rows checked…`,
          );
          if (r.next === null) break;
          after = r.next;
        }
      }
      setStatus(apply ? "Linking finished." : "Preview finished. Nothing was changed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Bulk matching failed");
    } finally {
      setBusy(false);
      void client.invalidateQueries({ queryKey: ["archive-workspace"] });
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-card">
      <h2 className="font-display text-xl font-semibold text-fg">
        Bulk match to existing athletes
      </h2>
      <p className="text-sm text-muted">
        Links unmatched archived rows to existing profiles only. Auto-links when one profile already
        holds the same race result and bib, or (owner override) when the exact name is unique in the
        directory and in the race and the club or nationality agrees. Never creates, merges or
        changes profiles, never touches athlete-managed accounts and never overwrites a result.
        Linked results stay private. Everything else remains for manual review.
      </p>
      <div className="max-h-64 space-y-1 overflow-auto rounded-lg border border-border p-2 text-sm">
        {datasets.map((d) => (
          <label key={d.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={busy}
              checked={selected.includes(d.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked ? [...selected, d.id] : selected.filter((x) => x !== d.id),
                )
              }
            />
            <span>
              {d.eventName} · {d.date} · {d.provider} · {Number(d.stored).toLocaleString()} rows ·{" "}
              {Number(d.linked).toLocaleString()} linked
            </span>
          </label>
        ))}
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          disabled={busy}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        I understand linking attaches these results to the matched existing profiles.
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          disabled={busy || !selected.length}
          onClick={() => void run(false)}
        >
          Preview matches
        </Button>
        <Button disabled={busy || !selected.length || !confirmed} onClick={() => void run(true)}>
          Link matches
        </Button>
        {busy && (
          <Button variant="secondary" onClick={() => (stop.current = true)}>
            Stop after this chunk
          </Button>
        )}
      </div>
      {status && (
        <p role="status" className="text-sm">
          {status}
        </p>
      )}
      {Object.entries(totals).map(([id, t]) => {
        const d = datasets.find((x) => x.id === id);
        return (
          <div key={id} className="rounded-lg bg-elevated p-3 text-sm">
            <strong>{d ? `${d.eventName} · ${d.date}` : id}</strong> — {t.scanned.toLocaleString()}{" "}
            unmatched rows checked
            <ul className="mt-1 list-disc pl-5">
              {(Object.keys(TIER_LABEL) as Tier[]).map((k) => (
                <li key={k}>
                  {TIER_LABEL[k]}: {t.wouldLink[k].toLocaleString()} matched
                  {t.linked[k] ? `, ${t.linked[k].toLocaleString()} linked` : ""}
                </li>
              ))}
              {Object.entries(t.skipped).map(([k, v]) => (
                <li key={k} className="text-muted">
                  Left for review — {SKIP_LABEL[k] ?? k}: {v.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
