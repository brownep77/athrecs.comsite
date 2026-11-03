import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveEditorialAthleteLink,
  getEditorialAthleteQueue,
} from "@/lib/athrecs/editorial-athletes-api";
import {
  EDITORIAL_ATHLETE_STATUS_LABELS,
  type EditorialAthleteReviewRow,
} from "@/lib/athrecs/editorial-athletes";
import { formatAthleteId } from "@/lib/athrecs/athlete-id";

const inputClass =
  "mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-fg focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

function existingProfileInput(value: string): { slug?: string; error?: string } {
  const input = value.trim();
  if (!input) return {};
  const validSlug = /^[a-z0-9-]{1,180}$/;
  if (validSlug.test(input)) return { slug: input };
  try {
    const url = new URL(input, "https://www.athrecs.com");
    const validHost = url.hostname === "www.athrecs.com" || url.hostname === "athrecs.com";
    const match = url.pathname.match(/^\/athletes\/([a-z0-9-]{1,180})\/?$/);
    if (
      (input.startsWith("/athletes/") || input.startsWith("https://")) &&
      url.protocol === "https:" &&
      validHost &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      match
    )
      return { slug: match[1] };
  } catch {
    // The field is staff-supplied text; a malformed URL stays a validation error.
  }
  return {
    error:
      "Enter an AthRecs athlete profile URL, /athletes/profile-slug, or its lowercase profile slug. Remove any query or fragment from the URL.",
  };
}

export function EditorialAthleteQueue() {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [showLinked, setShowLinked] = useState(false);
  const articles = useQuery({
    queryKey: ["editorial-athlete-articles"],
    queryFn: () => getEditorialAthleteQueue({ data: {} }),
    retry: false,
  });
  const availableArticles = articles.data?.articles ?? [];
  const selected =
    availableArticles.find((article) => article.slug === selectedSlug) ??
    availableArticles.find((article) => article.namedAthletes > 0) ??
    availableArticles[0];
  const slug = selected?.slug ?? "";
  const review = useQuery({
    queryKey: ["editorial-athlete-review", slug],
    queryFn: () => getEditorialAthleteQueue({ data: { slug } }),
    enabled: Boolean(slug),
    retry: false,
  });
  const rows = review.data?.review?.rows ?? [];
  const visible = showLinked ? rows : rows.filter((row) => row.status !== "linked");
  const linkedCount = rows.filter((row) => row.status === "linked").length;
  const error = articles.error ?? review.error;
  const refreshing = articles.isFetching || review.isFetching;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold">Athletes mentioned in articles</h2>
        <p className="max-w-3xl text-sm leading-6 text-muted">
          Connect a named athlete to a checked profile, or use the research flags to build missing
          profiles. Existing private and claimed profiles are included in the check to help avoid
          duplicates.
        </p>
      </div>
      <label className="block text-sm font-semibold">
        Article
        <select
          className={inputClass}
          value={slug}
          disabled={!availableArticles.length}
          onChange={(event) => setSelectedSlug(event.target.value)}
        >
          {!availableArticles.length ? (
            <option value="">
              {articles.isPending
                ? "Loading articles…"
                : articles.error
                  ? "Articles unavailable — use Refresh to retry"
                  : "No articles published yet"}
            </option>
          ) : null}
          {availableArticles.map((article) => (
            <option key={article.slug} value={article.slug}>
              {article.title} ({article.namedAthletes} named athletes)
            </option>
          ))}
        </select>
      </label>
      {selected ? (
        <a
          href={`https://www.athrecs.com/${selected.kind}/${selected.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline"
        >
          Read this article<span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showLinked}
            onChange={(event) => setShowLinked(event.target.checked)}
          />
          Show athletes already linked
        </label>
        <button
          className={buttonClass}
          type="button"
          disabled={refreshing}
          onClick={() => {
            void articles.refetch();
            if (slug) void review.refetch();
          }}
        >
          {refreshing ? "Checking profiles…" : "Refresh profile check"}
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-950"
        >
          {error instanceof Error
            ? error.message
            : "The profile check is unavailable. No athletes have been marked missing."}
        </p>
      ) : null}
      {slug && review.isPending ? (
        <p role="status" className="text-sm text-muted">
          Checking the athletes named in this article…
        </p>
      ) : null}
      {review.data?.review ? (
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {rows.length} named {rows.length === 1 ? "athlete" : "athletes"} · {linkedCount} linked ·{" "}
          {rows.length - linkedCount} need attention. Last successful check:{" "}
          {new Date(review.data.review.checkedAt).toLocaleString("en-GB")}.
        </p>
      ) : null}
      <p className="text-sm leading-6 text-muted">
        A name match needs an identity check. “No name match” is a research flag: check spelling,
        former names and the wider directory before creating a profile. Article links keep the
        athlete’s existing visibility settings.
      </p>
      {review.data?.review && !visible.length ? (
        <p className="rounded-lg border border-border p-4 text-sm">
          {rows.length
            ? "All named athletes in this article have reviewed, available links."
            : "This article has no athlete roster yet. Add all named athletes when preparing its next editorial update."}
        </p>
      ) : null}
      <div className="space-y-4" aria-busy={review.isFetching}>
        {visible.map((row) => (
          <AthleteReviewCard
            key={`${slug}:${row.name}`}
            slug={slug}
            row={row}
            sourceUrl={selected?.sourceUrl ?? ""}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Link to="/admin/athlete-directory" className={buttonClass}>
          Search the full athlete directory
        </Link>
        <Link
          to="/admin/athlete-tools"
          search={{ section: "link", athleteId: undefined }}
          reloadDocument
          className={buttonClass}
        >
          Build or match a profile from a source
        </Link>
      </div>
    </div>
  );
}

function AthleteReviewCard({
  slug,
  row,
  sourceUrl,
}: {
  slug: string;
  row: EditorialAthleteReviewRow;
  sourceUrl: string;
}) {
  const cardId = useId();
  const queryClient = useQueryClient();
  const [athleteId, setAthleteId] = useState("");
  const [manualProfile, setManualProfile] = useState("");
  const [evidence, setEvidence] = useState(sourceUrl);
  const [note, setNote] = useState("");
  const [identityChecked, setIdentityChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const parsedProfile = existingProfileInput(manualProfile);
  const canRemove = row.status === "linked" || row.status === "link-unavailable";
  const hasEvidence = identityChecked && Boolean(evidence.trim()) && note.trim().length >= 15;
  const hasProfile = manualProfile.trim() ? Boolean(parsedProfile.slug) : Boolean(athleteId);
  const save = useMutation({
    mutationFn: (remove: boolean) =>
      approveEditorialAthleteLink({
        data: {
          slug,
          name: row.name,
          athleteId: remove || manualProfile.trim() ? undefined : Number(athleteId),
          athleteSlug: remove ? undefined : parsedProfile.slug,
          sourceUrl: evidence.trim(),
          note: note.trim(),
          identityChecked,
          remove,
        },
      }),
    onSuccess: async () => {
      setOpen(false);
      setIdentityChecked(false);
      setNote("");
      setManualProfile("");
      await queryClient.invalidateQueries({ queryKey: ["editorial-athlete-review", slug] });
    },
  });
  return (
    <section
      aria-labelledby={`${cardId}-heading`}
      className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={`${cardId}-heading`} className="text-lg font-semibold">
          {row.name}
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${row.status === "linked" ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}
        >
          {EDITORIAL_ATHLETE_STATUS_LABELS[row.status]}
        </span>
      </div>
      {row.candidates.length ? (
        <ul className="space-y-2 text-sm">
          {row.candidates.map((candidate, index) => (
            <li
              key={`${candidate.athleteNumber}:${candidate.athleteId ?? "account"}:${index}`}
              className="rounded-lg bg-elevated p-3"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {candidate.athleteNumber ? (
                  <Link
                    to="/admin/athletes/$athleteId"
                    params={{ athleteId: formatAthleteId(candidate.athleteNumber) }}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center font-semibold text-accent underline"
                  >
                    {candidate.name} · {formatAthleteId(candidate.athleteNumber)}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                ) : (
                  <span className="font-semibold">
                    {candidate.name} · Identifier unavailable — directory review needed
                  </span>
                )}
                <span>
                  {candidate.public ? "Public profile" : "Private or account-controlled profile"}
                </span>
              </div>
              <p className="mt-1 text-muted">
                {[candidate.club, candidate.country].filter(Boolean).join(" · ") ||
                  "Check this profile’s sporting history."}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-muted">
          No matching name was returned from the live profile check. Research this athlete and check
          name variants before building a new profile.
        </p>
      )}
      {row.totalCandidates > row.candidates.length ? (
        <p className="text-sm text-muted">
          Showing {row.candidates.length} of {row.totalCandidates} possible profiles. Use the full
          directory to review the remaining matches.
        </p>
      ) : null}
      {row.linkedSlug ? (
        <a
          href={`https://www.athrecs.com/athletes/${encodeURIComponent(row.linkedSlug)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline"
        >
          Open linked athlete profile<span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : null}
      <button
        type="button"
        className={buttonClass}
        aria-expanded={open}
        aria-controls={`${cardId}-review`}
        disabled={save.isPending}
        onClick={() => {
          if (!open) {
            setAthleteId(
              String(
                row.candidates.find(
                  (candidate) => candidate.slug === row.linkedSlug && candidate.public,
                )?.athleteId ?? "",
              ),
            );
            setManualProfile("");
            setIdentityChecked(false);
            setNote("");
            save.reset();
          }
          setOpen(!open);
        }}
      >
        {open ? "Close link review" : "Review article link"}
      </button>
      {open ? (
        <form
          id={`${cardId}-review`}
          aria-label={`Review the article link for ${row.name}`}
          className="space-y-3 border-t border-border pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            const remove =
              (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "remove";
            if (save.isPending || !hasEvidence || (!remove && !hasProfile)) return;
            save.mutate(remove);
          }}
        >
          <label className="block text-sm font-semibold">
            Confirmed athlete profile
            <select
              className={inputClass}
              value={athleteId}
              disabled={save.isPending}
              onChange={(event) => {
                setAthleteId(event.target.value);
                setManualProfile("");
              }}
            >
              <option value="">Choose a checked public profile</option>
              {row.candidates
                .filter(
                  (candidate) => candidate.public && candidate.athleteId && candidate.athleteNumber,
                )
                .map((candidate) => (
                  <option key={candidate.athleteId} value={candidate.athleteId!}>
                    {candidate.name} · {formatAthleteId(candidate.athleteNumber)}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Different existing profile
            <input
              className={inputClass}
              type="text"
              maxLength={240}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="https://www.athrecs.com/athletes/profile-slug"
              value={manualProfile}
              disabled={save.isPending}
              aria-invalid={Boolean(parsedProfile.error)}
              aria-describedby={`${cardId}-profile-help${parsedProfile.error ? ` ${cardId}-profile-error` : ""}`}
              onChange={(event) => {
                setManualProfile(event.target.value);
                if (event.target.value.trim()) setAthleteId("");
              }}
            />
          </label>
          <p id={`${cardId}-profile-help`} className="text-sm leading-6 text-muted">
            After checking the wider directory, paste an existing AthRecs profile URL or slug here
            if the athlete uses a different name. This links an existing profile; it does not create
            a profile or change its visibility.
          </p>
          {parsedProfile.error ? (
            <p id={`${cardId}-profile-error`} role="alert" className="text-sm text-red-800">
              {parsedProfile.error}
            </p>
          ) : null}
          <label className="block text-sm font-semibold">
            Official identity or result source
            <input
              className={inputClass}
              type="url"
              pattern="https?://.+"
              maxLength={2000}
              required
              value={evidence}
              disabled={save.isPending}
              onChange={(event) => setEvidence(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Identity evidence or reason for removing the link
            <textarea
              className={inputClass}
              required
              minLength={15}
              maxLength={2000}
              rows={3}
              value={note}
              disabled={save.isPending}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Record the matching race, club, source identity or sporting history, or explain why the existing link is incorrect."
            />
          </label>
          <label className="flex min-h-11 items-start gap-2 text-sm leading-6">
            <input
              className="mt-1"
              type="checkbox"
              required
              checked={identityChecked}
              disabled={save.isPending}
              onChange={(event) => setIdentityChecked(event.target.checked)}
            />
            I checked the source and athlete identity, beyond a matching name.
          </label>
          {save.error ? (
            <p role="alert" className="text-sm text-red-800">
              {save.error instanceof Error ? save.error.message : "The link could not be saved."}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="action"
              value="save"
              className={buttonClass}
              disabled={!hasProfile || !hasEvidence || save.isPending}
            >
              {save.isPending && !save.variables ? "Saving…" : "Save reviewed profile link"}
            </button>
            {canRemove ? (
              <button
                type="submit"
                name="action"
                value="remove"
                className={buttonClass}
                disabled={!hasEvidence || save.isPending}
              >
                {save.isPending && save.variables ? "Removing…" : "Remove article link"}
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </section>
  );
}
