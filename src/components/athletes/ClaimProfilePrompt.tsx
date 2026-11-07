import { Link } from "@tanstack/react-router";
import { ArrowRight, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const copy = {
  race: {
    heading: "Did you race this?",
    text: "Claim your results, or create your free athlete profile.",
  },
  results: {
    heading: "Is your result here?",
    text: "Claim it for your profile, or create your free athlete profile.",
  },
  athlete: {
    heading: "Want a profile like this?",
    text: "Record all your sporting achievements in one place. Free forever.",
  },
} as const;

/** Claim and Create profile buttons shown on every race, result and athlete page. */
export function ClaimProfilePrompt({
  context,
  resultId,
  className,
}: {
  context: keyof typeof copy;
  resultId?: number;
  className?: string;
}) {
  const { heading, text } = copy[context];
  return (
    <section
      aria-label="Claim results or create a profile"
      data-claim-prompt={context}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-orange-200/80 bg-orange-50/60 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg">{heading}</p>
        <p className="text-sm text-muted">{text}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/claim-results"
          search={{ resultId }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#c2410c] px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-sm hover:bg-[#9a3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c] focus-visible:ring-offset-2"
        >
          Claim my results
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
        <Link
          to="/join"
          search={{ step: "profile" }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c2410c] bg-white px-4 py-2.5 text-sm font-semibold text-[#9a3412] no-underline hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c] focus-visible:ring-offset-2"
        >
          <UserPlus className="size-4 shrink-0" aria-hidden="true" />
          Create my profile
        </Link>
      </div>
    </section>
  );
}
