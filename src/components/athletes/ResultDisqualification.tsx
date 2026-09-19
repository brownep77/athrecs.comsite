import { CircleAlert } from "lucide-react";
import { disqualificationLabel, type Disqualification } from "@/lib/athrecs/result-details";

export function ResultDisqualification({ decision }: { decision?: Disqualification }) {
  if (!decision) return null;
  return (
    <details className="mt-1 max-w-sm whitespace-normal text-xs font-normal text-amber-800">
      <summary className="cursor-pointer">
        <span aria-hidden="true">* </span>
        <CircleAlert aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />
        {disqualificationLabel(decision.reason)}
      </summary>
      <p className="mt-1">{decision.note}</p>
      <p className="mt-1">
        Original performance retained for history. Excluded from PBs, achievements and valid result
        totals.
      </p>
      <a href={decision.sourceUrl} target="_blank" rel="noreferrer" className="underline">
        Official decision · {decision.decisionDate} ↗
      </a>
    </details>
  );
}
