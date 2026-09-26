import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { nextRaceDateChange, raceLocalDate } from "@/lib/running/road-marathon-calendar";

export function useRaceDateRefresh(timeZones: string[], renderedAt: string) {
  const router = useRouter();
  const zonesKey = [...new Set(timeZones)].sort().join("|");
  useEffect(() => {
    const zones = zonesKey.split("|").filter(Boolean);
    if (!zones.length) return;
    const refresh = () => {
      if (zones.some((zone) => raceLocalDate(zone) !== raceLocalDate(zone, renderedAt)))
        void router.invalidate();
    };
    const timer = window.setTimeout(
      refresh,
      Math.max(1, nextRaceDateChange(zones) - Date.now() + 100),
    );
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    refresh();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [zonesKey, renderedAt, router]);
}
