import { useState } from "react";
import { Copy } from "lucide-react";
import { formatAthleteId } from "@/lib/athrecs/athlete-id";
import { cn } from "@/lib/utils";

export function AthleteId({ number, className }: { number: string; className?: string }) {
  const id = formatAthleteId(number);
  const [status, setStatus] = useState("");
  async function copyId() {
    setStatus("");
    try {
      await navigator.clipboard.writeText(id);
      setStatus("Copied");
    } catch {
      setStatus("Select the ID to copy it.");
    }
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm text-muted", className)}>
      <span>Athlete ID</span>
      <span className="select-all font-mono font-semibold">{id}</span>
      <button
        type="button"
        onClick={copyId}
        aria-label={`Copy athlete ID ${id}`}
        className="inline-flex size-11 items-center justify-center rounded-lg border border-current/25 hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <Copy className="size-4" aria-hidden="true" />
      </button>
      <span role="status" className="text-xs">
        {status}
      </span>
    </div>
  );
}
