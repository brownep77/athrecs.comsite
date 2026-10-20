import { Badge } from "@/components/ui/badge";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import { distanceColourClass } from "@/lib/athrecs/profile-colours";
import { sportColourClass, sportDisplayLabel } from "@/lib/athrecs/event-colours";

export function SportBadge({ sport }: { sport: string }) {
  return <Badge className={sportColourClass(sport)}>{sportDisplayLabel(sport)}</Badge>;
}

export function DistanceBadge({ distance, label }: { distance: string; label?: string }) {
  return (
    <Badge className={distanceColourClass(distance)}>
      {label ?? formatDistanceWithUnits(distance)}
    </Badge>
  );
}
