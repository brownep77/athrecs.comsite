import type { ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Bus, CircleParking, Clock3, Info, MapPin } from "lucide-react";
import type { VenueDetails } from "@/data/venue-details";

function FactButton({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-subtle transition-colors hover:border-border-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label={`${label} information`}
          title={label}
        >
          {icon}
          <Info
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 h-2.5 w-2.5 text-accent"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-2.5 text-left shadow-card focus:outline-none"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
            {label}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-fg">{value}</p>
          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function TravelFacts({
  venue,
  startTime,
}: {
  venue: VenueDetails;
  startTime?: string | null;
}) {
  return (
    <div
      className="flex min-w-0 flex-nowrap items-center gap-1.5"
      aria-label="Event location and travel information"
    >
      <FactButton
        icon={<Clock3 className="h-3.5 w-3.5" />}
        label="Local start"
        value={startTime ? `${startTime} start` : "Confirm on event page"}
      />
      <FactButton
        icon={<MapPin className="h-3.5 w-3.5" />}
        label="Address"
        value={venue.address}
      />
      <FactButton
        icon={<Bus className="h-3.5 w-3.5" />}
        label="Nearest bus"
        value={venue.busStop}
      />
      <FactButton
        icon={<CircleParking className="h-3.5 w-3.5" />}
        label="Parking"
        value={venue.parking}
      />
    </div>
  );
}
