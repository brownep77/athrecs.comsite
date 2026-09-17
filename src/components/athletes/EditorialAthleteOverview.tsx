import { moFarahCareerBests, moFarahPhoto } from "@/data/mo-farah";

export function EditorialAthleteOverview({ slug }: { slug: string }) {
  if (slug !== "mo-farah") return null;
  return (
    <section
      aria-labelledby="career-bests"
      className="grid gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5 lg:grid-cols-[18rem_1fr]"
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
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Track and road</p>
        <h2 id="career-bests" className="mt-1 font-display text-2xl font-semibold">
          Selected career personal bests
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {moFarahCareerBests.map((best) => (
            <div key={best.event} className="rounded-xl border border-border bg-elevated/50 p-3">
              <dt className="text-sm font-medium text-muted">{best.event}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{best.time}</dd>
              <dd className="mt-1 text-xs text-muted">
                {best.location}
                {"note" in best ? ` · ${best.note}` : ""}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-muted">
          The 59:07 Great North Run performance was on an assisted course and is separate from the
          record-eligible half-marathon best.{" "}
          <a
            href="https://en.wikipedia.org/wiki/Mo_Farah#Personal_bests"
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
