import { formText, useRefreshPartners } from "@/components/partners/partner-hooks";
import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Field,
  PartnerError,
  PartnerStatus,
  LoadingPartners,
  panelClass,
} from "@/components/partners/PartnerUI";
import { getPartnershipReviewQueue, reviewPartnership } from "@/lib/athrecs/partnerships-api";
import { BRAND_CATEGORIES, OPPORTUNITY_KINDS, type ReviewInput } from "@/lib/athrecs/partnerships";

export const Route = createFileRoute("/admin/partnerships")({
  head: () => ({
    meta: [
      { title: "Partnership review | ATHRECS Staff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PartnershipReview,
});
function PartnershipReview() {
  const [section, setSection] = useState<"brands" | "opportunities" | "applications">("brands");
  const queue = useQuery({
    queryKey: ["partners", "review"],
    queryFn: () => getPartnershipReviewQueue(),
    retry: false,
  });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Partnership review</h1>
        <p className="mt-2 text-slate-600">
          Check companies, opportunities and private applications before they are published or
          shared.
        </p>
      </header>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Review category">
        {(["brands", "opportunities", "applications"] as const).map((key) => (
          <Button
            key={key}
            variant={section === key ? "default" : "secondary"}
            onClick={() => setSection(key)}
            aria-pressed={section === key}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
            {queue.data ? `(${queue.data[key].length})` : ""}
          </Button>
        ))}
      </div>
      <PartnerError error={queue.error} />
      {queue.isLoading ? <LoadingPartners /> : null}
      {queue.data && !queue.data[section].length ? (
        <p className={panelClass}>Nothing to review in this section.</p>
      ) : null}
      {section === "brands"
        ? queue.data?.brands.map((b) => (
            <ReviewCard
              key={`${b.id}-${b.revision}`}
              entity="brand"
              id={b.id}
              revision={b.revision}
              title={b.name}
              status={b.status}
              actions={["approved", "needs_changes", "rejected", "suspended"]}
              guidance="Check the business using independent sources and confirm this person's authority through an independently sourced company contact. Record the evidence checked. Approval confirms business identity, not product quality."
            >
              <p>
                {BRAND_CATEGORIES[b.category]} · {b.sports} · {b.markets}
              </p>
              <a
                href={b.website}
                target="_blank"
                rel="noreferrer"
                className="break-all text-accent underline"
              >
                {b.website}
              </a>
              <p className="whitespace-pre-wrap break-words">{b.description}</p>
              <p className="font-medium">
                Representative: {b.contact_name} · {b.contact_role}
              </p>
              <p className="break-all text-sm">Private account email: {b.email}</p>
              {b.review_note ? <p>Previous review: {b.review_note}</p> : null}
            </ReviewCard>
          ))
        : null}
      {section === "opportunities"
        ? queue.data?.opportunities.map((o) => (
            <ReviewCard
              key={`${o.id}-${o.revision}`}
              entity="opportunity"
              id={o.id}
              revision={o.revision}
              title={o.title}
              status={o.status}
              actions={["approved", "needs_changes", "rejected"]}
              guidance="Check compensation, obligations, eligibility, exclusivity and advertising rights. For nutrition products check the proposed health or performance claims; a business identity check does not approve them."
            >
              <p className="font-medium">
                {o.brand_name} · {OPPORTUNITY_KINDS[o.kind]}
              </p>
              <p>
                {o.sports} · {o.markets} · {o.audience} · closes {o.closing_date}
              </p>
              <p className="whitespace-pre-wrap break-words">{o.description}</p>
              <p className="whitespace-pre-wrap break-words">
                <strong>Offers: </strong>
                {o.benefits}
              </p>
              <p className="whitespace-pre-wrap break-words">
                <strong>Expects: </strong>
                {o.requirements}
              </p>
              {o.review_note ? <p>Previous review: {o.review_note}</p> : null}
            </ReviewCard>
          ))
        : null}
      {section === "applications"
        ? queue.data?.applications.map((a) => (
            <ReviewCard
              key={`${a.id}-${a.revision}`}
              entity="application"
              id={a.id}
              revision={a.revision}
              title={a.display_name}
              status={a.status}
              actions={["shared", "declined"]}
              guidance={
                a.applicant_kind === "club"
                  ? "Confirm the club exists and this person's authority through an independently sourced secretary or chair contact. A website link or email address alone is insufficient. Record the check before sharing."
                  : "Confirm the application belongs to the linked athlete, fits the opportunity and contains only information the applicant intended to share. An approved result claim alone is not an endorsement of every sporting claim."
              }
            >
              <p className="font-medium">
                {a.title} · {a.brand_name}
              </p>
              <p>Applicant type: {a.applicant_kind}</p>
              <p className="text-sm">Private account email: {a.email}</p>
              {a.club_website ? (
                <a
                  href={a.club_website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-accent underline"
                >
                  Club website supplied: {a.club_website}
                </a>
              ) : null}
              <p className="whitespace-pre-wrap break-words">{a.message}</p>
            </ReviewCard>
          ))
        : null}
    </div>
  );
}
function ReviewCard({
  entity,
  id,
  revision,
  title,
  status,
  actions,
  guidance,
  children,
}: {
  entity: ReviewInput["entity"];
  id: number;
  revision: number;
  title: string;
  status: string;
  actions: ReviewInput["action"][];
  guidance: string;
  children: ReactNode;
}) {
  const [action, setAction] = useState<ReviewInput["action"]>(actions[0]);
  const refresh = useRefreshPartners();
  const review = useMutation({
    mutationFn: (form: FormData) =>
      reviewPartnership({ data: { entity, id, revision, action, note: formText(form, "note") } }),
    onSuccess: refresh,
  });
  const labels: Record<string, string> = {
    approved: "Approve",
    needs_changes: "Request changes",
    rejected: "Reject",
    suspended: "Suspend",
    shared: "Approve sharing with brand",
    declined: "Decline sharing",
  };
  return (
    <article className={`${panelClass} space-y-4`}>
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <PartnerStatus status={status} />
      </div>
      <div className="space-y-3 text-sm">{children}</div>
      <p className="rounded-lg bg-elevated p-4 text-sm leading-6">{guidance}</p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (window.confirm(`${labels[action]}: ${title}?`))
            review.mutate(new FormData(e.currentTarget));
        }}
      >
        <Field
          label="Evidence checked and review notes"
          name="note"
          min={10}
          max={2000}
          multiline
          hint="Include the source or contact used. These notes are visible to the applicant; the decision is also recorded in the staff audit history."
        />
        <label className="block text-sm font-semibold">
          Decision
          <select
            className="ml-3 rounded-md border border-border p-2"
            value={action}
            onChange={(e) => setAction(e.target.value as ReviewInput["action"])}
          >
            {actions.map((a) => (
              <option key={a} value={a}>
                {labels[a]}
              </option>
            ))}
          </select>
        </label>
        <PartnerError error={review.error} />
        <Button type="submit" disabled={review.isPending}>
          {review.isPending ? "Saving…" : "Confirm decision"}
        </Button>
      </form>
    </article>
  );
}
