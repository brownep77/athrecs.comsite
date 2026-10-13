import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ClubCheck,
  ClubError,
  ClubField,
  clubInput,
  clubPanel,
} from "@/components/clubs/ClubRegistration";
import {
  getClubRegistrationReviewQueue,
  reviewClubRegistration,
} from "@/lib/clubs/registration-api";
import {
  CLUB_STATUS_LABELS,
  type ClubReview,
  type ClubReviewApplication,
} from "@/lib/clubs/registration";
import { listClubs } from "@/lib/athrecs/api";

export const Route = createFileRoute("/admin/club-registrations")({
  head: () => ({
    meta: [
      { title: "Club representative review | ATHRECS Staff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClubRegistrationReview,
});
function ClubRegistrationReview() {
  const [status, setStatus] = useState<
    "pending" | "needs_changes" | "approved" | "rejected" | "revoked" | "withdrawn"
  >("pending");
  const [page, setPage] = useState(1);
  const queue = useQuery({
    queryKey: ["club-registration-review", status, page],
    queryFn: () => getClubRegistrationReviewQueue({ data: { status, page } }),
    retry: false,
    gcTime: 0,
  });
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-semibold">Club registrations</h1>
        <p className="mt-2 text-muted">
          Verify the club and the representative's authority independently. A directory badge,
          affiliation number or matching email domain alone is not sufficient.
        </p>
      </header>
      <label className="block max-w-md text-sm font-semibold">
        Application status
        <select
          className={clubInput}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
        >
          {["pending", "needs_changes", "approved", "rejected", "revoked", "withdrawn"].map((s) => (
            <option key={s} value={s}>
              {CLUB_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <ClubError error={queue.error} />
      {queue.isError && <Button onClick={() => void queue.refetch()}>Retry</Button>}
      {queue.isPending && <p role="status">Loading review queue…</p>}
      {queue.data && (
        <p>
          {queue.data.total} applications · Page {page}
        </p>
      )}
      {queue.data?.applications.length === 0 && <p>No applications in this view.</p>}
      {queue.data?.applications.map((app) => (
        <ReviewApplication
          key={`${app.id}-${app.revision}`}
          app={app}
          refresh={() => queue.refetch()}
        />
      ))}
      <div className="flex gap-3">
        <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={!queue.data || page * 25 >= queue.data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
function ReviewApplication({
  app,
  refresh,
}: {
  app: ClubReviewApplication;
  refresh: () => unknown;
}) {
  const [message, setMessage] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [identityChecked, setIdentity] = useState(false);
  const [authorityChecked, setAuthority] = useState(false);
  const [resolvedClub, setResolvedClub] = useState("");
  const [createListing, setCreateListing] = useState(false);
  const clubs = useQuery({
    queryKey: ["club-registration-directory"],
    queryFn: () => listClubs({ data: {} }),
    enabled: !app.club_id,
    staleTime: 60000,
  });
  const review = useMutation({
    mutationFn: (action: ClubReview["action"]) =>
      reviewClubRegistration({
        data: {
          id: app.id,
          revision: app.revision,
          action,
          message,
          evidenceNote,
          identityChecked,
          authorityChecked,
          resolvedClubId: resolvedClub ? Number(resolvedClub) : undefined,
          createListing,
        },
      }),
    onSuccess: refresh,
  });
  const d = app.details;
  const canReview = ["pending", "needs_changes", "approved"].includes(app.status);
  return (
    <article className={clubPanel}>
      <h2 className="text-xl font-semibold">{app.club_name ?? d.clubName}</h2>
      <p>
        {CLUB_STATUS_LABELS[app.status]} · {app.active_representatives} approved representative(s)
        already on this club
      </p>
      {app.active_representatives > 0 && app.status !== "approved" && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
          Confirm this additional appointment through the club's independent contact. Check for
          competing claims before granting access.
        </p>
      )}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {[
          ["Applicant", `${d.representativeName} · ${d.representativeRole}`],
          ["Verified email at submission", app.submitted_email],
          ["Club contact supplied by applicant", d.clubEmail],
          ["Phone", d.phone],
          ["Location", [d.city, d.county, d.country].filter(Boolean).join(", ")],
          [
            "Affiliation (self-reported)",
            `${d.affiliation} ${d.governingBody} ${d.affiliationNumber}`,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold">{label}</dt>
            <dd className="break-all">{value || "Not supplied"}</dd>
          </div>
        ))}
      </dl>
      {[d.website, d.evidenceUrl].filter(Boolean).map((url, i) => (
        <a
          key={`${url}-${i}`}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="block break-all text-sm text-accent underline"
        >
          {url}
        </a>
      ))}
      <p className="whitespace-pre-wrap break-words">{d.authorityDetails}</p>
      {app.review_message && <p>Previous message: {app.review_message}</p>}
      {canReview && (
        <>
          <p className="text-sm text-muted">
            Treat submitted links and text as unverified evidence. Find official contacts
            independently. Record what you checked; do not request or store government ID in this
            form.
          </p>
          {!app.club_id && (
            <>
              <ClubError error={clubs.error} />
              <label className="block text-sm font-semibold">
                Resolve the missing club
                <select
                  value={resolvedClub}
                  onChange={(e) => {
                    setResolvedClub(e.target.value);
                    setCreateListing(false);
                  }}
                  className={clubInput}
                >
                  <option value="">Select an existing listing…</option>
                  {clubs.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.city} · {c.country}
                    </option>
                  ))}
                </select>
              </label>
              <ClubCheck
                checked={createListing}
                onChange={(v) => {
                  setCreateListing(v);
                  if (v) setResolvedClub("");
                }}
              >
                I checked for duplicates and approve adding the submitted club details as a new
                public directory listing.
              </ClubCheck>
            </>
          )}
          <ClubField
            label="Message to the applicant"
            value={message}
            onChange={setMessage}
            multiline
            max={2000}
            hint="Visible to the applicant. Explain the decision or the information needed."
          />
          <ClubField
            label="Private verification record"
            value={evidenceNote}
            onChange={setEvidenceNote}
            multiline
            max={4000}
            hint="Staff only. Record the independently checked club identity, contact route, authority evidence and date. At least 30 characters."
          />
          {app.status !== "approved" && (
            <>
              <ClubCheck checked={identityChecked} onChange={setIdentity}>
                I independently checked the club identity and selected the correct listing.
              </ClubCheck>
              <ClubCheck checked={authorityChecked} onChange={setAuthority}>
                I independently confirmed this person's identity, appointment and authority to
                represent the club.
              </ClubCheck>
            </>
          )}
          <ClubError error={review.error} />
          <div className="flex flex-wrap gap-2">
            {(app.status === "approved"
              ? (["revoked"] as const)
              : (["approved", "needs_changes", "rejected"] as const)
            ).map((action) => (
              <Button
                key={action}
                variant={action === "approved" ? "default" : "secondary"}
                disabled={
                  review.isPending ||
                  message.trim().length < 10 ||
                  evidenceNote.trim().length < 30 ||
                  (action === "approved" && (!identityChecked || !authorityChecked))
                }
                onClick={() => review.mutate(action)}
              >
                {action === "approved"
                  ? "Approve representative"
                  : action === "needs_changes"
                    ? "Request more information"
                    : action === "revoked"
                      ? "Remove representative access"
                      : "Reject application"}
              </Button>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
