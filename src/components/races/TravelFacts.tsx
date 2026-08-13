import type { ReactNode } from "react";
import { Bus, Clock3, MapPin, CircleParking, TrainFront } from "lucide-react";
import type { VenueDetails } from "@/data/venue-details";

function Row({
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
    <div className="flex gap-2 text-xs leading-snug">
      <span className="mt-0.5 shrink-0 text-subtle">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {label}
        </p>
        <p className="text-fg">{value}</p>
      </div>
    </div>
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
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      <Row
        icon={<Clock3 className="h-3.5 w-3.5" />}
        label="Local start"
        value={startTime ? `${startTime} start` : "Confirm on event page"}
      />
      <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={venue.address} />
      <Row
        icon={<TrainFront className="h-3.5 w-3.5" />}
        label="Nearest train"
        value={venue.trainStation}
      />
      <Row icon={<Bus className="h-3.5 w-3.5" />} label="Nearest bus" value={venue.busStop} />
      <Row
        icon={<CircleParking className="h-3.5 w-3.5" />}
        label="Parking"
        value={venue.parking}
      />
    </div>
  );
}
