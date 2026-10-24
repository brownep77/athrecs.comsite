export const PARKRUN_TIMING_LABEL = "parkrun finish time · Not chip timed";
export const PARKRUN_TIMING_EXPLANATION =
  "parkrun finish times are recorded by volunteers from the event start signal to the finish, then matched to finish tokens and athlete barcodes. parkrun does not use chip timing.";

export type ParkrunContext = {
  sport?: string;
  surface?: string;
  eventName?: string;
  event?: string;
  distanceCode?: string;
};

/** Explicit parkrun identity, never an assumption based on a 5K distance or park venue. */
export function isParkrunResult(context: ParkrunContext): boolean {
  const labels = [context.eventName, context.event, context.distanceCode];
  // (not)parkrun was a self-timed activity, not the timed weekly event.
  if (labels.some((label) => /\(not\)\s*parkrun/i.test(label ?? ""))) return false;
  return [context.sport, context.surface, ...labels].some((label) =>
    /\bparkrun(?:cx)?\b/i.test(label ?? ""),
  );
}
