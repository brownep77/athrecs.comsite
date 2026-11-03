import { Link } from "@tanstack/react-router";
import { ArchiveResultPanels } from "@/components/races/ArchiveResultPanels";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { formatDuration } from "@/lib/athrecs/format";
import type { PublicRaceResult } from "@/lib/athrecs/public-results-api";

function ResultRow({ result, parkrun }: { result: PublicRaceResult; parkrun: boolean }) {
  const finished = !result.disqualified && ["finished", "fin"].includes(result.status.trim().toLowerCase());
  const divisionPlace = finished ? result.gender_place : null;
  const position = result.disqualified ? null : divisionPlace ?? result.overall_place ?? result.reported_place;
  const positionLabel = divisionPlace !== null ? "Division" : result.overall_place !== null ? "Overall" : "Reported";
  const status = result.disqualified ? "Disqualified" : result.status;

  return (
    <tr id={`result-${result.id}`} className="scroll-mt-24 border-b border-border/70 align-top last:border-0">
      <td className="px-2 py-2 text-muted sm:px-3">
        <span className="font-mono font-semibold tabular-nums text-fg">{position ?? "—"}</span>
        {position != null && <span className="block text-[10px]">{positionLabel}</span>}
      </td>
      <th scope="row" className="min-w-0 px-1 py-2 text-left font-normal [overflow-wrap:anywhere] sm:px-2">
        {result.athlete_slug ? (
          <Link to="/athletes/$slug" params={{ slug: result.athlete_slug }} className="font-semibold text-fg no-underline hover:text-accent hover:underline">
            {result.athlete_name}
          </Link>
        ) : (
          <span className="font-semibold">{result.athlete_name}</span>
        )}
        {result.race_club && <span className="mt-0.5 block text-xs text-muted">{result.race_club}</span>}
        {!result.race_club && result.profile_club && <span className="mt-0.5 block text-xs text-muted">Profile club · {result.profile_club}</span>}
        {result.footwear && <span className="block text-xs text-muted">Shoes · {result.footwear}</span>}
        {result.verification_status === "unverified" && <span className="block text-xs text-muted">Unverified result</span>}
        <details className="mt-1 text-xs text-muted">
          <summary className="cursor-pointer rounded-sm py-0.5 text-accent focus-visible:outline-2">
            Details<span className="sr-only"> for {result.athlete_name}</span>
          </summary>
          <div className="space-y-1 py-1">
            {!result.athlete_slug && <p>Name under review · profile not linked</p>}
            {result.race_club && result.profile_club && result.race_club !== result.profile_club && <p>Profile club · {result.profile_club}</p>}
            {result.category && <p>Category · {result.category}</p>}
            {!result.disqualified && result.overall_place !== null && divisionPlace !== null && <p>Overall position {result.overall_place}</p>}
            {!result.disqualified && result.reported_place && result.reported_place !== String(position) && <p>Reported position {result.reported_place}</p>}
            {finished && result.category_place !== null && <p>Category position {result.category_place}</p>}
            {!parkrun && finished && result.chip_time_seconds !== null && <p>Chip time · {formatDuration(result.chip_time_seconds)}</p>}
            {!parkrun && finished && result.gun_time_seconds !== null && <p>Gun time · {formatDuration(result.gun_time_seconds)}</p>}
            <Link to="/claim-results" search={{ resultId: result.id }} className="inline-flex min-h-9 items-center font-medium text-accent underline">
              Claim this result<span className="sr-only"> for {result.athlete_name}</span>
            </Link>
          </div>
        </details>
      </th>
      <td className="px-1 py-2.5 font-mono text-xs font-semibold sm:px-2">
        {result.nationality ? <CountryFlag country={result.nationality} showCode /> : <span aria-label="Nationality not recorded">—</span>}
      </td>
      <td className="px-2 py-2 text-right font-mono text-xs font-semibold tabular-nums [overflow-wrap:anywhere] sm:px-3 sm:text-sm">
        {finished ? result.reported_performance || formatDuration(result.finish_time_seconds) : status}
      </td>
    </tr>
  );
}

export function RaceResultsBoard({ results, parkrun, editionName }: {
  results: PublicRaceResult[];
  parkrun: boolean;
  editionName: string;
}) {
  return (
    <section aria-label="Recorded race results" className="space-y-3">
      <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">Recorded performances</h2>
      {!results.length && <p role="status" className="rounded-md border border-border bg-surface p-5 text-muted">No recorded results match this search.</p>}
      <ArchiveResultPanels rows={results} division={(row) => row.division}>
        {(rows, title) => (
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{title} results for {editionName}. Each placing is labelled as division, overall or reported.</caption>
            <thead className="border-y border-border bg-elevated/45 text-xs font-semibold text-muted">
              <tr>
                <th scope="col" className="px-2 py-2 sm:px-3"><abbr title="Position" className="no-underline">Pos</abbr></th>
                <th scope="col" className="w-full px-1 py-2 sm:px-2">Athlete</th>
                <th scope="col" className="px-1 py-2 sm:px-2">Country</th>
                <th scope="col" className="px-2 py-2 text-right sm:px-3">{parkrun ? "Finish time" : "Performance"}</th>
              </tr>
            </thead>
            <tbody>{rows.map((result) => <ResultRow key={result.id} result={result} parkrun={parkrun} />)}</tbody>
          </table>
        )}
      </ArchiveResultPanels>
    </section>
  );
}
