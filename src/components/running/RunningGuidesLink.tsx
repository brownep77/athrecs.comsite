import { ArrowLeft } from "lucide-react";
import { RUNNING_GUIDES_PATH } from "@/lib/running/guide-directory";

export function RunningGuidesLink() {
  return (
    <a
      href={RUNNING_GUIDES_PATH}
      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All running guides: countries and race series
    </a>
  );
}
