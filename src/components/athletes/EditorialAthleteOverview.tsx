import type { ProfileEditorial } from "@/lib/athrecs/profile-editorial.server";
import { formatRaceDateShort } from "@/lib/athrecs/format";

export function EditorialAthleteOverview({
  overview,
  showEvidence = false,
}: {
  overview: ProfileEditorial["overview"];
  showEvidence?: boolean;
}) {
  const {
    timed: davidGogginsTimedPerformances,
    bests: moFarahCareerBests,
    photo: moFarahPhoto,
  } = overview;
  if (davidGogginsTimedPerformances.length) {
    return (
      <section
        aria-labelledby="timed-distance-performances"
        className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-card"
      >
        <h2 id="timed-distance-performances" className="font-display text-lg font-semibold">
          Timed-distance performances
        </h2>
        {showEvidence ? (
          <p className="text-sm text-muted">
            Distance covered during a fixed-duration race. Exact race dates remain under review;
            these marks are listed by year and excluded from the finish-time totals below.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {davidGogginsTimedPerformances.map((performance) => (
            <div
              key={performance.event}
              className="rounded-lg border border-border px-3 py-2 no-underline hover:bg-elevated"
            >
              <span className="block text-sm font-medium text-fg">{performance.event}</span>
              <strong className="block text-lg tabular-nums text-fg">
                {performance.distanceMiles} miles in {performance.durationHours} hours
              </strong>
              <span className="block text-xs text-muted">
                {performance.year} · Overall place {performance.place}
              </span>
              {showEvidence ? (
                <a
                  href={performance.source}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-accent"
                >
                  UltraSignup results ↗
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (!overview.photo) return null;
  return (
    <section
      aria-labelledby="career-bests"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:grid-cols-[12rem_1fr]"
    >
      <figure>
        <img
          src={moFarahPhoto!.src}
          alt={moFarahPhoto!.alt}
          width={1600}
          height={1600}
          className="aspect-square w-full rounded-xl object-cover"
        />
        <figcaption className="mt-2 text-xs leading-5 text-muted">
          Mo Farah (white Great Britain vest), London 2017.
          <br />
          Photo:{" "}
          <a
            href={moFarahPhoto!.creditUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            {moFarahPhoto!.credit}
          </a>
          {" · "}
          <a
            href={moFarahPhoto!.licence}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            CC0 public-domain dedication
          </a>
          .
        </figcaption>
      </figure>
      <div>
        <h2 id="career-bests" className="font-display text-lg font-semibold">
          Track personal bests
        </h2>
        <dl className="mt-3 flex flex-wrap gap-2">
          {moFarahCareerBests.map((best) => (
            <div
              key={best.event}
              className="flex-1 rounded-lg border border-border bg-elevated/50 px-3 py-2"
            >
              <dt className="text-sm font-medium text-muted">{best.event}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{best.time}</dd>
              <dd className="mt-1 text-xs text-muted">{best.location}</dd>
            </div>
          ))}
        </dl>
        {showEvidence ? (
          <p className="mt-3 text-xs leading-5 text-muted">
            Road results, PBs and achievements appear below. His fastest assisted half marathon was
            59:07 at the 2019 Great North Run; his record-eligible best is 59:32 in Lisbon.{" "}
            <a
              href={overview.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline"
            >
              Personal-best sources
            </a>
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function EditorialRoadSplits({
  overview,
  showEvidence = false,
}: {
  overview: ProfileEditorial["overview"];
  showEvidence?: boolean;
}) {
  const { splits: moFarahRoadSplits, twoMile: moFarahTwoMileRoadBest } = overview;
  if (!moFarahTwoMileRoadBest) return null;
  return (
    <section aria-label="Additional road bests" className="space-y-2">
      <h2 className="font-display text-lg font-semibold">Additional road bests</h2>
      {showEvidence ? (
        <p className="text-xs text-muted">
          The 15K and 20K times are intermediate splits. Power of 10 also lists a two-mile road
          best; its exact race date is unconfirmed. These records do not add another finish or
          achievement.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <div className="min-w-40 flex-1 rounded-lg border border-border bg-surface px-3 py-2">
          <span className="block text-xs text-muted">Running · 2 miles road</span>
          <strong className="text-lg tabular-nums text-fg">{moFarahTwoMileRoadBest.time}</strong>
          <span className="block text-xs text-muted">
            {moFarahTwoMileRoadBest.year}
            {showEvidence ? " · Year confirmed; exact race date unconfirmed" : ""}
          </span>
          {showEvidence ? (
            <a
              href={moFarahTwoMileRoadBest.source}
              target="_blank"
              rel="noreferrer"
              className="block text-xs text-accent"
            >
              Source ↗
            </a>
          ) : null}
        </div>
        {moFarahRoadSplits.map((split) => (
          <div
            key={split.distance}
            className="min-w-40 flex-1 rounded-lg border border-border bg-surface px-3 py-2 no-underline hover:bg-elevated"
          >
            <span className="block text-xs text-muted">Running · {split.distance} split</span>
            <strong className="text-lg tabular-nums text-fg">{split.time}</strong>
            <span className="block text-xs text-muted">
              {split.event} · {formatRaceDateShort(split.date)}
            </span>
            {showEvidence ? (
              <a
                href={split.source}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-accent"
              >
                Source ↗
              </a>
            ) : null}
          </div>
        ))}
      </div>
      {showEvidence ? (
        <p className="text-xs text-muted">
          Source-checked road history, 2004–2023. Historical sources may omit races. London 2013 was
          a planned partial run and London 2020 a pacing appearance; both are recorded as DNF.
        </p>
      ) : null}
    </section>
  );
}
