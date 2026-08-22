import { ExternalLink, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statusLabel } from "@/lib/athrecs/format";
import type { EntryStatus } from "@/lib/athrecs/types";

function actionLabel(status: EntryStatus | null, directEntry: boolean): string {
  if (!directEntry) return status === "Open" ? "Official event page" : "Check availability";
  if (status === "Open") return "Enter event";
  if (status === "ClosingSoon") return "Enter before closing";
  if (status === "Closed" || status === "Finished") return "Entry details";
  return "Check entry";
}

export function ListingEntry({
  status,
  entryUrl,
  officialWebsite,
}: {
  status: EntryStatus | null;
  entryUrl?: string | null;
  officialWebsite?: string | null;
}) {
  const href = entryUrl || officialWebsite || null;
  const open = status === "Open" || status === "ClosingSoon";
  const label = status ? statusLabel(status) : "Entry status TBC";

  return (
    <div
      className={`mt-3 flex flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between ${
        open ? "border-accent/30 bg-accent-soft" : "border-border bg-elevated"
      }`}
    >
      <div className="flex min-w-0 items-start gap-2">
        <Ticket className={`mt-0.5 h-4 w-4 shrink-0 ${open ? "text-accent" : "text-subtle"}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">{label}</p>
          <p className="text-xs text-muted">
            {entryUrl
              ? "Entry link available"
              : officialWebsite
                ? "Confirm availability with the organiser"
                : "No confirmed entry link listed yet"}
          </p>
        </div>
      </div>
      {href ? (
        <Button asChild size="sm" variant={open ? "default" : "secondary"} className="shrink-0">
          <a href={href} target="_blank" rel="noreferrer sponsored">
            {actionLabel(status, Boolean(entryUrl))}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      ) : null}
    </div>
  );
}
