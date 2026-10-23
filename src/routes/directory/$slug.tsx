import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { OrganisationSports } from "@/components/directory/OrganisationSports";
import { SportCollections } from "@/components/directory/SportCollections";
import { ORGANISATION_TYPES } from "@/data/sports-organisations";
import { getSportsOrganisation } from "@/lib/athrecs/sports-directory";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/directory/$slug")({
  ssr: true,
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: ({ params }) => {
    const body = getSportsOrganisation(params.slug);
    if (!body) throw notFound();
    return body;
  },
  head: ({ loaderData: body }) => {
    if (!body) return {};
    const url = `${SITE_URL}/directory/${body.slug}`;
    return {
      meta: siteGraphMeta({
        title: `${body.name} | Role, sports & official website | AthRecs`,
        description: body.summary,
        url,
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": url,
                url,
                name: `${body.name} | AthRecs sports directory`,
                dateModified: body.checkedAt,
                mainEntity: { "@id": `${url}#organisation` },
              },
              {
                "@type": "Organization",
                "@id": `${url}#organisation`,
                name: body.name,
                alternateName: body.aliases,
                description: body.summary,
                ...(body.websiteKind === "member-directory"
                  ? {}
                  : { url: body.website, sameAs: [body.website] }),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Sports directory",
                    item: `${SITE_URL}/directory`,
                  },
                  { "@type": "ListItem", position: 2, name: body.name, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: OrganisationPage,
});

function OrganisationPage() {
  const body = Route.useLoaderData();
  const related = (body.related ?? []).flatMap((slug) => {
    const organisation = getSportsOrganisation(slug);
    return organisation ? [organisation] : [];
  });
  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-6">
      <Link
        to="/directory"
        search={{}}
        className="inline-flex min-h-11 items-center text-sm font-semibold"
      >
        ← Sports directory
      </Link>
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <CountryFlag country={body.country} showName />
          <span>{ORGANISATION_TYPES[body.type]}</span>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {body.name}
        </h1>
        {body.aliases?.length ? (
          <p className="text-sm text-muted">Also known as: {body.aliases.join(" · ")}</p>
        ) : null}
        <p className="text-lg leading-8">{body.summary}</p>
        <a
          href={body.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-fg no-underline"
        >
          {body.websiteKind === "member-directory"
            ? "View official member directory"
            : "Visit official website"}{" "}
          <ArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </header>
      <section className="space-y-4" aria-labelledby="role-heading">
        <h2 id="role-heading" className="font-display text-2xl font-semibold">
          Role and area covered
        </h2>
        <p className="text-sm">
          <strong>Remit:</strong> {body.jurisdiction}
        </p>
        {body.detail ? <p className="text-base leading-7 text-muted">{body.detail}</p> : null}
        <OrganisationSports body={body} />
        <p className="text-xs leading-5 text-muted">
          The sport links show relevant AthRecs sections. Competition disciplines, membership and
          team-selection eligibility are set out on the organisation’s official website.
        </p>
      </section>
      <SportCollections sports={body.sports.length ? body.sports : undefined} />
      {related.length ? (
        <section aria-labelledby="related-heading" className="space-y-4">
          <h2 id="related-heading" className="font-display text-2xl font-semibold">
            Related organisations
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  to="/directory/$slug"
                  params={{ slug: item.slug }}
                  className="flex h-full flex-col gap-1 rounded-lg border border-border bg-surface p-4 no-underline hover:border-accent"
                >
                  <span className="font-semibold">{item.name} →</span>
                  <span className="text-xs text-muted">
                    {ORGANISATION_TYPES[item.type]} · {item.jurisdiction}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section
        aria-labelledby="references-heading"
        className="space-y-3 border-t border-border pt-6"
      >
        <h2 id="references-heading" className="font-display text-xl font-semibold">
          Official references
        </h2>
        <ul className="space-y-2">
          {body.sources.map((source) => (
            <li key={source}>
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 max-w-full items-center gap-2 break-all text-sm"
              >
                {new URL(source).hostname.replace(/^www\./, "")} — reference{" "}
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          Role and website references reviewed{" "}
          <time dateTime={body.checkedAt}>
            {new Date(`${body.checkedAt}T12:00:00Z`).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Europe/London",
            })}
          </time>
          . Check the official website for current policies and contact details.
        </p>
      </section>
    </div>
  );
}
