import { useState } from "react";
import {
  channelPath,
  type ChannelFlag,
  type ChannelFact,
  type ChannelCard,
  type ChannelProfile,
  type ChannelNative,
  type ChannelListing,
} from "@/lib/athrecs/english-channel";

const sectionTitle = "font-display text-2xl font-semibold text-fg";
const tile = "space-y-3 rounded-xl border border-border bg-surface p-5";
export function ChannelFlags({ flags }: { flags: ChannelFlag[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {flags.map((f) => (
        <span key={f.code} className="inline-flex items-center gap-1">
          <img
            src={`https://flagcdn.com/${f.code.toLowerCase()}.svg`}
            width={24}
            height={16}
            alt={f.label}
            className="h-4 w-6 object-contain"
          />
          <abbr title={f.label} className="no-underline">
            {f.abbr}
          </abbr>
        </span>
      ))}
    </span>
  );
}
function Facts({ items }: { items: ChannelFact[] }) {
  return (
    <dl className="grid gap-4 rounded-xl bg-elevated p-5 sm:grid-cols-2">
      {items.map((f, i) => (
        <div key={i}>
          <dt className="text-sm font-semibold">{f.label}</dt>
          <dd className="mt-1 leading-relaxed">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
function Cards({ title, id, cards }: { title: string; id?: string; cards: ChannelCard[] }) {
  if (!cards.length) return null;
  return (
    <section id={id} className="space-y-4">
      <h2 className={sectionTitle}>{title}</h2>
      {cards.map((card, i) => (
        <article key={card.id ?? i} id={card.id} className={tile}>
          <h3 className="font-display text-xl font-semibold">{card.title}</h3>
          {card.lines.map((line, j) =>
            line.url ? (
              <p key={j}>
                <a
                  href={line.url}
                  className="font-medium text-accent underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {line.label ? line.label + " · " : ""}
                  {line.text}
                </a>
              </p>
            ) : line.heading ? (
              <h4 key={j} className="pt-2 font-semibold">
                {line.text}
              </h4>
            ) : (
              <p key={j} className="leading-relaxed">
                {line.label ? (
                  <>
                    <strong>{line.label}</strong>
                    {" · "}
                  </>
                ) : null}
                {line.text}
              </p>
            ),
          )}
        </article>
      ))}
    </section>
  );
}
function Questions({ items }: { items: ChannelFact[] }) {
  return (
    <section id="channel-questions" className="space-y-3">
      <h2 className={sectionTitle}>English Channel questions</h2>
      <Facts items={items} />
    </section>
  );
}
export function ChannelNativeRecord({ record }: { record: ChannelNative }) {
  return (
    <section id="english-channel-record" className="space-y-5 rounded-xl border border-border p-5">
      <h2 className={sectionTitle}>English Channel record</h2>
      <p>{record.highlight}</p>
      {record.aliases.length > 0 && <p>Also recorded as {record.aliases.join(", ")}.</p>}
      <a
        className="inline-block font-semibold text-accent underline"
        href={channelPath + "/" + record.slug}
      >
        Crossing details, recordings &amp; verification
      </a>
      <Facts items={record.facts} />
      <Cards title="Selected Channel swims" cards={record.crossings} />
      <Cards title="Other events & swims" cards={record.otherEvents} />
      <Cards title="Career milestones" cards={record.milestones} />
      <Questions items={record.questions} />
    </section>
  );
}
export function ChannelArticle({ p }: { p: ChannelProfile }) {
  return (
    <main className="mx-auto max-w-5xl space-y-7 px-4 py-8 sm:px-6">
      <a className="font-semibold text-accent" href={channelPath}>
        ← English Channel swimmers
      </a>
      <header className="space-y-4 rounded-2xl bg-[#073e4a] p-7 text-white sm:p-10">
        <p className="flex flex-wrap items-center gap-3">
          <ChannelFlags flags={p.flags} />
          {p.country}
        </p>
        <h1 className="font-display text-4xl font-bold">{p.name}</h1>
        <p className="text-lg">{p.highlight}</p>
        <a
          className="inline-block rounded-lg bg-white px-4 py-3 font-semibold text-[#073e4a]"
          href={"/athletes/" + p.slug}
        >
          View athlete profile
        </a>
      </header>
      <nav className="flex flex-wrap gap-5 text-sm font-semibold text-accent">
        <a href="#channel-bio">Biography</a>
        <a href="#channel-records">Crossings &amp; evidence</a>
        <a href="#channel-recordings">Recordings &amp; media</a>
        <a href="#channel-questions">Questions</a>
      </nav>
      {!!p.aliases.length && <p>Also recorded as {p.aliases.join(", ")}.</p>}
      <Facts items={p.facts} />
      <section id="channel-bio" className="max-w-3xl space-y-4">
        <h2 className={sectionTitle}>Biography</h2>
        {p.biography.map((t, i) => (
          <p key={i} className="leading-relaxed">
            {t}
          </p>
        ))}
      </section>
      <Cards id="channel-records" title="Selected Channel swim records" cards={p.crossings} />
      <Cards title="Other events & swims" cards={p.otherEvents} />
      <Cards title="Career milestones" cards={p.milestones} />
      <section id="channel-recordings">
        {p.media.length ? (
          <Cards title="Recordings & media" cards={p.media} />
        ) : (
          <>
            <h2 className={sectionTitle}>Recordings &amp; media</h2>
            <p>No reviewed recording is available for this entry.</p>
          </>
        )}
      </section>
      <Questions items={p.questions} />
      <details className={tile}>
        <summary className="cursor-pointer font-semibold">Biography sources</summary>
        <Cards title="Reviewed sources" cards={p.sources} />
      </details>
      <p className="text-sm text-muted">
        Latest source review <time dateTime={p.checkedAt}>{p.checkedAt}</time>.
      </p>
    </main>
  );
}
export function ChannelDirectory({ items }: { items: ChannelListing[] }) {
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState("all");
  const fold = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const matches = items.filter(
    (p) =>
      (kind !== "relay" || p.relay) &&
      fold([p.name, p.country, ...p.aliases, ...p.eventNames].join(" ")).includes(
        fold(term.trim()),
      ),
  );
  return (
    <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
      <a href="/sports/swimming" className="font-semibold text-accent">
        Swimming
      </a>
      <header className="space-y-4 rounded-2xl bg-[#073e4a] p-8 text-white">
        <p>ATHRECS SWIMMING ARCHIVE</p>
        <h1 className="font-display text-4xl font-bold">English Channel swimmers</h1>
        <p className="max-w-2xl text-lg">
          Explore the people who swam between England and France. Each biography links to selected
          performances, dates, times and the evidence behind them.
        </p>
        <p className="font-semibold">
          {items.length} swimmer profiles · {items.reduce((a, b) => a + b.swims, 0)} Channel
          performances · {items.reduce((a, b) => a + b.events, 0)} other events
        </p>
      </header>
      <section className={tile}>
        <h2 className={sectionTitle}>How the records were checked</h2>
        <p>
          Each crossing links to the published records, observer accounts or contemporary reports
          used to check it. The entry explains any disagreement and identifies federation
          ratification where established. Each continuous swim counts once. Relay times belong to
          the team.
        </p>
        <p>
          This archive covers selected swimmers and performances. Dates and clock times appear at
          the precision the sources support.
        </p>
      </section>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 font-semibold">
          Search swimmers or events
          <input
            className="rounded-lg border border-border p-2"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 font-semibold">
          Channel swim type
          <select
            className="rounded-lg border border-border p-2"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="all">All swimmers</option>
            <option value="relay">Relay participants</option>
          </select>
        </label>
      </div>
      <p role="status">
        {matches.length} {matches.length === 1 ? "swimmer" : "swimmers"} shown
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((p) => (
          <article key={p.slug} data-channel-slug={p.slug} className={tile}>
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <ChannelFlags flags={p.flags} />
              {p.country}
            </p>
            <h2 className="font-display text-xl font-semibold">
              <a href={"/athletes/" + p.slug}>{p.name}</a>
            </h2>
            <p>{p.highlight}</p>
            <p className="text-sm text-muted">
              {p.swims} selected Channel {p.swims === 1 ? "performance" : "performances"}
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-accent">
              <a href={"/athletes/" + p.slug}>View athlete profile</a>
              <a href={channelPath + "/" + p.slug}>Crossing details &amp; evidence</a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
