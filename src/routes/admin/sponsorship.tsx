import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Field,
  LoadingPartners,
  PartnerError,
  SelectField,
  inputClass,
  panelClass,
} from "@/components/partners/PartnerUI";
import { SponsorshipDetails } from "@/components/partners/SponsorshipDetails";
import { ENQUIRY_STATUSES, type SponsorshipEnquiry } from "@/lib/sponsorship";
import { getSponsorshipReviewQueue, reviewSponsorship } from "@/lib/sponsorship-api";

export const Route = createFileRoute("/admin/sponsorship")({
  head: () => ({
    meta: [
      { title: "Sponsorship enquiries | Staff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SponsorshipReview,
});
function SponsorshipReview() {
  const [status, setStatus] = useState<keyof typeof ENQUIRY_STATUSES>("pending");
  const query = useQuery({
    queryKey: ["sponsorship", "review", status],
    queryFn: () => getSponsorshipReviewQueue({ data: { status } }),
    retry: false,
  });
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-semibold">Sponsorship enquiries</h1>
        <p className="mt-2 text-muted">
          Private race, brand and creator briefs from RunRecs and AthRecs. Responses appear in the
          submitter's dashboard.
        </p>
      </header>
      <p className={panelClass}>
        Check authority to represent the race, company or creator through independent sources. Check
        available rights, exclusivity and evidence for audience claims. Obtain specific permission
        before an introduction and agree fees separately in writing. Updating a status does not
        publish an enquiry or verify a profile.
      </p>
      <div className="max-w-sm">
        <label htmlFor="review-status" className="text-sm font-semibold">
          Status
        </label>
        <select
          id="review-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as keyof typeof ENQUIRY_STATUSES)}
          className={inputClass}
        >
          {Object.entries(ENQUIRY_STATUSES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <PartnerError error={query.error} />
      {query.isLoading ? <LoadingPartners /> : null}
      {query.data ? (
        <p className="text-sm text-muted">
          {query.data.length} enquiries shown · oldest first · up to 100 per status
        </p>
      ) : null}
      {query.data?.map((item) => (
        <EnquiryReview key={`${item.id}-${item.revision}`} enquiry={item} />
      ))}
    </div>
  );
}
function EnquiryReview({ enquiry: item }: { enquiry: SponsorshipEnquiry & { email: string } }) {
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (form: FormData) =>
      reviewSponsorship({
        data: {
          id: Number(item.id),
          revision: item.revision,
          status: form.get("status") as "in_review" | "closed",
          response: String(form.get("response") ?? ""),
        },
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["sponsorship"] }),
  });
  return (
    <article className={`${panelClass} space-y-4`}>
      <h2 className="text-xl font-semibold">
        #{item.id} · {item.name}
      </h2>
      <p className="break-words text-sm">
        {item.source === "runrecs" ? "RunRecs" : "AthRecs"} · {item.contact_name} · {item.email}
      </p>
      <SponsorshipDetails enquiry={item} />
      {item.status === "pending" || item.status === "in_review" ? (
        <form
          className="space-y-4 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(new FormData(e.currentTarget));
          }}
        >
          <SelectField
            label="Review status"
            name="status"
            value="in_review"
            options={{ in_review: "In review", closed: "Close enquiry" }}
          />
          <Field
            label="Response visible to the submitter"
            name="response"
            min={10}
            max={2000}
            multiline
            value={item.response}
            hint="Saved in their enquiry dashboard. No email or third-party introduction is sent."
          />
          <PartnerError error={save.error} />
          <Button disabled={save.isPending} type="submit">
            {save.isPending ? "Saving…" : "Save response and status"}
          </Button>
        </form>
      ) : null}
    </article>
  );
}
