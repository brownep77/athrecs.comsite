import {
  formText,
  usePartnerAccount,
  useRefreshPartners,
} from "@/components/partners/partner-hooks";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  PartnerArea,
  PartnerHeader,
  PartnerSignIn,
  PartnerError,
  PartnerStatus,
  LoadingPartners,
  Field,
  Declaration,
  panelClass,
  inputClass,
} from "@/components/partners/PartnerUI";
import {
  getPublicPartnerships,
  submitPartnerApplication,
  savePartnershipChoices,
  withdrawPartnerApplication,
} from "@/lib/athrecs/partnerships-api";
import {
  OPPORTUNITY_KINDS,
  applicationSchema,
  type Opportunity,
  type PreferenceInput,
} from "@/lib/athrecs/partnerships";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Athlete & club opportunities | ATHRECS" },
      {
        name: "description",
        content:
          "Explore reviewed sponsorships, product testing and brand collaborations for athletes and clubs.",
      },
    ],
  }),
  component: () => (
    <PartnerArea>
      <Opportunities />
    </PartnerArea>
  ),
});
function Opportunities() {
  const [kind, setKind] = useState("");
  const [applying, setApplying] = useState<number | null>(null);
  const { user, isPending, query } = usePartnerAccount();
  const refresh = useRefreshPartners();
  const directory = useQuery({
    queryKey: ["partners", "public"],
    queryFn: () => getPublicPartnerships(),
  });
  const withdraw = useMutation({
    mutationFn: (id: number) => withdrawPartnerApplication({ data: { id } }),
    onSuccess: refresh,
  });
  const opportunities = directory.data?.opportunities.filter((o) => !kind || o.kind === kind) ?? [];
  return (
    <>
      <PartnerHeader
        title="Opportunities for your next chapter"
        description="Build partnerships with brands through sponsorship, content and product experiences. Share your sporting story, reach new audiences and choose the opportunities that fit you."
      />
      <p className="text-sm text-muted">
        Athlete and club applications use the profile checks below. Influencers can{" "}
        <Link
          to="/sponsorship"
          search={{ kind: "creator" }}
          className="font-semibold text-accent underline"
        >
          submit a private partnership enquiry
        </Link>
        .
      </p>
      {isPending || query.isLoading ? <LoadingPartners /> : null}
      <PartnerError error={query.error} />
      {query.data && user ? (
        <PartnershipChoices
          key={JSON.stringify(query.data.preferences)}
          preferences={query.data.preferences}
        />
      ) : null}
      <div className="max-w-sm">
        <label className="text-sm font-semibold" htmlFor="opportunity-kind">
          Opportunity type
        </label>
        <select
          id="opportunity-kind"
          className={inputClass}
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="">All opportunities</option>
          {Object.entries(OPPORTUNITY_KINDS).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <PartnerError error={directory.error} />
      {directory.isLoading ? <LoadingPartners /> : null}
      {directory.data && !opportunities.length ? (
        <section className={`${panelClass} py-10`}>
          <h2 className="font-display text-2xl font-semibold">
            No open opportunities{kind ? " of this type" : " yet"}
          </h2>
          <p className="mt-3 text-muted">
            Approved opportunities will appear here as brands join. Companies can register now and
            submit their first proposal after approval.
          </p>
          <Button asChild className="mt-4">
            <Link to="/brands/register">Register a brand</Link>
          </Button>
        </section>
      ) : null}
      <div className="space-y-4">
        {opportunities.map((o) => (
          <article className={panelClass} key={o.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-accent">
                  {o.brand_name} · {OPPORTUNITY_KINDS[o.kind]}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{o.title}</h2>
              </div>
              <p className="rounded-lg bg-elevated px-3 py-2 text-sm">Closes {o.closing_date}</p>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words">{o.description}</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-semibold">What is offered</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-muted">{o.benefits}</dd>
              </div>
              <div>
                <dt className="font-semibold">What is expected</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-muted">
                  {o.requirements}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">
              {o.sports} · {o.markets} ·{" "}
              {o.audience === "both"
                ? "Athletes and clubs"
                : o.audience === "clubs"
                  ? "Clubs"
                  : "Athletes"}
            </p>
            {applying === o.id ? (
              !user ? (
                <div className="mt-5">
                  <PartnerSignIn path="/opportunities" />
                </div>
              ) : query.data ? (
                <ApplicationForm
                  opportunity={o}
                  athletes={query.data.athletes}
                  onDone={() => setApplying(null)}
                />
              ) : (
                <LoadingPartners />
              )
            ) : (
              <Button
                className="mt-5"
                disabled={query.data?.applications.some((a) => a.opportunity_id === o.id)}
                onClick={() => setApplying(o.id)}
              >
                {query.data?.applications.some((a) => a.opportunity_id === o.id)
                  ? "Application recorded"
                  : "Apply privately"}
              </Button>
            )}
          </article>
        ))}
      </div>
      {user && query.data ? (
        <section className="space-y-4" aria-labelledby="my-applications">
          <h2 id="my-applications" className="font-display text-2xl font-semibold">
            My applications
          </h2>
          <p className="text-sm text-muted">
            Check here for review decisions and brand replies. Email notifications are not enabled.
          </p>
          <PartnerError error={withdraw.error} />
          {!query.data.applications.length ? (
            <p className={`${panelClass} text-muted`}>
              You have not applied to an opportunity yet.
            </p>
          ) : (
            query.data.applications.map((a) => (
              <article key={a.id} className={panelClass}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted">
                      {a.brand_name} · {a.display_name}
                    </p>
                  </div>
                  <PartnerStatus status={a.status} />
                </div>
                <p className="mt-4 whitespace-pre-wrap break-words">{a.message}</p>
                {a.review_note ? (
                  <p className="mt-3 text-sm text-muted">Review: {a.review_note}</p>
                ) : null}
                {a.brand_response ? (
                  <div className="mt-4 rounded-lg bg-elevated p-4">
                    <h4 className="font-semibold">Brand reply</h4>
                    <p className="mt-2 whitespace-pre-wrap break-words">{a.brand_response}</p>
                  </div>
                ) : null}
                {["pending", "shared"].includes(a.status) ? (
                  <Button
                    className="mt-4"
                    variant="secondary"
                    disabled={withdraw.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Withdraw this application and remove the brand's access to it?",
                        )
                      )
                        withdraw.mutate(a.id);
                    }}
                  >
                    Withdraw application
                  </Button>
                ) : null}
              </article>
            ))
          )}
        </section>
      ) : null}
    </>
  );
}
function PartnershipChoices({ preferences }: { preferences: PreferenceInput }) {
  const refresh = useRefreshPartners();
  const [form, setForm] = useState(preferences);
  const save = useMutation({
    mutationFn: () => savePartnershipChoices({ data: form }),
    onSuccess: refresh,
  });
  const choices = [
    ["sponsorship", "Sponsorship, ambassador roles and paid collaborations"],
    ["productTesting", "Product testing and gifted equipment"],
    ["offers", "Discounts and affiliate offers"],
    ["adultConfirmed", "I confirm I am aged 18 or over"],
  ] as const;
  return (
    <section className={`${panelClass} space-y-4`}>
      <h2 className="font-display text-xl font-semibold">Your partnership choices</h2>
      <p className="text-sm text-muted">
        These choices allow you to apply. Your profile and contact details remain private. Turning a
        category off withdraws your athlete applications in that category; it cannot recall
        information already read by a brand.
      </p>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {choices.map(([key, label]) => (
          <label className="flex items-start gap-3 text-sm leading-6" key={key}>
            <input
              className="mt-1 size-4 shrink-0 accent-accent"
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.checked }))}
            />
            <span>{label}</span>
          </label>
        ))}
        <PartnerError error={save.error} />
        {save.isSuccess ? (
          <p role="status" className="text-sm text-accent">
            Choices saved.
          </p>
        ) : null}
        <Button type="submit" variant="secondary" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save choices"}
        </Button>
      </form>
    </section>
  );
}
function ApplicationForm({
  opportunity,
  athletes,
  onDone,
}: {
  opportunity: Opportunity;
  athletes: Array<{ id: number; name: string }>;
  onDone: () => void;
}) {
  const [kind, setKind] = useState(opportunity.audience === "clubs" ? "club" : "athlete");
  const refresh = useRefreshPartners();
  const apply = useMutation({
    mutationFn: (form: FormData) =>
      submitPartnerApplication({
        data: applicationSchema.parse({
          opportunityId: opportunity.id,
          applicantKind: kind,
          athleteId: kind === "athlete" ? Number(form.get("athleteId")) : undefined,
          clubName: kind === "club" ? formText(form, "clubName") : undefined,
          clubWebsite: kind === "club" ? formText(form, "clubWebsite") : undefined,
          message: formText(form, "message"),
          adultConfirmed: form.get("adultConfirmed") === "on",
          declaration: form.get("declaration") === "on",
        }),
      }),
    onSuccess: async () => {
      await refresh();
      onDone();
    },
  });
  return (
    <form
      className="mt-6 space-y-4 border-t border-border pt-5"
      onSubmit={(e) => {
        e.preventDefault();
        apply.mutate(new FormData(e.currentTarget));
      }}
    >
      <h3 className="text-lg font-semibold">Apply to {opportunity.brand_name}</h3>
      {opportunity.audience === "both" ? (
        <label className="block text-sm font-semibold">
          Applying as
          <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="athlete">Athlete</option>
            <option value="club">Club representative</option>
          </select>
        </label>
      ) : null}
      {kind === "athlete" ? (
        athletes.length ? (
          <label className="block text-sm font-semibold">
            Your claimed profile
            <select name="athleteId" required className={inputClass}>
              {athletes.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="rounded-lg bg-elevated p-4 text-sm">
            You need an approved athlete claim to apply as an athlete.{" "}
            <Link to="/athlete-account" className="text-accent underline">
              Find and claim your results
            </Link>
            .
          </p>
        )
      ) : (
        <>
          <Field label="Club name" name="clubName" max={120} />
          <Field label="Official club website" name="clubWebsite" type="url" max={1000} />
          <p className="text-sm text-muted">
            AthRecs will check your authority through an independently sourced club contact before
            sharing this application.
          </p>
        </>
      )}
      <Field
        label="Your application"
        name="message"
        min={20}
        max={2000}
        multiline
        hint="Describe your suitability and any existing sponsorship restrictions. Include only details you want this brand to receive."
      />
      <Declaration name="adultConfirmed">I am aged 18 or over.</Declaration>
      <Declaration>
        {kind === "club" ? "I am authorised to act for this club. " : "I am applying for myself. "}I
        agree to share the displayed name, club website if applicable, and this message with{" "}
        {opportunity.brand_name} after review. My account email, private preferences and other
        profile details remain private. Applying does not grant advertising or image rights.
      </Declaration>
      <PartnerError error={apply.error} />
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={apply.isPending || (kind === "athlete" && !athletes.length)}
          type="submit"
        >
          {apply.isPending ? "Submitting…" : "Submit application"}
        </Button>
        <Button disabled={apply.isPending} type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
