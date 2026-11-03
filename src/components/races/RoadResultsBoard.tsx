import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { countryFlag } from "@/lib/athrecs/country-flags";
import type { RoadStanding } from "@/lib/athrecs/editorial";

export type BoardRow = RoadStanding & {
  key?: string | number;
  anchor?: string;
  profile?: string | null;
  placeLabel?: string;
  details?: ReactNode;
};

export function RoadResultsBoard({
  rows,
  timing,
  caption,
  anchors,
}: {
  rows: BoardRow[];
  timing: string;
  caption: string;
  anchors?: Record<string, string>;
}) {
  const groups = new Map<string, BoardRow[]>();
  for (const row of rows) {
    const group = groups.get(row.division);
    if (group) group.push(row);
    else groups.set(row.division, [row]);
  }
  const order = [
    "Men",
    "Women",
    ...[...groups.keys()].filter((key) => key !== "Men" && key !== "Women"),
  ];
  const paired = groups.has("Men") && groups.has("Women");
  return (
    <div className={`grid items-start gap-4 ${paired ? "md:grid-cols-2" : ""}`}>
      {order.map((division) => {
        const entries = groups.get(division);
        if (!entries) return null;
        const showCountry = entries.some((row) => row.country);
        return (
          <details
            open
            key={division}
            id={anchors?.[division]}
            className={`min-w-0 scroll-mt-24 overflow-hidden rounded border border-border bg-surface ${paired && division !== "Men" && division !== "Women" ? "md:col-span-2" : ""}`}
          >
            <summary className="cursor-pointer bg-accent-soft/50 px-3 py-3 text-lg font-bold text-fg marker:text-accent focus-visible:outline-2 focus-visible:-outline-offset-2">
              {division}
            </summary>
            <table className="w-full table-fixed border-collapse text-left text-sm leading-tight">
              <caption className="sr-only">
                {caption} · {division}
              </caption>
              <thead className="border-y border-border bg-elevated/50 text-xs text-muted">
                <tr>
                  <th scope="col" className="w-[13%] px-1.5 py-2">
                    Pos
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Athlete
                  </th>
                  {showCountry && (
                    <th scope="col" className="w-[22%] px-1 py-2">
                      Country
                    </th>
                  )}
                  <th scope="col" className="w-[21%] px-1.5 py-2 text-right">
                    {timing}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row, i) => (
                  <tr
                    key={row.key ?? i}
                    id={row.anchor}
                    className="scroll-mt-24 border-b border-border/70 align-top last:border-b-0"
                  >
                    <td className="px-1.5 py-2.5 font-semibold tabular-nums">
                      {row.place ?? "—"}
                      {row.placeLabel && (
                        <small className="block break-words font-normal text-muted">
                          {row.placeLabel}
                        </small>
                      )}
                    </td>
                    <th scope="row" className="px-2 py-2.5 font-normal [overflow-wrap:anywhere]">
                      {row.profile ? (
                        <Link
                          to="/athletes/$slug"
                          params={{ slug: row.profile }}
                          className="font-semibold text-fg underline-offset-2 hover:underline"
                        >
                          {row.name}
                        </Link>
                      ) : (
                        <strong className="font-semibold">{row.name}</strong>
                      )}
                      {row.club && (
                        <span className="mt-1 block text-xs text-muted">
                          {row.clubLabel ?? "Club"} · {row.club}
                        </span>
                      )}
                      {row.shoes && (
                        <span className="mt-1 block text-xs text-muted">
                          Raced in · {row.shoes}
                        </span>
                      )}
                      {row.details}
                    </th>
                    {showCountry && (
                      <td className="px-1 py-2.5">
                        {row.country ? (
                          <>
                            <span className="font-mono text-xs font-semibold">
                              <CountryFlag country={row.country} showCode />
                            </span>
                            <span className="mt-1 block text-[11px] text-muted [overflow-wrap:anywhere]">
                              {countryFlag(row.country).name}
                            </span>
                          </>
                        ) : (
                          <span aria-label="Country not recorded">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-1.5 py-2.5 text-right font-mono text-xs font-semibold tabular-nums [overflow-wrap:anywhere] sm:text-sm">
                      {row.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        );
      })}
    </div>
  );
}
