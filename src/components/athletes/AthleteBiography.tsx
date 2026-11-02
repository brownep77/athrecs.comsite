import type { BiographyPresentation } from "@/lib/athrecs/biography-presentation";
import { AthleteBusinessLink } from "./AthleteBusinessLink";

function biographyText(text: string, mentions: BiographyPresentation["mentions"]) {
  const links = new Map(
    (mentions ?? [])
      .filter((link) => link.text.trim() && /^\/(?:athletes|races)\/[a-z0-9-]+$/.test(link.url))
      .map((link) => [link.text, link.url]),
  );
  if (!links.size) return text;
  const names = [...links.keys()]
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(${names.join("|")})(?![\\p{L}\\p{N}])`, "gu");
  return text.split(pattern).map((part, index) => {
    const href = links.get(part);
    return href ? (
      <a key={index} href={href} className="text-accent underline underline-offset-4">
        {part}
      </a>
    ) : (
      part
    );
  });
}

export function AthleteBiography({
  slug,
  paragraphs,
  presentation,
}: {
  slug: string;
  paragraphs: readonly string[];
  presentation?: BiographyPresentation;
}) {
  if (!paragraphs.length) return null;
  return (
    <section aria-label="Biography" className="space-y-4">
      <h2 className="text-lg font-semibold">Biography</h2>
      {paragraphs.map((paragraph, index) => (
        <div key={`${index}-${paragraph.slice(0, 40)}`} className="space-y-2">
          {presentation?.headings[index] ? (
            <h3 className="text-sm font-semibold">{presentation.headings[index]}</h3>
          ) : null}
          <p className="text-sm leading-relaxed text-muted">
            {biographyText(paragraph, presentation?.mentions)}
          </p>
        </div>
      ))}
      {presentation?.links?.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Official websites and podcast links</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {presentation.links
              .filter((link) => /^https:\/\//.test(link.url))
              .map((link) => (
                <li key={link.url}>
                  <a href={link.url} className="text-accent underline underline-offset-4">
                    {link.label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
      {presentation?.questions?.length ? (
        <section aria-label="Common questions" className="space-y-3 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Common questions</h3>
          {presentation.questions.map(({ question, answer }) => (
            <div key={question} className="space-y-1">
              <h4 className="text-sm font-medium">{question}</h4>
              <p className="text-sm leading-relaxed text-muted">
                {biographyText(answer, presentation.mentions)}
              </p>
            </div>
          ))}
        </section>
      ) : null}
      <AthleteBusinessLink slug={slug} />
    </section>
  );
}
