import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, UserRound } from "lucide-react";
import { ACCOUNT_SECTION_GROUPS, type AccountSectionId } from "@/lib/athrecs/account-sections";
import { cn } from "@/lib/utils";
import { AthleteId } from "./AthleteId";

export function AccountNavigation({
  active,
  name,
  athleteNumber,
}: {
  active: AccountSectionId;
  name: string;
  athleteNumber: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const activeLabel = ACCOUNT_SECTION_GROUPS.flatMap((group) => [...group.items]).find(
    (item) => item.id === active,
  )?.label;
  return (
    <aside className="self-start rounded-xl border border-border bg-surface shadow-card lg:sticky lg:top-24">
      <div className="hidden border-b border-border p-4 lg:block">
        <UserRound className="mb-2 size-6 text-accent" aria-hidden="true" />
        <p className="break-words font-semibold text-fg">{name}</p>
        <AthleteId number={athleteNumber} className="mt-1 text-muted" />
      </div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="athlete-account-navigation"
        onClick={() => setExpanded(!expanded)}
        className="flex min-h-12 w-full items-center justify-between gap-3 p-4 text-left font-semibold text-fg lg:hidden"
      >
        <span>
          <span className="block text-xs font-normal text-muted">Profile sections</span>
          {activeLabel}
        </span>
        <ChevronDown
          className={cn("size-5 shrink-0 transition-transform", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <nav
        id="athlete-account-navigation"
        aria-label="Athlete profile sections"
        className={cn(
          "space-y-4 p-3 lg:block lg:max-h-[calc(100dvh-13rem)] lg:overflow-y-auto",
          !expanded && "hidden",
        )}
      >
        {ACCOUNT_SECTION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-subtle">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/athlete-account"
                    search={{ section: item.id }}
                    hash=""
                    resetScroll={false}
                    aria-current={active === item.id ? "page" : undefined}
                    onClick={() => setExpanded(false)}
                    className={cn(
                      "block rounded-lg border-l-2 px-3 py-2.5 text-sm no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
                      active === item.id
                        ? "border-accent bg-accent-soft font-semibold text-fg"
                        : "border-transparent text-muted hover:bg-elevated hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
