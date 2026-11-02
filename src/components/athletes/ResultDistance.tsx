import { distanceColourClass } from "@/lib/athrecs/profile-colours";
import { normalizeDistanceCode } from "@/lib/athrecs/distance";

export function ResultDistance({ distance }: { distance: string }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${distanceColourClass(distance)}`}
    >
      {normalizeDistanceCode(distance) || "Not recorded"}
    </span>
  );
}
