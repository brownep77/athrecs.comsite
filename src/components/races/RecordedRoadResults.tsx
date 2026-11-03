import { Link } from "@tanstack/react-router";
import type { PublicRaceResult } from "@/lib/athrecs/public-results-api";
import { formatDuration } from "@/lib/athrecs/format";
import { RoadResultsBoard, type BoardRow } from "./RoadResultsBoard";

export function RecordedRoadResults({
  results,
  caption,
}: {
  results: PublicRaceResult[];
  caption: string;
}) {
  const rows = results.map((r): BoardRow => {
    const finished = !r.disqualified && /^(finished|fin)$/i.test(r.status.trim());
    const place = finished ? (r.gender_place ?? r.overall_place ?? r.reported_place) : null;
    const time = finished
      ? r.reported_performance || formatDuration(r.finish_time_seconds)
      : r.disqualified
        ? "Disqualified"
        : r.status;
    return {
      key: r.id,
      anchor: `result-${r.id}`,
      name: r.athlete_name,
      profile: r.athlete_slug,
      division: r.division ?? "Division unrecorded",
      country: r.nationality,
      place,
      time,
      placeLabel:
        place == null
          ? undefined
          : r.gender_place != null
            ? "Division"
            : r.overall_place != null
              ? "Overall"
              : "Reported",
      club: r.race_club || r.profile_club,
      clubLabel: r.race_club ? "Club" : "Profile club",
      shoes: r.footwear,
      details: (
        <>
          {r.verification_status === "unverified" && (
            <small className="block text-muted">Unverified result</small>
          )}
          <details className="mt-1 text-xs text-muted">
            <summary className="cursor-pointer py-1 font-medium text-accent">
              Details<span className="sr-only"> for {r.athlete_name}</span>
            </summary>
            <div className="space-y-1">
              {!r.athlete_slug && <p>Name under review · profile not linked</p>}
              {r.category && <p>Category · {r.category}</p>}
              {finished && r.overall_place != null && <p>Overall place · {r.overall_place}</p>}
              {finished && r.category_place != null && <p>Category place · {r.category_place}</p>}
              {finished && r.chip_time_seconds != null && (
                <p>Chip time · {formatDuration(r.chip_time_seconds)}</p>
              )}
              {finished && r.gun_time_seconds != null && (
                <p>Gun time · {formatDuration(r.gun_time_seconds)}</p>
              )}
              <Link
                to="/claim-results"
                search={{ resultId: r.id }}
                className="inline-flex min-h-9 items-center text-accent underline"
              >
                Claim this result
              </Link>
            </div>
          </details>
        </>
      ),
    };
  });
  return results.length ? (
    <RoadResultsBoard rows={rows} caption={caption} timing="Finish" />
  ) : (
    <p role="status" className="p-4 text-muted">
      No recorded results match this search.
    </p>
  );
}
