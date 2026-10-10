import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getCapturedRaces, getCapturedRaceRows } from "@/lib/results-archive/captures-api";

const inputClass = "min-w-0 flex-1 rounded-lg border border-border bg-bg p-2 text-sm";
const number = (value: number) => value.toLocaleString("en-GB");

export function CapturedResultsBrowser() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const races = useQuery({
    queryKey: ["captured-races", q, offset],
    queryFn: () => getCapturedRaces({ data: { q, offset } }),
    staleTime: 30_000,
  });
  return (
    <section
      className="space-y-4 rounded-xl border border-border bg-surface p-4"
      aria-labelledby="captured-results-heading"
    >
      <div>
        <h2 id="captured-results-heading" className="font-display text-2xl font-semibold">
          Imported source results
        </h2>
        <p className="text-sm text-muted">
          Browse complete stored race fields, including athletes without a profile. These private
          source records await identity review.
        </p>
        {races.data?.available && (
          <p className="mt-2 font-medium">
            {number(races.data.results)} results across {number(races.data.races)} race pages
          </p>
        )}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(draft.trim());
          setOffset(0);
          setSelected(null);
        }}
      >
        <input
          className={inputClass}
          aria-label="Search imported races"
          placeholder="Race, year or timing provider"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={160}
        />
        <Button type="submit">Search races</Button>
      </form>
      {races.isPending && <p role="status">Loading imported races…</p>}
      {races.isError && (
        <p role="alert">
          Imported races could not be loaded.{" "}
          <button className="underline" onClick={() => void races.refetch()}>
            Retry
          </button>
        </p>
      )}
      {races.data && !races.data.available && (
        <p>The private source archive is not connected in this environment.</p>
      )}
      {races.data?.available && (
        <>
          <div className="max-h-96 overflow-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Imported race pages</caption>
              <thead className="bg-elevated">
                <tr>
                  <th className="p-3">Race</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Results</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {races.data.rows.map((race) => (
                  <tr
                    key={race.id}
                    className={
                      selected === race.id
                        ? "border-t border-border bg-elevated"
                        : "border-t border-border"
                    }
                  >
                    <td className="p-3">
                      <button
                        className="text-left font-medium underline"
                        onClick={() => setSelected(race.id)}
                      >
                        {race.name}
                      </button>
                      <div className="text-xs text-muted">{race.location}</div>
                    </td>
                    <td className="whitespace-nowrap p-3">{race.date}</td>
                    <td className="p-3">{number(race.row_count)}</td>
                    <td className="p-3">
                      <a
                        className="underline"
                        href={race.source_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {race.provider}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!races.data.rows.length && <p className="p-4">No matching races.</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button
              variant="secondary"
              disabled={!offset}
              onClick={() => setOffset(Math.max(0, offset - 50))}
            >
              Previous races
            </Button>
            <span>
              {races.data.total
                ? `${number(offset + 1)}–${number(offset + races.data.rows.length)} of ${number(races.data.total)}`
                : "0 races"}
            </span>
            <Button
              variant="secondary"
              disabled={races.data.next === null}
              onClick={() => setOffset(races.data.next!)}
            >
              Next races
            </Button>
          </div>
        </>
      )}
      {selected && <CapturedRace key={selected} id={selected} />}
    </section>
  );
}

function CapturedRace({ id }: { id: string }) {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const results = useQuery({
    queryKey: ["captured-race", id, q, offset],
    queryFn: () => getCapturedRaceRows({ data: { id, q, offset } }),
    staleTime: 30_000,
  });
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <h3 className="text-lg font-semibold">{results.data?.race.name ?? "Race results"}</h3>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(draft.trim());
          setOffset(0);
        }}
      >
        <input
          className={inputClass}
          aria-label="Search participants in selected race"
          placeholder="Athlete, bib, club or distance"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={160}
        />
        <Button type="submit">Search results</Button>
      </form>
      {results.isPending && <p role="status">Loading race results…</p>}
      {results.isError && (
        <p role="alert">
          Results could not be loaded.{" "}
          <button className="underline" onClick={() => void results.refetch()}>
            Retry
          </button>
        </p>
      )}
      {results.data && (
        <>
          <p className="text-xs text-muted">
            Source:{" "}
            <a
              href={results.data.race.source_url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {results.data.race.provider}
            </a>
            . Expand a row for every original field. Source comparison does not confirm athlete
            identity.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Private source result rows</caption>
              <thead>
                <tr>
                  {[
                    "Athlete / details",
                    "Race",
                    "Bib",
                    "Status",
                    "Chip time",
                    "Gun / source time",
                    "Overall / gender / category",
                  ].map((h) => (
                    <th className="p-2" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.data.rows.map(({ ordinal, row }) => (
                  <tr key={ordinal} className="border-t border-border align-top">
                    <td className="min-w-48 p-2">
                      <details>
                        <summary className="cursor-pointer font-medium">
                          {row.name || "Name not supplied"}
                        </summary>
                        <p className="my-2 text-xs text-muted">
                          Identity unreviewed · {row.club || "Club not supplied"}
                        </p>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          {Object.entries(row.original ?? {}).map(([heading, value]) => (
                            <div key={heading} className="contents">
                              <dt className="text-muted">{heading}</dt>
                              <dd>{value || "—"}</dd>
                            </div>
                          ))}
                        </dl>
                        <a
                          className="mt-2 inline-block text-xs underline"
                          href={`${results.data.race.source_url}#${encodeURIComponent(row.tableKey || "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {results.data.race.provider} · row {row.sourceRow}
                        </a>
                      </details>
                    </td>
                    <td className="p-2">
                      {row.distanceLabel}
                      <div className="text-xs text-muted">{row.date}</div>
                    </td>
                    <td className="p-2">{row.bib || "—"}</td>
                    <td className="p-2">{row.status}</td>
                    <td className="whitespace-nowrap p-2">{row.original?.["Chip Time"] || "—"}</td>
                    <td className="whitespace-nowrap p-2">
                      {row.original?.["Gun Time"] ||
                        row.original?.Time ||
                        row.original?.["Total Time"] ||
                        "—"}
                    </td>
                    <td className="p-2">
                      {row.original?.Position || "—"} / {row.original?.["Gender Pos"] || "—"} /{" "}
                      {row.original?.["Cat Pos"] || "—"}
                      <div className="text-xs text-muted">{row.original?.Category || "—"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!results.data.rows.length && <p>No matching participants.</p>}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button
              variant="secondary"
              disabled={!offset}
              onClick={() => setOffset(Math.max(0, offset - 100))}
            >
              Previous results
            </Button>
            <span>
              {results.data.total
                ? `${number(offset + 1)}–${number(offset + results.data.rows.length)} of ${number(results.data.total)}`
                : "0 results"}
            </span>
            <Button
              variant="secondary"
              disabled={results.data.next === null}
              onClick={() => setOffset(results.data.next!)}
            >
              Next results
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
