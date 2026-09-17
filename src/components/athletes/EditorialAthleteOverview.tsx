import {
  moFarahCareerBests,
  moFarahPhoto,
  moFarahRoadSplits,
  moFarahTwoMileRoadBest,
} from "@/data/mo-farah";
import { formatRaceDateShort } from "@/lib/athrecs/format";

export function EditorialAthleteOverview({ slug }: { slug: string }) {
  if (slug !== "mo-farah") return null;
  return (
    <section
      aria-labelledby="career-bests"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:grid-cols-[12rem_1fr]"
    >
      <figure>
        <img
          src={moFarahPhoto.src}
          alt={moFarahPhoto.alt}
          width={1600}
          height={1600}
          className="aspect-square w-full rounded-xl object-cover"
        />
        <figcaption className="mt-2 text-xs leading-5 text-muted">
          Mo Farah (white Great Britain vest), London 2017.
          <br />
          Photo:{" "}
          <a
            href={moFarahPhoto.source}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            {moFarahPhoto.credit}
          </a>
          {" · "}
          <a
            href={moFarahPhoto.licence}
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
        <p className="mt-3 text-xs leading-5 text-muted">
          Road results, PBs and achievements appear below. His fastest assisted half marathon was
          59:07 at the 2019 Great North Run; his record-eligible best is 59:32 in Lisbon.{" "}
          <a
            href="https://worldathletics.org/athletes/-/14189197"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            Personal-best sources
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function EditorialRoadSplits({ slug }: { slug: string }) {
  if (slug !== "mo-farah") return null;
  return (
    <section aria-label="Additional road bests" className="space-y-2">
      <h2 className="font-display text-lg font-semibold">Additional road bests</h2>
      <p className="text-xs text-muted">
        The 15K and 20K times are intermediate splits. Power of 10 also lists a two-mile road best;
        its exact race date is unconfirmed. These records do not add another finish or achievement.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={moFarahTwoMileRoadBest.source}
          target="_blank"
          rel="noreferrer"
          className="min-w-40 flex-1 rounded-lg border border-border bg-surface px-3 py-2 no-underline hover:bg-elevated"
        >
          <span className="block text-xs text-muted">Running · 2 miles road</span>
          <strong className="text-lg tabular-nums text-fg">{moFarahTwoMileRoadBest.time}</strong>
          <span className="block text-xs text-muted">
            {moFarahTwoMileRoadBest.year} · Year confirmed; exact race date unconfirmed
          </span>
          <span className="block text-xs text-accent">Source ↗</span>
        </a>
        {moFarahRoadSplits.map((split) => (
          <a
            key={split.distance}
            href={split.source}
            target="_blank"
            rel="noreferrer"
            className="min-w-40 flex-1 rounded-lg border border-border bg-surface px-3 py-2 no-underline hover:bg-elevated"
          >
            <span className="block text-xs text-muted">Running · {split.distance} split</span>
            <strong className="text-lg tabular-nums text-fg">{split.time}</strong>
            <span className="block text-xs text-muted">
              {split.event} · {formatRaceDateShort(split.date)}
            </span>
            <span className="block text-xs text-accent">Source ↗</span>
          </a>
        ))}
      </div>
      <p className="text-xs text-muted">
        Source-checked road history, 2004–2023. Historical sources may omit races. London 2013 was a
        planned partial run and London 2020 a pacing appearance; both are recorded as DNF.
      </p>
    </section>
  );
}
