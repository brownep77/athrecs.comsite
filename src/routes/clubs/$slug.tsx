import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { getClubBySlug } from "@/lib/athrecs/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClubIdentityFlag } from "@/components/clubs/ClubIdentityFlag";
import { clubSearchMetadata, safeClubJsonLd } from "@/lib/clubs/profile-seo";
import { ClubVerificationBadge } from "@/components/clubs/ClubVerificationBadge";
import { resolveSlugRedirect } from "@/lib/athrecs/slug-redirects";
import { SITE_NAME, SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/clubs/$slug")({
  loader: async ({ params }) => {
    const data = await getClubBySlug({ data: params.slug });
    if (!data) {
      const currentSlug = await resolveSlugRedirect({
        data: { entityType: "club", slug: params.slug },
      });
      if (currentSlug && currentSlug !== params.slug) {
        throw redirect({
          to: "/clubs/$slug",
          params: { slug: currentSlug },
          statusCode: 301,
        });
      }
      throw notFound();
    }
    if (data.club.slug !== params.slug) {
      throw redirect({
        to: "/clubs/$slug",
        params: { slug: data.club.slug },
        statusCode: 301,
      });
    }
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { club } = loaderData;
    const { canonical, title, description, organization, breadcrumbs } = clubSearchMetadata(
      club,
      SITE_URL,
      SITE_NAME,
    );
    return {
      meta: siteGraphMeta({ title, description, url: canonical }),
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: safeClubJsonLd([organization, breadcrumbs].filter(Boolean)),
        },
      ],
    };
  },
  component: ClubPage,
  notFoundComponent: () => (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Club not found</h1>
      <Button asChild variant="secondary">
        <Link to="/clubs">Back to clubs</Link>
      </Button>
    </div>
  ),
});

function ClubPage() {
  const { club, members, moreMembers } = Route.useLoaderData();
  const location = [...new Set([club.city, club.county, club.country].map((part) => part.trim()))]
    .filter(Boolean)
    .join(" · ");
  const checkedDate = club.checked_at?.slice(0, 10);
  const locationNote =
    club.location_precision === "postcode"
      ? "Directory location matched to the published postcode"
      : club.location_precision === "official-directory"
        ? "Location checked in the official directory"
        : club.location_precision === "area-only"
          ? "County or region confirmed; exact town is not published"
          : "Location has not yet been independently verified";

  return (
    <div className="space-y-6">
      <Link
        to="/clubs"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Clubs
      </Link>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <div className="flex flex-wrap gap-2">
          {IS_ATHRECS_SITE && (
            <Button asChild>
              <Link to="/clubs/register" search={{ club: club.slug }}>
                Register this club
              </Link>
            </Button>
          )}
          {club.sports.map((s) => (
            <Badge key={s} variant="accent">
              {s}
            </Badge>
          ))}
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {members.length}
            {moreMembers ? "+" : ""} public profiles
          </Badge>
          <ClubVerificationBadge
            slug={club.slug}
            website={club.website}
            official_source={club.official_source}
            member_count={members.length}
            name={club.name}
          />
        </div>
        <div className="flex items-center gap-3">
          <ClubIdentityFlag country={club.country} scope={club.profile?.scope} />
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            {club.name}
          </h1>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 text-subtle" />
          {location}
        </p>
        <p className="text-xs text-subtle">{locationNote}</p>
        <p className="max-w-prose text-sm leading-relaxed text-muted">{club.summary}</p>
        <div className="flex flex-wrap gap-2">
          {club.website && (
            <Button asChild variant="secondary">
              <a href={club.website} target="_blank" rel="noreferrer">
                Club website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          {club.contact_url && (
            <Button asChild variant="secondary">
              <a href={club.contact_url} target="_blank" rel="noreferrer">
                Contact or join
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link to="/athletes">Browse athletes</Link>
          </Button>
        </div>
      </section>

      {IS_ATHRECS_SITE && (
        <p className="text-sm text-muted">
          Represent this club? Registration checks your identity and authority before club access is
          approved. Being listed here does not mean the club has registered.
        </p>
      )}

      {club.profile && (
        <section
          className={`grid gap-6 rounded-xl border border-border bg-surface p-5 md:p-7 ${club.profile.founded_year || club.profile.notable_members.length ? "lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)]" : ""}`}
        >
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-fg">About {club.name}</h2>
            {club.profile.biography.map((paragraph) => (
              <p key={paragraph} className="max-w-prose text-sm leading-7 text-muted">
                {paragraph}
              </p>
            ))}
          </div>
          {(club.profile.founded_year || club.profile.notable_members.length > 0) && (
            <div className="space-y-4 lg:border-l lg:border-border lg:pl-6">
              {club.profile.founded_year && (
                <p className="text-sm text-muted">
                  Established{" "}
                  <strong className="font-display text-2xl text-fg">
                    {club.profile.founded_year}
                  </strong>
                </p>
              )}
              {club.profile.notable_members.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-semibold text-fg">
                    Notable members, past and present
                  </h3>
                  {club.profile.notable_members.map((person) => (
                    <div key={person.name} className="border-b border-border pb-3 last:border-0">
                      <p className="font-semibold text-fg">{person.name}</p>
                      <p className="mt-0.5 text-xs text-accent">{person.connection}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{person.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">Club contact details</h2>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              Public information from the club or its governing-body directory.
            </p>
          </div>

          {club.profile?.contact_note && (
            <p className="text-sm leading-relaxed text-muted">{club.profile.contact_note}</p>
          )}
          {club.contacts.length > 0 ? (
            <div className={`grid gap-3 ${club.contacts.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {club.contacts.map((contact, index) => (
                <article
                  key={`${contact.role}-${contact.name ?? contact.email ?? contact.phone ?? index}`}
                  className="rounded-lg border border-border bg-elevated/50 p-3.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {contact.role}
                  </p>
                  {contact.name && (
                    <p className="mt-2 flex items-start gap-2 text-sm font-medium text-fg">
                      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                      {contact.name}
                    </p>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-2 flex items-start gap-2 break-all text-sm text-accent no-underline hover:underline"
                    >
                      <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                      className="mt-2 flex items-start gap-2 text-sm text-accent no-underline hover:underline"
                    >
                      <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                      {contact.phone}
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted">
              {club.website || club.contact_url
                ? "Use the club website or contact page for enquiries. A direct club email or phone number has not yet been confirmed."
                : "Club contact details have not yet been confirmed."}
            </p>
          )}

          {club.socials.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-fg">Club social links</h3>
              <div className="flex flex-wrap gap-2">
                {club.socials.map((social) => (
                  <Button
                    key={`${social.platform}-${social.url}`}
                    asChild
                    variant="secondary"
                    size="sm"
                  >
                    <a href={social.url} target="_blank" rel="noreferrer">
                      {social.platform}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-fg">Location and club details</h2>
          {club.profile?.location_note && (
            <p className="text-sm leading-relaxed text-muted">{club.profile.location_note}</p>
          )}
          {club.address && (
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-fg">
                  {club.address_kind === "training"
                    ? "Training venue"
                    : club.address_kind === "clubhouse"
                      ? "Clubhouse"
                      : club.address_kind === "correspondence"
                        ? "Correspondence address"
                        : "Directory address"}
                </p>
                <p className="mt-0.5 leading-relaxed text-muted">{club.address}</p>
                {["training", "clubhouse"].includes(club.address_kind) ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center gap-1 text-accent"
                  >
                    View on map <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-xs leading-relaxed text-subtle">
                    This may be a postal contact address. Confirm the training venue with the club
                    before visiting.
                  </p>
                )}
              </div>
            </div>
          )}
          {club.region && (
            <div className="flex items-start gap-2.5 text-sm">
              <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-fg">Governing-body region</p>
                <p className="mt-0.5 text-muted">{club.region}</p>
              </div>
            </div>
          )}
          {club.official_source && (
            <div className="flex items-start gap-2.5 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-fg">Source</p>
                {club.source_url ? (
                  <a
                    href={club.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-accent no-underline hover:underline"
                  >
                    {club.official_source}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="mt-0.5 text-muted">{club.official_source}</p>
                )}
              </div>
            </div>
          )}
          {checkedDate && (
            <div className="flex items-start gap-2.5 text-sm">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-fg">Directory checked</p>
                <p className="mt-0.5 text-muted">{checkedDate}</p>
              </div>
            </div>
          )}
        </aside>
      </section>

      {club.profile && (
        <details className="rounded-xl border border-border bg-surface p-4 text-sm">
          <summary className="cursor-pointer font-medium text-muted">
            Club history and information sources
          </summary>
          <p className="mt-3 text-xs text-subtle">
            Profile reviewed {club.profile.reviewed_at}. Training arrangements can change; check
            with the club before attending.
          </p>
          <ul className="mt-3 space-y-2">
            {club.profile.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">Athletes at this club</h2>
        <p className="text-sm text-muted">
          Open an athlete to view their published race results and profile.
        </p>
        {members.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            No athletes linked yet.
          </p>
        ) : (
          <div className="grid gap-2">
            {members.map((m) => (
              <Link
                key={m.id}
                to="/athletes/$slug"
                params={{ slug: m.slug }}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 no-underline shadow-card hover:border-border-strong"
              >
                <div>
                  <p className="font-semibold text-fg">{m.display_name}</p>
                </div>
                <Badge variant="outline">
                  {m.result_count} {m.result_count === 1 ? "result" : "results"}
                </Badge>
              </Link>
            ))}
          </div>
        )}
        {moreMembers ? (
          <Link
            to="/athletes"
            search={{ q: club.name }}
            className="inline-flex min-h-11 items-center text-sm text-accent hover:underline"
          >
            Browse more club athletes
          </Link>
        ) : null}
      </section>
    </div>
  );
}
