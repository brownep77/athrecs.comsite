import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Flag, Handshake, Megaphone, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Declaration,
  Field,
  LoadingPartners,
  PartnerError,
  SelectField,
  inputClass,
  panelClass,
} from "@/components/partners/PartnerUI";
import { SponsorshipDetails } from "@/components/partners/SponsorshipDetails";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { openAthleteAuth } from "@/lib/auth/client";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import {
  ENQUIRY_KINDS,
  ENQUIRY_STATUSES,
  SUPPORT_TYPES,
  sponsorshipSchema,
} from "@/lib/sponsorship";
import {
  getMySponsorshipEnquiries,
  submitSponsorshipEnquiry,
  withdrawSponsorship,
} from "@/lib/sponsorship-api";

type Kind = keyof typeof ENQUIRY_KINDS;
const siteName = IS_RUNRECS_SITE ? "RunRecs" : "AthRecs";
export const Route = createFileRoute("/sponsorship")({
  validateSearch: (search: Record<string, unknown>): { kind?: Kind } => ({
    kind:
      search.kind === "brand" || search.kind === "race_organiser" || search.kind === "creator"
        ? search.kind
        : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: IS_RUNRECS_SITE
          ? "Race sponsorship | RunRecs"
          : "Athlete & influencer partnerships | AthRecs",
      },
      {
        name: "description",
        content: IS_RUNRECS_SITE
          ? "Connect your brand with the running community through race sponsorship, race-day experiences and product partnerships. Submit a private sponsorship brief."
          : "Give your brand more exposure through athletes and influencers. Share a private brief for sponsorship, content collaborations or ambassador partnerships.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://www.${IS_RUNRECS_SITE ? "runrecs" : "athrecs"}.com/sponsorship`,
      },
    ],
  }),
  component: SponsorshipPage,
});

function SponsorshipPage() {
  const search = Route.useSearch();
  const [kind, setKind] = useState<Kind>(search.kind ?? (IS_RUNRECS_SITE ? "brand" : "creator"));
  return (
    <div className="space-y-7 pb-4">
      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="grid gap-8 p-6 md:grid-cols-[1.5fr_1fr] md:p-9">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-accent">
              <Handshake className="size-4" aria-hidden="true" />
              {IS_RUNRECS_SITE ? "RunRecs · Race sponsorship" : "AthRecs · Brands & Partners"}
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight md:text-5xl">
              {IS_RUNRECS_SITE
                ? "Put your brand at the heart of race day."
                : "Bring brands, athletes and influencers together."}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
              {IS_RUNRECS_SITE
                ? "Build brand exposure through the races people train for, the communities they belong to and the moments they remember. Connect with organisers across road, trail and ultra running."
                : "Give your brand more exposure through athletes and influencers. Build partnerships around sporting stories, useful content and communities that share your passion."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#enquire" onClick={() => setKind("brand")}>
                  I want to sponsor <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="secondary">
                <a
                  href="#enquire"
                  onClick={() => setKind(IS_RUNRECS_SITE ? "race_organiser" : "creator")}
                >
                  {IS_RUNRECS_SITE ? "Find sponsors for my race" : "Find brand partnerships"}
                </a>
              </Button>
            </div>
          </div>
          <aside className="rounded-xl border border-border bg-accent-soft/40 p-5 md:self-center">
            <p className="text-sm font-semibold text-accent">
              {IS_RUNRECS_SITE
                ? "Connect with a global running community"
                : "Partnerships with purpose"}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Reach people through what moves them.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              From local communities to ambitious campaigns, start with the audience you want to
              reach and the value you can offer.
            </p>
            <p className="mt-4 border-t border-border pt-4 text-sm">
              Enquiries are open. Our team reviews each brief before discussing a potential
              introduction.
            </p>
          </aside>
        </div>
      </header>

      <section aria-label="Partnership ideas" className="grid gap-4 sm:grid-cols-3">
        {(IS_RUNRECS_SITE
          ? [
              {
                icon: Flag,
                title: "Race & title sponsorship",
                text: "Explore naming rights, finish-line branding, race numbers and event communications with an organiser.",
              },
              {
                icon: Package,
                title: "Products & race-day experiences",
                text: "Discuss footwear trials, kit, event-village stands, sampling and practical support for participants.",
              },
              {
                icon: Megaphone,
                title: "Stories beyond race day",
                text: "Connect sponsorship with athlete content, training journeys and campaigns before and after an event.",
              },
            ]
          : [
              {
                icon: Flag,
                title: "Athlete sponsorship",
                text: "Support sporting ambitions through paid partnerships, equipment and long-term ambassador relationships.",
              },
              {
                icon: Megaphone,
                title: "Influencer collaborations",
                text: "Bring your products to relevant audiences through content, honest experiences and clearly disclosed advertising.",
              },
              {
                icon: Package,
                title: "Product partnerships",
                text: "Explore testing, gifted kit and collaborations with clear expectations and agreed usage rights.",
              },
            ]
        ).map(({ icon: Icon, title, text }) => (
          <article className={panelClass} key={title}>
            <Icon className="size-6 text-accent" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </article>
        ))}
      </section>
      <p className="text-sm text-muted">
        These are partnership ideas. Availability, audience figures and rights must be confirmed
        with the organiser or representative.
      </p>

      <section className={`${panelClass} grid gap-5 md:grid-cols-3`} aria-label="How it works">
        {[
          [
            "01",
            "Share your brief",
            "Tell us who you represent, your audience, objectives and the support you can offer or need.",
          ],
          [
            "02",
            "Review the fit",
            "We review your brief and may ask for evidence of authority, audience figures and available sponsorship rights.",
          ],
          [
            "03",
            "Agree the details",
            "Any introduction, deliverables, rights and service fee are agreed in writing before you proceed.",
          ],
        ].map(([number, title, description]) => (
          <div key={number}>
            <span className="text-sm font-semibold text-accent">{number}</span>
            <h2 className="mt-1 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
        ))}
      </section>

      <section id="enquire" className="scroll-mt-24 space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Start a sponsorship enquiry</h2>
          <p className="mt-2 text-muted">
            Your brief stays private to you and authorised staff. Check this page for responses.
          </p>
        </div>
        <div className="max-w-xl">
          <label htmlFor="sponsorship-kind" className="text-sm font-semibold">
            I am a…
          </label>
          <select
            id="sponsorship-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className={inputClass}
          >
            {Object.entries(ENQUIRY_KINDS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <SponsorshipIntake key={kind} kind={kind} />
      </section>
      <section className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <h2 className="font-semibold">
            {IS_RUNRECS_SITE
              ? "Looking for athlete or influencer partnerships?"
              : "Looking to sponsor a running event?"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {IS_RUNRECS_SITE
              ? "Explore brand profiles and athlete opportunities on AthRecs."
              : "Explore race sponsorship on RunRecs."}
          </p>
        </div>
        <Button asChild variant="secondary">
          <a
            href={
              IS_RUNRECS_SITE
                ? "https://www.athrecs.com/brands"
                : "https://www.runrecs.com/sponsorship"
            }
          >
            {IS_RUNRECS_SITE ? "AthRecs partnerships" : "RunRecs race sponsorship"}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Button>
      </section>
    </div>
  );
}

function SponsorshipIntake({ kind }: { kind: Kind }) {
  const { user, isPending } = useCurrentUserState();
  const client = useQueryClient();
  const requestId = useRef<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const query = useQuery({
    queryKey: ["sponsorship", "mine", user?.id],
    queryFn: () => getMySponsorshipEnquiries(),
    enabled: !!user,
    retry: false,
  });
  const refresh = () => client.invalidateQueries({ queryKey: ["sponsorship"] });
  const submit = useMutation({
    mutationFn: (form: FormData) => {
      const value = (name: string) => String(form.get(name) ?? "").trim();
      requestId.current ??= crypto.randomUUID();
      return submitSponsorshipEnquiry({
        data: sponsorshipSchema.parse({
          requestId: requestId.current,
          kind,
          contactName: value("contactName"),
          name: value("name"),
          website: value("website"),
          location: value("location"),
          eventDate: value("eventDate") || undefined,
          support: value("support"),
          budget: value("budget"),
          reach: value("reach"),
          message: value("message"),
          declaration: form.get("declaration") === "on",
          adultConfirmed: form.get("adultConfirmed") === "on",
        }),
      });
    },
    onSuccess: () => {
      requestId.current = null;
      setFormVersion((v) => v + 1);
      return refresh();
    },
  });
  const withdraw = useMutation({
    mutationFn: (id: number) => withdrawSponsorship({ data: { id } }),
    onSuccess: refresh,
  });
  if (isPending || (!!user && query.isLoading)) return <LoadingPartners />;
  if (!user)
    return (
      <section className={panelClass}>
        <h3 className="text-xl font-semibold">Sign in to submit your enquiry</h3>
        <p className="my-3 text-muted">
          Use your {siteName} account. A verified email is required; Google sign-in is available.
        </p>
        <Button
          onClick={() =>
            openAthleteAuth({
              callbackURL: `/sponsorship?kind=${kind}`,
              errorCallbackURL: `/sponsorship?kind=${kind}`,
            })
          }
        >
          Sign in or create account
        </Button>
      </section>
    );
  if (query.isError) return <PartnerError error={query.error} />;
  return (
    <div className="space-y-6">
      {!query.data?.emailVerified ? (
        <p className="rounded-lg bg-elevated p-4 text-sm">
          A verified email is required. Sign in with Google or verify your account email.
        </p>
      ) : null}
      {submit.isSuccess ? (
        <p role="status" className="rounded-lg bg-accent-soft p-4">
          Enquiry #{submit.data.id} saved for review. You can follow its status and read responses
          below.
        </p>
      ) : null}
      <form
        key={`${kind}-${formVersion}`}
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate(new FormData(e.currentTarget));
        }}
        className={`${panelClass} space-y-5`}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" name="contactName" max={120} />
          <Field
            label={
              kind === "race_organiser"
                ? "Race or event name"
                : kind === "creator"
                  ? "Athlete or creator name"
                  : "Company or brand name"
            }
            name="name"
            max={160}
          />
          <Field
            label={kind === "creator" ? "Public profile or website" : "Official website"}
            name="website"
            type="url"
            max={1000}
            hint="Use an https:// link you are authorised to represent."
          />
          <Field
            label={
              kind === "race_organiser" ? "Race location and country" : "Location or target markets"
            }
            name="location"
            max={200}
          />
          {kind === "race_organiser" ? (
            <Field label="Race date" name="eventDate" type="date" />
          ) : null}
          <SelectField
            label="Type of support"
            name="support"
            options={SUPPORT_TYPES}
            value="mixed"
          />
        </div>
        <label className="block text-sm font-semibold">
          Budget or support value (optional)
          <input
            name="budget"
            maxLength={160}
            className={inputClass}
            placeholder="Include currency, or say you are open to discussion"
          />
        </label>
        <label className="block text-sm font-semibold">
          Audience and evidence (optional)
          <textarea
            name="reach"
            maxLength={600}
            rows={3}
            className={inputClass}
            placeholder="Participant numbers, followers or engagement — include the source and date, and distinguish estimates from actual figures"
          />
        </label>
        <Field
          label="Your sponsorship brief"
          name="message"
          multiline
          min={30}
          max={3000}
          hint={
            kind === "race_organiser"
              ? "Explain the packages or rights you can offer, the support needed and any existing sponsor restrictions. Do not include participant contact details."
              : "Describe your objectives, audience, timing and what you can offer. Do not include private information about other people."
          }
        />
        <Declaration name="adultConfirmed">I am 18 or over.</Declaration>
        <Declaration>
          I am authorised to represent the brand, race or public profile above. I agree to staff
          reviewing this enquiry as described in the{" "}
          <Link to="/privacy" className="text-accent underline">
            privacy notice
          </Link>
          . This does not authorise public listing, sharing my details with a sponsor, or marketing
          emails.
        </Declaration>
        <p className="text-sm text-muted">
          Submitting is free and does not book a sponsorship. Any service fee will be set out and
          agreed in writing before you proceed. Sponsorship is not guaranteed.
        </p>
        <PartnerError error={submit.error} />
        <Button type="submit" disabled={submit.isPending || !query.data?.emailVerified}>
          {submit.isPending ? "Saving enquiry…" : "Submit private enquiry"}
        </Button>
      </form>
      <section className="space-y-4" aria-label="Your sponsorship enquiries">
        <h3 className="font-display text-xl font-semibold">Your enquiries</h3>
        <PartnerError error={withdraw.error} />
        {!query.data?.enquiries.length ? (
          <p className="text-sm text-muted">
            Your saved enquiries and team responses will appear here.
          </p>
        ) : null}
        {query.data?.enquiries.map((item) => (
          <article key={item.id} className={`${panelClass} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold">
                #{item.id} · {item.name}
              </h4>
              <span className="rounded-full bg-elevated px-3 py-1 text-sm">
                {ENQUIRY_STATUSES[item.status]}
              </span>
            </div>
            <SponsorshipDetails enquiry={item} />
            {item.status === "pending" || item.status === "in_review" ? (
              <Button
                variant="secondary"
                disabled={withdraw.isPending}
                onClick={() => {
                  if (window.confirm("Withdraw this enquiry? The team will stop progressing it."))
                    withdraw.mutate(Number(item.id));
                }}
              >
                Withdraw enquiry
              </Button>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
