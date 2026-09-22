const coverage: Record<
  string,
  {
    checkedAt: string;
    identityNote: string;
    links: { publisher: string; title: string; url: string }[];
  }
> = {
  "harriet-carr": {
    checkedAt: "22 September 2026",
    identityNote:
      "These articles identify Harriet through her Wymondham AC membership or matching race records. The Guernsey report includes a named race photograph.",
    links: [
      {
        publisher: "Sportlink Grand Prix",
        title: "Harriet Carr interview: Wymondham 20 and Ironman plans",
        url: "https://www.sportlinkgp.run/wymondham-20-harriet-carr-pacing-ironman",
      },
      {
        publisher: "Sportlink Grand Prix",
        title: "Wroxham 5K 2025: Six women to watch",
        url: "https://www.sportlinkgp.run/six-women-to-watch-wroxham-5k-2025",
      },
      {
        publisher: "England Athletics",
        title: "Masters marathon team announced — Wymondham AC selection",
        url: "https://www.englandathletics.org/news/masters-marathon-team-announced/",
      },
      {
        publisher: "England Athletics",
        title: "England and Wales Masters at Abingdon Marathon",
        url: "https://www.englandathletics.org/news/england-and-wales-masters-battle-it-out-at-abingdon-marathon/",
      },
      {
        publisher: "Guernsey Press",
        title: "Records smashed at the 2026 Sure Guernsey Marathon — report and photo",
        url: "https://guernseypress.com/sport/2026/04/20/records-smashed-at-2026-sure-guernsey-marathon",
      },
    ],
  },
};

export function AthleteMediaCoverage({ slug }: { slug: string }) {
  const media = coverage[slug];
  if (!media) return null;
  return (
    <section
      aria-labelledby="athlete-media-heading"
      className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5"
    >
      <h2 id="athlete-media-heading" className="font-display text-lg font-semibold text-fg">
        Media coverage
      </h2>
      <p className="text-sm text-muted">{media.identityNote}</p>
      <ul className="space-y-3">
        {media.links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent hover:underline"
            >
              {link.title} ↗
            </a>
            <p className="text-xs text-subtle">{link.publisher}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-subtle">Links and identity evidence checked {media.checkedAt}.</p>
    </section>
  );
}
