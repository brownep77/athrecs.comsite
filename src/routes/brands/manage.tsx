import {
  formText,
  usePartnerAccount,
  useRefreshPartners,
} from "@/components/partners/partner-hooks";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  PartnerArea,
  PartnerHeader,
  PartnerSignIn,
  PartnerError,
  PartnerStatus,
  LoadingPartners,
  Field,
  SelectField,
  Declaration,
  panelClass,
} from "@/components/partners/PartnerUI";
import {
  saveOpportunity,
  closePartnerOpportunity,
  replyToPartnerApplication,
} from "@/lib/athrecs/partnerships-api";
import {
  OPPORTUNITY_KINDS,
  opportunitySchema,
  type PrivateOpportunity,
  type PartnerApplication,
} from "@/lib/athrecs/partnerships";

export const Route = createFileRoute("/brands/manage")({
  head: () => ({
    meta: [{ title: "Brand dashboard | ATHRECS" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <PartnerArea>
      <BrandDashboard />
    </PartnerArea>
  ),
});
function BrandDashboard() {
  const { user, isPending, query } = usePartnerAccount();
  const refresh = useRefreshPartners();
  const [editing, setEditing] = useState<PrivateOpportunity | null>(null);
  const [creating, setCreating] = useState(false);
  const close = useMutation({
    mutationFn: (id: number) => closePartnerOpportunity({ data: { id } }),
    onSuccess: refresh,
  });
  const data = query.data;
  return (
    <>
      <PartnerHeader
        title="Your brand dashboard"
        description="Manage your registration, submit opportunities and respond to applications shared with your company."
      />
      {isPending || query.isLoading ? (
        <LoadingPartners />
      ) : !user ? (
        <PartnerSignIn path="/brands/manage" />
      ) : query.isError ? (
        <PartnerError error={query.error} />
      ) : !data?.brand ? (
        <section className={panelClass}>
          <h2 className="font-display text-2xl">Register your company first</h2>
          <p className="my-3 text-muted">
            Create one company profile for this account. You can submit opportunities after
            approval.
          </p>
          <Button asChild>
            <Link to="/brands/register">Register your brand</Link>
          </Button>
        </section>
      ) : (
        <>
          <section className={panelClass}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">{data.brand.name}</h2>
                <p className="mt-2 text-muted">
                  {data.brand.sports} · {data.brand.markets}
                </p>
              </div>
              <PartnerStatus status={data.brand.status} />
            </div>
            {data.brand.review_note ? (
              <p className="mt-4 rounded-lg bg-elevated p-3 text-sm">{data.brand.review_note}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link to="/brands/register">Edit registration</Link>
              </Button>
              {data.brand.status === "approved" ? (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setCreating(true);
                  }}
                >
                  Create opportunity
                </Button>
              ) : (
                <p className="self-center text-sm text-muted">
                  Opportunities unlock when your company is approved.
                </p>
              )}
            </div>
          </section>
          {(creating || editing) && data.brand.status === "approved" ? (
            <OpportunityForm
              key={editing ? `${editing.id}-${editing.revision}` : "new"}
              opportunity={editing}
              sports={data.brand.sports}
              markets={data.brand.markets}
              onDone={() => {
                setEditing(null);
                setCreating(false);
              }}
            />
          ) : null}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Your opportunities</h2>
            <PartnerError error={close.error} />
            {!data.opportunities.length ? (
              <p className={`${panelClass} text-muted`}>
                You have not submitted an opportunity yet.
              </p>
            ) : (
              data.opportunities.map((o) => (
                <article key={o.id} className={panelClass}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-sm text-accent">{OPPORTUNITY_KINDS[o.kind]}</p>
                      <h3 className="mt-1 text-lg font-semibold">{o.title}</h3>
                      <p className="mt-1 text-sm text-muted">Closes {o.closing_date}</p>
                    </div>
                    <PartnerStatus status={o.status} />
                  </div>
                  {o.review_note ? (
                    <p className="mt-3 text-sm text-muted">Review: {o.review_note}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      disabled={data.brand?.status !== "approved"}
                      onClick={() => {
                        setEditing(o);
                        setCreating(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Edit and resubmit
                    </Button>
                    {o.status !== "closed" ? (
                      <Button
                        variant="secondary"
                        disabled={close.isPending}
                        onClick={() => {
                          if (window.confirm("Close this opportunity to new applications?"))
                            close.mutate(o.id);
                        }}
                      >
                        Close opportunity
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Applications shared with you</h2>
            <p className="text-sm text-muted">
              Applicants choose what to share. Replies stay inside AthRecs; check your dashboard for
              updates.
            </p>
            {data.incoming.length ? (
              data.incoming.map((a) => <BrandApplication key={a.id} application={a} />)
            ) : (
              <p className={`${panelClass} text-muted`}>
                No applications have been shared with your company yet.
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}
function OpportunityForm({
  opportunity,
  sports,
  markets,
  onDone,
}: {
  opportunity: PrivateOpportunity | null;
  sports: string;
  markets: string;
  onDone: () => void;
}) {
  const refresh = useRefreshPartners();
  const save = useMutation({
    mutationFn: (form: FormData) =>
      saveOpportunity({
        data: opportunitySchema.parse({
          id: opportunity?.id,
          revision: opportunity?.revision,
          title: formText(form, "title"),
          kind: formText(form, "kind"),
          audience: formText(form, "audience"),
          description: formText(form, "description"),
          benefits: formText(form, "benefits"),
          requirements: formText(form, "requirements"),
          sports: formText(form, "sports"),
          markets: formText(form, "markets"),
          closingDate: formText(form, "closingDate"),
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
      className={`${panelClass} space-y-5`}
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(new FormData(e.currentTarget));
      }}
    >
      <h2 className="font-display text-2xl font-semibold">
        {opportunity ? "Edit opportunity" : "Create an opportunity"}
      </h2>
      <p className="text-sm text-muted">
        Every submission is reviewed before publication. State the compensation, obligations and any
        exclusivity clearly. Once someone applies, close this opportunity and create a new one to
        change its terms.
      </p>
      <Field name="title" label="Opportunity title" value={opportunity?.title} min={5} max={140} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Opportunity type"
          name="kind"
          value={opportunity?.kind}
          options={OPPORTUNITY_KINDS}
        />
        <SelectField
          label="Who can apply?"
          name="audience"
          value={opportunity?.audience}
          options={{
            athletes: "Athletes aged 18+",
            clubs: "Authorised club representatives aged 18+",
            both: "Athletes and club representatives aged 18+",
          }}
        />
      </div>
      <Field
        name="description"
        label="About the opportunity"
        value={opportunity?.description}
        min={30}
        max={4000}
        multiline
      />
      <Field
        name="benefits"
        label="What you offer"
        value={opportunity?.benefits}
        min={5}
        max={1000}
        multiline
        hint="Specify money, products, discounts or commission, including amounts or value where relevant."
      />
      <Field
        name="requirements"
        label="What you expect in return"
        value={opportunity?.requirements}
        min={5}
        max={1500}
        multiline
        hint="Include deliverables, usage rights, exclusivity, costs and any eligibility requirements."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="sports" label="Sports" value={opportunity?.sports ?? sports} />
        <Field
          name="markets"
          label="Countries or markets"
          value={opportunity?.markets ?? markets}
        />
      </div>
      <Field
        name="closingDate"
        label="Application closing date"
        type="date"
        value={opportunity?.closing_date}
      />
      <Declaration>
        I am authorised to offer these terms. Advertising and product claims will follow applicable
        rules, and use of an athlete's name, image or content requires their separate agreement.
      </Declaration>
      <PartnerError error={save.error} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Submitting…" : "Submit for review"}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
function BrandApplication({ application }: { application: PartnerApplication }) {
  const refresh = useRefreshPartners();
  const reply = useMutation({
    mutationFn: (response: string) =>
      replyToPartnerApplication({ data: { id: application.id, response } }),
    onSuccess: refresh,
  });
  return (
    <article className={panelClass}>
      <p className="text-sm text-accent">{application.title}</p>
      <h3 className="mt-1 text-lg font-semibold">{application.display_name}</h3>
      <p className="mt-1 text-sm text-muted">
        {application.applicant_kind === "club"
          ? "Club representative checked for this application"
          : "Linked athlete profile checked"}
      </p>
      {application.club_website ? (
        <a
          href={application.club_website}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-sm text-accent underline"
        >
          Club website
        </a>
      ) : null}
      <p className="mt-4 whitespace-pre-wrap break-words">{application.message}</p>
      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          reply.mutate(formText(new FormData(e.currentTarget), "response"));
        }}
      >
        <Field
          label="Your reply"
          name="response"
          value={application.brand_response}
          min={5}
          max={2000}
          multiline
        />
        <PartnerError error={reply.error} />
        {reply.isSuccess ? (
          <p role="status" className="text-sm text-accent">
            Reply saved in the applicant's dashboard.
          </p>
        ) : null}
        <Button type="submit" disabled={reply.isPending}>
          {reply.isPending ? "Saving…" : "Save reply"}
        </Button>
      </form>
    </article>
  );
}
