import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { distanceDisplayLabel } from "@/lib/athrecs/distance";
import {
  homeRegionLabel,
  selectBalancedHomeUpdates,
  type HomeSportUpdate,
} from "@/lib/athrecs/home-updates";
import type { Sport } from "@/lib/athrecs/types";

const control =
  "mt-2 h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-fg focus-visible:outline-2 focus-visible:outline-accent sm:text-sm";

export function HomeUpdatesFeed({
  updates,
  unavailable = false,
}: {
  updates: HomeSportUpdate[];
  unavailable?: boolean;
}) {
  const [sport, setSport] = useState<Sport | "All">("All");
  const [region, setRegion] = useState("All");
  const [kind, setKind] = useState<HomeSportUpdate["kind"] | "All">("All");
  const [limit, setLimit] = useState(8);
  const matching = updates.filter((update) => kind === "All" || update.kind === kind);
  const sports = [...new Set(updates.map((update) => update.sport))].sort();
  const regions = [
    ...new Set(
      matching.filter((update) => sport === "All" || update.sport === sport).map(homeRegionLabel),
    ),
  ].sort();
  const selected = selectBalancedHomeUpdates(matching, sport, region, limit);
  const total = matching.filter(
    (update) =>
      (sport === "All" || update.sport === sport) &&
      (region === "All" || homeRegionLabel(update) === region),
  ).length;

  return (
    <section
      id="sport-updates"
      aria-labelledby="sport-updates-heading"
      className="scroll-mt-44 rounded-lg border border-border bg-surface p-4 sm:p-5"
    >
      <h2 id="sport-updates-heading" className="font-display text-xl font-semibold">
        Sport news & regional updates
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Upcoming fixtures and recently checked results links from the AthRecs catalogue. For
        articles and race previews,{" "}
        <Link to="/news" className="text-accent underline">
          browse news
        </Link>
        .
      </p>
      {unavailable ? (
        <p role="status" className="mt-4 text-sm text-muted">
          Updates are temporarily unavailable. Please try again shortly.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="min-w-0 text-sm font-semibold">
              Update type
              <select
                className={control}
                value={kind}
                onChange={(event) => {
                  setKind(event.target.value as HomeSportUpdate["kind"] | "All");
                  setRegion("All");
                  setLimit(8);
                }}
              >
                <option value="All">Fixtures & results</option>
                <option value="fixture">Upcoming fixtures</option>
                <option value="results">Results links</option>
              </select>
            </label>
            <label className="min-w-0 text-sm font-semibold">
              Update sport
              <select
                className={control}
                value={sport}
                onChange={(event) => {
                  setSport(event.target.value as Sport | "All");
                  setRegion("All");
                  setLimit(8);
                }}
              >
                <option value="All">All sports</option>
                {sports.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 text-sm font-semibold">
              Update location
              <select
                className={control}
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value);
                  setLimit(8);
                }}
              >
                <option value="All">All locations</option>
                {regions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p role="status" className="mt-4 text-xs text-muted">
            {selected.length
              ? `Showing ${selected.length} of ${total} updates`
              : "No updates match these filters yet."}
          </p>
          <ul className="mt-1 divide-y divide-border">
            {selected.map((update) => (
              <li key={update.id} className="py-4">
                <p className="text-xs font-semibold text-accent">
                  {update.kind === "results" ? "Results link" : "Upcoming fixture"} · {update.sport}
                </p>
                <h3 className="mt-1 text-base font-semibold">
                  <Link
                    to="/races/$slug"
                    params={{ slug: update.eventSlug }}
                    className="text-fg no-underline hover:text-accent"
                  >
                    {update.eventName}
                  </Link>
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted">
                  <time dateTime={update.eventDate}>{formatRaceDateShort(update.eventDate)}</time>
                  {" · "}
                  {distanceDisplayLabel(update.distance)}
                  {" · "}
                  {homeRegionLabel(update)}
                </p>
                {update.kind === "results" && update.resultsUrl && update.providerName ? (
                  <a
                    href={update.resultsUrl}
                    className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline"
                  >
                    Results from {update.providerName}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          {selected.length < total ? (
            <button
              type="button"
              onClick={() => setLimit((current) => current + 8)}
              className="min-h-11 text-sm font-semibold text-accent underline"
            >
              Show more updates
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
