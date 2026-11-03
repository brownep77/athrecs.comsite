import type { ReactNode } from "react";

type Division = "men" | "women" | "other";
const titles = { men: "Men", women: "Women", other: "Other or unrecorded division" };
const order: Division[] = ["men", "women", "other"];

export function ArchiveResultPanels<T>({
  rows,
  division,
  children,
}: {
  rows: readonly T[];
  division: (row: T) => Division;
  children: (rows: T[], title: string) => ReactNode;
}) {
  const groups: Record<Division, T[]> = { men: [], women: [], other: [] };
  for (const row of rows) groups[division(row)].push(row);
  const paired = groups.men.length > 0 && groups.women.length > 0;
  return (
    <div className={`grid items-start gap-4 ${paired ? "md:grid-cols-2" : ""}`}>
      {order
        .filter((key) => groups[key].length)
        .map((key) => (
          <details
            key={key}
            open
            className={`min-w-0 overflow-hidden rounded-md border border-border bg-surface ${key === "other" && paired ? "md:col-span-2" : ""}`}
          >
            <summary className="cursor-pointer bg-accent-soft/45 px-3 py-3 text-lg font-bold leading-tight text-[#075d67] focus-visible:outline-2 focus-visible:-outline-offset-2">
              {titles[key]}
            </summary>
            {children(groups[key], titles[key])}
          </details>
        ))}
    </div>
  );
}
