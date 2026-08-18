import { CalendarClock, ExternalLink, ShieldCheck, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import type { EditionEntryOption, EntryOptionStatus, EntryOptionType } from "@/lib/athrecs/types";

const STATUS_LABELS: Record<EntryOptionStatus, string> = {
  open: "Entries open",
  closing_soon: "Closing soon",
  ballot: "Ballot",
  waitlist: "Waiting list",
  sold_out: "Sold out",
  closed: "Closed",
  unknown: "Check availability",
};

const TYPE_LABELS: Record<EntryOptionType, string> = {
  official: "Official entry",
  third_party: "Third-party booking",
  charity: "Charity place",
  tour_operator: "Tour operator",
};

function formatPrice(option: EditionEntryOption): string | null {
  if (option.price_amount == null) return null;
  const amount = Number(option.price_amount);
  if (!Number.isFinite(amount)) return null;
  if (!option.price_currency) return String(amount);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: option.price_currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${option.price_currency}`;
  }
}

function checkedLabel(option: EditionEntryOption): string {
  const date = option.checked_at?.slice(0, 10);
  if (!date) return option.is_verified ? "Verified link" : "Source recorded";
  return `${option.is_verified ? "Verified" : "Recorded"} ${formatRaceDateShort(date)}`;
}

function availabilityDetail(option: EditionEntryOption): string | null {
  if (option.closes_at && ["open", "closing_soon", "ballot", "waitlist"].includes(option.status)) {
    return `Closes ${formatRaceDateShort(option.closes_at)}`;
  }
  if (option.opens_at && ["closed", "unknown"].includes(option.status)) {
    return `Opens ${formatRaceDateShort(option.opens_at)}`;
  }
  return null;
}

export function EntryOptions({
  options,
  editionDate,
  officialWebsite,
}: {
  options: EditionEntryOption[];
  editionDate?: string;
  officialWebsite?: string;
}) {
  return (
    <section
      aria-labelledby="entry-options-heading"
      className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-accent" />
            <h2 id="entry-options-heading" className="font-display text-xl font-semibold text-fg">
              Ways to enter
            </h2>
          </div>
          <p className="text-sm text-muted">
            Official entry is shown first, followed by other verified booking routes when available.
          </p>
        </div>
        {editionDate ? (
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-subtle">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatRaceDateShort(editionDate)}
          </p>
        ) : null}
      </div>

      {options.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {options.map((option) => {
            const price = formatPrice(option);
            const availability = availabilityDetail(option);
            const unavailable = option.status === "closed" || option.status === "sold_out";
            return (
              <article
                key={`${option.provider_code}-${option.id}`}
                className={`space-y-3 rounded-xl border p-4 ${
                  option.is_primary
                    ? "border-accent/40 bg-accent-soft"
                    : "border-border bg-elevated"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-fg">{option.provider_name}</h3>
                    <p className="mt-0.5 text-xs text-muted">{TYPE_LABELS[option.entry_type]}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Badge variant={unavailable ? "default" : "solid"}>
                      {STATUS_LABELS[option.status]}
                    </Badge>
                    {option.is_verified ? (
                      <Badge variant="outline">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle">
                  {price ? <span>From {price}</span> : null}
                  {availability ? <span>{availability}</span> : null}
                  <span>{checkedLabel(option)}</span>
                </div>

                {option.notes ? <p className="text-xs leading-relaxed text-muted">{option.notes}</p> : null}

                <Button asChild variant={option.is_primary ? "default" : "secondary"}>
                  <a href={option.entry_url} target="_blank" rel="noreferrer sponsored">
                    {unavailable
                      ? "Check provider"
                      : option.entry_type === "official"
                        ? "Enter officially"
                        : `View ${option.provider_name}`}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-elevated px-4 py-5">
          <p className="text-sm font-medium text-fg">No confirmed entry route is listed yet.</p>
          <p className="mt-1 text-xs text-muted">
            Check the organiser’s page for the latest ballot, waiting-list or entry information.
          </p>
          {officialWebsite ? (
            <Button asChild variant="secondary" className="mt-3">
              <a href={officialWebsite} target="_blank" rel="noreferrer">
                Official race page
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
        </div>
      )}

      <p className="text-xs leading-relaxed text-subtle">
        Third-party prices, booking fees, allocations and refund terms can differ. Confirm the final
        details with the provider before paying.
      </p>
    </section>
  );
}
